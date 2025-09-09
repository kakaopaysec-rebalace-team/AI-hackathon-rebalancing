import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useState } from "react";

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
}

const COLORS = [
  'hsl(225, 73%, 57%)',  // primary
  'hsl(142, 76%, 36%)',  // success
  'hsl(0, 65%, 51%)',    // danger
  'hsl(45, 93%, 47%)',   // yellow
  'hsl(280, 100%, 70%)', // purple
  'hsl(195, 100%, 50%)', // cyan
];

export function EditablePortfolioComposition({ 
  data, 
  onCompositionChange 
}: EditablePortfolioCompositionProps) {
  const [composition, setComposition] = useState(data);
  const [editMode, setEditMode] = useState(false);

  const CustomTooltip = ({ active, payload }: any) => {
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

  const updatePercentage = (index: number, newPercentage: number) => {
    const newComposition = [...composition];
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
    
    setComposition(newComposition);
  };

  const handleSave = () => {
    onCompositionChange(composition);
    setEditMode(false);
  };

  const handleReset = () => {
    setComposition(data);
  };

  const resetToEqual = () => {
    const equalPercentage = 100 / composition.length;
    const newComposition = composition.map(item => ({
      ...item,
      percentage: equalPercentage
    }));
    setComposition(newComposition);
  };

  return (
    <Card className="card-gradient p-6 mb-6 border-0">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">포트폴리오 구성</h2>
        <div className="flex gap-2">
          {!editMode ? (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setEditMode(true)}
            >
              편집
            </Button>
          ) : (
            <>
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
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={composition}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="percentage"
            >
              {composition.map((entry, index) => (
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

      {editMode && (
        <div className="mt-6 space-y-4">
          <h3 className="font-semibold">비중 조정</h3>
          {composition.map((item, index) => (
            <div key={item.symbol} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">{item.symbol}</Label>
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
            총합: {composition.reduce((sum, item) => sum + item.percentage, 0).toFixed(1)}%
          </div>
        </div>
      )}
    </Card>
  );
}