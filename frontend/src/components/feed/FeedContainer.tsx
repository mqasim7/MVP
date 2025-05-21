'use client';

import React, { useState, useEffect } from 'react';
import PersonaSelector from '@/components/ui/PersonaSelector';
import VideoPlayer from '@/components/feed/VideoPlayer';
import PlatformFilter from '@/components/feed/PlatformFilter';
import { FeedItem } from '@/types/dashboard';
// import { getFeedItems } from '@/lib/api';

// Mock data with actual links to videos and social media posts
const mockFeedItems: FeedItem[] = [
  {
    id: 1,
    title: "Emotive Hooks Drive Scroll-Stop",
    description: "Short, emotional hooks like \"What she said\" trending across Gen Z content",
    date: "May 2025",
    poster: "/api/placeholder/400/720",
    platform: "Instagram",
    // Use an Instagram embed link
    socialLink: "https://www.instagram.com/reel/DFp2ZoZIBzO",
    metrics: {
      likes: "12.5k",
      comments: "1.2k",
      shares: "8.3k",
    }
  },
  {
    id: 2,
    title: "Authentic Storytelling Wins",
    description: "Real, unfiltered content outperforms heavily produced videos by 3x",
    date: "May 2025",
    poster: "/api/placeholder/400/720",
    platform: "TikTok",
    // Use a TikTok embed link
    socialLink: "https://www.tiktok.com/@scout2015/video/7505949882511838495",
    metrics: {
      likes: "22.7k",
      comments: "3.4k",
      shares: "11.2k",
    }
  },
  {
    id: 3,
    title: "Product in Motion",
    description: "Dynamic product demos showing real benefits boost conversions",
    date: "May 2025",
    // Direct video source
    videoUrl: "https://www.tiktok.com/@scout2015/video/6718335390845095173",
    poster: "/api/placeholder/400/720",
    platform: "Mojo", // Our own platform
    metrics: {
      likes: "18.3k",
      comments: "2.1k",
      shares: "5.7k",
    }
  }
];

interface PlatformFilters {
  [key: string]: boolean;
}

const FeedContainer: React.FC = () => {
  const [selectedPersona, setSelectedPersona] = useState<number>(1);
  const [currentFeedIndex, setCurrentFeedIndex] = useState<number>(0);
  const [platformFilters, setPlatformFilters] = useState<PlatformFilters>({
    mojo: true,
    instagram: true,
    tiktok: true
  });
  const [feedItems, setFeedItems] = useState<FeedItem[]>(mockFeedItems);
  const [filteredItems, setFilteredItems] = useState<FeedItem[]>(mockFeedItems);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch feed items based on persona
  useEffect(() => {
    /*
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const platforms = Object.entries(platformFilters)
          .filter(([_, isSelected]) => isSelected)
          .map(([platform]) => platform);
        
        const data = await getFeedItems(selectedPersona, platforms);
        setFeedItems(data);
        setFilteredItems(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch feed items');
        console.error('Error fetching feed:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    */

    // Using mock data for now
    setFeedItems(mockFeedItems);
    setCurrentFeedIndex(0); // Reset to first item when persona changes
  }, [selectedPersona]);
  
  // Apply platform filters
  useEffect(() => {
    // If no filters are selected, show all
    const anyFilterActive = Object.values(platformFilters).some(value => value);
    
    if (!anyFilterActive) {
      setFilteredItems(feedItems);
      return;
    }
    
    // Filter items based on selected platforms
    const filtered = feedItems.filter(item => {
      const platform = item.platform.toLowerCase();
      return platformFilters[platform];
    });
    
    setFilteredItems(filtered.length > 0 ? filtered : []);
    
    // Reset current index if it's out of bounds
    if (filtered.length > 0 && currentFeedIndex >= filtered.length) {
      setCurrentFeedIndex(0);
    }
  }, [platformFilters, feedItems, currentFeedIndex]);
  
  // Handle platform filter change
  const handleFilterChange = (platform: string): void => {
    setPlatformFilters(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };
  
  // Navigation handlers
  const goToPrevious = (): void => {
    if (filteredItems.length === 0) return;
    
    setCurrentFeedIndex(prev => 
      prev === 0 ? filteredItems.length - 1 : prev - 1
    );
  };
  
  const goToNext = (): void => {
    if (filteredItems.length === 0) return;
    
    setCurrentFeedIndex(prev => 
      prev === filteredItems.length - 1 ? 0 : prev + 1
    );
  };
  
  const currentItem = filteredItems[currentFeedIndex];
  
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
    <div className="max-w-6xl mx-auto pb-20 lg:pb-0 text-black min-h-screen">
      {/* Persona Selector */}
      <div className="mb-6 pt-4">
        <PersonaSelector 
          value={selectedPersona} 
          onChange={setSelectedPersona} 
        />
      </div>
      
      {/* Social Media Platform Filters */}
      <PlatformFilter 
        platforms={platformFilters}
        onChange={handleFilterChange}
      />
      
      {/* Video Player */}
      <div className="relative max-w-md mx-auto">
        {filteredItems.length > 0 ? (
          <VideoPlayer 
          src={currentItem.videoUrl}
          poster={currentItem.poster}
          title={currentItem.title}
          description={currentItem.description}
          metrics={currentItem.metrics}
          socialLink={currentItem.socialLink}
          onNext={goToNext}
          onPrevious={goToPrevious}
          index={currentFeedIndex}
          total={filteredItems.length}
          date={currentItem.date}
        />
        ) : (
          <div className="card card-compact w-full max-w-md mx-auto bg-black border border-white/20 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-white">No content found</h2>
              <p className="text-white/70">No content matches your current filter selection. Try adjusting your filters.</p>
              <div className="card-actions justify-end mt-4">
                <button 
                  className="btn bg-white text-black hover:bg-white/90"
                  onClick={() => setPlatformFilters({
                    mojo: true,
                    instagram: true,
                    tiktok: true
                  })}
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedContainer;