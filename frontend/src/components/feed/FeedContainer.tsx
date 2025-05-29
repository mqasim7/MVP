'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import PersonaSelector from '@/components/ui/PersonaSelector';
import SimplifiedVideoPlayer from './SimplifiedVideoPlayer';
import PlatformFilter from '@/components/feed/PlatformFilter';
import { FeedItem } from '@/types/dashboard';
import { ChevronUp, ChevronDown } from 'lucide-react';

// Mock data with actual links to videos and social media posts
const mockFeedItems: FeedItem[] = [
  {
    id: 1,
    title: "Emotive Hooks Drive Scroll-Stop",
    description: "Short, emotional hooks like \"What she said\" trending across Gen Z content",
    date: "May 2025",
    poster: "/api/placeholder/400/720",
    platform: "Instagram",
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
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    poster: "/api/placeholder/400/720",
    platform: "Mojo",
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
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [platformFilters, setPlatformFilters] = useState<PlatformFilters>({
    mojo: true,
    instagram: true,
    tiktok: true
  });
  const [feedItems, setFeedItems] = useState<FeedItem[]>(mockFeedItems);
  const [filteredItems, setFilteredItems] = useState<FeedItem[]>(mockFeedItems);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollTimeoutRef = useRef<number | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Fetch feed items based on persona
  useEffect(() => {
    setFeedItems(mockFeedItems);
    setCurrentIndex(0);
  }, [selectedPersona]);
  
  // Apply platform filters
  useEffect(() => {
    const anyFilterActive = Object.values(platformFilters).some(value => value);
    
    if (!anyFilterActive) {
      setFilteredItems(feedItems);
      return;
    }
    
    const filtered = feedItems.filter(item => {
      const platform = item.platform.toLowerCase();
      return platformFilters[platform];
    });
    
    setFilteredItems(filtered.length > 0 ? filtered : []);
    
    if (filtered.length > 0 && currentIndex >= filtered.length) {
      setCurrentIndex(0);
    }
  }, [platformFilters, feedItems, currentIndex]);
  
  // Intersection Observer for autoplay
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(entry.target.getAttribute('data-index') || '0');
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            setCurrentIndex(index);
          }
        });
      },
      {
        threshold: 0.5,
        root: containerRef.current
      }
    );
    
    // Observe all items
    itemRefs.current.forEach((item, index) => {
      if (item && observerRef.current) {
        item.setAttribute('data-index', index.toString());
        observerRef.current.observe(item);
      }
    });
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [filteredItems]);
  
  // Handle platform filter change
  const handleFilterChange = (platform: string): void => {
    setPlatformFilters(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };
  
  // Scroll to specific index
  const scrollToIndex = useCallback((index: number) => {
    if (!containerRef.current || !itemRefs.current[index]) return;
    
    const container = containerRef.current;
    const item = itemRefs.current[index];
    
    if (isMobile) {
      item.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      container.scrollTop = item.offsetTop;
    }
    
    setCurrentIndex(index);
  }, [isMobile]);
  
  // Handle scroll event on mobile
  const handleScroll = useCallback(() => {
    if (!containerRef.current || !isMobile) return;
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = window.setTimeout(() => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const scrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      
      let closestIndex = 0;
      let closestDistance = Infinity;
      
      itemRefs.current.forEach((item, index) => {
        if (item) {
          const itemTop = item.offsetTop;
          const itemCenter = itemTop + (item.clientHeight / 2);
          const containerCenter = scrollTop + (containerHeight / 2);
          const distance = Math.abs(itemCenter - containerCenter);
          
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        }
      });
      
      if (closestIndex !== currentIndex) {
        setCurrentIndex(closestIndex);
        scrollToIndex(closestIndex);
      }
    }, 100);
  }, [currentIndex, isMobile, scrollToIndex]);
  
  // Keyboard navigation for desktop
  useEffect(() => {
    if (isMobile) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' && currentIndex > 0) {
        scrollToIndex(currentIndex - 1);
      } else if (e.key === 'ArrowDown' && currentIndex < filteredItems.length - 1) {
        scrollToIndex(currentIndex + 1);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, filteredItems.length, isMobile, scrollToIndex]);
  
  // Navigation functions
  const goToPrevious = () => {
    if (currentIndex > 0) {
      scrollToIndex(currentIndex - 1);
    }
  };
  
  const goToNext = () => {
    if (currentIndex < filteredItems.length - 1) {
      scrollToIndex(currentIndex + 1);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
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
    <div className="h-screen flex flex-col bg-white text-black">
      {/* Header with persona selector and filters */}
      <div className="flex-shrink-0 p-4 bg-white/90 backdrop-blur-sm z-10">
        <div className="max-w-6xl mx-auto">
          <PersonaSelector 
            value={selectedPersona} 
            onChange={setSelectedPersona} 
          />
          <PlatformFilter 
            platforms={platformFilters}
            onChange={handleFilterChange}
          />
        </div>
      </div>
      
      {/* Feed container */}
      <div className="flex-1 relative overflow-hidden">
        <div
          ref={containerRef}
          className={`h-full overflow-y-auto snap-y snap-mandatory scrollbar-hide`}
          onScroll={handleScroll}
        >
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <div
                key={item.id}
                className="h-full flex items-center justify-center snap-start"
                data-index={index}
              >
                <SimplifiedVideoPlayer
                  key={`video-${item.id}-${index}`}
                  src={item.videoUrl}
                  poster={item.poster}
                  title={item.title}
                  description={item.description}
                  metrics={item.metrics}
                  socialLink={item.socialLink}
                  date={item.date}
                  autoplay={true}
                  isActive={index === currentIndex}
                />
              </div>
            ))
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-xl font-bold mb-2">No content found</h2>
                <p className="text-white/70 mb-4">
                  No content matches your current filter selection.
                </p>
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
          )}
        </div>
        
        {/* Desktop navigation overlay */}
        {!isMobile && filteredItems.length > 0 && (
          <>
            <button
              onClick={goToPrevious}
              className={`absolute left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-white/20 transition-all ${
                currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={currentIndex === 0}
            >
              <ChevronUp size={24} />
            </button>
            
            <button
              onClick={goToNext}
              className={`absolute right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-white/20 transition-all ${
                currentIndex === filteredItems.length - 1 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={currentIndex === filteredItems.length - 1}
            >
              <ChevronDown size={24} />
            </button>
          </>
        )}
        
        {/* Progress indicator */}
        {/* {filteredItems.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {filteredItems.map((_, index) => (
              <div
                key={index}
                className={`w-1 h-12 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-white w-2'
                    : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        )} */}
        
        {/* Swipe hint for mobile */}
        {isMobile && filteredItems.length > 1 && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronUp size={20} className="text-white/50" />
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedContainer;