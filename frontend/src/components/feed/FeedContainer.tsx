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
import { FixedSizeList as List, ListOnScrollProps } from 'react-window';

interface PlatformFilters {
  [key: string]: boolean;
}

const FeedContainer: React.FC = () => {
  const [selectedPersona, setSelectedPersona] = useState<number>(1);
  const [platformFilters, setPlatformFilters] = useState<PlatformFilters>({
    mojo: true,
    instagram: true,
    tiktok: true,
  });
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [personaLoading, setIsPersonaLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [noContentError, setNoContentError] = useState<boolean>(false);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isManuallyHidden, setIsManuallyHidden] = useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const user = getStoredUser();

  useEffect(() => {
    resetViewportZoom();
  }, []);

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
          },
        }));
        setFeedItems(normalized);
        setFilteredItems(normalized);
      } catch (e: any) {
        const message = e.response?.data?.message;
        if (message === 'No content found for that persona & company') {
          setFeedItems([]);
          setFilteredItems([]);
          setNoContentError(true);
        } else {
          setError(message ?? 'Failed to load feed');
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [selectedPersona]);

  useEffect(() => {
    const anyOn = Object.values(platformFilters).some(Boolean);
    const filtered = feedItems.filter(item => {
      if (!anyOn) return true;
      return item.platforms.map(p => p.toLowerCase()).some(p => platformFilters[p]);
    });
    setFilteredItems(filtered);
    setCurrentIndex(0);
  }, [platformFilters, feedItems]);

  const handleScroll = ({ scrollOffset }: ListOnScrollProps) => {
    const index = Math.round(scrollOffset / window.innerHeight);
    setCurrentIndex(index);
  };

  if (error) {
    return (
      <div className="max-w-md mx-auto py-10">
        <div className="alert alert-error">
          <svg className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
    <div className="h-[calc(100vh-7rem)] flex flex-col bg-white text-black relative">
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
              onChange={plat => {
                setIsManuallyHidden(true);
                setPlatformFilters(prev => ({ ...prev, [plat]: !prev[plat] }));
              }}
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
          {filteredItems.length > 0 ? (
            <List
              height={window.innerHeight}
              itemCount={filteredItems.length}
              itemSize={window.innerHeight}
              width={'100%'}
              onScroll={handleScroll}
              overscanCount={1}
              className="scrollbar-hide"
            >
              {({ index, style }) => (
                <div style={style} className="flex items-start justify-center">
                  <div className="w-full max-w-[360px] aspect-[9/16] mx-auto bg-black rounded-lg overflow-hidden shadow-lg">
                    <SimplifiedVideoPlayer
                      src={filteredItems[index].videoUrl}
                      poster={filteredItems[index].poster}
                      title={filteredItems[index].title}
                      description={filteredItems[index].description}
                      metrics={filteredItems[index].metrics}
                      socialLink={filteredItems[index].socialLink}
                      date={filteredItems[index].date}
                      autoplay={true}
                      isActive={index === currentIndex}
                    />
                  </div>
                </div>
              )}
            </List>
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
                      setPlatformFilters({ mojo: true, instagram: true, tiktok: true })
                    }
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedContainer;
