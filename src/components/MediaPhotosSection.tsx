import React, { useState } from 'react';
import { PhotoLightboxModal } from './PhotoLightboxModal';
import { PhotosGallerySkeleton } from './StateViews';

interface MediaPhotosSectionProps {
  backdrops?: string[];
  posters?: string[];
  parentTitle: string;
  id?: string;
  loading?: boolean;
}

export const MediaPhotosSection: React.FC<MediaPhotosSectionProps> = ({
  backdrops = [],
  posters = [],
  parentTitle,
  id = 'photos-section',
  loading = false
}) => {
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [lightboxSubTitle, setLightboxSubTitle] = useState<string>('');

  const hasBackdrops = backdrops.length > 0;
  const hasPosters = posters.length > 0;

  if (loading) {
    return (
      <section id={id} className="scroll-mt-28">
        <PhotosGallerySkeleton />
      </section>
    );
  }

  if (!hasBackdrops && !hasPosters) return null;

  const openBackdropAt = (idx: number) => {
    setLightboxImages(backdrops);
    setLightboxIndex(idx);
    setLightboxSubTitle(`${parentTitle} — BACKDROP`);
    setLightboxOpen(true);
  };

  const openPosterAt = (idx: number) => {
    setLightboxImages(posters);
    setLightboxIndex(idx);
    setLightboxSubTitle(`${parentTitle} — POSTER`);
    setLightboxOpen(true);
  };

  return (
    <section id={id} className={`space-y-12 ${lightboxOpen ? '' : 'scroll-mt-28'}`}>
      {/* ==================================================
          1. BACKDROPS GALLERY (LANDSCAPE 16:9 PROPORTIONS)
         ================================================== */}
      {hasBackdrops && (
        <div className="space-y-4">
          <div className="flex items-end justify-between border-b border-white/10 pb-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="w-4 h-[2px] bg-[#E43D3D] inline-block" />
                <span className="text-[10px] font-mono tracking-[0.25em] text-[#8E8E93] uppercase font-medium">
                  VISUAL ARCHIVE
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-[#F2F0EC] tracking-tight uppercase">
                BACKDROPS
              </h2>
            </div>
            <span className="text-xs font-mono text-[#8E8E93] bg-white/5 border border-white/10 px-2 py-0.5">
              {backdrops.length} {backdrops.length === 1 ? 'BACKDROP' : 'BACKDROPS'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {backdrops.slice(0, 16).map((img, idx) => (
              <div
                key={idx}
                onClick={() => openBackdropAt(idx)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openBackdropAt(idx);
                  }
                }}
                className="group relative aspect-video bg-[#111114] border border-white/10 hover:border-white/30 transition-all duration-300 cursor-pointer overflow-hidden shadow-xl"
              >
                <img
                  src={img}
                  alt={`${parentTitle} backdrop ${idx + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover filter grayscale-[15%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-50 group-hover:opacity-75 transition-opacity" />
                <span className="absolute bottom-2 left-2 text-[9px] font-mono tracking-widest bg-black/80 text-[#8E8E93] px-2 py-0.5 border border-white/10">
                  STILL {String(idx + 1).padStart(2, '0')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================
          2. POSTERS GALLERY (PORTRAIT 2:3 PROPORTIONS)
         ================================================== */}
      {hasPosters && (
        <div className="space-y-4">
          <div className="flex items-end justify-between border-b border-white/10 pb-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="w-4 h-[2px] bg-[#E43D3D] inline-block" />
                <span className="text-[10px] font-mono tracking-[0.25em] text-[#8E8E93] uppercase font-medium">
                  PROMOTIONAL ART
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-[#F2F0EC] tracking-tight uppercase">
                POSTERS
              </h2>
            </div>
            <span className="text-xs font-mono text-[#8E8E93] bg-white/5 border border-white/10 px-2 py-0.5">
              {posters.length} {posters.length === 1 ? 'POSTER' : 'POSTERS'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {posters.slice(0, 18).map((img, idx) => (
              <div
                key={idx}
                onClick={() => openPosterAt(idx)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openPosterAt(idx);
                  }
                }}
                className="group relative aspect-[2/3] bg-[#111114] border border-white/10 hover:border-white/30 transition-all duration-300 cursor-pointer overflow-hidden shadow-xl"
              >
                <img
                  src={img}
                  alt={`${parentTitle} poster ${idx + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover filter grayscale-[15%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-50 group-hover:opacity-75 transition-opacity" />
                <span className="absolute bottom-2 left-2 text-[9px] font-mono tracking-widest bg-black/80 text-[#8E8E93] px-2 py-0.5 border border-white/10">
                  POSTER {String(idx + 1).padStart(2, '0')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shared Lightbox Viewer for both Backdrops and Posters */}
      <PhotoLightboxModal
        images={lightboxImages}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        title={lightboxSubTitle}
      />
    </section>
  );
};
