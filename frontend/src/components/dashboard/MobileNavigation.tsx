import React from 'react';
import Link from 'next/link';
import { Home, Video, PieChart, Compass, FileText } from 'lucide-react';

interface MobileNavigationProps {
  pathname: string;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ pathname }) => {
  return (
    <div className="btm-nav z-10 shadow-lg">
      <Link 
        href="/dashboard" 
        className={pathname === '/dashboard' ? 'active text-primary' : ''}
      >
        <Home size={20} />
        <span className="btm-nav-label">Home</span>
      </Link>
      <Link 
        href="/dashboard/feed" 
        className={pathname === '/dashboard/feed' ? 'active text-primary' : ''}
      >
        <Video size={20} />
        <span className="btm-nav-label">Feed</span>
      </Link>
      
      <Link 
        href="/dashboard/insights" 
        className={pathname === '/dashboard/insights' ? 'active text-primary' : ''}
      >
        <PieChart size={20} />
        <span className="btm-nav-label">Insights</span>
      </Link>
      
    </div>
  );
};

export default MobileNavigation;