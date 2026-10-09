import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Film, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Seo } from '../seo/Seo';

export const NotFoundPage: React.FC = () => {
  const { openSearch } = useApp();

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] flex items-center justify-center p-6 pt-28 pb-20 text-center selection:bg-[#E43D3D] selection:text-white">
      <Seo
        title="Lost Between Frames (404)"
        description="The frame you are looking for has vanished from the reel."
      />

      <div className="max-w-lg space-y-8 bg-[#111114] border border-white/10 p-8 sm:p-14 animate-fadeIn relative">
        
        {/* Editorial Sub-label */}
        <div className="flex items-center justify-center gap-2 text-xs font-mono tracking-widest uppercase text-[#E43D3D]">
          <Film className="w-4 h-4 text-[#E43D3D]" />
          <span>FRAME NOT FOUND • 404</span>
        </div>

        {/* Large 404 Heading */}
        <div className="space-y-2">
          <h1 className="font-display font-black text-8xl sm:text-9xl text-white tracking-tight leading-none">
            404
          </h1>
          <h2 className="type-h2 text-2xl text-white uppercase tracking-tight">
            LOST BETWEEN FRAMES
          </h2>
        </div>

        {/* Supporting Copy */}
        <p className="type-body text-sm font-light text-[#8E8E93] leading-relaxed max-w-sm mx-auto">
          The projection has cut off. The sequence or title you are searching for does not exist or has shifted in the catalog.
        </p>

        <div className="w-20 h-[2px] bg-[#E43D3D] mx-auto" />

        {/* Action Controls: Search & Home */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={openSearch}
            className="btn-primary w-full sm:w-auto text-xs py-3.5 px-6 uppercase flex items-center justify-center gap-2 font-bold"
          >
            <Search className="w-3.5 h-3.5" />
            <span>SEARCH CATALOG</span>
          </button>

          <Link
            to="/"
            className="btn-secondary w-full sm:w-auto text-xs py-3.5 px-6 uppercase flex items-center justify-center gap-2"
          >
            <span>RETURN HOME</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default NotFoundPage;
