import { cn } from "@/lib/utils";
import { Wallet, Settings, GitCompare } from "lucide-react";
import { useLocation, Link } from "react-router-dom";

const navigationItems = [
  {
    label: "잔고",
    href: "/",
    icon: Wallet,
  },
  {
    label: "전략 생성",
    href: "/strategy-create",
    icon: Settings,
  },
  {
    label: "전략 비교",
    href: "/strategy-compare", 
    icon: GitCompare,
  },
];

export function BottomNavigation() {
  const location = useLocation();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-floating">
      <div className="flex">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-3 px-2 text-xs font-medium transition-colors",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon size={20} />
              <span className="text-center leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}