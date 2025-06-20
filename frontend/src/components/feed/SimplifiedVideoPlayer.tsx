'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, 
  ExternalLink, AlertCircle, Heart, MessageCircle, Share2
} from 'lucide-react';
import TikTokEmbed from './TikTokEmbed';
// import InstagramEmbed from './InstagramEmbed';
import { VideoPlayerProps } from '@/types/dashboard';
import { InstagramEmbed } from 'react-social-media-embed';

const SimplifiedVideoPlayer: React.FC<VideoPlayerProps & { isActive: boolean }> = ({
  src,
  poster,
  title,
  description,
  metrics,
  socialLink,
  date = "May 2025",
  autoplay = true,
  isActive = false
}) => {
  const [playing, setPlaying] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(false);
  const [embedType, setEmbedType] = useState<'none' | 'instagram' | 'tiktok'>('none');
  const [videoError, setVideoError] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  // Determine content type
  useEffect(() => {
    setVideoError(false);
    
    if (socialLink) {
      if (socialLink.toLowerCase().includes('instagram.com')) {
        setEmbedType('instagram');
      } else if (socialLink.toLowerCase().includes('tiktok.com')) {
        setEmbedType('tiktok');
      } else {
        setEmbedType('none');
      }
    } else {
      setEmbedType('none');
    }
  }, [socialLink]);

  // Handle autoplay when video becomes active
  useEffect(() => {
    if (videoRef.current && embedType === 'none' && src) {
      const video = videoRef.current;
  
      if (isActive && autoplay) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setPlaying(true))
            .catch(() => setPlaying(false));
        }
      } else {
        video.pause();
        setPlaying(false);
      }
    }
  }, [isActive, autoplay, src, embedType]);

  const togglePlay = (): void => {
    if (!videoRef.current || embedType !== 'none' || videoError) return;
    
    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {
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
  
  const openOriginal = (): void => {
    if (socialLink) {
      window.open(socialLink, '_blank');
    }
  };
  
  const handleVideoError = (): void => {
    setVideoError(true);
  };

  return (
    <div className="relative w-full max-w-md mx-auto h-full flex items-center justify-center">
      <div className="relative aspect-[9/16] w-full bg-black rounded-lg overflow-hidden">
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
              muted={false}
              controls={false}
              autoPlay={isActive && autoplay}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onClick={togglePlay}
              onError={handleVideoError}
            />
            
            {/* Play overlay */}
            {!playing && (
              <div 
                className="absolute inset-0 bg-black/30 flex items-center justify-center cursor-pointer"
                onClick={togglePlay}
              >
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-6">
                  <Play size={32} className="text-white" />
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Video Error State */}
        {embedType === 'none' && videoError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-white p-6">
            <AlertCircle size={48} className="mb-4 text-red-400" />
            <h3 className="text-lg font-bold mb-2">Video Unavailable</h3>
            <p className="text-center text-white/70">
              This video couldn't be played.
            </p>
          </div>
        )}
        
        {/* TikTok Embed */}
        {embedType === 'tiktok' && socialLink && (
            <div className="absolute inset-0" style={{ display: 'flex', justifyContent: 'center' }}>
                <TikTokEmbed videoUrl={socialLink} autoplay={isActive && autoplay} />
            </div>
        )}
        
        {/* Instagram Embed */}
        {embedType === 'instagram' && socialLink && (
            <div className="absolute inset-0" style={{ display: 'flex', justifyContent: 'center' }}>
                <InstagramEmbed url={socialLink} width={400}/>
            </div>
        )}
        
        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          {/* Title and Description */}
          <div className="mb-4">
            <h3 className="text-white font-bold text-lg mb-1">{title}</h3>
            <p className="text-white/80 text-sm line-clamp-2">{description}</p>
          </div>
          
          {/* Platform Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="bg-white/20 px-2 py-1 rounded text-xs text-white">
                {embedType === 'none' ? 'Mojo' : embedType}
              </span>
              <span className="text-white/60 text-xs">{date}</span>
            </div>
            
            {socialLink && (
              <button 
                onClick={openOriginal}
                className="text-white/80 hover:text-white"
                aria-label="Open original"
              >
                <ExternalLink size={16} />
              </button>
            )}
          </div>
        </div>
        
        {/* Interaction buttons (right side) */}
        <div className="absolute right-4 bottom-24 flex flex-col gap-4">
          {/* Like */}
          <button className="flex flex-col items-center text-white">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-3 hover:bg-white/20 transition">
              <Heart size={24} />
            </div>
            <span className="text-xs mt-1">{metrics?.likes || '0'}</span>
          </button>
          
          {/* Comment */}
          <button className="flex flex-col items-center text-white">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-3 hover:bg-white/20 transition">
              <MessageCircle size={24} />
            </div>
            <span className="text-xs mt-1">{metrics?.comments || '0'}</span>
          </button>
          
          {/* Share */}
          <button className="flex flex-col items-center text-white">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-3 hover:bg-white/20 transition">
              <Share2 size={24} />
            </div>
            <span className="text-xs mt-1">{metrics?.shares || '0'}</span>
          </button>
          
          {/* Mute button for videos */}
          {embedType === 'none' && src && !videoError && (
            <button 
              onClick={toggleMute}
              className="flex flex-col items-center text-white"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-3 hover:bg-white/20 transition">
                {muted ? <VolumeX size={24} /> : <Volume2 size={24} />}
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimplifiedVideoPlayer;