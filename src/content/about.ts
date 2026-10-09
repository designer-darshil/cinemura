export interface PlatformValue {
  icon: string;
  title: string;
  description: string;
}

export interface PlatformStep {
  step: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
}

export interface CatalogMetric {
  value: string;
  label: string;
  description: string;
}

export const platformValues: PlatformValue[] = [
  {
    icon: 'Eye',
    title: 'EDITORIAL PURITY',
    description: 'We believe discovery should be deliberate, not algorithmically commodified. Every layout celebrates cinematography, typography, and storytelling over noisy clickbait.'
  },
  {
    icon: 'Film',
    title: 'CANONICAL DATA INTEGRITY',
    description: 'Direct live integration with The Movie Database (TMDB). We never fabricate ratings, distort user reviews, or invent artificial metadata.'
  },
  {
    icon: 'Shield',
    title: 'PRIVACY BY DESIGN',
    description: 'Zero user tracking, zero mandatory account signups, zero ad networks. Your watchlist lives securely in your local browser storage.'
  }
];

export const platformSteps: PlatformStep[] = [
  {
    step: '01',
    title: 'DISCOVER',
    subtitle: 'UNEARTH CINEMATIC GEMS',
    description: 'Browse curated trending selections, box-office leaders, critically acclaimed masters, and genre landscapes with zero friction.',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop'
  },
  {
    step: '02',
    title: 'EXPLORE',
    subtitle: 'DEEP DIVE INTO FILM CRAFT',
    description: 'Inspect full cast ensembles, directors, screenwriters, technical credits, 4K production stills, and high-fidelity official trailers.',
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1200&auto=format&fit=crop'
  },
  {
    step: '03',
    title: 'COMPARE',
    subtitle: 'REAL-TIME STREAMING AVAILABILITY',
    description: 'Know instantly where to stream, rent, or buy any title globally via licensed JustWatch availability data.',
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1200&auto=format&fit=crop'
  },
  {
    step: '04',
    title: 'SAVE',
    subtitle: 'CURATE YOUR PERSONAL VAULT',
    description: 'Bookmark films and television series into a persistent local watchlist that stays ready whenever inspiration strikes.',
    image: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1200&auto=format&fit=crop'
  }
];

export const catalogMetrics: CatalogMetric[] = [
  {
    value: '850K+',
    label: 'INDEXED TITLES',
    description: 'Global film and television catalog powered by TMDB'
  },
  {
    value: '2.4M+',
    label: 'CREATORS & CAST',
    description: 'Verified actors, directors, writers, and crew records'
  },
  {
    value: '19',
    label: 'CANONICAL GENRES',
    description: 'Structured thematic taxonomy across both mediums'
  },
  {
    value: '180+',
    label: 'STREAMING PROVIDERS',
    description: 'Real-time global distribution tracked via JustWatch'
  }
];

export const platformFeatures = [
  {
    title: 'CURATED DISCOVERY',
    description: 'Real-time trending charts, genre deep-dives, and festival highlights mapped dynamically through live TMDB APIs.',
    tag: 'INTELLIGENCE'
  },
  {
    title: 'HIGH-DEFINITION MEDIA',
    description: 'Official theatrical trailers, behind-the-scenes teasers, and high-resolution backdrop galleries with responsive delivery.',
    tag: 'PRODUCTION'
  },
  {
    title: 'COMPLETE FILMOGRAPHIES',
    description: 'Exhaustive cast and crew cross-referencing so you can trace any director or performer across their entire career.',
    tag: 'ARCHIVE'
  },
  {
    title: 'JUSTWATCH STREAMING',
    description: 'Accurate subscription, digital rental, and purchase availability across regions, keeping your watch decisions effortless.',
    tag: 'DISTRIBUTION'
  },
  {
    title: 'PERSISTENT WATCHLIST',
    description: 'Client-side encrypted local storage for saved cinema titles, preserved reliably without cookies or mandatory logins.',
    tag: 'UTILITY'
  }
];
