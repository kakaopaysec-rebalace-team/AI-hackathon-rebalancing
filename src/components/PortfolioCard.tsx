import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PortfolioCardProps {
  symbol: string;
  name: string;
  shares: number;
  currentPrice: number;
  avgPrice: number;
  totalValue: number;
  change: number;
  changePercent: number;
}

export function PortfolioCard({
  symbol,
  name,
  shares,
  currentPrice,
  avgPrice,
  totalValue,
  change,
  changePercent,
}: PortfolioCardProps) {
  const isPositive = change >= 0;
  
  return (
    <Card className="card-gradient p-4 mb-3 border-0">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-lg text-foreground">{symbol}</h3>
          <p className="text-sm text-muted-foreground">{name}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-lg">₩{totalValue.toLocaleString()}</p>
          <div className={cn(
            "flex items-center gap-1 text-sm font-medium",
            isPositive ? "text-success" : "text-danger"
          )}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{isPositive ? '+' : ''}₩{change.toLocaleString()}</span>
            <span>({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)</span>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{shares}주 보유</span>
        <span>현재가: ₩{currentPrice.toLocaleString()}</span>
      </div>
    </Card>
  );
}