import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Bookmark, Award, ExternalLink } from 'lucide-react';
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
          1. HERO SECTION — MATCHING MOVIE & TV DETAIL DESIGN
         ================================================== */}
      <section className="relative w-full min-h-[70vh] sm:min-h-[78vh] lg:min-h-[85vh] flex flex-col justify-between pt-24 pb-12 sm:pb-16 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 overflow-hidden">
        {/* Ambient Backdrop Canvas */}
        <div className="absolute inset-0 z-0">
          {heroArtwork ? (
            <img
              src={heroArtwork}
              alt={anime.title}
              className="w-full h-full object-cover filter brightness-50 contrast-110 scale-105 transition-transform duration-1000 ease-out"
            />
          ) : (
            <div className="w-full h-full bg-[#111114]" />
          )}
          {/* Gradient Vignette & Tint matching Movie/TV heroes */}
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#0B0B0D] via-[#0B0B0D]/85 to-transparent" />
          <div className="absolute inset-0 film-grain pointer-events-none opacity-40" />
        </div>

        {/* Top Header / Breadcrumb Row */}
        <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
          <Link
            to="/anime"
            className="group flex items-center gap-2 text-xs font-mono tracking-wider text-[#8E8E93] hover:text-[#E43D3D] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>ANIME DIRECTORY</span>
          </Link>

          <div className="flex items-center gap-3">
            {anime.type && (
              <span className="text-[10px] font-mono tracking-widest px-2 py-0.5 border border-white/20 text-[#F2F0EC] uppercase">
                {anime.type}
              </span>
            )}
            {anime.status && (
              <span className="text-[10px] font-mono tracking-[0.2em] text-[#8E8E93] uppercase">
                {anime.status}
              </span>
            )}
          </div>
        </div>

        {/* Hero Bottom Canvas: Title & High-Level Metadata */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pt-12 sm:pt-20">
          <div className="lg:col-span-9 space-y-4 sm:space-y-5">
            {/* Rank Kicker if available */}
            {typeof anime.rank === 'number' && anime.rank > 0 && (
              <div className="flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-[#E43D3D]" />
                <span className="text-xs sm:text-sm font-mono tracking-[0.25em] text-[#E43D3D] uppercase font-bold">
                  TOP RANKED #{anime.rank}
                </span>
              </div>
            )}

            {/* Anime Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-display font-bold text-[#F2F0EC] tracking-tight uppercase leading-none">
              {anime.title}
            </h1>

            {/* Fast-Scannable Spec Row */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs sm:text-sm font-mono text-[#8E8E93]">
              {typeof anime.rank === 'number' && anime.rank > 0 && (
                <>
                  <span className="flex items-center gap-1.5 text-white font-bold">
                    <Star className="w-4 h-4 fill-[#E43D3D] text-[#E43D3D]" />
                    <span>#{anime.rank}</span>
                  </span>
                  <span>•</span>
                </>
              )}
              {anime.type && (
                <>
                  <span className="text-[#F2F0EC] uppercase">{anime.type}</span>
                  <span>•</span>
                </>
              )}
              {typeof anime.episodes === 'number' && anime.episodes > 0 && (
                <>
                  <span className="text-[#F2F0EC]">{anime.episodes} EPISODES</span>
                  <span>•</span>
                </>
              )}
              {anime.genres && anime.genres.length > 0 && (
                <span className="text-[#F2F0EC] uppercase">
                  {anime.genres.slice(0, 3).join(' / ')}
                </span>
              )}
            </div>

            {/* Short Overview Excerpt */}
            {anime.synopsis && (
              <p className="text-sm sm:text-base font-light text-[#F2F0EC]/85 max-w-3xl line-clamp-3 leading-relaxed">
                {anime.synopsis}
              </p>
            )}

            {/* Actions (Touch targets min 44px) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
              {/* Watchlist Toggle CTA */}
              <button
                type="button"
                onClick={handleToggleWatchlist}
                className={`min-h-[44px] px-6 py-3 text-xs font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-2.5 transition-all border w-full sm:w-auto ${
                  isSaved
                    ? 'bg-[#E43D3D] text-white border-[#E43D3D]'
                    : 'bg-transparent hover:bg-white/5 border-white/20 text-[#F2F0EC]'
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
                  className="bg-transparent hover:bg-white/5 border border-white/20 text-[#F2F0EC] min-h-[44px] px-6 py-3 text-xs font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all w-full sm:w-auto"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#E43D3D]" />
                  <span>VIEW SOURCE</span>
                </a>
              )}
            </div>
          </div>

          {/* Secondary Visual Anchor: Docked Poster Card (matching MovieDetailPage) */}
          <div className="lg:col-span-3 hidden lg:block">
            <div className="relative aspect-[2/3] max-w-[260px] ml-auto border border-white/10 bg-[#111114] overflow-hidden">
              {heroArtwork ? (
                <img
                  src={heroArtwork}
                  alt={anime.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-mono text-[#8E8E93]">
                  NO POSTER
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-50 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          2. ANIME INFORMATION — OVERVIEW & SPECIFICATIONS
         ================================================== */}
      <section id="overview-section" className="w-full mt-10 sm:mt-12 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start border-t border-white/5 pt-8">
          {/* LEFT: ABOUT THE ANIME */}
          <div className="lg:col-span-7 space-y-5">
            <h2 className="text-lg sm:text-xl font-bold text-[#F2F0EC] uppercase tracking-wide">
              ABOUT THE ANIME
            </h2>

            <p className="font-sans text-base leading-relaxed text-[#F2F0EC]/90 font-light whitespace-pre-line">
              {anime.synopsis || 'Full narrative synopsis pending archive update.'}
            </p>

            {/* Alternative Titles if available */}
            {anime.alternativeTitles && anime.alternativeTitles.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <span className="text-xs font-mono text-[#8E8E93] uppercase font-semibold">
                  ALSO KNOWN AS:
                </span>
                <p className="text-xs font-mono text-[#F2F0EC]/80 leading-relaxed">
                  {anime.alternativeTitles.join(' • ')}
                </p>
              </div>
            )}

            {/* Genres Tag Row */}
            {anime.genres && anime.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {anime.genres.map((genre, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 text-xs font-mono bg-white/5 border border-white/10 text-[#F2F0EC]"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: COMPACT KEY PRODUCTION FACTS (matching Movie/TV layout) */}
          <div className="lg:col-span-5 bg-[#111114] border border-white/5 p-5 sm:p-6 space-y-4">
            <h3 className="text-xs font-mono tracking-widest text-[#8E8E93] uppercase font-semibold">
              SPECIFICATIONS
            </h3>

            <dl className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs font-mono">
              {anime.status && (
                <div>
                  <dt className="text-[#8E8E93] uppercase">STATUS</dt>
                  <dd className="text-[#F2F0EC] font-semibold mt-0.5">{anime.status}</dd>
                </div>
              )}

              {anime.type && (
                <div>
                  <dt className="text-[#8E8E93] uppercase">FORMAT</dt>
                  <dd className="text-[#F2F0EC] font-semibold mt-0.5 uppercase">{anime.type}</dd>
                </div>
              )}

              {typeof anime.episodes === 'number' && anime.episodes > 0 && (
                <div>
                  <dt className="text-[#8E8E93] uppercase">TOTAL EPISODES</dt>
                  <dd className="text-[#F2F0EC] font-semibold mt-0.5">{anime.episodes}</dd>
                </div>
              )}

              {typeof anime.rank === 'number' && anime.rank > 0 && (
                <div>
                  <dt className="text-[#8E8E93] uppercase">OVERALL RANK</dt>
                  <dd className="text-[#E43D3D] font-bold mt-0.5">#{anime.rank}</dd>
                </div>
              )}
            </dl>

            {anime.link && (
              <div className="pt-4 border-t border-white/10">
                <a
                  href={anime.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-mono text-[#8E8E93] hover:text-[#E43D3D] transition-colors"
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
        <section className="w-full mt-14 sm:mt-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 space-y-6">
          <SectionHeader title="MORE LIKE THIS" />
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
