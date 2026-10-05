import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowLeft, ArrowUpRight } from 'lucide-react';
import { getPopularPeople, getPersonDetail } from '../services/tmdb';
import { Person } from '../types';
import { PersonCard } from '../components/MediaCard';
import { SectionHeader } from '../components/SectionHeader';
import {
  CardGridSkeleton,
  ErrorState,
  EmptyState,
  InfiniteLoadingSkeleton,
  InfiniteErrorState,
  EndOfContentState
} from '../components/StateViews';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

export const PeoplePage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();

  const [people, setPeople] = useState<Person[]>([]);
  const [personDetail, setPersonDetail] = useState<Person | null>(null);
  const [filmoFilter, setFilmoFilter] = useState<'all' | 'movie' | 'tv'>('all');
  
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [errorMore, setErrorMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchPeopleList = async (targetPage: number = 1, append: boolean = false) => {
    if (append) {
      setLoadingMore(true);
      setErrorMore(false);
    } else {
      setLoading(true);
      setError(false);
    }

    try {
      const data = await getPopularPeople(targetPage);
      if (!data || data.length === 0) {
        if (!append) setError(true);
        setHasMore(false);
      } else {
        if (append) {
          setPeople(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const uniqueNew = data.filter(p => !existingIds.has(p.id));
            return [...prev, ...uniqueNew];
          });
        } else {
          setPeople(data);
        }
        setHasMore(data.length >= 10);
      }
    } catch (err) {
      console.error('Failed to load popular people', err);
      if (append) {
        setErrorMore(true);
      } else {
        setError(true);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchPersonInfo = async (id: string) => {
    setLoading(true);
    setError(false);
    try {
      const data = await getPersonDetail(id);
      if (!data) {
        setError(true);
      } else {
        setPersonDetail(data);
      }
    } catch (err) {
      console.error('Failed to load person detail', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchPersonInfo(slug);
    } else {
      setPage(1);
      fetchPeopleList(1, false);
    }
  }, [slug]);

  const handleLoadMore = useCallback(() => {
    if (loadingMore || !hasMore || slug) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPeopleList(nextPage, true);
  }, [page, loadingMore, hasMore, slug]);

  const sentinelRef = useInfiniteScroll({
    loading: loading || loadingMore,
    hasMore,
    onLoadMore: handleLoadMore
  });

  if (slug) {
    if (loading) {
      return (
        <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pt-28 pb-20 px-4 sm:px-8 mx-auto">
          <CardGridSkeleton count={6} />
        </div>
      );
    }

    if (error || !personDetail) {
      return (
        <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pt-28 pb-20 px-4 sm:px-8 mx-auto">
          <ErrorState
            title="PROFILE NOT FOUND"
            message="Unable to retrieve the requested cast or crew record from the live database."
            onRetry={() => fetchPersonInfo(slug)}
          />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pt-28 pb-20 px-4 sm:px-8 mx-auto space-y-12">
        
        <Link
          to="/people"
          className="btn-link inline-flex items-center gap-2 text-white text-md fw-bold uppercase text-[#929298] hover:text-[#E43D3D]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO CAST & CREW DIRECTORY</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          <div className="lg:col-span-4">
            <div className="aspect-[3/4] bg-[#111114] border border-white/10 p-2">
              <img
                src={personDetail.portrait}
                alt={personDetail.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <span className="type-label bg-[#E43D3D] text-white px-2.5 py-1 inline-block">
              {personDetail.role} PROFILE
            </span>

            <h1 className="type-display-l text-white">
              {personDetail.name}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-xs text-[#929298] font-mono border-y border-white/10 py-3">
              {personDetail.birthDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#E43D3D]" /> BORN: {personDetail.birthDate}
                </span>
              )}
              {personDetail.birthPlace && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#E43D3D]" /> {personDetail.birthPlace}
                </span>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="type-h3 text-white">BIOGRAPHY</h3>
              <p className="type-body font-light">
                {personDetail.biography || 'No biography details provided.'}
              </p>
            </div>

            {personDetail.knownFor && personDetail.knownFor.length > 0 && (
              <div className="space-y-3 pt-4">
                <h3 className="type-h3 text-white">KNOWN FOR</h3>
                <div className="flex flex-wrap gap-2">
                  {personDetail.knownFor.map(title => (
                    <span key={title} className="bg-white/5 border border-white/10 px-3 py-1 text-xs text-white font-mono">
                      {title}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {personDetail.filmography && personDetail.filmography.length > 0 && (
          <div className="space-y-6 pt-8 border-t border-white/10">
            <SectionHeader
              label="CREDITS"
              title="FILMOGRAPHY"
              rightElement={
                <div className="flex items-center gap-1.5 bg-[#111114] border border-white/10 p-1">
                  {(['all', 'movie', 'tv'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setFilmoFilter(tab)}
                      className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 transition-colors ${
                        filmoFilter === tab
                          ? 'bg-[#E43D3D] text-white'
                          : 'text-[#929298] hover:text-white'
                      }`}
                    >
                      {tab === 'all' ? 'ALL' : tab === 'movie' ? 'MOVIES' : 'TV'}
                    </button>
                  ))}
                </div>
              }
            />

            <div className="divide-y divide-white/10 bg-[#111114] border border-white/10">
              {personDetail.filmography
                .filter(c => filmoFilter === 'all' || c.type === filmoFilter)
                .map(credit => (
                  <Link
                    key={credit.id}
                    to={credit.type === 'movie' ? `/movie/${credit.id}` : `/tv/${credit.id}`}
                    className="group p-3.5 sm:p-4 flex items-center justify-between gap-4 hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-14 sm:w-12 sm:h-16 flex-shrink-0 bg-black overflow-hidden border border-white/10">
                        <img
                          src={credit.poster}
                          alt={credit.title}
                          className="w-12 h-16 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <h4 className="type-h3 text-sm sm:text-base text-white group-hover:text-[#E43D3D] transition-colors truncate">
                          {credit.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs font-mono text-[#929298]">
                          <span>{credit.year}</span>
                          <span>•</span>
                          <span className="uppercase text-[#E43D3D] font-bold">{credit.type === 'movie' ? 'MOVIE' : 'TV'}</span>
                        </div>
                        {credit.role && (
                          <p className="type-small font-mono text-[#626269] truncate">
                            as {credit.role}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#929298] group-hover:text-[#E43D3D] transition-colors flex-shrink-0">
                      <span className="hidden sm:inline font-mono text-[11px] uppercase tracking-wider">VIEW</span>
                      <ArrowUpRight className="w-4 h-4 text-[#E43D3D] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        )}

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pt-24 pb-16 px-4 sm:px-8 mx-auto space-y-8">
      
      <SectionHeader
        label="DIRECTORY"
        title="ACTORS & DIRECTORS"
        description="Explore profiles of visionary directors, acclaimed actors, cinematographers, and creators."
      />

      {loading ? (
        <CardGridSkeleton count={12} />
      ) : error ? (
        <ErrorState
          title="FAILED TO LOAD PEOPLE DIRECTORY"
          message="Could not load live cast and crew directory."
          onRetry={() => fetchPeopleList(1, false)}
        />
      ) : people.length === 0 ? (
        <EmptyState
          title="NO PEOPLE FOUND"
          message="No cast or crew members returned."
        />
      ) : (
        <div className="space-y-6">
          <div className="type-label text-[#929298] border-b border-white/10 pb-2">
            DISPLAYING {people.length} CREATORS & ACTORS
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {people.map(person => (
              <PersonCard
                key={person.id}
                id={person.id}
                name={person.name}
                role={person.role}
                knownFor={person.knownFor}
                portrait={person.portrait}
                slug={person.slug}
              />
            ))}
          </div>

          {/* Sentinel Element for Preloading */}
          <div ref={sentinelRef} className="h-1 w-full" />

          {loadingMore && <InfiniteLoadingSkeleton count={6} />}

          {errorMore && (
            <InfiniteErrorState onRetry={() => fetchPeopleList(page, true)} />
          )}

          {!hasMore && people.length > 0 && (
            <EndOfContentState />
          )}
        </div>
      )}

    </div>
  );
};
