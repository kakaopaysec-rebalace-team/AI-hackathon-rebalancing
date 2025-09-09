import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BottomNavigation } from "@/components/BottomNavigation";
import { EditablePortfolioComposition } from "@/components/EditablePortfolioComposition";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Mock data matching the main portfolio
const initialComposition = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    value: 26250000,
    percentage: 20.9,
    color: ''
  },
  {
    symbol: "TSLA", 
    name: "Tesla, Inc.",
    value: 20000000,
    percentage: 15.9,
    color: ''
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    value: 42000000,
    percentage: 33.5,
    color: ''
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    value: 27000000,
    percentage: 21.5,
    color: ''
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    value: 10350000,
    percentage: 8.2,
    color: ''
  }
];

const StrategyCreate = () => {
  const [composition, setComposition] = useState(initialComposition);
  const { toast } = useToast();

  const handleCompositionChange = (newComposition: typeof initialComposition) => {
    setComposition(newComposition);
    toast({
      title: "포트폴리오 구성이 업데이트되었습니다",
      description: "새로운 비중이 적용되었습니다.",
    });
  };

  const handleStrategySelect = (strategyType: string) => {
    let newComposition;
    
    switch (strategyType) {
      case "equal":
        // 균등 분산: 모든 종목 20%씩
        newComposition = composition.map(item => ({
          ...item,
          percentage: 20.0,
          value: 20000000 // 20%로 계산된 값
        }));
        break;
      case "market-cap":
        // 시가총액 가중: 원래 비중 유지
        newComposition = initialComposition;
        break;
      case "conservative":
        // 안정형: AAPL, AMZN 높이고 TSLA, NVDA 낮춤
        newComposition = [
          { ...composition[0], percentage: 30.0, value: 30000000 }, // AAPL
          { ...composition[1], percentage: 10.0, value: 10000000 }, // TSLA  
          { ...composition[2], percentage: 15.0, value: 15000000 }, // NVDA
          { ...composition[3], percentage: 35.0, value: 35000000 }, // AMZN
          { ...composition[4], percentage: 10.0, value: 10000000 }  // GOOGL
        ];
        break;
      default:
        newComposition = composition;
    }
    
    setComposition(newComposition);
    toast({
      title: "전략이 적용되었습니다",
      description: "포트폴리오 구성이 선택한 전략에 맞게 변경되었습니다.",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6 text-center">리밸런싱 전략 생성</h1>
        
        <EditablePortfolioComposition 
          data={composition}
          onCompositionChange={handleCompositionChange}
        />
        
        <Card className="card-gradient p-6 border-0">
          <h3 className="font-semibold mb-3">미리 정의된 전략</h3>
          <div className="space-y-3">
            <div 
              className="p-3 rounded-lg bg-neutral-light cursor-pointer hover:bg-primary/10 transition-colors"
              onClick={() => handleStrategySelect("equal")}
            >
              <p className="font-medium">균등 분산 전략</p>
              <p className="text-sm text-muted-foreground">모든 종목에 동일한 비중(20%)으로 투자</p>
            </div>
            <div 
              className="p-3 rounded-lg bg-neutral-light cursor-pointer hover:bg-primary/10 transition-colors"
              onClick={() => handleStrategySelect("market-cap")}
            >
              <p className="font-medium">시가총액 가중 전략</p>
              <p className="text-sm text-muted-foreground">시가총액에 따른 비중 조정</p>
            </div>
            <div 
              className="p-3 rounded-lg bg-neutral-light cursor-pointer hover:bg-primary/10 transition-colors"
              onClick={() => handleStrategySelect("conservative")}
            >
              <p className="font-medium">안정형 전략</p>
              <p className="text-sm text-muted-foreground">안정적인 종목(AAPL, AMZN) 위주로 구성</p>
            </div>
          </div>
        </Card>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default StrategyCreate;