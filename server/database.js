// 데이터베이스 연결 및 쿼리 모듈
const mysql = require('mysql2/promise');
require('dotenv').config();

const ACCOUNT_NUMBER = process.env.ACCOUNT_NUMBER || '99911122222';

// 데이터베이스 연결 풀 생성
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // MySQL2에서 더 이상 지원하지 않는 옵션들 제거
  // acquireTimeout: 60000,  // 제거됨
  // timeout: 60000          // 제거됨
});

// 연결 테스트
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ 데이터베이스 연결 성공');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ 데이터베이스 연결 실패:', error.message);
    return false;
  }
}

// 보유종목 조회
async function getHoldingStocks() {
  try {
    const query = `
      SELECT 
        cb.stock_code,
        cb.stock_name,
        cb.quantity,
        cb.purchase_amount,
        scp.current_price,
        (cb.quantity * scp.current_price) as market_value,
        (cb.quantity * scp.current_price - cb.purchase_amount) as profit_loss,
        ((cb.quantity * scp.current_price - cb.purchase_amount) / cb.purchase_amount * 100) as profit_loss_rate
      FROM customer_balance cb
      JOIN stock_current_price scp ON cb.stock_code = scp.stock_code
      WHERE cb.account_number = ?
      ORDER BY cb.purchase_amount DESC
    `;

    const [rows] = await pool.execute(query, [ACCOUNT_NUMBER]);
    
    // 총 평가금액 계산
    const totalMarketValue = rows.reduce((sum, stock) => sum + parseFloat(stock.market_value), 0);

    // 각 종목의 비중 계산
    const dataWithWeight = rows.map(stock => ({
      stockCode: stock.stock_code,
      stockName: stock.stock_name,
      quantity: parseInt(stock.quantity),
      purchaseAmount: parseFloat(stock.purchase_amount),
      currentPrice: parseFloat(stock.current_price),
      marketValue: parseFloat(stock.market_value),
      profitLoss: parseFloat(stock.profit_loss),
      profitLossRate: parseFloat(stock.profit_loss_rate),
      weight: totalMarketValue > 0 ? (parseFloat(stock.market_value) / totalMarketValue) * 100 : 0
    }));

    return {
      success: true,
      data: dataWithWeight
    };

  } catch (error) {
    console.error('보유종목 조회 오류:', error);
    return {
      success: false,
      error: '보유종목 데이터를 불러올 수 없습니다.',
      details: error.message
    };
  }
}

// 예수금 조회
async function getCustomerDeposit() {
  try {
    const query = `
      SELECT deposit_amount
      FROM customer_deposit
      WHERE account_number = ?
    `;

    const [rows] = await pool.execute(query, [ACCOUNT_NUMBER]);

    if (rows.length === 0) {
      // 예수금 데이터가 없으면 기본값 반환 (5천만원)
      return {
        success: true,
        data: {
          depositAmount: 50000000
        }
      };
    }

    const deposit = rows[0];
    return {
      success: true,
      data: {
        depositAmount: parseFloat(deposit.deposit_amount)
      }
    };

  } catch (error) {
    console.error('예수금 조회 오류:', error);
    return {
      success: false,
      error: '예수금 데이터를 불러올 수 없습니다.',
      details: error.message
    };
  }
}

