import { Movie, Series, Person, Genre } from '../types';

export const MOCK_MOVIES: Movie[] = [
  {
    id: 'm1',
    type: 'movie',
    title: 'DUNE: PART TWO',
    slug: 'dune-part-two',
    tagline: 'Long live the fighters.',
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1920&auto=format&fit=crop',
    releaseDate: '2024-03-01',
    year: 2024,
    runtime: '2h 46m',
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    rating: 8.8,
    voteCount: 4820,
    certification: 'PG-13',
    status: 'Released',
    synopsis: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.',
    language: 'English',
    director: 'Denis Villeneuve',
    writers: ['Denis Villeneuve', 'Jon Spaihts'],
    trailerUrl: 'https://www.youtube.com/embed/Way9Dexny3w',
    featured: true,
    trendingRank: 1,
    cast: [
      { id: 'c1', name: 'Timothée Chalamet', role: 'Actor', character: 'Paul Atreides', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=500&auto=format&fit=crop', slug: 'timothee-chalamet' },
      { id: 'c2', name: 'Zendaya', role: 'Actor', character: 'Chani', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=500&auto=format&fit=crop', slug: 'zendaya' },
      { id: 'c3', name: 'Rebecca Ferguson', role: 'Actor', character: 'Lady Jessica', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=500&auto=format&fit=crop', slug: 'rebecca-ferguson' },
      { id: 'c4', name: 'Javier Bardem', role: 'Actor', character: 'Stilgar', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=500&auto=format&fit=crop', slug: 'javier-bardem' }
    ]
  },
  {
    id: 'm2',
    type: 'movie',
    title: 'OPPENHEIMER',
    slug: 'oppenheimer',
    tagline: 'The world forever changes.',
    poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=1000&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1920&auto=format&fit=crop',
    releaseDate: '2023-07-21',
    year: 2023,
    runtime: '3h 00m',
    genres: ['Biography', 'Drama', 'History'],
    rating: 8.9,
    voteCount: 9150,
    certification: 'R',
    status: 'Released',
    synopsis: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, followed by his harrowing political persecution in the Cold War era.',
    language: 'English',
    director: 'Christopher Nolan',
    writers: ['Christopher Nolan'],
    trailerUrl: 'https://www.youtube.com/embed/uYPbbksJxIg',
    featured: true,
    trendingRank: 2,
    cast: [
      { id: 'c6', name: 'Cillian Murphy', role: 'Actor', character: 'J. Robert Oppenheimer', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=500&auto=format&fit=crop', slug: 'cillian-murphy' },
      { id: 'c7', name: 'Emily Blunt', role: 'Actor', character: 'Katherine "Kitty" Oppenheimer', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=500&auto=format&fit=crop', slug: 'emily-blunt' },
      { id: 'c8', name: 'Robert Downey Jr.', role: 'Actor', character: 'Lewis Strauss', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=500&auto=format&fit=crop', slug: 'robert-downey-jr' }
    ]
  },
  {
    id: 'm3',
    type: 'movie',
    title: 'BLADE RUNNER 2049',
    slug: 'blade-runner-2049',
    tagline: 'There is still a page left to be written.',
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=1920&auto=format&fit=crop',
    releaseDate: '2017-10-06',
    year: 2017,
    runtime: '2h 44m',
    genres: ['Sci-Fi', 'Mystery', 'Drama'],
    rating: 8.4,
    voteCount: 12400,
    certification: 'R',
    status: 'Released',
    synopsis: 'Young Blade Runner K’s discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard, who’s been missing for thirty years.',
    language: 'English',
    director: 'Denis Villeneuve',
    writers: ['Hampton Fancher', 'Michael Green'],
    trailerUrl: 'https://www.youtube.com/embed/gCcx85zbxz4',
    featured: true,
    trendingRank: 3,
    cast: [
      { id: 'c10', name: 'Ryan Gosling', role: 'Actor', character: 'Officer K', image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=500&auto=format&fit=crop', slug: 'ryan-gosling' },
      { id: 'c11', name: 'Harrison Ford', role: 'Actor', character: 'Rick Deckard', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=500&auto=format&fit=crop', slug: 'harrison-ford' }
    ]
  }
];

export const MOCK_SERIES: Series[] = [
  {
    id: 's1',
    type: 'tv',
    title: 'SUCCESSION',
    slug: 'succession',
    tagline: 'Make your move.',
    poster: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1920&auto=format&fit=crop',
    firstAirDate: '2018-06-03',
    year: 2018,
    seasonsCount: 4,
    totalEpisodes: 39,
    genres: ['Drama'],
    rating: 8.9,
    voteCount: 3840,
    certification: 'TV-MA',
    status: 'Ended',
    network: 'HBO',
    synopsis: 'The Roy family is known for controlling the biggest media and entertainment company in the world. However, their world changes when their father steps down from the company.',
    language: 'English',
    creators: ['Jesse Armstrong'],
    trailerUrl: 'https://www.youtube.com/embed/OzYxJV_rmE8',
    featured: true,
    trendingRank: 1,
    cast: [
      { id: 'sc1', name: 'Jeremy Strong', role: 'Actor', character: 'Kendall Roy', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=500&auto=format&fit=crop', slug: 'jeremy-strong' },
      { id: 'sc2', name: 'Brian Cox', role: 'Actor', character: 'Logan Roy', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=500&auto=format&fit=crop', slug: 'brian-cox' },
      { id: 'sc3', name: 'Sarah Snook', role: 'Actor', character: 'Shiv Roy', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=500&auto=format&fit=crop', slug: 'sarah-snook' }
    ],
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1',
        year: 2018,
        episodeCount: 10,
        episodes: [
          {
            id: 'ep101',
            seasonNumber: 1,
            episodeNumber: 1,
            title: 'Celebration',
            runtime: '56m',
            airDate: '2018-06-03',
            stillImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop',
            synopsis: 'On his 80th birthday, media titan Logan Roy shocks his family by announcing he is remaining CEO of Waystar RoyCo.',
            rating: 8.4,
            voteCount: 420
          }
        ]
      }
    ]
  },
  {
    id: 's2',
    type: 'tv',
    title: 'SEVERANCE',
    slug: 'severance',
    tagline: 'Please enjoy all ideas equally.',
    poster: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1000&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1920&auto=format&fit=crop',
    firstAirDate: '2022-02-18',
    year: 2022,
    seasonsCount: 2,
    totalEpisodes: 19,
    genres: ['Sci-Fi', 'Mystery', 'Drama'],
    rating: 8.7,
    voteCount: 2150,
    certification: 'TV-MA',
    status: 'Returning Series',
    network: 'Apple TV+',
    synopsis: 'Mark leads a team of office workers whose memories have been surgically divided between their work and personal lives. When a mysterious colleague appears outside of work, it begins a journey to discover the truth about their jobs.',
    language: 'English',
    creators: ['Dan Erickson'],
    trailerUrl: 'https://www.youtube.com/embed/xEQP4VVuyrY',
    featured: true,
    trendingRank: 2,
    cast: [
      { id: 'sc5', name: 'Adam Scott', role: 'Actor', character: 'Mark Scout', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=500&auto=format&fit=crop', slug: 'adam-scott' }
    ],
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1',
        year: 2022,
        episodeCount: 9,
        episodes: [
          {
            id: 'ep201',
            seasonNumber: 1,
            episodeNumber: 1,
            title: 'Good News About Hell',
            runtime: '57m',
            airDate: '2022-02-18',
            stillImage: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=800&auto=format&fit=crop',
            synopsis: 'Mark Scout leads a team at Lumon Industries, whose employees have undergone a severance procedure.',
            rating: 8.5,
            voteCount: 310
          }
        ]
      }
    ]
  }
];

export const MOCK_GENRES: Genre[] = [
  { id: '28', name: 'Action', count: 2400, image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop', description: 'Adrenaline-fueled sequences and kinetic choreography.' },
  { id: '18', name: 'Drama', count: 3200, image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop', description: 'Character-driven stories featuring intense emotional conflicts.' },
  { id: '878', name: 'Sci-Fi', count: 1420, image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop', description: 'Futuristic visionaries, space exploration, and high technology.' },
  { id: '53', name: 'Thriller', count: 1850, image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=600&auto=format&fit=crop', description: 'High-stakes suspense and psychological tension.' },
  { id: '36', name: 'History', count: 750, image: 'https://images.unsplash.com/photo-1528164344705-47542687990d?q=80&w=600&auto=format&fit=crop', description: 'Historical re-enactments and period sagas.' }
];

export const MOCK_PEOPLE: Person[] = [
  {
    id: 'p1',
    name: 'Denis Villeneuve',
    slug: 'denis-villeneuve',
    role: 'Director',
    portrait: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop',
    biography: 'Denis Villeneuve is a French-Canadian filmmaker renowned for his visionary sci-fi epics and atmospheric tension. His works include Arrival, Blade Runner 2049, and the Dune saga.',
    birthDate: '1967-10-03',
    birthPlace: 'Gentilly, Québec, Canada',
    knownFor: ['Dune: Part Two', 'Blade Runner 2049', 'Arrival'],
    filmography: [
      { id: 'm1', title: 'Dune: Part Two', type: 'movie', role: 'Director', year: 2024, poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=300&auto=format&fit=crop' },
      { id: 'm3', title: 'Blade Runner 2049', type: 'movie', role: 'Director', year: 2017, poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=300&auto=format&fit=crop' }
    ]
  },
  {
    id: 'p2',
    name: 'Christopher Nolan',
    slug: 'christopher-nolan',
    role: 'Director',
    portrait: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
    biography: 'Christopher Nolan is a British-American filmmaker celebrated for nonlinear storytelling, practical effects, and cerebral blockbusters.',
    birthDate: '1970-07-30',
    birthPlace: 'London, England, UK',
    knownFor: ['Oppenheimer', 'Interstellar', 'Inception'],
    filmography: [
      { id: 'm2', title: 'Oppenheimer', type: 'movie', role: 'Director', year: 2023, poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=300&auto=format&fit=crop' }
    ]
  }
];

export const MOCK_STATS = [
  { value: 'TMDB v3', label: 'CANONICAL DATA API' },
  { value: '100%', label: 'ORIGINAL CREATOR METADATA' },
  { value: '4K / HD', label: 'OFFICIAL MEDIA PREVIEWS' },
  { value: 'GLOBAL', label: 'CERTIFICATIONS & RATINGS' }
];

export const MOCK_FEATURES = [
  {
    title: 'CANONICAL MOVIE METADATA',
    description: 'Direct TMDB movie dossiers including title, poster, backdrop, overview, runtime, genres, vote count, certification, director, writers, cast, and trailers.'
  },
  {
    title: 'TELEVISION & EPISODE INTEL',
    description: 'Seasons breakdown, episode synopses, air dates, creator credits, ratings, vote count, and content ratings.'
  },
  {
    title: 'PERSON & FILMOGRAPHY',
    description: 'Actor and director dossiers with biography, known-for highlights, and complete film and TV credits.'
  }
];
