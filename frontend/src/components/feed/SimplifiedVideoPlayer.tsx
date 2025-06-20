'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Volume2, VolumeX, 
  ExternalLink, AlertCircle, Heart, MessageCircle, Share2 
} from 'lucide-react';
import { VideoPlayerProps } from '@/types/dashboard';
import { InstagramEmbed, TikTokEmbed } from 'react-social-media-embed';

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
  const [muted, setMuted] = useState<boolean>(true);
  const [embedType, setEmbedType] = useState<'none' | 'instagram' | 'tiktok'>('none');
  const [videoError, setVideoError] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Determine content type
  useEffect(() => {
    setVideoError(false);
    if (socialLink?.toLowerCase().includes('instagram.com')) {
      setEmbedType('instagram');
    } else if (socialLink?.toLowerCase().includes('tiktok.com')) {
      setEmbedType('tiktok');
    } else {
      setEmbedType('none');
    }
  }, [socialLink]);

  // Handle autoplay for direct video only
  useEffect(() => {
    if (videoRef.current && embedType === 'none' && src) {
      const video = videoRef.current;
      if (isActive && autoplay) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.then(() => setPlaying(true)).catch(() => setPlaying(false));
        }
      } else {
        video.pause();
        setPlaying(false);
      }
    }
  }, [isActive, autoplay, src, embedType]);

  const togglePlay = () => {
    if (!videoRef.current || embedType !== 'none' || videoError) return;
    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => setVideoError(true));
    }
    setPlaying(!playing);
  };

  const toggleMute = () => {
    if (!videoRef.current || embedType !== 'none' || videoError) return;
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  const openOriginal = () => {
    if (socialLink) window.open(socialLink, '_blank');
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
              muted={muted}
              controls={false}
              autoPlay={false} 
              onClick={togglePlay}
              onError={() => setVideoError(true)}
            />
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

        {/* Error fallback */}
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
          <div className="absolute inset-0 flex justify-center items-center">
            <TikTokEmbed url={socialLink} width={325} height={550} />
          </div>
        )}

        {/* Instagram Embed */}
        {embedType === 'instagram' && socialLink && (
          <div className="absolute inset-0 flex justify-center items-center">
            <InstagramEmbed url={socialLink} width={325} height={550} />
          </div>
        )}

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="mb-4">
            <h3 className="text-white font-bold text-lg mb-1">{title}</h3>
            <p className="text-white/80 text-sm line-clamp-2">{description}</p>
          </div>

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
              >
                <ExternalLink size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Right side interaction buttons */}
        <div className="absolute right-4 bottom-24 flex flex-col gap-4">
          <button className="flex flex-col items-center text-white">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-3 hover:bg-white/20">
              <Heart size={24} />
            </div>
            <span className="text-xs mt-1">{metrics?.likes || '0'}</span>
          </button>

          <button className="flex flex-col items-center text-white">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-3 hover:bg-white/20">
              <MessageCircle size={24} />
            </div>
            <span className="text-xs mt-1">{metrics?.comments || '0'}</span>
          </button>

          <button className="flex flex-col items-center text-white">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-3 hover:bg-white/20">
              <Share2 size={24} />
            </div>
            <span className="text-xs mt-1">{metrics?.shares || '0'}</span>
          </button>

          {embedType === 'none' && src && !videoError && (
            <button onClick={toggleMute} className="flex flex-col items-center text-white">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-3 hover:bg-white/20">
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
