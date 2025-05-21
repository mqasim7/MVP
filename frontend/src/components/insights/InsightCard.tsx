import React from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, Calendar, CheckCircle } from 'lucide-react';
import { InsightCardProps } from '@/types/dashboard';

const InsightCard: React.FC<InsightCardProps> = ({ insight, onClick }) => {
  const { id, title, description, date, platform, trend, image, actionable, category } = insight;
  const router = useRouter();
  
  const handleCardClick = () => {
    if (onClick) {
      onClick(id);
    }
  };
  
  const handleViewFullInsight = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card's onClick from firing
    router.push(`/insights/${id}`);
  };
  
  return (
    <div 
      className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <figure className="relative">
        <img 
          src={image || "/api/placeholder/400/160"} 
          alt={title}
          className="h-40 w-full object-cover"
        />
        <div className="absolute top-2 right-2 flex">
          <div className="badge badge-primary mr-1">{platform || category}</div>
          {actionable && (
            <div className="badge badge-success gap-1">
              <CheckCircle size={10} />
              Actionable
            </div>
          )}
        </div>
      </figure>
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        <p className="text-sm opacity-70">{description}</p>
        
        <div className="flex justify-between items-center text-xs mt-2 opacity-70">
          <div className="flex items-center">
            <Calendar size={14} className="mr-1" />
            <span>{date}</span>
          </div>
          <span>5 min read</span>
        </div>
        
        {trend && (
          <div className="flex items-center mt-2 text-success text-sm">
            <TrendingUp size={16} className="mr-1" />
            <span className="font-medium">{trend}</span>
          </div>
        )}
        
        <div className="card-actions justify-end mt-4">
          <button 
            className="btn btn-primary btn-sm"
            onClick={handleViewFullInsight}
          >
            View Full Insight
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsightCard;