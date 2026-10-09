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
    <div className="flex items-baseline justify-between gap-4 mb-3 sm:mb-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          {number && (
            <span className="text-[11px] font-mono text-[#8E8E93]">
              {number}
            </span>
          )}
          {label && (
            <span className="text-[11px] font-mono tracking-widest text-[#8E8E93] uppercase">
              {label}
            </span>
          )}
        </div>

        <h2 className="text-base sm:text-lg lg:text-xl font-bold tracking-tight text-[#F2F0EC] uppercase">
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
              className="text-xs font-mono tracking-wider text-[#8E8E93] hover:text-[#F2F0EC] transition-colors inline-flex items-center gap-1.5 uppercase"
            >
              <span>{viewAllText}</span>
              <ArrowRight className="w-3 h-3 text-[#E43D3D]" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
};
