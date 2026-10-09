import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock, Calendar } from 'lucide-react';
import { editorialArticles } from '../content/editorial';
import { Seo } from '../seo/Seo';

export const EditorialIndexPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = ['ALL', ...Array.from(new Set(editorialArticles.map(a => a.category)))];

  const featuredArticle = editorialArticles.find(a => a.featured) || editorialArticles[0];
  const gridArticles = editorialArticles.filter(a => a.slug !== featuredArticle.slug);

  const filteredGrid = selectedCategory === 'ALL'
    ? gridArticles
    : gridArticles.filter(a => a.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pt-28 pb-24 selection:bg-[#E43D3D] selection:text-white">
      <Seo
        title="Editorial & Film Essays"
        description="Deep dives into cinematography, directorial vision, narrative structure, and the living culture of world cinema."
      />

      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 space-y-12 sm:space-y-16">
        
        {/* Editorial Section Masthead */}
        <div className="border-b border-white/10 pb-8 space-y-4">
          <div className="flex items-center gap-2 text-xs font-condensed tracking-widest text-[#E43D3D] uppercase font-bold">
            <BookOpen className="w-4 h-4" />
            <span>CINEMURA DISCOURSE & CRITICISM</span>
          </div>
          <h1 className="type-display-xl text-white tracking-tight uppercase">
            EDITORIAL JOURNAL
          </h1>
          <p className="type-body text-base max-w-2xl text-[#8E8E93]">
            Original long-form essays, technical cinematography investigations, and narrative retrospectives written exclusively for cinephiles.
          </p>
        </div>

        {/* Lead Story: Magazine Banner Feature */}
        {featuredArticle && (
          <section className="relative group border border-white/10 bg-[#111114] overflow-hidden hover:border-[#E43D3D] transition-all duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[440px]">
              
              {/* Media Half */}
              <div className="lg:col-span-7 relative min-h-[280px] lg:min-h-full overflow-hidden bg-[#141418]">
                <img
                  src={featuredArticle.heroImage}
                  alt={featuredArticle.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter brightness-90 contrast-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#111114] via-transparent to-transparent opacity-80" />
                <div className="absolute top-4 left-4">
                  <span className="type-label bg-[#E43D3D] text-white px-3 py-1 font-bold">
                    LEAD ESSAY • {featuredArticle.category}
                  </span>
                </div>
              </div>

              {/* Editorial Text Half */}
              <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-xs font-mono text-[#8E8E93]">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {featuredArticle.publishedDate}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5 text-[#E43D3D]">
                      <Clock className="w-3.5 h-3.5" />
                      {featuredArticle.readTime}
                    </span>
                  </div>

                  <Link to={`/editorial/${featuredArticle.slug}`}>
                    <h2 className="type-h2 text-white group-hover:text-[#E43D3D] transition-colors leading-tight">
                      {featuredArticle.title}
                    </h2>
                  </Link>

                  <p className="type-body text-sm sm:text-base text-[#8E8E93] leading-relaxed line-clamp-3">
                    {featuredArticle.dek}
                  </p>
                </div>

                <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={featuredArticle.author.avatar}
                      alt={featuredArticle.author.name}
                      className="w-10 h-10 rounded-full object-cover border border-white/20"
                    />
                    <div>
                      <p className="text-xs font-bold text-white uppercase">{featuredArticle.author.name}</p>
                      <p className="text-[11px] text-[#8E8E93]">{featuredArticle.author.role}</p>
                    </div>
                  </div>

                  <Link
                    to={`/editorial/${featuredArticle.slug}`}
                    className="btn-primary text-xs flex items-center gap-2"
                  >
                    <span>READ ESSAY</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

              </div>

            </div>
          </section>
        )}

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`type-label px-4 py-2 border transition-all ${
                selectedCategory === cat
                  ? 'bg-[#E43D3D] text-white border-[#E43D3D]'
                  : 'bg-white/5 text-[#8E8E93] border-white/10 hover:text-white hover:border-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredGrid.map(article => (
            <article
              key={article.slug}
              className="group flex flex-col justify-between bg-[#111114] border border-white/10 hover:border-[#E43D3D] transition-all duration-300 overflow-hidden"
            >
              <div>
                <div className="relative aspect-[16/10] overflow-hidden bg-[#141418]">
                  <img
                    src={article.heroImage}
                    alt={article.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-90 contrast-105"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="type-label bg-[#0B0B0D]/80 backdrop-blur-sm border border-white/10 text-white px-2 py-0.5 text-[11px]">
                      {article.category}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#8E8E93]">
                    <span>{article.publishedDate}</span>
                    <span>•</span>
                    <span className="text-[#E43D3D]">{article.readTime}</span>
                  </div>

                  <Link to={`/editorial/${article.slug}`}>
                    <h3 className="type-h3 text-xl text-white group-hover:text-[#E43D3D] transition-colors leading-snug">
                      {article.title}
                    </h3>
                  </Link>

                  <p className="type-body text-xs sm:text-sm text-[#8E8E93] line-clamp-3">
                    {article.dek}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-white/10 mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 pt-4">
                  <img
                    src={article.author.avatar}
                    alt={article.author.name}
                    className="w-7 h-7 rounded-full object-cover border border-white/20"
                  />
                  <span className="text-xs text-[#8E8E93]">{article.author.name}</span>
                </div>

                <Link
                  to={`/editorial/${article.slug}`}
                  className="btn-link text-xs pt-4 flex items-center gap-1.5"
                >
                  <span>READ</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>

      </div>
    </div>
  );
};

export default EditorialIndexPage;
