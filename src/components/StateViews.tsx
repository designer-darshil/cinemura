import React from 'react';
import { AlertTriangle, RefreshCw, Search, Film, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/* --- ERROR STATE --- */
interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'UNABLE TO LOAD CATALOG DATA',
  message = 'A network connection or database query error occurred while retrieving live content.',
  onRetry
}) => {
  return (
    <div className="bg-[#111114] border border-white/10 p-8 sm:p-12 text-center max-w-lg mx-auto space-y-5 my-8 animate-fadeIn">
      <div className="w-12 h-12 bg-[#E43D3D]/10 border border-[#E43D3D]/30 text-[#E43D3D] mx-auto flex items-center justify-center">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <div className="space-y-1.5">
        <h3 className="type-h3 text-white uppercase tracking-wider">{title}</h3>
        <p className="type-small font-light text-[#929298] leading-relaxed max-w-sm mx-auto">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-primary inline-flex items-center gap-2 h-10 px-6 text-xs uppercase"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>RETRY CONNECTION</span>
        </button>
      )}
    </div>
  );
};

/* --- CONTEXTUAL EMPTY STATE --- */
interface EmptyStateProps {
  variant?: 'search' | 'genre' | 'category' | 'default';
  title?: string;
  message?: string;
  actionText?: string;
  actionLink?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  variant = 'default',
  title,
  message,
  actionText,
  actionLink,
  onAction
}) => {
  let defaultTitle = 'NO TITLES FOUND';
  let defaultMessage = 'No movies or TV series match your selected criteria.';
  let defaultActionText = 'EXPLORE ALL MOVIES';
  let defaultActionLink = '/movie';

  if (variant === 'search') {
    defaultTitle = 'NO RESULTS';
    defaultMessage = 'Nothing matched your search query.';
    defaultActionText = 'BROWSE ALL CATALOG';
    defaultActionLink = '/movie';
  } else if (variant === 'genre' || variant === 'category') {
    defaultTitle = 'NO TITLES HERE';
    defaultMessage = 'No movies or series are available for this selection.';
    defaultActionText = 'RESET FILTERS';
  }

  const finalTitle = title || defaultTitle;
  const finalMessage = message || defaultMessage;
  const finalActionText = actionText || defaultActionText;

  return (
    <div className="bg-[#111114] border border-white/10 p-8 sm:p-12 text-center max-w-md mx-auto space-y-4 my-8 animate-fadeIn">
      <div className="w-10 h-10 bg-white/5 border border-white/10 text-[#929298] mx-auto flex items-center justify-center">
        {variant === 'search' ? (
          <Search className="w-5 h-5 text-[#E43D3D]" />
        ) : (
          <Film className="w-5 h-5 text-[#E43D3D]" />
        )}
      </div>

      <div className="space-y-1">
        <h3 className="type-h3 text-white uppercase tracking-wider text-base">{finalTitle}</h3>
        <p className="type-small font-light text-[#929298] max-w-xs mx-auto leading-relaxed">{finalMessage}</p>
      </div>

      <div className="pt-2">
        {onAction ? (
          <button
            onClick={onAction}
            className="btn-secondary h-9 px-6 text-xs uppercase"
          >
            {finalActionText}
          </button>
        ) : actionLink || defaultActionLink ? (
          <Link
            to={actionLink || defaultActionLink}
            className="btn-secondary inline-flex items-center gap-2 h-9 px-6 text-xs uppercase"
          >
            <span>{finalActionText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        ) : null}
      </div>
    </div>
  );
};

/* ==================================================
   EXACT COMPONENT SKELETONS
   Dark neutral palette (#141418 surface, #1D1D23 highlight)
   Matching precise component geometry & ratios
   ================================================== */

/* 1. MEDIA CARD SKELETON (Movie / TV / Item) */
export const MediaCardSkeleton: React.FC<{ variant?: 'poster' | 'horizontal' }> = ({
  variant = 'poster'
}) => {
  return (
    <div className="bg-[#111114] border border-white/10 flex flex-col justify-between overflow-hidden">
      <div
        className={`w-full skeleton-pulse ${
          variant === 'poster' ? 'aspect-[2/3]' : 'aspect-[16/9]'
        }`}
      />
      <div className="p-3 space-y-2 flex-grow flex flex-col justify-between">
        <div className="h-3.5 skeleton-pulse w-3/4" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-3 skeleton-pulse w-1/4" />
          <div className="h-3 skeleton-pulse w-1/5" />
        </div>
      </div>
    </div>
  );
};

/* 2. CARD GRID SKELETON */
export const CardGridSkeleton: React.FC<{ count?: number; variant?: 'poster' | 'horizontal' }> = ({
  count = 12,
  variant = 'poster'
}) => {
  return (
    <div
      className={
        variant === 'poster'
          ? 'grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4'
          : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
      }
    >
      {Array.from({ length: count }).map((_, i) => (
        <MediaCardSkeleton key={i} variant={variant} />
      ))}
    </div>
  );
};

/* 3. CAST CARD SKELETON */
export const CastCardSkeleton: React.FC = () => {
  return (
    <div className="flex-shrink-0 w-[130px] sm:w-[150px] md:w-[165px] bg-[#111114] border border-white/10 flex flex-col justify-between overflow-hidden shadow-lg">
      <div className="w-full aspect-[2/3] skeleton-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-3.5 skeleton-pulse w-3/4" />
        <div className="h-3 skeleton-pulse w-1/2" />
      </div>
    </div>
  );
};

/* 4. CAST RAIL SKELETON */
export const CastRailSkeleton: React.FC<{ title?: string; count?: number }> = ({
  title = 'CAST',
  count = 7
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-baseline gap-3">
          <span className="text-[10px] font-mono tracking-[0.25em] text-[#E43D3D] uppercase font-bold">
            CREDITS
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#F2F0EC]/40 tracking-tight uppercase">
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 skeleton-pulse" />
          <div className="w-8 h-8 skeleton-pulse" />
        </div>
      </div>

      <div className="flex items-stretch gap-3 sm:gap-4 overflow-hidden pb-3 pt-1">
        {Array.from({ length: count }).map((_, i) => (
          <CastCardSkeleton key={`cast-skel-${i}`} />
        ))}
      </div>
    </div>
  );
};

/* 5. VIDEO CARD SKELETON */
export const VideoCardSkeleton: React.FC = () => {
  return (
    <div className="bg-[#111114] border border-white/10 flex flex-col justify-between overflow-hidden shadow-lg">
      <div className="aspect-video w-full skeleton-pulse relative flex items-center justify-center">
        <div className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center" />
      </div>
      <div className="p-3 space-y-2">
        <div className="h-3.5 skeleton-pulse w-4/5" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-3 skeleton-pulse w-1/4" />
          <div className="h-3 skeleton-pulse w-1/5" />
        </div>
      </div>
    </div>
  );
};

/* 6. VIDEOS GRID SKELETON */
export const VideosGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-mono tracking-[0.25em] text-[#E43D3D] uppercase font-bold block mb-1">
            OFFICIAL MEDIA
          </span>
          <div className="h-7 w-28 skeleton-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="h-7 w-16 skeleton-pulse" />
          <div className="h-7 w-20 skeleton-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <VideoCardSkeleton key={`video-skel-${i}`} />
        ))}
      </div>
    </div>
  );
};

