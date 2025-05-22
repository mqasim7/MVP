// components/embeds/TikTokEmbed.tsx
import React, { useEffect, useRef, useState } from 'react';

interface TikTokEmbedProps {
  videoUrl: string;
  autoplay?: boolean; // Added autoplay prop
}

const TikTokEmbed: React.FC<TikTokEmbedProps> = ({ 
  videoUrl, 
  autoplay = true // Enable autoplay by default
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [debugInfo, setDebugInfo] = useState<string>('');
  // Track created state to prevent loops
  const embedCreated = useRef<boolean>(false);
  // Track previous URL
  const previousUrlRef = useRef<string>(videoUrl);
  // Track script added
  const scriptAdded = useRef<boolean>(false);

  useEffect(() => {
    // Reset on new URL
    if (videoUrl !== previousUrlRef.current) {
      setLoading(true);
      setError(false);
      embedCreated.current = false;
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    }
    previousUrlRef.current = videoUrl;

    // Validate the URL is a TikTok URL
    if (!videoUrl || !videoUrl.includes('tiktok.com')) {
      console.error('Invalid TikTok URL:', videoUrl);
      setDebugInfo(`Invalid URL format: ${videoUrl}`);
      setError(true);
      return;
    }

    // Extract video ID from URL using a more robust approach
    let videoId = '';
    try {
      // Handle different possible TikTok URL formats
      const pathParts = videoUrl.split('/');
      const videoIndex = pathParts.findIndex(part => part === 'video');
      
      if (videoIndex !== -1 && videoIndex < pathParts.length - 1) {
        // Format: /video/1234567890123456789
        videoId = pathParts[videoIndex + 1].split('?')[0];
      } else {
        // Try to find numeric ID anywhere in the URL (fallback)
        const matches = videoUrl.match(/(\d{15,})/);
        if (matches && matches[1]) {
          videoId = matches[1];
        }
      }

      if (!videoId) {
        console.error('Could not extract TikTok video ID from URL', videoUrl);
        setDebugInfo(`Could not extract TikTok video ID from URL: ${videoUrl}`);
        setError(true);
        return;
      }

      // Log the extracted ID for debugging
      console.log('Extracted TikTok video ID:', videoId);
      setDebugInfo(`Using TikTok video ID: ${videoId}`);
      
    } catch (err) {
      console.error('Error parsing TikTok URL:', err);
      setDebugInfo(`Error parsing URL: ${err}`);
      setError(true);
      return;
    }

    // Only create embed once per URL
    if (containerRef.current && !embedCreated.current) {
      embedCreated.current = true; // Mark as created to prevent loops
      
      // Create embed HTML - Use the EXACT format TikTok requires
      const blockquote = document.createElement('blockquote');
      blockquote.className = 'tiktok-embed';
      blockquote.setAttribute('cite', videoUrl);
      blockquote.setAttribute('data-video-id', videoId);
      
      // Add autoplay attribute if enabled
      if (autoplay) {
        blockquote.setAttribute('data-autoplay', 'true');
      }
      
      // Add muted attribute to ensure autoplay works on most browsers
      blockquote.setAttribute('data-is-muted', 'false');
      
      blockquote.style.maxWidth = '605px';
      blockquote.style.minWidth = '325px';
      blockquote.style.margin = '0 auto';
      
      // Important: The section element is required by TikTok's embed script
      const section = document.createElement('section');
      blockquote.appendChild(section);
      
      containerRef.current.appendChild(blockquote);

      // Load TikTok embed script only once
      if (!scriptAdded.current) {
        scriptAdded.current = true;
        
        // Remove any existing TikTok script to avoid conflicts
        const existingScript = document.getElementById('tiktok-embed-script');
        if (existingScript) {
          existingScript.remove();
        }
        
        // Load TikTok embed script
        const script = document.createElement('script');
        script.id = 'tiktok-embed-script';
        script.src = 'https://www.tiktok.com/embed.js';
        script.async = true;
        
        script.onload = () => {
          console.log('TikTok embed script loaded successfully');
          setLoading(false);
        };
        
        script.onerror = (e) => {
          console.error('Failed to load TikTok embed script', e);
          setDebugInfo(`Script load error: ${e}`);
          setError(true);
        };
        
        document.body.appendChild(script);
      } else {
        // If script is already loaded, process the embed manually
        if (window.tiktokEmbed && typeof window.tiktokEmbed.reloadEmbeds === 'function') {
          setTimeout(() => {
            // window.tiktokEmbed.reloadEmbeds();
            console.log('TikTok embed reloaded successfully');
            setLoading(false);
          }, 500);
        } else {
          setLoading(false);
        }
      }
    }

    // Set a timeout to detect loading issues (5 seconds)
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('TikTok embed loading timed out');
        setDebugInfo('Loading timed out after 5 seconds');
        setError(true);
      }
    }, 5000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [videoUrl, autoplay]); // Added autoplay to dependencies

  if (error) {
    return (
      <div className="tiktok-embed-error flex flex-col items-center justify-center p-4 bg-black text-white min-h-[500px]">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-16 h-16 mb-4 fill-white">
          <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/>
        </svg>
        <h3 className="text-lg font-bold mb-2">TikTok Content Unavailable</h3>
        <p className="text-white/70 text-sm mb-4">This content couldn't be loaded. It may be private, deleted, or restricted.</p>
        {debugInfo && (
          <div className="text-xs text-red-300 mb-2 max-w-[80%] overflow-hidden text-ellipsis">
            {debugInfo}
          </div>
        )}
        <a 
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-white text-black rounded hover:bg-white/90"
        >
          View on TikTok
        </a>
      </div>
    );
  }

  return (
    <div className="tiktok-embed-container relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <div className="loading loading-spinner loading-lg text-white"></div>
        </div>
      )}
      <div ref={containerRef} className="min-h-[500px] w-full"></div>
    </div>
  );
};

export default TikTokEmbed;