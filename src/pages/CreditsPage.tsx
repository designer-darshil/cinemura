import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';

export const CreditsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pt-28 pb-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 w-full space-y-10">
      
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs font-mono text-[#8E8E93] hover:text-[#E43D3D] uppercase transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>RETURN TO HOMEPAGE</span>
      </Link>

      <div className="border-b border-white/12 pb-8 space-y-3">
        <span className="text-[10px] tracking-mega text-[#E43D3D] uppercase font-bold">
          ATTRIBUTION & DATA SOURCES
        </span>
        <h1 className="font-display-hero text-6xl sm:text-7xl text-white uppercase tracking-wider">
          CREDITS & LEGAL NOTICES
        </h1>
        <p className="text-sm text-[#8E8E93] font-light">
          Official attribution for third-party movie metadata, TV information, and image providers.
        </p>
      </div>

      {/* TMDB Main Section */}
      <div className="bg-[#121215] border border-white/15 p-8 space-y-6">
        <div className="flex items-center gap-4 border-b border-white/10 pb-4">
          <svg className="w-24 h-6 fill-[#90cea1]" viewBox="0 0 185.04 133.4" xmlns="http://www.w3.org/2000/svg">
            <path d="M123.6 30.5c-7.3 0-14.1 2.3-19.7 6.2V.4H81.1v132.6h22.8V79.4c5.6 3.9 12.4 6.2 19.7 6.2 18.5 0 33.5-12.3 33.5-27.5s-15-27.6-33.5-27.6zm0 41.5c-9.2 0-16.7-6.2-16.7-13.9s7.5-13.9 16.7-13.9 16.7 6.2 16.7 13.9-7.5 13.9-16.7 13.9z"/>
          </svg>
          <span className="text-xs font-bold text-[#90cea1] uppercase tracking-wider">THE MOVIE DATABASE (TMDB)</span>
        </div>

        <p className="text-sm text-[#F2F0EC]/90 leading-relaxed font-light">
          This product uses the TMDB API but is not endorsed or certified by TMDB. Movie and TV-series metadata, synopsis text, cast rosters, release dates, posters, and backdrop artwork are provided by The Movie Database.
        </p>

        <div className="pt-2 flex items-center justify-between border-t border-white/10 text-xs">
          <span className="text-[#8E8E93] font-mono text-[11px]">VISIT OFFICIAL TMDB PORTAL</span>
          <a
            href="https://www.themoviedb.org"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[#90cea1] hover:underline font-bold uppercase tracking-wider"
          >
            <span>THEMOVIEDB.ORG</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Editorial Disclaimer */}
      <div className="bg-[#121215] border border-white/12 p-8 space-y-4">
        <h3 className="font-editorial-heading text-xl text-white uppercase">CINEMURA EDITORIAL STATEMENT</h3>
        <p className="text-xs text-[#8E8E93] leading-relaxed font-light">
          CINEMURA is an independent cinematic discovery platform. All trademarks, movie titles, posters, and video trailers belong to their respective copyright holders and studio distributors.
        </p>
      </div>

    </div>
  );
};
