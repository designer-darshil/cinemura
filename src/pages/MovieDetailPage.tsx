import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Star, ArrowLeft, Calendar, Clock, Globe, Building2, ExternalLink } from 'lucide-react';
import { getMovieDetail, formatCurrency } from '../services/tmdb';
import { Movie } from '../types';
import { useApp } from '../context/AppContext';
import { MediaCard, CastCard } from '../components/MediaCard';
import { SectionHeader } from '../components/SectionHeader';
import { DetailHeroSkeleton, ErrorState } from '../components/StateViews';

export const MovieDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { openTrailer } = useApp();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchDetail = async () => {
    if (!slug) return;
    setLoading(true);
    setError(false);
    try {
      const data = await getMovieDetail(slug);
      if (!data) {
        setError(true);
      } else {
        setMovie(data);
      }
    } catch (err) {
      console.error('Failed to load movie detail', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pt-28 pb-20 px-4 sm:px-8 max-w-site mx-auto">
        <DetailHeroSkeleton />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pt-28 pb-20 px-4 sm:px-8 max-w-site mx-auto">
        <ErrorState
          title="MOVIE NOT FOUND"
          message="Could not load the requested feature film details from the live database."
          onRetry={fetchDetail}
        />
      </div>
    );
  }

  const formattedBudget = formatCurrency(movie.budget);
  const formattedRevenue = formatCurrency(movie.revenue);
  const relatedMovies = movie.recommendations?.length ? movie.recommendations : (movie.similar || []);

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pb-24 space-y-16">
      
      {/* HERO SECTION */}
      <section className="relative min-h-[75vh] flex flex-col justify-end pt-28 pb-12 px-4 sm:px-8 max-w-site mx-auto overflow-hidden">
        
        <div className="absolute inset-0 z-0">
          <img
            src={movie.backdrop}
            alt={movie.title}
            className="w-full h-full object-cover filter brightness-50 contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D] via-[#0B0B0D]/70 to-black/80" />
          <div className="absolute inset-0 film-grain pointer-events-none" />
        </div>

        <div className="relative z-10 w-full mb-8">
          <Link to="/movie" className="btn-link text-[#929298] hover:text-[#E43D3D]">
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO MOVIES DIRECTORY</span>
          </Link>
        </div>

        <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
          
          <div className="lg:col-span-8 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="type-label bg-[#E43D3D] text-white px-2.5 py-1">
                FEATURE FILM
              </span>
              {movie.certification && (
                <span className="type-label border border-white/20 text-white px-2 py-0.5">
                  {movie.certification}
                </span>
              )}
              <div className="flex items-center gap-1 bg-white/10 px-2.5 py-0.5 text-xs text-[#E43D3D] font-bold">
                <Star className="w-3.5 h-3.5 fill-[#E43D3D]" />
                <span>{movie.rating.toFixed(1)} / 10</span>
                {movie.voteCount > 0 && <span className="text-[10px] text-[#929298]">({movie.voteCount.toLocaleString()} votes)</span>}
              </div>
            </div>

            <div className="space-y-1">
              <h1 className="type-display-l text-white">
                {movie.title}
              </h1>
              {movie.originalTitle && (
                <p className="text-xs font-mono text-[#929298]">
                  Original Title: {movie.originalTitle}
                </p>
              )}
            </div>

            {movie.tagline && (
              <p className="type-h3 text-[#E43D3D]">
                "{movie.tagline}"
              </p>
            )}

            <div className="flex flex-wrap items-center gap-6 text-xs text-[#929298] font-mono border-y border-white/10 py-3">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#E43D3D]" /> {movie.releaseDate || movie.year}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#E43D3D]" /> {movie.runtime}
              </span>
              <span className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#E43D3D]" /> {movie.language}
              </span>
              {movie.genres.length > 0 && (
                <span className="text-white uppercase font-bold">{movie.genres.join(' • ')}</span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              {movie.trailerUrl && (
                <button
                  onClick={() => openTrailer(movie.trailerUrl!, movie.title)}
                  className="btn-primary"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>WATCH TRAILER →</span>
                </button>
              )}

              {movie.imdbId && (
                <a
                  href={`https://www.imdb.com/title/${movie.imdbId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary flex items-center gap-2 text-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#E43D3D]" />
                  <span>IMDB PROFILE</span>
                </a>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 hidden lg:block">
            <div className="aspect-[2/3] bg-black border border-white/20 p-2">
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

        </div>

      </section>

      {/* MOVIE DETAILS PANEL */}
      <section className="max-w-site mx-auto px-4 sm:px-8">
        <div className="bg-[#111114] border border-white/10 p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 text-xs font-mono">
          <div className="space-y-1">
            <span className="type-label text-[#929298] block">DIRECTOR</span>
            <span className="type-h3 text-white block">{movie.director}</span>
          </div>

          <div className="space-y-1">
            <span className="type-label text-[#929298] block">WRITERS</span>
            <span className="type-h3 text-white block truncate">{movie.writers.join(', ') || 'N/A'}</span>
          </div>

          <div className="space-y-1">
            <span className="type-label text-[#929298] block">STATUS</span>
            <span className="type-h3 text-[#E43D3D] block">{movie.status || 'Released'}</span>
          </div>

          <div className="space-y-1">
            <span className="type-label text-[#929298] block">ORIGINAL LANGUAGE</span>
            <span className="type-h3 text-white block uppercase">{movie.language}</span>
          </div>

          {formattedBudget && (
            <div className="space-y-1">
              <span className="type-label text-[#929298] block">BUDGET</span>
              <span className="type-h3 text-white block">{formattedBudget}</span>
            </div>
          )}

          {formattedRevenue && (
            <div className="space-y-1">
              <span className="type-label text-[#929298] block">REVENUE</span>
              <span className="type-h3 text-white block">{formattedRevenue}</span>
            </div>
          )}
        </div>
      </section>

      {/* OVERVIEW / SYNOPSIS */}
      <section className="max-w-site mx-auto px-4 sm:px-8 space-y-4">
        <SectionHeader
          label="OVERVIEW"
          title="ABOUT THE MOVIE"
        />
        <p className="type-body-l max-w-4xl text-[#F2F0EC]/90 leading-relaxed font-light">
          {movie.synopsis}
        </p>

        {movie.spokenLanguages && movie.spokenLanguages.length > 0 && (
          <div className="pt-2 text-xs font-mono text-[#929298]">
            Spoken Languages: <span className="text-white">{movie.spokenLanguages.join(', ')}</span>
          </div>
        )}
      </section>

      {/* COLLECTION / FRANCHISE */}
      {movie.collection && (
        <section className="max-w-site mx-auto px-4 sm:px-8 space-y-4">
          <SectionHeader
            label="COLLECTION"
            title={movie.collection.name.toUpperCase()}
          />
          <div className="relative bg-[#111114] border border-white/10 p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 overflow-hidden">
            {movie.collection.backdrop && (
              <img
                src={movie.collection.backdrop}
                alt={movie.collection.name}
                className="absolute inset-0 w-full h-full object-cover opacity-20 filter brightness-50"
              />
            )}
            <div className="relative z-10 w-24 h-36 flex-shrink-0 bg-black border border-white/10">
              <img
                src={movie.collection.poster || movie.poster}
                alt={movie.collection.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative z-10 space-y-2">
              <span className="type-label text-[#E43D3D]">PART OF THE FRANCHISE</span>
              <h3 className="type-h3 text-xl text-white">{movie.collection.name}</h3>
              <p className="type-small font-mono text-[#929298]">
                Explore all feature films in this official TMDb collection.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* CAST & CREW */}
      {movie.cast && movie.cast.length > 0 && (
        <section className="max-w-site mx-auto px-4 sm:px-8 space-y-6">
          <SectionHeader
            label="CAST"
            title="CAST & CREW"
            viewAllLink="/people"
            viewAllText="VIEW ALL PEOPLE"
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {movie.cast.map(person => (
              <CastCard
                key={person.id}
                id={person.id}
                name={person.name}
                character={person.character}
                image={person.image}
                slug={person.slug}
              />
            ))}
          </div>
        </section>
      )}

      {/* PRODUCTION INFORMATION */}
      {(movie.productionCompanies && movie.productionCompanies.length > 0) && (
        <section className="max-w-site mx-auto px-4 sm:px-8 space-y-4">
          <SectionHeader
            label="PRODUCTION"
            title="STUDIOS & PRODUCTION COMPANIES"
          />
          <div className="flex flex-wrap gap-4">
            {movie.productionCompanies.map(company => (
              <div
                key={company.id}
                className="bg-[#111114] border border-white/10 p-4 flex items-center gap-3 text-xs font-mono text-[#F2F0EC]"
              >
                <Building2 className="w-4 h-4 text-[#E43D3D]" />
                <div>
                  <span className="block font-bold text-white">{company.name}</span>
                  {company.country && <span className="text-[10px] text-[#929298]">{company.country}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* KEYWORDS */}
      {movie.keywords && movie.keywords.length > 0 && (
        <section className="max-w-site mx-auto px-4 sm:px-8 space-y-3">
          <SectionHeader
            label="TAGS"
            title="KEYWORDS & THEMES"
          />
          <div className="flex flex-wrap gap-2 pt-1">
            {movie.keywords.map(keyword => (
              <span
                key={keyword}
                className="text-xs font-mono px-3 py-1 bg-[#111114] border border-white/10 text-[#929298] uppercase"
              >
                #{keyword}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* OFFICIAL TRAILER / PREVIEW */}
      {movie.trailerUrl && (
        <section className="max-w-site mx-auto px-4 sm:px-8 space-y-6">
          <SectionHeader
            label="PREVIEW"
            title="OFFICIAL TRAILER"
          />

          <div
            onClick={() => openTrailer(movie.trailerUrl!, movie.title)}
            className="relative aspect-video w-full bg-[#111114] border border-white/10 overflow-hidden group cursor-pointer"
          >
            <img
              src={movie.backdrop}
              alt={movie.title}
              className="w-full h-full object-cover img-zoom filter brightness-75"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
            
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 bg-[#E43D3D] text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Play className="w-6 h-6 fill-white pl-1" />
              </div>
              <span className="type-label text-white tracking-widest">
                PLAY TRAILER IN ULTRA HD
              </span>
            </div>
          </div>
        </section>
      )}

      {/* RECOMMENDED & SIMILAR MOVIES */}
      {relatedMovies.length > 0 && (
        <section className="max-w-site mx-auto px-4 sm:px-8 space-y-6">
          <SectionHeader
            label="RECOMMENDATIONS"
            title="RELATED MOVIES"
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {relatedMovies.slice(0, 6).map(item => (
              <MediaCard key={item.id} item={item} variant="poster" />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
