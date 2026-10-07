import React, { useState } from 'react';
import { Key, ExternalLink, Check } from 'lucide-react';
import { getAnimeApiKey, setAnimeApiKey } from '../services/animeDb';

interface AnimeApiKeyNoticeProps {
  errorType?: 'MISSING_KEY' | 'AUTH_FAILED' | 'RATE_LIMITED';
  onKeySaved?: () => void;
}

export const AnimeApiKeyNotice: React.FC<AnimeApiKeyNoticeProps> = ({
  errorType = 'MISSING_KEY',
  onKeySaved
}) => {
  const [inputKey, setInputKey] = useState(getAnimeApiKey());
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputKey.trim()) {
      setAnimeApiKey(inputKey.trim());
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        if (onKeySaved) onKeySaved();
      }, 500);
    }
  };

  return (
    <div className="bg-[#111114] border border-white/10 p-6 sm:p-8 max-w-2xl mx-auto space-y-5 my-8">
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <div className="w-10 h-10 bg-[#E43D3D]/10 border border-[#E43D3D]/30 flex items-center justify-center text-[#E43D3D] shrink-0">
          <Key className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#E43D3D] uppercase font-bold block">
            RAPIDAPI PROVIDER CONFIGURATION
          </span>
          <h3 className="font-display font-bold text-lg text-[#F2F0EC] uppercase">
            {errorType === 'AUTH_FAILED'
              ? 'RAPIDAPI AUTHENTICATION FAILED'
              : errorType === 'RATE_LIMITED'
              ? 'RAPIDAPI RATE LIMIT REACHED'
              : 'ANIME DB RAPIDAPI KEY REQUIRED'}
          </h3>
        </div>
      </div>

      <p className="text-xs sm:text-sm font-sans text-[#8E8E93] leading-relaxed">
        The Anime section queries the official{' '}
        <strong className="text-[#F2F0EC]">Anime DB API by Brian Rofiq</strong> on RapidAPI.
        To access live rankings, titles, genres, and details, configure your RapidAPI key below or in your{' '}
        <code className="text-[#E43D3D] bg-black/60 px-1 py-0.5 font-mono text-xs">.env</code> file.
      </p>

      {/* Form to set API key in session */}
      <form onSubmit={handleSave} className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="password"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            placeholder="Paste your RapidAPI Key here..."
            className="flex-grow bg-black/80 border border-white/20 focus:border-[#E43D3D] text-[#F2F0EC] px-3.5 py-2.5 text-xs font-mono outline-none min-h-[44px]"
          />
          <button
            type="submit"
            className="btn-primary min-h-[44px] px-6 text-xs uppercase shrink-0"
          >
            {saved ? <Check className="w-4 h-4" /> : <Key className="w-4 h-4" />}
            <span>{saved ? 'SAVED!' : 'APPLY KEY'}</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-[#8E8E93] pt-1">
          <span>Environment Variable: <code className="text-[#F2F0EC]">RAPIDAPI_KEY=...</code></span>
          <a
            href="https://rapidapi.com/brian.rofiq/api/anime-db"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#E43D3D] hover:underline inline-flex items-center gap-1"
          >
            <span>GET KEY ON RAPIDAPI</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </form>
    </div>
  );
};
