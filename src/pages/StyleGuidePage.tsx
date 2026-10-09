import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  Play,
  Bookmark,
  Search,
  ExternalLink,
  ChevronRight,
  Clock,
  Film,
  Smartphone
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTrendingMovies, getTrendingTv, getPopularPeople } from '../services/tmdb';
import { Movie, Series, Person } from '../types';
import { MediaCard, CastCard, PersonCard } from '../components/MediaCard';
import { HorizontalRail } from '../components/HorizontalRail';
import { SectionHeader } from '../components/SectionHeader';
import { DiscoveryFilters, FilterState } from '../components/DiscoveryFilters';
import {
  MediaCardSkeleton,
  CardGridSkeleton,
  CastCardSkeleton,
  EpisodeCardSkeleton,
  ErrorState,
  InfiniteErrorState,
  EmptyState
} from '../components/StateViews';
import { Footer } from '../components/Footer';
import { AppLoader } from '../components/AppLoader';

// Fallback real production reference items if network is pending
const FALLBACK_MOVIE: Movie = {
  id: '693134',
  title: 'Dune: Part Two',
  slug: 'dune-part-two-693134',
  synopsis: 'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while seeking revenge.',
  poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
  backdrop: 'https://image.tmdb.org/t/p/w1280/xOMo8BRK7PfcJv9JCnx7s5200FR.jpg',
  rating: 8.2,
  year: 2024,
  releaseDate: '2024-03-01',
  runtime: '2h 46m',
  director: 'Denis Villeneuve',
  genres: ['Science Fiction', 'Adventure'],
  voteCount: 5420,
  language: 'EN',
  status: 'Released',
  certification: 'PG-13',
  tagline: 'Long live the fighters.',
  writers: ['Denis Villeneuve', 'Jon Spaihts'],
  cast: [
    { id: '1', name: 'Timothée Chalamet', role: 'Actor', character: 'Paul Atreides', image: 'https://image.tmdb.org/t/p/w300/BE2sdjpgsa2rNTFa66f7upkaOP.jpg', slug: '1' },
    { id: '2', name: 'Zendaya', role: 'Actor', character: 'Chani', image: 'https://image.tmdb.org/t/p/w300/r3A7evKLrqRMGxJh0BPggBMaIW.jpg', slug: '2' }
  ],
  type: 'movie',
  trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w'
};

const FALLBACK_SERIES: Series = {
  id: '1399',
  title: 'Game of Thrones',
  slug: 'game-of-thrones-1399',
  synopsis: 'Seven noble families fight for control of the mythical land of Westeros.',
  poster: 'https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
  backdrop: 'https://image.tmdb.org/t/p/w1280/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg',
  rating: 8.4,
  voteCount: 22400,
  year: 2011,
  firstAirDate: '2011-04-17',
  seasonsCount: 8,
  totalEpisodes: 73,
  genres: ['Sci-Fi & Fantasy', 'Drama', 'Action & Adventure'],
  language: 'EN',
  status: 'Ended',
  certification: 'TV-MA',
  creators: ['David Benioff', 'D.B. Weiss'],
  cast: [],
  seasons: [],
  type: 'tv',
  trailerUrl: 'https://www.youtube.com/watch?v=KPLWWIOCOOQ'
};

