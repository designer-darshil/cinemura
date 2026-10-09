export interface CategoryTile {
  id: string;
  tmdbMovieGenreId: number;
  tmdbTvGenreId?: number;
  name: string;
  tagline: string;
  description: string;
  imageUrl: string;
  accent: string;
}

export const editorialCategories: CategoryTile[] = [
  {
    id: 'action',
    tmdbMovieGenreId: 28,
    tmdbTvGenreId: 10759,
    name: 'ACTION',
    tagline: 'KINETIC ENERGY & HIGH STAKES',
    description: 'Choreographed spectacle, visceral tension, and grand heroic conflict.',
    imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000&auto=format&fit=crop',
    accent: '#E43D3D'
  },
  {
    id: 'drama',
    tmdbMovieGenreId: 18,
    tmdbTvGenreId: 18,
    name: 'DRAMA',
    tagline: 'THE HUMAN CONDITION REVEALED',
    description: 'Intimate character studies, profound moral dilemmas, and emotional gravity.',
    imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1000&auto=format&fit=crop',
    accent: '#D97706'
  },
  {
    id: 'comedy',
    tmdbMovieGenreId: 35,
    tmdbTvGenreId: 35,
    name: 'COMEDY',
    tagline: 'WIT, SATIRE & LEVITY',
    description: 'Sharp social commentary, delightful timing, and cathartic laughter.',
    imageUrl: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?q=80&w=1000&auto=format&fit=crop',
    accent: '#10B981'
  },
  {
    id: 'thriller',
    tmdbMovieGenreId: 53,
    tmdbTvGenreId: 9648,
    name: 'THRILLER',
    tagline: 'PSYCHOLOGICAL SUSPENSE',
    description: 'Palpable dread, mind-bending puzzles, and breath-holding climaxes.',
    imageUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=1000&auto=format&fit=crop',
    accent: '#8B5CF6'
  },
  {
    id: 'documentary',
    tmdbMovieGenreId: 99,
    tmdbTvGenreId: 99,
    name: 'DOCUMENTARY',
    tagline: 'UNVARNISHED REALITY',
    description: 'Investigative non-fiction, extraordinary true accounts, and ecological wonders.',
    imageUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1000&auto=format&fit=crop',
    accent: '#3B82F6'
  },
  {
    id: 'animation',
    tmdbMovieGenreId: 16,
    tmdbTvGenreId: 16,
    name: 'ANIMATION',
    tagline: 'LIMITLESS VISUAL IMAGINATION',
    description: 'Hand-drawn wonders, groundbreaking CGI, and boundless fantasy worlds.',
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000&auto=format&fit=crop',
    accent: '#EC4899'
  }
];