/* 7. PHOTOS GALLERY SKELETON */
export const PhotosGallerySkeleton: React.FC = () => {
  return (
    <div className="space-y-12">
      {/* Backdrops Rail/Grid */}
      <div className="space-y-4">
        <div className="flex items-baseline justify-between border-b border-white/10 pb-3">
          <div className="flex items-baseline gap-3">
            <span className="text-[10px] font-mono tracking-[0.25em] text-[#E43D3D] uppercase font-bold">
              GALLERY
            </span>
            <div className="h-6 w-32 skeleton-pulse" />
          </div>
          <div className="h-5 w-24 skeleton-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`backdrop-skel-${i}`} className="aspect-video bg-[#111114] border border-white/10 skeleton-pulse" />
          ))}
        </div>
      </div>

      {/* Posters Grid */}
      <div className="space-y-4">
        <div className="flex items-baseline justify-between border-b border-white/10 pb-3">
          <div className="flex items-baseline gap-3">
            <span className="text-[10px] font-mono tracking-[0.25em] text-[#E43D3D] uppercase font-bold">
              PROMOTIONAL
            </span>
            <div className="h-6 w-28 skeleton-pulse" />
          </div>
          <div className="h-5 w-20 skeleton-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`poster-skel-${i}`} className="aspect-[2/3] bg-[#111114] border border-white/10 skeleton-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
};

