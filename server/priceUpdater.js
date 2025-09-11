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
    
    console.log('📊 시세 업데이트 프로세스 초기화');
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

  // 모든 종목 가격 업데이트
  async updateAllPrices() {
    try {
      const stocks = await this.getAllStockPrices();
      
      if (stocks.length === 0) {
        console.log('⚠️ 업데이트할 종목이 없습니다');
        return;
      }

      let successCount = 0;
      let totalCount = stocks.length;
      const updatePromises = [];

      // 배치로 모든 종목 업데이트
      for (const stock of stocks) {
        const newPrice = this.calculateNewPrice(stock.current_price);
        const promise = this.updateStockPrice(stock.stock_code, newPrice)
          .then(success => {
            if (success) {
              successCount++;
              // 변동률 계산
              const changeRate = ((newPrice - stock.current_price) / stock.current_price * 100);
              if (Math.abs(changeRate) > 5) { // 5% 이상 변동시만 로그
                console.log(`📈 ${stock.stock_code}: ${stock.current_price.toLocaleString()} → ${newPrice.toLocaleString()} (${changeRate > 0 ? '+' : ''}${changeRate.toFixed(2)}%)`);
              }
            }
          });
        updatePromises.push(promise);
      }

      await Promise.all(updatePromises);
      
      // 주기적으로 업데이트 통계 출력 (10초마다)
      const now = Date.now();
      if (!this.lastLogTime || now - this.lastLogTime > 10000) {
        console.log(`🔄 시세 업데이트 완료: ${successCount}/${totalCount} (${new Date().toLocaleTimeString()})`);
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

    if (this.connection) {
      await this.connection.end();
      this.connection = null;
    }

    console.log('🛑 시세 업데이트 중지');
  }

  // 현재 상태 조회
  getStatus() {
    return {
      isRunning: this.isRunning,
      interval: this.updateInterval,
      variation: this.priceVariation,
      connected: !!this.connection
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
}

module.exports = PriceUpdater;