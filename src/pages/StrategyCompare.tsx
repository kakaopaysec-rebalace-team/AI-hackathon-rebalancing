import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Target, PieChart, BarChart3 } from "lucide-react";
import { useState } from "react";

const StrategyCompare = () => {
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);

  // 임시 데이터 - 고객 성향 분석
  const customerProfile = {
    riskTolerance: "균형",
    investmentPeriod: "장기 (5년 이상)",
    preferredStyle: "성장형",
    targetReturn: 8.5
  };

  const portfolioAnalysis = {
    currentRisk: "적극적",
    currentStyle: "성장형",
    volatility: 18.2,
    expectedReturn: 9.8,
    matchScore: 73
  };

  const detailScores = [
    { category: "위험도 일치", score: 68, description: "고객 성향보다 약간 높은 위험도" },
    { category: "투자 스타일", score: 95, description: "성장형 스타일 완벽 일치" },
    { category: "기대 수익률", score: 82, description: "목표 수익률 대비 적정 수준" },
    { category: "변동성", score: 58, description: "변동성이 고객 성향보다 높음" }
  ];
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
        
        <Button 
          className="w-full primary-gradient text-primary-foreground font-medium mb-4"
          onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
        >
          {showDetailedAnalysis ? '간단히 보기' : '상세 분석 보기'}
        </Button>

        {showDetailedAnalysis && (
          <div className="space-y-4">
            {/* 전체 일치도 점수 */}
            <Card className="card-gradient p-6 border-0">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="text-primary" size={24} />
                  <h2 className="text-lg font-semibold">성향 일치도</h2>
                </div>
                <div className="text-4xl font-bold text-primary mb-2">
                  {portfolioAnalysis.matchScore}점
                </div>
                <p className="text-sm text-muted-foreground">
                  고객 투자 성향과 현재 포트폴리오의 일치도입니다
                </p>
              </div>
              
              <Progress value={portfolioAnalysis.matchScore} className="mb-4" />
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">권장 등급</p>
                  <p className="font-medium">{customerProfile.riskTolerance}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">현재 등급</p>
                  <p className="font-medium">{portfolioAnalysis.currentRisk}</p>
                </div>
              </div>
            </Card>

            {/* 세부 점수 */}
            <Card className="card-gradient p-6 border-0">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="text-primary" size={20} />
                <h3 className="font-semibold">세부 분석</h3>
              </div>
              
              <div className="space-y-4">
                {detailScores.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{item.category}</span>
                      <span className="text-sm text-primary font-medium">{item.score}점</span>
                    </div>
                    <Progress value={item.score} className="h-2" />
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* 포트폴리오 비교 */}
            <Card className="card-gradient p-6 border-0">
              <div className="flex items-center gap-2 mb-4">
                <PieChart className="text-primary" size={20} />
                <h3 className="font-semibold">포트폴리오 특성 비교</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">고객 선호</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs">위험도</span>
                      <span className="text-xs font-medium">{customerProfile.riskTolerance}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs">투자기간</span>
                      <span className="text-xs font-medium">{customerProfile.investmentPeriod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs">투자스타일</span>
                      <span className="text-xs font-medium">{customerProfile.preferredStyle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs">목표수익률</span>
                      <span className="text-xs font-medium">{customerProfile.targetReturn}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">현재 포트폴리오</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs">위험도</span>
                      <span className="text-xs font-medium">{portfolioAnalysis.currentRisk}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs">변동성</span>
                      <span className="text-xs font-medium">{portfolioAnalysis.volatility}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs">투자스타일</span>
                      <span className="text-xs font-medium">{portfolioAnalysis.currentStyle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs">기대수익률</span>
                      <span className="text-xs font-medium">{portfolioAnalysis.expectedReturn}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* 리밸런싱 추천 */}
            <Card className="card-gradient p-6 border-0">
              <h3 className="font-semibold mb-3">리밸런싱 추천</h3>
              <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                <p className="text-sm mb-2">
                  <strong>추천사항:</strong> 고위험 자산 비중을 15% 줄이고 안정적인 채권 비중을 늘려 
                  고객 성향에 맞는 균형 포트폴리오로 조정하는 것을 권장합니다.
                </p>
                <p className="text-xs text-muted-foreground">
                  예상 효과: 변동성 감소 (-5.2%), 성향 일치도 상승 (+22점)
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default StrategyCompare;