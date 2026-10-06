import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowLeft, ArrowUpRight, TrendingUp, ExternalLink } from 'lucide-react';
import { getPersonDetail } from '../services/tmdb';
import { Person } from '../types';
import { SectionHeader } from '../components/SectionHeader';
import { PersonDetailSkeleton, ErrorState } from '../components/StateViews';
import { AwardsSection } from '../components/AwardsSection';
import { getPersonAwards } from '../services/awardsService';
import { EntityAwardsData } from '../types';

export const PersonDetailPage: React.FC = () => {
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
      if (activeIdRef.current === personId) setLoading(false);
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
          title="PERSONALITY PROFILE UNRESOLVED"
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
            <span>CAST & CREW DIRECTORY</span>
          </Link>

          <span className="text-[10px] font-mono tracking-[0.25em] text-[#8E8E93] uppercase">
            CAREER PROFILE
          </span>
        </div>
      </div>

      {/* ==================================================
          1. HERO CONCEPT — PORTRAIT-DRIVEN CALM PROFILE
         ================================================== */}
      <section className="mt-8 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 w-full">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center bg-[#111114] border border-white/10 p-6 sm:p-10 md:p-12 relative overflow-hidden">
          
          {/* Subtle Ambient Film Grain */}
          <div className="absolute inset-0 film-grain pointer-events-none opacity-20" />

          {/* LEFT: Dominant Portrait Visual Anchor */}
          <div className="lg:col-span-4 max-w-sm mx-auto lg:max-w-none w-full">
            <div className="relative aspect-[3/4] bg-black border border-white/20 overflow-hidden shadow-2xl group/portrait">
              <img
                src={person.portrait}
                alt={person.name}
                className="w-full h-full object-cover group-hover/portrait:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3">
                <span className="text-[10px] font-mono font-extrabold tracking-[0.2em] px-2.5 py-1 uppercase bg-[#E43D3D] text-white">
                  {person.role || 'ARTIST'}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: Name & Essential Identity Metadata */}
          <div className="lg:col-span-8 space-y-6 text-center lg:text-left">
            
            <div className="space-y-2">
              <span className="text-[10px] font-mono tracking-[0.25em] text-[#E43D3D] uppercase block">
                EDITORIAL PROFILE
              </span>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold text-[#F2F0EC] tracking-tight uppercase leading-none">
                {person.name}
              </h1>
            </div>

            {/* Short Identity Metadata Row */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 text-xs sm:text-sm font-mono text-[#8E8E93] border-y border-white/10 py-4">
              {person.birthDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#E43D3D]" />
                  <span className="text-[#8E8E93]">BORN:</span>
                  <span className="text-[#F2F0EC] font-semibold">{person.birthDate}</span>
                </div>
              )}

              {person.birthPlace && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#E43D3D]" />
                  <span className="text-[#F2F0EC] font-semibold">{person.birthPlace}</span>
                </div>
              )}

              {person.popularity && (
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#E43D3D]" />
                  <span className="text-[#8E8E93]">POPULARITY INDEX:</span>
                  <span className="text-[#F2F0EC] font-bold">{person.popularity}</span>
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
                  className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-[#F2F0EC] hover:text-[#E43D3D] border border-white/20 hover:border-[#E43D3D] px-4 py-2 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#E43D3D]" />
                  <span>IMDB PROFILE</span>
                </a>
              </div>
            )}

          </div>

        </div>

      </section>

      {/* ==================================================
          2. PERSON BIOGRAPHY — ABOUT SECTION
         ================================================== */}
      <section className="mt-16 sm:mt-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 w-full space-y-6">
        
        <div className="border-t border-white/10 pt-12">
          <SectionHeader
            label="BIOGRAPHY"
            title="ABOUT"
            description="Background and career trajectory of the artist."
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
        <section className="mt-16 sm:mt-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 w-full space-y-6">
          
          <SectionHeader
            label="ACCLAIMED WORKS"
            title="KNOWN FOR"
            description="Notable films and series associated with this profile."
          />

          {/* Render Known For titles using credit items matching the titles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {person.filmography.slice(0, 6).map(credit => (
              <Link
                key={`known-${credit.id}`}
                to={credit.type === 'movie' ? `/movie/${credit.id}` : `/tv/${credit.id}`}
                className="group bg-[#111114] border border-white/10 hover:border-[#E43D3D] transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                <div className="aspect-[2/3] bg-black overflow-hidden relative">
                  <img
                    src={credit.poster}
                    alt={credit.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111114] via-transparent to-transparent opacity-60" />
                  <span className="absolute top-2 left-2 text-[8px] font-mono font-extrabold uppercase px-1.5 py-0.5 bg-[#E43D3D] text-white">
                    {credit.type === 'movie' ? 'MOVIE' : 'TV'}
                  </span>
                </div>

                <div className="p-3 space-y-1">
                  <h4 className="font-serif font-bold text-sm text-[#F2F0EC] group-hover:text-[#E43D3D] transition-colors truncate flex items-center justify-between">
                    <span className="truncate">{credit.title}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#E43D3D] opacity-0 group-hover:opacity-100 transition-opacity" />
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
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <AwardsSection awards={awards} loading={awardsLoading} title="AWARDS & NOMINATIONS" label="CAREER HONORS" />
      </div>

      {/* ==================================================
          4. PERSON FILMOGRAPHY — COMPACT EDITORIAL STREAM
         ================================================== */}
      {person.filmography && person.filmography.length > 0 && (
        <section className="mt-20 sm:mt-28 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 w-full space-y-8">
          
          <SectionHeader
            label="FULL CREDIT RECORD"
            title="FILMOGRAPHY"
            rightElement={
              <div className="flex items-center gap-1 bg-[#111114] border border-white/10 p-1">
                {(['all', 'movie', 'tv'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setFilmoFilter(tab)}
                    className={`text-[10px] font-mono font-bold uppercase tracking-wider px-3.5 py-1.5 transition-colors ${
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
                      <span className="uppercase text-[#E43D3D] font-bold">
                        {credit.type === 'movie' ? 'FEATURE FILM' : 'TV SERIES'}
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
                  <span className="hidden sm:inline uppercase tracking-wider text-[10px]">VIEW PROFILE</span>
                  <ArrowUpRight className="w-4 h-4 text-[#E43D3D] opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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