/* 8. EPISODE CARD SKELETON */
export const EpisodeCardSkeleton: React.FC = () => {
  return (
    <div className="bg-[#111114] border border-white/10 flex flex-col justify-between overflow-hidden shadow-md">
      <div className="relative aspect-video w-full skeleton-pulse">
        <div className="absolute top-2 left-2 w-8 h-4 bg-white/10" />
      </div>
      <div className="p-3.5 space-y-2 flex-grow flex flex-col justify-between">
        <div className="space-y-1.5">
          <div className="h-4 skeleton-pulse w-3/4" />
          <div className="h-3 skeleton-pulse w-1/2" />
          <div className="h-8 skeleton-pulse w-full pt-1" />
        </div>
      </div>
    </div>
  );
};

/* 9. EPISODES SECTION SKELETON */
export const EpisodesSectionSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-mono tracking-[0.25em] text-[#E43D3D] uppercase font-bold block mb-1">
            TELEVISION EPISODES
          </span>
          <div className="h-7 w-32 skeleton-pulse" />
        </div>
        <div className="flex gap-1.5">
          <div className="h-7 w-20 skeleton-pulse" />
          <div className="h-7 w-20 skeleton-pulse" />
          <div className="h-7 w-20 skeleton-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <EpisodeCardSkeleton key={`ep-skel-${i}`} />
        ))}
      </div>
    </div>
  );
};

