import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ChevronDown, ChevronUp, BarChart3, TrendingUp, Shield, Target } from "lucide-react";

interface MasterStrategy {
  strategy_code: string;
  strategy_name: string;
  risk_level: string;
  investment_style: string;
  description: string;
  keyword1: string;
  keyword2: string;
  keyword3: string;
}

interface CustomerProfile {
  riskScore: number;
  riskLevel: string;
  investmentStyle: string;
  tradingFrequency: string;
  description: string;
}

interface AnalysisResult {
  compatibilityScore: number;
  riskMatch: number;
  styleMatch: number;
  rebalancingScore: number;
  recommendations: string[];
  characteristics: {
    strengths: string[];
    concerns: string[];
    suitability: string;
  };
}

const StrategyCompare = () => {
  const [masterStrategies, setMasterStrategies] = useState<MasterStrategy[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<MasterStrategy | null>(null);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showAllStrategies, setShowAllStrategies] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  // 고객 성향 분석
  const analyzeCustomerProfile = async () => {
    try {
      // 실제로는 고객의 잔고와 매매내역을 분석해야 하지만, 현재는 mock 데이터 사용
      const mockProfile: CustomerProfile = {
        riskScore: 65, // 0-100 점수
        riskLevel: '중위험',
        investmentStyle: '성장투자',
        tradingFrequency: '보통',
        description: '안정적인 성장을 추구하면서도 적절한 수익률을 기대하는 균형잡힌 투자 성향'
      };
      
      setCustomerProfile(mockProfile);
    } catch (error) {
      console.error('고객 성향 분석 실패:', error);
      toast({
        title: "분석 오류",
        description: "고객 성향 분석에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  // 마스터 전략 조회
  const fetchMasterStrategies = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/balance/strategies/master`);
      if (response.ok) {
        const data = await response.json();
        setMasterStrategies(data);
      }
    } catch (error) {
      console.error('마스터 전략 조회 실패:', error);
    }
  };

  // 전략 상세 분석
  const analyzeStrategy = (strategy: MasterStrategy) => {
    if (!customerProfile) return;

    setIsAnalyzing(true);
    
    // Mock 분석 결과 생성
    setTimeout(() => {
      const riskLevelScore = getRiskLevelScore(strategy.risk_level, customerProfile.riskLevel);
      const styleScore = getStyleScore(strategy.investment_style, customerProfile.investmentStyle);
      const compatibilityScore = Math.round((riskLevelScore + styleScore) / 2);
      
      const mockAnalysis: AnalysisResult = {
        compatibilityScore,
        riskMatch: riskLevelScore,
        styleMatch: styleScore,
        rebalancingScore: Math.floor(Math.random() * 20) + 75, // 75-95
        recommendations: generateRecommendations(strategy, customerProfile),
        characteristics: generateCharacteristics(strategy, customerProfile, compatibilityScore)
      };

      setAnalysisResult(mockAnalysis);
      setIsAnalyzing(false);
    }, 1500);
  };

  // 위험 수준 매칭 점수 계산
  const getRiskLevelScore = (strategyRisk: string, customerRisk: string) => {
    const riskMapping: { [key: string]: number } = {
      '초저위험': 1, '저위험': 2, '중위험': 3, '고위험': 4, '초고위험': 5
    };
    
    const strategyLevel = riskMapping[strategyRisk] || 3;
    const customerLevel = riskMapping[customerRisk] || 3;
    const difference = Math.abs(strategyLevel - customerLevel);
    
    return Math.max(100 - (difference * 20), 0);
  };

  // 투자 스타일 매칭 점수 계산
  const getStyleScore = (strategyStyle: string, customerStyle: string) => {
    if (strategyStyle === customerStyle) return 100;
    
    const compatibleStyles: { [key: string]: string[] } = {
      '성장투자': ['배당투자', '테마/모멘텀'],
      '배당투자': ['가치투자', '성장투자'],
      '가치투자': ['배당투자', '지수추종'],
      '테마/모멘텀': ['성장투자'],
      '지수추종': ['가치투자', '배당투자']
    };
    
    if (compatibleStyles[customerStyle]?.includes(strategyStyle)) return 75;
    return 50;
  };

  // 추천사항 생성
  const generateRecommendations = (strategy: MasterStrategy, profile: CustomerProfile): string[] => {
    const recommendations = [];
    
    if (strategy.risk_level === profile.riskLevel) {
      recommendations.push("위험 수준이 고객님의 성향과 완벽하게 일치합니다.");
    } else {
      recommendations.push(`현재 ${strategy.risk_level} 전략으로, 고객님의 ${profile.riskLevel} 성향과 차이가 있습니다.`);
    }
    
    if (strategy.investment_style === profile.investmentStyle) {
      recommendations.push("투자 스타일이 고객님의 선호와 정확히 맞습니다.");
    } else {
      recommendations.push(`${strategy.investment_style} 방식으로, 다양한 투자 경험을 쌓을 수 있습니다.`);
    }
    
    recommendations.push("정기적인 리밸런싱을 통해 목표 수익률 달성이 가능합니다.");
    
    return recommendations;
  };

  // 특성 분석 생성
  const generateCharacteristics = (strategy: MasterStrategy, profile: CustomerProfile, score: number) => {
    const strengths = [];
    const concerns = [];
    
    if (score >= 80) {
      strengths.push("고객 성향과 높은 일치도");
      strengths.push("안정적인 포트폴리오 운용 가능");
      strengths.push("예상 수익률과 위험도의 균형");
    } else if (score >= 60) {
      strengths.push("적절한 분산 투자 효과");
      strengths.push("새로운 투자 경험 제공");
      concerns.push("일부 위험 수준 차이 존재");
    } else {
      concerns.push("고객 성향과 상당한 차이");
      concerns.push("신중한 검토 필요");
      strengths.push("포트폴리오 다양화 기회");
    }
    
    const suitability = score >= 80 ? "매우 적합" : score >= 60 ? "적합" : "신중 검토 필요";
    
    return { strengths, concerns, suitability };
  };

  // 초기 데이터 로드
  useEffect(() => {
    fetchMasterStrategies();
    analyzeCustomerProfile();
  }, []);

  const displayedStrategies = showAllStrategies ? masterStrategies : masterStrategies.slice(0, 3);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6 text-center">전략 비교 분석</h1>
        
        {/* 고객 성향 분석 결과 */}
        {customerProfile && (
          <Card className="p-6 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-full">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-blue-900">고객님의 투자 성향</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">위험 수준</p>
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                  {customerProfile.riskLevel}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">투자 스타일</p>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                  {customerProfile.investmentStyle}
                </Badge>
              </div>
            </div>
            
            <p className="text-sm text-gray-700">{customerProfile.description}</p>
          </Card>
        )}

        {/* 전략 목록 */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">카카오페이증권 추천 전략</h3>
            {masterStrategies.length > 3 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowAllStrategies(!showAllStrategies)}
                className="text-primary"
              >
                {showAllStrategies ? (
                  <>접기 <ChevronUp className="w-4 h-4 ml-1" /></>
                ) : (
                  <>모두보기 <ChevronDown className="w-4 h-4 ml-1" /></>
                )}
              </Button>
            )}
          </div>

          <div className="grid gap-4">
            {displayedStrategies.map((strategy) => (
              <Card 
                key={strategy.strategy_code}
                className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedStrategy?.strategy_code === strategy.strategy_code 
                    ? 'ring-2 ring-primary border-primary bg-primary/5' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => setSelectedStrategy(strategy)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-primary">{strategy.strategy_name}</h4>
                    <div className="flex gap-2 mt-2">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          strategy.risk_level === '초저위험' ? 'bg-blue-100 text-blue-800' :
                          strategy.risk_level === '저위험' ? 'bg-green-100 text-green-800' :
                          strategy.risk_level === '중위험' ? 'bg-yellow-100 text-yellow-800' :
                          strategy.risk_level === '고위험' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}
                      >
                        {strategy.risk_level}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {strategy.investment_style}
                      </Badge>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{strategy.description}</p>
                {(strategy.keyword1 || strategy.keyword2 || strategy.keyword3) && (
                  <div className="flex gap-1">
                    {[strategy.keyword1, strategy.keyword2, strategy.keyword3].filter(Boolean).map((keyword, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-primary/10 text-primary rounded">
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </Card>

        {/* 상세 분석 버튼 */}
        <Button 
          onClick={() => {
            if (!selectedStrategy) {
              toast({
                title: "포트폴리오를 선택해주세요",
                description: "상세 분석을 보려면 먼저 포트폴리오를 선택한 후 분석 버튼을 눌러주세요.",
                variant: "destructive",
              });
              return;
            }
            analyzeStrategy(selectedStrategy);
          }}
          disabled={isAnalyzing}
          className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 mb-6"
          size="lg"
        >
          {isAnalyzing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              분석 중...
            </div>
          ) : (
            <>
              <BarChart3 className="w-5 h-5 mr-2" />
              상세 분석 보기
            </>
          )}
        </Button>

        {/* 분석 결과 */}
        {analysisResult && selectedStrategy && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              {selectedStrategy.strategy_name} 분석 결과
            </h3>

            {/* 호환성 점수 */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">전체 호환성 점수</span>
                <span className={`text-2xl font-bold ${
                  analysisResult.compatibilityScore >= 80 ? 'text-green-600' :
                  analysisResult.compatibilityScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {analysisResult.compatibilityScore}점
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-1000 ${
                    analysisResult.compatibilityScore >= 80 ? 'bg-green-500' :
                    analysisResult.compatibilityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${analysisResult.compatibilityScore}%` }}
                />
              </div>
            </div>

            {/* 세부 점수 */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{analysisResult.riskMatch}</div>
                <div className="text-sm text-gray-600">위험도 일치</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{analysisResult.styleMatch}</div>
                <div className="text-sm text-gray-600">스타일 일치</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{analysisResult.rebalancingScore}</div>
                <div className="text-sm text-gray-600">리밸런싱 효과</div>
              </div>
            </div>

            {/* 특성 분석 */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                포트폴리오 특성 분석
              </h4>
              
              <div className="grid gap-4">
                {analysisResult.characteristics.strengths.length > 0 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="font-medium text-green-800 mb-2">강점</p>
                    <ul className="text-sm text-green-700 space-y-1">
                      {analysisResult.characteristics.strengths.map((strength, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {analysisResult.characteristics.concerns.length > 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="font-medium text-amber-800 mb-2">고려사항</p>
                    <ul className="text-sm text-amber-700 space-y-1">
                      {analysisResult.characteristics.concerns.map((concern, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                          {concern}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-medium text-blue-800">
                  적합성 평가: <span className="font-bold">{analysisResult.characteristics.suitability}</span>
                </p>
              </div>
            </div>

            {/* 추천사항 */}
            <div>
              <h4 className="font-semibold mb-3">맞춤 추천사항</h4>
              <ul className="space-y-2">
                {analysisResult.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        )}
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default StrategyCompare;