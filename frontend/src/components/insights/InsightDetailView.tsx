'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, TrendingUp, CheckCircle, Share2, Bookmark } from 'lucide-react';
import { Insight } from '@/types/dashboard';
import { format, parseISO } from 'date-fns';

interface InsightDetailViewProps {
  insight: Insight;
  insightId?: string;
  onBackClick?: () => void;
}

const InsightDetailView: React.FC<InsightDetailViewProps> = ({ 
  insight,
  insightId,
  onBackClick 
}) => {
  const router = useRouter();

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      router.back();
    }
  };

  const handleShare = () => {
    // Implement sharing functionality
    if (navigator.share) {
      navigator.share({
        title: insight.title,
        text: insight.description,
        url: window.location.href,
      }).catch(err => console.error('Error sharing:', err));
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link copied to clipboard!'))
        .catch(err => console.error('Error copying to clipboard:', err));
    }
  };

  const handleBookmark = () => {
    // Implement bookmarking functionality
    console.log('Bookmark clicked');
  };

  const handleTakeAction = () => {
    // Implement action functionality
    console.log('Take action clicked');
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <button 
            onClick={handleBackClick}
            className="btn btn-ghost btn-sm"
          >
            <ArrowLeft size={20} />
            <span className="ml-1">Back</span>
          </button>
          
          {/* <div className="flex space-x-2">
            <button 
              onClick={handleShare}
              className="btn btn-ghost btn-sm"
              aria-label="Share"
            >
              <Share2 size={18} />
            </button>
            <button 
              onClick={handleBookmark}
              className="btn btn-ghost btn-sm"
              aria-label="Bookmark"
            >
              <Bookmark size={18} />
            </button>
          </div> */}
        </div>
      </header>

      {/* Main content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Hero section */}
        <div className="mb-8">
          {insight.image && (
            <div className="rounded-lg overflow-hidden h-64 md:h-96 mb-6">
              <img 
                src={insight.image || "/api/placeholder/800/400"} 
                alt={insight.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{insight.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm mb-6">
            <div className="flex items-center">
              <Calendar size={16} className="mr-1 text-gray-500" />
              <span>{format(parseISO(insight.date),'MMMM d, yyyy')}</span>
            </div>
            
            {/* {insight.platform && (
              <div className="badge badge-primary">{insight.platform}</div>
            )}
            
            {insight.category && (
              <div className="badge badge-secondary">{insight.category}</div>
            )} */}
            
            {/* {insight.trend && (
              <div className="flex items-center text-success">
                <TrendingUp size={16} className="mr-1" />
                <span className="font-medium">{insight.trend}</span>
              </div>
            )} */}
          </div>
          
          <p className="text-lg font-medium text-gray-700 mb-6">{insight.description}</p>
        </div>
        
        {/* Tags */}
        {insight.tags && insight.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {insight.tags.map((tag, index) => (
              <div key={index} className="badge badge-outline">
                {tag}
              </div>
            ))}
          </div>
        )}
        
        {/* Main content */}
        <div className="prose max-w-none mb-12">
          {insight.content ? (
            <div dangerouslySetInnerHTML={{ __html: insight.content as string }} />
          ) : (
            <p>No content available for this insight.</p>
          )}
        </div>
        
        {/* Actionable section */}
        {/* {insight.actionable && (
          <div className="mb-12 p-6 bg-success bg-opacity-10 rounded-lg border border-success">
            <div className="flex items-center text-success font-medium mb-3">
              <CheckCircle size={20} className="mr-2" />
              <span className="text-lg">Actionable Insight</span>
            </div>
            <p className="mb-4">This insight contains actionable recommendations that you can implement to improve your performance or results.</p>
            <button 
              onClick={handleTakeAction}
              className="btn btn-success"
            >
              Take Action
            </button>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default InsightDetailView;