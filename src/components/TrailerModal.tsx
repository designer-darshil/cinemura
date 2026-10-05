import React from 'react';
import { X, Film } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const TrailerModal: React.FC = () => {
  const { trailerUrl, trailerTitle, closeTrailer } = useApp();

  if (!trailerUrl) return null;

  let embedUrl = trailerUrl;
  if (trailerUrl.includes('watch?v=')) {
    const videoId = trailerUrl.split('watch?v=')[1]?.split('&')[0];
    embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  } else if (!trailerUrl.includes('autoplay=1') && trailerUrl.includes('youtube.com/embed')) {
    embedUrl = `${trailerUrl}?autoplay=1`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="absolute inset-0" onClick={closeTrailer} />

      <div className="relative w-full max-w-5xl bg-[#121215] border border-white/15 shadow-2xl overflow-hidden z-10">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/12 bg-[#0B0B0D]">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-[#E43D3D] flex items-center justify-center text-white font-bold">
              <Film className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-editorial-heading text-lg tracking-wider text-white">
              {trailerTitle ? `OFFICIAL TRAILER — ${trailerTitle}` : 'OFFICIAL CINEMATIC PREVIEW'}
            </span>
          </div>

          <button
            onClick={closeTrailer}
            className="p-1.5 text-[#8E8E93] hover:text-[#E43D3D] hover:bg-white/5 transition-all"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Video Aspect Ratio 16:9 Container */}
        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={embedUrl}
            title={trailerTitle || 'Movie Trailer'}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Footer Bar */}
        <div className="px-6 py-3 bg-[#0B0B0D] border-t border-white/12 flex items-center justify-between text-xs text-[#8E8E93]">
          <span>CINEMURA ULTRA HD HIGH-DYNAMIC MEDIA PLAYER</span>
          <span className="font-mono text-[10px]">PRESS ESC TO CLOSE</span>
        </div>
      </div>
    </div>
  );
};
