// 포트폴리오 관리 시스템 백엔드 서버
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const {
  testConnection,
  getHoldingStocks,
  getCustomerDeposit,
  getRebalancingStatus,
  updateRebalancingStatus,
  getMasterStrategies,
  saveCustomerStrategy,
  getCustomerStrategy,
  getCurrentPrices,
  getStrategyLearningList,
  pool
} = require('./database');

// 시세 업데이트 프로세스
const PriceUpdater = require('./priceUpdater');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// 시세 업데이트 인스턴스 생성
const priceUpdater = new PriceUpdater();

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 요청 로깅 미들웨어
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 헬스체크 엔드포인트
app.get('/health', async (req, res) => {
  const dbConnected = await testConnection();
  const priceUpdaterStatus = priceUpdater.getStatus();
  
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'Connected' : 'Disconnected',
    priceUpdater: {
      running: priceUpdaterStatus.isRunning,
      interval: `${priceUpdaterStatus.interval}ms`,
      variation: `${(1 - priceUpdaterStatus.variation).toFixed(2)}~${(1 + priceUpdaterStatus.variation).toFixed(2)}x`,
      connected: priceUpdaterStatus.connected
    },
    environment: process.env.NODE_ENV || 'development'
  });
});

// 잔고 관련 API 라우트
const balanceRouter = express.Router();

// 보유종목 조회
balanceRouter.get('/holdings', async (req, res) => {
  try {
    const result = await getHoldingStocks();
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({
        error: result.error,
        details: result.details
      });
    }
  } catch (error) {
    console.error('보유종목 API 오류:', error);
    res.status(500).json({
      error: '서버 내부 오류가 발생했습니다.',
      details: error.message
    });
  }
});

// 예수금 조회
balanceRouter.get('/deposit', async (req, res) => {
  try {
    const result = await getCustomerDeposit();
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({
        error: result.error,
        details: result.details
      });
    }
  } catch (error) {
    console.error('예수금 API 오류:', error);
    res.status(500).json({
      error: '서버 내부 오류가 발생했습니다.',
      details: error.message
    });
  }
});

// 포트폴리오 구성 조회 (보유종목 기반)
balanceRouter.get('/composition', async (req, res) => {
  try {
    const holdingsResult = await getHoldingStocks();
    
    if (!holdingsResult.success) {
      return res.status(500).json({
        error: holdingsResult.error,
        details: holdingsResult.details
      });
    }

    const compositionData = holdingsResult.data.map(stock => ({
      stockName: stock.stockName,
      weight: stock.weight,
      value: stock.marketValue
    }));

    res.json(compositionData);
  } catch (error) {
    console.error('포트폴리오 구성 API 오류:', error);
    res.status(500).json({
      error: '서버 내부 오류가 발생했습니다.',
      details: error.message
    });
  }
});

// 총자산 조회
balanceRouter.get('/total-assets', async (req, res) => {
  try {
    const [holdingsResult, depositResult] = await Promise.all([
      getHoldingStocks(),
      getCustomerDeposit()
    ]);

    if (!holdingsResult.success) {
      return res.status(500).json({
        error: holdingsResult.error,
        details: holdingsResult.details
      });
    }

    if (!depositResult.success) {
      return res.status(500).json({
        error: depositResult.error,
        details: depositResult.details
      });
    }

    // 계산
    const totalStockValue = holdingsResult.data.reduce((sum, stock) => sum + stock.marketValue, 0);
    const totalPurchaseAmount = holdingsResult.data.reduce((sum, stock) => sum + stock.purchaseAmount, 0);
    const totalProfitLoss = totalStockValue - totalPurchaseAmount;
    const totalProfitLossRate = totalPurchaseAmount > 0 ? (totalProfitLoss / totalPurchaseAmount) * 100 : 0;

    res.json({
      totalStockValue,
      depositAmount: depositResult.data.depositAmount,
      totalAssets: totalStockValue + depositResult.data.depositAmount,
      totalProfitLoss,
      totalProfitLossRate
    });
  } catch (error) {
    console.error('총자산 API 오류:', error);
    res.status(500).json({
      error: '서버 내부 오류가 발생했습니다.',
      details: error.message
    });
  }
});

// 리밸런싱 상태 조회
balanceRouter.get('/rebalancing', async (req, res) => {
  try {
    const result = await getRebalancingStatus();
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({
        error: result.error,
        details: result.details
      });
    }
  } catch (error) {
    console.error('리밸런싱 상태 API 오류:', error);
    res.status(500).json({
      error: '서버 내부 오류가 발생했습니다.',
      details: error.message
    });
  }
});

// 리밸런싱 상태 업데이트
balanceRouter.put('/rebalancing', async (req, res) => {
  try {
    const { isEnabled } = req.body;
    
    if (typeof isEnabled !== 'boolean') {
      return res.status(400).json({
        error: 'isEnabled 값이 올바르지 않습니다. boolean 타입이어야 합니다.'
      });
    }

    const result = await updateRebalancingStatus(isEnabled);
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
        details: result.details
      });
    }
  } catch (error) {
    console.error('리밸런싱 업데이트 API 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 내부 오류가 발생했습니다.',
      details: error.message
    });
  }
});

