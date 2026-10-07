import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const { openSearch } = useApp();

  return (
    <footer id="site-footer" className="bg-[#0B0B0D] border-t border-white/10 text-[#F2F0EC] py-12">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 space-y-8">
        
        {/* Brand & Statement */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="type-h3 text-2xl text-[#F2F0EC] group-hover:text-[#E43D3D] transition-colors leading-none tracking-widest">
              CINEMURA
            </span>
            <span className="w-2 h-2 bg-[#E43D3D] rounded-full inline-block" />
          </Link>

          {/* Primary Navigation Links */}
          <nav className="flex flex-wrap items-center gap-6 text-xs text-[#929298]">
            <Link to="/movie" className="hover:text-white transition-colors">MOVIES</Link>
            <Link to="/tv" className="hover:text-white transition-colors">TV SHOWS</Link>
            <Link to="/discover" className="hover:text-white transition-colors">GENRES</Link>
            <Link to="/people" className="hover:text-white transition-colors">PEOPLE</Link>
            <button onClick={openSearch} className="hover:text-white transition-colors uppercase">SEARCH</button>
          </nav>
        </div>

        {/* Legal & Attribution Notice */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-[#626269] font-mono">
          <p className="max-w-2xl font-light">
            This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>

          <p className="text-[11px]">
            © {new Date().getFullYear()} CINEMURA. ALL RIGHTS RESERVED.
          </p>
        </div>

      </div>
    </footer>
  );
};
