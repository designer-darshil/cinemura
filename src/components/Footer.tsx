import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { siteConfig } from '../content/site';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0B0B0D] border-t border-white/10 text-[#F2F0EC] pt-16 pb-12 selection:bg-[#E43D3D] selection:text-white">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 space-y-12">
        
        {/* Top Split: Brand + Navigation Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-white/10">
          
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-4">
            <Link to="/" className="flex items-center gap-2 group inline-block">
              <span className="font-display font-black text-3xl text-[#F2F0EC] group-hover:text-[#E43D3D] transition-colors leading-none tracking-widest uppercase">
                {siteConfig.name}
              </span>
              <span className="w-2 h-2 bg-[#E43D3D] rounded-full inline-block" />
            </Link>

            <p className="type-body text-sm text-[#8E8E93] max-w-sm font-light leading-relaxed">
              {siteConfig.tagline}
            </p>

            <div className="pt-2 flex items-center gap-4 text-xs font-mono text-[#8E8E93]">
              {siteConfig.socialLinks.map((s, idx) => (
                <a
                  key={idx}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#E43D3D] transition-colors flex items-center gap-1"
                >
                  <span>{s.name}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Matrix */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6">
            
            {/* Catalog Links */}
            <div className="space-y-3">
              <span className="type-label text-xs text-[#E43D3D] block font-bold">
                EXPLORE
              </span>
              <ul className="space-y-2 text-xs font-mono">
                <li>
                  <Link to="/movies" className="text-[#8E8E93] hover:text-white transition-colors">
                    FEATURE FILMS
                  </Link>
                </li>
                <li>
                  <Link to="/series" className="text-[#8E8E93] hover:text-white transition-colors">
                    TELEVISION SERIES
                  </Link>
                </li>
                <li>
                  <Link to="/discover" className="text-[#8E8E93] hover:text-white transition-colors">
                    GENRE DISCOVERY
                  </Link>
                </li>
                <li>
                  <Link to="/people" className="text-[#8E8E93] hover:text-white transition-colors">
                    CAST & DIRECTORS
                  </Link>
                </li>
              </ul>
            </div>

            {/* Editorial & Community */}
            <div className="space-y-3">
              <span className="type-label text-xs text-[#E43D3D] block font-bold">
                EDITORIAL
              </span>
              <ul className="space-y-2 text-xs font-mono">
                <li>
                  <Link to="/editorial" className="text-[#8E8E93] hover:text-white transition-colors">
                    JOURNAL ESSAYS
                  </Link>
                </li>
                <li>
                  <Link to="/watchlist" className="text-[#8E8E93] hover:text-white transition-colors">
                    MY WATCHLIST
                  </Link>
                </li>
              </ul>
            </div>

            {/* Platform & Organization */}
            <div className="space-y-3">
              <span className="type-label text-xs text-[#E43D3D] block font-bold">
                PLATFORM
              </span>
              <ul className="space-y-2 text-xs font-mono">
                <li>
                  <Link to="/about" className="text-[#8E8E93] hover:text-white transition-colors">
                    ABOUT CINEMURA
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-[#8E8E93] hover:text-white transition-colors">
                    CONTACT EDITORIAL
                  </Link>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* Legal & Third-Party Attributions */}
        <div className="space-y-4 pt-2">
          
          {/* TMDB & JustWatch Attribution Notices */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono text-[#8E8E93] leading-relaxed">
            <div className="flex items-start gap-2">
              <span className="text-[#E43D3D] font-bold">TMDB:</span>
              <p>
                {siteConfig.tmdbAttribution}{' '}
                <a
                  href={siteConfig.tmdbUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:underline underline-offset-2"
                >
                  Visit The Movie Database →
                </a>
              </p>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-[#E43D3D] font-bold">JUSTWATCH:</span>
              <p>
                {siteConfig.justWatchAttribution}{' '}
                <a
                  href={siteConfig.justWatchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:underline underline-offset-2"
                >
                  Visit JustWatch →
                </a>
              </p>
            </div>
          </div>

          {/* Copyright & Disclaimer */}
          <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-[#626269]">
            <p>
              {siteConfig.legalNotice}
            </p>
            <p className="text-right">
              STREAMING AVAILABILITY & PRICES SUBJECT TO PROVIDER CONFIRMATION.
            </p>
          </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;
