// 데이터베이스 연결 및 쿼리 유틸리티
// fetch API로 백엔드 API를 호출하는 방식으로 구현

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// 데이터베이스 쿼리 인터페이스
export interface DBQueryResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// 보유종목 조회
export const fetchHoldingStocks = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/balance/holdings`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();

    return {
      success: true,
      data: data
    };

  } catch (error) {
    console.error('보유종목 조회 오류:', error);
    return {
      success: false,
      error: '보유종목 데이터를 불러올 수 없습니다.'
    };
  }
};

// 예수금 조회
export const fetchCustomerDeposit = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/balance/deposit`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();

    return {
      success: true,
      data: data
    };

  } catch (error) {
    console.error('예수금 조회 오류:', error);
    return {
      success: false,
      error: '예수금 데이터를 불러올 수 없습니다.'
    };
  }
};

// 리밸런싱 상태 조회
export const fetchRebalancingStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/balance/rebalancing`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();

    return {
      success: true,
      data: data
    };

  } catch (error) {
    console.error('리밸런싱 상태 조회 오류:', error);
    return {
      success: false,
      data: {
        isEnabled: false,
        hasStrategy: false,
        message: '리밸런싱 상태를 확인할 수 없습니다.'
      }
    };
  }
};

// 리밸런싱 상태 업데이트
export const updateRebalancingStatus = async (isEnabled: boolean) => {
  try {
    const response = await fetch(`${API_BASE_URL}/balance/rebalancing`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isEnabled })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result;

  } catch (error) {
    console.error('리밸런싱 상태 업데이트 오류:', error);
    return {
      success: false,
      message: '리밸런싱 상태 업데이트에 실패했습니다.'
    };
  }
};