import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Film } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] flex items-center justify-center p-6 pt-24 text-center">
      <div className="max-w-md space-y-6 bg-[#111114] border border-white/10 p-8 sm:p-12 animate-fadeIn relative">
        
        {/* Subtle top indicator */}
        <div className="flex items-center justify-center gap-2 text-[10px] font-mono tracking-[0.2em] uppercase text-[#626269]">
          <Film className="w-3.5 h-3.5 text-[#E43D3D]" />
          <span>ERROR CODE 404</span>
        </div>

        {/* Large 404 Typography */}
        <div className="space-y-1">
          <h1 className="font-editorial-heading text-7xl sm:text-8xl text-white tracking-wider leading-none">
            404
          </h1>
          <h2 className="type-h3 text-white uppercase tracking-widest text-base sm:text-lg">
            PAGE NOT FOUND
          </h2>
        </div>

        {/* Short Supporting Text */}
        <p className="type-small font-light text-[#929298] leading-relaxed max-w-xs mx-auto">
          The page you're looking for doesn't exist or may have moved.
        </p>

        {/* Divider line */}
        <div className="w-16 h-[1px] bg-[#E43D3D]/50 mx-auto" />

        {/* Action Controls */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="btn-primary w-full sm:w-auto h-10 px-6 text-xs uppercase"
          >
            <span>BACK TO HOME</span>
          </Link>

          <Link
            to="/movie"
            className="btn-link inline-flex items-center gap-2 text-white text-md fw-bold uppercase text-xs text-[#929298] hover:text-[#E43D3D] flex items-center gap-1.5"
          >
            <span>EXPLORE MOVIES</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
};
