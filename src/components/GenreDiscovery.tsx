import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { SectionHeader } from './SectionHeader';

interface GenreInfo {
  id: string;
  name: string;
  backdrop: string;
  tagline: string;
}

const FEATURED_GENRES: GenreInfo[] = [
  {
    id: '28',
    name: 'ACTION & ADVENTURE',
    backdrop: 'https://image.tmdb.org/t/p/w1280/8y1h8p6bX7V6z1X7q3.jpg', // High quality backdrop fallback
    tagline: 'High-stakes conflict and adrenaline-fueled cinema'
  },
  {
    id: '18',
    name: 'DRAMA',
    backdrop: 'https://image.tmdb.org/t/p/w1280/9l1E43D3D.jpg',
    tagline: 'Auteur narratives and profound human experiences'
  },
  {
    id: '878',
    name: 'SCI-FI & FANTASY',
    backdrop: 'https://image.tmdb.org/t/p/w1280/x2LSRK2CmZFu2AgebNVmFuSqPev.jpg',
    tagline: 'Futuristic visions and speculative worlds'
  },
  {
    id: '53',
    name: 'THRILLER & MYSTERY',
    backdrop: 'https://image.tmdb.org/t/p/w1280/vL5WB9FQm2iofB259m8p6a8x3y.jpg',
    tagline: 'Psychological tension and noir storytelling'
  }
];

const ALL_GENRES_TEXT = [
  { id: '28', name: 'ACTION' },
  { id: '12', name: 'ADVENTURE' },
  { id: '16', name: 'ANIMATION' },
  { id: '35', name: 'COMEDY' },
  { id: '80', name: 'CRIME' },
  { id: '99', name: 'DOCUMENTARY' },
  { id: '18', name: 'DRAMA' },
  { id: '14', name: 'FANTASY' },
  { id: '27', name: 'HORROR' },
  { id: '9648', name: 'MYSTERY' },
  { id: '10749', name: 'ROMANCE' },
  { id: '878', name: 'SCI-FI' },
  { id: '53', name: 'THRILLER' },
];

export const GenreDiscovery: React.FC = () => {
  return (
    <div className="space-y-6">
      <SectionHeader
        label="CATEGORIES"
        title="GENRE DISCOVERY"
        description="Explore feature films and prestige television grouped by narrative style and cinematic tone."
      />

      {/* Editorial Genre Panel Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Large Primary Featured Genre Panel */}
        <Link
          to={`/genre/${FEATURED_GENRES[0].id}/movie`}
          className="lg:col-span-7 group relative min-h-[260px] sm:min-h-[320px] bg-[#111114] border border-white/10 hover:border-[#E43D3D] transition-all duration-300 overflow-hidden flex flex-col justify-end p-6 sm:p-8"
        >
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1280&auto=format&fit=crop"
              alt="Action"
              className="w-full h-full object-cover filter brightness-50 contrast-125 transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D] via-[#0B0B0D]/50 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />
          </div>

          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-extrabold tracking-[0.2em] px-2 py-0.5 uppercase bg-[#E43D3D] text-white">
                FEATURED GENRE
              </span>
            </div>

            <h3 className="font-editorial-heading text-3xl sm:text-4xl text-white tracking-wider group-hover:text-[#E43D3D] transition-colors flex items-center justify-between">
              <span>ACTION & ADVENTURE</span>
              <ArrowUpRight className="w-6 h-6 text-[#E43D3D] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
            </h3>

            <p className="type-small font-light text-[#929298] max-w-md line-clamp-1">
              High-stakes conflict, spectacle, and adrenaline-fueled cinema
            </p>
          </div>
        </Link>

        {/* Supporting Genre Panels Column */}
        <div className="lg:col-span-5 grid grid-cols-1 gap-4">
          
          <Link
            to={`/genre/${FEATURED_GENRES[1].id}/movie`}
            className="group relative min-h-[150px] bg-[#111114] border border-white/10 hover:border-[#E43D3D] transition-all duration-300 overflow-hidden flex flex-col justify-end p-5"
          >
            <div className="absolute inset-0 z-0">
              <img
                src="https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1000&auto=format&fit=crop"
                alt="Drama"
                className="w-full h-full object-cover filter brightness-45 contrast-125 transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D] via-[#0B0B0D]/60 to-transparent opacity-90" />
            </div>

            <div className="relative z-10 space-y-1">
              <span className="type-label text-[#E43D3D]">PRESTIGE DRAMA</span>
              <h3 className="type-h3 text-xl text-white group-hover:text-[#E43D3D] transition-colors flex items-center justify-between">
                <span>DRAMA & AUTEUR</span>
                <ArrowUpRight className="w-4 h-4 text-[#E43D3D] opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
            </div>
          </Link>

          <div className="grid grid-cols-2 gap-4">
            <Link
              to={`/genre/${FEATURED_GENRES[2].id}/movie`}
              className="group relative min-h-[140px] bg-[#111114] border border-white/10 hover:border-[#E43D3D] transition-all duration-300 overflow-hidden flex flex-col justify-end p-4"
            >
              <div className="absolute inset-0 z-0">
                <img
                  src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop"
                  alt="Sci-Fi"
                  className="w-full h-full object-cover filter brightness-45 transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D] via-transparent to-transparent opacity-90" />
              </div>

              <div className="relative z-10">
                <h4 className="type-h3 text-sm text-white group-hover:text-[#E43D3D] transition-colors leading-tight">
                  SCI-FI & FANTASY
                </h4>
              </div>
            </Link>

            <Link
              to={`/genre/${FEATURED_GENRES[3].id}/movie`}
              className="group relative min-h-[140px] bg-[#111114] border border-white/10 hover:border-[#E43D3D] transition-all duration-300 overflow-hidden flex flex-col justify-end p-4"
            >
              <div className="absolute inset-0 z-0">
                <img
                  src="https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop"
                  alt="Thriller"
                  className="w-full h-full object-cover filter brightness-45 transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D] via-transparent to-transparent opacity-90" />
              </div>

              <div className="relative z-10">
                <h4 className="type-h3 text-sm text-white group-hover:text-[#E43D3D] transition-colors leading-tight">
                  THRILLER & NOIR
                </h4>
              </div>
            </Link>
          </div>

        </div>

      </div>

      {/* Clean Text-Based Genre Navigation Strip */}
      <div className="bg-[#111114] border border-white/10 p-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-mono text-[#929298]">
        {ALL_GENRES_TEXT.map((genre, idx) => (
          <React.Fragment key={genre.id}>
            <Link
              to={`/genre/${genre.id}/movie`}
              className="hover:text-[#E43D3D] transition-colors tracking-wider uppercase"
            >
              {genre.name}
            </Link>
            {idx < ALL_GENRES_TEXT.length - 1 && (
              <span className="text-white/20">•</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
