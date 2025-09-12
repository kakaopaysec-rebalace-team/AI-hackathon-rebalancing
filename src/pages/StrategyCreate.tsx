import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BottomNavigation } from "@/components/BottomNavigation";
import { EditablePortfolioComposition } from "@/components/EditablePortfolioComposition";
import { PortfolioComposition } from "@/components/PortfolioComposition";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useHoldingStocks } from "@/hooks/useBalance";

const StrategyCreate = () => {
  const { data: holdingStocks, isLoading } = useHoldingStocks();
  const [composition, setComposition] = useState<any[]>([]);
  const [masterStrategies, setMasterStrategies] = useState<any[]>([]);
  const [showAllStrategies, setShowAllStrategies] = useState(false);
  const [selectedStrategyType, setSelectedStrategyType] = useState<string>('');
  const [rebalancingCycle, setRebalancingCycle] = useState(90); // 분기별 = 90일
  const [allowedDeviation, setAllowedDeviation] = useState(5.0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [customerStrategy, setCustomerStrategy] = useState<any>(null);
  const [customerStrategyLoading, setCustomerStrategyLoading] = useState(false);
  const animationRef = useRef<number>();
  const { toast } = useToast();

  // 기본으로 보여줄 2개 전략 필터링 함수 (균등전략 제외)
  const getDefaultStrategies = () => {
    const lowRisk = masterStrategies.find(strategy => strategy.risk_level === '저위험');
    const veryHighRisk = masterStrategies.find(strategy => strategy.risk_level === '초고위험');
    
    const result = [];
    if (lowRisk) result.push(lowRisk);
    if (veryHighRisk) result.push(veryHighRisk);
    
    return result; // 저위험 1개 + 초고위험 1개 = 총 2개
  };

  // 실제 보유종목 데이터로 초기 구성 설정
  useEffect(() => {
    if (holdingStocks) {
      const initialData = holdingStocks.map(stock => ({
        symbol: stock.stockCode,
        name: stock.stockName,
        value: stock.marketValue,
        percentage: stock.weight,
        color: ''
      }));
      setComposition(initialData);
    }
  }, [holdingStocks]);

  // 마스터 전략 데이터 로드
  useEffect(() => {
    const fetchMasterStrategies = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/balance/strategies/master`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setMasterStrategies(data);
        } else {
          console.error('마스터 전략 데이터 형식 오류:', data);
        }
      } catch (error) {
        console.error('마스터 전략 로드 오류:', error);
        toast({
          title: "전략 로드 실패",
          description: "마스터 전략을 불러오는 데 실패했습니다.",
          variant: "destructive",
        });
      }
    };
    
    fetchMasterStrategies();
  }, []);

  // 고객 전략 데이터 로드
  useEffect(() => {
    const fetchCustomerStrategy = async () => {
      setCustomerStrategyLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/balance/strategies/customer`);
        const data = await response.json();
        console.log('🔍 고객 전략 API 응답:', data);
        console.log('🔍 리밸런싱 주기:', data.rebalancing_cycle);
        console.log('🔍 허용편차:', data.allowed_deviation);
        setCustomerStrategy(data);
        
        // 저장된 전략의 리밸런싱 설정을 UI에 반영
        if (data.rebalancing_cycle) {
          setRebalancingCycle(data.rebalancing_cycle);
        }
        if (data.allowed_deviation) {
          setAllowedDeviation(parseFloat(data.allowed_deviation));
        }
      } catch (error) {
        console.error('고객 전략 로드 오류:', error);
        setCustomerStrategy(null);
      } finally {
        setCustomerStrategyLoading(false);
      }
    };
    
    fetchCustomerStrategy();
  }, []);

  const handleCompositionChange = (newComposition: typeof initialComposition) => {
    setComposition(newComposition);
    
    // 사용자가 수동으로 편집한 경우 '사용자 정의 전략'으로 설정
    setSelectedStrategyType('custom');
    
    toast({
      title: "포트폴리오 구성이 업데이트되었습니다",
      description: "사용자 정의 전략으로 변경되었습니다.",
    });
  };

  const handleSaveStrategy = async () => {
    try {
      // 포트폴리오 비중을 백엔드 형식으로 변환
      const portfolioWeights = composition.map(item => ({
        stockCode: item.symbol,
        targetWeight: item.percentage
      }));

      // 선택된 전략 타입에 따라 전략 코드와 타입 결정
      let strategyCode, strategyType;
      
      if (selectedStrategyType === 'custom') {
        // 사용자가 수동 편집한 경우 - 사용자 정의 전략으로 저장
        strategyCode = `CUSTOM_${Date.now()}`;
        strategyType = 'custom';
      } else if (selectedStrategyType && selectedStrategyType !== '') {
        // 마스터 전략이 선택된 경우
        const selectedStrategy = masterStrategies.find(s => s.strategy_code === selectedStrategyType);
        if (selectedStrategy) {
          strategyCode = selectedStrategy.strategy_code;
          strategyType = 'master';
        } else {
          // 선택된 전략을 찾을 수 없는 경우 커스텀으로 처리
          strategyCode = `CUSTOM_${Date.now()}`;
          strategyType = 'custom';
        }
      } else {
        // 전략이 선택되지 않은 경우 커스텀 전략으로 저장
        strategyCode = `CUSTOM_${Date.now()}`;
        strategyType = 'custom';
      }

      const strategyData = {
        strategyCode: strategyCode,
        strategyType: strategyType,
        rebalancingCycle: rebalancingCycle,
        allowedDeviation: allowedDeviation,
        portfolioWeights: portfolioWeights
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/balance/strategies/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(strategyData)
      });

      const result = await response.json();

      if (result.success) {
        // 전략 저장 후 고객 전략 다시 로드
        const customerResponse = await fetch(`${import.meta.env.VITE_API_URL}/balance/strategies/customer`);
        const customerData = await customerResponse.json();
        console.log('💾 전략 저장 후 reload - 고객 전략 데이터:', customerData);
        setCustomerStrategy(customerData);
        
        // 저장된 설정을 상태에 동기화
        if (customerData.rebalancing_cycle) {
          setRebalancingCycle(customerData.rebalancing_cycle);
        }
        if (customerData.allowed_deviation) {
          setAllowedDeviation(parseFloat(customerData.allowed_deviation));
        }
        
        toast({
          title: "전략이 저장되었습니다",
          description: "리밸런싱 전략이 성공적으로 저장되었습니다. 잔고 탭에서 리밸런싱을 활성화할 수 있습니다.",
          duration: 4000,
        });
      } else {
        throw new Error(result.error || '전략 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('전략 저장 오류:', error);
      toast({
        title: "전략 저장 실패",
        description: error instanceof Error ? error.message : "전략 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const normalizeWeights = (weights: number[]): number[] => {
    // NULL 값을 0으로 대체
    const cleanWeights = weights.map(weight => weight || 0);
    const total = cleanWeights.reduce((sum, weight) => sum + weight, 0);
    
    if (total === 0) {
      // 모든 비중이 0인 경우 균등 분산으로 처리
      return new Array(weights.length).fill(100 / weights.length);
    }
    
    // 모든 종목을 100%가 되도록 정규화 (0% 매도 없음)
    const normalized = cleanWeights.map(weight => (weight / total) * 100);
    
    // 정확히 100%가 되도록 마지막 요소에서 반올림 오차 조정
    const currentSum = normalized.reduce((sum, weight) => sum + weight, 0);
    const diff = 100 - currentSum;
    
    if (Math.abs(diff) > 0.001) {
      normalized[normalized.length - 1] += diff;
    }
    
    return normalized;
  };

  const calculatePortfolioValue = (originalComposition: any[], newPercentages: number[]) => {
    const totalCurrentValue = originalComposition.reduce((sum, item) => sum + item.value, 0);
    return newPercentages.map(percentage => (totalCurrentValue * percentage) / 100);
  };

  // 애니메이션 함수: 부드러운 비중 변화
  // 종목별 우선순위 함수들
  const getConservativePriority = (stockName: string): number => {
    const name = stockName.toLowerCase();
    if (name.includes('삼성전자')) return 1;
    if (name.includes('kb금융')) return 2;
    if (name.includes('카카오뱅크')) return 3;
    if (name.includes('카카오페이')) return 4;
    if (name.includes('sk하이닉스')) return 5;
    if (name.includes('naver')) return 6;
    if (name.includes('sk텔레콤')) return 7;
    if (name.includes('하나금융')) return 8;
    return 99;
  };

  const getGrowthPriority = (stockName: string): number => {
    const name = stockName.toLowerCase();
    if (name.includes('카카오페이')) return 1;  // 모멘텀 최우선
    if (name.includes('lg에너지솔루션')) return 2;
    if (name.includes('에코프로비엠')) return 3;
    if (name.includes('엔씨소프트')) return 4;
    if (name.includes('삼성바이오로직스')) return 5;
    if (name.includes('셀트리온')) return 6;
    if (name.includes('카카오뱅크')) return 7;
    if (name.includes('카카오')) return 8;
    return 99;
  };

  const getValuePriority = (stockName: string): number => {
    const name = stockName.toLowerCase();
    if (name.includes('삼성전자')) return 1;
    if (name.includes('sk하이닉스')) return 2;
    if (name.includes('lg화학')) return 3;
    if (name.includes('lg전자')) return 4;
    if (name.includes('기아')) return 5;
    if (name.includes('posco홀딩스')) return 6;
    if (name.includes('sk이노베이션')) return 7;
    if (name.includes('삼성전기')) return 8;
    if (name.includes('naver')) return 9;
    return 99;
  };

  const getDividendPriority = (stockName: string): number => {
    const name = stockName.toLowerCase();
    if (name.includes('kb금융')) return 1;
    if (name.includes('신한지주')) return 2;
    if (name.includes('하나금융')) return 3;
    if (name.includes('sk텔레콤')) return 4;
    if (name.includes('삼성전자')) return 5;
    if (name.includes('posco홀딩스')) return 6;
    if (name.includes('sk이노베이션')) return 7;
    if (name.includes('기아')) return 8;
    if (name.includes('lg화학')) return 9;
    return 99;
  };

  const animateCompositionChange = (fromComposition: any[], toComposition: any[], duration: number = 1500) => {
    setIsAnimating(true);
    const startTime = Date.now();
    
    // 애니메이션 중간값 계산
    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // easeInOutCubic 함수로 부드러운 애니메이션
      const easeProgress = progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      
      // 중간값 계산
      const interpolatedComposition = fromComposition.map((fromItem, index) => {
        const toItem = toComposition[index];
        return {
          ...fromItem,
          percentage: fromItem.percentage + (toItem.percentage - fromItem.percentage) * easeProgress,
          value: fromItem.value + (toItem.value - fromItem.value) * easeProgress
        };
      });
      
      setComposition(interpolatedComposition);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setComposition(toComposition);
        setIsAnimating(false);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  };

  // 컴포넌트 언마운트 시 애니메이션 정리
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const handleStrategySelect = async (strategyType: string) => {
    let newComposition;
    let strategyName = "";
    let targetWeights: number[] = [];
    
    // 모든 종목에 기본적으로 0% 할당 (NULL 방지)
    targetWeights = new Array(composition.length).fill(0);
    
    if (strategyType === "equal") {
      // 균등 분산: 모든 종목 동일 비중
      const equalWeight = 100 / composition.length;
      targetWeights = targetWeights.map(() => equalWeight);
      strategyName = "균등 분산 전략";
    } else {
      // 마스터 전략인 경우
      const selectedStrategy = masterStrategies.find(s => s.strategy_code === strategyType);
      if (selectedStrategy) {
        strategyName = selectedStrategy.strategy_name;
        
        // 실제 한국 주식 20개에 맞춘 전략별 비중 설정
        // 종목 인덱스 기준 (현재 데이터 순서):
        // 0: LG화학, 1: LG전자, 2: LG에너지솔루션, 3: KB금융, 4: 카카오뱅크,
        // 5: 신한지주, 6: 에코프로비엠, 7: 삼성전기, 8: 기아, 9: 삼성전자,
        // 10: POSCO홀딩스, 11: SK이노베이션, 12: 하나금융지주, 13: 카카오,
        // 14: SK텔레콤, 15: 셀트리온, 16: NAVER, 17: 삼성바이오로직스, 18: 엔씨소프트, 19: SK하이닉스
        
        if (selectedStrategy.risk_level === '초저위험') {
          // 극보수적: 대형 안전주 + 금융주 집중
          const totalStocks = composition.length;
          const minWeight = Math.max(2, Math.floor(100 / totalStocks * 0.4)); // 최소 2% 이상
          
          // 모든 종목에 최소 비중 할당
          targetWeights.fill(minWeight);
          
          // 보수적 종목들을 찾아서 높은 비중 할당 (금융주, 대형주 우선)
          const conservativeStocks = [];
          composition.forEach((stock, index) => {
            const name = stock.name.toLowerCase();
            if (name.includes('삼성전자') || name.includes('kb금융') || 
                name.includes('카카오뱅크') || name.includes('신한지주') ||
                name.includes('sk하이닉스') || name.includes('naver') ||
                name.includes('sk텔레콤') || name.includes('하나금융')) {
              conservativeStocks.push({index, priority: getConservativePriority(stock.name)});
            }
          });
          
          // 우선순위에 따라 정렬하고 비중 할당
          conservativeStocks.sort((a, b) => a.priority - b.priority);
          const remainingWeight = 100 - (totalStocks * minWeight);
          const weights = [30, 25, 20, 15, 10]; // 상위 5개 종목 추가 비중
          
          conservativeStocks.slice(0, Math.min(5, conservativeStocks.length)).forEach((stock, i) => {
            if (i < weights.length) {
              targetWeights[stock.index] = minWeight + Math.floor(remainingWeight * weights[i] / 100);
            }
          });
        } else if (selectedStrategy.risk_level === '저위험') {
          // 보수적: 안정주 중심, 일부 성장주 포함
          const totalStocks = composition.length;
          const minWeight = Math.max(3, Math.floor(100 / totalStocks * 0.5)); // 최소 3% 이상
          
          // 모든 종목에 최소 비중 할당
          targetWeights.fill(minWeight);
          
          // 안정적 종목들 찾아서 비중 집중
          const stableStocks = [];
          composition.forEach((stock, index) => {
            const name = stock.name.toLowerCase();
            if (name.includes('삼성전자') || name.includes('카카오뱅크') || 
                name.includes('kb금융') || name.includes('sk하이닉스') ||
                name.includes('신한지주') || name.includes('naver') ||
                name.includes('sk텔레콤') || name.includes('기아') ||
                name.includes('카카오') || name.includes('lg화학')) {
              stableStocks.push({index, priority: getConservativePriority(stock.name)});
            }
          });
          
          // 우선순위에 따라 정렬하고 비중 할당
          stableStocks.sort((a, b) => a.priority - b.priority);
          const remainingWeight = 100 - (totalStocks * minWeight);
          const weights = [25, 20, 15, 12, 10, 8, 6, 4]; // 상위 종목들 추가 비중
          
          stableStocks.slice(0, Math.min(8, stableStocks.length)).forEach((stock, i) => {
            if (i < weights.length) {
              targetWeights[stock.index] = minWeight + Math.floor(remainingWeight * weights[i] / 100);
            }
          });
        } else if (selectedStrategy.risk_level === '중위험') {
          // 균형형: 모든 섹터 균등 분산
          const baseWeight = 100 / composition.length;
          targetWeights = targetWeights.map(() => baseWeight);
        } else if (selectedStrategy.risk_level === '고위험') {
          // 공격적: 성장주 + 기술주 집중
          const totalStocks = composition.length;
          const minWeight = Math.max(3, Math.floor(100 / totalStocks * 0.6)); // 최소 3% 이상
          
          // 모든 종목에 최소 비중 할당
          targetWeights.fill(minWeight);
          
          // 성장주들 찾아서 비중 집중
          const growthStocks = [];
          composition.forEach((stock, index) => {
            const name = stock.name.toLowerCase();
            if (name.includes('카카오페이') || name.includes('lg에너지솔루션') || 
                name.includes('에코프로비엠') || name.includes('엔씨소프트') || 
                name.includes('삼성바이오로직스') || name.includes('카카오뱅크') || 
                name.includes('카카오') || name.includes('셀트리온') || 
                name.includes('삼성전기') || name.includes('naver') || 
                name.includes('sk하이닉스')) {
              growthStocks.push({index, priority: getGrowthPriority(stock.name)});
            }
          });
          
          // 우선순위에 따라 정렬하고 비중 할당
          growthStocks.sort((a, b) => a.priority - b.priority);
          const remainingWeight = 100 - (totalStocks * minWeight);
          const weights = [30, 25, 20, 15, 10]; // 상위 5개 성장주 추가 비중
          
          growthStocks.slice(0, Math.min(5, growthStocks.length)).forEach((stock, i) => {
            if (i < weights.length) {
              targetWeights[stock.index] = minWeight + Math.floor(remainingWeight * weights[i] / 100);
            }
          });
        } else if (selectedStrategy.risk_level === '초고위험') {
          // 극공격적: 신기술/성장주 극도 집중
          const totalStocks = composition.length;
          const minWeight = Math.max(3, Math.floor(100 / totalStocks * 0.7)); // 최소 3% 이상
          
          // 모든 종목에 최소 비중 할당
          targetWeights.fill(minWeight);
          
          // 극성장주들 찾아서 극집중
          const ultraGrowthStocks = [];
          composition.forEach((stock, index) => {
            const name = stock.name.toLowerCase();
            if (name.includes('카카오페이') || name.includes('lg에너지솔루션') || 
                name.includes('에코프로비엠') || name.includes('엔씨소프트') || 
                name.includes('삼성바이오로직스') || name.includes('셀트리온')) {
              ultraGrowthStocks.push({index, priority: getGrowthPriority(stock.name)});
            }
          });
          
          // 우선순위에 따라 정렬하고 극집중 비중 할당
          ultraGrowthStocks.sort((a, b) => a.priority - b.priority);
          const remainingWeight = 100 - (totalStocks * minWeight);
          const weights = [40, 30, 20, 10]; // 상위 4개 종목에 극집중
          
          ultraGrowthStocks.slice(0, Math.min(4, ultraGrowthStocks.length)).forEach((stock, i) => {
            if (i < weights.length) {
              targetWeights[stock.index] = minWeight + Math.floor(remainingWeight * weights[i] / 100);
            }
          });
        } else {
          // 기타: 균등 분산
          const equalWeight = 100 / composition.length;
          targetWeights = targetWeights.map(() => equalWeight);
        }

        // 투자 스타일별 추가 조정 - 동적 종목 검색
        if (selectedStrategy.investment_style === '배당투자') {
          // 배당주 집중: 금융주 + 안정적 대기업
          const totalStocks = composition.length;
          const minWeight = Math.max(2, Math.floor(100 / totalStocks * 0.3));
          
          targetWeights.fill(minWeight);
          
          const dividendStocks = [];
          composition.forEach((stock, index) => {
            const name = stock.name.toLowerCase();
            if (name.includes('kb금융') || name.includes('신한지주') || 
                name.includes('하나금융') || name.includes('sk텔레콤') ||
                name.includes('삼성전자') || name.includes('posco홀딩스') ||
                name.includes('sk이노베이션') || name.includes('기아') ||
                name.includes('lg화학')) {
              dividendStocks.push({index, priority: getDividendPriority(stock.name)});
            }
          });
          
          dividendStocks.sort((a, b) => a.priority - b.priority);
          const remainingWeight = 100 - (totalStocks * minWeight);
          const weights = [25, 20, 15, 12, 10, 8, 5, 3, 2];
          
          dividendStocks.slice(0, Math.min(9, dividendStocks.length)).forEach((stock, i) => {
            if (i < weights.length) {
              targetWeights[stock.index] = minWeight + Math.floor(remainingWeight * weights[i] / 100);
            }
          });
        } else if (selectedStrategy.investment_style === '성장투자') {
          // 성장주 집중: 신기술/바이오/게임
          const totalStocks = composition.length;
          const minWeight = Math.max(2, Math.floor(100 / totalStocks * 0.3));
          
          targetWeights.fill(minWeight);
          
          const growthStocks = [];
          composition.forEach((stock, index) => {
            const name = stock.name.toLowerCase();
            if (name.includes('카카오페이') || name.includes('lg에너지솔루션') || 
                name.includes('에코프로비엠') || name.includes('엔씨소프트') || 
                name.includes('삼성바이오로직스') || name.includes('셀트리온') || 
                name.includes('카카오뱅크') || name.includes('카카오')) {
              growthStocks.push({index, priority: getGrowthPriority(stock.name)});
            }
          });
          
          growthStocks.sort((a, b) => a.priority - b.priority);
          const remainingWeight = 100 - (totalStocks * minWeight);
          const weights = [30, 25, 20, 15, 10, 8, 7];
          
          growthStocks.slice(0, Math.min(7, growthStocks.length)).forEach((stock, i) => {
            if (i < weights.length) {
              targetWeights[stock.index] = minWeight + Math.floor(remainingWeight * weights[i] / 100);
            }
          });
        } else if (selectedStrategy.investment_style === '가치투자') {
          // 가치주 집중: 저평가된 대형주
          const totalStocks = composition.length;
          const minWeight = Math.max(2, Math.floor(100 / totalStocks * 0.3));
          
          targetWeights.fill(minWeight);
          
          const valueStocks = [];
          composition.forEach((stock, index) => {
            const name = stock.name.toLowerCase();
            if (name.includes('삼성전자') || name.includes('sk하이닉스') || 
                name.includes('lg화학') || name.includes('lg전자') ||
                name.includes('기아') || name.includes('posco홀딩스') ||
                name.includes('sk이노베이션') || name.includes('삼성전기') ||
                name.includes('naver')) {
              valueStocks.push({index, priority: getValuePriority(stock.name)});
            }
          });
          
          valueStocks.sort((a, b) => a.priority - b.priority);
          const remainingWeight = 100 - (totalStocks * minWeight);
          const weights = [30, 20, 15, 12, 10, 8, 5, 3, 2];
          
          valueStocks.slice(0, Math.min(9, valueStocks.length)).forEach((stock, i) => {
            if (i < weights.length) {
              targetWeights[stock.index] = minWeight + Math.floor(remainingWeight * weights[i] / 100);
            }
          });
        } else if (selectedStrategy.investment_style === '테마/모멘텀') {
          // 테마주 집중: K-배터리, K-바이오, K-게임
          const totalStocks = composition.length;
          const minWeight = Math.max(2, Math.floor(100 / totalStocks * 0.2));
          
          targetWeights.fill(minWeight);
          
          const themeStocks = [];
          composition.forEach((stock, index) => {
            const name = stock.name.toLowerCase();
            if (name.includes('카카오페이') || name.includes('lg에너지솔루션') || 
                name.includes('에코프로비엠') || name.includes('엔씨소프트') || 
                name.includes('삼성바이오로직스') || name.includes('셀트리온')) {
              themeStocks.push({index, priority: getGrowthPriority(stock.name)});
            }
          });
          
          themeStocks.sort((a, b) => a.priority - b.priority);
          const remainingWeight = 100 - (totalStocks * minWeight);
          const weights = [35, 30, 25, 10];
          
          themeStocks.slice(0, Math.min(4, themeStocks.length)).forEach((stock, i) => {
            if (i < weights.length) {
              targetWeights[stock.index] = minWeight + Math.floor(remainingWeight * weights[i] / 100);
            }
          });
        } else if (selectedStrategy.investment_style === '지수추종') {
          // 지수추종: 시가총액 상위주 중심
          const totalStocks = composition.length;
          const minWeight = Math.max(2, Math.floor(100 / totalStocks * 0.4));
          
          targetWeights.fill(minWeight);
          
          // 시총 가중치를 모든 종목에 적용 (현실적인 지수 추종)
          const marketCapWeights = [18, 13, 10, 8, 6, 5, 4, 4, 3, 3, 3, 2, 2, 2];
          const remainingWeight = 100 - (totalStocks * minWeight);
          
          composition.slice(0, Math.min(14, composition.length)).forEach((stock, i) => {
            if (i < marketCapWeights.length) {
              targetWeights[i] = minWeight + Math.floor(remainingWeight * marketCapWeights[i] / 100);
            }
          });
        }
      } else {
        // 알 수 없는 전략인 경우 기존 비중 유지
        targetWeights = composition.map(item => item.percentage || 0);
        strategyName = "알 수 없는 전략";
      }
    }
    
    // NULL 값 제거 및 0으로 대체
    targetWeights = targetWeights.map(weight => weight || 0);
    
    // 비중 정규화 (정확히 100%가 되도록)
    const normalizedWeights = normalizeWeights(targetWeights);
    
    // 새로운 가치 계산
    const newValues = calculatePortfolioValue(composition, normalizedWeights);
    
    // 새로운 구성 생성
    newComposition = composition.map((item, index) => ({
      ...item,
      percentage: Math.round(normalizedWeights[index] * 10) / 10, // 소수점 1자리로 반올림
      value: Math.round(newValues[index])
    }));
    
    // 최종 검증: 정확히 100%인지 확인하고 필요시 조정
    const totalPercentage = newComposition.reduce((sum, item) => sum + (item.percentage || 0), 0);
    if (Math.abs(totalPercentage - 100) > 0.1) {
      const adjustment = (100 - totalPercentage);
      // 마지막 종목에 조정값 적용 (모든 종목이 0%보다 큰 값을 가지므로)
      newComposition[newComposition.length - 1].percentage += adjustment;
      newComposition[newComposition.length - 1].percentage = Math.round(newComposition[newComposition.length - 1].percentage * 10) / 10;
    }
    
    // 애니메이션 시작 전에 현재 상태 저장
    const currentComposition = [...composition];
    
    // 애니메이션으로 부드럽게 전환
    animateCompositionChange(currentComposition, newComposition);
    setSelectedStrategyType(strategyType);
    
    // 비중 합계 및 최소/최대 비중 확인용 로그
    const finalTotal = newComposition.reduce((sum, item) => sum + (item.percentage || 0), 0);
    const minWeight = Math.min(...newComposition.map(item => item.percentage || 0));
    const maxWeight = Math.max(...newComposition.map(item => item.percentage || 0));
    
    console.log(`전략 적용 후 비중 합계: ${finalTotal.toFixed(1)}%`);
    console.log(`최소 비중: ${minWeight.toFixed(1)}%, 최대 비중: ${maxWeight.toFixed(1)}%`);
    
    // 위험도에 따른 분산도 계산
    const riskDescription = selectedStrategy?.risk_level === '초저위험' || selectedStrategy?.risk_level === '저위험' 
      ? '안전주 중심 집중투자' 
      : selectedStrategy?.risk_level === '고위험' || selectedStrategy?.risk_level === '초고위험'
      ? '성장주 중심 투자'
      : '균형잡힌 분산투자';
    
    toast({
      title: "전략이 적용되었습니다",
      description: `${strategyName} - ${riskDescription} (총 비중: ${finalTotal.toFixed(1)}%)`,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6 text-center">리밸런싱 전략 선택</h1>
        
        <div className={`transition-all duration-300 ${isAnimating ? 'pointer-events-none opacity-75' : ''}`}>
          <EditablePortfolioComposition 
            data={composition}
            onCompositionChange={handleCompositionChange}
            rebalancingCycle={rebalancingCycle}
            allowedDeviation={allowedDeviation}
            onRebalancingSettingsChange={(cycle, deviation) => {
              console.log('📊 StrategyCreate - 리밸런싱 설정 변경:', { cycle, deviation });
              setRebalancingCycle(cycle);
              setAllowedDeviation(deviation);
            }}
          />
          
          {/* 현재 선택된 전략 상태 표시 */}
          {selectedStrategyType === 'custom' && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-amber-600">✏️</span>
                <span className="text-sm font-medium text-amber-800">
                  사용자 정의 전략으로 설정됨
                </span>
              </div>
              <p className="text-xs text-amber-700 mt-1">
                포트폴리오 비중을 직접 편집하여 사용자 정의 전략이 적용되었습니다.
              </p>
            </div>
          )}
        </div>
        
        <Card className="card-gradient p-6 border-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">카카오페이증권 추천 전략</h3>
            {masterStrategies.length > 3 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowAllStrategies(!showAllStrategies)}
              >
                {showAllStrategies ? '접기' : '모두보기'}
              </Button>
            )}
          </div>
          <div className="space-y-3">
            {/* 기본 전략들 (하드코딩) */}
            <div 
              className={`p-3 rounded-lg bg-neutral-light transition-all duration-300 ${
                isAnimating 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'cursor-pointer hover:bg-primary/10 hover:shadow-md'
              } ${selectedStrategyType === "equal" ? 'ring-2 ring-primary bg-primary/5' : ''}`}
              onClick={() => !isAnimating && handleStrategySelect("equal")}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">균등 분산 전략</p>
                  <p className="text-sm text-muted-foreground">모든 종목에 동일한 비중으로 투자</p>
                </div>
                {isAnimating && selectedStrategyType === "equal" && (
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                )}
              </div>
            </div>
            
            {/* 마스터 전략들 (API에서 로드) */}
            {(showAllStrategies ? masterStrategies : getDefaultStrategies()).map((strategy) => (
              <div 
                key={strategy.strategy_code}
                className={`p-3 rounded-lg bg-neutral-light transition-all duration-300 ${
                  isAnimating 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'cursor-pointer hover:bg-primary/10 hover:shadow-md'
                } ${selectedStrategyType === strategy.strategy_code ? 'ring-2 ring-primary bg-primary/5' : ''}`}
                onClick={() => !isAnimating && handleStrategySelect(strategy.strategy_code)}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium">{strategy.strategy_name}</p>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      strategy.risk_level === '초저위험' ? 'bg-green-100 text-green-800' :
                      strategy.risk_level === '저위험' ? 'bg-blue-100 text-blue-800' :
                      strategy.risk_level === '중위험' ? 'bg-yellow-100 text-yellow-800' :
                      strategy.risk_level === '고위험' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {strategy.risk_level}
                    </span>
                    {isAnimating && selectedStrategyType === strategy.strategy_code && (
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{strategy.description}</p>
                {(strategy.keyword1 || strategy.keyword2 || strategy.keyword3) && (
                  <div className="flex gap-1 mt-2">
                    {[strategy.keyword1, strategy.keyword2, strategy.keyword3].filter(Boolean).map((keyword, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-primary/10 text-primary rounded">
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="p-3 rounded-lg bg-neutral-light">
                <p className="text-sm text-muted-foreground">전략을 불러오는 중...</p>
              </div>
            )}
          </div>
        </Card>

        {/* 현재 저장된 전략 정보 */}
        <div className="mt-6 space-y-4">
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-primary">현재 저장된 전략</h3>
                {customerStrategyLoading ? (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-muted-foreground">전략 정보 로딩 중...</p>
                  </div>
                ) : customerStrategy ? (
                  <div className="mt-1">
                    <p className="font-medium text-sm">
                      {customerStrategy.strategy_name || "사용자 직접 정의 전략"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      리밸런싱 주기: {customerStrategy.rebalancing_cycle}일, 
                      허용편차: {customerStrategy.allowed_deviation}%
                      {customerStrategy.risk_level && ` · ${customerStrategy.risk_level}`}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">
                    저장된 전략이 없습니다. 새로운 전략을 생성해보세요.
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* 현재 편집 중인 포트폴리오 정보 */}
          <Card className="p-4 bg-secondary/20 border-secondary/30">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-secondary-foreground">편집 중인 포트폴리오</h3>
                <p className="text-sm text-muted-foreground">
                  총 {composition.length}개 종목, 비중 합계: 100.0%
                </p>
              </div>
            </div>
            
            <Button 
              onClick={handleSaveStrategy}
              disabled={isAnimating}
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              size="lg"
            >
              {isAnimating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  전략 적용 중...
                </div>
              ) : (
                <>💾 전략 선택하기</>
              )}
            </Button>
          </Card>
          
          <Card className="p-4">
            <div className="text-center text-sm text-muted-foreground space-y-1">
              <p>💡 전략 저장 후 잔고 탭에서 리밸런싱을 활성화하세요</p>
              <p>📊 리밸런싱 ON/OFF는 메인 화면의 토글 버튼으로 제어됩니다</p>
            </div>
          </Card>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default StrategyCreate;