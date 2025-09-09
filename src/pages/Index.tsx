import { PortfolioSummary } from "@/components/PortfolioSummary";
import { PortfolioCard } from "@/components/PortfolioCard";
import { BottomNavigation } from "@/components/BottomNavigation";

// Mock data for demonstration
const mockPortfolio = {
  totalValue: 125500000,
  totalChange: 2850000,
  totalChangePercent: 2.32,
  holdings: [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      shares: 150,
      currentPrice: 175000,
      avgPrice: 165000,
      totalValue: 26250000,
      change: 1500000,
      changePercent: 6.06
    },
    {
      symbol: "TSLA", 
      name: "Tesla, Inc.",
      shares: 80,
      currentPrice: 250000,
      avgPrice: 275000,
      totalValue: 20000000,
      change: -2000000,
      changePercent: -9.09
    },
    {
      symbol: "NVDA",
      name: "NVIDIA Corporation",
      shares: 100,
      currentPrice: 420000,
      avgPrice: 380000,
      totalValue: 42000000,
      change: 4000000,
      changePercent: 10.53
    },
    {
      symbol: "AMZN",
      name: "Amazon.com Inc.",
      shares: 200,
      currentPrice: 135000,
      avgPrice: 140000,
      totalValue: 27000000,
      change: -1000000,
      changePercent: -3.57
    },
    {
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      shares: 75,
      currentPrice: 138000,
      avgPrice: 132000,
      totalValue: 10350000,
      change: 450000,
      changePercent: 4.55
    }
  ]
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4">
        <PortfolioSummary
          totalValue={mockPortfolio.totalValue}
          totalChange={mockPortfolio.totalChange}
          totalChangePercent={mockPortfolio.totalChangePercent}
        />
        
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-4">보유 종목</h2>
          {mockPortfolio.holdings.map((holding) => (
            <PortfolioCard
              key={holding.symbol}
              symbol={holding.symbol}
              name={holding.name}
              shares={holding.shares}
              currentPrice={holding.currentPrice}
              avgPrice={holding.avgPrice}
              totalValue={holding.totalValue}
              change={holding.change}
              changePercent={holding.changePercent}
            />
          ))}
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Index;