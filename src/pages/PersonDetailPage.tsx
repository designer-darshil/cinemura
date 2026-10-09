import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowLeft, ArrowUpRight, ExternalLink } from 'lucide-react';
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
      
      {/* Top Navigation Bar */}
      <div className="pt-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 w-full">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <Link
            to="/people"
            className="group flex items-center gap-2 text-xs font-mono tracking-wider text-[#8E8E93] hover:text-[#E43D3D] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>PEOPLE DIRECTORY</span>
          </Link>
        </div>
      </div>

      {/* ==================================================
          1. HERO CONCEPT — PORTRAIT-DRIVEN CALM PROFILE
         ================================================== */}
      <section className="mt-8 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 w-full">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          {/* LEFT: Dominant Portrait Visual Anchor */}
          <div className="lg:col-span-4 max-w-[220px] sm:max-w-xs lg:max-w-none mx-auto w-full">
            <div className="relative aspect-[3/4] bg-black border border-white/10 overflow-hidden shadow-2xl">
              <img
                src={person.portrait}
                alt={person.name}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              {person.role && (
                <div className="absolute bottom-3 left-3">
                  <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 uppercase bg-white/10 backdrop-blur-sm text-white border border-white/10">
                    {person.role}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Name & Essential Identity Metadata */}
          <div className="lg:col-span-8 space-y-5 sm:space-y-6 text-center lg:text-left">
            
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold text-[#F2F0EC] tracking-tight uppercase leading-none">
                {person.name}
              </h1>
            </div>

            {/* Short Identity Metadata Row */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 text-xs sm:text-sm font-mono text-[#8E8E93] border-y border-white/10 py-3.5">
              {person.birthDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#E43D3D]" />
                  <span>BORN:</span>
                  <span className="text-[#F2F0EC] font-medium">{person.birthDate}</span>
                </div>
              )}

              {person.birthPlace && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#E43D3D]" />
                  <span className="text-[#F2F0EC] font-medium">{person.birthPlace}</span>
                </div>
              )}
            </div>

            {/* Also Known As Tags if Available */}
            {person.alsoKnownAs && person.alsoKnownAs.length > 0 && (
              <div className="text-xs font-mono text-[#8E8E93] pt-1">
                <span className="text-[#8E8E93] mr-2">ALSO KNOWN AS:</span>
                <span className="text-[#F2F0EC]">{person.alsoKnownAs.slice(0, 3).join(' • ')}</span>
              </div>
            )}

            {/* IMDb Link */}
            {person.imdbId && (
              <div className="pt-2">
                <a
                  href={`https://www.imdb.com/name/${person.imdbId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-mono tracking-wider text-[#8E8E93] hover:text-[#E43D3D] transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#E43D3D]" />
                  <span>IMDb PROFILE</span>
                </a>
              </div>
            )}

          </div>

        </div>

      </section>

      {/* ==================================================
          2. PERSON BIOGRAPHY — ABOUT SECTION
         ================================================== */}
      <section className="mt-10 sm:mt-16 lg:mt-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 w-full space-y-6">
        
        <div className="border-t border-white/10 pt-8 sm:pt-12">
          <SectionHeader
            title="BIOGRAPHY"
          />

          <div className="mt-6 max-w-4xl text-base sm:text-lg font-light text-[#F2F0EC]/90 leading-relaxed space-y-4 font-serif">
            {person.biography ? (
              person.biography.split('\n\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))
            ) : (
              <p className="italic text-[#8E8E93] font-sans text-sm">
                No biography record provided in the database.
              </p>
            )}
          </div>
        </div>

      </section>

      {/* ==================================================
          3. KNOWN FOR — VISUALLY PROMINENT SECTION
         ================================================== */}
      {person.knownFor && person.knownFor.length > 0 && (
        <section className="mt-10 sm:mt-16 lg:mt-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 w-full space-y-6">
          
          <SectionHeader
            title="KNOWN FOR"
          />

          {/* Render Known For titles using credit items matching the titles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {person.filmography.slice(0, 6).map(credit => (
              <Link
                key={`known-${credit.id}`}
                to={credit.type === 'movie' ? `/movie/${credit.id}` : `/tv/${credit.id}`}
                className="group bg-[#111114] border border-white/10 hover:border-white/30 transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                <div className="aspect-[2/3] bg-black overflow-hidden relative">
                  <img
                    src={credit.poster}
                    alt={credit.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111114] via-transparent to-transparent opacity-60 pointer-events-none" />
                </div>

                <div className="p-3 space-y-1">
                  <h4 className="font-serif font-bold text-sm text-[#F2F0EC] group-hover:text-[#E43D3D] transition-colors truncate">
                    {credit.title}
                  </h4>
                  <p className="text-[11px] font-mono text-[#8E8E93]">
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
        <section className="mt-12 sm:mt-16 lg:mt-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 w-full space-y-8">
          
          <SectionHeader
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
                    {tab === 'all' ? 'ALL CREDITS' : tab === 'movie' ? 'MOVIES' : 'TV SHOWS'}
                  </button>
                ))}
              </div>
            }
          />

          {/* Credit Stream Container */}
          <div className="bg-[#111114] border border-white/10 divide-y divide-white/10">
            {filteredCredits.map(credit => (
              <Link
                key={credit.id}
                to={credit.type === 'movie' ? `/movie/${credit.id}` : `/tv/${credit.id}`}
                className="group p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-white/[0.03] transition-colors"
              >
                {/* Poster Thumbnail + Hierarchy Details */}
                <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                  
                  {/* Poster Thumbnail */}
                  <div className="w-12 h-16 sm:w-14 sm:h-20 flex-shrink-0 bg-black overflow-hidden border border-white/10 relative">
                    <img
                      src={credit.poster}
                      alt={credit.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Title -> Year/Type -> Role Hierarchy */}
                  <div className="space-y-1 min-w-0">
                    
                    {/* TITLE */}
                    <h4 className="font-serif font-bold text-base sm:text-lg text-[#F2F0EC] group-hover:text-[#E43D3D] transition-colors truncate">
                      {credit.title}
                    </h4>

                    {/* YEAR / TYPE */}
                    <div className="flex items-center gap-2 text-xs font-mono text-[#8E8E93]">
                      <span className="text-[#F2F0EC] font-bold">{credit.year}</span>
                      <span>•</span>
                      <span className="uppercase text-[#8E8E93]">
                        {credit.type === 'movie' ? 'Feature Film' : 'TV Series'}
                      </span>
                      {credit.rating && credit.rating > 0 && (
                        <>
                          <span>•</span>
                          <span>★ {credit.rating.toFixed(1)}</span>
                        </>
                      )}
                    </div>

                    {/* ROLE */}
                    {credit.role && (
                      <p className="text-xs font-mono text-[#8E8E93]/80 truncate">
                        as <span className="text-[#F2F0EC]">{credit.role}</span>
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