/* 10. HOMEPAGE HERO SKELETON */
export const HomepageHeroSkeleton: React.FC = () => {
  return (
    <section className="relative min-h-[70vh] lg:min-h-[75vh] flex flex-col justify-end pt-20 pb-8 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 w-full overflow-hidden border-b border-white/10 bg-[#0B0B0D]">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pb-4">
        <div className="lg:col-span-8 space-y-5">
          {/* Badge line */}
          <div className="flex items-center gap-2">
            <div className="h-5 w-24 skeleton-pulse" />
            <div className="h-5 w-28 skeleton-pulse" />
          </div>

          {/* Title line */}
          <div className="h-12 sm:h-16 lg:h-20 w-4/5 max-w-xl skeleton-pulse" />

          {/* Metadata row */}
          <div className="h-4 w-72 skeleton-pulse" />

          {/* Synopsis lines */}
          <div className="space-y-2 max-w-2xl">
            <div className="h-4 w-full skeleton-pulse" />
            <div className="h-4 w-5/6 skeleton-pulse" />
            <div className="h-4 w-3/4 skeleton-pulse" />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-2">
            <div className="h-11 w-40 skeleton-pulse" />
            <div className="h-11 w-32 skeleton-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
};

/* 11. DETAIL HERO SKELETON (Movie / TV) */
export const DetailHeroSkeleton: React.FC = () => {
  return (
    <section className="relative min-h-[85vh] lg:min-h-[90vh] flex flex-col justify-between pt-24 pb-12 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 w-full overflow-hidden border-b border-white/10 bg-[#0B0B0D]">
      {/* Top breadcrumb */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="h-4 w-40 skeleton-pulse" />
        <div className="h-4 w-28 skeleton-pulse" />
      </div>

      {/* Main hero grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pt-12 pb-4">
        <div className="lg:col-span-9 space-y-5">
          <div className="h-4 w-32 skeleton-pulse" />
          <div className="h-12 sm:h-16 lg:h-20 w-4/5 max-w-2xl skeleton-pulse" />
          <div className="h-4 w-80 skeleton-pulse" />
          <div className="space-y-2 max-w-3xl">
            <div className="h-4 w-full skeleton-pulse" />
            <div className="h-4 w-5/6 skeleton-pulse" />
            <div className="h-4 w-2/3 skeleton-pulse" />
          </div>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="h-11 w-40 skeleton-pulse" />
            <div className="h-11 w-36 skeleton-pulse" />
            <div className="h-11 w-28 skeleton-pulse" />
          </div>
        </div>

        {/* Right docked poster anchor */}
        <div className="lg:col-span-3 hidden lg:block">
          <div className="aspect-[2/3] max-w-[260px] ml-auto border border-white/10 skeleton-pulse" />
        </div>
      </div>
    </section>
  );
};

/* 12. DETAIL OVERVIEW & FACTS SKELETON */
export const DetailOverviewSkeleton: React.FC = () => {
  return (
    <section className="w-full mt-12 sm:mt-16 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start border-t border-white/10 pt-10">
        {/* Left Narrative */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <div className="h-3 w-28 skeleton-pulse" />
            <div className="h-8 w-48 skeleton-pulse" />
          </div>
          <div className="space-y-3">
            <div className="h-4 w-full skeleton-pulse" />
            <div className="h-4 w-full skeleton-pulse" />
            <div className="h-4 w-4/5 skeleton-pulse" />
            <div className="h-4 w-2/3 skeleton-pulse" />
          </div>
          <div className="flex gap-2 pt-2">
            <div className="h-6 w-20 skeleton-pulse" />
            <div className="h-6 w-24 skeleton-pulse" />
            <div className="h-6 w-16 skeleton-pulse" />
          </div>
        </div>

        {/* Right Factsheet Box */}
        <div className="lg:col-span-5 bg-[#111114] border border-white/10 p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="border-b border-white/10 pb-3 space-y-1">
            <div className="h-3 w-20 skeleton-pulse" />
            <div className="h-6 w-36 skeleton-pulse" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={`fact-skel-${i}`} className="space-y-1">
                <div className="h-3 w-16 skeleton-pulse" />
                <div className="h-4 w-24 skeleton-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* 13. FULL MOVIE DETAIL PAGE SKELETON */
export const MovieDetailPageSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pb-24 space-y-16 animate-fadeIn">
      <DetailHeroSkeleton />
      <DetailOverviewSkeleton />
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <CastRailSkeleton title="CAST" count={7} />
      </div>
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <VideosGridSkeleton count={4} />
      </div>
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <PhotosGallerySkeleton />
      </div>
    </div>
  );
};

/* 14. FULL SERIES DETAIL PAGE SKELETON */
export const SeriesDetailPageSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pb-24 space-y-16 animate-fadeIn">
      <DetailHeroSkeleton />
      <DetailOverviewSkeleton />
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <CastRailSkeleton title="CAST" count={7} />
      </div>
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <EpisodesSectionSkeleton count={6} />
      </div>
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <VideosGridSkeleton count={4} />
      </div>
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <PhotosGallerySkeleton />
      </div>
    </div>
  );
};

/* 15. PERSON DETAIL SKELETON */
export const PersonDetailSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pb-24 space-y-12 animate-fadeIn">
      {/* Top Breadcrumb */}
      <div className="pt-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 w-full">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="h-4 w-44 skeleton-pulse" />
          <div className="h-4 w-28 skeleton-pulse" />
        </div>
      </div>

      {/* Editorial Profile Box */}
      <section className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center bg-[#111114] border border-white/10 p-6 sm:p-10 md:p-12">
          {/* Portrait Anchor */}
          <div className="lg:col-span-4 max-w-sm mx-auto lg:max-w-none w-full">
            <div className="aspect-[3/4] skeleton-pulse border border-white/15" />
          </div>

          {/* Identity Info */}
          <div className="lg:col-span-8 space-y-6">
            <div className="space-y-2">
              <div className="h-3 w-32 skeleton-pulse" />
              <div className="h-12 sm:h-16 w-3/4 skeleton-pulse" />
            </div>
            <div className="flex flex-wrap gap-6 border-y border-white/10 py-4">
              <div className="h-4 w-28 skeleton-pulse" />
              <div className="h-4 w-36 skeleton-pulse" />
              <div className="h-4 w-32 skeleton-pulse" />
            </div>
            <div className="h-4 w-52 skeleton-pulse" />
            <div className="h-9 w-36 skeleton-pulse" />
          </div>
        </div>
      </section>

      {/* Biography Skeleton */}
      <section className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 w-full space-y-4">
        <div className="border-t border-white/10 pt-10 space-y-2">
          <div className="h-3 w-24 skeleton-pulse" />
          <div className="h-7 w-36 skeleton-pulse" />
        </div>
        <div className="max-w-4xl space-y-3 pt-2">
          <div className="h-4 w-full skeleton-pulse" />
          <div className="h-4 w-full skeleton-pulse" />
          <div className="h-4 w-5/6 skeleton-pulse" />
          <div className="h-4 w-3/4 skeleton-pulse" />
        </div>
      </section>

      {/* Known For Skeleton */}
      <section className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 w-full space-y-4">
        <div className="border-t border-white/10 pt-10 space-y-2">
          <div className="h-3 w-28 skeleton-pulse" />
          <div className="h-7 w-40 skeleton-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <MediaCardSkeleton key={`known-skel-${i}`} />
          ))}
        </div>
      </section>

      {/* Filmography Skeleton */}
      <section className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 w-full space-y-4">
        <div className="border-t border-white/10 pt-10 space-y-2">
          <div className="h-3 w-32 skeleton-pulse" />
          <div className="h-7 w-48 skeleton-pulse" />
        </div>
        <div className="bg-[#111114] border border-white/10 divide-y divide-white/10">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={`filmo-skel-${i}`} className="p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-16 sm:w-14 sm:h-20 skeleton-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-48 skeleton-pulse" />
                  <div className="h-3 w-32 skeleton-pulse" />
                </div>
              </div>
              <div className="h-4 w-16 skeleton-pulse" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