// 모든 잔고 데이터를 한번에 조회하는 엔드포인트
balanceRouter.get('/all', async (req, res) => {
  try {
    const [holdingsResult, depositResult, rebalancingResult] = await Promise.all([
      getHoldingStocks(),
      getCustomerDeposit(),
      getRebalancingStatus()
    ]);

    // 총자산 계산
    let totalAssets = null;
    if (holdingsResult.success && depositResult.success) {
      const totalStockValue = holdingsResult.data.reduce((sum, stock) => sum + stock.marketValue, 0);
      const totalPurchaseAmount = holdingsResult.data.reduce((sum, stock) => sum + stock.purchaseAmount, 0);
      const totalProfitLoss = totalStockValue - totalPurchaseAmount;
      const totalProfitLossRate = totalPurchaseAmount > 0 ? (totalProfitLoss / totalPurchaseAmount) * 100 : 0;

      totalAssets = {
        totalStockValue,
        depositAmount: depositResult.data.depositAmount,
        totalAssets: totalStockValue + depositResult.data.depositAmount,
        totalProfitLoss,
        totalProfitLossRate
      };
    }

    // 포트폴리오 구성 계산
    let portfolioComposition = [];
    if (holdingsResult.success) {
      portfolioComposition = holdingsResult.data.map(stock => ({
        stockName: stock.stockName,
        weight: stock.weight,
        value: stock.marketValue
      }));
    }

    res.json({
      holdingStocks: holdingsResult.success ? holdingsResult.data : null,
      deposit: depositResult.success ? depositResult.data : null,
      portfolioComposition,
      totalAssets,
      rebalancingStatus: rebalancingResult.success ? rebalancingResult.data : null,
      errors: {
        holdings: !holdingsResult.success ? holdingsResult.error : null,
        deposit: !depositResult.success ? depositResult.error : null,
        rebalancing: !rebalancingResult.success ? rebalancingResult.error : null
      }
    });
  } catch (error) {
    console.error('전체 잔고 데이터 API 오류:', error);
    res.status(500).json({
      error: '서버 내부 오류가 발생했습니다.',
      details: error.message
    });
  }
});

// 전략 관련 엔드포인트
balanceRouter.get('/strategies/master', async (req, res) => {
  try {
    const result = await getMasterStrategies();
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('마스터 전략 조회 API 오류:', error);
    res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
  }
});

balanceRouter.post('/strategies/save', async (req, res) => {
  try {
    const result = await saveCustomerStrategy(req.body);
    
    if (result.success) {
      res.json({ success: true, message: result.message });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('고객 전략 저장 API 오류:', error);
    res.status(500).json({ success: false, error: '서버 내부 오류가 발생했습니다.' });
  }
});

balanceRouter.get('/strategies/customer', async (req, res) => {
  try {
    const result = await getCustomerStrategy();
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('고객 전략 조회 API 오류:', error);
    res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
  }
});

// 현재 시세 조회 (실시간 업데이트용)
balanceRouter.post('/current-prices', async (req, res) => {
  try {
    const { stockCodes } = req.body;
    
    if (!stockCodes || !Array.isArray(stockCodes)) {
      return res.status(400).json({
        success: false,
        error: '종목코드 배열이 필요합니다.',
        example: { stockCodes: ["005930", "000660", "035420"] }
      });
    }

    const result = await getCurrentPrices(stockCodes);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({
        error: result.error,
        details: result.details
      });
    }
  } catch (error) {
    console.error('현재 시세 조회 API 오류:', error);
    res.status(500).json({
      error: '서버 내부 오류가 발생했습니다.',
      details: error.message
    });
  }
});

