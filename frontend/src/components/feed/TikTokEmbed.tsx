// components/embeds/TikTokEmbed.tsx
import React, { useEffect, useRef, useState } from 'react';

interface TikTokEmbedProps {
  videoUrl: string;
  autoplay?: boolean;
}

interface TikTokOEmbedResponse {
  html: string;
  title: string;
  author_name: string;
  author_url: string;
  width: number;
  height: number;
  thumbnail_url: string;
}

const TikTokEmbed: React.FC<TikTokEmbedProps> = ({ 
  videoUrl, 
  autoplay = true 
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [embedMethod, setEmbedMethod] = useState<'oembed' | 'script' | 'iframe'>('oembed');

  useEffect(() => {
    setLoading(true);
    setError(false);
    setDebugInfo('');

    if (!videoUrl || !videoUrl.includes('tiktok.com')) {
      setDebugInfo('Invalid TikTok URL format');
      setError(true);
      setLoading(false);
      return;
    }

    // Try multiple embedding methods in sequence
    tryEmbedMethods();
  }, [videoUrl]);

  const tryEmbedMethods = async () => {
    // Method 1: Try TikTok oEmbed API (most reliable)
    try {
      await tryOEmbedMethod();
      return;
    } catch (error) {
      console.log('oEmbed method failed:', error);
      setDebugInfo('oEmbed API failed, trying direct iframe...');
    }

    // Method 2: Try direct iframe embedding
    try {
      await tryIframeMethod();
      return;
    } catch (error) {
      console.log('Iframe method failed:', error);
      setDebugInfo('Iframe method failed, trying script method...');
    }

    // Method 3: Try the original script method as last resort
    try {
      await tryScriptMethod();
      return;
    } catch (error) {
      console.log('Script method failed:', error);
      setDebugInfo('All embedding methods failed - video may be private or restricted');
      setError(true);
      setLoading(false);
    }
  };

  const tryOEmbedMethod = async (): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        setEmbedMethod('oembed');
        setDebugInfo('Trying TikTok oEmbed API...');

        // Use TikTok's oEmbed API
        const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(videoUrl)}`;
        
        const response = await fetch(oembedUrl);
        
        if (!response.ok) {
          throw new Error(`oEmbed API responded with ${response.status}`);
        }

        const data: TikTokOEmbedResponse = await response.json();
        
        if (containerRef.current && data.html) {
          // Extract just the blockquote from the HTML (remove the script tag)
          const htmlWithoutScript = data.html.replace(/<script[^>]*>.*?<\/script>/gi, '');
          
          // Set the blockquote HTML
          containerRef.current.innerHTML = htmlWithoutScript;
          
          setDebugInfo('HTML inserted, loading TikTok script...');
          
          // Now load the TikTok embed script
          const loadTikTokScript = () => {
            // Check if script already exists
            const existingScript = document.querySelector('script[src="https://www.tiktok.com/embed.js"]');
            
            if (!existingScript) {
              const script = document.createElement('script');
              script.src = 'https://www.tiktok.com/embed.js';
              script.async = true;
              
              script.onload = () => {
                setDebugInfo('TikTok script loaded, processing embed...');
                
                // Give TikTok time to process the embed
                setTimeout(() => {
                  // Check if iframe was created
                  const iframe = containerRef.current?.querySelector('iframe');
                  if (iframe) {
                    setLoading(false);
                    setDebugInfo('Successfully loaded via oEmbed API');
                    resolve();
                  } else {
                    // Still loading, wait a bit more
                    setTimeout(() => {
                      const iframe2 = containerRef.current?.querySelector('iframe');
                      if (iframe2) {
                        setLoading(false);
                        setDebugInfo('Successfully loaded via oEmbed API (delayed)');
                        resolve();
                      } else {
                        setDebugInfo('Script loaded but no iframe created - video may be restricted');
                        reject(new Error('No iframe created after script load'));
                      }
                    }, 3000);
                  }
                }, 2000);
              };
              
              script.onerror = () => {
                reject(new Error('Failed to load TikTok embed script'));
              };
              
              document.head.appendChild(script);
            } else {
              // Script already exists, try to trigger processing
              setDebugInfo('Script already exists, triggering processing...');
              
              // Check if TikTok object exists and reload embeds
              if (window.tiktokEmbed && typeof window.tiktokEmbed.reloadEmbeds === 'function') {
                try {
                  window.tiktokEmbed.reloadEmbeds();
                } catch (e) {
                  console.log('Error reloading embeds:', e);
                }
              }
              
              // Wait for processing
              setTimeout(() => {
                const iframe = containerRef.current?.querySelector('iframe');
                if (iframe) {
                  setLoading(false);
                  setDebugInfo('Successfully loaded via oEmbed API (existing script)');
                  resolve();
                } else {
                  reject(new Error('Existing script did not process embed'));
                }
              }, 3000);
            }
          };
          
          // Load script after DOM update
          setTimeout(loadTikTokScript, 100);
          
        } else {
          throw new Error('No HTML content in oEmbed response');
        }
      } catch (error) {
        reject(error);
      }
    });
  };

  const tryIframeMethod = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        setEmbedMethod('iframe');
        setDebugInfo('Trying direct iframe embedding...');

        // Extract video ID for iframe
        const videoId = extractVideoId(videoUrl);
        if (!videoId) {
          throw new Error('Could not extract video ID');
        }

        if (containerRef.current) {
          // Create iframe directly
          const iframe = document.createElement('iframe');
          iframe.src = `https://www.tiktok.com/embed/v2/${videoId}`;
          iframe.width = '100%';
          iframe.height = '500';
          iframe.frameBorder = '0';
          iframe.scrolling = 'no';
          iframe.allowFullscreen = true;
          iframe.style.border = 'none';
          iframe.style.maxWidth = '605px';
          iframe.style.minWidth = '325px';
          iframe.style.margin = '0 auto';
          iframe.style.display = 'block';

          // Add loading detection
          iframe.onload = () => {
            setLoading(false);
            setDebugInfo('Successfully loaded via iframe');
            resolve();
          };

          iframe.onerror = () => {
            throw new Error('Iframe failed to load');
          };

          containerRef.current.innerHTML = '';
          containerRef.current.appendChild(iframe);

          // Timeout for iframe loading
          setTimeout(() => {
            if (loading) {
              reject(new Error('Iframe loading timeout'));
            }
          }, 10000);
        }
      } catch (error) {
        reject(error);
      }
    });
  };

  const tryScriptMethod = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        setEmbedMethod('script');
        setDebugInfo('Trying TikTok embed script...');

        const videoId = extractVideoId(videoUrl);
        const username = extractUsername(videoUrl);

        if (!videoId) {
          throw new Error('Could not extract video ID for script method');
        }

        if (containerRef.current) {
          // Create blockquote as per TikTok documentation
          const blockquote = document.createElement('blockquote');
          blockquote.className = 'tiktok-embed';
          blockquote.setAttribute('cite', videoUrl);
          blockquote.setAttribute('data-video-id', videoId);
          blockquote.style.maxWidth = '605px';
          blockquote.style.minWidth = '325px';
          blockquote.style.margin = '0 auto';

          const section = document.createElement('section');
          if (username) {
            const link = document.createElement('a');
            link.target = '_blank';
            link.title = username;
            link.href = `https://www.tiktok.com/${username}?refer=embed`;
            link.textContent = username;
            section.appendChild(link);
          }
          blockquote.appendChild(section);

          containerRef.current.innerHTML = '';
          containerRef.current.appendChild(blockquote);

          // Load TikTok script
          const script = document.createElement('script');
          script.async = true;
          script.src = 'https://www.tiktok.com/embed.js';

          script.onload = () => {
            setTimeout(() => {
              const iframe = containerRef.current?.querySelector('iframe');
              if (iframe) {
                setLoading(false);
                setDebugInfo('Successfully loaded via script method');
                resolve();
              } else {
                reject(new Error('Script loaded but no iframe created'));
              }
            }, 3000);
          };

          script.onerror = () => {
            reject(new Error('Failed to load TikTok script'));
          };

          document.head.appendChild(script);

          // Timeout
          setTimeout(() => {
            if (loading) {
              reject(new Error('Script method timeout'));
            }
          }, 15000);
        }
      } catch (error) {
        reject(error);
      }
    });
  };

  const extractVideoId = (url: string): string | null => {
    try {
      const urlParts = url.split('/');
      const videoIndex = urlParts.findIndex(part => part === 'video');
      if (videoIndex !== -1 && videoIndex < urlParts.length - 1) {
        return urlParts[videoIndex + 1].split('?')[0];
      }
      // Try regex fallback
      const match = url.match(/(\d{15,})/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  };

  const extractUsername = (url: string): string | null => {
    try {
      const urlParts = url.split('/');
      const usernameIndex = urlParts.findIndex(part => part.startsWith('@'));
      return usernameIndex !== -1 ? urlParts[usernameIndex] : null;
    } catch {
      return null;
    }
  };

  // Network diagnostics
  const runNetworkDiagnostics = async () => {
    setDebugInfo('Running network diagnostics...');
    
    try {
      // Test basic connectivity to TikTok
      const response = await fetch('https://www.tiktok.com', { mode: 'no-cors' });
      setDebugInfo(prev => prev + '\n✓ TikTok.com is reachable');
    } catch {
      setDebugInfo(prev => prev + '\n✗ TikTok.com is not reachable');
    }

    try {
      // Test oEmbed endpoint
      const oembedTest = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent('https://www.tiktok.com/@tiktok/video/7000000000000000000')}`);
      setDebugInfo(prev => prev + '\n✓ oEmbed endpoint is accessible');
    } catch {
      setDebugInfo(prev => prev + '\n✗ oEmbed endpoint is blocked');
    }
  };

  if (error) {
    return (
      <div className="tiktok-embed-error flex flex-col items-center justify-center p-6 bg-black text-white min-h-[500px] rounded-lg">
        {/* TikTok Logo */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 448 512" 
          className="w-16 h-16 mb-4 fill-white opacity-80"
        >
          <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/>
        </svg>
        
        <h3 className="text-lg font-bold mb-2">TikTok Content Unavailable</h3>
        <p className="text-white/70 text-sm mb-4 text-center px-4 max-w-md">
          This TikTok video couldn't be loaded. The video may be private, deleted, restricted, or there may be network connectivity issues.
        </p>
        
        <div className="text-xs text-red-300 mb-4 max-w-[90%] text-left bg-red-900/20 p-3 rounded font-mono whitespace-pre-wrap">
          <strong>Debug Info:</strong>
          {debugInfo}
          <br/>
          <strong>Method tried:</strong> {embedMethod}
          <br/>
          <strong>URL:</strong> {videoUrl}
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={runNetworkDiagnostics}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
          >
            Run Diagnostics
          </button>
          <a 
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2 bg-white text-black rounded hover:bg-white/90 transition-colors font-medium"
          >
            View on TikTok
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="tiktok-embed-container relative w-full h-full flex items-center justify-center bg-black">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-white text-sm font-medium">Loading TikTok video...</p>
            <p className="text-white/60 text-xs mt-1">Method: {embedMethod}</p>
            {debugInfo && (
              <p className="text-white/40 text-xs mt-1 max-w-md text-center">{debugInfo}</p>
            )}
          </div>
        </div>
      )}
      
      <div 
        ref={containerRef} 
        className="w-full h-full flex items-center justify-center"
        style={{ minHeight: '500px' }}
      />
    </div>
  );
};

export default TikTokEmbed;