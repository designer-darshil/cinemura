import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, Share2, Check, Quote } from 'lucide-react';
import { editorialArticles } from '../content/editorial';
import { getMovieDetail, getTvDetail } from '../services/tmdb';
import { MediaItem } from '../types';
import { MediaCard } from '../components/MediaCard';
import { Seo } from '../seo/Seo';

export const EditorialArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [copied, setCopied] = useState(false);
  const [relatedMedia, setRelatedMedia] = useState<MediaItem[]>([]);

  const article = editorialArticles.find(a => a.slug === slug);
  const otherArticles = editorialArticles.filter(a => a.slug !== slug).slice(0, 2);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Fetch real TMDB items for associated IDs
  useEffect(() => {
    if (!article || !article.relatedTmdbIds || article.relatedTmdbIds.length === 0) {
      setRelatedMedia([]);
      return;
    }

    let isMounted = true;

    Promise.all(
      article.relatedTmdbIds.map(item => {
        if (item.type === 'movie') {
          return getMovieDetail(String(item.id));
        } else {
          return getTvDetail(String(item.id));
        }
      })
    )
      .then(results => {
        if (!isMounted) return;
        const valid = results.filter((r): r is MediaItem => Boolean(r));
        setRelatedMedia(valid);
      })
      .catch(err => {
        console.warn('Failed to load related titles for article', err);
      });

    return () => {
      isMounted = false;
    };
  }, [article]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (!article) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pt-32 pb-20 px-4 text-center space-y-6">
        <h1 className="type-h1 text-white uppercase">ARTICLE NOT FOUND</h1>
        <p className="type-body text-[#8E8E93]">The requested editorial piece could not be located in our archives.</p>
        <Link to="/editorial" className="btn-primary text-xs inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span>RETURN TO EDITORIAL JOURNAL</span>
        </Link>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pt-28 pb-24 selection:bg-[#E43D3D] selection:text-white">
      <Seo
        title={article.title}
        description={article.dek}
        image={article.heroImage}
        type="article"
      />

      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 max-w-5xl mx-auto space-y-10">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <Link
            to="/editorial"
            className="btn-link text-xs inline-flex items-center gap-2 text-[#8E8E93] hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO JOURNAL</span>
          </Link>

          <button
            onClick={handleShare}
            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-2 text-[#8E8E93] hover:text-white"
            aria-label="Share article"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#E43D3D]" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'LINK COPIED' : 'SHARE ESSAY'}</span>
          </button>
        </div>

        {/* Article Header */}
        <header className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="type-label bg-[#E43D3D] text-white px-2.5 py-0.5">
              {article.category}
            </span>
            <div className="flex items-center gap-3 text-xs font-mono text-[#8E8E93]">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {article.publishedDate}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-[#E43D3D]">
                <Clock className="w-3.5 h-3.5" />
                {article.readTime}
              </span>
            </div>
          </div>

          <h1 className="type-display-l text-white tracking-tight uppercase leading-[0.98]">
            {article.title}
          </h1>

          <p className="text-lg sm:text-xl font-light text-[#8E8E93] leading-relaxed border-l-2 border-[#E43D3D] pl-4 italic">
            {article.dek}
          </p>

          {/* Author Block */}
          <div className="pt-4 flex items-center gap-4">
            <img
              src={article.author.avatar}
              alt={article.author.name}
              className="w-12 h-12 rounded-full object-cover border border-white/20"
            />
            <div>
              <p className="text-sm font-bold text-white uppercase tracking-wider">{article.author.name}</p>
              <p className="text-xs text-[#8E8E93]">{article.author.role}</p>
            </div>
          </div>
        </header>

        {/* Hero Imagery */}
        <figure className="space-y-2 border border-white/10 bg-[#111114] p-1 overflow-hidden">
          <img
            src={article.heroImage}
            alt={article.title}
            className="w-full aspect-[21/10] object-cover filter brightness-90 contrast-105"
          />
          {article.heroImageCaption && (
            <figcaption className="text-xs font-mono text-[#8E8E93] p-2">
              {article.heroImageCaption}
            </figcaption>
          )}
        </figure>

        {/* Article Body Sections */}
        <div className="space-y-12 max-w-3xl mx-auto py-6">
          {article.sections.map((section, idx) => (
            <section key={idx} className="space-y-6">
              {section.heading && (
                <h2 className="type-h2 text-2xl sm:text-3xl text-white tracking-tight pt-4 border-t border-white/10">
                  {section.heading}
                </h2>
              )}

              {section.paragraphs.map((p, pIdx) => (
                <p key={pIdx} className="type-body-l text-base sm:text-lg text-[#F2F0EC]/90 leading-relaxed font-light">
                  {p}
                </p>
              ))}

              {section.pullQuote && (
                <blockquote className="my-8 p-6 sm:p-8 bg-[#111114] border-l-4 border-[#E43D3D] space-y-3">
                  <Quote className="w-6 h-6 text-[#E43D3D] opacity-60" />
                  <p className="type-h3 text-xl sm:text-2xl text-white italic leading-snug">
                    "{section.pullQuote}"
                  </p>
                </blockquote>
              )}
            </section>
          ))}

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="pt-8 border-t border-white/10 flex flex-wrap items-center gap-2">
              <span className="type-label text-xs text-[#8E8E93] mr-2">TOPICS:</span>
              {article.tags.map(tag => (
                <span
                  key={tag}
                  className="type-label text-[11px] bg-white/5 border border-white/10 text-[#8E8E93] px-3 py-1"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Real TMDB Related Titles */}
        {relatedMedia.length > 0 && (
          <section className="pt-12 border-t border-white/10 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="type-label text-[#E43D3D] block">CANONICAL DISCOVERY</span>
                <h3 className="type-h2 text-2xl text-white uppercase">FEATURED TITLES REFERENCED IN THIS ESSAY</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4 sm:gap-6">
              {relatedMedia.map(item => (
                <MediaCard key={item.id} item={item} variant="poster" />
              ))}
            </div>
          </section>
        )}

        {/* Further Reading */}
        {otherArticles.length > 0 && (
          <section className="pt-12 border-t border-white/10 space-y-6">
            <h3 className="type-h2 text-2xl text-white uppercase">FURTHER EDITORIAL READING</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {otherArticles.map(other => (
                <Link
                  key={other.slug}
                  to={`/editorial/${other.slug}`}
                  className="group bg-[#111114] border border-white/10 p-6 space-y-3 hover:border-[#E43D3D] transition-all block"
                >
                  <span className="type-label text-[10px] text-[#E43D3D]">{other.category}</span>
                  <h4 className="type-h3 text-xl text-white group-hover:text-[#E43D3D] transition-colors leading-tight">
                    {other.title}
                  </h4>
                  <p className="type-body text-xs text-[#8E8E93] line-clamp-2">{other.dek}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>
    </article>
  );
};

export default EditorialArticlePage;
