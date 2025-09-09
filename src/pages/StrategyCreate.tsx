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
  const [strategyName, setStrategyName] = useState("");
  const { toast } = useToast();

  const handleCompositionChange = (newComposition: typeof initialComposition) => {
    setComposition(newComposition);
    toast({
      title: "포트폴리오 구성이 업데이트되었습니다",
      description: "새로운 비중이 적용되었습니다.",
    });
  };

  const handleCreateStrategy = () => {
    if (!strategyName.trim()) {
      toast({
        title: "전략명을 입력해주세요",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "리밸런싱 전략이 생성되었습니다",
      description: `'${strategyName}' 전략이 성공적으로 저장되었습니다.`,
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
        
        <Card className="card-gradient p-6 mb-4 border-0">
          <h2 className="text-lg font-semibold mb-4">전략 설정</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">전략명</label>
              <input
                type="text"
                value={strategyName}
                onChange={(e) => setStrategyName(e.target.value)}
                placeholder="예: 균형 성장 전략"
                className="w-full p-3 border border-border rounded-lg bg-background"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">리밸런싱 주기</label>
              <select className="w-full p-3 border border-border rounded-lg bg-background">
                <option value="monthly">매월</option>
                <option value="quarterly">분기별</option>
                <option value="semi-annual">반기별</option>
                <option value="annual">연간</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">허용 편차</label>
              <select className="w-full p-3 border border-border rounded-lg bg-background">
                <option value="5">5% 이상 차이 시</option>
                <option value="10">10% 이상 차이 시</option>
                <option value="15">15% 이상 차이 시</option>
                <option value="20">20% 이상 차이 시</option>
              </select>
            </div>
          </div>
          
          <Button 
            className="w-full primary-gradient text-primary-foreground font-medium mt-6"
            onClick={handleCreateStrategy}
          >
            전략 생성하기
          </Button>
        </Card>
        
        <Card className="card-gradient p-6 border-0">
          <h3 className="font-semibold mb-3">미리 정의된 전략</h3>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-neutral-light cursor-pointer hover:bg-primary/10 transition-colors">
              <p className="font-medium">균등 분산 전략</p>
              <p className="text-sm text-muted-foreground">모든 종목에 동일한 비중으로 투자</p>
            </div>
            <div className="p-3 rounded-lg bg-neutral-light cursor-pointer hover:bg-primary/10 transition-colors">
              <p className="font-medium">시가총액 가중 전략</p>
              <p className="text-sm text-muted-foreground">시가총액에 따른 비중 조정</p>
            </div>
            <div className="p-3 rounded-lg bg-neutral-light cursor-pointer hover:bg-primary/10 transition-colors">
              <p className="font-medium">안정형 전략</p>
              <p className="text-sm text-muted-foreground">변동성이 낮은 종목 위주로 구성</p>
            </div>
          </div>
        </Card>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default StrategyCreate;