import React, { useEffect, useState } from 'react';

export interface DetailNavSection {
  id: string;
  label: string;
  count?: number;
}

interface DetailMediaNavProps {
  sections: DetailNavSection[];
}

export const DetailMediaNav: React.FC<DetailMediaNavProps> = ({ sections }) => {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id || '');

  useEffect(() => {
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
      }
    );

    sections.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  const scrollTo = (id: string) => {
    setActiveId(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (sections.length === 0) return null;

  return (
    <nav
      aria-label="Detail page media sections"
      className="sticky top-14 z-30 bg-[#0B0B0D]/95 backdrop-blur-md border-y border-white/10 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-2"
    >
      <div className="w-full flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
        {sections.map((sec) => {
          const isActive = activeId === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => scrollTo(sec.id)}
              className={`px-3 sm:px-4 py-2 text-xs font-mono tracking-widest uppercase transition-all whitespace-nowrap flex items-center gap-1.5 border-b-2 ${
                isActive
                  ? 'border-[#E43D3D] text-[#E43D3D] font-bold bg-[#E43D3D]/5'
                  : 'border-transparent text-[#8E8E93] hover:text-[#F2F0EC] hover:border-white/20'
              }`}
            >
              <span>{sec.label}</span>
              {typeof sec.count === 'number' && (
                <span className={`text-[10px] px-1 py-0.2 ${isActive ? 'bg-[#E43D3D]/20 text-[#E43D3D]' : 'bg-white/5 text-[#8E8E93]'}`}>
                  {sec.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