// 리밸런싱 상태 조회
async function getRebalancingStatus() {
  try {
    const query = `
      SELECT 
        cs.rebalancing_yn,
        cs.rebalancing_strategy_code,
        rm.rebalancing_name
      FROM customer_strategy cs
      LEFT JOIN rebalancing_master rm ON cs.rebalancing_strategy_code = rm.rebalancing_strategy_code
      WHERE cs.account_number = ?
    `;

    const [rows] = await pool.execute(query, [ACCOUNT_NUMBER]);

    if (rows.length === 0) {
      return {
        success: true,
        data: {
          isEnabled: false,
          hasStrategy: false,
          message: '설정된 리밸런싱 전략이 없습니다.'
        }
      };
    }

    const result = rows[0];
    return {
      success: true,
      data: {
        isEnabled: result.rebalancing_yn === 'Y',
        hasStrategy: !!result.rebalancing_strategy_code,
        strategyCode: result.rebalancing_strategy_code,
        message: result.rebalancing_name || '리밸런싱 전략'
      }
    };

  } catch (error) {
    console.error('리밸런싱 상태 조회 오류:', error);
    return {
      success: false,
      error: '리밸런싱 상태를 확인할 수 없습니다.',
      details: error.message
    };
  }
}

// 리밸런싱 상태 업데이트
async function updateRebalancingStatus(isEnabled) {
  try {
    // 먼저 고객전략이 있는지 확인
    const statusResult = await getRebalancingStatus();
    
    if (!statusResult.success) {
      return statusResult;
    }

    if (!statusResult.data.hasStrategy) {
      return {
        success: false,
        message: '리밸런싱 전략을 먼저 설정해주세요.'
      };
    }

    // 리밸런싱 상태 업데이트
    const updateQuery = `
      UPDATE customer_strategy 
      SET rebalancing_yn = ?, updated_at = NOW()
      WHERE account_number = ?
    `;

    await pool.execute(updateQuery, [isEnabled ? 'Y' : 'N', ACCOUNT_NUMBER]);

    return {
      success: true,
      message: `리밸런싱이 ${isEnabled ? '활성화' : '비활성화'}되었습니다.`
    };

  } catch (error) {
    console.error('리밸런싱 상태 업데이트 오류:', error);
    return {
      success: false,
      message: '리밸런싱 상태 업데이트에 실패했습니다.',
      details: error.message
    };
  }
}

// 리밸런싱 마스터 전략 조회
async function getMasterStrategies() {
  try {
    const query = `
      SELECT rebalancing_strategy_code as strategy_code,
             rebalancing_name as strategy_name,
             rebalancing_description as description,
             risk_level,
             investment_style,
             keyword1, keyword2, keyword3
      FROM rebalancing_master
      ORDER BY 
        CASE risk_level
          WHEN '초저위험' THEN 1
          WHEN '저위험' THEN 2
          WHEN '중위험' THEN 3
          WHEN '고위험' THEN 4
          WHEN '초고위험' THEN 5
        END,
        rebalancing_name
    `;

    const [rows] = await pool.execute(query);
    
    return {
      success: true,
      data: rows
    };

  } catch (error) {
    console.error('마스터 전략 조회 오류:', error);
    return {
      success: false,
      error: '마스터 전략 조회 중 오류가 발생했습니다.'
    };
  }
}

// 고객 전략 저장/업데이트
async function saveCustomerStrategy(strategyData) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const {
      strategyCode,
      strategyType, // 'master' 또는 'custom'
      rebalancingCycle,
      allowedDeviation,
      portfolioWeights // [{ stockCode, targetWeight }]
    } = strategyData;

    // 고객 전략 테이블 업서트
    const customerStrategyQuery = `
      INSERT INTO customer_strategy 
      (account_number, rebalancing_strategy_code, rebalancing_cycle, allowed_deviation, updated_at)
      VALUES (?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
      rebalancing_strategy_code = VALUES(rebalancing_strategy_code),
      rebalancing_cycle = VALUES(rebalancing_cycle),
      allowed_deviation = VALUES(allowed_deviation),
      updated_at = NOW()
    `;

    await connection.execute(customerStrategyQuery, [
      ACCOUNT_NUMBER,
      strategyCode,
      rebalancingCycle,
      allowedDeviation
    ]);

    // 고객 잔고 테이블의 목표 비중 업데이트
    if (portfolioWeights && portfolioWeights.length > 0) {
      for (const weight of portfolioWeights) {
        const updateWeightQuery = `
          UPDATE customer_balance
          SET rebalancing_target_weight = ?
          WHERE account_number = ? AND stock_code = ?
        `;
        
        await connection.execute(updateWeightQuery, [
          weight.targetWeight,
          ACCOUNT_NUMBER,
          weight.stockCode
        ]);
      }
    }

    await connection.commit();
    
    return {
      success: true,
      message: '전략이 성공적으로 저장되었습니다.'
    };

  } catch (error) {
    await connection.rollback();
    console.error('고객 전략 저장 오류:', error);
    return {
      success: false,
      error: '전략 저장 중 오류가 발생했습니다.'
    };
  } finally {
    connection.release();
  }
}

