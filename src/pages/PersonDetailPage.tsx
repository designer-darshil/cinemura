import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight, ExternalLink } from 'lucide-react';
import { getPersonDetail } from '../services/tmdb';
import { Person } from '../types';
import { SectionHeader } from '../components/SectionHeader';
import { PersonDetailSkeleton, ErrorState } from '../components/StateViews';
import { AwardsSection } from '../components/AwardsSection';
import { getPersonAwards } from '../services/awardsService';
import { EntityAwardsData } from '../types';
import { useApp } from '../context/AppContext';

export const PersonDetailPage: React.FC = () => {
  const { markAppReady } = useApp();
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const personId = id || slug;

  const [person, setPerson] = useState<Person | null>(null);
  const [awards, setAwards] = useState<EntityAwardsData | null>(null);
  const [awardsLoading, setAwardsLoading] = useState(false);
  const [filmoFilter, setFilmoFilter] = useState<'all' | 'movie' | 'tv'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const activeIdRef = React.useRef<string | undefined>(personId);

  const fetchPersonDetail = async () => {
    if (!personId) return;
    activeIdRef.current = personId;
    setLoading(true);
    setError(false);
    setAwardsLoading(true);

    getPersonAwards(personId)
      .then((res) => {
        if (activeIdRef.current === personId) setAwards(res);
      })
      .catch(() => {
        if (activeIdRef.current === personId) setAwards(null);
      })
      .finally(() => {
        if (activeIdRef.current === personId) setAwardsLoading(false);
      });

    try {
      const data = await getPersonDetail(personId);
      if (activeIdRef.current !== personId) return; // Stale request guard

      if (!data) {
        setError(true);
      } else {
        // Pre-verify portrait image is loaded before transitioning
        if (data.portrait) {
          await new Promise<void>((resolve) => {
            const preloader = new Image();
            preloader.src = data.portrait;
            preloader.onload = () => resolve();
            preloader.onerror = () => resolve();
          });
        }
        if (activeIdRef.current !== personId) return;
        setPerson(data);
      }
    } catch (err) {
      console.error('Failed to load person detail', err);
      if (activeIdRef.current === personId) setError(true);
    } finally {
      if (activeIdRef.current === personId) {
        setLoading(false);
        markAppReady();
      }
    }
  };

  useEffect(() => {
    activeIdRef.current = personId;
    fetchPersonDetail();
    window.scrollTo(0, 0);
  }, [personId]);

  if (loading) {
    return <PersonDetailSkeleton />;
  }

  if (error || !person) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pt-28 pb-20 px-4 sm:px-8 mx-auto">
        <ErrorState
          title="PERSON NOT FOUND"
          message="Could not load the requested artist or creator record from the database."
          onRetry={fetchPersonDetail}
        />
      </div>
    );
  }

  const filteredCredits = person.filmography ? person.filmography.filter(c => filmoFilter === 'all' || c.type === filmoFilter) : [];

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pb-24 selection:bg-[#E43D3D] selection:text-white">
      
      {/* ==================================================
          1. HERO SECTION — ARCHITECTURAL EDITORIAL PORTRAIT
         ================================================== */}
      <section className="relative w-full min-h-[82vh] lg:min-h-[90vh] flex flex-col justify-between pt-6 sm:pt-8 pb-10 sm:pb-14 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 overflow-hidden bg-[#0B0B0D]">
        {/* Large Dominant Portrait Canvas */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {person.portrait ? (
            <img
              src={person.portrait}
              alt={person.name}
              className="w-full h-full object-cover object-[65%_25%] sm:object-[70%_25%] filter grayscale contrast-125 opacity-35 sm:opacity-50 lg:opacity-75 scale-100 transition-transform duration-1000 ease-out"
            />
          ) : (
            <div className="w-full h-full bg-[#111114]" />
          )}
          {/* Filmic Multi-Directional Gradients for Contrast & Integration */}
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
              THE ART OF THE SCREEN
            </span>
          </div>

          <Link
            to="/people"
            className="group flex items-center gap-1.5 text-[10px] sm:text-xs font-mono tracking-wider text-[#8E8E93] hover:text-[#E43D3D] transition-colors uppercase"
          >
            <span>PEOPLE DIRECTORY</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Mid Row: Minimal Editorial Micro-Columns + Asymmetric Metric Block */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto pt-8 pb-4 items-start">
          {/* Left Columns */}
          <div className="lg:col-span-8 xl:col-span-9 flex flex-wrap gap-8 sm:gap-14">
            {/* Column 1: KNOWN FOR */}
            <div className="space-y-1.5 min-w-[140px] max-w-[220px]">
              <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#8E8E93]">
                KNOWN FOR
              </div>
              <div className="space-y-0.5">
                {(person.knownFor && person.knownFor.length > 0
                  ? person.knownFor.slice(0, 3)
                  : person.filmography ? person.filmography.slice(0, 3).map(f => f.title) : []
                ).map((title, i) => (
                  <p key={i} className="text-xs sm:text-sm font-sans text-[#F2F0EC] truncate">
                    {title}
                  </p>
                ))}
              </div>
              <div className="w-5 h-[2px] bg-[#E43D3D] mt-2.5" />
            </div>

            {/* Column 2: BORN */}
            {person.birthDate && (
              <div className="space-y-1.5 min-w-[140px]">
                <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#8E8E93]">
                  BORN
                </div>
                <p className="text-xs sm:text-sm font-sans text-[#F2F0EC]">
                  {new Date(person.birthDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
                {(() => {
                  const birth = new Date(person.birthDate);
                  if (isNaN(birth.getTime())) return null;
                  const end = person.deathDate ? new Date(person.deathDate) : new Date();
                  let age = end.getFullYear() - birth.getFullYear();
                  const m = end.getMonth() - birth.getMonth();
                  if (m < 0 || (m === 0 && end.getDate() < birth.getDate())) age--;
                  return age > 0 ? (
                    <p className="text-[11px] font-mono text-[#8E8E93]">({age} years)</p>
                  ) : null;
                })()}
                <div className="w-5 h-[2px] bg-[#E43D3D] mt-2.5" />
              </div>
            )}

            {/* Column 3: ORIGIN */}
            {person.birthPlace && (
              <div className="space-y-1.5 min-w-[140px] max-w-[200px] hidden sm:block">
                <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#8E8E93]">
                  ORIGIN
                </div>
                <p className="text-xs sm:text-sm font-sans text-[#F2F0EC] line-clamp-2">
                  {person.birthPlace}
                </p>
                <div className="w-5 h-[2px] bg-[#E43D3D] mt-2.5" />
              </div>
            )}
          </div>

          {/* Right Asymmetric Metric Block */}
          <div className="lg:col-span-4 xl:col-span-3 lg:pl-8 space-y-1.5">
            <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#8E8E93]">
              FILMOGRAPHY
            </div>
            <div className="text-4xl sm:text-5xl font-display font-light text-white tracking-tight">
              {person.filmography?.length || 0}
            </div>
            <div className="w-6 h-[2px] bg-[#E43D3D] mt-2.5" />
          </div>
        </div>

        {/* Bottom Row: Oversized Title, Actions & Thumbnail Card */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6 pt-4">
          {/* Oversized Title & Circular Navigation */}
          <div className="space-y-4 max-w-4xl">
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-display font-bold text-[#F2F0EC] tracking-tight leading-[0.88] uppercase">
              {person.name}
            </h1>

            {/* Restrained Navigation Controls matching the reference image */}
            <div className="flex items-center gap-3 pt-2">
              <Link
                to="/people"
                aria-label="Back to People"
                className="w-10 h-10 rounded-full border border-white/20 hover:border-white/50 flex items-center justify-center text-[#8E8E93] hover:text-white transition-all bg-[#0B0B0D]/50 backdrop-blur-sm"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>

              <a
                href="#filmography-section"
                aria-label="Jump to Filmography"
                className="w-10 h-10 rounded-full bg-[#E43D3D] hover:bg-[#c93535] flex items-center justify-center text-white transition-all shadow-lg shadow-[#E43D3D]/30"
              >
                <ArrowRight className="w-4 h-4" />
              </a>

              {person.imdbId && (
                <a
                  href={`https://www.imdb.com/name/${person.imdbId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-3 inline-flex items-center gap-1.5 text-[11px] font-mono tracking-widest uppercase text-[#8E8E93] hover:text-[#E43D3D] transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#E43D3D]" />
                  <span>IMDb PROFILE</span>
                </a>
              )}
            </div>
          </div>

          {/* Right Bottom Anchor: Artwork Thumbnail & Numeric Index */}
          <div className="flex items-end gap-5 lg:ml-auto">
            {/* Small Artwork Thumbnail */}
            <div className="relative w-20 h-24 sm:w-24 sm:h-32 border border-white/15 bg-[#111114] shadow-2xl overflow-hidden flex-shrink-0 group">
              {person.portrait ? (
                <img
                  src={person.portrait}
                  alt={person.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] font-mono text-[#8E8E93]">
                  PORTRAIT
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Pagination / Section Index & Small Control Pair */}
            <div className="space-y-2">
              <div className="text-[11px] font-mono tracking-widest text-[#8E8E93]">
                {person.filmography && person.filmography.length > 0
                  ? person.filmography.length < 10
                    ? `01 / 0${person.filmography.length}`
                    : `01 / ${person.filmography.length}`
                  : '01 / 01'}
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="#biography-section"
                  title="Biography"
                  className="w-8 h-8 rounded-full border border-white/20 hover:border-white/50 flex items-center justify-center text-[#8E8E93] hover:text-white transition-all bg-[#0B0B0D]/50"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </a>
                <a
                  href="#filmography-section"
                  title="Filmography"
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
          2. PERSON BIOGRAPHY — ABOUT SECTION
         ================================================== */}
      <section id="biography-section" className="mt-12 sm:mt-16 lg:mt-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 w-full space-y-6 scroll-mt-28">
        <SectionHeader
          label="BIOGRAPHICAL ARCHIVE"
          title="BIOGRAPHY"
        />

        <div className="max-w-4xl text-base sm:text-lg font-light text-[#F2F0EC]/90 leading-relaxed space-y-5 font-sans">
          {person.biography ? (
            person.biography.split('\n\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))
          ) : (
            <p className="text-[#8E8E93] font-mono text-xs uppercase tracking-wider">
              No biographical record archived for this individual.
            </p>
          )}
        </div>
      </section>

      {/* ==================================================
          3. KNOWN FOR — VISUALLY PROMINENT SECTION
         ================================================== */}
      {person.knownFor && person.knownFor.length > 0 && (
        <section className="mt-12 sm:mt-16 lg:mt-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 w-full space-y-6">
          <SectionHeader
            label="SIGNATURE WORKS"
            title="KNOWN FOR"
            description="Primary works establishing cinematic presence and recognition."
          />

          {/* Render Known For titles using credit items matching the titles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {person.filmography.slice(0, 6).map(credit => (
              <Link
                key={`known-${credit.id}`}
                to={credit.type === 'movie' ? `/movie/${credit.id}` : `/tv/${credit.id}`}
                className="group bg-[#111114] border border-white/10 hover:border-white/30 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-xl"
              >
                <div className="aspect-[2/3] bg-black overflow-hidden relative">
                  <img
                    src={credit.poster}
                    alt={credit.title}
                    className="w-full h-full object-cover filter grayscale-[15%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111114] via-transparent to-transparent opacity-60 pointer-events-none" />
                </div>

                <div className="p-3 space-y-1">
                  <h4 className="font-sans font-bold text-sm text-[#F2F0EC] group-hover:text-[#E43D3D] transition-colors truncate">
                    {credit.title}
                  </h4>
                  <p className="text-[10px] font-mono text-[#8E8E93] uppercase tracking-wider">
                    {credit.year} • {credit.role || 'Credit'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ==================================================
          AWARDS — REAL AUTHORIZED DATA ONLY (HIDDEN IF UNAVAILABLE)
         ================================================== */}
      <div className="w-full mt-10 sm:mt-16 lg:mt-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <AwardsSection awards={awards} loading={awardsLoading} title="AWARDS & NOMINATIONS" />
      </div>

      {/* ==================================================
          4. PERSON FILMOGRAPHY — COMPACT EDITORIAL STREAM
         ================================================== */}
      {person.filmography && person.filmography.length > 0 && (
        <section id="filmography-section" className="mt-12 sm:mt-16 lg:mt-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 w-full space-y-6 scroll-mt-28">
          <SectionHeader
            label="COMPLETE RECORD"
            title="FILMOGRAPHY"
            rightElement={
              <div className="flex items-center gap-1 bg-[#111114] border border-white/10 p-1">
                {(['all', 'movie', 'tv'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setFilmoFilter(tab)}
                    className={`text-[10px] font-mono font-bold uppercase tracking-wider px-3 sm:px-3.5 py-2 sm:py-1.5 min-h-[40px] sm:min-h-0 transition-colors ${
                      filmoFilter === tab
                        ? 'bg-[#E43D3D] text-white'
                        : 'text-[#8E8E93] hover:text-[#F2F0EC]'
                    }`}
                  >
                    {tab === 'all'
                      ? `ALL (${person.filmography.length})`
                      : tab === 'movie'
                      ? `MOVIES (${person.filmography.filter(c => c.type === 'movie').length})`
                      : `TV SHOWS (${person.filmography.filter(c => c.type === 'tv').length})`}
                  </button>
                ))}
              </div>
            }
          />

          {/* Credit Stream Container */}
          <div className="bg-[#111114] border border-white/10 divide-y divide-white/10 shadow-xl overflow-hidden">
            {filteredCredits.map(credit => (
              <Link
                key={credit.id}
                to={credit.type === 'movie' ? `/movie/${credit.id}` : `/tv/${credit.id}`}
                className="group p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-[#17171B]/50 transition-colors"
              >
                {/* Poster Thumbnail + Hierarchy Details */}
                <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                  {/* Poster Thumbnail */}
                  <div className="w-12 h-16 sm:w-14 sm:h-20 flex-shrink-0 bg-black overflow-hidden border border-white/10 relative shadow-md">
                    <img
                      src={credit.poster}
                      alt={credit.title}
                      className="w-full h-full object-cover filter grayscale-[15%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-300"
                    />
                  </div>

                  {/* Title -> Year/Type -> Role Hierarchy */}
                  <div className="space-y-1 min-w-0">
                    {/* TITLE */}
                    <h4 className="font-sans font-bold text-base sm:text-lg text-[#F2F0EC] group-hover:text-[#E43D3D] transition-colors truncate">
                      {credit.title}
                    </h4>

                    {/* YEAR / TYPE */}
                    <div className="flex items-center gap-2 text-xs font-mono text-[#8E8E93]">
                      <span className="text-[#F2F0EC] font-semibold">{credit.year}</span>
                      <span>•</span>
                      <span className="uppercase text-[#8E8E93]">
                        {credit.type === 'movie' ? 'Feature Film' : 'Television'}
                      </span>
                      {credit.rating && credit.rating > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-[#E43D3D]">★ {credit.rating.toFixed(1)}</span>
                        </>
                      )}
                    </div>

                    {/* ROLE */}
                    {credit.role && (
                      <p className="text-xs font-mono text-[#8E8E93]/80 truncate">
                        as <span className="text-[#F2F0EC] font-medium">{credit.role}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Arrow Icon Affordance */}
                <div className="flex items-center gap-2 text-xs font-mono text-[#8E8E93] group-hover:text-[#E43D3D] transition-colors flex-shrink-0">
                  <ArrowUpRight className="w-4 h-4 text-[#8E8E93] group-hover:text-[#E43D3D] transition-colors" />
                </div>
              </Link>
            ))}

            {filteredCredits.length === 0 && (
              <div className="p-8 text-center text-[#8E8E93] font-mono text-xs uppercase">
                NO CREDITS MATCH THE SELECTED FILTER.
              </div>
            )}
          </div>
        </section>
      )}

    </div>
  );
};

export default PersonDetailPage;
