import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  TrendingUp, 
  Shield, 
  Target, 
  Trash2,
  AlertTriangle,
  CheckCircle,
  Settings,
  Calendar,
  BarChart3
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { Link } from 'react-router-dom';
import AdminNavigation from '@/components/admin/AdminNavigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface RegisteredPortfolio {
  rebalancing_strategy_code: string;
  rebalancing_name: string;
  rebalancing_description: string;
  risk_level: string;
  investment_style: string;
  keyword1: string;
  keyword2: string;
  keyword3: string;
  created_at: string;
  updated_at: string;
  customer_count: number; // 이 전략을 사용하는 고객 수
}

interface PortfolioStats {
  totalStrategies: number;
  appliedCustomers: number;
}

const PortfolioManagement = () => {
  // 상태 관리
  const [portfolios, setPortfolios] = useState<RegisteredPortfolio[]>([]);
  const [stats, setStats] = useState<PortfolioStats>({ totalStrategies: 0, appliedCustomers: 0 });
  const [selectedPortfolios, setSelectedPortfolios] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // 통계 조회
  const fetchStats = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/portfolio/stats`);
      if (response.ok) {
        const result = await response.json();
        setStats(result.data);
      }
    } catch (error) {
      console.error('통계 조회 실패:', error);
    }
  };

  // 포트폴리오 목록 조회
  const fetchPortfolios = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/portfolio/strategies`);
      if (response.ok) {
        const result = await response.json();
        setPortfolios(result.data);
      }
    } catch (error) {
      console.error('포트폴리오 목록 조회 실패:', error);
      toast.error('포트폴리오 목록을 불러오는데 실패했습니다.');
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchStats(), fetchPortfolios()]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  // 체크박스 선택/해제
  const handlePortfolioSelect = (strategyCode: string, checked: boolean) => {
    const newSelected = new Set(selectedPortfolios);
    if (checked) {
      newSelected.add(strategyCode);
    } else {
      newSelected.delete(strategyCode);
    }
    setSelectedPortfolios(newSelected);
  };

  // 전체 선택/해제
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPortfolios(new Set(portfolios.map(p => p.rebalancing_strategy_code)));
    } else {
      setSelectedPortfolios(new Set());
    }
  };

  // 위험도별 배지 색상
  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case '초고위험': return 'bg-red-100 text-red-800 border-red-300';
      case '고위험': return 'bg-red-100 text-red-800 border-red-300';
      case '중위험': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case '저위험': return 'bg-green-100 text-green-800 border-green-300';
      case '초저위험': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // 투자스타일별 아이콘
  const getStyleIcon = (style: string) => {
    switch (style) {
      case '성장투자': return TrendingUp;
      case '가치투자': return Target;
      case '배당투자': return Shield;
      case '지수추종': return BarChart3;
      case '단기/스윙': return TrendingUp;
      case '퀀트/시스템트레이딩': return Settings;
      case '테마/모멘텀': return TrendingUp;
      default: return Target;
    }
  };

  // 전략 상태 토글
  const togglePortfolioStatus = async (strategyCode: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/portfolio/strategies/${strategyCode}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchPortfolios();
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('전략 상태 변경 실패:', error);
      toast.error('전략 상태 변경에 실패했습니다.');
    }
  };

  // 선택된 포트폴리오 삭제
  const handleDeleteSelected = async () => {
    setIsDeleting(true);
    
    try {
      const strategyCodes = Array.from(selectedPortfolios);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/portfolio/strategies`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ strategyCodes }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        await Promise.all([fetchStats(), fetchPortfolios()]);
        setSelectedPortfolios(new Set());
        toast.success(result.message);
      } else {
        toast.error(result.message);
        if (result.data?.strategiesInUse) {
          console.log('사용 중인 전략들:', result.data.strategiesInUse);
        }
      }
    } catch (error) {
      console.error('전략 삭제 실패:', error);
      toast.error('전략 삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <AdminNavigation />
        
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">포트폴리오 관리</h1>
          <p className="text-gray-600">등록된 포트폴리오 전략을 관리하고 고객 적용 상태를 확인합니다</p>
        </div>

        {/* 요약 통계 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {isLoading ? '-' : stats.totalStrategies}
                  </div>
                  <div className="text-sm text-gray-600">전체 전략</div>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {isLoading ? '-' : stats.appliedCustomers}
                  </div>
                  <div className="text-sm text-gray-600">적용 고객</div>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-600">{selectedPortfolios.size}</div>
                  <div className="text-sm text-gray-600">선택된 전략</div>
                </div>
                <Settings className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 전략 목록 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>등록된 포트폴리오 전략</CardTitle>
                <CardDescription>AI가 생성하여 검토 후 등록된 전략들을 관리할 수 있습니다</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                {selectedPortfolios.size > 0 ? (
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      {selectedPortfolios.size}개 선택됨
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          disabled={isDeleting}
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 shadow-md font-medium"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          선택 삭제
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="max-w-md">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-xl font-bold text-red-600">
                            <Trash2 className="w-6 h-6 inline mr-2" />
                            전략 삭제 확인
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-base">
                            선택한 <span className="font-bold text-blue-600">{selectedPortfolios.size}개</span>의 전략을 삭제하시겠습니까?
                            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <div className="font-medium text-amber-800">주의사항</div>
                                  <div className="text-sm text-amber-700 mt-1">
                                    고객이 사용 중인 전략은 삭제할 수 없습니다.
                                  </div>
                                </div>
                              </div>
                            </div>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200">
                            취소
                          </AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleDeleteSelected} 
                            className="bg-red-600 hover:bg-red-700 shadow-md"
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                삭제 중...
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4 mr-2" />
                                삭제
                              </>
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled
                    className="opacity-50 cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    선택 삭제
                  </Button>
                )}
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedPortfolios.size === portfolios.length && portfolios.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm text-gray-600">전체 선택</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                  <div className="text-gray-600">전략 목록을 불러오는 중...</div>
                </div>
              ) : portfolios.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <div className="text-gray-600 mb-2">등록된 전략이 없습니다</div>
                  <div className="text-sm text-gray-500">새로운 포트폴리오 전략을 생성해보세요</div>
                </div>
              ) : (
                portfolios.map((portfolio) => {
                const StyleIcon = getStyleIcon(portfolio.investment_style);
                const isSelected = selectedPortfolios.has(portfolio.rebalancing_strategy_code);
                const canDelete = portfolio.customer_count === 0;
                
                return (
                    <div 
                      key={portfolio.rebalancing_strategy_code} 
                      className={`border rounded-lg transition-all duration-200 hover:shadow-lg ${
                        isSelected ? 'border-blue-400 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => 
                              handlePortfolioSelect(portfolio.rebalancing_strategy_code, checked as boolean)
                            }
                          />
                          <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-lg">
                            <StyleIcon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{portfolio.rebalancing_name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{portfolio.rebalancing_description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                            등록된 전략
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">전략 코드:</span>
                          <span className="text-sm text-gray-900">{portfolio.rebalancing_strategy_code}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">위험도:</span>
                          <Badge className={getRiskBadgeColor(portfolio.risk_level)}>
                            {portfolio.risk_level}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">투자스타일:</span>
                          <span className="text-sm text-gray-600">{portfolio.investment_style}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {new Date(portfolio.created_at).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">키워드:</span>
                            <div className="flex gap-2">
                              {portfolio.keyword1 && <Badge variant="outline" className="text-xs">#{portfolio.keyword1}</Badge>}
                              {portfolio.keyword2 && <Badge variant="outline" className="text-xs">#{portfolio.keyword2}</Badge>}
                              {portfolio.keyword3 && <Badge variant="outline" className="text-xs">#{portfolio.keyword3}</Badge>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">적용 고객:</span>
                            <span className={`text-sm font-bold ${
                              portfolio.customer_count > 0 ? 'text-blue-600' : 'text-gray-500'
                            }`}>
                              {portfolio.customer_count}명
                            </span>
                            {portfolio.customer_count > 0 && !canDelete && (
                              <AlertTriangle className="w-4 h-4 text-orange-500" title="고객 사용 중 - 삭제 불가" />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/admin/strategy-detail/${portfolio.rebalancing_strategy_code}`}>
                              상세보기
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PortfolioManagement;