'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import PersonaSelector from '@/components/ui/PersonaSelector';
import SimplifiedVideoPlayer from './SimplifiedVideoPlayer';
import PlatformFilter from '@/components/feed/PlatformFilter';
import { FeedItem } from '@/types/dashboard';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { getStoredUser } from '@/lib/auth';
import { contentApi } from '@/lib/api';

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
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<FeedItem[]>([]);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const user = getStoredUser();

  // Header visibility states
  const [isHeaderVisible, setIsHeaderVisible] = useState<boolean>(true);
  const [lastScrollY, setLastScrollY] = useState<number>(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isManuallyHidden, setIsManuallyHidden] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollTimeoutRef = useRef<number | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const headerTimeoutRef = useRef<number | null>(null);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch feed items based on persona and company
  useEffect(() => {
    loadData();
  }, [selectedPersona]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const resp = await contentApi.getByPersonaAndCompany(
        selectedPersona,
        user!.company_id!
      );

      const normalized: FeedItem[] = resp.map((c: any, idx: number) => ({
        id:           c.id,
        title:        c.title,
        description:  c.description,
        date:         c.publish_date || c.created_at,
        poster:       c.thumbnail_url ?? '/api/placeholder/400/720',
        videoUrl:     c.content_url,
        socialLink:   c.content_url,
        platforms:    c.platformNames || [],
        metrics: {
          likes:    c.likes,
          comments: c.comments,
          shares:   c.shares,
        }
      }));

      setFeedItems(normalized);
      setFilteredItems(normalized);
      setCurrentIndex(0);
    } catch (e: any) {
      setError(e.response?.data?.message ?? "Failed to load feed");
    } finally {
      setIsLoading(false);
    }
  };

  // Smooth scroll to index
  const scrollToIndex = useCallback((index: number) => {
    if (!containerRef.current || !itemRefs.current[index]) return;

    const container = containerRef.current;
    const item = itemRefs.current[index];

    if (isMobile) {
      item.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      container.scrollTo({ top: item.offsetTop, behavior: 'smooth' });
    }

    setCurrentIndex(index);
  }, [isMobile]);

  // Handle platform filter change
  useEffect(() => {
    const anyOn = Object.values(platformFilters).some(Boolean);
    const filtered = feedItems.filter(item => {
      if (!anyOn) return true;
      const platforms = Array.isArray(item.platforms) ? item.platforms : [];
      return platforms.map(name => name.toLowerCase()).some(p => platformFilters[p]);
    });
    setFilteredItems(filtered);
    if (currentIndex >= filtered.length) {
      setCurrentIndex(0);
    }
  }, [platformFilters, feedItems, currentIndex]);

  // Intersection Observer for autoplay
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const idx = parseInt(entry.target.getAttribute('data-index') || '0');
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          setCurrentIndex(idx);
        }
      });
    }, { threshold: 0.5, root: containerRef.current });

    itemRefs.current.forEach((item, idx) => {
      if (item && observerRef.current) {
        item.setAttribute('data-index', idx.toString());
        observerRef.current.observe(item);
      }
    });

    return () => observerRef.current?.disconnect();
  }, [filteredItems]);

  // Scroll event handler
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    // Auto-hide header logic omitted for brevity...
    if (isMobile) {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = window.setTimeout(() => {
        let closestIdx = 0;
        let closestDist = Infinity;
        const containerCenter = scrollTop + (containerRef.current!.clientHeight / 2);
        itemRefs.current.forEach((item, idx) => {
          if (item) {
            const itemCenter = item.offsetTop + (item.clientHeight / 2);
            const dist = Math.abs(itemCenter - containerCenter);
            if (dist < closestDist) {
              closestDist = dist;
              closestIdx = idx;
            }
          }
        });
        if (closestIdx !== currentIndex) scrollToIndex(closestIdx);
      }, 100);
    }
  }, [isMobile, scrollToIndex, currentIndex]);

  // Keyboard navigation and other logic omitted for brevity...

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
        <button className="btn btn-primary mt-4" onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white text-black">
      {(isHeaderVisible && !isManuallyHidden) && (
        <div className="sticky top-0 -z-0 flex-shrink-0 p-4 bg-white/95 backdrop-blur-sm transition-all duration-300 ease-in-out" >
          <div className="max-w-6xl mx-auto">
            <PersonaSelector value={selectedPersona} onChange={setSelectedPersona} />
            <PlatformFilter platforms={platformFilters} onChange={(plat) => setPlatformFilters(prev => ({ ...prev, [plat]: !prev[plat] }))} />
          </div>
        </div>
      )}
      <button onClick={() => setIsManuallyHidden(h => !h)} className="fixed top-20 right-4 bg-black/70 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/90 transition-colors shadow-xl border border-white/20 z-10" aria-label="Toggle Controls">
        { isManuallyHidden ? <ChevronDown size={24}/> : <ChevronUp size={24}/> }
      </button>
      <div className="flex-1 relative overflow-hidden">
        <div
          ref={containerRef}
          className={`h-full overflow-y-auto snap-y snap-mandatory scrollbar-hide scroll-smooth scrolling-touch`}
          onScroll={handleScroll}
        >
          {filteredItems.length > 0 ? (
            filteredItems.map((item, idx) => (
              <div
                key={item.id}
                className="h-full flex items-center justify-center snap-start"
                data-index={idx}
              >
                <div className="w-full max-w-[360px] aspect-[9/16] bg-black rounded-lg overflow-hidden shadow-lg flex items-center justify-center">
                  <SimplifiedVideoPlayer
                    src={item.videoUrl}
                    poster={item.poster}
                    title={item.title}
                    description={item.description}
                    metrics={item.metrics}
                    socialLink={item.socialLink}
                    date={item.date}
                    autoplay={true}
                    isActive={idx === currentIndex}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-xl font-bold mb-2">No content found</h2>
                <p className="text-gray-600 mb-4">No content matches your current filter selection.</p>
                <button className="btn bg-black text-white hover:bg-gray-800" onClick={() => setPlatformFilters({ mojo: true, instagram: true, tiktok: true })}>Reset Filters</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedContainer;
