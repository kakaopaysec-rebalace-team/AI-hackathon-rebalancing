import { PortfolioSummary } from "@/components/PortfolioSummary";
import { PortfolioCard } from "@/components/PortfolioCard";
import { PortfolioComposition } from "@/components/PortfolioComposition";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useBalanceData } from "@/hooks/useBalance";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const Index = () => {
  const {
    holdingStocks,
    portfolioComposition,
    totalAssets,
    rebalancingStatus,
    isLoading,
    isError,
    error
  } = useBalanceData();

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">포트폴리오 데이터를 불러오는 중...</p>
        </Card>
      </div>
    );
  }

  // 에러 상태
  if (isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-destructive mb-2">데이터를 불러오는데 실패했습니다.</p>
          <p className="text-sm text-muted-foreground">
            {error?.message || '알 수 없는 오류가 발생했습니다.'}
          </p>
        </Card>
      </div>
    );
  }

  // 포트폴리오 구성 차트 데이터 변환
  const compositionData = portfolioComposition.data?.map((item) => ({
    symbol: item.stockName.substring(0, 4), // 종목명에서 4글자만 표시
    name: item.stockName,
    value: item.value,
    percentage: item.weight,
    color: ''
  })) || [];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4">
        {/* 총자산 섹션 */}
        {totalAssets.data && (
          <PortfolioSummary
            totalValue={totalAssets.data.totalAssets}
            totalChange={totalAssets.data.totalProfitLoss}
            totalChangePercent={totalAssets.data.totalProfitLossRate}
          />
        )}
        
        {/* 포트폴리오 구성 섹션 */}
        <PortfolioComposition 
          data={compositionData}
          rebalancingStatus={rebalancingStatus.data}
        />
        
        {/* 보유종목 섹션 */}
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-4">보유 종목</h2>
          {holdingStocks.data?.map((stock) => (
            <PortfolioCard
              key={stock.stockCode}
              symbol={stock.stockCode}
              name={stock.stockName}
              shares={stock.quantity}
              currentPrice={stock.currentPrice}
              avgPrice={stock.purchaseAmount / stock.quantity} // 평균매수가 계산
              totalValue={stock.marketValue}
              change={stock.profitLoss}
              changePercent={stock.profitLossRate}
              portfolioPercent={stock.weight}
            />
          ))}
          
          {holdingStocks.data?.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">보유 중인 종목이 없습니다.</p>
            </Card>
          )}
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Index;