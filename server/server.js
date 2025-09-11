// 포트폴리오 관리 시스템 백엔드 서버
const express = require('express');
const cors = require('cors');
const path = require('path');
const {
  testConnection,
  getHoldingStocks,
  getCustomerDeposit,
  getRebalancingStatus,
  updateRebalancingStatus,
  getMasterStrategies,
  saveCustomerStrategy,
  getCustomerStrategy
} = require('./database');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

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
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'Connected' : 'Disconnected',
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

// 잔고 라우터 등록
app.use('/api/balance', balanceRouter);

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
      'GET /api/balance/all'
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
    console.log('✅ 모든 시스템이 정상적으로 시작되었습니다!');
    console.log('\n📋 사용 가능한 API 엔드포인트:');
    console.log('  GET  /health                     - 헬스체크');
    console.log('  GET  /api/balance/holdings       - 보유종목 조회');
    console.log('  GET  /api/balance/deposit        - 예수금 조회');
    console.log('  GET  /api/balance/composition    - 포트폴리오 구성');
    console.log('  GET  /api/balance/total-assets   - 총자산 조회');
    console.log('  GET  /api/balance/rebalancing    - 리밸런싱 상태');
    console.log('  PUT  /api/balance/rebalancing    - 리밸런싱 업데이트');
    console.log('  GET  /api/balance/all            - 모든 데이터 조회');
  } else {
    console.log('⚠️  데이터베이스 연결에 실패했지만 서버는 시작되었습니다.');
  }
  
  console.log(`\n🌐 서버 주소: http://localhost:${PORT}`);
  console.log('💡 중지하려면 Ctrl+C를 누르세요.\n');
});

// 프로세스 종료 시 정리 작업
process.on('SIGINT', () => {
  console.log('\n🛑 서버를 종료하는 중...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 서버를 종료하는 중...');
  process.exit(0);
});