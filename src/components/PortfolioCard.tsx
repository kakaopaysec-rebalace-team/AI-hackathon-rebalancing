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
  portfolioPercent: number;
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
  portfolioPercent,
}: PortfolioCardProps) {
  const isPositive = change >= 0;
  
  return (
    <Card className="card-gradient p-4 mb-3 border-0">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg text-foreground">{name}</h3>
            <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-medium">
              {portfolioPercent.toFixed(1)}%
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{symbol}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-lg">₩{totalValue.toLocaleString()}</p>
          <div className={cn(
            "flex items-center gap-1 text-sm font-medium",
            isPositive ? "text-red-600" : "text-blue-600"
          )}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span className="whitespace-nowrap">{isPositive ? '+' : ''}₩{Math.floor(change).toLocaleString()}</span>
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