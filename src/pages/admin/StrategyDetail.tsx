import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  TrendingUp, 
  Shield, 
  Target, 
  BarChart3,
  PieChart,
  Calendar,
  Brain,
  FileText,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminNavigation from '@/components/admin/AdminNavigation';

interface StrategyDetail {
  strategy_code: string;
  strategy_name: string;
  risk_level: string;
  investment_style: string;
  description: string;
  keyword1: string;
  keyword2: string;
  keyword3: string;
  type: string;
  createdAt: string;
  status: string;
  // 상세 정보
  portfolio_composition: {
    stock_code: string;
    stock_name: string;
    weight: number;
    sector: string;
  }[];
  expected_return: number;
  expected_volatility: number;
  sharpe_ratio: number;
  max_drawdown: number;
  rebalancing_frequency: string;
  sector_allocation: {
    sector: string;
    weight: number;
    color: string;
  }[];
  risk_metrics: {
    var_95: number;
    beta: number;
    correlation_kospi: number;
  };
  backtest_performance: {
    period: string;
    return: number;
    volatility: number;
    max_drawdown: number;
  }[];
  ai_analysis: {
    strengths: string[];
    weaknesses: string[];
    market_conditions: string[];
    recommendations: string[];
  };
}

const StrategyDetail = () => {
  const navigate = useNavigate();
  
  // Mock 상세 데이터
  const strategyDetail: StrategyDetail = {
    strategy_code: 'CST001',
    strategy_name: 'CST_Technology_Focus_20250911_001',
    risk_level: '고위험',
    investment_style: '성장투자',
    description: 'AI 및 반도체 중심의 기술주 포트폴리오로 높은 성장성을 추구하는 전략',
    keyword1: '기술주',
    keyword2: '반도체',
    keyword3: 'AI',
    type: 'CST',
    createdAt: '2025-09-11 14:30:00',
    status: '완료',
    portfolio_composition: [
      { stock_code: '005930', stock_name: '삼성전자', weight: 25.0, sector: 'IT' },
      { stock_code: '000660', stock_name: 'SK하이닉스', weight: 20.0, sector: 'IT' },
      { stock_code: '035420', stock_name: 'NAVER', weight: 15.0, sector: 'IT서비스' },
      { stock_code: '035720', stock_name: '카카오', weight: 12.0, sector: 'IT서비스' },
      { stock_code: '051910', stock_name: 'LG화학', weight: 10.0, sector: '화학' },
      { stock_code: '006400', stock_name: '삼성SDI', weight: 8.0, sector: '배터리' },
      { stock_code: '096770', stock_name: 'SK이노베이션', weight: 7.0, sector: '에너지' },
      { stock_code: '018260', stock_name: '삼성에스디에스', weight: 3.0, sector: 'IT서비스' }
    ],
    expected_return: 18.5,
    expected_volatility: 24.2,
    sharpe_ratio: 0.76,
    max_drawdown: -32.1,
    rebalancing_frequency: '월간',
    sector_allocation: [
      { sector: 'IT', weight: 45.0, color: '#3B82F6' },
      { sector: 'IT서비스', weight: 30.0, color: '#8B5CF6' },
      { sector: '화학', weight: 10.0, color: '#10B981' },
      { sector: '배터리', weight: 8.0, color: '#F59E0B' },
      { sector: '에너지', weight: 7.0, color: '#EF4444' }
    ],
    risk_metrics: {
      var_95: -4.2,
      beta: 1.35,
      correlation_kospi: 0.78
    },
    backtest_performance: [
      { period: '1년', return: 22.3, volatility: 28.1, max_drawdown: -18.5 },
      { period: '2년', return: 15.8, volatility: 25.9, max_drawdown: -25.2 },
      { period: '3년', return: 18.7, volatility: 24.8, max_drawdown: -32.1 }
    ],
    ai_analysis: {
      strengths: [
        '기술주 중심의 높은 성장 잠재력',
        '4차 산업혁명 테마 집중 투자',
        '대형주 중심으로 안정적인 유동성 확보',
        '반도체 업사이클 수혜 기대'
      ],
      weaknesses: [
        '기술주 집중으로 인한 섹터 편중 위험',
        '글로벌 경기 둔화시 큰 변동성',
        '금리 상승에 민감한 성장주 위주 구성',
        '중국 리스크 등 지정학적 영향 노출'
      ],
      market_conditions: [
        '저금리 환경에서 유리한 성장주 전략',
        '디지털 전환 가속화 트렌드 수혜',
        'ESG 투자 확산으로 일부 종목 수혜',
        '반도체 슈퍼사이클 진입 기대'
      ],
      recommendations: [
        '시장 변동성이 큰 시기에는 비중 조절 고려',
        '섹터 다변화를 통한 위험 분산 검토',
        '정기적인 리밸런싱으로 목표 비중 유지',
        '거시경제 지표 모니터링 강화 필요'
      ]
    }
  };

  // 투자스타일별 아이콘
  const getStyleIcon = (style: string) => {
    switch (style) {
      case '성장투자': return TrendingUp;
      case '가치투자': return Target;
      case '배당투자': return Shield;
      default: return Target;
    }
  };

  // 위험도별 배지 색상
  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case '고위험': return 'bg-red-100 text-red-800 border-red-300';
      case '중위험': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case '저위험': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // 전략 타입별 배지 색상
  const getStrategyBadgeColor = (type: string) => {
    switch (type) {
      case 'CST': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'FAI': return 'bg-green-100 text-green-800 border-green-300';
      case 'WEB': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'DOC': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const StyleIcon = getStyleIcon(strategyDetail.investment_style);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <AdminNavigation />
        
        {/* 뒤로가기와 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/admin/strategy-learning')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              전략 목록으로
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-lg">
                <StyleIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{strategyDetail.strategy_name}</h1>
                <p className="text-gray-600">{strategyDetail.description}</p>
              </div>
            </div>
          </div>
          
          {/* 전략 적용 버튼 */}
          <div className="flex items-center gap-3">
            <Badge className={strategyDetail.status === '완료' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
              {strategyDetail.status}
            </Badge>
            {strategyDetail.status === '완료' && (
              <Button className="bg-blue-600 hover:bg-blue-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                전략 적용하기
              </Button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* 메인 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 기본 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  전략 기본 정보
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">전략 코드:</span>
                        <span className="text-gray-900">{strategyDetail.strategy_code}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">생성 타입:</span>
                        <Badge className={getStrategyBadgeColor(strategyDetail.type)}>
                          {strategyDetail.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">위험도:</span>
                        <Badge className={getRiskBadgeColor(strategyDetail.risk_level)}>
                          {strategyDetail.risk_level}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">투자스타일:</span>
                        <span className="text-gray-900">{strategyDetail.investment_style}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">생성일시:</span>
                        <span className="text-gray-900">{strategyDetail.createdAt}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">리밸런싱:</span>
                        <span className="text-gray-900">{strategyDetail.rebalancing_frequency}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">키워드:</span>
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-xs">#{strategyDetail.keyword1}</Badge>
                          <Badge variant="outline" className="text-xs">#{strategyDetail.keyword2}</Badge>
                          <Badge variant="outline" className="text-xs">#{strategyDetail.keyword3}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 포트폴리오 구성 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  포트폴리오 구성
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {strategyDetail.portfolio_composition.map((stock) => (
                    <div key={stock.stock_code} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{stock.stock_name}</span>
                        <span className="text-sm text-gray-600">({stock.stock_code})</span>
                        <Badge variant="outline" className="text-xs">{stock.sector}</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={stock.weight} className="w-20" />
                        <span className="font-medium text-sm w-12 text-right">{stock.weight}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 섹터 배분 */}
            <Card>
              <CardHeader>
                <CardTitle>섹터별 배분</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {strategyDetail.sector_allocation.map((sector) => (
                    <div key={sector.sector} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: sector.color }}
                        />
                        <span className="font-medium">{sector.sector}</span>
                      </div>
                      <span className="font-medium">{sector.weight}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI 분석 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI 분석 결과
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      강점
                    </h4>
                    <ul className="space-y-2">
                      {strategyDetail.ai_analysis.strengths.map((strength, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      주의사항
                    </h4>
                    <ul className="space-y-2">
                      {strategyDetail.ai_analysis.weaknesses.map((weakness, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-red-500 mt-1">•</span>
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div>
                  <h4 className="font-semibold text-blue-700 mb-3">투자 권고사항</h4>
                  <ul className="space-y-2">
                    {strategyDetail.ai_analysis.recommendations.map((recommendation, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        {recommendation}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 핵심 지표 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  핵심 지표
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">기대수익률</span>
                    <span className="font-bold text-green-600">+{strategyDetail.expected_return}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">기대변동성</span>
                    <span className="font-bold text-orange-600">{strategyDetail.expected_volatility}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">샤프비율</span>
                    <span className="font-bold text-blue-600">{strategyDetail.sharpe_ratio}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">최대손실</span>
                    <span className="font-bold text-red-600">{strategyDetail.max_drawdown}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 위험 지표 */}
            <Card>
              <CardHeader>
                <CardTitle>위험 지표</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">VaR (95%)</span>
                  <span className="font-bold">{strategyDetail.risk_metrics.var_95}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">베타</span>
                  <span className="font-bold">{strategyDetail.risk_metrics.beta}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">코스피 상관관계</span>
                  <span className="font-bold">{strategyDetail.risk_metrics.correlation_kospi}</span>
                </div>
              </CardContent>
            </Card>

            {/* 백테스트 성과 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  백테스트 성과
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {strategyDetail.backtest_performance.map((perf) => (
                    <div key={perf.period} className="border rounded-lg p-3">
                      <div className="font-medium text-center mb-2">{perf.period}</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">수익률</span>
                          <span className="font-medium text-green-600">+{perf.return}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">변동성</span>
                          <span className="font-medium">{perf.volatility}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">최대손실</span>
                          <span className="font-medium text-red-600">{perf.max_drawdown}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategyDetail;