import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer id="site-footer" className="bg-[#0B0B0D] border-t border-white/10 text-[#F2F0EC] pt-12 sm:pt-16 pb-12 w-full">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 space-y-12">
        
        {/* Top Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-white/10">
          
          {/* Brand Manifesto Column */}
          <div className="md:col-span-5 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group py-1">
              <span className="font-display font-bold text-2xl text-[#F2F0EC] group-hover:text-[#E43D3D] transition-colors leading-none tracking-widest uppercase">
                CINEMURA
              </span>
              <span className="w-2 h-2 bg-[#E43D3D] inline-block" />
            </Link>

            <p className="text-xs sm:text-sm font-sans font-light text-[#8E8E93] max-w-sm leading-relaxed">
              A bespoke cinematic editorial index and playback platform. Curating timeless feature films, episodic television, animation archives, and visionary artists.
            </p>

            <div className="flex items-center gap-2 pt-2 text-[10px] font-mono text-[#8E8E93]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>SYSTEM STATUS: OPERATIONAL</span>
            </div>
          </div>

          {/* Directory Navigation Columns */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8 text-xs font-mono">
            
            {/* Catalog Column */}
            <div className="space-y-3">
              <span className="text-[10px] tracking-[0.25em] text-[#E43D3D] uppercase font-bold block">
                ARCHIVE
              </span>
              <ul className="space-y-2 text-[#8E8E93]">
                <li>
                  <Link to="/movie" className="hover:text-white transition-colors">
                    MOVIES
                  </Link>
                </li>
                <li>
                  <Link to="/tv" className="hover:text-white transition-colors">
                    TV SHOWS
                  </Link>
                </li>
                <li>
                  <Link to="/anime" className="hover:text-white transition-colors">
                    ANIME ARCHIVE
                  </Link>
                </li>
                <li>
                  <Link to="/person" className="hover:text-white transition-colors">
                    PEOPLE & CAST
                  </Link>
                </li>
              </ul>
            </div>

            {/* Discovery Column */}
            <div className="space-y-3">
              <span className="text-[10px] tracking-[0.25em] text-[#8E8E93] uppercase font-bold block">
                DISCOVERY
              </span>
              <ul className="space-y-2 text-[#8E8E93]">
                <li>
                  <Link to="/discover" className="hover:text-white transition-colors">
                    BROWSE MATRIX
                  </Link>
                </li>
                <li>
                  <Link to="/search" className="hover:text-white transition-colors">
                    FULL SEARCH
                  </Link>
                </li>
                <li>
                  <Link to="/watchlist" className="hover:text-white transition-colors">
                    SAVED WATCHLIST
                  </Link>
                </li>
                <li>
                  <Link to="/style-guide" className="hover:text-white transition-colors">
                    DESIGN SYSTEM
                  </Link>
                </li>
              </ul>
            </div>

            {/* Telemetry Column */}
            <div className="space-y-3 col-span-2 sm:col-span-1">
              <span className="text-[10px] tracking-[0.25em] text-[#8E8E93] uppercase font-bold block">
                SOURCES
              </span>
              <ul className="space-y-2 text-[#8E8E93]">
                <li>
                  <span className="text-[#F2F0EC]/70">CineSrc Player</span>
                </li>
                <li>
                  <span className="text-[#F2F0EC]/70">TMDb Metadata</span>
                </li>
                <li>
                  <span className="text-[#F2F0EC]/70">Anime DB API</span>
                </li>
                <li>
                  <span className="text-[#F2F0EC]/70">YouTube Embed</span>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* Legal & Attribution Notice */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-[#8E8E93] font-mono">
          <p className="max-w-2xl font-light text-[11px]">
            This product uses the TMDb API and Anime DB but is not endorsed or certified by TMDb or RapidAPI. Playback routed via authorized CineSrc embed.
          </p>

          <p className="text-[10px] tracking-wider text-[#8E8E93]">
            © {new Date().getFullYear()} CINEMURA. ALL RIGHTS RESERVED.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
