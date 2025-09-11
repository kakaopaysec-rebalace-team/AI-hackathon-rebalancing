import { PortfolioSummary } from "@/components/PortfolioSummary";
import { PortfolioCard } from "@/components/PortfolioCard";
import { PortfolioComposition } from "@/components/PortfolioComposition";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useBalanceData } from "@/hooks/useBalance";
import { useRealTimeBalance } from "@/hooks/useRealTimeBalance";
import { Card } from "@/components/ui/card";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const {
    portfolioComposition,
    rebalancingStatus,
    isLoading,
    isError,
    error
  } = useBalanceData();
  
  // 실시간 잠고 데이터 사용
  const {
    realTimeData,
    lastUpdated,
    refresh
  } = useRealTimeBalance();

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

  // 포트폴리오 구성 차트 데이터 변환 (실시간 데이터 사용)
  const compositionData = realTimeData?.holdings.map((item) => ({
    symbol: item.stockName.substring(0, 4), // 종목명에서 4글자만 표시
    name: item.stockName,
    value: item.marketValue,
    percentage: item.weight,
    color: ''
  })) || [];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4">
        {/* 실시간 업데이트 표시 및 새로고침 버튼 */}
        <div className="flex justify-between items-center mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-blue-800 font-medium">실시간 시세 적용</span>
            <span className="text-xs text-blue-600">
              마지막 업데이트: {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refresh}
            className="text-blue-600 border-blue-300 hover:bg-blue-50"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            새로고침
          </Button>
        </div>

        {/* 총자산 섹션 (실시간 데이터 사용) */}
        {realTimeData && (
          <PortfolioSummary
            totalValue={realTimeData.totalAssets}
            totalChange={realTimeData.totalProfitLoss}
            totalChangePercent={realTimeData.totalProfitLossRate}
          />
        )}
        
        {/* 포트폴리오 구성 섹션 */}
        <PortfolioComposition 
          data={compositionData}
          rebalancingStatus={rebalancingStatus.data}
        />
        
        {/* 보유종목 섹션 (실시간 데이터 사용) */}
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-4">보유 종목</h2>
          {realTimeData?.holdings.map((stock) => (
            <PortfolioCard
              key={stock.stockCode}
              symbol={stock.stockCode}
              name={stock.stockName}
              shares={stock.quantity}
              currentPrice={stock.currentPrice}
              avgPrice={stock.avgPrice}
              totalValue={stock.marketValue}
              change={stock.profitLoss}
              changePercent={stock.profitLossRate}
              portfolioPercent={stock.weight}
            />
          ))}
          
          {realTimeData?.holdings.length === 0 && (
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