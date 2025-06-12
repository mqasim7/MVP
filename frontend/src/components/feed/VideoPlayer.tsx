// components/feed/VideoPlayer.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, 
  ChevronUp, ChevronDown, ExternalLink,
  AlertCircle
} from 'lucide-react';
import TikTokEmbed from './TikTokEmbed';
import InstagramEmbed from './InstagramEmbed';
import { VideoPlayerProps } from '@/types/dashboard';

// Update the VideoPlayerProps in your types file to include autoplay option
// export interface VideoPlayerProps {
//   ...existing props...
//   autoplay?: boolean;
// }

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  title,
  description,
  metrics,
  socialLink,
  onNext,
  onPrevious,
  index = 0,
  total = 0,
  date = "May 2025",
  autoplay = true
}) => {
  const [playing, setPlaying] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [swiping, setSwiping] = useState<boolean>(false);
  const [swipeOffset, setSwipeOffset] = useState<number>(0);
  const [embedType, setEmbedType] = useState<'none' | 'instagram' | 'tiktok'>('none');
  const [videoError, setVideoError] = useState<boolean>(false);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const touchStartY = useRef<number>(0);
  const SWIPE_THRESHOLD = 75;
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' && onPrevious) {
        onPrevious();
      } else if (e.key === 'ArrowDown' && onNext) {
        onNext();
      } else if (e.key === ' ' && embedType === 'none') {
        // Space bar toggles play/pause for direct videos
        togglePlay();
        e.preventDefault(); // Prevent page scrolling
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onNext, onPrevious, embedType]);

  // Determine content type based on socialLink or src
  useEffect(() => {
    // Reset error state on content change
    setVideoError(false);
    
    if (socialLink) {
      if (socialLink.toLowerCase().includes('instagram.com')) {
        console.log('Setting embed type to Instagram');
        setEmbedType('instagram');
      } else if (socialLink.toLowerCase().includes('tiktok.com')) {
        console.log('Setting embed type to TikTok');
        setEmbedType('tiktok');
      } else {
        console.log('Unknown social link type, setting to none');
        setEmbedType('none');
      }
    } else {
      console.log('No social link, setting embed type to none');
      setEmbedType('none');
    }
  }, [socialLink]);

  // Direct video functions
  const togglePlay = (): void => {
    if (!videoRef.current || embedType !== 'none' || videoError) return;
    
    if (playing) {
      videoRef.current.pause();
    } else {
      // Attempt to play with error handling
      videoRef.current.play().catch(err => {
        console.error('Error playing video:', err);
        setVideoError(true);
      });
    }
    setPlaying(!playing);
  };
  
  const toggleMute = (): void => {
    if (!videoRef.current || embedType !== 'none' || videoError) return;
    
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };
  
  const updateProgress = (): void => {
    if (videoRef.current && embedType === 'none' && !videoError) {
      const percentage = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(percentage);
    }
  };
  
  // Swipe gesture handlers for mobile
  const handleTouchStart = (e: React.TouchEvent): void => {
    touchStartY.current = e.touches[0].clientY;
    setSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent): void => {
    if (!swiping) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;
    
    // More responsive swiping with reduced resistance
    const resistance = 0.6;
    const limitedOffset = Math.sign(diff) * Math.min(Math.abs(diff) * resistance, window.innerHeight / 3);
    
    setSwipeOffset(limitedOffset);
  };

  const handleTouchEnd = (): void => {
    setSwiping(false);
    
    if (Math.abs(swipeOffset) > SWIPE_THRESHOLD) {
      if (swipeOffset > 0 && onPrevious) {
        onPrevious();
      } else if (swipeOffset < 0 && onNext) {
        onNext();
      }
    }
    
    setSwipeOffset(0);
  };

  // Open original post in a new tab
  const openOriginal = (): void => {
    if (socialLink) {
      window.open(socialLink, '_blank');
    }
  };
  
  // Handle video errors
  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>): void => {
    console.error('Video loading error:', e);
    setVideoError(true);
  };

  // Auto-play direct video when component mounts
  useEffect(() => {
    // Reset states when content changes
    setProgress(0);
    setPlaying(false);
    setVideoError(false);
    
    if (videoRef.current && embedType === 'none' && src) {
      videoRef.current.load(); // Important: load the video first
      
      // Try to play the video if autoplay is enabled
      if (autoplay) {
        videoRef.current.play().then(() => {
          setPlaying(true);
          setMuted(true); // Keep muted initially to ensure autoplay works
        }).catch(err => {
          console.log('Autoplay prevented or error:', err);
          // If autoplay fails, still mark as playable but not playing
          setPlaying(false);
        });
      }
    }
  }, [src, embedType, autoplay]);
  
  // Effect for cleanup
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className="card card-compact w-full max-w-md mx-auto bg-black shadow-xl overflow-hidden relative"
      style={{
        transform: `translateY(${swipeOffset}px)`,
        transition: swiping ? 'none' : 'transform 0.3s ease-out'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative aspect-[9/16] bg-black">
        {/* Direct Video */}
        {embedType === 'none' && src && !videoError && (
          <>
            <video
              ref={videoRef}
              src={src}
              poster={poster}
              className="absolute inset-0 w-full h-full object-cover"
              playsInline
              loop
              muted={muted}
              controls={false}
              autoPlay={autoplay} // Added autoplay attribute
              onTimeUpdate={updateProgress}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onClick={togglePlay}
              onError={handleVideoError}
            />
            
            {/* Video Overlay - Shown when paused */}
            {!playing && (
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <button 
                  onClick={togglePlay}
                  className="btn btn-circle btn-lg bg-white bg-opacity-25 border-none"
                  aria-label="Play video"
                >
                  <Play size={32} className="text-white" />
                </button>
              </div>
            )}
            
            {/* Progress Bar */}
            <progress 
              className="progress progress-primary absolute bottom-0 left-0 right-0 h-1 rounded-none" 
              value={progress} 
              max="100"
            ></progress>
            
            {/* Control Bar */}
            <div className="absolute bottom-4 left-0 right-0 px-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={togglePlay} 
                  className="btn btn-circle btn-sm btn-ghost text-white"
                  aria-label={playing ? "Pause" : "Play"}
                >
                  {playing ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <button 
                  onClick={toggleMute} 
                  className="btn btn-circle btn-sm btn-ghost text-white"
                  aria-label={muted ? "Unmute" : "Mute"}
                >
                  {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
              </div>
            </div>
          </>
        )}
        
        {/* Video Error State */}
        {embedType === 'none' && videoError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-white p-6">
            <AlertCircle size={48} className="mb-4 text-red-400" />
            <h3 className="text-lg font-bold mb-2">Video Playback Error</h3>
            <p className="text-center text-white/70 mb-4">
              This video couldn't be played. The format might be unsupported or the file may be unavailable.
            </p>
            {src && (
              <a 
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white text-black rounded hover:bg-white/90"
              >
                Download Video
              </a>
            )}
          </div>
        )}
        
        {/* TikTok Embed */}
        {embedType === 'tiktok' && socialLink && (
          <div className="absolute inset-0 w-full h-full">
            <TikTokEmbed videoUrl={socialLink} autoplay={autoplay} />
            
            {/* External link button */}
            <button 
              onClick={openOriginal}
              className="absolute top-2 right-2 btn btn-circle btn-sm bg-black bg-opacity-50 text-white border-none z-10"
              aria-label="Open in TikTok"
            >
              <ExternalLink size={16} />
            </button>
          </div>
        )}
        
        {/* Instagram Embed */}
        {embedType === 'instagram' && socialLink && (
          <div className="absolute inset-0 w-full h-full">
            <InstagramEmbed postUrl={socialLink} />
            
            {/* External link button */}
            <button 
              onClick={openOriginal}
              className="absolute top-2 right-2 btn btn-circle btn-sm bg-black bg-opacity-50 text-white border-none z-10"
              aria-label="Open in Instagram"
            >
              <ExternalLink size={16} />
            </button>
          </div>
        )}
        
        {/* Navigation Instructions */}
        {(onNext || onPrevious) && (
          <div className="absolute bottom-28 left-0 right-0 flex justify-center items-center opacity-70 z-10 pointer-events-none">
            <div className="bg-black bg-opacity-50 px-3 py-1 rounded-full text-white text-xs flex items-center">
              <ChevronUp size={14} className="mr-1" />
              <span>Swipe for more</span>
              <ChevronDown size={14} className="ml-1" />
            </div>
          </div>
        )}
        
        {/* Swipe indicators - show during swipe */}
        {onNext && (
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-20 transition-opacity duration-300 z-20 ${Math.abs(swipeOffset) > 20 && swipeOffset < 0 ? 'opacity-70' : 'opacity-0'}`}>
            <ChevronUp size={40} className="text-white" />
            <div className="text-white text-xs text-center mt-1">Next</div>
          </div>
        )}
        
        {onPrevious && (
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-40 transition-opacity duration-300 z-20 ${Math.abs(swipeOffset) > 20 && swipeOffset > 0 ? 'opacity-70' : 'opacity-0'}`}>
            <ChevronDown size={40} className="text-white" />
            <div className="text-white text-xs text-center mt-1">Previous</div>
          </div>
        )}
        
        {/* Desktop Navigation Buttons - only visible on desktop */}
        {onPrevious && (
          <button
            onClick={onPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 z-10 hidden md:block hover:bg-white/20 transition-colors"
            aria-label="Previous video"
          >
            <ChevronUp size={24} className="text-white" />
          </button>
        )}
        
        {onNext && (
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 z-10 hidden md:block hover:bg-white/20 transition-colors"
            aria-label="Next video"
          >
            <ChevronDown size={24} className="text-white" />
          </button>
        )}
        
        {/* Video Index Indicator */}
        <div className="absolute top-4 right-16 bg-black bg-opacity-50 px-2 py-1 rounded-full z-10">
          <span className="text-white text-xs">{index + 1}/{total}</span>
        </div>
        
        {/* Platform badge */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 px-2 py-1 rounded-full z-10">
          <span className="text-white text-xs capitalize">
            {embedType === 'none' ? 'mojo' : embedType}
          </span>
        </div>
      </div>
      
      {/* Mobile drawer indicators - for visual guidance */}
      <div className="w-full h-1 flex justify-center py-2 md:hidden">
        <div className="w-12 h-1 bg-gray-500 rounded-full opacity-50"></div>
      </div>
    </div>
  );
};

export default VideoPlayer;