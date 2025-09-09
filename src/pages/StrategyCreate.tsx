import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BottomNavigation } from "@/components/BottomNavigation";

const StrategyCreate = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6 text-center">리밸런싱 전략 생성</h1>
        
        <Card className="card-gradient p-6 mb-4 border-0">
          <h2 className="text-lg font-semibold mb-4">새로운 전략 만들기</h2>
          <p className="text-muted-foreground mb-4">
            포트폴리오 리밸런싱을 위한 새로운 투자 전략을 생성하세요.
          </p>
          <Button className="w-full primary-gradient text-primary-foreground font-medium">
            전략 생성 시작하기
          </Button>
        </Card>
        
        <Card className="card-gradient p-6 border-0">
          <h3 className="font-semibold mb-3">기본 전략 템플릿</h3>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-neutral-light">
              <p className="font-medium">균등 분산 전략</p>
              <p className="text-sm text-muted-foreground">모든 종목에 동일한 비중으로 투자</p>
            </div>
            <div className="p-3 rounded-lg bg-neutral-light">
              <p className="font-medium">시가총액 가중 전략</p>
              <p className="text-sm text-muted-foreground">시가총액에 따른 비중 조정</p>
            </div>
          </div>
        </Card>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default StrategyCreate;