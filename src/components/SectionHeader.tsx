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
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6 mb-8">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          {number && (
            <span className="type-label text-[#E43D3D] font-mono font-extrabold">
              {number}
            </span>
          )}
          {label && (
            <span className="type-label text-[#929298]">
              {label}
            </span>
          )}
        </div>

        <h2 className="type-h1 text-[#F2F0EC]">
          {title}
        </h2>

        {description && (
          <p className="type-body text-[#929298] font-light">
            {description}
          </p>
        )}
      </div>

      {(viewAllLink || rightElement) && (
        <div className="flex items-center gap-4">
          {rightElement}
          {viewAllLink && (
            <Link to={viewAllLink} className="btn-link inline-flex items-center gap-2 text-white text-md fw-bold uppercase">
              <span>{viewAllText}</span>
              <ArrowRight className="w-4 h-4 text-[#E43D3D]" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
};
