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

/* --- EXACT COMPONENT SKELETONS --- */

export const MediaCardSkeleton: React.FC = () => {
  return (
    <div className="bg-[#111114] border border-white/10 flex flex-col justify-between overflow-hidden animate-pulse">
      <div className="w-full aspect-[2/3] bg-white/5" />
      <div className="p-3 space-y-2">
        <div className="h-3.5 bg-white/10 w-3/4" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-3 bg-white/5 w-1/4" />
          <div className="h-3 bg-white/5 w-1/5" />
        </div>
      </div>
    </div>
  );
};

export const CardGridSkeleton: React.FC<{ count?: number }> = ({ count = 12 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <MediaCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const DetailHeroSkeleton: React.FC = () => {
  return (
    <div className="min-h-[60vh] bg-[#111114] border border-white/10 p-6 sm:p-12 animate-pulse grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
      <div className="lg:col-span-8 space-y-4">
        <div className="h-4 bg-white/10 w-32" />
        <div className="h-12 bg-white/10 w-3/4" />
        <div className="h-4 bg-white/5 w-1/2" />
        <div className="h-16 bg-white/5 w-full" />
        <div className="flex gap-4 pt-4">
          <div className="h-11 w-36 bg-[#E43D3D]/30" />
          <div className="h-11 w-36 bg-white/10" />
        </div>
      </div>
      <div className="lg:col-span-4 hidden lg:block aspect-[2/3] bg-white/5" />
    </div>
  );
};

/* --- INFINITE SCROLL FEEDBACK STATES --- */

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