// 고객 전략 조회
async function getCustomerStrategy() {
  try {
    const query = `
      SELECT cs.rebalancing_strategy_code as strategy_code, cs.rebalancing_cycle, cs.allowed_deviation, cs.rebalancing_yn as is_active,
             rm.rebalancing_name as strategy_name, rm.rebalancing_description as description, rm.risk_level
      FROM customer_strategy cs
      LEFT JOIN rebalancing_master rm ON cs.rebalancing_strategy_code = rm.rebalancing_strategy_code
      WHERE cs.account_number = ?
    `;

    const [rows] = await pool.execute(query, [ACCOUNT_NUMBER]);
    
    if (rows.length === 0) {
      return {
        success: true,
        data: null
      };
    }

    return {
      success: true,
      data: rows[0]
    };

  } catch (error) {
    console.error('고객 전략 조회 오류:', error);
    return {
      success: false,
      error: '고객 전략 조회 중 오류가 발생했습니다.'
    };
  }
}

// 현재 시세 조회 (여러 종목)
async function getCurrentPrices(stockCodes) {
  try {
    if (!stockCodes || stockCodes.length === 0) {
      return { success: false, error: '조회할 종목코드가 없습니다.' };
    }

    const placeholders = stockCodes.map(() => '?').join(',');
    const query = `
      SELECT stock_code, current_price 
      FROM stock_current_price 
      WHERE stock_code IN (${placeholders})
      ORDER BY stock_code
    `;

    const [rows] = await pool.execute(query, stockCodes);
    
    // 결과를 객체 형태로 변환 { "종목코드": 현재가 }
    const pricesMap = {};
    rows.forEach(row => {
      pricesMap[row.stock_code] = row.current_price;
    });

    return { 
      success: true, 
      data: pricesMap,
      message: `${rows.length}개 종목의 현재 시세를 조회했습니다.`
    };

  } catch (error) {
    console.error('현재 시세 조회 실패:', error);
    return { 
      success: false, 
      error: '현재 시세 조회에 실패했습니다.', 
      details: error.message 
    };
  }
}

// 전략학습 목록 조회
async function getStrategyLearningList() {
  try {
    const query = `
      SELECT 
        rebalancing_strategy_code as strategy_code,
        rebalancing_name as strategy_name,
        rebalancing_description as description,
        risk_level,
        investment_style,
        keyword1,
        keyword2,
        keyword3,
        is_applied,
        created_at,
        updated_at
      FROM strategy_learning
      ORDER BY created_at DESC
    `;

    const [rows] = await pool.execute(query);
    
    // 전략 타입을 코드에서 추출 (예: USR_405737 -> USR)
    const dataWithType = rows.map(row => ({
      ...row,
      type: row.strategy_code.split('_')[0] || 'UNKNOWN',
      status: row.is_applied === 'Y' ? '적용됨' : '완료',
      createdAt: new Date(row.created_at).toLocaleString('ko-KR')
    }));

    return {
      success: true,
      data: dataWithType
    };

  } catch (error) {
    console.error('전략학습 목록 조회 오류:', error);
    return {
      success: false,
      error: '전략학습 목록을 불러올 수 없습니다.',
      details: error.message
    };
  }
}

module.exports = {
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
};