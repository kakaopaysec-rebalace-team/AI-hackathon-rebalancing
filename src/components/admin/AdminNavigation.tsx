import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Brain, Settings } from 'lucide-react';

const AdminNavigation = () => {
  const location = useLocation();
  
  const adminMenuItems = [
    {
      path: '/admin/strategy-learning',
      label: '전략학습',
      icon: Brain,
      description: 'AI 전략 생성'
    },
    {
      path: '/admin/portfolio-management', 
      label: '포트폴리오 관리',
      icon: Settings,
      description: '등록된 전략 관리'
    }
  ];

  return (
    <Card className="p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
            <Brain className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">전략학습 관리자</h2>
            <p className="text-sm text-gray-600">AI 기반 포트폴리오 전략 생성 및 관리</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {adminMenuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Button
                key={item.path}
                variant={isActive ? "default" : "outline"}
                size="sm"
                className={isActive ? 'bg-blue-600 text-white' : 'hover:bg-blue-50'}
                asChild
              >
                <Link to={item.path}>
                  <IconComponent className="w-4 h-4 mr-2" />
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default AdminNavigation;