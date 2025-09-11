// 실시간 시세 업데이트 프로세스
const mysql = require('mysql2/promise');
require('dotenv').config();

class PriceUpdater {
  constructor() {
    this.connection = null;
    this.isRunning = false;
    this.intervalId = null;
    this.updateInterval = 1000; // 1초
    this.priceVariation = 0.05; // ±5% (0.95 ~ 1.05 범위)
    
    // 메모리 관리 설정
    this.memoryThreshold = 1536 * 1024 * 1024; // 1.5GB 임계값
    this.memoryCheckInterval = 30000; // 30초마다 체크
    this.batchSize = 500; // 배치 크기
    this.memoryMonitorId = null;
    this.lastGcTime = 0;
    this.gcCooldown = 10000; // GC 실행 간격 (10초)
    
    // 업데이트 제외 종목 리스트 (수동 관리용)
    this.excludedStocks = new Set(); // 종목코드로 관리
    
    console.log('📊 시세 업데이트 프로세스 초기화 (자동 메모리 관리 포함)');
  }

  // 데이터베이스 연결
  async connect() {
    try {
      this.connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'rebalance',
        password: process.env.DB_PASSWORD || 'Kakaopay2025!',
        database: process.env.DB_NAME || 'kpsdb',
        charset: 'utf8mb4'
      });
      