// 포트폴리오 시뮬레이션 API
balanceRouter.post('/simulate-portfolio', async (req, res) => {
  try {
    const { strategyCode } = req.body;
    
    if (!strategyCode) {
      return res.status(400).json({
        error: '전략 코드가 필요합니다.',
        details: 'strategyCode 파라미터를 제공해주세요.'
      });
    }

    // 현재 고객 보유종목 조회
    const holdingsResult = await getHoldingStocks();
    if (!holdingsResult.success) {
      return res.status(500).json({
        error: holdingsResult.error,
        details: holdingsResult.details
      });
    }

    // Mock 시뮬레이션 데이터 생성 (실제로는 전략별 포트폴리오 구성 데이터 필요)
    const simulatePortfolioWeights = (strategy) => {
      // 전략에 따른 가상의 포트폴리오 비중 생성
      const riskLevels = {
        '초저위험': { growth: 0.1, stable: 0.7, bond: 0.2 },
        '저위험': { growth: 0.2, stable: 0.6, bond: 0.2 },
        '중위험': { growth: 0.4, stable: 0.4, bond: 0.2 },
        '고위험': { growth: 0.6, stable: 0.3, bond: 0.1 },
        '초고위험': { growth: 0.8, stable: 0.2, bond: 0.0 }
      };
      
      return riskLevels['중위험']; // 기본값
    };

    // 전략 정보 조회 (실제로는 rebalancing_master에서 가져와야 함)
    const mockStrategy = {
      strategy_code: strategyCode,
      risk_level: '중위험',
      investment_style: '성장투자'
    };

    // 현재 포트폴리오와 시뮬레이션 결과 생성 (실시간 시세 반영)
    const currentHoldings = holdingsResult.data;
    const totalCurrentValue = currentHoldings.reduce((sum, stock) => sum + stock.marketValue, 0);
    
    // 시뮬레이션된 포트폴리오 구성 (전략에 따른 비중 조정)
    const simulatedHoldings = currentHoldings.map((stock, index) => {
      // 전략에 따라 비중 조정 (실제로는 전략별 목표 비중 데이터 사용)
      let newWeight;
      
      // 전략별 비중 조정 로직 (Mock)
      switch(mockStrategy.risk_level) {
        case '초저위험':
          newWeight = Math.max(3, Math.min(15, stock.weight + (Math.random() - 0.5) * 10));
          break;
        case '저위험':
          newWeight = Math.max(5, Math.min(20, stock.weight + (Math.random() - 0.5) * 12));
          break;
        case '중위험':
          newWeight = Math.max(3, Math.min(25, stock.weight + (Math.random() - 0.5) * 15));
          break;
        case '고위험':
          newWeight = Math.max(2, Math.min(30, stock.weight + (Math.random() - 0.5) * 20));
          break;
        case '초고위험':
          newWeight = Math.max(1, Math.min(35, stock.weight + (Math.random() - 0.5) * 25));
          break;
        default:
          newWeight = Math.max(5, Math.min(25, stock.weight + (Math.random() - 0.5) * 15));
      }
      
      // 시뮬레이션 계산 (실시간 시세 기준)
      const simulatedValue = (totalCurrentValue * newWeight) / 100;
      const simulatedQuantity = Math.floor(simulatedValue / stock.currentPrice);
      
      // 실제 매입가능한 수량과 금액 재계산
      const actualSimulatedValue = simulatedQuantity * stock.currentPrice;
      const actualSimulatedWeight = totalCurrentValue > 0 ? (actualSimulatedValue / totalCurrentValue) * 100 : 0;
      
      // 시뮬레이션 손익 계산 (평균단가 기준)
      const avgPrice = stock.purchaseAmount / stock.quantity; // 현재 보유 종목의 평균단가
      const simulatedPurchaseAmount = simulatedQuantity * avgPrice; // 시뮬레이션 매입금액
      const simulatedProfitLoss = actualSimulatedValue - simulatedPurchaseAmount; // 손익 = 평가금액 - 매입금액
      const simulatedProfitLossRate = simulatedPurchaseAmount > 0 ? (simulatedProfitLoss / simulatedPurchaseAmount) * 100 : 0;

      return {
        stockCode: stock.stockCode,
        stockName: stock.stockName,
        currentWeight: stock.weight,
        simulatedWeight: actualSimulatedWeight,
        currentValue: stock.marketValue,
        simulatedValue: actualSimulatedValue,
        currentQuantity: stock.quantity,
        simulatedQuantity: simulatedQuantity,
        currentProfitLoss: stock.profitLoss,
        simulatedProfitLoss: simulatedProfitLoss,
        currentProfitLossRate: stock.profitLossRate,
        simulatedProfitLossRate: simulatedProfitLossRate,
        weightChange: actualSimulatedWeight - stock.weight,
        valueChange: actualSimulatedValue - stock.marketValue
      };
    });

    res.json({
      strategy: mockStrategy,
      totalCurrentValue,
      simulatedHoldings,
      summary: {
        totalWeightChange: simulatedHoldings.reduce((sum, stock) => sum + Math.abs(stock.weightChange), 0),
        totalValueChange: simulatedHoldings.reduce((sum, stock) => sum + stock.valueChange, 0),
        expectedReturn: Math.random() * 20 - 5, // -5% ~ 15% 예상 수익률
        riskAdjustment: 'moderate'
      }
    });

  } catch (error) {
    console.error('포트폴리오 시뮬레이션 API 오류:', error);
    res.status(500).json({
      error: '서버 내부 오류가 발생했습니다.',
      details: error.message
    });
  }
});

// 시세 관리 API 라우트
const priceRouter = express.Router();

// 시세 업데이터 상태 조회
priceRouter.get('/status', (req, res) => {
  const status = priceUpdater.getStatus();
  res.json({
    success: true,
    data: status,
    message: `시세 업데이터가 ${status.isRunning ? '실행 중' : '중지된 상태'}입니다`
  });
});