const FALLBACK_PERSON: Person = {
  id: '2034',
  name: 'Cillian Murphy',
  slug: 'cillian-murphy-2034',
  role: 'Actor',
  portrait: 'https://image.tmdb.org/t/p/w500/llk2Sm9Yf4Drf840VrhV4959rwB.jpg',
  knownFor: ['Oppenheimer', 'Peaky Blinders', 'Inception'],
  biography: 'Cillian Murphy is an Irish actor known for acclaimed roles across cinema and stage.',
  birthDate: '1976-05-25',
  birthPlace: 'Douglas, Cork, Ireland',
  popularity: 84.5,
  filmography: [
    { id: '872585', title: 'Oppenheimer', year: 2023, role: 'J. Robert Oppenheimer', type: 'movie', rating: 8.1, poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg' }
  ]
};

export const StyleGuidePage: React.FC = () => {
  const { markAppReady, openSearch, openVideoPlayer, openCineSrcMovie } = useApp();
  const [showLoaderDemo, setShowLoaderDemo] = useState(false);

  const [realMovie, setRealMovie] = useState<Movie>(FALLBACK_MOVIE);
  const [realSeries, setRealSeries] = useState<Series>(FALLBACK_SERIES);
  const [realPerson, setRealPerson] = useState<Person>(FALLBACK_PERSON);
  const [railMovies, setRailMovies] = useState<Movie[]>([FALLBACK_MOVIE]);

  const [activeTab, setActiveTab] = useState<'all' | 'movie' | 'tv'>('all');
  const [seasonTab, setSeasonTab] = useState<number>(1);
  const [sampleInputVal, setSampleInputVal] = useState('Dune: Part Two');

  const [filterState, setFilterState] = useState<FilterState>({
    sortBy: 'popularity.desc',
    year: '2024',
    minRating: '8.0',
    voteCountGte: '500',
    language: 'en',
    certification: 'PG-13'
  });

  useEffect(() => {
    markAppReady();
    window.scrollTo(0, 0);

    // Fetch genuine live TMDb production data
    getTrendingMovies('week')
      .then(movies => {
        if (movies && movies.length > 0) {
          setRealMovie(movies[0]);
          setRailMovies(movies.slice(0, 8));
        }
      })
      .catch(() => {});

    getTrendingTv('week')
      .then(shows => {
        if (shows && shows.length > 0) {
          setRealSeries(shows[0]);
        }
      })
      .catch(() => {});

    getPopularPeople(1)
      .then(people => {
        if (people && people.length > 0) {
          setRealPerson(people[0]);
        }
      })
      .catch(() => {});
  }, [markAppReady]);

  const navSections = [
    { id: 'section-colors', label: '01 COLORS' },
    { id: 'section-typography', label: '02 TYPOGRAPHY' },
    { id: 'section-spacing', label: '03 SPACING' },
    { id: 'section-grid', label: '04 GRID' },
    { id: 'section-buttons', label: '05 BUTTONS' },
    { id: 'section-links', label: '06 LINKS' },
    { id: 'section-inputs', label: '07 INPUTS' },
    { id: 'section-search', label: '08 SEARCH' },
    { id: 'section-cards', label: '09 CARDS' },
    { id: 'section-media-cards', label: '10 MEDIA CARDS' },
    { id: 'section-cast-person', label: '11 CAST & PERSON' },
    { id: 'section-filters', label: '12 FILTERS' },
    { id: 'section-tabs', label: '13 TABS' },
    { id: 'section-carousels', label: '14 CAROUSELS' },
    { id: 'section-badges', label: '15 BADGES & META' },
    { id: 'section-skeletons', label: '16 SKELETONS' },
    { id: 'section-loading', label: '17 LOADING STATES' },
    { id: 'section-empty', label: '18 EMPTY STATES' },
    { id: 'section-error', label: '19 ERROR STATES' },
    { id: 'section-modals', label: '20 MODALS' },
    { id: 'section-movie-detail', label: '21 MOVIE DETAIL' },
    { id: 'section-tv-components', label: '22 TV COMPONENTS' },
    { id: 'section-footer', label: '23 FOOTER' },
    { id: 'section-mobile', label: '24 MOBILE COMPONENTS' }
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pb-24 selection:bg-[#E43D3D] selection:text-white">
      
      {/* ==================================================
          STYLE GUIDE HERO HEADER
         ================================================== */}
      <header className="pt-24 sm:pt-28 pb-8 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 border-b border-white/10 bg-[#111114]">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#E43D3D] inline-block" />
            <span className="text-[11px] font-mono tracking-[0.25em] text-[#E43D3D] uppercase font-bold">
              CINEMURA DESIGN SYSTEM
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold uppercase tracking-tight text-white leading-none">
            STYLE GUIDE
          </h1>

          <p className="text-sm sm:text-base font-sans text-[#8E8E93] max-w-3xl leading-relaxed">
            The single source of truth for Cinemura's visual architecture, component specifications,
            spacing scale, typography, and responsive touch standards. Every production element on this page
            uses the exact reusable code components from the product.
          </p>
        </div>
      </header>

      {/* ==================================================
          STICKY SECTION JUMP NAVIGATION SUB-BAR
         ================================================== */}
      <nav aria-label="Style guide sections" className="sticky top-14 z-30 bg-[#0B0B0D]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-2.5 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 whitespace-nowrap min-w-max">
          {navSections.map((sec) => (
            <a
              key={sec.id}
              href={`#${sec.id}`}
              className="text-[11px] font-mono px-3 py-1 bg-white/5 hover:bg-[#E43D3D] text-[#8E8E93] hover:text-white transition-colors border border-white/10"
            >
              {sec.label}
            </a>
          ))}
        </div>
      </nav>

      {/* Content Container */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 space-y-16 sm:space-y-24 mt-12 sm:mt-16">

        {/* ==================================================
            01 — COLORS
           ================================================== */}
        <section id="section-colors" className="space-y-6 scroll-mt-28">
          <SectionHeader
            label="TOKENS & PALETTE"
            title="01 — COLORS"
            description="The dark architectural cinematic palette. No arbitrary shades or excessive saturated neon."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Background', hex: '#0B0B0D', role: 'Global canvas background', border: true },
              { name: 'Surface', hex: '#111114', role: 'Cards, panels, modal frames', border: true },
              { name: 'Secondary Surface', hex: '#17171B', role: 'Input controls, pills, hover states', border: true },
              { name: 'Accent Crimson', hex: '#E43D3D', role: 'Primary CTA, badges, ratings, active states' },
              { name: 'Primary Text', hex: '#F2F0EC', role: 'Headlines, titles, high-contrast labels' },
              { name: 'Secondary Text', hex: '#8E8E93', role: 'Metadata, subtitles, descriptive text' },
              { name: 'Muted Text', hex: '#626269', role: 'Legal notice, placeholders, disabled indicators' },
              { name: 'Borders & Rules', hex: 'rgba(255,255,255,0.10)', role: 'Architectural dividers, card borders', isRgba: true }
            ].map((col, idx) => (
              <div key={idx} className="bg-[#111114] border border-white/10 p-4 space-y-3">
                <div
                  className="w-full h-20 border border-white/15"
                  style={{ backgroundColor: col.hex }}
                />
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-sm text-[#F2F0EC] uppercase">{col.name}</span>
                    <span className="text-xs font-mono text-[#E43D3D]">{col.hex}</span>
                  </div>
                  <p className="text-xs font-sans text-[#8E8E93] leading-relaxed">{col.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ==================================================
            02 — TYPOGRAPHY
           ================================================== */}
        <section id="section-typography" className="space-y-6 scroll-mt-28">
          <SectionHeader
            label="SCALE & HIERARCHY"
            title="02 — TYPOGRAPHY"
            description="Editorial font system: DM Sans for Headings, Manrope for Body and UI, Monospace for metadata."
          />

          <div className="bg-[#111114] border border-white/10 divide-y divide-white/10">
            {[
              {
                tag: 'Display XL',
                classes: 'type-display-xl',
                example: 'CINEMURA IMMERSIVE',
                spec: 'DM Sans • 44px–84px clamp • Line-height 0.95 • Tracking -0.02em • Bold uppercase'
              },
              {
                tag: 'Heading 1',
                classes: 'type-h1',
                example: 'FEATURE ARCHIVE',
                spec: 'DM Sans • 40px–60px clamp • Line-height 1.05 • Bold uppercase'
              },
              {
                tag: 'Heading 2',
                classes: 'type-h2',
                example: 'PRODUCTION DOSSIER',
                spec: 'DM Sans • 32px–44px clamp • Line-height 1.1 • Semibold uppercase'
              },
              {
                tag: 'Heading 3',
                classes: 'type-h3',
                example: 'CURATED SELECTIONS',
                spec: 'DM Sans • 22px–28px clamp • Line-height 1.15 • Semibold'
              },
              {
                tag: 'Body Large',
                classes: 'type-body-l',
                example: 'A mythic journey through cinematic narrative and visual storytelling.',
                spec: 'Manrope • 16px–18px clamp • Line-height 1.65 • Regular'
              },
              {
                tag: 'Body Default',
                classes: 'type-body',
                example: 'Standard reading text across narrative overviews and editorial paragraphs.',
                spec: 'Manrope • 16px • Line-height 1.6 • Color #8E8E93'
              },
              {
                tag: 'Small / Caption',
                classes: 'type-small',
                example: 'Supporting captions and auxiliary system text.',
                spec: 'Manrope • 14px • Line-height 1.45 • Color #8E8E93'
              },
              {
                tag: 'Metadata / Mono',
                classes: 'text-xs font-mono tracking-widest text-[#8E8E93] uppercase',
                example: '2024 • 2H 46M • PG-13 • ★ 8.2 (5,420 VOTES)',
                spec: 'Monospace • 12px • Tracking 0.1em • Uppercase'
              }
            ].map((ty, i) => (
              <div key={i} className="p-5 sm:p-6 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono text-[#8E8E93] gap-1">
                  <span className="text-[#E43D3D] font-bold">{ty.tag}</span>
                  <span>{ty.spec}</span>
                </div>
                <div className={`${ty.classes} text-[#F2F0EC] truncate`}>
                  {ty.example}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ==================================================
            03 — SPACING SCALE
           ================================================== */}
        <section id="section-spacing" className="space-y-6 scroll-mt-28">
          <SectionHeader
            label="ARCHITECTURAL SCALE"
            title="03 — SPACING SCALE"
            description="Strict spacing tokens used throughout margins, paddings, and component rhythm."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { token: '4px', label: 'space-1 (0.25rem)', width: 'w-1', use: 'Micro badge padding, icon gap' },
              { token: '8px', label: 'space-2 (0.5rem)', width: 'w-2', use: 'Compact button gap, pill padding' },
              { token: '12px', label: 'space-3 (0.75rem)', width: 'w-3', use: 'Card interior padding, badge gap' },
              { token: '16px', label: 'space-4 (1.0rem)', width: 'w-4', use: 'Standard base gutter, mobile padding' },
              { token: '24px', label: 'space-6 (1.5rem)', width: 'w-6', use: 'Container edge padding, card gap' },
              { token: '32px', label: 'space-8 (2.0rem)', width: 'w-8', use: 'Section header spacing, modal padding' },
              { token: '48px', label: 'space-12 (3.0rem)', width: 'w-12', use: 'Medium section vertical rhythm' },
              { token: '64px', label: 'space-16 (4.0rem)', width: 'w-16', use: 'Major section vertical separation' },
              { token: '80px', label: 'space-20 (5.0rem)', width: 'w-20', use: 'Hero padding, page transition margins' },
              { token: '96px', label: 'space-24 (6.0rem)', width: 'w-24', use: 'Desktop index inter-section distance' }
            ].map((sp, idx) => (
              <div key={idx} className="bg-[#111114] border border-white/10 p-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-mono font-bold text-[#F2F0EC]">{sp.token}</div>
                  <div className="text-[11px] font-mono text-[#8E8E93]">{sp.label}</div>
                  <div className="text-xs font-sans text-[#8E8E93]">{sp.use}</div>
                </div>
                <div className="h-10 bg-[#E43D3D]/30 border-r-2 border-[#E43D3D]" style={{ width: sp.token }} />
              </div>
            ))}
          </div>
        </section>

        {/* ==================================================
            04 — CONTAINER / GRID
           ================================================== */}
        <section id="section-grid" className="space-y-6 scroll-mt-28">
          <SectionHeader
            label="RESPONSIVE FRAMEWORK"
            title="04 — CONTAINER / GRID"
            description="Mobile: 2 columns with 10–14px gap. Tablet: 4 columns. Desktop: 6 columns. Zero horizontal overflow."
          />

          <div className="bg-[#111114] border border-white/10 p-6 space-y-6">
            <div className="text-xs font-mono text-[#8E8E93] space-y-1">
              <span className="text-[#E43D3D] font-bold block">PRODUCTION BREAKPOINTS:</span>
              <p>• Mobile (320px–639px): 2 columns • padding 16px–20px</p>
              <p>• Tablet (640px–1023px): 4 columns • padding 24px–32px</p>
              <p>• Desktop (1024px+): 6 columns • padding 48px–64px</p>
            </div>

            {/* Visual Column Grid Simulator */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-black/60 border border-white/15 p-4 text-center">
                  <span className="text-xs font-mono text-[#E43D3D] font-bold">COL {i + 1}</span>
                  <p className="text-[10px] font-mono text-[#8E8E93] mt-1">Col Span 1</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================================================
            05 — BUTTONS
           ================================================== */}
        <section id="section-buttons" className="space-y-6 scroll-mt-28">
          <SectionHeader
            label="INTERACTIVE ACTIONS"
            title="05 — BUTTONS"
            description="Minimum 44px touch targets. Zero rounded corners. High contrast focus rings."
          />

          <div className="bg-[#111114] border border-white/10 p-6 space-y-6">
            <div className="flex flex-wrap items-center gap-4">
              {/* Primary Button */}
              <button type="button" className="btn-primary">
                <Play className="w-4 h-4 fill-white" />
                <span>PRIMARY BUTTON</span>
              </button>

              {/* Secondary Button */}
              <button type="button" className="btn-secondary">
                <Bookmark className="w-3.5 h-3.5" />
                <span>SECONDARY BUTTON</span>
              </button>

              {/* Outlined Subtle Button */}
              <button type="button" className="min-h-[44px] px-6 py-3 border border-white/20 hover:border-[#E43D3D] text-[#F2F0EC] text-xs font-mono tracking-widest uppercase transition-colors">
                OUTLINE BUTTON
              </button>

              {/* Disabled Button */}
              <button type="button" disabled className="min-h-[44px] px-6 py-3 bg-white/5 border border-white/10 text-[#626269] text-xs font-mono tracking-widest uppercase cursor-not-allowed">
                DISABLED BUTTON
              </button>

              {/* Icon Only Button */}
              <button type="button" aria-label="Action" className="w-11 h-11 bg-white/5 hover:bg-[#E43D3D] border border-white/10 text-white flex items-center justify-center transition-colors">
                <Bookmark className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ==================================================
            06 — LINKS
           ================================================== */}
        <section id="section-links" className="space-y-6 scroll-mt-28">
          <SectionHeader
            label="NAVIGATION ANCHORS"
            title="06 — LINKS"
            description="Text anchors, breadcrumbs, and view-all interactive pointers."
          />

          <div className="bg-[#111114] border border-white/10 p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-8 text-xs font-mono">
              <Link to="/movie" className="text-[#8E8E93] hover:text-[#E43D3D] transition-colors flex items-center gap-1.5">
                <span>← BACK TO CATALOG</span>
              </Link>

              <Link to="/discover" className="text-[#E43D3D] hover:underline flex items-center gap-1 font-bold">
                <span>EXPLORE ALL TITLES</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>

              <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className="text-[#8E8E93] hover:text-white flex items-center gap-1 transition-colors">
                <span>EXTERNAL ATTRIBUTION</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </section>

        {/* ==================================================
            07 — INPUTS
           ================================================== */}
        <section id="section-inputs" className="space-y-6 scroll-mt-28">
          <SectionHeader
            label="FORM CONTROLS"
            title="07 — INPUT SYSTEM"
            description="Form elements, search inputs, select dropdowns, and state variants."
          />

          <div className="bg-[#111114] border border-white/10 p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Default Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono tracking-widest text-[#8E8E93] uppercase block">
                  DEFAULT TEXT INPUT
                </label>
                <input
                  type="text"
                  value={sampleInputVal}
                  onChange={(e) => setSampleInputVal(e.target.value)}
                  placeholder="Enter title..."
                  className="w-full bg-black/60 border border-white/15 focus:border-[#E43D3D] text-[#F2F0EC] px-3.5 py-2.5 text-xs font-mono outline-none min-h-[44px]"
                />
              </div>

              {/* Filter Select Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono tracking-widest text-[#8E8E93] uppercase block">
                  SELECT / FILTER DROPDOWN
                </label>
                <select className="w-full bg-black/60 border border-white/15 focus:border-[#E43D3D] text-[#F2F0EC] px-3.5 py-2.5 text-xs font-mono outline-none min-h-[44px]">
                  <option value="pop">POPULARITY ↓</option>
                  <option value="rating">RATING ↓</option>
                  <option value="date">NEWEST RELEASE ↓</option>
                </select>
              </div>

              {/* Disabled State */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono tracking-widest text-[#626269] uppercase block">
                  DISABLED INPUT
                </label>
                <input
                  type="text"
                  disabled
                  value="Read-only catalog key"
                  className="w-full bg-white/5 border border-white/10 text-[#626269] px-3.5 py-2.5 text-xs font-mono outline-none min-h-[44px] cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================
            08 — SEARCH
           ================================================== */}
        <section id="section-search" className="space-y-6 scroll-mt-28">
          <SectionHeader
            label="FULL-SCREEN DISCOVERY"
            title="08 — SEARCH EXPERIENCE"
            description="Dedicated fullscreen modal interface with debounced TMDB query results."
          />

          <div className="bg-[#111114] border border-white/10 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-sm font-display font-bold text-white uppercase">SEARCH MODAL TRIGGER</span>
              <p className="text-xs font-sans text-[#8E8E93]">Opens the production full-screen search modal with trending keyword pills and live query results.</p>
            </div>
            <button
              type="button"
              onClick={openSearch}
              className="btn-primary min-h-[44px] px-6 text-xs uppercase"
            >
              <Search className="w-4 h-4" />
              <span>TEST SEARCH OVERLAY</span>
            </button>
          </div>
        </section>

        {/* ==================================================
            09 — CARDS & 10 — MEDIA CARDS
           ================================================== */}
        <section id="section-media-cards" className="space-y-6 scroll-mt-28">
          <SectionHeader
            label="MEDIA CARD SYSTEM"
            title="09 & 10 — MOVIE & TV CARDS"
            description="Real production MediaCard component. 2:3 ratio, touch-accessible watchlist button, non-hover dependent."
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-[#E43D3D] uppercase font-bold block">MOVIE POSTER VARIANT</span>
              <MediaCard item={realMovie} variant="poster" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono text-[#E43D3D] uppercase font-bold block">TV POSTER VARIANT</span>
              <MediaCard item={realSeries} variant="poster" />
            </div>
          </div>
        </section>

        {/* ==================================================
            11 — CAST / PERSON
           ================================================== */}
        <section id="section-cast-person" className="space-y-6 scroll-mt-28">
          <SectionHeader
            label="PERSONNEL PROFILES"
            title="11 — CAST & PERSON CARDS"
            description="Production CastCard and PersonCard components. Full card clickable with role or known-for metadata."
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-[#E43D3D] uppercase font-bold block">CAST CARD (DETAILS)</span>
              <CastCard
                id={realPerson.id}
                name={realPerson.name}
                character="Lead Character"
                image={realPerson.portrait}
                slug={realPerson.slug || realPerson.id}
              />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono text-[#E43D3D] uppercase font-bold block">PERSON CARD (DIRECTORY)</span>
              <PersonCard
                id={realPerson.id}
                name={realPerson.name}
                role={realPerson.role || 'Artist'}
                knownFor={realPerson.knownFor}
                portrait={realPerson.portrait}
                slug={realPerson.slug || realPerson.id}
              />
            </div>
          </div>
        </section>

        {/* ==================================================
            12 — FILTERS
           ================================================== */}
        <section id="section-filters" className="space-y-6 scroll-mt-28">
          <SectionHeader
            label="CATALOG DISCOVERY"
            title="12 — FILTERS"
            description="The live DiscoveryFilters component with sort order, year, rating, vote count, language, and certification."
          />

          <DiscoveryFilters
            filters={filterState}
            onChange={(updated) => setFilterState(prev => ({ ...prev, ...updated }))}
            onReset={() =>
              setFilterState({
                sortBy: 'popularity.desc',
                year: 'All',
                minRating: 'All',
                voteCountGte: 'All',
                language: 'All',
                certification: 'All'
              })
            }
          />
        </section>

        {/* ==================================================
            13 — TABS
           ================================================== */}
        <section id="section-tabs" className="space-y-6 scroll-mt-28">
          <SectionHeader
            label="FILTER & NAVIGATION TABS"
            title="13 — TABS"
            description="Media type segmented controls and horizontal season selector tabs."
          />

          <div className="bg-[#111114] border border-white/10 p-6 space-y-6">
            {/* Media Type Tabs */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-[#8E8E93] uppercase font-bold block">MEDIA TYPE SEGMENTED TABS:</span>
              <div className="flex flex-wrap items-center gap-2">
                {(['all', 'movie', 'tv'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-xs px-3.5 py-2 sm:py-1.5 min-h-[40px] sm:min-h-0 flex items-center font-mono font-bold uppercase tracking-wider transition-all border ${
                      activeTab === tab
                        ? 'bg-[#E43D3D] border-[#E43D3D] text-white'
                        : 'bg-[#0B0B0D] border-white/10 text-[#8E8E93] hover:text-white'
                    }`}
                  >
                    {tab === 'tv' ? 'TV SHOWS' : tab === 'movie' ? 'MOVIES' : 'ALL MEDIA'}
                  </button>
                ))}
              </div>
            </div>

            {/* TV Season Selector Tabs */}
            <div className="space-y-2 pt-4 border-t border-white/10">
              <span className="text-[10px] font-mono text-[#8E8E93] uppercase font-bold block">TV SEASON TABS:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSeasonTab(s)}
                    className={`px-3.5 py-2 sm:py-1.5 min-h-[40px] sm:min-h-[36px] text-xs font-mono tracking-wider uppercase transition-all whitespace-nowrap border shrink-0 ${
                      seasonTab === s
                        ? 'bg-[#E43D3D] border-[#E43D3D] text-white font-bold'
                        : 'bg-[#111114] border-white/15 text-[#8E8E93] hover:text-[#F2F0EC]'
                    }`}
                  >
                    SEASON {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================
            14 — CAROUSELS
           ================================================== */}
        <section id="section-carousels" className="space-y-6 scroll-mt-28">
          <SectionHeader
            label="TOUCH RAILS"
            title="14 — CAROUSELS"
            description="The production HorizontalRail component. Smooth touch swiping on mobile, desktop arrows."
          />

          <div className="bg-[#111114] border border-white/10 p-4 sm:p-6">
            <HorizontalRail
              items={railMovies}
              variant="poster"
              exploreAllLink="/movie"
              exploreAllText="EXPLORE ALL"
            />
          </div>
        </section>

        {/* ==================================================
            15 — BADGES & METADATA
           ================================================== */}
        <section id="section-badges" className="space-y-6 scroll-mt-28">
          <SectionHeader
            label="CONTENT SIGNIFIERS"
            title="15 — BADGES & METADATA"
            description="Standardized labels for certifications, statuses, ratings, and media formats."
          />

          <div className="bg-[#111114] border border-white/10 p-6 flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-mono font-extrabold tracking-[0.2em] px-2.5 py-1 uppercase bg-[#E43D3D] text-white">
              FEATURE FILM
            </span>
            <span className="text-[10px] font-mono font-extrabold tracking-[0.2em] px-2.5 py-1 uppercase bg-[#E43D3D] text-white">
              TV SERIES
            </span>
            <span className="text-[10px] font-mono font-semibold tracking-widest px-2.5 py-1 bg-white/10 text-white border border-white/20 uppercase">
              RELEASED
            </span>
            <span className="text-[10px] font-mono font-semibold tracking-widest px-2 py-0.5 border border-white/20 text-[#F2F0EC] uppercase">
              PG-13
            </span>
            <div className="flex items-center gap-1.5 bg-black/60 px-3 py-1 border border-white/10 text-xs font-mono text-[#F2F0EC]">
              <Star className="w-3.5 h-3.5 fill-[#E43D3D] text-[#E43D3D]" />
              <span className="font-bold text-white">8.4</span>
              <span className="text-[#8E8E93] text-[10px]">/ 10</span>
            </div>
            <span className="text-xs font-mono text-[#8E8E93]">
              2024 • 2H 46M • 5,420 VOTES
            </span>
          </div>
        </section>

        {/* ==================================================
            16 — SKELETON SYSTEM
           ================================================== */}
        <section id="section-skeletons" className="space-y-6 scroll-mt-28">
          <SectionHeader
            label="PLACEHOLDER GEOMETRY"
            title="16 — SKELETON SYSTEM"
            description="Matching precise production card and episode dimensions with smooth pulse animation."
          />

          <div className="space-y-8">
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-[#E43D3D] uppercase font-bold block">INDIVIDUAL POSTER SKELETON</span>
              <div className="w-[180px]">
                <MediaCardSkeleton variant="poster" />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono text-[#E43D3D] uppercase font-bold block">MEDIA CARD SKELETONS (2 COLS MOBILE, 6 COLS DESKTOP)</span>
              <CardGridSkeleton count={6} variant="poster" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono text-[#E43D3D] uppercase font-bold block">CAST CARD SKELETON</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                <CastCardSkeleton />
                <CastCardSkeleton />
                <CastCardSkeleton />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono text-[#E43D3D] uppercase font-bold block">EPISODE CARD SKELETON</span>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <EpisodeCardSkeleton />
                <EpisodeCardSkeleton />
                <EpisodeCardSkeleton />
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================
            17 — LOADING STATES
           ================================================== */}
        <section id="section-loading" className="space-y-6 scroll-mt-28">
          <SectionHeader
            label="APP & REGIONAL LOADERS"
            title="17 — LOADING STATES"
            description="The full-screen curved Bézier SVG transition reveal, plus local card grid skeletons."
          />

          <div className="bg-[#111114] border border-white/10 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="font-display font-bold text-sm text-white uppercase">FULLSCREEN CURVED SVG PAGE REVEAL</span>
              <p className="text-xs font-sans text-[#8E8E93]">Demonstrates the application-wide SVG quadratic curve reveal animation inspired by Olivier Larose.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowLoaderDemo(true);
                setTimeout(() => setShowLoaderDemo(false), 2400);
              }}
              className="btn-primary min-h-[44px] px-6 text-xs uppercase"
            >
              <span>TRIGGER CURVED LOADER</span>
            </button>
          </div>
          {showLoaderDemo && <AppLoader isReady={false} />}
        </section>

        {/* ==================================================
            18 — EMPTY STATES
           ================================================== */}
        <section id="section-empty" className="space-y-6 scroll-mt-28">
          <SectionHeader
            label="ZERO CONTENT FEEDBACK"
            title="18 — EMPTY STATES"
            description="Production EmptyState component with contextual action CTA."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EmptyState
              variant="search"
              title="NO TITLES FOUND"
              message="No movies or TV shows matched the specified search parameters."
              actionText="EXPLORE ALL TITLES"
              actionLink="/movie"
            />
            <EmptyState
              variant="default"
              title="WATCHLIST IS EMPTY"
              message="Bookmark feature films and television series to populate your viewing queue."
              actionText="DISCOVER MEDIA"
              actionLink="/discover"
            />
          </div>
        </section>

        {/* ==================================================
            19 — ERROR STATES
           ================================================== */}
        <section id="section-error" className="space-y-6 scroll-mt-28">
          <SectionHeader
            label="SYSTEM FAULT FEEDBACK"
            title="19 — ERROR STATES"
            description="Production ErrorState and InfiniteErrorState components with retry handlers."
          />

          <div className="space-y-6">
            <ErrorState
              title="TMDB DATABASE CONNECTION TIMEOUT"
              message="Unable to communicate with the upstream metadata gateway. Please verify your connection."
              onRetry={() => alert('Retry handler invoked.')}
            />

            <InfiniteErrorState onRetry={() => alert('Infinite retry triggered.')} />
          </div>
        </section>

        {/* ==================================================
            20 — MODALS / LIGHTBOX
           ================================================== */}
        <section id="section-modals" className="space-y-6 scroll-mt-28">
          <SectionHeader
            label="OVERLAY PLAYBACK"
            title="20 — MODALS & LIGHTBOXES"
            description="Pure black background lightbox overlays for trailer preview and streaming embeds."
          />

          <div className="bg-[#111114] border border-white/10 p-6 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => openVideoPlayer([{
                id: 'style-guide-vid',
                key: 'Way9Dexny3w',
                name: 'Dune: Part Two Trailer',
                type: 'Trailer',
                site: 'YouTube',
                official: true
              }], 0, 'Dune: Part Two')}
              className="btn-primary min-h-[44px] px-6 text-xs uppercase"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>OPEN TRAILER LIGHTBOX</span>
            </button>

            <button
              type="button"
              onClick={() => openCineSrcMovie(realMovie.id, realMovie.title)}
              className="btn-secondary min-h-[44px] px-6 text-xs uppercase"
            >
              <Film className="w-4 h-4 text-[#E43D3D]" />
              <span>OPEN CINESRC PLAYER MODAL</span>
            </button>
          </div>
        </section>

        {/* ==================================================
            21 — MOVIE DETAIL COMPONENTS
           ================================================== */}
        <section id="section-movie-detail" className="space-y-6 scroll-mt-28">
          <SectionHeader
            label="FEATURE FILM DOSSIER"
            title="21 — MOVIE DETAIL COMPONENTS"
            description="Production factsheet dossier, narrative arc excerpt, and cast section."
          />

          <div className="bg-[#111114] border border-white/10 p-6 sm:p-8 space-y-6">
            <div className="border-b border-white/10 pb-3 flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-[0.2em] text-[#E43D3D] uppercase font-bold">
                FACTSHEET COMPONENT
              </span>
              <span className="text-xs font-mono text-[#8E8E93]">PRODUCTION DOSSIER</span>
            </div>

            <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-y-4 gap-x-6 text-xs font-mono">
              <div>
                <dt className="text-[#8E8E93] uppercase">STATUS</dt>
                <dd className="text-[#F2F0EC] font-semibold mt-0.5">{realMovie.status || 'Released'}</dd>
              </div>
              <div>
                <dt className="text-[#8E8E93] uppercase">AUDIO</dt>
                <dd className="text-[#F2F0EC] font-semibold mt-0.5">{realMovie.language}</dd>
              </div>
              <div>
                <dt className="text-[#8E8E93] uppercase">RUNTIME</dt>
                <dd className="text-[#F2F0EC] font-semibold mt-0.5">{realMovie.runtime}</dd>
              </div>
              <div>
                <dt className="text-[#8E8E93] uppercase">PREMIERE</dt>
                <dd className="text-[#F2F0EC] font-semibold mt-0.5">{realMovie.year}</dd>
              </div>
              <div>
                <dt className="text-[#8E8E93] uppercase">RATING</dt>
                <dd className="text-[#E43D3D] font-bold mt-0.5">★ {realMovie.rating.toFixed(1)}</dd>
              </div>
              <div>
                <dt className="text-[#8E8E93] uppercase">VOTES</dt>
                <dd className="text-[#F2F0EC] font-semibold mt-0.5">{realMovie.voteCount.toLocaleString()}</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* ==================================================
            22 — TV COMPONENTS
           ================================================== */}
        <section id="section-tv-components" className="space-y-6 scroll-mt-28">
          <SectionHeader
            label="TELEVISION EPISODIC"
            title="22 — TV COMPONENTS"
            description="Season selector pills and 16:9 dense episode card with play action."
          />

          <div className="bg-[#111114] border border-white/10 p-6 space-y-6">
            <div className="max-w-md bg-[#141418] border border-white/10 overflow-hidden group">
              <div className="aspect-video w-full relative bg-black">
                <img
                  src={realSeries.backdrop || realMovie.backdrop}
                  alt="Episode Still"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 text-[10px] font-mono font-extrabold px-2 py-0.5 bg-[#E43D3D] text-white">
                  E01
                </span>
                <span className="absolute bottom-2 right-2 text-[10px] font-mono bg-black/80 text-[#F2F0EC] px-1.5 py-0.5 border border-white/15 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#E43D3D]" />
                  58m
                </span>
              </div>
              <div className="p-3.5 space-y-2">
                <h4 className="font-serif font-bold text-sm text-[#F2F0EC]">Pilot / Episode Title</h4>
                <p className="text-xs text-[#8E8E93] line-clamp-2">Opening narrative establishing the series world, character motives, and thematic conflict.</p>
                <button
                  type="button"
                  className="w-full bg-[#18181D] hover:bg-[#E43D3D] text-[#F2F0EC] hover:text-white border border-white/15 min-h-[44px] py-2 px-3 text-[11px] font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all"
                >
                  <Play className="w-3 h-3 fill-current text-[#E43D3D]" />
                  <span>WATCH EPISODE</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================
            23 — FOOTER
           ================================================== */}
        <section id="section-footer" className="space-y-6 scroll-mt-28">
          <SectionHeader
            label="SITE CLOSURE"
            title="23 — PRODUCTION FOOTER"
            description="The shared Footer component embedded below as the single source of truth."
          />

          <div className="border border-white/10 overflow-hidden">
            <Footer />
          </div>
        </section>

        {/* ==================================================
            24 — MOBILE IMPLEMENTATIONS
           ================================================== */}
        <section id="section-mobile" className="space-y-6 scroll-mt-28">
          <SectionHeader
            label="NARROW TOUCH SCREENS"
            title="24 — MOBILE COMPONENTS"
            description="Dedicated mobile header, off-canvas navigation trigger, 2-column card density, and touch targets >= 44px."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#111114] border border-white/10 p-5 space-y-3">
              <div className="flex items-center gap-2 text-[#E43D3D]">
                <Smartphone className="w-4 h-4" />
                <span className="font-mono text-xs font-bold uppercase">HEADER (320px–430px)</span>
              </div>
              <p className="text-xs font-sans text-[#8E8E93] leading-relaxed">
                Height 56px (h-14). Minimal brand left, search trigger and menu trigger right.
                Minimum 44px touch areas with safe-area top inset support.
              </p>
            </div>

            <div className="bg-[#111114] border border-white/10 p-5 space-y-3">
              <div className="flex items-center gap-2 text-[#E43D3D]">
                <Smartphone className="w-4 h-4" />
                <span className="font-mono text-xs font-bold uppercase">NAVIGATION PANEL</span>
              </div>
              <p className="text-xs font-sans text-[#8E8E93] leading-relaxed">
                Full-screen opaque `#0B0B0D` surface (no blur / frosted glass).
                Direct routes with large touch targets, safe-area padding, and Escape dismissal.
              </p>
            </div>

            <div className="bg-[#111114] border border-white/10 p-5 space-y-3">
              <div className="flex items-center gap-2 text-[#E43D3D]">
                <Smartphone className="w-4 h-4" />
                <span className="font-mono text-xs font-bold uppercase">TOUCH ACCESSIBILITY</span>
              </div>
              <p className="text-xs font-sans text-[#8E8E93] leading-relaxed">
                All primary actions, filter select dropdowns, and season buttons maintain &ge; 44px touch targets.
                Watchlist button visible on touch screens without requiring hover.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default StyleGuidePage;
