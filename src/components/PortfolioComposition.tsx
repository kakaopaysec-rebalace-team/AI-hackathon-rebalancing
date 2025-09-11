import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { useState, useEffect } from "react";
import { useUpdateRebalancingToggle } from "@/hooks/useBalance";
import { useToast } from "@/components/ui/use-toast";
import { RebalancingStatus } from "@/api/balance";

interface CompositionData {
  symbol: string;
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface PortfolioCompositionProps {
  data: CompositionData[];
  rebalancingStatus?: RebalancingStatus;
}

const COLORS = [
  'hsl(225, 73%, 57%)',  // primary
  'hsl(142, 76%, 36%)',  // success
  'hsl(0, 65%, 51%)',    // danger
  'hsl(45, 93%, 47%)',   // yellow
  'hsl(280, 100%, 70%)', // purple
  'hsl(195, 100%, 50%)', // cyan
];

export function PortfolioComposition({ data, rebalancingStatus }: PortfolioCompositionProps) {
  const [isRebalancingOn, setIsRebalancingOn] = useState(false);
  const updateRebalancing = useUpdateRebalancingToggle();
  const { toast } = useToast();

  // 리밸런싱 상태 초기화
  useEffect(() => {
    if (rebalancingStatus) {
      setIsRebalancingOn(rebalancingStatus.isEnabled);
    }
  }, [rebalancingStatus]);

  // 리밸런싱 토글 핸들러
  const handleRebalancingToggle = async (checked: boolean) => {
    try {
      const result = await updateRebalancing.mutateAsync(checked);
      
      if (result.success) {
        setIsRebalancingOn(checked);
        toast({
          title: "리밸런싱 설정 변경",
          description: result.message,
        });
      } else {
        // 실패한 경우 원래 상태로 되돌리기
        setIsRebalancingOn(!checked);
        toast({
          title: "리밸런싱 설정 실패",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      // 오류 발생 시 원래 상태로 되돌리기
      setIsRebalancingOn(!checked);
      toast({
        title: "오류 발생",
        description: "리밸런싱 설정을 변경할 수 없습니다.",
        variant: "destructive",
      });
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card p-3 rounded-lg shadow-card border">
          <p className="font-semibold">{data.symbol}</p>
          <p className="text-sm text-muted-foreground">{data.name}</p>
          <p className="text-primary font-medium">
            {data.percentage.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="card-gradient p-6 mb-2 border-0">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">포트폴리오 구성</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            리밸런싱: {isRebalancingOn ? 'ON' : 'OFF'}
          </span>
          <Switch
            checked={isRebalancingOn}
            onCheckedChange={handleRebalancingToggle}
            disabled={updateRebalancing.isPending}
          />
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
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
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}