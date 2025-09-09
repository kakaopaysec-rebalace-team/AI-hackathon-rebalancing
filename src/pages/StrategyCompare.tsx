import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BottomNavigation } from "@/components/BottomNavigation";
import { TrendingUp, TrendingDown } from "lucide-react";

const StrategyCompare = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6 text-center">전략 비교</h1>
        
        <Card className="card-gradient p-6 mb-4 border-0">
          <h2 className="text-lg font-semibold mb-4">전략 성과 비교</h2>
          
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-success/10 border border-success/20">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">균등 분산 전략</p>
                  <p className="text-sm text-muted-foreground">1년 수익률</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-success font-medium">
                    <TrendingUp size={16} />
                    <span>+12.5%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-danger/10 border border-danger/20">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">시가총액 가중 전략</p>
                  <p className="text-sm text-muted-foreground">1년 수익률</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-danger font-medium">
                    <TrendingDown size={16} />
                    <span>-2.3%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">현재 포트폴리오</p>
                  <p className="text-sm text-muted-foreground">1년 수익률</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-success font-medium">
                    <TrendingUp size={16} />
                    <span>+8.7%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        <Button className="w-full primary-gradient text-primary-foreground font-medium">
          상세 분석 보기
        </Button>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default StrategyCompare;