// 시세 업데이터 시작
priceRouter.post('/start', async (req, res) => {
  try {
    const started = await priceUpdater.start();
    if (started) {
      res.json({
        success: true,
        message: '시세 업데이터가 시작되었습니다',
        data: priceUpdater.getStatus()
      });
    } else {
      res.status(400).json({
        success: false,
        message: '시세 업데이터를 시작할 수 없습니다 (이미 실행 중이거나 연결 실패)'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '시세 업데이터 시작 중 오류가 발생했습니다',
      error: error.message
    });
  }
});

// 시세 업데이터 중지
priceRouter.post('/stop', async (req, res) => {
  try {
    await priceUpdater.stop();
    res.json({
      success: true,
      message: '시세 업데이터가 중지되었습니다',
      data: priceUpdater.getStatus()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '시세 업데이터 중지 중 오류가 발생했습니다',
      error: error.message
    });
  }
});

// 시세 업데이터 재시작
priceRouter.post('/restart', async (req, res) => {
  try {
    await priceUpdater.restart();
    res.json({
      success: true,
      message: '시세 업데이터가 재시작되었습니다',
      data: priceUpdater.getStatus()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '시세 업데이터 재시작 중 오류가 발생했습니다',
      error: error.message
    });
  }
});

// 시세 업데이터 설정 변경
priceRouter.put('/config', (req, res) => {
  try {
    const { interval, variation } = req.body;
    
    const config = {};
    if (interval !== undefined) config.interval = interval;
    if (variation !== undefined) config.variation = variation;
    
    priceUpdater.updateConfig(config);
    
    res.json({
      success: true,
      message: '시세 업데이터 설정이 변경되었습니다',
      data: priceUpdater.getStatus()
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: '시세 업데이터 설정 변경 중 오류가 발생했습니다',
      error: error.message
    });
  }
});

// 종목 업데이트 제외 관리 API
priceRouter.post('/exclude', (req, res) => {
  try {
    const { stockCode } = req.body;
    
    if (!stockCode) {
      return res.status(400).json({
        success: false,
        message: '종목코드가 필요합니다'
      });
    }
    
    priceUpdater.excludeStock(stockCode);
    
    res.json({
      success: true,
      message: `종목 ${stockCode}을 시세 업데이트에서 제외했습니다`,
      excludedStocks: priceUpdater.getExcludedStocks()
    });
  } catch (error) {
    console.error('종목 제외 오류:', error);
    res.status(500).json({
      success: false,
      message: '종목 제외에 실패했습니다',
      error: error.message
    });
  }
});

priceRouter.post('/include', (req, res) => {
  try {
    const { stockCode } = req.body;
    
    if (!stockCode) {
      return res.status(400).json({
        success: false,
        message: '종목코드가 필요합니다'
      });
    }
    
    const removed = priceUpdater.includeStock(stockCode);
    
    res.json({
      success: true,
      message: removed 
        ? `종목 ${stockCode}을 시세 업데이트에 다시 포함했습니다`
        : `종목 ${stockCode}은 이미 업데이트 대상입니다`,
      excludedStocks: priceUpdater.getExcludedStocks()
    });
  } catch (error) {
    console.error('종목 포함 오류:', error);
    res.status(500).json({
      success: false,
      message: '종목 포함에 실패했습니다',
      error: error.message
    });
  }
});

priceRouter.get('/excluded', (req, res) => {
  try {
    res.json({
      success: true,
      data: priceUpdater.getExcludedStocks(),
      message: '제외된 종목 목록'
    });
  } catch (error) {
    console.error('제외 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '제외 목록 조회에 실패했습니다',
      error: error.message
    });
  }
});

// 포트폴리오 관리 라우터
const portfolioRouter = express.Router();

// 포트폴리오 관리 - 통계 조회
portfolioRouter.get('/stats', async (req, res) => {
  try {
    console.log('📊 포트폴리오 관리 통계 조회 요청');
    
    // 전체 전략 수 (rebalancing_master)
    const [totalStrategiesResult] = await pool.execute(
      'SELECT COUNT(*) as total_count FROM rebalancing_master'
    );
    const totalStrategies = totalStrategiesResult[0].total_count;
    
    // 적용 고객 수 (customer_strategy에서 rebalancing_yn = 'Y')
    const [appliedCustomersResult] = await pool.execute(
      'SELECT COUNT(*) as customer_count FROM customer_strategy WHERE rebalancing_yn = ?',
      ['Y']
    );
    const appliedCustomers = appliedCustomersResult[0].customer_count;
    
    console.log(`📊 통계 결과 - 전체 전략: ${totalStrategies}, 적용 고객: ${appliedCustomers}`);
    
    res.json({
      success: true,
      data: {
        totalStrategies,
        appliedCustomers
      }
    });
    
  } catch (error) {
    console.error('❌ 포트폴리오 통계 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '통계 조회에 실패했습니다',
      error: error.message
    });
  }
});

// 포트폴리오 관리 - 전체 전략 목록 조회
portfolioRouter.get('/strategies', async (req, res) => {
  try {
    console.log('📋 포트폴리오 전략 목록 조회 요청');
    
    // rebalancing_master에서 전체 전략 조회
    const [strategies] = await pool.execute(`
      SELECT 
        rm.rebalancing_strategy_code,
        rm.rebalancing_name,
        rm.rebalancing_description,
        rm.risk_level,
        rm.investment_style,
        rm.keyword1,
        rm.keyword2,
        rm.keyword3,
        rm.created_at,
        rm.updated_at
      FROM rebalancing_master rm
      ORDER BY rm.created_at DESC
    `);
    
    // 각 전략별 적용 고객 수 조회
    const strategiesWithCustomerCount = await Promise.all(
      strategies.map(async (strategy) => {
        const [customerCountResult] = await pool.execute(
          'SELECT COUNT(*) as customer_count FROM customer_strategy WHERE rebalancing_strategy_code = ? AND rebalancing_yn = ?',
          [strategy.rebalancing_strategy_code, 'Y']
        );
        
        return {
          ...strategy,
          customer_count: customerCountResult[0].customer_count
        };
      })
    );
    
    console.log(`📋 전략 목록 조회 완료 - ${strategiesWithCustomerCount.length}개 전략`);
    
    res.json({
      success: true,
      data: strategiesWithCustomerCount
    });
    
  } catch (error) {
    console.error('❌ 포트폴리오 전략 목록 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '전략 목록 조회에 실패했습니다',
      error: error.message
    });
  }
});

