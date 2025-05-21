// components/embeds/InstagramEmbed.tsx
import React, { useEffect, useRef, useState } from 'react';

interface InstagramEmbedProps {
  postUrl: string;
  autoplay?: boolean; // Added autoplay prop
}

const InstagramEmbed: React.FC<InstagramEmbedProps> = ({ 
  postUrl,
  autoplay = true // Enable autoplay by default
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [debugInfo, setDebugInfo] = useState<string>('');
  // Track if iframe has been created to prevent loops
  const iframeCreated = useRef<boolean>(false);
  // Track previous URL
  const previousUrlRef = useRef<string>(postUrl);

  useEffect(() => {
    // Reset on new URL
    if (postUrl !== previousUrlRef.current) {
      setLoading(true);
      setError(false);
      iframeCreated.current = false;
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    }
    previousUrlRef.current = postUrl;

    // Validate the URL is an Instagram URL
    if (!postUrl || !postUrl.includes('instagram.com')) {
      console.error('Not an Instagram URL:', postUrl);
      setDebugInfo(`Invalid URL format: ${postUrl}`);
      setError(true);
      return;
    }

    // Extract post ID from URL
    let postId = '';
    try {
      // Handle different Instagram URL formats
      if (postUrl.includes('/p/') || postUrl.includes('/reel/')) {
        // Format: /p/shortcode/ or /reel/shortcode/
        const matches = postUrl.match(/\/(p|reel)\/([^\/\?]+)/);
        if (matches && matches[2]) {
          postId = matches[2];
        }
      }
      
      if (!postId) {
        console.error('Could not extract Instagram post ID from URL', postUrl);
        setDebugInfo(`Could not extract Instagram post ID from URL: ${postUrl}`);
        setError(true);
        return;
      }
      
      // Log the extracted ID for debugging
      console.log('Extracted Instagram post ID:', postId);
      setDebugInfo(`Using Instagram post ID: ${postId}`);
      
    } catch (err) {
      console.error('Error parsing Instagram URL:', err);
      setDebugInfo(`Error parsing URL: ${err}`);
      setError(true);
      return;
    }

    // Critical: Only create the iframe once to prevent infinite loops
    if (containerRef.current && !iframeCreated.current) {
      iframeCreated.current = true; // Mark as created to prevent loops
      
      const iframe = document.createElement('iframe');
      
      // Determine if it's a reel (video) or a regular post
      const isReel = postUrl.includes('/reel/');
      
      // Build the embed URL - add parameters to help with autoplay
      let embedUrl = `https://www.instagram.com/p/${postId}/embed/`;
      
      // For reels, we can add special parameters to encourage autoplay
      if (isReel && autoplay) {
        // Add parameters that might help with autoplay (Instagram's embed options are limited)
        embedUrl += '?autoplay=1&muted=0';
      }
      
      iframe.src = embedUrl;
      iframe.width = '100%';
      iframe.height = '720px';
      iframe.frameBorder = '0';
      iframe.scrolling = 'no';
      iframe.style.border = 'none';
      iframe.style.overflow = 'hidden';
      iframe.style.background = 'transparent';
      iframe.allowFullscreen = true;
      
      // Add attributes that help with autoplay in some browsers
      if (autoplay) {
        iframe.allow = 'autoplay; encrypted-media';
      }
      
      iframe.onload = () => {
        console.log('Instagram iframe loaded successfully');
        setLoading(false);
        
        // For reels, we can try to trigger play via a message to the iframe
        // This isn't guaranteed to work due to Instagram's security restrictions,
        // but it's worth trying
        if (isReel && autoplay) {
          try {
            setTimeout(() => {
              // Attempt to send a play message to the iframe
              // Note: This may not work due to cross-origin restrictions
              const iframeWindow = iframe.contentWindow;
              if (iframeWindow) {
                iframeWindow.postMessage('{"method":"play"}', '*');
              }
            }, 1000);
          } catch (e) {
            console.log('Autoplay attempt for Instagram failed:', e);
          }
        }
      };
      
      iframe.onerror = (e) => {
        console.error('Failed to load Instagram embed', e);
        setDebugInfo(`Iframe load error: ${e}`);
        setError(true);
      };
      
      containerRef.current.appendChild(iframe);
      
      // For reels, add a click-to-play helper overlay
      if (isReel) {
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.zIndex = '2';
        overlay.style.cursor = 'pointer';
        overlay.style.background = 'rgba(0,0,0,0.1)';
        overlay.style.display = autoplay ? 'none' : 'block'; // Hide if autoplay is enabled
        
        overlay.addEventListener('click', () => {
          // When clicked, remove the overlay and try to trigger play
          overlay.style.display = 'none';
          try {
            const iframeWindow = iframe.contentWindow;
            if (iframeWindow) {
              iframeWindow.postMessage('{"method":"play"}', '*');
            }
          } catch (e) {
            console.log('Play attempt for Instagram failed:', e);
          }
        });
        
        containerRef.current.appendChild(overlay);
      }
    }

    // Set a timeout to detect loading issues
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('Instagram embed loading timed out');
        setDebugInfo('Loading timed out after 5 seconds');
        setError(true);
      }
    }, 5000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [postUrl, autoplay]); // Added autoplay to dependencies

  if (error) {
    return (
      <div className="instagram-embed-error flex flex-col items-center justify-center p-4 bg-black text-white min-h-[500px]">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-16 h-16 mb-4 fill-white">
          <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
        </svg>
        <h3 className="text-lg font-bold mb-2">Instagram Content Unavailable</h3>
        <p className="text-white/70 text-sm mb-4">This content couldn't be loaded. It may be private, deleted, or restricted.</p>
        {debugInfo && (
          <div className="text-xs text-red-300 mb-2 max-w-[80%] overflow-hidden text-ellipsis">
            {debugInfo}
          </div>
        )}
        <a 
          href={postUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-white text-black rounded hover:bg-white/90"
        >
          View on Instagram
        </a>
      </div>
    );
  }

  return (
    <div className="instagram-embed-container relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <div className="loading loading-spinner loading-lg text-white"></div>
        </div>
      )}
      <div ref={containerRef} className="min-h-[500px] w-full relative"></div>
    </div>
  );
};

export default InstagramEmbed;