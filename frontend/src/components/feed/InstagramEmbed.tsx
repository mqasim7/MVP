// components/embeds/InstagramEmbed.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';

interface InstagramEmbedProps {
  postUrl: string;
}

const InstagramEmbed: React.FC<InstagramEmbedProps> = ({ postUrl }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [debug, setDebug] = useState<string>('');

  useEffect(() => {
    // reset if URL changes
    setLoading(true);
    setErrorMsg(null);
    setDebug('');
    if (containerRef.current) containerRef.current.innerHTML = '';

    // 1) validate
    if (!/(instagram\.com\/(p|reel)\/[^\/]+)/i.test(postUrl)) {
      setErrorMsg('Invalid Instagram URL');
      setLoading(false);
      return;
    }

    // 2) inject blockquote
    const block = document.createElement('blockquote');
    block.className = 'instagram-media';
    block.setAttribute('data-instgrm-permalink', postUrl);
    block.setAttribute('data-instgrm-version', '14');
    block.style.margin = '0 auto';
    block.style.maxWidth = '540px';
    containerRef.current!.appendChild(block);

    // 3) load or reuse script
    const loadOrProcess = () => {
      const win = window as any;
      if (win.instgrm && win.instgrm.Embeds && typeof win.instgrm.Embeds.process === 'function') {
        setDebug('Calling instgrm.Embeds.process()');
        win.instgrm.Embeds.process();
        setLoading(false);
      } else {
        setDebug('Appending embed.js');
        const s = document.createElement('script');
        s.async = true;
        s.src = 'https://www.instagram.com/embed.js';
        s.onload = () => {
          setDebug('embed.js loaded, calling process()');
          // after script loads, run process
          setTimeout(() => {
            const win2 = window as any;
            if (win2.instgrm && win2.instgrm.Embeds) {
              win2.instgrm.Embeds.process();
              setLoading(false);
            } else {
              setErrorMsg('instagram script loaded but no Embeds.process()');
              setLoading(false);
            }
          }, 500);
        };
        s.onerror = () => {
          setErrorMsg('Failed to load Instagram script');
          setLoading(false);
        };
        document.head.appendChild(s);
      }
    };

    loadOrProcess();

    // 5) extend timeout to 10s
    const to = window.setTimeout(() => {
      if (loading) {
        setErrorMsg('Instagram embed timed out');
        setDebug('No iframe detected after 10s');
        setLoading(false);
      }
    }, 10_000);

    return () => clearTimeout(to);
  }, [postUrl]);

  if (errorMsg) {
    return (
      <div className="instagram-embed-error flex flex-col items-center justify-center bg-black text-white p-6 min-h-[300px] rounded">
        <h3 className="text-lg font-bold mb-2">Instagram Content Unavailable</h3>
        <p className="mb-4">{errorMsg}</p>
        {debug && <pre className="text-xs text-red-300 mb-4">{debug}</pre>}
        <a
          href={postUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-white text-black rounded hover:bg-gray-100"
        >
          View on Instagram
        </a>
      </div>
    );
  }

  return (
    <div className="instagram-embed-container relative w-full h-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <div className="loader loading-spinner loading-lg text-white" />
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};

export default InstagramEmbed;