      console.log('✅ 시세 업데이터 - 데이터베이스 연결 성공');
      return true;
    } catch (error) {
      console.error('❌ 시세 업데이터 - 데이터베이스 연결 실패:', error.message);
      return false;
    }
  }

  // 메모리 사용량 확인
  getMemoryUsage() {
    const used = process.memoryUsage();
    return {
      rss: used.rss,
      heapTotal: used.heapTotal,
      heapUsed: used.heapUsed,
      external: used.external,
      rssMB: Math.round(used.rss / 1024 / 1024),
      heapTotalMB: Math.round(used.heapTotal / 1024 / 1024),
      heapUsedMB: Math.round(used.heapUsed / 1024 / 1024)
    };
  }

  // 가비지 컬렉션 강제 실행
  forceGarbageCollection() {
    const now = Date.now();
    if (now - this.lastGcTime > this.gcCooldown) {
      if (global.gc) {
        global.gc();
        this.lastGcTime = now;
        console.log('🗑️ 가비지 컬렉션 실행됨');
        return true;
      } else {
        console.warn('⚠️ 가비지 컬렉션 사용 불가 (--expose-gc 플래그 필요)');
      }
    }
    return false;
  }

  // 메모리 모니터링 시작
  startMemoryMonitoring() {
    this.memoryMonitorId = setInterval(() => {
      const memory = this.getMemoryUsage();
      
      // 메모리 사용량 로깅 (5분마다)
      if (Date.now() % 300000 < this.memoryCheckInterval) {
        console.log(`💾 메모리 사용량: Heap ${memory.heapUsedMB}MB / RSS ${memory.rssMB}MB`);
      }
      
      // 임계값 초과 시 대응
      if (memory.heapUsed > this.memoryThreshold) {
        console.warn(`⚠️ 메모리 임계값 초과: ${memory.heapUsedMB}MB > ${Math.round(this.memoryThreshold / 1024 / 1024)}MB`);
        
        // 1. 가비지 컬렉션 실행
        this.forceGarbageCollection();
        
        // 2. 업데이트 간격 조정 (임시)
        if (this.updateInterval < 3000) {
          console.log('🐌 메모리 절약을 위해 업데이트 간격을 늘립니다');
          this.updateInterval = Math.min(this.updateInterval * 2, 5000);
          this.restart();
        }
      } else if (memory.heapUsed < this.memoryThreshold * 0.7 && this.updateInterval > 1000) {
        // 메모리가 안정되면 원래 간격으로 복구
        console.log('🚀 메모리 안정화, 업데이트 간격을 줄입니다');
        this.updateInterval = Math.max(this.updateInterval / 2, 1000);
        this.restart();
      }
    }, this.memoryCheckInterval);
  }

  // 메모리 모니터링 중지
  stopMemoryMonitoring() {
    if (this.memoryMonitorId) {
      clearInterval(this.memoryMonitorId);
      this.memoryMonitorId = null;
      console.log('🛑 메모리 모니터링 중지');
    }
  }

  // 모든 종목의 현재가 조회
  async getAllStockPrices() {
    try {
      const [rows] = await this.connection.execute(
        'SELECT stock_code, current_price FROM stock_current_price ORDER BY stock_code'
      );
      return rows;
    } catch (error) {
      console.error('❌ 종목 시세 조회 실패:', error.message);
      return [];
    }
  }

  // 가격 변동 계산 (0.95 ~ 1.05 배수)
  calculateNewPrice(currentPrice) {
    // 0.95 ~ 1.05 사이의 랜덤 배수 생성
    const multiplier = 0.95 + (Math.random() * 0.1); // 0.95 ~ 1.05
    const newPrice = Math.round(currentPrice * multiplier);
    
    // 최소 가격 보장 (1원 이상)
    return Math.max(1, newPrice);
  }

  // 단일 종목 가격 업데이트
  async updateStockPrice(stockCode, newPrice) {
    try {
      await this.connection.execute(
        'UPDATE stock_current_price SET current_price = ? WHERE stock_code = ?',
        [newPrice, stockCode]
      );
      return true;
    } catch (error) {
      console.error(`❌ 종목 ${stockCode} 가격 업데이트 실패:`, error.message);
      return false;
    }
  }

  // 모든 종목 가격 업데이트 (메모리 최적화 버전)
  async updateAllPrices() {
    try {
      const stocks = await this.getAllStockPrices();
      
      if (stocks.length === 0) {
        console.log('⚠️ 업데이트할 종목이 없습니다');
        return;
      }

      let successCount = 0;
      let totalCount = stocks.length;
      
      // 배치 단위로 처리하여 메모리 사용량 제한
      for (let i = 0; i < stocks.length; i += this.batchSize) {
        const batch = stocks.slice(i, i + this.batchSize);
        const updatePromises = [];

        for (const stock of batch) {
          // 제외 목록에 있는 종목은 스킵
          if (this.excludedStocks.has(stock.stock_code)) {
            successCount++; // 제외된 종목도 성공으로 카운트
            continue;
          }
          
          const newPrice = this.calculateNewPrice(stock.current_price);
          const promise = this.updateStockPrice(stock.stock_code, newPrice)
            .then(success => {
              if (success) {
                successCount++;
                // 변동률 계산 (5% 이상 변동시만 로그)
                const changeRate = ((newPrice - stock.current_price) / stock.current_price * 100);
                if (Math.abs(changeRate) > 5) {
                  console.log(`📈 ${stock.stock_code}: ${stock.current_price.toLocaleString()} → ${newPrice.toLocaleString()} (${changeRate > 0 ? '+' : ''}${changeRate.toFixed(2)}%)`);
                }
              }
              return success;
            })
            .catch(error => {
              console.error(`❌ ${stock.stock_code} 업데이트 실패:`, error.message);
              return false;
            });
          updatePromises.push(promise);
        }

        // 배치 실행
        await Promise.all(updatePromises);
        
        // 배치 완료 후 메모리 정리
        updatePromises.length = 0; // 배열 정리
        
        // 메모리 사용량이 높으면 가비지 컬렉션 실행
        const memory = this.getMemoryUsage();
        if (memory.heapUsed > this.memoryThreshold * 0.8) {
          this.forceGarbageCollection();
        }
        
        // 배치 간 짧은 대기 (메모리 압박 시)
        if (memory.heapUsed > this.memoryThreshold * 0.9) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      // 주기적으로 업데이트 통계 출력 (10초마다)
      const now = Date.now();
      if (!this.lastLogTime || now - this.lastLogTime > 10000) {
        const memory = this.getMemoryUsage();
        console.log(`🔄 시세 업데이트 완료: ${successCount}/${totalCount} (${new Date().toLocaleTimeString()}) [Heap: ${memory.heapUsedMB}MB]`);
        this.lastLogTime = now;
      }

    } catch (error) {
      console.error('❌ 시세 업데이트 중 오류:', error.message);
    }
  }

  // 시세 업데이트 시작
  async start() {
    if (this.isRunning) {
      console.log('⚠️ 시세 업데이트가 이미 실행 중입니다');
      return false;
    }

    const connected = await this.connect();
    if (!connected) {
      console.error('❌ 데이터베이스 연결 실패로 시세 업데이트를 시작할 수 없습니다');
      return false;
    }

    this.isRunning = true;
    console.log(`🚀 시세 업데이트 시작 (${this.updateInterval}ms 간격, 0.95~1.05배 변동)`);
    console.log(`💾 메모리 임계값: ${Math.round(this.memoryThreshold / 1024 / 1024)}MB, 배치 크기: ${this.batchSize}`);

    // 메모리 모니터링 시작
    this.startMemoryMonitoring();

    // 즉시 첫 업데이트 실행
    await this.updateAllPrices();

    // 주기적 업데이트 시작
    this.intervalId = setInterval(async () => {
      if (this.isRunning) {
        await this.updateAllPrices();
      }
    }, this.updateInterval);

    return true;
  }

  // 시세 업데이트 중지
  async stop() {
    if (!this.isRunning) {
      console.log('⚠️ 시세 업데이트가 실행되지 않고 있습니다');
      return;
    }

    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // 메모리 모니터링 중지
    this.stopMemoryMonitoring();

    if (this.connection) {
      await this.connection.end();
      this.connection = null;
    }

    console.log('🛑 시세 업데이트 중지');
  }

  // 현재 상태 조회
  getStatus() {
    const memory = this.getMemoryUsage();
    return {
      isRunning: this.isRunning,
      interval: this.updateInterval,
      variation: this.priceVariation,
      connected: !!this.connection,
      memory: {
        heapUsedMB: memory.heapUsedMB,
        heapTotalMB: memory.heapTotalMB,
        rssMB: memory.rssMB,
        thresholdMB: Math.round(this.memoryThreshold / 1024 / 1024),
        usagePercent: Math.round((memory.heapUsed / this.memoryThreshold) * 100)
      },
      batchSize: this.batchSize
    };
  }

  // 설정 변경
  updateConfig(config = {}) {
    if (config.interval && config.interval >= 100) { // 최소 100ms
      this.updateInterval = config.interval;
      console.log(`⚙️ 업데이트 간격 변경: ${this.updateInterval}ms`);
    }
    
    if (config.variation && config.variation > 0 && config.variation <= 0.5) { // 0% ~ 50%
      this.priceVariation = config.variation;
      console.log(`⚙️ 가격 변동폭 변경: ${(1 - this.priceVariation).toFixed(2)}~${(1 + this.priceVariation).toFixed(2)}배`);
    }

    // 실행 중이면 재시작
    if (this.isRunning) {
      this.restart();
    }
  }

  // 재시작
  async restart() {
    console.log('🔄 시세 업데이트 재시작');
    await this.stop();
    setTimeout(() => this.start(), 1000);
  }

  // 종목을 업데이트 제외 목록에 추가
  excludeStock(stockCode) {
    this.excludedStocks.add(stockCode);
    console.log(`🚫 종목 ${stockCode}을 시세 업데이트에서 제외했습니다`);
    return true;
  }

  // 종목을 업데이트 제외 목록에서 제거
  includeStock(stockCode) {
    const removed = this.excludedStocks.delete(stockCode);
    if (removed) {
      console.log(`✅ 종목 ${stockCode}을 시세 업데이트에 다시 포함했습니다`);
    }
    return removed;
  }

  // 제외된 종목 목록 조회
  getExcludedStocks() {
    return Array.from(this.excludedStocks);
  }
}

module.exports = PriceUpdater;