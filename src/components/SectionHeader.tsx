import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface SectionHeaderProps {
  number?: string;
  label?: string;
  title: string;
  description?: string;
  viewAllLink?: string;
  viewAllText?: string;
  rightElement?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  number,
  label,
  title,
  description,
  viewAllLink,
  viewAllText = 'VIEW ALL',
  rightElement,
}) => {
  return (
    <div className="flex items-end justify-between gap-4 mb-4 sm:mb-6 border-b border-white/10 pb-3">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <span className="w-4 h-[2px] bg-[#E43D3D] inline-block" />
          {number && (
            <span className="text-[10px] font-mono text-[#8E8E93]">
              {number}
            </span>
          )}
          {label && (
            <span className="text-[10px] font-mono tracking-[0.25em] text-[#8E8E93] uppercase font-medium">
              {label}
            </span>
          )}
        </div>

        <h2 className="text-xl sm:text-2xl font-display font-bold tracking-tight text-[#F2F0EC] uppercase">
          {title}
        </h2>

        {description && (
          <p className="text-xs text-[#8E8E93] font-light max-w-xl">
            {description}
          </p>
        )}
      </div>

      {(viewAllLink || rightElement) && (
        <div className="flex items-center gap-3 flex-shrink-0">
          {rightElement}
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="text-xs font-mono tracking-wider text-[#8E8E93] hover:text-[#E43D3D] transition-colors inline-flex items-center gap-1.5 uppercase group"
            >
              <span>{viewAllText}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#E43D3D] transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
};
