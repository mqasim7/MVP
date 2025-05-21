import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { KpiCardProps } from '@/types/dashboard';

const KpiCard: React.FC<KpiCardProps> = ({ kpi }) => {
  const { name, value, trend, change, icon } = kpi;
  
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body p-5">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-primary bg-opacity-10 p-3">
            <span className="text-primary">{icon}</span>
          </div>
          <div>
            <p className="text-sm opacity-70">{name}</p>
            <div className="flex items-baseline">
              <p className="text-2xl font-semibold">{value}</p>
              {change && (
                <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                  trend === 'up' 
                    ? 'text-success' 
                    : trend === 'down' 
                      ? 'text-error' 
                      : 'opacity-70'
                }`}>
                  {trend === 'up' && <TrendingUp size={12} className="mr-0.5" />}
                  {trend === 'down' && <TrendingDown size={12} className="mr-0.5" />}
                  {change}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="card-actions justify-end p-2 bg-base-200">
        <a href="#" className="link link-primary text-xs">View details</a>
      </div>
    </div>
  );
};

export default KpiCard;