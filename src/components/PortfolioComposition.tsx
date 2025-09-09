import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface CompositionData {
  symbol: string;
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface PortfolioCompositionProps {
  data: CompositionData[];
}

const COLORS = [
  'hsl(225, 73%, 57%)',  // primary
  'hsl(142, 76%, 36%)',  // success
  'hsl(0, 65%, 51%)',    // danger
  'hsl(45, 93%, 47%)',   // yellow
  'hsl(280, 100%, 70%)', // purple
  'hsl(195, 100%, 50%)', // cyan
];

export function PortfolioComposition({ data }: PortfolioCompositionProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card p-3 rounded-lg shadow-card border">
          <p className="font-semibold">{data.symbol}</p>
          <p className="text-sm text-muted-foreground">{data.name}</p>
          <p className="text-primary font-medium">
            ₩{data.value.toLocaleString()} ({data.percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="grid grid-cols-2 gap-2 mt-4">
        {payload?.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{entry.payload.symbol}</p>
              <p className="text-xs text-muted-foreground">
                {entry.payload.percentage.toFixed(1)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="card-gradient p-6 mb-6 border-0">
      <h2 className="text-lg font-semibold mb-4">포트폴리오 구성</h2>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}