// 잔고 관련 React Query hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getHoldingStocks, 
  getPortfolioComposition, 
  getTotalAssets, 
  getRebalancingStatus,
  updateRebalancingToggle,
  HoldingStock,
  PortfolioComposition,
  TotalAssets,
  RebalancingStatus
} from '@/api/balance';

// 보유종목 조회 hook
export const useHoldingStocks = () => {
  return useQuery<HoldingStock[], Error>({
    queryKey: ['holdingStocks'],
    queryFn: getHoldingStocks,
    staleTime: 5 * 60 * 1000, // 5분
    refetchOnWindowFocus: true
  });
};

// 포트폴리오 구성 조회 hook
export const usePortfolioComposition = () => {
  return useQuery<PortfolioComposition[], Error>({
    queryKey: ['portfolioComposition'],
    queryFn: getPortfolioComposition,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// 총자산 조회 hook
export const useTotalAssets = () => {
  return useQuery<TotalAssets, Error>({
    queryKey: ['totalAssets'],
    queryFn: getTotalAssets,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// 리밸런싱 상태 조회 hook
export const useRebalancingStatus = () => {
  return useQuery<RebalancingStatus, Error>({
    queryKey: ['rebalancingStatus'],
    queryFn: getRebalancingStatus,
    staleTime: 30 * 1000, // 30초
  });
};

// 리밸런싱 토글 업데이트 hook
export const useUpdateRebalancingToggle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRebalancingToggle,
    onSuccess: (data) => {
      // 성공 시 관련 쿼리들을 다시 fetch
      queryClient.invalidateQueries({ queryKey: ['rebalancingStatus'] });
      
      if (!data.success) {
        // 실패한 경우 toast 메시지 표시 등 처리
        console.warn(data.message);
      }
    },
    onError: (error) => {
      console.error('리밸런싱 토글 업데이트 실패:', error);
    }
  });
};

// 전체 잔고 데이터 조회 (모든 데이터를 한번에)
export const useBalanceData = () => {
  const holdingStocks = useHoldingStocks();
  const portfolioComposition = usePortfolioComposition();
  const totalAssets = useTotalAssets();
  const rebalancingStatus = useRebalancingStatus();

  return {
    holdingStocks,
    portfolioComposition,
    totalAssets,
    rebalancingStatus,
    isLoading: holdingStocks.isLoading || portfolioComposition.isLoading || totalAssets.isLoading || rebalancingStatus.isLoading,
    isError: holdingStocks.isError || portfolioComposition.isError || totalAssets.isError || rebalancingStatus.isError,
    error: holdingStocks.error || portfolioComposition.error || totalAssets.error || rebalancingStatus.error
  };
};