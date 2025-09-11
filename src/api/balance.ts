// 잔고 관련 API
import { fetchHoldingStocks, fetchCustomerDeposit, fetchRebalancingStatus, updateRebalancingStatus } from '@/lib/database';

// 보유종목 데이터 타입
export interface HoldingStock {
  stockCode: string;
  stockName: string;
  quantity: number;
  purchaseAmount: number;
  currentPrice: number;
  marketValue: number;
  profitLoss: number;
  profitLossRate: number;
  weight: number;
}

// 포트폴리오 구성 데이터 타입
export interface PortfolioComposition {
  stockName: string;
  weight: number;
  value: number;
}

// 총자산 데이터 타입
export interface TotalAssets {
  totalStockValue: number;
  depositAmount: number;
  totalAssets: number;
  totalProfitLoss: number;
  totalProfitLossRate: number;
}

// 리밸런싱 상태 타입
export interface RebalancingStatus {
  isEnabled: boolean;
  hasStrategy: boolean;
  strategyCode?: string;
  message?: string;
}

// 보유종목 조회 API
export const getHoldingStocks = async (): Promise<HoldingStock[]> => {
  try {
    const result = await fetchHoldingStocks();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || '보유종목 데이터를 불러올 수 없습니다.');
    }

    return result.data;

  } catch (error) {
    console.error('보유종목 조회 오류:', error);
    throw new Error('보유종목 데이터를 불러올 수 없습니다.');
  }
};

// 포트폴리오 구성 데이터 조회 API
export const getPortfolioComposition = async (): Promise<PortfolioComposition[]> => {
  try {
    const holdingStocks = await getHoldingStocks();
    
    return holdingStocks.map(stock => ({
      stockName: stock.stockName,
      weight: stock.weight,
      value: stock.marketValue
    }));

  } catch (error) {
    console.error('포트폴리오 구성 조회 오류:', error);
    throw new Error('포트폴리오 구성 데이터를 불러올 수 없습니다.');
  }
};

// 총자산 정보 조회 API
export const getTotalAssets = async (): Promise<TotalAssets> => {
  try {
    // 보유종목 데이터 조회
    const holdingStocks = await getHoldingStocks();
    
    // 예수금 데이터 조회
    const depositResult = await fetchCustomerDeposit();
    
    if (!depositResult.success || !depositResult.data) {
      throw new Error(depositResult.error || '예수금 데이터를 불러올 수 없습니다.');
    }
    
    // 계산
    const totalStockValue = holdingStocks.reduce((sum, stock) => sum + stock.marketValue, 0);
    const totalPurchaseAmount = holdingStocks.reduce((sum, stock) => sum + stock.purchaseAmount, 0);
    const totalProfitLoss = totalStockValue - totalPurchaseAmount;
    const totalProfitLossRate = totalPurchaseAmount > 0 ? (totalProfitLoss / totalPurchaseAmount) * 100 : 0;

    return {
      totalStockValue,
      depositAmount: depositResult.data.depositAmount,
      totalAssets: totalStockValue + depositResult.data.depositAmount,
      totalProfitLoss,
      totalProfitLossRate
    };

  } catch (error) {
    console.error('총자산 조회 오류:', error);
    throw new Error('총자산 데이터를 불러올 수 없습니다.');
  }
};

// 리밸런싱 상태 조회 API
export const getRebalancingStatus = async (): Promise<RebalancingStatus> => {
  try {
    const result = await fetchRebalancingStatus();
    
    if (!result.success || !result.data) {
      return {
        isEnabled: false,
        hasStrategy: false,
        message: result.error || '리밸런싱 상태를 확인할 수 없습니다.'
      };
    }

    return result.data;

  } catch (error) {
    console.error('리밸런싱 상태 조회 오류:', error);
    return {
      isEnabled: false,
      hasStrategy: false,
      message: '리밸런싱 상태를 확인할 수 없습니다.'
    };
  }
};

// 리밸런싱 토글 업데이트 API
export const updateRebalancingToggle = async (isEnabled: boolean): Promise<{ success: boolean; message: string }> => {
  try {
    const result = await updateRebalancingStatus(isEnabled);
    return result;

  } catch (error) {
    console.error('리밸런싱 토글 업데이트 오류:', error);
    return {
      success: false,
      message: '리밸런싱 상태 업데이트에 실패했습니다.'
    };
  }
};