// 포트폴리오 관리 - 선택된 전략들 삭제
portfolioRouter.delete('/strategies', async (req, res) => {
  try {
    const { strategyCodes } = req.body;
    
    if (!strategyCodes || !Array.isArray(strategyCodes) || strategyCodes.length === 0) {
      return res.status(400).json({
        success: false,
        message: '삭제할 전략 코드가 필요합니다'
      });
    }
    
    console.log('🗑️ 전략 삭제 요청:', strategyCodes);
    
    // 고객이 사용중인 전략이 있는지 확인
    const placeholders = strategyCodes.map(() => '?').join(',');
    const [customersUsingStrategies] = await pool.execute(
      `SELECT DISTINCT rebalancing_strategy_code, COUNT(*) as customer_count 
       FROM customer_strategy 
       WHERE rebalancing_strategy_code IN (${placeholders}) AND rebalancing_yn = 'Y'
       GROUP BY rebalancing_strategy_code`,
      strategyCodes
    );
    
    if (customersUsingStrategies.length > 0) {
      return res.status(400).json({
        success: false,
        message: '고객이 사용 중인 전략은 삭제할 수 없습니다',
        data: {
          strategiesInUse: customersUsingStrategies.map(row => ({
            strategyCode: row.rebalancing_strategy_code,
            customerCount: row.customer_count
          }))
        }
      });
    }
    
    // 전략 삭제 실행
    const [result] = await pool.execute(
      `DELETE FROM rebalancing_master WHERE rebalancing_strategy_code IN (${placeholders})`,
      strategyCodes
    );
    
    console.log(`✅ 전략 삭제 완료 - ${result.affectedRows}개 전략 삭제`);
    
    res.json({
      success: true,
      message: `${result.affectedRows}개 전략이 삭제되었습니다`,
      data: {
        deletedCount: result.affectedRows
      }
    });
    
  } catch (error) {
    console.error('❌ 전략 삭제 실패:', error);
    res.status(500).json({
      success: false,
      message: '전략 삭제에 실패했습니다',
      error: error.message
    });
  }
});

// 전략학습 라우터
const strategyLearningRouter = express.Router();

// Multer 설정 (메모리 저장소 사용)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB 제한
  },
  fileFilter: (req, file, cb) => {
    // 허용된 파일 형식 확인
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('지원하지 않는 파일 형식입니다.'), false);
    }
  }
});

// AI 전략 생성 API들
// 1. 사용자 입력 기반 전략 생성
strategyLearningRouter.post('/generate/user-input', async (req, res) => {
  try {
    const { strategyName, userInput } = req.body;
    
    if (!strategyName || strategyName.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '전략명이 필요합니다.'
      });
    }
    
    if (!userInput || userInput.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '사용자 입력이 필요합니다.'
      });
    }

    console.log('📝 사용자 입력 기반 AI 전략 생성 요청:', strategyName, '|', userInput);
    
    // Mock AI 전략 생성 (실제로는 AI 모델을 호출)
    const mockStrategy = generateMockStrategy('USER_INPUT', userInput);
    mockStrategy.rebalancing_name = strategyName; // 사용자 입력 전략명 사용
    
    // strategy_learning 테이블에 저장
    const [result] = await pool.execute(`
      INSERT INTO strategy_learning (
        rebalancing_strategy_code, rebalancing_name, rebalancing_description,
        risk_level, investment_style, keyword1, keyword2, keyword3, is_applied
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'N')
    `, [
      mockStrategy.code,
      mockStrategy.rebalancing_name,
      mockStrategy.description,
      mockStrategy.risk_level,
      mockStrategy.investment_style,
      mockStrategy.keyword1,
      mockStrategy.keyword2,
      mockStrategy.keyword3
    ]);

    res.json({
      success: true,
      message: 'AI 전략이 성공적으로 생성되었습니다.',
      data: {
        strategy_code: mockStrategy.code,
        strategy: mockStrategy
      }
    });

  } catch (error) {
    console.error('❌ 사용자 입력 전략 생성 실패:', error);
    res.status(500).json({
      success: false,
      message: '전략 생성에 실패했습니다.',
      error: error.message
    });
  }
});

// 2. 웹사이트 기반 전략 생성
strategyLearningRouter.post('/generate/website', async (req, res) => {
  try {
    const { strategyName, url } = req.body;
    
    if (!strategyName || strategyName.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '전략명이 필요합니다.'
      });
    }
    
    if (!url || !isValidUrl(url)) {
      return res.status(400).json({
        success: false,
        message: '유효한 웹사이트 URL이 필요합니다.'
      });
    }

    console.log('🌐 웹사이트 분석 기반 AI 전략 생성 요청:', strategyName, '|', url);
    
    // Mock 웹사이트 분석 및 전략 생성
    const mockStrategy = generateMockStrategy('WEBSITE', url);
    mockStrategy.rebalancing_name = strategyName; // 사용자 입력 전략명 사용
    
    // strategy_learning 테이블에 저장
    await pool.execute(`
      INSERT INTO strategy_learning (
        rebalancing_strategy_code, rebalancing_name, rebalancing_description,
        risk_level, investment_style, keyword1, keyword2, keyword3, is_applied
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'N')
    `, [
      mockStrategy.code,
      mockStrategy.rebalancing_name,
      mockStrategy.description,
      mockStrategy.risk_level,
      mockStrategy.investment_style,
      mockStrategy.keyword1,
      mockStrategy.keyword2,
      mockStrategy.keyword3
    ]);

    res.json({
      success: true,
      message: '웹사이트 분석을 통한 AI 전략이 생성되었습니다.',
      data: {
        strategy_code: mockStrategy.code,
        strategy: mockStrategy
      }
    });

  } catch (error) {
    console.error('❌ 웹사이트 전략 생성 실패:', error);
    res.status(500).json({
      success: false,
      message: '웹사이트 기반 전략 생성에 실패했습니다.',
      error: error.message
    });
  }
});

