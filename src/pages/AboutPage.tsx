import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Shield, Eye, ArrowRight } from 'lucide-react';
import { MOCK_STATS } from '../data/mockData';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pt-28 pb-20 space-y-20">
      
      <section className="mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <span className="text-[10px] tracking-mega text-[#E43D3D] uppercase font-bold block">
          ABOUT CINEMURA PLATFORM
        </span>
        <h1 className="font-display-hero text-6xl sm:text-8xl text-white uppercase tracking-wider leading-none">
          CULTIVATING THE ART <br />
          <span className="text-[#E43D3D]">OF CINEMATIC DISCOVERY</span>
        </h1>
        <p className="text-base text-[#8E8E93] max-w-2xl font-light leading-relaxed">
          CINEMURA is a clean, distraction-free movie and TV-series information platform built for cinephiles, powered by canonical TMDB data.
        </p>

        <div className="aspect-[21/9] w-full bg-[#121215] border border-white/15 overflow-hidden relative">
          <img
            src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1600&auto=format&fit=crop"
            alt="Cinema theater hall"
            className="w-full h-full object-cover filter brightness-75 contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D] via-transparent to-transparent" />
        </div>
      </section>

      <section className="mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-[#121215] border border-white/12 p-8 space-y-4">
          <div className="w-10 h-10 bg-[#E43D3D]/10 text-[#E43D3D] flex items-center justify-center font-bold">
            <Eye className="w-5 h-5" />
          </div>
          <h3 className="font-editorial-heading text-2xl text-white uppercase">OUR VISION</h3>
          <p className="text-xs text-[#8E8E93] leading-relaxed font-light">
            To provide a pristine, distraction-free home where movie and TV information is presented with editorial clarity and modern visual beauty.
          </p>
        </div>

        <div className="bg-[#121215] border border-white/12 p-8 space-y-4">
          <div className="w-10 h-10 bg-[#E43D3D]/10 text-[#E43D3D] flex items-center justify-center font-bold">
            <Film className="w-5 h-5" />
          </div>
          <h3 className="font-editorial-heading text-2xl text-white uppercase">OUR MISSION</h3>
          <p className="text-xs text-[#8E8E93] leading-relaxed font-light">
            Empower audiences with canonical TMDB release information, ratings, vote counts, content certifications, and official trailers.
          </p>
        </div>

        <div className="bg-[#121215] border border-white/12 p-8 space-y-4">
          <div className="w-10 h-10 bg-[#E43D3D]/10 text-[#E43D3D] flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-editorial-heading text-2xl text-white uppercase">OUR DATA INTEGRITY</h3>
          <p className="text-xs text-[#8E8E93] leading-relaxed font-light">
            Single canonical data source powered by The Movie Database (TMDB). Zero fabricated ratings or false streaming promises.
          </p>
        </div>
      </section>

      <section className="bg-[#121215] border-y border-white/12 py-16">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {MOCK_STATS.map((stat, idx) => (
            <div key={idx} className="space-y-1">
              <span className="font-editorial-heading text-5xl text-[#E43D3D] block">{stat.value}</span>
              <span className="text-[10px] text-[#8E8E93] uppercase font-bold tracking-widest">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 text-center space-y-6">
        <h2 className="font-editorial-heading text-4xl text-white uppercase">READY TO DISCOVER YOUR NEXT OBSESSION?</h2>
        <Link
          to="/discover"
          className="inline-flex items-center gap-2 bg-[#E43D3D] hover:bg-[#F04545] text-white font-bold text-xs uppercase px-8 py-4 tracking-widest"
        >
          <span>EXPLORE CATALOG NOW</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

    </div>
  );
};
