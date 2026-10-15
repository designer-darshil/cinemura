import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { getMovieGenres, GenreItem } from '../services/tmdb';

export const GenreDiscovery: React.FC = () => {
  const [genres, setGenres] = useState<GenreItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchGenres() {
      try {
        setLoading(true);
        const data = await getMovieGenres();
        if (isMounted) {
          setGenres(data || []);
        }
      } catch (err) {
        console.error('Failed to load genres from TMDb:', err);
        if (isMounted) {
          setGenres([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchGenres();

    return () => {
      isMounted = false;
    };
  }, []);

  // Section-level loading skeleton matching the editorial grid structure
  if (loading) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="GENRE DISCOVERY"
        />
        <div
          className="grid grid-cols-1 min-[440px]:grid-cols-2 lg:grid-cols-3 border-t border-l border-[rgba(255,255,255,0.12)]"
          aria-busy="true"
          aria-label="Loading genre catalog"
        >
          {Array.from({ length: 9 }).map((_, idx) => (
            <div
              key={`genre-skeleton-${idx}`}
              className="flex flex-col justify-between p-6 sm:p-7 lg:p-8 min-h-[170px] sm:min-h-[190px] lg:min-h-[210px] bg-[#0B0B0D] border-r border-b border-[rgba(255,255,255,0.12)] animate-pulse"
            >
              <div className="flex items-center justify-between w-full">
                <div className="w-6 h-3.5 bg-white/10" />
                <div className="w-4 h-4 bg-white/10" />
              </div>
              <div className="mt-8 sm:mt-10 lg:mt-12">
                <div className="w-3/5 h-8 sm:h-9 bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Gracefully hide section if API returns no usable data
  if (!genres || genres.length === 0) {
    return null;
  }

  // Calculate filler cells to preserve uniform outer rectangular grid boundary
  const remainder3 = genres.length % 3;
  const fillers3 = remainder3 === 0 ? 0 : 3 - remainder3;

  const remainder2 = genres.length % 2;
  const fillers2 = remainder2 === 0 ? 0 : 2 - remainder2;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="GENRE DISCOVERY"
      />

      {/* Editorial Connected Grid with shared 1px separators */}
      <div className="grid grid-cols-1 min-[440px]:grid-cols-2 lg:grid-cols-3 border-t border-l border-[rgba(255,255,255,0.12)]">
        {genres.map((genre, index) => {
          const formattedNumber = String(index + 1).padStart(2, '0');

          return (
            <Link
              key={genre.id}
              to={`/genre/${genre.id}/movie`}
              aria-label={`Explore ${genre.name} movies`}
              className="group relative flex flex-col justify-between p-6 sm:p-7 lg:p-8 min-h-[170px] sm:min-h-[190px] lg:min-h-[210px] bg-[#0B0B0D] hover:bg-[#141418] transition-colors duration-200 border-r border-b border-[rgba(255,255,255,0.12)] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#E43D3D] focus-visible:ring-inset cursor-pointer"
            >
              {/* Top row: sequential number and directional arrow */}
              <div className="flex items-center justify-between w-full">
                <span className="font-mono text-xs sm:text-sm tracking-widest text-[#8E8E93] group-hover:text-white transition-colors duration-200">
                  {formattedNumber}
                </span>
                <ArrowUpRight
                  className="w-4 h-4 sm:w-5 sm:h-5 text-[#8E8E93] group-hover:text-[#E43D3D] transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200"
                  aria-hidden="true"
                />
              </div>

              {/* Bottom row: Large bold condensed uppercase genre name */}
              <div className="mt-8 sm:mt-10 lg:mt-12">
                <h3 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl leading-[1.02] tracking-tight uppercase text-[#F2F0EC] group-hover:text-[#E43D3D] transition-colors duration-200">
                  {genre.name}
                </h3>
              </div>
            </Link>
          );
        })}

        {/* Desktop filler cells (3-column layout) to close grid boundary */}
        {Array.from({ length: fillers3 }).map((_, i) => (
          <div
            key={`filler-lg-${i}`}
            aria-hidden="true"
            className="hidden lg:block border-r border-b border-[rgba(255,255,255,0.12)] bg-[#0B0B0D] pointer-events-none"
          />
        ))}

        {/* Tablet / 2-col filler cells to close grid boundary */}
        {Array.from({ length: fillers2 }).map((_, i) => (
          <div
            key={`filler-md-${i}`}
            aria-hidden="true"
            className="hidden min-[440px]:block lg:hidden border-r border-b border-[rgba(255,255,255,0.12)] bg-[#0B0B0D] pointer-events-none"
          />
        ))}
      </div>
    </div>
  );
};