// 3. 문서 기반 전략 생성
strategyLearningRouter.post('/generate/document', upload.array('files', 5), async (req, res) => {
  try {
    const { strategyName } = req.body;
    const files = req.files;
    
    if (!strategyName || strategyName.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '전략명이 필요합니다.'
      });
    }
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: '업로드된 파일이 없습니다.'
      });
    }

    // 업로드된 파일들의 이름 수집
    const fileNames = files.map(file => file.originalname).join(', ');
    
    console.log('📄 문서 분석 기반 AI 전략 생성 요청:', strategyName, '|', fileNames);
    
    // Mock 문서 분석 및 전략 생성 (첫 번째 파일명을 기준으로)
    const mockStrategy = generateMockStrategy('DOCUMENT', files[0].originalname);
    mockStrategy.rebalancing_name = strategyName; // 사용자 입력 전략명 사용
    
    // strategy_learning 테이블에 저장
    await pool.execute(`
      INSERT INTO strategy_learning (
        rebalancing_strategy_code, rebalancing_name, rebalancing_description,
        risk_level, investment_style, keyword1, keyword2, keyword3, is_applied
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'N')
    `, [
      mockStrategy.code,
      mockStrategy.rebalancing_name,
      mockStrategy.description,
      mockStrategy.risk_level,
      mockStrategy.investment_style,
      mockStrategy.keyword1,
      mockStrategy.keyword2,
      mockStrategy.keyword3
    ]);

    res.json({
      success: true,
      message: '문서 분석을 통한 AI 전략이 생성되었습니다.',
      data: {
        strategy_code: mockStrategy.code,
        strategy: mockStrategy,
        processed_files: fileNames
      }
    });

  } catch (error) {
    console.error('❌ 문서 전략 생성 실패:', error);
    
    // Multer 에러 처리
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: '파일 크기가 너무 큽니다. 10MB 이하의 파일을 업로드해주세요.'
      });
    }
    
    if (error.message === '지원하지 않는 파일 형식입니다.') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: '문서 기반 전략 생성에 실패했습니다.',
      error: error.message
    });
  }
});

// 4. 자동 생성 (AI 자동 추천)
strategyLearningRouter.post('/generate/auto', async (req, res) => {
  try {
    const { strategyName, preferences = {} } = req.body;
    
    if (!strategyName || strategyName.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '전략명이 필요합니다.'
      });
    }
    
    console.log('🤖 AI 자동 전략 생성 요청:', strategyName);
    
    // Mock AI 자동 전략 생성
    const mockStrategy = generateMockStrategy('AUTO', 'AI 자동 분석');
    mockStrategy.rebalancing_name = strategyName; // 사용자 입력 전략명 사용
    
    // strategy_learning 테이블에 저장
    await pool.execute(`
      INSERT INTO strategy_learning (
        rebalancing_strategy_code, rebalancing_name, rebalancing_description,
        risk_level, investment_style, keyword1, keyword2, keyword3, is_applied
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'N')
    `, [
      mockStrategy.code,
      mockStrategy.rebalancing_name,
      mockStrategy.description,
      mockStrategy.risk_level,
      mockStrategy.investment_style,
      mockStrategy.keyword1,
      mockStrategy.keyword2,
      mockStrategy.keyword3
    ]);

    res.json({
      success: true,
      message: 'AI가 자동으로 전략을 생성했습니다.',
      data: {
        strategy_code: mockStrategy.code,
        strategy: mockStrategy
      }
    });

  } catch (error) {
    console.error('❌ 자동 전략 생성 실패:', error);
    res.status(500).json({
      success: false,
      message: '자동 전략 생성에 실패했습니다.',
      error: error.message
    });
  }
});

// 생성된 전략 목록 조회
strategyLearningRouter.get('/strategies', async (req, res) => {
  try {
    console.log('📋 전략학습 목록 조회 요청');
    
    const result = await getStrategyLearningList();
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error,
        error: result.details
      });
    }
    
    res.json({
      success: true,
      data: result.data,
      message: `${result.data.length}개의 학습된 전략을 조회했습니다.`
    });

  } catch (error) {
    console.error('❌ 전략학습 목록 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '전략 목록 조회에 실패했습니다.',
      error: error.message
    });
  }
});

