import React from 'react';

interface AppLoaderProps {
  progress: number;
  isFadingOut?: boolean;
}

export const AppLoader: React.FC<AppLoaderProps> = ({ progress, isFadingOut = false }) => {
  const clampedProgress = Math.min(100, Math.max(0, Math.round(progress)));
  const formattedPercent = String(clampedProgress).padStart(3, '0');

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#0B0B0D] flex flex-col items-center justify-center select-none ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      } transition-opacity duration-200 ease-out`}
      role="progressbar"
      aria-valuenow={clampedProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Loading Cinemura"
    >
      <div className="w-full max-w-[340px] sm:max-w-[400px] px-6 sm:px-0 flex flex-col items-center gap-7">
        
        {/* 1. Brand Wordmark */}
        <div className="text-center">
          <span className="font-display font-bold text-lg sm:text-xl text-[#F2F0EC] tracking-[0.3em] uppercase">
            CINEMURA
          </span>
        </div>

        {/* 2. Typographic Percentage Badge */}
        <div className="inline-flex items-center gap-1 border border-white/15 px-3.5 py-1 bg-transparent">
          <span className="text-[11px] font-mono text-[#8E8E93] select-none">[</span>
          <span className="font-mono text-xl sm:text-2xl font-bold text-[#F2F0EC] tracking-wider tabular-nums">
            {formattedPercent}
          </span>
          <span className="font-mono text-xs font-bold text-[#E43D3D] select-none">%</span>
          <span className="text-[11px] font-mono text-[#8E8E93] select-none">]</span>
        </div>

        {/* 3. Thin Crimson Progress Bar */}
        <div className="w-full h-[2px] bg-white/10 relative overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-[#E43D3D] transition-[width] duration-75 ease-out motion-reduce:transition-none"
            style={{ width: `${clampedProgress}%` }}
          />
        </div>

      </div>
    </div>
  );
};

export default AppLoader;
