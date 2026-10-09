import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Film, Shield, ArrowRight, ExternalLink } from 'lucide-react';
import { platformValues, catalogMetrics, platformFeatures } from '../content/about';
import { siteConfig } from '../content/site';
import { Seo } from '../seo/Seo';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pt-28 pb-24 selection:bg-[#E43D3D] selection:text-white space-y-20 lg:space-y-28">
      <Seo
        title="About Cinemura"
        description="Cinemura is a distraction-free cinematic discovery platform built for cinephiles and film enthusiasts."
      />

      {/* Hero Masthead */}
      <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 space-y-6">
        <div className="border-b border-white/10 pb-8 space-y-4">
          <span className="type-label text-[#E43D3D] block font-bold">
            CINEMATIC ARCHITECTURE & VALUES
          </span>
          <h1 className="type-display-xl text-white tracking-tight uppercase leading-[0.92]">
            CULTIVATING THE ART <br />
            <span className="text-[#E43D3D]">OF CINEMATIC DISCOVERY</span>
          </h1>
          <p className="type-body-l text-lg text-[#8E8E93] max-w-3xl font-light leading-relaxed">
            {siteConfig.description}
          </p>
        </div>

        {/* Cinematic Wide Image */}
        <div className="aspect-[21/9] w-full bg-[#141418] border border-white/10 overflow-hidden relative">
          <img
            src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1600&auto=format&fit=crop"
            alt="Cinema auditorium illuminated by project light"
            className="w-full h-full object-cover filter brightness-75 contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D] via-transparent to-transparent" />
        </div>
      </section>

      {/* Catalog Metrics (Barlow Condensed Editorial Scale) */}
      <section className="bg-[#111114] border-y border-white/10 py-16">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {catalogMetrics.map((metric, idx) => (
              <div key={idx} className="space-y-2 border-l-2 border-[#E43D3D] pl-4 sm:pl-6">
                <span className="font-display font-extrabold text-5xl sm:text-7xl text-white tracking-tight block leading-none">
                  {metric.value}
                </span>
                <span className="type-label text-xs sm:text-sm text-[#E43D3D] block font-bold">
                  {metric.label}
                </span>
                <p className="text-xs text-[#8E8E93] font-light leading-relaxed">
                  {metric.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 space-y-10">
        <div>
          <span className="type-label text-[#E43D3D] block">FOUNDATIONAL ETHOS</span>
          <h2 className="type-h2 text-3xl sm:text-4xl text-white uppercase">WHY CINEMURA EXISTS</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {platformValues.map((val, idx) => (
            <div key={idx} className="bg-[#111114] border border-white/10 p-8 space-y-4 hover:border-[#E43D3D] transition-colors">
              <div className="w-12 h-12 bg-[#E43D3D]/10 text-[#E43D3D] border border-[#E43D3D]/20 flex items-center justify-center font-bold">
                {idx === 0 && <Eye className="w-6 h-6" />}
                {idx === 1 && <Film className="w-6 h-6" />}
                {idx === 2 && <Shield className="w-6 h-6" />}
              </div>
              <h3 className="type-h3 text-xl text-white uppercase">{val.title}</h3>
              <p className="type-body text-sm text-[#8E8E93] leading-relaxed font-light">
                {val.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Platform Capabilities */}
      <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 space-y-8">
        <div className="border-b border-white/10 pb-4">
          <span className="type-label text-[#E43D3D] block">PLATFORM ARCHITECTURE</span>
          <h2 className="type-h2 text-3xl sm:text-4xl text-white uppercase">ENGINEERED FOR FILM ENTHUSIASTS</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {platformFeatures.map((feat, idx) => (
            <div key={idx} className="bg-[#111114] border border-white/10 p-6 space-y-3">
              <span className="type-label text-[10px] text-[#E43D3D] bg-white/5 border border-white/10 px-2 py-0.5">
                {feat.tag}
              </span>
              <h4 className="type-h3 text-lg text-white uppercase">{feat.title}</h4>
              <p className="text-xs text-[#8E8E93] leading-relaxed font-light">
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* TMDB & JustWatch Legal and Provenance Notice */}
      <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="bg-[#111114] border border-white/10 p-8 sm:p-12 space-y-6">
          <div className="flex items-center gap-2">
            <span className="type-label text-[#E43D3D] block font-bold">DATA PROVENANCE & LEGAL COMPLIANCE</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
            <div className="space-y-3">
              <h4 className="type-h3 text-lg text-white uppercase flex items-center gap-2">
                <span>THE MOVIE DATABASE (TMDB)</span>
                <a
                  href={siteConfig.tmdbUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#E43D3D] hover:underline inline-flex items-center"
                >
                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </a>
              </h4>
              <p className="text-xs text-[#8E8E93] leading-relaxed font-light">
                {siteConfig.tmdbAttribution}
              </p>
              <p className="text-xs text-[#8E8E93] leading-relaxed font-light">
                All film and television catalog data, metadata, high-resolution backdrops, promotional posters, cast rosters, and crew information are provided by TMDB. Cinemura does not claim ownership of third-party intellectual property or copyright.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="type-h3 text-lg text-white uppercase flex items-center gap-2">
                <span>JUSTWATCH INTEGRATION</span>
                <a
                  href={siteConfig.justWatchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#E43D3D] hover:underline inline-flex items-center"
                >
                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </a>
              </h4>
              <p className="text-xs text-[#8E8E93] leading-relaxed font-light">
                {siteConfig.justWatchAttribution}
              </p>
              <p className="text-xs text-[#8E8E93] leading-relaxed font-light">
                Streaming, rental, and purchase availability badges are provided through JustWatch data APIs. Streaming service rights change periodically and should be verified directly with the corresponding streaming service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 text-center space-y-6">
        <h2 className="type-h2 text-3xl sm:text-5xl text-white uppercase">
          FIND YOUR NEXT OBSESSION
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/movies"
            className="btn-primary text-xs flex items-center gap-2"
          >
            <span>EXPLORE MOVIES</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/series"
            className="btn-secondary text-xs flex items-center gap-2"
          >
            <span>EXPLORE SERIES</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

    </div>
  );
};

export default AboutPage;
