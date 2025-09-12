import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { useState, useEffect } from "react";

interface CompositionData {
  symbol: string;
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface EditablePortfolioCompositionProps {
  data: CompositionData[];
  onCompositionChange: (newComposition: CompositionData[]) => void;
  rebalancingCycle?: number;
  allowedDeviation?: number;
  onRebalancingSettingsChange?: (cycle: number, deviation: number) => void;
}

const COLORS = [
  'hsl(225, 73%, 57%)',  // primary
  'hsl(142, 76%, 36%)',  // success
  'hsl(0, 65%, 51%)',    // danger
  'hsl(45, 93%, 47%)',   // yellow
  'hsl(280, 100%, 70%)', // purple
  'hsl(195, 100%, 50%)', // cyan
];

// 리밸런싱 주기 (일수)를 UI 선택값으로 변환
const daysToPeriod = (days: number): { period: string; customDays: string } => {
  switch (days) {
    case 1: return { period: "daily", customDays: "" };
    case 7: return { period: "weekly", customDays: "" };
    case 30: return { period: "monthly", customDays: "" };
    case 90: return { period: "quarterly", customDays: "" };
    case 180: return { period: "semi-annual", customDays: "" };
    case 365: return { period: "annual", customDays: "" };
    default: return { period: "custom", customDays: days.toString() };
  }
};

// UI 선택값을 리밸런싱 주기 (일수)로 변환
const periodToDays = (period: string, customDays: string): number => {
  switch (period) {
    case "daily": return 1;
    case "weekly": return 7;
    case "monthly": return 30;
    case "quarterly": return 90;
    case "semi-annual": return 180;
    case "annual": return 365;
    case "custom": return parseInt(customDays) || 90;
    default: return 90;
  }
};

export function EditablePortfolioComposition({ 
  data, 
  onCompositionChange,
  rebalancingCycle = 90,
  allowedDeviation = 5.0,
  onRebalancingSettingsChange
}: EditablePortfolioCompositionProps) {
  const [editMode, setEditMode] = useState(false);
  const [tempData, setTempData] = useState(data);
  const [originalData] = useState(data);
  
  // 리밸런싱 설정 (props 기반으로 초기화)
  const initialPeriod = daysToPeriod(rebalancingCycle);
  const [rebalancePeriod, setRebalancePeriod] = useState(initialPeriod.period);
  const [customDays, setCustomDays] = useState(initialPeriod.customDays);
  const [localAllowedDeviation, setLocalAllowedDeviation] = useState(allowedDeviation.toString());

  // props 변경시 로컬 상태 업데이트
  useEffect(() => {
    const newPeriod = daysToPeriod(rebalancingCycle);
    setRebalancePeriod(newPeriod.period);
    setCustomDays(newPeriod.customDays);
    setLocalAllowedDeviation(allowedDeviation.toString());
  }, [rebalancingCycle, allowedDeviation]);

  // 리밸런싱 설정 변경을 부모 컴포넌트에 전달하는 함수
  const notifyRebalancingChange = (newCycle: number, newDeviation: number) => {
    if (onRebalancingSettingsChange) {
      console.log('🔄 리밸런싱 설정 변경 알림:', { newCycle, newDeviation });
      onRebalancingSettingsChange(newCycle, newDeviation);
    }
  };

  // 리밸런싱 주기 변경 핸들러
  const handleRebalancePeriodChange = (newPeriod: string) => {
    setRebalancePeriod(newPeriod);
    const days = periodToDays(newPeriod, customDays);
    notifyRebalancingChange(days, parseFloat(localAllowedDeviation));
  };

  // 커스텀 일수 변경 핸들러
  const handleCustomDaysChange = (newCustomDays: string) => {
    setCustomDays(newCustomDays);
    if (rebalancePeriod === "custom") {
      const days = periodToDays(rebalancePeriod, newCustomDays);
      notifyRebalancingChange(days, parseFloat(localAllowedDeviation));
    }
  };

  // 허용편차 변경 핸들러
  const handleAllowedDeviationChange = (newDeviation: string) => {
    setLocalAllowedDeviation(newDeviation);
    const days = periodToDays(rebalancePeriod, customDays);
    notifyRebalancingChange(days, parseFloat(newDeviation));
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card p-3 rounded-lg shadow-card border">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm text-muted-foreground">{data.symbol}</p>
          <p className="text-primary font-medium">
            {data.percentage.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const updatePercentage = (index: number, newPercentage: number) => {
    const newComposition = [...tempData];
    const oldPercentage = newComposition[index].percentage;
    const difference = newPercentage - oldPercentage;
    
    // Update the target stock
    newComposition[index].percentage = newPercentage;
    
    // Distribute the difference among other stocks proportionally
    const otherStocks = newComposition.filter((_, i) => i !== index);
    const otherStocksTotal = otherStocks.reduce((sum, stock) => sum + stock.percentage, 0);
    
    if (otherStocksTotal > 0) {
      otherStocks.forEach((stock, otherIndex) => {
        const actualIndex = newComposition.findIndex(s => s.symbol === stock.symbol);
        const proportionalReduction = (stock.percentage / otherStocksTotal) * difference;
        newComposition[actualIndex].percentage = Math.max(0, stock.percentage - proportionalReduction);
      });
    }
    
    // Normalize to ensure total is 100%
    const total = newComposition.reduce((sum, stock) => sum + stock.percentage, 0);
    if (total > 0) {
      newComposition.forEach(stock => {
        stock.percentage = (stock.percentage / total) * 100;
      });
    }
    
    setTempData(newComposition);
  };

  const handleSave = () => {
    onCompositionChange(tempData);
    setEditMode(false);
  };

  const handleCancel = () => {
    setTempData(data);
    setEditMode(false);
  };

  const handleReset = () => {
    setTempData(originalData);
  };

  const resetToEqual = () => {
    const equalPercentage = 100 / tempData.length;
    const newComposition = tempData.map(item => ({
      ...item,
      percentage: equalPercentage
    }));
    setTempData(newComposition);
  };

  const displayData = editMode ? tempData : data;

  return (
    <Card className="card-gradient p-6 mb-6 border-0">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">포트폴리오 구성</h2>
        <div className="flex gap-2">
          {!editMode ? (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setTempData(data);
                setEditMode(true);
              }}
            >
              편집
            </Button>
          ) : (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCancel}
              >
                취소
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleReset}
              >
                초기화
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={resetToEqual}
              >
                균등분할
              </Button>
              <Button 
                size="sm"
                onClick={handleSave}
                className="primary-gradient text-primary-foreground"
              >
                저장
              </Button>
            </>
          )}
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={displayData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 10, angle: -45, textAnchor: 'end' }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
              height={60}
              interval={0}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
              label={{ value: '비중 (%)', angle: -90, position: 'insideLeft' }}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
              {displayData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {editMode && (
        <div className="mt-6 space-y-4">
          <h3 className="font-semibold">비중 조정</h3>
          {tempData.map((item, index) => (
            <div key={item.symbol} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">{item.name}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={item.percentage.toFixed(1)}
                    onChange={(e) => updatePercentage(index, parseFloat(e.target.value) || 0)}
                    className="w-20 h-8 text-xs"
                  />
                  <span className="text-xs text-muted-foreground">%</span>
                </div>
              </div>
              <Slider
                value={[item.percentage]}
                onValueChange={(value) => updatePercentage(index, value[0])}
                max={100}
                min={0}
                step={0.1}
                className="w-full"
              />
            </div>
          ))}
          <div className="text-sm text-muted-foreground text-center pt-2 border-t">
            총합: 100.0%
          </div>
        </div>
      )}
      
      {/* 리밸런싱 설정 */}
      <Card className="card-gradient p-4 border-0 mt-4">
        <h3 className="font-semibold mb-4">리밸런싱 설정</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">리밸런싱 주기</label>
            <select 
              className="w-full p-3 border border-border rounded-lg bg-background text-sm"
              value={rebalancePeriod}
              onChange={(e) => handleRebalancePeriodChange(e.target.value)}
            >
              <option value="daily">매일</option>
              <option value="weekly">매주</option>
              <option value="monthly">매월</option>
              <option value="quarterly">분기별 (3개월)</option>
              <option value="semi-annual">반기별 (6개월)</option>
              <option value="annual">연간 (12개월)</option>
              <option value="custom">직접 입력</option>
            </select>
            
            {rebalancePeriod === "custom" && (
              <div className="mt-3">
                <label className="text-sm font-medium mb-2 block">리밸런싱 간격 (일)</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={customDays}
                  onChange={(e) => handleCustomDaysChange(e.target.value)}
                  placeholder="예: 30"
                  className="w-full p-3 border border-border rounded-lg bg-background text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  1일 ~ 365일 사이의 값을 입력해주세요
                </p>
              </div>
            )}
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">허용 편차</label>
            <select 
              className="w-full p-3 border border-border rounded-lg bg-background text-sm"
              value={localAllowedDeviation}
              onChange={(e) => handleAllowedDeviationChange(e.target.value)}
            >
              <option value="5">5% 이상 차이 시</option>
              <option value="10">10% 이상 차이 시</option>
              <option value="15">15% 이상 차이 시</option>
              <option value="20">20% 이상 차이 시</option>
            </select>
          </div>
        </div>
      </Card>
    </Card>
  );
}