/* 16. FULL HOMEPAGE SKELETON */
export const HomePageSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] space-y-16 lg:space-y-24 pb-16 animate-fadeIn">
      <HomepageHeroSkeleton />

      {/* Trending Movies Rail Skeleton */}
      <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 space-y-4">
        <div className="flex items-baseline justify-between border-b border-white/10 pb-3">
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-[0.2em] text-[#E43D3D] uppercase font-bold block">
              TRENDING
            </span>
            <div className="h-7 w-48 skeleton-pulse" />
          </div>
          <div className="h-4 w-28 skeleton-pulse" />
        </div>
        <div className="flex items-stretch gap-3 sm:gap-4 overflow-hidden pt-1 pb-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`tr-mov-${i}`} className="flex-shrink-0 w-[140px] sm:w-[170px] md:w-[190px] lg:w-[210px]">
              <MediaCardSkeleton variant="poster" />
            </div>
          ))}
        </div>
      </section>

      {/* Trending TV Rail Skeleton */}
      <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 space-y-4">
        <div className="flex items-baseline justify-between border-b border-white/10 pb-3">
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-[0.2em] text-[#E43D3D] uppercase font-bold block">
              TRENDING
            </span>
            <div className="h-7 w-48 skeleton-pulse" />
          </div>
          <div className="h-4 w-28 skeleton-pulse" />
        </div>
        <div className="flex items-stretch gap-3 sm:gap-4 overflow-hidden pt-1 pb-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`tr-tv-${i}`} className="flex-shrink-0 w-[140px] sm:w-[170px] md:w-[190px] lg:w-[210px]">
              <MediaCardSkeleton variant="poster" />
            </div>
          ))}
        </div>
      </section>

      {/* Popular Movies Grid Skeleton */}
      <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 space-y-6">
        <div className="flex items-baseline justify-between border-b border-white/10 pb-3">
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-[0.2em] text-[#E43D3D] uppercase font-bold block">
              DISCOVERY
            </span>
            <div className="h-7 w-48 skeleton-pulse" />
          </div>
          <div className="h-4 w-28 skeleton-pulse" />
        </div>
        <CardGridSkeleton count={12} />
      </section>
    </div>
  );
};

/* --- INFINITE SCROLL SKELETON STATES --- */
export const InfiniteLoadingSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 pt-4">
      {Array.from({ length: count }).map((_, i) => (
        <MediaCardSkeleton key={`infinite-skel-${i}`} />
      ))}
    </div>
  );
};

export const InfiniteErrorState: React.FC<{ onRetry: () => void }> = ({ onRetry }) => {
  return (
    <div className="py-6 text-center border-t border-white/10 mt-6 flex items-center justify-center gap-4">
      <span className="type-label text-[#929298]">COULDN'T LOAD MORE RESULTS</span>
      <button
        onClick={onRetry}
        className="btn-link inline-flex items-center gap-2 text-white text-md fw-bold uppercase"
      >
        RETRY →
      </button>
    </div>
  );
};

export const EndOfContentState: React.FC = () => {
  return (
    <div className="py-8 text-center border-t border-white/10 mt-8">
      <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#626269]">
        YOU'VE REACHED THE END
      </span>
    </div>
  );
};
