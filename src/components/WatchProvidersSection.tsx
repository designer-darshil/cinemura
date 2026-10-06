import React from 'react';
import { RegionWatchProviders } from '../types';
import { SectionHeader } from './SectionHeader';
import { ExternalLink } from 'lucide-react';

interface WatchProvidersSectionProps {
  watchProviders?: RegionWatchProviders;
  title?: string;
  regionLabel?: string;
}

export const WatchProvidersSection: React.FC<WatchProvidersSectionProps> = ({
  watchProviders,
  title = 'WHERE TO WATCH',
  regionLabel = 'UNITED STATES'
}) => {
  // If no providers or all lists are empty, gracefully omit the entire section
  if (
    !watchProviders ||
    ((!watchProviders.flatrate || watchProviders.flatrate.length === 0) &&
      (!watchProviders.rent || watchProviders.rent.length === 0) &&
      (!watchProviders.buy || watchProviders.buy.length === 0))
  ) {
    return null;
  }

  const { flatrate, rent, buy, link } = watchProviders;

  return (
    <section className="w-full mt-20 sm:mt-28 space-y-6">
      <SectionHeader
        label={`AVAILABILITY • ${regionLabel}`}
        title={title}
        rightElement={
          link ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-[#8E8E93] hover:text-[#E43D3D] transition-colors border border-white/10 px-3 py-1 bg-[#111114]"
            >
              <span>CHECK ALL OPTIONS</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : undefined
        }
      />

      {/* Provider Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stream / Subscription */}
        {flatrate && flatrate.length > 0 && (
          <div className="bg-[#111114] border border-white/10 p-5 space-y-3">
            <span className="text-[10px] font-mono tracking-[0.2em] text-[#E43D3D] uppercase font-bold block">
              SUBSCRIPTION / STREAM
            </span>
            <div className="flex flex-wrap gap-2.5">
              {flatrate.map((provider) => (
                <div
                  key={provider.providerId}
                  className="flex items-center gap-2.5 bg-black/50 border border-white/10 p-1.5 pr-3 hover:border-white/30 transition-colors"
                  title={provider.providerName}
                >
                  <img
                    src={provider.logo}
                    alt={provider.providerName}
                    className="w-7 h-7 object-cover rounded-none"
                    loading="lazy"
                  />
                  <span className="text-xs font-mono text-[#F2F0EC] truncate max-w-[120px]">
                    {provider.providerName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rent */}
        {rent && rent.length > 0 && (
          <div className="bg-[#111114] border border-white/10 p-5 space-y-3">
            <span className="text-[10px] font-mono tracking-[0.2em] text-[#8E8E93] uppercase font-bold block">
              RENT
            </span>
            <div className="flex flex-wrap gap-2.5">
              {rent.map((provider) => (
                <div
                  key={provider.providerId}
                  className="flex items-center gap-2.5 bg-black/50 border border-white/10 p-1.5 pr-3 hover:border-white/30 transition-colors"
                  title={provider.providerName}
                >
                  <img
                    src={provider.logo}
                    alt={provider.providerName}
                    className="w-7 h-7 object-cover rounded-none"
                    loading="lazy"
                  />
                  <span className="text-xs font-mono text-[#F2F0EC] truncate max-w-[120px]">
                    {provider.providerName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Buy */}
        {buy && buy.length > 0 && (
          <div className="bg-[#111114] border border-white/10 p-5 space-y-3">
            <span className="text-[10px] font-mono tracking-[0.2em] text-[#8E8E93] uppercase font-bold block">
              BUY
            </span>
            <div className="flex flex-wrap gap-2.5">
              {buy.map((provider) => (
                <div
                  key={provider.providerId}
                  className="flex items-center gap-2.5 bg-black/50 border border-white/10 p-1.5 pr-3 hover:border-white/30 transition-colors"
                  title={provider.providerName}
                >
                  <img
                    src={provider.logo}
                    alt={provider.providerName}
                    className="w-7 h-7 object-cover rounded-none"
                    loading="lazy"
                  />
                  <span className="text-xs font-mono text-[#F2F0EC] truncate max-w-[120px]">
                    {provider.providerName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mandatory JustWatch Attribution per TMDb API terms */}
      <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-[#8E8E93]/70">
        <span>Streaming data powered by JustWatch</span>
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#E43D3D] transition-colors underline"
          >
            View on JustWatch
          </a>
        )}
      </div>
    </section>
  );
};

export default WatchProvidersSection;
