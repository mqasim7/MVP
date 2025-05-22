// components/dashboard/DashboardHome.tsx
"use client";
import React, { useState } from 'react';
import { 
  BarChart2, Users, Video, Clock, BarChart3,
  ArrowRight, ChevronDown, ArrowUpRight, 
  Plus, Target, TrendingUp, CheckCircle
} from 'lucide-react';
import TimeframeSelector from '@/components/ui/TimeframeSelector';
import KpiCard from '@/components/dashboard/KpiCard';

const DashboardHome: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'quarter' | 'year' | 'all'>('week');
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  // Demo data
  const kpiData = [
    { id: 1, name: 'Audience Growth', value: '+12.3%', trend: 'up', change: '+2.1%', icon: <Users size={20} /> },
    { id: 2, name: 'Engagement Rate', value: '4.7%', trend: 'up', change: '+0.5%', icon: <BarChart2 size={20} /> },
    { id: 3, name: 'Content Volume', value: '47', trend: 'flat', change: '0%', icon: <Video size={20} /> },
    { id: 4, name: 'Avg. View Time', value: '1:42', trend: 'up', change: '+0:13', icon: <Clock size={20} /> },
  ];

  return (
    <div className="container mx-auto pb-20 md:pb-0">
      {/* Dashboard Header */}
      <div className="py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm opacity-60">
              Content performance analytics for Lululemon marketing team
            </p>
          </div>
          
          {/* Timeframe Selector */}
          <div className="mt-4 sm:mt-0">
            <TimeframeSelector value={timeframe} onChange={setTimeframe} />
          </div>
        </div>
        
        {/* Dashboard Tabs */}
        <div className="tabs tabs-bordered my-6">
          <a 
            className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </a>
          <a 
            className={`tab ${activeTab === 'content' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('content')}
          >
            Content
          </a>
          <a 
            className={`tab ${activeTab === 'audience' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('audience')}
          >
            Audience
          </a>
          <a 
            className={`tab ${activeTab === 'insights' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('insights')}
          >
            Insights
          </a>
        </div>
      </div>
      
      {/* Key Performance Indicators */}
      {/* <div className="mt-6">
        <h2 className="text-lg font-medium mb-4">Key Metrics</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {kpiData.map((kpi) => (
            <KpiCard key={kpi.id} kpi={kpi} />
          ))}
        </div>
      </div> */}

      {/* Placeholder for the rest of the dashboard */}
      <div className="mt-8 text-center py-20 bg-base-200 rounded-lg">
        <h3 className="text-xl font-medium">Dashboard Content</h3>
        <p className="mt-2 opacity-70">
          More dashboard components will be displayed here
        </p>
      </div>
    </div>
  );
};

export default DashboardHome;