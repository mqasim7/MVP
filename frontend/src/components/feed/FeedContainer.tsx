'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import PersonaSelector from '@/components/ui/PersonaSelector';
import SimplifiedVideoPlayer from './SimplifiedVideoPlayer';
import PlatformFilter from '@/components/feed/PlatformFilter';
import { FeedItem, Persona } from '@/types/dashboard';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { getStoredUser } from '@/lib/auth';
import { contentApi, personaApi } from '@/lib/api';
import { resetViewportZoom } from '@/lib/utils';

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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [personaLoading, setIsPersonaLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [noContentError, setNoContentError] = useState<boolean>(false);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isManuallyHidden, setIsManuallyHidden] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const user = getStoredUser();

    // Reset viewport zoom on mount (iOS Safari fix)
    useEffect(() => {
      resetViewportZoom();
    }, []);

  // Fetch personas on mount
  useEffect(() => {
    const loadPersonaData = async () => {
      try {
        setIsPersonaLoading(true);
        const personasResponse = await personaApi.getByCompanyId(user!.company_id!);
        setPersonas(personasResponse);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load personas');
      } finally {
        setIsPersonaLoading(false);
      }
    };
    loadPersonaData();
  }, []);

  // Fetch content whenever persona changes
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      setNoContentError(false);
      try {
        const resp = await contentApi.getByPersonaAndCompany(
          selectedPersona,
          user!.company_id!
        );
        const normalized: FeedItem[] = resp.map((c: any) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          date: c.publish_date || c.created_at,
          poster: c.thumbnail_url ?? '/api/placeholder/400/720',
          videoUrl: c.content_url,
          socialLink: c.content_url,
          platforms: c.platformNames || [],
          metrics: {
            likes: c.likes,
            comments: c.comments,
            shares: c.shares,
          }
        }));
        setFeedItems(normalized);
        setFilteredItems(normalized);
        setCurrentIndex(0);
      } catch (e: any) {
        const message = e.response?.data?.message;
        if (message === 'No content found for that persona & company') {
          setFeedItems([]);
          setFilteredItems([]);
          setNoContentError(true);
        } else {
          setError(message ?? "Failed to load feed");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedPersona]);

  // Apply platform filters
  useEffect(() => {
    const anyOn = Object.values(platformFilters).some(Boolean);
    const filtered = feedItems.filter(item => {
      if (!anyOn) return true;
      return item.platforms
        .map(p => p.toLowerCase())
        .some(p => platformFilters[p]);
    });
    setFilteredItems(filtered);
    setCurrentIndex(0);
  }, [platformFilters, feedItems]);

  // IntersectionObserver to detect active video
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const idx = parseInt(entry.target.getAttribute('data-index') || '0');
          if (entry.isIntersecting && entry.intersectionRatio >= 0.75) {
            setCurrentIndex(idx);
          }
        });
      },
      {
        root: containerRef.current,
        threshold: [0.75],
      }
    );

    itemRefs.current.forEach((item, idx) => {
      if (item) {
        item.setAttribute('data-index', idx.toString());
        observerRef.current?.observe(item);
      }
    });

    return () => observerRef.current?.disconnect();
  }, [filteredItems]);

  // Auto snap logic when scrolling stops
  const handleScroll = useCallback(() => {
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      if (!containerRef.current) return;
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();

      let minDistance = Infinity;
      let closestIndex = currentIndex;

      itemRefs.current.forEach((item, idx) => {
        if (item) {
          const rect = item.getBoundingClientRect();
          const distance = Math.abs(rect.top - containerRect.top);
          if (distance < minDistance) {
            minDistance = distance;
            closestIndex = idx;
          }
        }
      });

      // Smoothly scroll to closest item
      const target = itemRefs.current[closestIndex];
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }, [currentIndex]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (container) container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  if (error) {
    return (
      <div className="max-w-md mx-auto py-10">
        <div className="alert alert-error">
          <svg className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
        <button className="btn btn-primary mt-4" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white text-black relative">
      {!isManuallyHidden && (
        <div className="absolute top-0 left-0 w-full z-20 bg-white/95 backdrop-blur-md shadow">
          <div className="max-w-6xl mx-auto">
            <PersonaSelector
              value={selectedPersona}
              onChange={setSelectedPersona}
              personas={personas}
              personaLoading={personaLoading}
              setIsManuallyHidden={setIsManuallyHidden}
            />
            <PlatformFilter
              platforms={platformFilters}
              onChange={(plat) => {setIsManuallyHidden(true);setPlatformFilters(prev => ({ ...prev, [plat]: !prev[plat] }))}}
            />
          </div>
        </div>
      )}

      <button
        onClick={() => setIsManuallyHidden(prev => !prev)}
        className="fixed top-20 right-4 bg-black/70 text-white p-3 rounded-full z-20"
        aria-label="Toggle Controls"
      >
        {isManuallyHidden ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
      </button>

      {isLoading ? (
        <div className="flex justify-center items-center h-screen bg-white">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : (
        <div className="flex-1 relative overflow-hidden">
          <div
            ref={containerRef}
            className="h-full overflow-y-auto snap-y snap-mandatory scrollbar-hide scroll-smooth"
          >
            {filteredItems.length > 0 ? (
              filteredItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="h-screen flex items-center justify-center snap-start"
                  ref={el => { itemRefs.current[idx] = el; }}
                >
                  <div className="w-full max-w-[360px] aspect-[9/16] mx-auto bg-black rounded-lg overflow-hidden shadow-lg">
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
                  <p className="text-gray-600 mb-4">
                    No content matches your current filter selection.
                  </p>
                  {!noContentError && (
                    <button
                      className="btn bg-black text-white hover:bg-gray-800"
                      onClick={() =>
                        setPlatformFilters({
                          mojo: true,
                          instagram: true,
                          tiktok: true,
                        })
                      }
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedContainer;
