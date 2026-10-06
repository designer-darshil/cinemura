import React from 'react';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';

export interface FilterState {
  sortBy: string;
  year: string;
  minRating: string;
  voteCountGte: string;
  language: string;
  certification: string;
}

interface DiscoveryFiltersProps {
  filters: FilterState;
  onChange: (updated: Partial<FilterState>) => void;
  onReset: () => void;
}

export const DiscoveryFilters: React.FC<DiscoveryFiltersProps> = ({
  filters,
  onChange,
  onReset
}) => {
  const isDirty =
    filters.sortBy !== 'popularity.desc' ||
    filters.year !== 'All' ||
    filters.minRating !== 'All' ||
    filters.voteCountGte !== 'All' ||
    filters.language !== 'All' ||
    filters.certification !== 'All';

  return (
    <div className="w-full bg-[#111114] border border-white/10 p-3 sm:p-4 my-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Label with icon */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#E43D3D]" />
          <span className="text-[10px] font-mono tracking-widest text-[#8E8E93] uppercase font-bold">
            TMDB FILTERS
          </span>
        </div>

        {/* Reset button when active */}
        {isDirty && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-wider text-[#E43D3D] hover:underline uppercase"
          >
            <RotateCcw className="w-3 h-3" />
            <span>RESET ALL</span>
          </button>
        )}
      </div>

      {/* Compact Controls Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-3">
        {/* 1. Sort Order */}
        <div className="space-y-1">
          <label className="text-[9px] font-mono text-[#8E8E93] uppercase tracking-wider block">
            SORT BY
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => onChange({ sortBy: e.target.value })}
            className="w-full bg-black/60 border border-white/10 text-xs font-mono text-[#F2F0EC] px-2 py-1.5 rounded-none focus:border-[#E43D3D] outline-none"
          >
            <option value="popularity.desc">POPULARITY ↓</option>
            <option value="vote_average.desc">RATING ↓</option>
            <option value="primary_release_date.desc">NEWEST ↓</option>
            <option value="revenue.desc">BOX OFFICE ↓</option>
          </select>
        </div>

        {/* 2. Release Year */}
        <div className="space-y-1">
          <label className="text-[9px] font-mono text-[#8E8E93] uppercase tracking-wider block">
            YEAR
          </label>
          <select
            value={filters.year}
            onChange={(e) => onChange({ year: e.target.value })}
            className="w-full bg-black/60 border border-white/10 text-xs font-mono text-[#F2F0EC] px-2 py-1.5 rounded-none focus:border-[#E43D3D] outline-none"
          >
            <option value="All">ALL YEARS</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
            <option value="2020">2020</option>
            <option value="2015">2015</option>
            <option value="2010">2010</option>
            <option value="2000">2000</option>
            <option value="1990">1990</option>
          </select>
        </div>

        {/* 3. Minimum Rating */}
        <div className="space-y-1">
          <label className="text-[9px] font-mono text-[#8E8E93] uppercase tracking-wider block">
            MIN RATING
          </label>
          <select
            value={filters.minRating}
            onChange={(e) => onChange({ minRating: e.target.value })}
            className="w-full bg-black/60 border border-white/10 text-xs font-mono text-[#F2F0EC] px-2 py-1.5 rounded-none focus:border-[#E43D3D] outline-none"
          >
            <option value="All">ANY RATING</option>
            <option value="8.0">★ 8.0 & ABOVE</option>
            <option value="7.0">★ 7.0 & ABOVE</option>
            <option value="6.0">★ 6.0 & ABOVE</option>
            <option value="5.0">★ 5.0 & ABOVE</option>
          </select>
        </div>

        {/* 4. Minimum Vote Count */}
        <div className="space-y-1">
          <label className="text-[9px] font-mono text-[#8E8E93] uppercase tracking-wider block">
            MIN VOTES
          </label>
          <select
            value={filters.voteCountGte}
            onChange={(e) => onChange({ voteCountGte: e.target.value })}
            className="w-full bg-black/60 border border-white/10 text-xs font-mono text-[#F2F0EC] px-2 py-1.5 rounded-none focus:border-[#E43D3D] outline-none"
          >
            <option value="All">ANY VOTES</option>
            <option value="100">100+ VOTES</option>
            <option value="500">500+ VOTES</option>
            <option value="1000">1,000+ VOTES</option>
            <option value="5000">5,000+ VOTES</option>
          </select>
        </div>

        {/* 5. Original Language */}
        <div className="space-y-1">
          <label className="text-[9px] font-mono text-[#8E8E93] uppercase tracking-wider block">
            LANGUAGE
          </label>
          <select
            value={filters.language}
            onChange={(e) => onChange({ language: e.target.value })}
            className="w-full bg-black/60 border border-white/10 text-xs font-mono text-[#F2F0EC] px-2 py-1.5 rounded-none focus:border-[#E43D3D] outline-none"
          >
            <option value="All">ALL LANGUAGES</option>
            <option value="en">ENGLISH</option>
            <option value="es">SPANISH</option>
            <option value="fr">FRENCH</option>
            <option value="de">GERMAN</option>
            <option value="ja">JAPANESE</option>
            <option value="ko">KOREAN</option>
            <option value="it">ITALIAN</option>
          </select>
        </div>

        {/* 6. Certification */}
        <div className="space-y-1">
          <label className="text-[9px] font-mono text-[#8E8E93] uppercase tracking-wider block">
            CERTIFICATION
          </label>
          <select
            value={filters.certification}
            onChange={(e) => onChange({ certification: e.target.value })}
            className="w-full bg-black/60 border border-white/10 text-xs font-mono text-[#F2F0EC] px-2 py-1.5 rounded-none focus:border-[#E43D3D] outline-none"
          >
            <option value="All">ALL RATINGS</option>
            <option value="G">G (GENERAL)</option>
            <option value="PG">PG</option>
            <option value="PG-13">PG-13</option>
            <option value="R">R (RESTRICTED)</option>
            <option value="NC-17">NC-17</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default DiscoveryFilters;
