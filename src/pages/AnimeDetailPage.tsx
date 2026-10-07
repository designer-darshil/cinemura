import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AnimeItem, AnimeApiError } from '../types/anime';
import { getAnimeById } from '../services/animeDb';

export const AnimeDetailPage: React.FC = () => {
  const { markAppReady } = useApp();
  const { id } = useParams<{ id: string }>();

  const [anime, setAnime] = useState<AnimeItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<AnimeApiError | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!id) return;

    setLoading(true);
    setApiError(null);

    getAnimeById(id)
      .then((data) => {
        setAnime(data);
      })
      .catch((err) => {
        console.error('Failed to load anime detail:', err);
        setApiError(err as AnimeApiError);
      })
      .finally(() => {
        setLoading(false);
        markAppReady();
      });
  }, [id, markAppReady]);

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pb-24 selection:bg-[#E43D3D] selection:text-white">
      {/* Top Header / Breadcrumb */}
      <div className="pt-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 w-full">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <Link
            to="/anime"
            className="group flex items-center gap-2 text-xs font-mono tracking-wider text-[#8E8E93] hover:text-[#E43D3D] transition-colors min-h-[44px] flex items-center"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>ANIME DIRECTORY</span>
          </Link>

          <span className="text-[10px] font-mono tracking-[0.25em] text-[#8E8E93] uppercase">
            OVERVIEW
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 mt-8">
        {/* Error State */}
        {apiError && (
          <div className="bg-[#111114] border border-white/10 p-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-2.5 h-2.5 bg-[#E43D3D] mx-auto" />
            <h3 className="font-display font-bold text-lg text-white uppercase tracking-wider">
              ANIME DATA UNAVAILABLE
            </h3>
            <p className="text-xs font-sans text-[#8E8E93] leading-relaxed">
              {apiError.message || 'Unable to retrieve anime details at this time.'}
            </p>
            <Link
              to="/anime"
              className="btn-primary min-h-[44px] px-6 text-xs uppercase inline-flex items-center gap-2"
            >
              <span>BACK TO ANIME CATALOG</span>
            </Link>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="bg-[#111114] border border-white/10 p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
            <div className="lg:col-span-4 aspect-[2/3] max-w-xs mx-auto lg:max-w-none w-full bg-[#18181D]" />
            <div className="lg:col-span-8 space-y-4">
              <div className="h-4 w-24 bg-white/10" />
              <div className="h-10 w-3/4 bg-white/10" />
              <div className="h-4 w-1/2 bg-white/10" />
              <div className="h-32 w-full bg-white/10 pt-4" />
            </div>
          </div>
        )}

        {/* Real Anime Detail */}
        {!loading && !apiError && anime && (
          <article className="bg-[#111114] border border-white/10 p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative overflow-hidden shadow-2xl">
            {/* Ambient Background Blur Glow (Subtle) */}
            {anime.image && (
              <div
                className="absolute inset-0 opacity-10 bg-cover bg-center pointer-events-none filter blur-2xl"
                style={{ backgroundImage: `url(${anime.image})` }}
              />
            )}

            {/* LEFT: Cover Poster */}
            <div className="lg:col-span-4 max-w-[280px] sm:max-w-xs lg:max-w-none mx-auto w-full relative z-10">
              <div className="aspect-[2/3] bg-black border border-white/20 overflow-hidden shadow-2xl relative">
                {anime.image ? (
                  <img
                    src={anime.image}
                    alt={anime.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#8E8E93] text-xs font-mono">
                    NO IMAGE
                  </div>
                )}
                {typeof anime.rank === 'number' && anime.rank > 0 && (
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-[#E43D3D] text-white px-2.5 py-1 shadow-lg">
                    <Award className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono font-extrabold tracking-wider">
                      RANK #{anime.rank}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Metadata & Synopsis */}
            <div className="lg:col-span-8 space-y-6 relative z-10">
              {/* Type & Status Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {anime.type && (
                  <span className="text-[10px] font-mono font-extrabold tracking-[0.2em] px-2.5 py-1 uppercase bg-[#E43D3D] text-white">
                    {anime.type}
                  </span>
                )}
                {anime.status && (
                  <span className="text-[10px] font-mono font-semibold tracking-widest px-2.5 py-1 bg-white/10 text-white border border-white/20 uppercase">
                    {anime.status}
                  </span>
                )}
                {typeof anime.episodes === 'number' && anime.episodes > 0 && (
                  <span className="text-[10px] font-mono font-semibold tracking-widest px-2.5 py-1 bg-black/60 text-[#F2F0EC] border border-white/20">
                    {anime.episodes} EPISODES
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl font-display font-bold text-[#F2F0EC] tracking-tight uppercase leading-none">
                {anime.title}
              </h1>

              {/* Genres Tag Row */}
              {anime.genres && anime.genres.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] font-mono tracking-widest text-[#8E8E93] uppercase block font-bold">
                    GENRES:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {anime.genres.map((genre, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 text-xs font-mono bg-white/5 border border-white/10 text-[#F2F0EC]"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Synopsis Section */}
              {anime.synopsis && (
                <div className="space-y-2 pt-4 border-t border-white/10">
                  <span className="text-[10px] font-mono tracking-[0.2em] text-[#E43D3D] uppercase block font-bold">
                    NARRATIVE SYNOPSIS
                  </span>
                  <p className="text-sm sm:text-base font-light text-[#F2F0EC]/90 leading-relaxed font-sans whitespace-pre-line">
                    {anime.synopsis}
                  </p>
                </div>
              )}

              {/* Additional Real Specifications */}
              <div className="pt-6 border-t border-white/10">
                <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono">
                  <div>
                    <dt className="text-[#8E8E93] uppercase">DATABASE ID</dt>
                    <dd className="text-[#F2F0EC] font-semibold mt-0.5">{anime.id}</dd>
                  </div>
                  {typeof anime.rank === 'number' && (
                    <div>
                      <dt className="text-[#8E8E93] uppercase">OVERALL RANK</dt>
                      <dd className="text-[#E43D3D] font-bold mt-0.5">#{anime.rank}</dd>
                    </div>
                  )}
                  {typeof anime.episodes === 'number' && (
                    <div>
                      <dt className="text-[#8E8E93] uppercase">TOTAL EPISODES</dt>
                      <dd className="text-[#F2F0EC] font-semibold mt-0.5">{anime.episodes}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </article>
        )}
      </div>
    </div>
  );
};

export default AnimeDetailPage;
