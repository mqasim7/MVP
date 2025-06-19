'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, ArrowDownWideNarrow } from 'lucide-react';
import InsightCard from './InsightCard';
import { Insight } from '@/types/dashboard';
import { useRouter } from 'next/navigation';
import { insightsApi } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Mock insights data
// const mockInsights: Insight[] = [
//   {
//     id: 1,
//     title: "Gen Z Content Trends Q2 2025",
//     description: "Analysis of top-performing content patterns across platforms",
//     date: "May 15, 2025",
//     platform: "Cross-platform",
//     trend: "+27% engagement vs. Q1",
//     actionable: true,
//     category: 'Content'
//   },
//   {
//     id: 2,
//     title: "Athleticwear Video Performance",
//     description: "How video product demos are outperforming static images",
//     date: "May 12, 2025",
//     platform: "Instagram",
//     trend: "+45% view completion rate",
//     actionable: true,
//     category: 'Content'
//   },
//   {
//     id: 3,
//     title: "Wellness Content Strategy",
//     description: "Mindfulness content resonating with core audience segments",
//     date: "May 10, 2025",
//     platform: "TikTok",
//     trend: "+38% follower growth",
//     actionable: false,
//     category: 'Audience'
//   },
//   {
//     id: 4,
//     title: "Sustainability Messaging Impact",
//     description: "How eco-conscious content is driving brand perception",
//     date: "May 7, 2025",
//     platform: "Cross-platform",
//     trend: "+19% positive sentiment",
//     actionable: false,
//     category: 'Engagement'
//   },
//   {
//     id: 5,
//     title: "Competitor Analysis: Activewear Brands",
//     description: "Benchmarking content strategy against key competitors",
//     date: "May 5, 2025",
//     platform: "Cross-platform",
//     trend: '',
//     actionable: true,
//     category: 'Content'
//   },
//   {
//     id: 6,
//     title: "Product Launch Performance",
//     description: "Metrics and insights from recent product campaigns",
//     date: "May 3, 2025",
//     platform: "Instagram",
//     trend: "+31% conversion rate",
//     actionable: true,
//     category: 'Conversion'
//   }
// ];

const InsightsGrid: React.FC = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterMenuOpen, setFilterMenuOpen] = useState<boolean>(false);
  const [sortMenuOpen, setSortMenuOpen] = useState<boolean>(false);
  const router = useRouter();
  const user = getStoredUser();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Fetch insights (commented out for mock data)
  useEffect(() => {
    
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await insightsApi.getByCompany(user!.company_id!);
        setInsights(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch insights');
        console.error('Error fetching insights:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    
    // Using mock data for now
    // setInsights(mockInsights);
  }, []);

  console.log(insights)
  
  // Filter insights based on search term
const filteredInsights = insights.filter(insight => {
  const matchesSearch = 
    insight.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    insight.description.toLowerCase().includes(searchTerm.toLowerCase());

  const insightDate = new Date(insight.date); // Convert ISO string to Date

  const matchesDate = (!startDate || insightDate >= startDate) 
    && (!endDate || insightDate <= endDate);

  return matchesSearch && matchesDate;
});

  
  // Handle insight card click
  const handleInsightClick = (id: number) => {
    router.push(`/dashboard/insights/${id}`);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-md mx-auto py-10">
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{error}</span>
        </div>
        <button 
          className="btn btn-primary mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto pb-20 md:pb-0">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Insights Library</h1>
        <p className="text-gray-600">Discover content performance insights across platforms</p>
      </div>
      
      {/* Search and Filter Controls */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center flex-start gap-1">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search insights..."
            className="input input-bordered w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4 mt-4 md:mt-0">
        <div>
          <DatePicker 
            selected={startDate} 
            onChange={(date: Date|null) => setStartDate(date)} 
            selectsStart
            startDate={startDate}
            endDate={endDate}
            className="input input-bordered w-full"
            placeholderText="Select start date"
          />
        </div>

        <div>
          <DatePicker 
            selected={endDate} 
            onChange={(date: Date|null) => setEndDate(date)} 
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate || undefined}
            className="input input-bordered w-full"
            placeholderText="Select end date"
          />
        </div>
      </div>
      <div className="md:ml-2">
      <button 
        className="btn btn-outline btn-sm w-full md:w-auto"
        onClick={() => {
          setStartDate(null);
          setEndDate(null);
          setSearchTerm('');
        }}
      >
        Reset Filters
      </button>
    </div>

        
        {/* <div className="flex space-x-2">
          <div className="dropdown dropdown-end">
            <button 
              className="btn btn-outline btn-sm flex items-center gap-2"
              onClick={() => setFilterMenuOpen(!filterMenuOpen)}
            >
              <Filter size={16} />
              Filter
            </button>
            {filterMenuOpen && (
              <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 mt-1">
                <li className="menu-title">Categories</li>
                <li><a>Content</a></li>
                <li><a>Audience</a></li>
                <li><a>Engagement</a></li>
                <li><a>Conversion</a></li>
                <li className="menu-title mt-2">Platforms</li>
                <li><a>Instagram</a></li>
                <li><a>TikTok</a></li>
                <li><a>YouTube</a></li>
                <li><a>Cross-platform</a></li>
              </ul>
            )}
          </div>
          
          <div className="dropdown dropdown-end">
            <button 
              className="btn btn-outline btn-sm flex items-center gap-2"
              onClick={() => setSortMenuOpen(!sortMenuOpen)}
            >
              <ArrowDownWideNarrow size={16} />
              Sort
            </button>
            {sortMenuOpen && (
              <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 mt-1">
                <li><a>Newest first</a></li>
                <li><a>Oldest first</a></li>
                <li><a>Most relevant</a></li>
                <li><a>Highest impact</a></li>
              </ul>
            )}
          </div>
        </div> */}
      </div>
      
      {/* Insights Grid */}
      {filteredInsights.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-2xl font-semibold mb-2">No insights found</div>
          <p className="text-gray-600">Try adjusting your search term or filters</p>
          {searchTerm && (
            <button 
              className="btn btn-primary mt-4"
              onClick={() => setSearchTerm('')}
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInsights.map(insight => (
            <InsightCard 
              key={insight.id} 
              insight={insight} 
              onClick={handleInsightClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default InsightsGrid;