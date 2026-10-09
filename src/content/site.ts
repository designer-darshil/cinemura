export interface SiteConfig {
  name: string;
  tagline: string;
  description: string;
  url: string;
  locale: string;
  defaultRegion: string;
  navLinks: { name: string; path: string; ordinal: string }[];
  socialLinks: { name: string; url: string }[];
  legalNotice: string;
  tmdbAttribution: string;
  tmdbUrl: string;
  justWatchAttribution: string;
  justWatchUrl: string;
}

export const siteConfig: SiteConfig = {
  name: 'CINEMURA',
  tagline: 'Discover movies. Explore series. Find your next obsession.',
  description: 'A premium cinematic entertainment discovery platform cultivated for cinephiles. Discover movies, explore series, and explore the craft of moving pictures.',
  url: 'https://cinemura.io',
  locale: 'en-US',
  defaultRegion: 'US',
  navLinks: [
    { name: 'HOME', path: '/', ordinal: '01' },
    { name: 'MOVIES', path: '/movies', ordinal: '02' },
    { name: 'SERIES', path: '/series', ordinal: '03' },
    { name: 'PEOPLE', path: '/people', ordinal: '04' },
    { name: 'EDITORIAL', path: '/editorial', ordinal: '05' },
    { name: 'ABOUT', path: '/about', ordinal: '06' },
  ],
  socialLinks: [
    { name: 'X / Twitter', url: 'https://twitter.com' },
    { name: 'Letterboxd', url: 'https://letterboxd.com' },
    { name: 'GitHub', url: 'https://github.com' },
  ],
  legalNotice: '© ' + new Date().getFullYear() + ' CINEMURA. ALL RIGHTS RESERVED. FOR PERSONAL CINEPHILE EXPLORATION ONLY.',
  tmdbAttribution: 'This product uses the TMDB API but is not endorsed or certified by TMDB.',
  tmdbUrl: 'https://www.themoviedb.org',
  justWatchAttribution: 'Watch availability data provided by JustWatch. Availability and pricing are subject to change.',
  justWatchUrl: 'https://www.justwatch.com',
};
