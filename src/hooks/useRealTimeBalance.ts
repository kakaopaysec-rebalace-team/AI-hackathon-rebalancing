import { useState, useEffect, useCallback } from 'react';
import { useBalanceData } from './useBalance';

interface RealTimeBalance {
  totalAssets: number;
  totalProfitLoss: number;
  totalProfitLossRate: number;
  holdings: Array<{
    stockCode: string;
    stockName: string;
    quantity: number;
    currentPrice: number;
    avgPrice: number;
    purchaseAmount: number;
    marketValue: number;
    profitLoss: number;
    profitLossRate: number;
    weight: number;
  }>;
}

export const useRealTimeBalance = () => {
  const { holdingStocks, totalAssets, isLoading, error } = useBalanceData();
  const [realTimeData, setRealTimeData] = useState<RealTimeBalance | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // 최신 잔고 데이터를 조회하는 함수
  const fetchLatestBalanceData = useCallback(async () => {
    try {
      console.log('🔄 최신 잔고 데이터 조회 시작...');
      
      const apiUrl = `${import.meta.env.VITE_API_URL}/balance/holdings`;
      console.log('🌐 API 호출 URL:', apiUrl);
      
      // 최신 잔고 데이터 조회 (현재가 포함)
      const response = await fetch(apiUrl);

      console.log('📡 API 응답 상태:', response.status, response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API 에러:', errorText);
        throw new Error(`잔고 데이터 조회 실패: ${response.status}`);
      }

      const balanceData = await response.json();
      console.log('💰 조회된 잔고 데이터:', {
        dataLength: balanceData.length,
        firstItem: balanceData[0]?.stockCode
      });
      
      return Array.isArray(balanceData) ? balanceData : null;
    } catch (error) {
      console.error('❌ 잔고 데이터 조회 실패:', error);
      return null;
    }
  }, []);

  // 잔고 데이터를 실시간 형식으로 변환하는 함수
  const convertToRealTimeFormat = useCallback((latestHoldings: any[]) => {
    if (!latestHoldings || latestHoldings.length === 0) {
      return null;
    }

    let totalMarketValue = 0;
    let totalPurchaseAmount = 0;

    // 총합 계산
    latestHoldings.forEach(stock => {
      totalMarketValue += stock.marketValue;
      totalPurchaseAmount += stock.purchaseAmount;
    });

    // 가중치가 포함된 종목 데이터 생성
    const holdingsWithWeight = latestHoldings.map(stock => ({
      stockCode: stock.stockCode,
      stockName: stock.stockName,
      quantity: stock.quantity,
      currentPrice: stock.currentPrice,
      avgPrice: (stock.quantity > 0 && stock.purchaseAmount > 0) ? stock.purchaseAmount / stock.quantity : 0,
      purchaseAmount: stock.purchaseAmount,
      marketValue: stock.marketValue,
      profitLoss: stock.profitLoss,
      profitLossRate: stock.profitLossRate,
      weight: totalMarketValue > 0 ? (stock.marketValue / totalMarketValue) * 100 : 0
    }));

    const totalProfitLoss = totalMarketValue - totalPurchaseAmount;
    const totalProfitLossRate = totalPurchaseAmount > 0 ? (totalProfitLoss / totalPurchaseAmount) * 100 : 0;

    return {
      totalAssets: totalMarketValue,
      totalProfitLoss,
      totalProfitLossRate,
      holdings: holdingsWithWeight
    };
  }, []);

  // 실시간 데이터 업데이트
  const updateRealTimeData = useCallback(async () => {
    console.log('🔄 실시간 데이터 업데이트 시작...');
    const latestHoldings = await fetchLatestBalanceData();
    if (latestHoldings) {
      console.log('✅ 잔고 데이터 조회 성공, 계산 시작...');
      const realTimeValues = convertToRealTimeFormat(latestHoldings);
      if (realTimeValues) {
        console.log('💯 계산 완료, UI 업데이트:', {
          totalAssets: realTimeValues.totalAssets,
          totalProfitLoss: realTimeValues.totalProfitLoss,
          holdingsCount: realTimeValues.holdings.length
        });
        setRealTimeData(realTimeValues);
        setLastUpdated(new Date());
      } else {
        console.warn('⚠️ 실시간 계산 결과가 null입니다');
      }
    } else {
      console.warn('⚠️ 잔고 데이터 조회 결과가 null입니다');
    }
  }, [fetchLatestBalanceData, convertToRealTimeFormat]);

  // 초기 데이터 설정
  useEffect(() => {
    console.log('📊 초기 데이터 설정 확인:', {
      holdingStocks: !!holdingStocks.data,
      holdingsCount: holdingStocks.data?.length,
      totalAssets: !!totalAssets.data,
      isLoading: isLoading
    });

    if (holdingStocks.data && totalAssets.data) {
      console.log('✅ 초기 데이터 설정 시작 - 기존 데이터 사용');
      // 초기에는 기존 데이터를 사용
      const initialData: RealTimeBalance = {
        totalAssets: totalAssets.data.totalAssets,
        totalProfitLoss: totalAssets.data.totalProfitLoss,
        totalProfitLossRate: totalAssets.data.totalProfitLossRate,
        holdings: holdingStocks.data.map(stock => ({
          stockCode: stock.stockCode,
          stockName: stock.stockName,
          quantity: stock.quantity,
          currentPrice: stock.currentPrice,
          avgPrice: (stock.quantity > 0 && stock.purchaseAmount > 0) ? stock.purchaseAmount / stock.quantity : 0,
          purchaseAmount: stock.purchaseAmount,
          marketValue: stock.marketValue,
          profitLoss: stock.profitLoss,
          profitLossRate: stock.profitLossRate,
          weight: stock.weight
        }))
      };
      console.log('💾 초기 실시간 데이터 설정 완료:', {
        totalAssets: initialData.totalAssets,
        holdingsCount: initialData.holdings.length
      });
      setRealTimeData(initialData);
    } else {
      console.log('⏳ 초기 데이터 대기 중...');
    }
  }, [holdingStocks.data, totalAssets.data, isLoading]);

  // 실시간 업데이트 주기적 실행 (2초마다)
  useEffect(() => {
    if (!realTimeData) {
      console.log('⏳ realTimeData가 아직 준비되지 않아 실시간 업데이트를 시작하지 않습니다');
      return;
    }

    console.log('🔄 2초 간격 실시간 업데이트 인터벌 시작');
    const interval = setInterval(() => {
      console.log('⏰ 2초 타이머 실행 - updateRealTimeData 호출');
      updateRealTimeData();
    }, 2000); // 2초마다 실행으로 변경
    
    return () => {
      console.log('🛑 실시간 업데이트 인터벌 정리');
      clearInterval(interval);
    };
  }, [realTimeData, updateRealTimeData]);

  // 수동 새로고침
  const refresh = useCallback(() => {
    console.log('🔄 수동 새로고침 버튼 클릭됨');
    updateRealTimeData();
  }, [updateRealTimeData]);

  return {
    realTimeData,
    lastUpdated,
    isLoading,
    error,
    refresh
  };
};