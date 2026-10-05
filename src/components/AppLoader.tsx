import React from 'react';

interface AppLoaderProps {
  label?: string;
}

export const AppLoader: React.FC<AppLoaderProps> = ({ label = 'CINEMURA' }) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#0B0B0D] flex flex-col items-center justify-center p-6 text-center select-none animate-fadeIn">
      <div className="space-y-4 max-w-xs">
        {/* Wordmark with subtle pulse */}
        <div className="flex items-center justify-center gap-2">
          <span className="w-2 h-2 bg-[#E43D3D] rounded-none animate-ping" />
          <h1 className="font-editorial-heading text-2xl tracking-[0.25em] text-white uppercase">
            {label}
          </h1>
        </div>

        {/* Minimal Crimson Progress Line */}
        <div className="w-32 h-[1px] bg-white/10 mx-auto relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 bg-[#E43D3D] w-full animate-shimmer" />
        </div>

        <p className="type-label text-[10px] text-[#626269] tracking-[0.2em] uppercase">
          LOADING ENTERTAINMENT CATALOG
        </p>
      </div>
    </div>
  );
};
