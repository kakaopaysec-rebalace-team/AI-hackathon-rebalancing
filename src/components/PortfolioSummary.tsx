import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PortfolioSummaryProps {
  totalValue: number;
  totalChange: number;
  totalChangePercent: number;
}

export function PortfolioSummary({
  totalValue,
  totalChange,
  totalChangePercent,
}: PortfolioSummaryProps) {
  const isPositive = totalChange >= 0;
  
  return (
    <Card className="primary-gradient p-6 mb-6 border-0 text-white">
      <div className="text-center">
        <p className="text-sm opacity-90 mb-1">총 자산</p>
        <h1 className="text-3xl font-bold mb-2">₩{totalValue.toLocaleString()}</h1>
        
        <div className={cn(
          "flex items-center justify-center gap-2 text-lg font-medium",
          "text-white"
        )}>
          {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
          <span className="whitespace-nowrap">{isPositive ? '+' : ''}₩{Math.floor(totalChange).toLocaleString()}</span>
          <span>({isPositive ? '+' : ''}{totalChangePercent.toFixed(2)}%)</span>
        </div>
        
        <p className="text-sm opacity-90 mt-2">오늘</p>
      </div>
    </Card>
  );
}