// 전략 적용 (strategy_learning -> rebalancing_master)
strategyLearningRouter.post('/apply/:strategyCode', async (req, res) => {
  try {
    const { strategyCode } = req.params;
    
    console.log('✅ 전략 적용 요청:', strategyCode);
    
    // strategy_learning에서 전략 정보 조회
    const [strategies] = await pool.execute(`
      SELECT * FROM strategy_learning 
      WHERE rebalancing_strategy_code = ? AND is_applied = 'N'
    `, [strategyCode]);
    
    if (strategies.length === 0) {
      return res.status(404).json({
        success: false,
        message: '해당 전략을 찾을 수 없거나 이미 적용된 전략입니다.'
      });
    }
    
    const strategy = strategies[0];
    
    // 새로운 전략 코드 생성 (rebalancing_master용)
    const newStrategyCode = await generateNewStrategyCode();
    
    // rebalancing_master에 전략 복사
    await pool.execute(`
      INSERT INTO rebalancing_master (
        rebalancing_strategy_code, rebalancing_name, rebalancing_description,
        risk_level, investment_style, keyword1, keyword2, keyword3
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      newStrategyCode,
      strategy.rebalancing_name,
      strategy.rebalancing_description,
      strategy.risk_level,
      strategy.investment_style,
      strategy.keyword1,
      strategy.keyword2,
      strategy.keyword3
    ]);
    
    // strategy_learning 상태 업데이트
    await pool.execute(`
      UPDATE strategy_learning 
      SET is_applied = 'Y' 
      WHERE rebalancing_strategy_code = ?
    `, [strategyCode]);
    
    res.json({
      success: true,
      message: '전략이 성공적으로 적용되었습니다.',
      data: {
        original_code: strategyCode,
        applied_code: newStrategyCode
      }
    });

  } catch (error) {
    console.error('❌ 전략 적용 실패:', error);
    res.status(500).json({
      success: false,
      message: '전략 적용에 실패했습니다.',
      error: error.message
    });
  }
});

// 전략 삭제 API
strategyLearningRouter.delete('/delete', async (req, res) => {
  try {
    const { strategyCodes } = req.body;
    
    if (!strategyCodes || !Array.isArray(strategyCodes) || strategyCodes.length === 0) {
      return res.status(400).json({
        success: false,
        message: '삭제할 전략 코드가 필요합니다.'
      });
    }

    console.log('🗑️ 전략 삭제 요청:', strategyCodes);
    
    // 삭제할 전략들 확인
    const placeholders = strategyCodes.map(() => '?').join(',');
    const [strategies] = await pool.execute(`
      SELECT rebalancing_strategy_code, rebalancing_name 
      FROM strategy_learning 
      WHERE rebalancing_strategy_code IN (${placeholders})
    `, strategyCodes);
    
    if (strategies.length === 0) {
      return res.status(404).json({
        success: false,
        message: '삭제할 전략을 찾을 수 없습니다.'
      });
    }
    
    // 전략 삭제 실행
    const [result] = await pool.execute(`
      DELETE FROM strategy_learning 
      WHERE rebalancing_strategy_code IN (${placeholders})
    `, strategyCodes);
    
    console.log(`✅ ${result.affectedRows}개 전략 삭제 완료:`, strategies.map(s => s.rebalancing_name).join(', '));
    
    res.json({
      success: true,
      message: `${result.affectedRows}개의 전략이 성공적으로 삭제되었습니다.`,
      data: {
        deletedCount: result.affectedRows,
        deletedStrategies: strategies
      }
    });

  } catch (error) {
    console.error('❌ 전략 삭제 실패:', error);
    res.status(500).json({
      success: false,
      message: '전략 삭제에 실패했습니다.',
      error: error.message
    });
  }
});

// Mock 전략 생성 함수
function generateMockStrategy(type, source) {
  const timestamp = Date.now();
  const typeMap = {
    'USER_INPUT': 'USR',
    'WEBSITE': 'WEB',
    'DOCUMENT': 'DOC', 
    'AUTO': 'AUTO'
  };
  
  const riskLevels = ['초저위험', '저위험', '중위험', '고위험', '초고위험'];
  const investmentStyles = ['가치투자', '성장투자', '배당투자', '지수추종', '단기/스윙', '퀀트/시스템트레이딩', '테마/모멘텀'];
  
  const templates = {
    'USER_INPUT': {
      names: ['사용자 맞춤형 전략', '개인화 포트폴리오', '맞춤 투자전략'],
      descriptions: ['사용자 요구사항을 분석하여 생성된 맞춤형 포트폴리오 전략'],
      keywords: [['맞춤형', '사용자', '개인화'], ['분석', '요구사항', '최적화']]
    },
    'WEBSITE': {
      names: ['웹 분석 전략', '온라인 트렌드 전략', '웹 기반 포트폴리오'],
      descriptions: ['웹사이트 분석을 통해 도출된 시장 트렌드 기반 투자전략'],
      keywords: [['웹분석', '트렌드', '온라인'], ['시장동향', '웹사이트', '분석']]
    },
    'DOCUMENT': {
      names: ['문서 기반 전략', '리포트 분석 전략', '문서 분석 포트폴리오'],
      descriptions: ['전문 문서 분석을 통해 구성된 데이터 중심 투자전략'],
      keywords: [['문서분석', '리포트', '데이터'], ['전문분석', '문서', '연구']]
    },
    'AUTO': {
      names: ['AI 자동 전략', '스마트 포트폴리오', 'AI 추천 전략'],
      descriptions: ['AI가 시장 데이터를 종합 분석하여 자동 생성한 최적화 전략'],
      keywords: [['AI생성', '자동분석', '최적화'], ['스마트', 'AI', '자동']]
    }
  };
  
  const template = templates[type];
  const randomRisk = riskLevels[Math.floor(Math.random() * riskLevels.length)];
  const randomStyle = investmentStyles[Math.floor(Math.random() * investmentStyles.length)];
  const randomName = template.names[Math.floor(Math.random() * template.names.length)];
  const randomDesc = template.descriptions[0];
  const randomKeywords = template.keywords[Math.floor(Math.random() * template.keywords.length)];
  
  return {
    code: `${typeMap[type]}_${timestamp.toString().slice(-6)}`,
    name: randomName,
    rebalancing_name: null, // API에서 사용자 입력값으로 설정됨
    description: randomDesc,
    risk_level: randomRisk,
    investment_style: randomStyle,
    keyword1: randomKeywords[0],
    keyword2: randomKeywords[1],
    keyword3: randomKeywords[2]
  };
}

// URL 유효성 검사 함수
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// 새로운 전략 코드 생성 함수
async function generateNewStrategyCode() {
  const [result] = await pool.execute(`
    SELECT rebalancing_strategy_code 
    FROM rebalancing_master 
    WHERE rebalancing_strategy_code LIKE 'APPLIED_%'
    ORDER BY rebalancing_strategy_code DESC 
    LIMIT 1
  `);
  
  const lastCode = result[0]?.rebalancing_strategy_code || 'APPLIED_000';
  const nextNumber = parseInt(lastCode.split('_')[1]) + 1;
  return `APPLIED_${nextNumber.toString().padStart(3, '0')}`;
}

// 라우터 등록
app.use('/api/price', priceRouter);
app.use('/api/balance', balanceRouter);
app.use('/api/portfolio', portfolioRouter);
app.use('/api/strategy-learning', strategyLearningRouter);

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({
    error: '요청한 엔드포인트를 찾을 수 없습니다.',
    availableEndpoints: [
      'GET /health',
      'GET /api/balance/holdings',
      'GET /api/balance/deposit',
      'GET /api/balance/composition',
      'GET /api/balance/total-assets',
      'GET /api/balance/rebalancing',
      'PUT /api/balance/rebalancing',
      'POST /api/balance/current-prices',
      'POST /api/balance/simulate-portfolio',
      'GET /api/balance/strategies/master',
      'POST /api/balance/strategies/save',
      'GET /api/balance/strategies/customer',
      'GET /api/balance/all',
      'GET /api/price/status',
      'POST /api/price/start',
      'POST /api/price/stop',
      'POST /api/price/restart',
      'PUT /api/price/config'
    ]
  });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error('서버 에러:', err);
  res.status(500).json({
    error: '서버 내부 오류가 발생했습니다.',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 서버 시작
app.listen(PORT, async () => {
  console.log('\n🚀 포트폴리오 관리 시스템 백엔드 서버 시작');
  console.log(`📡 포트: ${PORT}`);
  console.log(`🌍 환경: ${process.env.NODE_ENV || 'development'}`);
  console.log(`👤 계좌: ${process.env.ACCOUNT_NUMBER}`);
  
  // 데이터베이스 연결 테스트
  console.log('\n🔍 데이터베이스 연결 테스트 중...');
  const dbConnected = await testConnection();
  
  if (dbConnected) {
    // 시세 업데이터 자동 시작
    console.log('\n📈 시세 업데이터 시작 중...');
    const priceUpdaterStarted = await priceUpdater.start();
    
    if (priceUpdaterStarted) {
      console.log('✅ 시세 업데이터가 정상적으로 시작되었습니다!');
    } else {
      console.log('⚠️  시세 업데이터 시작에 실패했습니다.');
    }
    
    console.log('✅ 모든 시스템이 정상적으로 시작되었습니다!');
    console.log('\n📋 사용 가능한 API 엔드포인트:');
    console.log('  GET  /health                     - 헬스체크');
    console.log('  GET  /api/balance/holdings       - 보유종목 조회');
    console.log('  GET  /api/balance/deposit        - 예수금 조회');
    console.log('  GET  /api/balance/composition    - 포트폴리오 구성');
    console.log('  GET  /api/balance/total-assets   - 총자산 조회');
    console.log('  GET  /api/balance/rebalancing    - 리밸런싱 상태');
    console.log('  PUT  /api/balance/rebalancing    - 리밸런싱 업데이트');
    console.log('  POST /api/balance/current-prices - 현재 시세 조회');
    console.log('  GET  /api/balance/all            - 모든 데이터 조회');
    console.log('\n📈 시세 관리 API:');
    console.log('  GET  /api/price/status           - 시세 업데이터 상태');
    console.log('  POST /api/price/start            - 시세 업데이터 시작');
    console.log('  POST /api/price/stop             - 시세 업데이터 중지');
    console.log('  POST /api/price/restart          - 시세 업데이터 재시작');
    console.log('  PUT  /api/price/config           - 시세 업데이터 설정');
  } else {
    console.log('⚠️  데이터베이스 연결에 실패했지만 서버는 시작되었습니다.');
  }
  
  console.log(`\n🌐 서버 주소: http://localhost:${PORT}`);
  console.log('💡 중지하려면 Ctrl+C를 누르세요.\n');
});

// 프로세스 종료 시 정리 작업
process.on('SIGINT', async () => {
  console.log('\n🛑 서버를 종료하는 중...');
  console.log('📈 시세 업데이터 중지 중...');
  await priceUpdater.stop();
  console.log('✅ 모든 프로세스가 정상적으로 종료되었습니다.');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 서버를 종료하는 중...');
  console.log('📈 시세 업데이터 중지 중...');
  await priceUpdater.stop();
  console.log('✅ 모든 프로세스가 정상적으로 종료되었습니다.');
  process.exit(0);
});