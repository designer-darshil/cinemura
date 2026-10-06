import React, { useState, useMemo } from 'react';
import { Play } from 'lucide-react';
import { VideoItem } from '../types';
import { useApp } from '../context/AppContext';

interface MediaVideosSectionProps {
  videos: VideoItem[];
  parentTitle: string;
  id?: string;
}

export const MediaVideosSection: React.FC<MediaVideosSectionProps> = ({
  videos,
  parentTitle,
  id = 'videos-section'
}) => {
  const { openVideoPlayer } = useApp();
  const [selectedType, setSelectedType] = useState<string>('ALL');

  // Dynamically derive available video types strictly from real API data
  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    videos.forEach((v) => {
      if (v.type && v.type.trim()) {
        types.add(v.type.trim());
      }
    });
    return Array.from(types);
  }, [videos]);

  // Filter videos based on selection
  const filteredVideos = useMemo(() => {
    if (selectedType === 'ALL') return videos;
    return videos.filter(
      (v) => (v.type || '').trim().toLowerCase() === selectedType.toLowerCase()
    );
  }, [videos, selectedType]);

  if (!videos || videos.length === 0) return null;

  return (
    <section id={id} className="space-y-6 scroll-mt-28">
      {/* Header and dynamic filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-mono tracking-[0.25em] text-[#E43D3D] uppercase font-bold block mb-1">
            OFFICIAL MEDIA
          </span>
          <div className="flex items-baseline gap-3">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F2F0EC] uppercase tracking-tight">
              VIDEOS
            </h2>
            <span className="text-xs font-mono text-[#8E8E93] bg-white/5 border border-white/10 px-2 py-0.5">
              {filteredVideos.length} {filteredVideos.length === 1 ? 'VIDEO' : 'VIDEOS'}
            </span>
          </div>
        </div>

        {/* Dynamic Video Type Filter (rendered only when multiple types exist) */}
        {availableTypes.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <button
              type="button"
              onClick={() => setSelectedType('ALL')}
              className={`px-3 py-1 text-[11px] font-mono tracking-wider uppercase transition-all whitespace-nowrap border ${
                selectedType === 'ALL'
                  ? 'bg-[#E43D3D] border-[#E43D3D] text-white font-bold'
                  : 'bg-[#111114] border-white/15 text-[#8E8E93] hover:text-[#F2F0EC] hover:border-white/30'
              }`}
            >
              ALL ({videos.length})
            </button>
            {availableTypes.map((t) => {
              const count = videos.filter((v) => (v.type || '').trim().toLowerCase() === t.toLowerCase()).length;
              const isActive = selectedType.toLowerCase() === t.toLowerCase();
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedType(t)}
                  className={`px-3 py-1 text-[11px] font-mono tracking-wider uppercase transition-all whitespace-nowrap border ${
                    isActive
                      ? 'bg-[#E43D3D] border-[#E43D3D] text-white font-bold'
                      : 'bg-[#111114] border-white/15 text-[#8E8E93] hover:text-[#F2F0EC] hover:border-white/30'
                  }`}
                >
                  {t} ({count})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Responsive Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredVideos.map((video, idx) => {
          const youtubeThumb = `https://img.youtube.com/vi/${video.key}/hqdefault.jpg`;

          return (
            <div
              key={video.id || idx}
              onClick={() => openVideoPlayer(filteredVideos, idx, parentTitle)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openVideoPlayer(filteredVideos, idx, parentTitle);
                }
              }}
              className="group relative bg-[#111114] border border-white/10 hover:border-[#E43D3D] transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden shadow-lg"
            >
              {/* 16:9 Thumbnail Container */}
              <div className="relative aspect-video w-full bg-black overflow-hidden">
                <img
                  src={youtubeThumb}
                  alt={video.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />

                {/* Centered Simple Play Control */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 bg-[#E43D3D] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 fill-white pl-0.5" />
                  </div>
                </div>

                {/* Video Badges: Type & Official */}
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <span className="text-[9px] font-mono font-extrabold uppercase px-2 py-0.5 bg-black/80 text-white border border-white/20">
                    {video.type || 'VIDEO'}
                  </span>
                  {video.official && (
                    <span className="text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 bg-[#E43D3D] text-white">
                      OFFICIAL
                    </span>
                  )}
                </div>

                {/* Quality / Size Indicator when available */}
                {video.size && (
                  <div className="absolute bottom-2 right-2">
                    <span className="text-[9px] font-mono font-bold bg-black/80 text-[#8E8E93] px-1.5 py-0.5 border border-white/15">
                      {video.size}P
                    </span>
                  </div>
                )}
              </div>

              {/* Title & Type Metadata */}
              <div className="p-3 space-y-1">
                <h3 className="font-serif font-bold text-sm text-[#F2F0EC] group-hover:text-[#E43D3D] transition-colors line-clamp-1">
                  {video.name}
                </h3>
                <div className="text-[11px] font-mono text-[#8E8E93] flex items-center justify-between">
                  <span>{video.site || 'YOUTUBE'}</span>
                  <span className="uppercase text-[#E43D3D] font-bold">{video.type}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
