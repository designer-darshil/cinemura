import React from 'react';
import { EntityAwardsData } from '../types';
import { SectionHeader } from './SectionHeader';

interface AwardsSectionProps {
  awards: EntityAwardsData | null;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  title?: string;
  label?: string;
}

export const AwardsSectionSkeleton: React.FC = () => {
  return (
    <section className="mt-20 sm:mt-28 w-full space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-3 w-28 bg-white/10" />
        <div className="h-7 w-48 bg-white/10" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-[#111114] border border-white/10 p-6 space-y-4">
            <div className="h-5 w-40 bg-white/10" />
            <div className="space-y-3 pt-2">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-12 bg-white/5 border border-white/5" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export const AwardsSection: React.FC<AwardsSectionProps> = ({
  awards,
  loading = false,
  error = false,
  onRetry,
  title = 'AWARDS',
  label = 'ACCOLADES & RECOGNITION'
}) => {
  if (loading) {
    return <AwardsSectionSkeleton />;
  }

  // Error State with local retry if provided
  if (error) {
    if (!onRetry) return null;
    return (
      <section className="mt-20 sm:mt-28 w-full p-6 border border-white/10 bg-[#111114] flex items-center justify-between">
        <div className="text-xs font-mono text-[#8E8E93]">UNABLE TO LOAD AWARDS RECORD</div>
        <button
          onClick={onRetry}
          className="text-xs font-mono font-bold text-[#E43D3D] hover:underline uppercase"
        >
          RETRY
        </button>
      </section>
    );
  }

  // Gracefully omit Awards section entirely if no real data exists
  if (!awards || (!awards.wins && !awards.nominations && (!awards.organizations || awards.organizations.length === 0))) {
    return null;
  }

  const hasStats = awards.wins > 0 || awards.nominations > 0;

  return (
    <section className="mt-20 sm:mt-28 w-full space-y-8">
      <SectionHeader
        label={label}
        title={title}
        rightElement={
          hasStats ? (
            <div className="flex items-center gap-3 text-xs font-mono">
              {awards.wins > 0 && (
                <span className="bg-[#E43D3D]/20 text-[#E43D3D] border border-[#E43D3D]/40 px-2.5 py-1 font-bold">
                  {awards.wins} {awards.wins === 1 ? 'WIN' : 'WINS'}
                </span>
              )}
              {awards.nominations > 0 && (
                <span className="bg-white/5 text-[#8E8E93] border border-white/10 px-2.5 py-1 font-bold">
                  {awards.nominations} {awards.nominations === 1 ? 'NOMINATION' : 'NOMINATIONS'}
                </span>
              )}
            </div>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {awards.organizations.map((org) => (
          <div
            key={org.id || org.name}
            className="bg-[#111114] border border-white/10 p-6 flex flex-col justify-between space-y-6"
          >
            {/* Organization Header */}
            <div className="border-b border-white/10 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#F2F0EC]">
                {org.name}
              </h3>
              <span className="text-[11px] font-mono text-[#8E8E93]">
                {org.awards.length} {org.awards.length === 1 ? 'ENTRY' : 'ENTRIES'}
              </span>
            </div>

            {/* Awards List */}
            <div className="space-y-4 divide-y divide-white/5">
              {org.awards.map((award) => {
                const isWinner = award.status === 'Winner';
                return (
                  <div key={award.id || `${award.category}-${award.year}`} className="pt-3 first:pt-0 space-y-1.5">
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-xs font-semibold text-[#F2F0EC] leading-snug">
                        {award.category}
                      </span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 border ${
                            isWinner
                              ? 'bg-[#E43D3D]/20 text-[#E43D3D] border-[#E43D3D]/40'
                              : 'bg-white/5 text-[#8E8E93] border-white/10'
                          }`}
                        >
                          {award.status}
                        </span>
                        <span className="text-xs font-mono text-[#8E8E93]">{award.year}</span>
                      </div>
                    </div>

                    {/* Recipients or Related Work */}
                    {award.recipients && award.recipients.length > 0 && (
                      <div className="text-[11px] font-mono text-[#8E8E93]">
                        {award.recipients.join(', ')}
                      </div>
                    )}
                    {award.relatedTitle && (
                      <div className="text-[11px] font-mono text-[#8E8E93]">
                        <span className="text-white/40">FOR: </span>
                        <span className="text-[#F2F0EC]">{award.relatedTitle}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
