export interface ArticleSection {
  heading?: string;
  paragraphs: string[];
  pullQuote?: string;
}

export interface EditorialArticle {
  slug: string;
  title: string;
  dek: string;
  category: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  publishedDate: string;
  readTime: string;
  heroImage: string;
  heroImageCaption: string;
  featured?: boolean;
  sections: ArticleSection[];
  relatedTmdbIds: { id: string | number; type: 'movie' | 'tv'; title: string }[];
  tags: string[];
}

export const editorialArticles: EditorialArticle[] = [
  {
    slug: 'the-architecture-of-shadow-modern-cinematography',
    title: 'THE ARCHITECTURE OF SHADOW: HOW MODERN DIRECTORS ARE REDEFINING LOW-LIGHT CINEMA',
    dek: 'From Dune to Oppenheimer, the shift toward naturalistic darkness and wide dynamic range is reshaping how audiences experience tension on the silver screen.',
    category: 'CINEMATOGRAPHY',
    author: {
      name: 'Julian Vance',
      role: 'Senior Film Essayist & Editor',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop'
    },
    publishedDate: 'October 4, 2024',
    readTime: '6 MIN READ',
    heroImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1600&auto=format&fit=crop',
    heroImageCaption: 'A cavernous auditorium lit only by the ambient glow of high-contrast projection.',
    featured: true,
    sections: [
      {
        heading: 'THE EXPANSION OF SENSOR LATITUDE',
        paragraphs: [
          'For over a century, cinematic darkness was an active illusion. Film stocks required enormous arrays of incandescent light merely to register shadow detail without crumbling into grain. The contemporary revolution, spurred by large-format digital sensors and master lenses, has inverted that paradigm.',
          'Today’s filmmakers do not merely paint with light; they sculpt with negative space. Shadows are no longer voids where information vanishes; they are living, breathing textures rich with subtle gradients and psychological dread.'
        ],
        pullQuote: 'Light reveals the subject, but shadow reveals the director’s true psychological intent.'
      },
      {
        heading: 'TACTILE WORLDBUILDING THROUGH MINIMALISM',
        paragraphs: [
          'Consider Denis Villeneuve’s desert epics or Christopher Nolan’s historical reconstructions. The refusal to artificially illuminate deep night sequences forces the viewer’s eye to adapt in real time, recreating the sensory disorientation of the characters themselves.',
          'This commitment to unvarnished atmosphere demands discipline across the entire production pipeline. Production designers must choose materials that respond deliberately to low foot-candle environments, while colorists must resist the urge to crush blacks into clinical uniformity.'
        ]
      },
      {
        heading: 'THE FUTURE OF THE BIG SCREEN EXPERIENCE',
        paragraphs: [
          'As consumer display technologies achieve perfect OLED blacks and wider color gamuts, this editorial philosophy becomes even more potent. The living room now demands the same fidelity that previously belonged exclusively to color-grading suites.',
          'Yet the true power of shadow remains human: it reminds the audience that in great storytelling, what is concealed from view is invariably what stays with us the longest.'
        ]
      }
    ],
    relatedTmdbIds: [
      { id: 438631, type: 'movie', title: 'Dune' },
      { id: 872585, type: 'movie', title: 'Oppenheimer' },
      { id: 335984, type: 'movie', title: 'Blade Runner 2049' }
    ],
    tags: ['Cinematography', 'Visual Craft', 'Denis Villeneuve', 'Christopher Nolan']
  },
  {
    slug: 'the-death-and-rebirth-of-the-mid-budget-thriller',
    title: 'THE RENAISSANCE OF THE 90-MINUTE THRILLER IN PRESTIGE STREAMING',
    dek: 'Why the lean, relentless suspense story is reclaiming its rightful throne from bloated multi-episode sagas.',
    category: 'ESSAY',
    author: {
      name: 'Elena Rostova',
      role: 'Culture & Narrative Critic',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop'
    },
    publishedDate: 'September 28, 2024',
    readTime: '5 MIN READ',
    heroImage: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=1600&auto=format&fit=crop',
    heroImageCaption: 'Neon reflections cutting across wet asphalt in an urban thriller setting.',
    featured: false,
    sections: [
      {
        heading: 'THE FATIGUE OF NARRATIVE INFLATION',
        paragraphs: [
          'For a decade, the promise of television was "more time for character development." In practice, however, many promising cinematic concepts were stretched across eight hour-long installments, diluting pacing and exhausting audience patience.',
          'The return of the tight, propulsive thriller marks a welcome corrective. When every single minute carries narrative consequence, suspense becomes structural rather than rhetorical.'
        ],
        pullQuote: 'A great thriller does not waste frames; it treats runtime as an irreplaceable countdown.'
      },
      {
        heading: 'CONFINEMENT AS A CREATIVE CATALYST',
        paragraphs: [
          'The best contemporary thrillers lean into spatial and temporal constraints: a single moving train, an interrogator’s glass booth, or an escalating phone call. Such boundaries liberate the screenwriter to focus entirely on human vulnerability and sharp conversational parries.',
          'Audiences crave the visceral satisfaction of a complete, airtight story told with unwavering conviction.'
        ]
      }
    ],
    relatedTmdbIds: [
      { id: 27576, type: 'movie', title: 'The Chaser' },
      { id: 546554, type: 'movie', title: 'Knives Out' }
    ],
    tags: ['Thriller', 'Screenwriting', 'Pacing', 'Cinema Trends']
  },
  {
    slug: 'scoring-the-cosmos-the-evolution-of-sci-fi-soundtracks',
    title: 'SCORING THE UNKNOWN: SYNTHESIS, ORCHESTRA, AND MODERN SCI-FI COMPOSITION',
    dek: 'How composers from Hans Zimmer to Ludwig Göransson are marrying acoustic tradition with analog synthesis to evoke the terror and wonder of the cosmos.',
    category: 'SOUNDTRACK',
    author: {
      name: 'Marcus K. Cole',
      role: 'Audio Critic & Historian',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop'
    },
    publishedDate: 'September 15, 2024',
    readTime: '7 MIN READ',
    heroImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1600&auto=format&fit=crop',
    heroImageCaption: 'Analog modular synthesizers emitting hypnotic spectral tones in a recording studio.',
    featured: false,
    sections: [
      {
        heading: 'BEYOND THE WAGNERIAN MOTIF',
        paragraphs: [
          'When John Williams penned the scores for Star Wars in 1977, he looked backward to late-Romantic European symphonic grandeur to ground fantastical galaxies in recognizable emotional weight.',
          'Modern science fiction, however, confronts an entirely different existential horizon. Themes of computational dread, ecological collapse, and temporal collapse require sonic vocabularies that feel alien yet intimate.'
        ],
        pullQuote: 'A score does not just support the scene; it creates the gravity that holds the fictional universe together.'
      },
      {
        heading: 'THE TACTILE RESONANCE OF ANALOG SILENCE',
        paragraphs: [
          'In Interstellar, the church organ became a breathing machine of human longing against indifferent cosmic physics. In Arrival, Jóhann Jóhannsson treated human vocalizations as primal acoustic pulses.',
          'These scores remind us that music in cinema is at its most transcendent when it abandons traditional melody to explore pure resonance, timbre, and devastating silence.'
        ]
      }
    ],
    relatedTmdbIds: [
      { id: 157336, type: 'movie', title: 'Interstellar' },
      { id: 329865, type: 'movie', title: 'Arrival' }
    ],
    tags: ['Film Score', 'Sci-Fi', 'Sound Design', 'Hans Zimmer']
  }
];
