import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Bookmark, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AnimeItem } from '../types/anime';
import { getAnimeById, getAnimeList } from '../services/animeDb';
import { AnimeDetailPageSkeleton, ErrorState } from '../components/StateViews';
import { AnimeCard } from '../components/AnimeCard';
import { SectionHeader } from '../components/SectionHeader';
import { MediaItem } from '../types';

export const AnimeDetailPage: React.FC = () => {
  const { markAppReady, isInWatchlist, toggleWatchlist } = useApp();
  const { id } = useParams<{ id: string }>();

  const [anime, setAnime] = useState<AnimeItem | null>(null);
  const [relatedAnime, setRelatedAnime] = useState<AnimeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const activeIdRef = useRef<string | undefined>(id);

  const fetchAnimeDetail = async () => {
    if (!id) return;
    activeIdRef.current = id;
    setLoading(true);
    setError(false);

    try {
      const data = await getAnimeById(id);
      if (activeIdRef.current !== id) return; // Stale request guard

      if (!data) {
        setError(true);
      } else {
        // Preload primary artwork before revealing to avoid visual pop
        const artworkUrl = data.image || data.thumb;
        if (artworkUrl) {
          await new Promise<void>((resolve) => {
            const preloader = new Image();
            preloader.src = artworkUrl;
            preloader.onload = () => resolve();
            preloader.onerror = () => resolve();
          });
        }

        if (activeIdRef.current !== id) return;
        setAnime(data);

        // Fetch related anime by primary genre if available
        if (data.genres && data.genres.length > 0) {
          getAnimeList({ genres: data.genres[0], size: 8 })
            .then((res) => {
              if (activeIdRef.current === id) {
                const filtered = (res.data || [])
                  .filter((item) => item.id !== data.id)
                  .slice(0, 6);
                setRelatedAnime(filtered);
              }
            })
            .catch(() => {
              if (activeIdRef.current === id) setRelatedAnime([]);
            });
        }
      }
    } catch (err: any) {
      console.error('Failed to load anime detail:', err);
      if (activeIdRef.current === id) {
        setError(true);
      }
    } finally {
      if (activeIdRef.current === id) {
        setLoading(false);
        markAppReady();
      }
    }
  };

  useEffect(() => {
    activeIdRef.current = id;
    fetchAnimeDetail();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return <AnimeDetailPageSkeleton />;
  }

  if (error || !anime) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pt-28 pb-20 px-4 sm:px-8 mx-auto">
        <ErrorState
          title="ANIME PROFILE UNRESOLVED"
          message="Could not load the requested anime series or feature from the database."
          onRetry={fetchAnimeDetail}
        />
      </div>
    );
  }

  const isSaved = isInWatchlist(anime.id);
  const heroArtwork = anime.image || anime.thumb;

  // MediaItem adapter for AppContext watchlist integration
  const handleToggleWatchlist = () => {
    const adapter: MediaItem = {
      id: anime.id,
      type: 'movie',
      title: anime.title,
      slug: anime.id,
      poster: heroArtwork || '',
      backdrop: heroArtwork || '',
      rating: typeof anime.rank === 'number' ? Math.max(1, 10 - anime.rank / 100) : 0,
      year: new Date().getFullYear(),
      genres: anime.genres || [],
      synopsis: anime.synopsis || '',
      releaseDate: '',
      language: 'ja',
      voteCount: 0,
      runtime: anime.episodes ? `${anime.episodes} EPS` : 'N/A',
      director: 'N/A',
      writers: [],
      cast: []
    };
    toggleWatchlist(adapter);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pb-24 selection:bg-[#E43D3D] selection:text-white">
      {/* ==================================================
          1. HERO SECTION — ARCHITECTURAL EDITORIAL ANIME
         ================================================== */}
      <section className="relative w-full min-h-[82vh] lg:min-h-[90vh] flex flex-col justify-between pt-6 sm:pt-8 pb-10 sm:pb-14 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 overflow-hidden bg-[#0B0B0D]">
        {/* Large Dominant Artwork Canvas */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {heroArtwork ? (
            <img
              src={heroArtwork}
              alt={anime.title}
              className="w-full h-full object-cover object-[60%_30%] filter grayscale contrast-125 opacity-35 sm:opacity-50 lg:opacity-70 scale-100 transition-transform duration-1000 ease-out"
            />
          ) : (
            <div className="w-full h-full bg-[#111114]" />
          )}
          {/* Filmic Multi-Directional Gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0D] via-[#0B0B0D]/85 via-45% to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D] via-[#0B0B0D]/60 via-20% to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B0D]/90 via-transparent to-transparent h-24" />
          <div className="absolute inset-0 film-grain pointer-events-none opacity-30" />
        </div>

        {/* Thin Structural Grid Lines (Asymmetric Architectural Grid) */}
        <div className="absolute top-[46%] left-0 right-0 h-[1px] bg-white/[0.08] pointer-events-none hidden lg:block" />
        <div className="absolute top-0 bottom-0 right-[22%] xl:right-[18%] w-[1px] bg-white/[0.08] pointer-events-none hidden lg:block" />

        {/* Top Kicker Row with Red Line Accent */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-6 h-[2px] bg-[#E43D3D] inline-block" />
            <span className="text-[10px] sm:text-xs font-mono font-medium tracking-[0.25em] text-[#8E8E93] uppercase">
              JAPANESE ANIMATION
            </span>
          </div>

          {/* <Link
            to="/anime"
            className="group flex items-center gap-1.5 text-[10px] sm:text-xs font-mono tracking-wider text-[#8E8E93] hover:text-[#E43D3D] transition-colors uppercase"
          >
            <span>ANIME DIRECTORY</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link> */}
        </div>

        {/* Mid Row: Minimal Editorial Micro-Columns + Asymmetric Metric Block */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto pt-8 pb-4 items-start">
          {/* Left Columns */}
          <div className="lg:col-span-8 xl:col-span-9 flex flex-wrap gap-8 sm:gap-14">
            {/* Column 1: FORMAT */}
            <div className="space-y-1.5 min-w-[140px] max-w-[200px]">
              <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#8E8E93]">
                FORMAT
              </div>
              <p className="text-xs sm:text-sm font-sans text-[#F2F0EC] uppercase">
                {anime.type || 'TV Series'}
              </p>
              {typeof anime.episodes === 'number' && anime.episodes > 0 && (
                <p className="text-[11px] font-mono text-[#8E8E93]">{anime.episodes} Episodes</p>
              )}
              <div className="w-5 h-[2px] bg-[#E43D3D] mt-2.5" />
            </div>

            {/* Column 2: STATUS */}
            <div className="space-y-1.5 min-w-[140px]">
              <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#8E8E93]">
                STATUS
              </div>
              <p className="text-xs sm:text-sm font-sans text-[#F2F0EC] uppercase">
                {anime.status || 'Finished'}
              </p>
              {typeof anime.rank === 'number' && anime.rank > 0 && (
                <p className="text-[11px] font-mono text-[#8E8E93]">Rank #{anime.rank}</p>
              )}
              <div className="w-5 h-[2px] bg-[#E43D3D] mt-2.5" />
            </div>

            {/* Column 3: GENRES */}
            {anime.genres && anime.genres.length > 0 && (
              <div className="space-y-1.5 min-w-[140px] max-w-[220px] hidden sm:block">
                <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#8E8E93]">
                  GENRES
                </div>
                <p className="text-xs sm:text-sm font-sans text-[#F2F0EC] truncate uppercase">
                  {anime.genres.slice(0, 2).join(' • ')}
                </p>
                {anime.synopsis && (
                  <p className="text-[11px] font-sans text-[#8E8E93] line-clamp-1">
                    {anime.synopsis}
                  </p>
                )}
                <div className="w-5 h-[2px] bg-[#E43D3D] mt-2.5" />
              </div>
            )}
          </div>

          {/* Right Asymmetric Metric Block */}
          <div className="lg:col-span-4 xl:col-span-3 lg:pl-8 space-y-1.5">
            <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#8E8E93]">
              TOP RANK
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-display font-light text-white tracking-tight">
                {typeof anime.rank === 'number' && anime.rank > 0 ? `#${anime.rank}` : '—'}
              </span>
            </div>
            <div className="w-6 h-[2px] bg-[#E43D3D] mt-2.5" />
          </div>
        </div>

        {/* Bottom Row: Oversized Title, Actions & Thumbnail Card */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6 pt-4">
          {/* Oversized Title & Navigation Actions */}
          <div className="space-y-4 max-w-4xl">
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-display font-bold text-[#F2F0EC] tracking-tight leading-[0.88] uppercase">
              {anime.title}
            </h1>

            {/* Restrained Navigation / Playback Controls */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {/* Watchlist Toggle CTA */}
              <button
                type="button"
                onClick={handleToggleWatchlist}
                className={`min-h-[44px] px-6 py-2.5 text-xs font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-2.5 transition-all shadow-lg ${
                  isSaved
                    ? 'bg-[#E43D3D] text-white shadow-[#E43D3D]/30'
                    : 'bg-[#0B0B0D]/50 hover:bg-white/10 border border-white/20 text-[#F2F0EC] backdrop-blur-sm'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
                <span>{isSaved ? 'SAVED TO WATCHLIST' : 'ADD TO WATCHLIST'}</span>
              </button>

              {/* External Source Link */}
              {anime.link && (
                <a
                  href={anime.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#0B0B0D]/50 hover:bg-white/10 border border-white/20 text-[#F2F0EC] min-h-[44px] px-5 py-2.5 text-xs font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all backdrop-blur-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#E43D3D]" />
                  <span>VIEW SOURCE</span>
                </a>
              )}
            </div>
          </div>

          {/* Right Bottom Anchor: Artwork Thumbnail & Numeric Index */}
          <div className="flex items-end gap-5 lg:ml-auto">
            {/* Small Artwork Thumbnail */}
            <div className="relative w-20 h-28 sm:w-24 sm:h-32 border border-white/15 bg-[#111114] shadow-2xl overflow-hidden flex-shrink-0 group">
              {heroArtwork ? (
                <img
                  src={heroArtwork}
                  alt={anime.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] font-mono text-[#8E8E93]">
                  POSTER
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Pagination / Index / Navigation Arrows */}
            <div className="space-y-2">
              <div className="text-[11px] font-mono tracking-widest text-[#8E8E93]">
                {anime.episodes ? `EP / ${anime.episodes}` : '01 / 01'}
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to="/anime"
                  title="Back to Anime"
                  className="w-8 h-8 rounded-full border border-white/20 hover:border-white/50 flex items-center justify-center text-[#8E8E93] hover:text-white transition-all bg-[#0B0B0D]/50"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
                <a
                  href="#overview-section"
                  title="Overview"
                  className="w-8 h-8 rounded-full border border-white/20 hover:border-white/50 flex items-center justify-center text-[#8E8E93] hover:text-white transition-all bg-[#0B0B0D]/50"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          2. ANIME INFORMATION — OVERVIEW & SPECIFICATIONS
         ================================================== */}
      <section id="overview-section" className="w-full mt-12 sm:mt-16 lg:mt-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 scroll-mt-28">
        
        {/* Section Header */}
        <div className="flex flex-col gap-1 border-b border-white/10 pb-4 mb-8">
          <div className="flex items-center gap-2.5">
            <span className="w-4 h-[2px] bg-[#E43D3D] inline-block" />
            <span className="text-[10px] font-mono tracking-[0.25em] text-[#8E8E93] uppercase font-medium">
              ARCHIVE DOSSIER & SPECIFICATIONS
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-[#F2F0EC] uppercase tracking-tight">
            ANIME SYNOPSIS & SPECS
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT: ABOUT THE ANIME */}
          <div className="lg:col-span-7 space-y-6">
            <p className="font-sans text-base sm:text-lg leading-relaxed text-[#F2F0EC]/90 font-light whitespace-pre-line">
              {anime.synopsis || 'Full narrative synopsis pending archive update.'}
            </p>

            {/* Alternative Titles if available */}
            {anime.alternativeTitles && anime.alternativeTitles.length > 0 && (
              <div className="p-4 bg-[#111114] border border-white/10 space-y-1.5">
                <span className="text-[10px] font-mono tracking-[0.2em] text-[#8E8E93] uppercase font-bold block">
                  ALTERNATIVE TITLES
                </span>
                <p className="text-xs font-mono text-[#F2F0EC]/80 leading-relaxed">
                  {anime.alternativeTitles.join(' • ')}
                </p>
              </div>
            )}

            {/* Genres Tag Row */}
            {anime.genres && anime.genres.length > 0 && (
              <div className="pt-2">
                <span className="text-[10px] font-mono tracking-widest text-[#8E8E93] uppercase font-bold block mb-2.5">
                  GENRE ARCHIVE
                </span>
                <div className="flex flex-wrap gap-2">
                  {anime.genres.map((genre, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-[11px] font-mono bg-[#111114] border border-white/10 text-[#8E8E93] hover:text-[#F2F0EC] hover:border-white/20 transition-colors"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: ARCHITECTURAL PRODUCTION FACTS MATRIX */}
          <div className="lg:col-span-5 bg-[#111114] border border-white/10 shadow-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/10 bg-[#17171B]/50 flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-[0.25em] text-[#8E8E93] uppercase font-bold">
                SPECIFICATIONS
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#E43D3D]" />
            </div>

            <div className="divide-y divide-white/10 text-xs font-mono">
              {anime.status && (
                <div className="px-5 py-3 flex items-center justify-between">
                  <span className="text-[10px] text-[#8E8E93] uppercase tracking-wider">STATUS</span>
                  <span className="text-[#F2F0EC] font-semibold">{anime.status}</span>
                </div>
              )}

              {anime.type && (
                <div className="px-5 py-3 flex items-center justify-between">
                  <span className="text-[10px] text-[#8E8E93] uppercase tracking-wider">FORMAT</span>
                  <span className="text-[#F2F0EC] font-semibold uppercase">{anime.type}</span>
                </div>
              )}

              {typeof anime.episodes === 'number' && anime.episodes > 0 && (
                <div className="px-5 py-3 flex items-center justify-between">
                  <span className="text-[10px] text-[#8E8E93] uppercase tracking-wider">TOTAL EPISODES</span>
                  <span className="text-[#F2F0EC] font-semibold">{anime.episodes}</span>
                </div>
              )}

              {typeof anime.rank === 'number' && anime.rank > 0 && (
                <div className="px-5 py-3 flex items-center justify-between">
                  <span className="text-[10px] text-[#8E8E93] uppercase tracking-wider">OVERALL RANK</span>
                  <span className="text-[#E43D3D] font-bold">#{anime.rank}</span>
                </div>
              )}
            </div>

            {anime.link && (
              <div className="p-4 border-t border-white/10 bg-[#17171B]/30">
                <a
                  href={anime.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-mono text-[#8E8E93] hover:text-[#E43D3D] transition-colors bg-white/5 border border-white/10 px-3 py-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#E43D3D]" />
                  <span>SOURCE ENTRY</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ==================================================
          3. RELATED ANIME SECTION — MORE LIKE THIS
         ================================================== */}
      {relatedAnime.length > 0 && (
        <section className="w-full mt-12 sm:mt-16 lg:mt-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 space-y-6">
          <SectionHeader
            label="RECOMMENDATIONS"
            title="MORE LIKE THIS"
            description="Related animation works sharing thematic depth and style."
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {relatedAnime.map((item) => (
              <AnimeCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default AnimeDetailPage;
