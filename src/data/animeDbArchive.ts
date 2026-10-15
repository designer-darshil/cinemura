export interface CanonicalAnimeRecord {
  _id: string;
  id: number | string;
  title: string;
  alternativeTitles: string[];
  ranking: number;
  genres: string[];
  episodes: number;
  image: string;
  thumb: string;
  type: string;
  status: string;
  synopsis: string;
  link: string;
  hianimeSlugs?: string[];
}

export const ANIME_DB_CANONICAL_ARCHIVE: Record<string, CanonicalAnimeRecord> = {
  // 1. Cowboy Bebop
  '1': {
    _id: '1',
    id: 1,
    title: 'Cowboy Bebop',
    alternativeTitles: ['Cowboy Bebop', 'カウボーイビバップ'],
    ranking: 28,
    genres: ['Action', 'Sci-Fi'],
    episodes: 26,
    image: 'https://cdn.myanimelist.net/images/anime/4/19644.jpg',
    thumb: 'https://cdn.myanimelist.net/images/anime/4/19644t.jpg',
    type: 'TV',
    status: 'Finished Airing',
    synopsis: 'Crime is timeless. By the year 2071, humanity has colonized several of the planets and moons of the solar system leaving the now uninhabitable Earth behind. The Inter Solar System Police (ISSP) attempts to keep peace in the galaxy, aided in part by outlaw bounty hunters, referred to as "Cowboys." The ragtag team aboard the spaceship Bebop are two such individuals.',
    link: 'https://myanimelist.net/anime/1/Cowboy_Bebop',
    hianimeSlugs: ['cowboy-bebop-1', '1'],
  },

  // 2. One Piece
  '21': {
    _id: '21',
    id: 21,
    title: 'One Piece',
    alternativeTitles: ['One Piece', 'ワンピース', 'OP'],
    ranking: 55,
    genres: ['Action', 'Adventure', 'Fantasy'],
    episodes: 1180,
    image: 'https://cdn.myanimelist.net/images/anime/6/73245.jpg',
    thumb: 'https://cdn.myanimelist.net/images/anime/6/73245t.jpg',
    type: 'TV',
    status: 'Currently Airing',
    synopsis: 'Gold Roger was known as the "Pirate King," the strongest and most infamous being to have sailed the Grand Line. The capture and execution of Roger by the World Government brought a change throughout the world. His last words before his death revealed the existence of the greatest treasure in the world, One Piece. Enter Monkey D. Luffy, a boy whose body gained the properties of rubber after unintentionally eating a Devil Fruit.',
    link: 'https://myanimelist.net/anime/21/One_Piece',
    hianimeSlugs: ['one-piece-12', '12', '21'],
  },

  // 3. Naruto
  '20': {
    _id: '20',
    id: 20,
    title: 'Naruto',
    alternativeTitles: ['Naruto', 'ナルト'],
    ranking: 150,
    genres: ['Action', 'Adventure', 'Fantasy'],
    episodes: 220,
    image: 'https://cdn.myanimelist.net/images/anime/13/17405.jpg',
    thumb: 'https://cdn.myanimelist.net/images/anime/13/17405t.jpg',
    type: 'TV',
    status: 'Finished Airing',
    synopsis: 'Moments prior to Naruto Uzumaki\'s birth, a huge demon known as the Kyuubi, the Nine-Tailed Fox, attacked Konohagakure, the Hidden Leaf Village, and wreaked havoc. In order to put an end to the Kyuubi\'s rampage, the leader of the village, the Fourth Hokage, sacrificed his life and sealed the monstrous beast inside the newborn Naruto.',
    link: 'https://myanimelist.net/anime/20/Naruto',
    hianimeSlugs: ['naruto-11', '11', '20'],
  },

  // 4. Attack on Titan
  '16498': {
    _id: '16498',
    id: 16498,
    title: 'Attack on Titan',
    alternativeTitles: ['Shingeki no Kyojin', '進撃の巨人'],
    ranking: 109,
    genres: ['Action', 'Suspense', 'Drama'],
    episodes: 25,
    image: 'https://cdn.myanimelist.net/images/anime/10/47347.jpg',
    thumb: 'https://cdn.myanimelist.net/images/anime/10/47347t.jpg',
    type: 'TV',
    status: 'Finished Airing',
    synopsis: 'Centuries ago, mankind was slaughtered to near extinction by monstrous humanoid creatures called Titans, forcing humans to hide in fear behind enormous concentric walls. What makes these giants truly terrifying is that their taste for human flesh is not born out of hunger but what appears to be out of pleasure.',
    link: 'https://myanimelist.net/anime/16498/Shingeki_no_Kyojin',
    hianimeSlugs: ['attack-on-titan-6436', '6436', '16498'],
  },

  // 5. Demon Slayer: Kimetsu no Yaiba
  '38000': {
    _id: '38000',
    id: 38000,
    title: 'Demon Slayer: Kimetsu no Yaiba',
    alternativeTitles: ['Kimetsu no Yaiba', '鬼滅の刃'],
    ranking: 118,
    genres: ['Action', 'Fantasy', 'Supernatural'],
    episodes: 26,
    image: 'https://cdn.myanimelist.net/images/anime/1286/99889.jpg',
    thumb: 'https://cdn.myanimelist.net/images/anime/1286/99889t.jpg',
    type: 'TV',
    status: 'Finished Airing',
    synopsis: 'Ever since the death of his father, the burden of supporting the family has fallen upon Tanjirou Kamado\'s shoulders. Though living impoverished on a remote mountain, the Kamado family are able to enjoy a relatively peaceful and happy life. One day, Tanjirou decides to go down to the local village to make a little money selling charcoal.',
    link: 'https://myanimelist.net/anime/38000/Kimetsu_no_Yaiba',
    hianimeSlugs: ['demon-slayer-kimetsu-no-yaiba-9411', '9411', '38000'],
  },

  // 6. Jujutsu Kaisen
  '40748': {
    _id: '40748',
    id: 40748,
    title: 'Jujutsu Kaisen',
    alternativeTitles: ['Sorcery Fight', '呪術廻戦'],
    ranking: 35,
    genres: ['Action', 'Supernatural', 'Fantasy'],
    episodes: 24,
    image: 'https://cdn.myanimelist.net/images/anime/1171/109222.jpg',
    thumb: 'https://cdn.myanimelist.net/images/anime/1171/109222t.jpg',
    type: 'TV',
    status: 'Finished Airing',
    synopsis: 'Idly indulging in baseless paranormal activities with the Occult Club, high schooler Yuuji Itadori spends his days at either the clubroom or the hospital, where he visits his bedridden grandfather. However, this leisurely lifestyle soon takes a turn for the strange when he unknowingly encounters a cursed item.',
    link: 'https://myanimelist.net/anime/40748/Jujutsu_Kaisen',
    hianimeSlugs: ['jujutsu-kaisen-11777', 'jujutsu-kaisen-2nd-season-18413', '11777', '18413', '40748'],
  },

  // 7. Death Note
  '1535': {
    _id: '1535',
    id: 1535,
    title: 'Death Note',
    alternativeTitles: ['Death Note', 'デスノート'],
    ranking: 77,
    genres: ['Supernatural', 'Suspense', 'Mystery'],
    episodes: 37,
    image: 'https://cdn.myanimelist.net/images/anime/9/9453.jpg',
    thumb: 'https://cdn.myanimelist.net/images/anime/9/9453t.jpg',
    type: 'TV',
    status: 'Finished Airing',
    synopsis: 'Brutal murders, petty thefts, and senseless violence pollute the human world. In contrast, the realm of death gods is a humdrum, unchanging gambling den. The ingenious 17-year-old Japanese student Light Yagami and cynical god of death Ryuk share one belief: that their worlds are rotten.',
    link: 'https://myanimelist.net/anime/1535/Death_Note',
    hianimeSlugs: ['death-note-1325', '1325', '1535'],
  },

  // 8. My Hero Academia
  '31964': {
    _id: '31964',
    id: 31964,
    title: 'My Hero Academia',
    alternativeTitles: ['Boku no Hero Academia', '僕のヒーローアカデミア'],
    ranking: 130,
    genres: ['Action', 'Sci-Fi'],
    episodes: 13,
    image: 'https://cdn.myanimelist.net/images/anime/10/78745.jpg',
    thumb: 'https://cdn.myanimelist.net/images/anime/10/78745t.jpg',
    type: 'TV',
    status: 'Finished Airing',
    synopsis: 'The appearance of "quirks," newly discovered super powers, has been steadily increasing over the years, with 80 percent of humanity possessing various abilities from manipulation of elements to shapeshifting. This leaves the remainder of the world completely powerless, and Izuku Midoriya is one such individual.',
    link: 'https://myanimelist.net/anime/31964/Boku_no_Hero_Academia',
    hianimeSlugs: ['my-hero-academia-8077', '8077', '31964'],
  },

  // 9. Bleach: Thousand-Year Blood War
  '41467': {
    _id: '41467',
    id: 41467,
    title: 'Bleach: Thousand-Year Blood War',
    alternativeTitles: ['Bleach: Sennen Kessen-hen', 'BLEACH 千年血戦篇'],
    ranking: 2,
    genres: ['Action', 'Adventure', 'Supernatural'],
    episodes: 13,
    image: 'https://cdn.myanimelist.net/images/anime/1764/126627.jpg',
    thumb: 'https://cdn.myanimelist.net/images/anime/1764/126627t.jpg',
    type: 'TV',
    status: 'Finished Airing',
    synopsis: 'Substitute Soul Reaper Ichigo Kurosaki spends his days fighting against Hollows, dangerous evil spirits that threaten Karakura Town. Ichigo carries on his quest with his closest allies: Orihime Inoue, his childhood friend with healing powers; Yasutora Sado, his high school classmate with superhuman strength; and Uryuu Ishida, a Quincy rival.',
    link: 'https://myanimelist.net/anime/41467/Bleach__Sennen_Kessen-hen',
    hianimeSlugs: ['bleach-thousand-year-blood-war-12280', 'bleach-thousand-year-blood-war-the-conflict-19320', '12280', '19320', '41467'],
  },

  // 10. Frieren: Beyond Journey's End
  '52991': {
    _id: '52991',
    id: 52991,
    title: "Frieren: Beyond Journey's End",
    alternativeTitles: ['Sousou no Frieren', '葬送のフリーレン'],
    ranking: 1,
    genres: ['Adventure', 'Drama', 'Fantasy'],
    episodes: 28,
    image: 'https://cdn.myanimelist.net/images/anime/1015/138075.jpg',
    thumb: 'https://cdn.myanimelist.net/images/anime/1015/138075t.jpg',
    type: 'TV',
    status: 'Finished Airing',
    synopsis: 'The demon king has been defeated, and the victorious hero party returns home before disbanding. The four—mage Frieren, hero Himmel, priest Heiter, and warrior Eisen—reminisce about their decade-long journey as the moment to bid each other farewell arrives. But the passing of time is different for elves.',
    link: 'https://myanimelist.net/anime/52991/Sousou_no_Frieren',
    hianimeSlugs: ['frieren-beyond-journeys-end-18418', 'frieren-beyond-journey-s-end-golden-land-arc-33858', '18418', '33858', '52991'],
  },

  // 11. Solo Leveling
  '52299': {
    _id: '52299',
    id: 52299,
    title: 'Solo Leveling',
    alternativeTitles: ['Ore dake Level Up na Ken', '俺だけレベルアップな件'],
    ranking: 95,
    genres: ['Action', 'Adventure', 'Fantasy'],
    episodes: 12,
    image: 'https://cdn.myanimelist.net/images/anime/1664/141042.jpg',
    thumb: 'https://cdn.myanimelist.net/images/anime/1664/141042t.jpg',
    type: 'TV',
    status: 'Finished Airing',
    synopsis: 'A decade ago, "the Gate" appeared and connected the real world with the realm of magic and monsters. To combat these vile beasts, ordinary people were bestowed with superhuman powers and became known as "Hunters." Twenty-year-old Sung Jin-Woo is one such Hunter, but he is known as the "World\'s Weakest.".',
    link: 'https://myanimelist.net/anime/52299/Ore_dake_Level_Up_na_Ken',
    hianimeSlugs: ['solo-leveling-18718', 'solo-leveling-season-2-arise-from-the-shadow-19413', '18718', '19413', '52299'],
  },

  // 12. Chainsaw Man
  '44511': {
    _id: '44511',
    id: 44511,
    title: 'Chainsaw Man',
    alternativeTitles: ['Chainsaw Man', 'チェンソーマン'],
    ranking: 112,
    genres: ['Action', 'Supernatural', 'Fantasy'],
    episodes: 12,
    image: 'https://cdn.myanimelist.net/images/anime/1806/126216.jpg',
    thumb: 'https://cdn.myanimelist.net/images/anime/1806/126216t.jpg',
    type: 'TV',
    status: 'Finished Airing',
    synopsis: 'Denji is robbed of a normal teenage life, left with nothing but his deadbeat father\'s overwhelming debt. His only companion is his pet, the chainsaw devil Pochita, with whom he slays devils for money that inevitably ends up in the yakuza\'s pockets.',
    link: 'https://myanimelist.net/anime/44511/Chainsaw_Man',
    hianimeSlugs: ['chainsaw-man-17406', '17406', '44511'],
  },

  // 13. DAN DA DAN
  '57334': {
    _id: '57334',
    id: 57334,
    title: 'DAN DA DAN',
    alternativeTitles: ['Dandadan', 'ダンダダン'],
    ranking: 88,
    genres: ['Action', 'Comedy', 'Supernatural'],
    episodes: 12,
    image: 'https://cdn.myanimelist.net/images/anime/1207/144605.jpg',
    thumb: 'https://cdn.myanimelist.net/images/anime/1207/144605t.jpg',
    type: 'TV',
    status: 'Finished Airing',
    synopsis: 'Momo Ayase is a high school girl who believes in ghosts but not aliens, while her classmate Okarun believes in aliens but not ghosts. In a bet to determine who is right, the two decide to separately visit locations associated with both the occult and the extraterrestrial.',
    link: 'https://myanimelist.net/anime/57334/Dandadan',
    hianimeSlugs: ['dan-da-dan-19343', 'dandadan-3rd-season-19851', '19343', '19851', '57334'],
  },

  // 14. Fullmetal Alchemist: Brotherhood
  '5114': {
    _id: '5114',
    id: 5114,
    title: 'Fullmetal Alchemist: Brotherhood',
    alternativeTitles: ['Hagane no Renkinjutsushi', '鋼の錬金術師 FULLMETAL ALCHEMIST'],
    ranking: 3,
    genres: ['Action', 'Adventure', 'Drama', 'Fantasy'],
    episodes: 64,
    image: 'https://cdn.myanimelist.net/images/anime/1208/94745.jpg',
    thumb: 'https://cdn.myanimelist.net/images/anime/1208/94745t.jpg',
    type: 'TV',
    status: 'Finished Airing',
    synopsis: 'After a horrific alchemy experiment goes wrong in the Elric household, brothers Edward and Alphonse are left in a catastrophic new reality. Ignoring the alchemical principle banning human transmutation, the boys attempted to bring their recently deceased mother back to life.',
    link: 'https://myanimelist.net/anime/5114/Fullmetal_Alchemist__Brotherhood',
    hianimeSlugs: ['fullmetal-alchemist-brotherhood-2', '2', '5114'],
  },

  // 15. Steins;Gate
  '9253': {
    _id: '9253',
    id: 9253,
    title: 'Steins;Gate',
    alternativeTitles: ['Steins Gate', 'シュタインズ・ゲート'],
    ranking: 4,
    genres: ['Drama', 'Sci-Fi', 'Suspense'],
    episodes: 24,
    image: 'https://cdn.myanimelist.net/images/anime/1935/127974.jpg',
    thumb: 'https://cdn.myanimelist.net/images/anime/1935/127974t.jpg',
    type: 'TV',
    status: 'Finished Airing',
    synopsis: 'Eccentric scientist Rintarou Okabe has an insatiable thirst for scientific exploration. Together with his ditzy friend Mayuri Shiina and fellow gadgeteer Itaru Hashida, Okabe founds the Future Gadget Laboratory in the hopes of creating technological innovations that baffle the human psyche.',
    link: 'https://myanimelist.net/anime/9253/Steins_Gate',
    hianimeSlugs: ['steinsgate-3', '3', '9253'],
  },

  // 16. Hunter x Hunter (2011)
  '11061': {
    _id: '11061',
    id: 11061,
    title: 'Hunter x Hunter (2011)',
    alternativeTitles: ['HxH (2011)', 'HUNTER×HUNTER（ハンター×ハンター）'],
    ranking: 8,
    genres: ['Action', 'Adventure', 'Fantasy'],
    episodes: 148,
    image: 'https://cdn.myanimelist.net/images/anime/1337/99013.jpg',
    thumb: 'https://cdn.myanimelist.net/images/anime/1337/99013t.jpg',
    type: 'TV',
    status: 'Finished Airing',
    synopsis: 'Hunters devote themselves to accomplishing hazardous tasks, all from traversing the world\'s uncharted territories to locating rare items and monsters. Before becoming a Hunter, one must pass the arduous Hunter Examination—a high-risk selection process in which most applicants end up disabled or worse.',
    link: 'https://myanimelist.net/anime/11061/Hunter_x_Hunter_2011',
    hianimeSlugs: ['hunter-x-hunter-2011-64', '64', '11061'],
  },

  // 17. Black Clover
  '34572': {
    _id: '34572',
    id: 34572,
    title: 'Black Clover',
    alternativeTitles: ['Black Clover', 'ブラッククローバー'],
    ranking: 180,
    genres: ['Action', 'Comedy', 'Fantasy'],
    episodes: 170,
    image: 'https://cdn.myanimelist.net/images/anime/2/88336.jpg',
    thumb: 'https://cdn.myanimelist.net/images/anime/2/88336t.jpg',
    type: 'TV',
    status: 'Finished Airing',
    synopsis: 'Asta and Yuno were abandoned at the same church on the same day. Raised together as children, they came to know of the "Wizard King"—a title given to the strongest mage in the kingdom—and promised that they would compete against each other for the position of the next Wizard King.',
    link: 'https://myanimelist.net/anime/34572/Black_Clover',
    hianimeSlugs: ['black-clover-season-2-19706', 'black-clover-2404', '19706', '2404', '34572'],
  },

  // 18. The Apothecary Diaries
  '54492': {
    _id: '54492',
    id: 54492,
    title: 'The Apothecary Diaries',
    alternativeTitles: ['Kusuriya no Hitorigoto', '薬屋のひとりごと'],
    ranking: 42,
    genres: ['Drama', 'Mystery'],
    episodes: 24,
    image: 'https://cdn.myanimelist.net/images/anime/1708/138033.jpg',
    thumb: 'https://cdn.myanimelist.net/images/anime/1708/138033t.jpg',
    type: 'TV',
    status: 'Finished Airing',
    synopsis: 'Maomao, an apothecary\'s daughter, has been snatched from her peaceful life and sold to the lowest echelons of the imperial palace. Now merely a maid, Maomao settles into a new routine of quiet labor, determined to keep her head down until her three-year term is served.',
    link: 'https://myanimelist.net/anime/54492/Kusuriya_no_Hitorigoto',
    hianimeSlugs: ['kusuriya-no-hitorigoto-3rd-season-19700', 'the-apothecary-diaries-18578', '19700', '18578', '54492'],
  },

  // 19. Re:ZERO -Starting Life in Another World-
  '31240': {
    _id: '31240',
    id: 31240,
    title: 'Re:ZERO -Starting Life in Another World-',
    alternativeTitles: ['Re: Life in a different world from zero', 'Re：ゼロから始める異世界生活'],
    ranking: 154,
    genres: ['Drama', 'Fantasy', 'Suspense'],
    episodes: 25,
    image: 'https://cdn.myanimelist.net/images/anime/11/79410.jpg',
    thumb: 'https://cdn.myanimelist.net/images/anime/11/79410t.jpg',
    type: 'TV',
    status: 'Finished Airing',
    synopsis: 'When Subaru Natsuki leaves the convenience store, the last thing he expects is to be wrenched from his everyday life and dropped into a fantasy world. Things aren\'t looking good for the bewildered teenager; however, not long after his arrival, he is attacked by some thugs.',
    link: 'https://myanimelist.net/anime/31240/Re_Zero_kara_Hajimeru_Isekai_Seikatsu',
    hianimeSlugs: [
      're-zero-starting-life-in-another-world-season-3-19344',
      're-zero-starting-life-in-another-world-season-4-19509',
      'rezero-starting-life-in-another-world-144',
      '19344',
      '19509',
      '144',
      '31240'
    ],
  },

  // 20. Dragon Ball DAIMA
  '56880': {
    _id: '56880',
    id: 56880,
    title: 'Dragon Ball DAIMA',
    alternativeTitles: ['Dragon Ball Daima', 'ドラゴンボールDAIMA'],
    ranking: 210,
    genres: ['Action', 'Adventure', 'Comedy', 'Fantasy'],
    episodes: 20,
    image: 'https://cdn.myanimelist.net/images/anime/1166/145887.jpg',
    thumb: 'https://cdn.myanimelist.net/images/anime/1166/145887t.jpg',
    type: 'TV',
    status: 'Currently Airing',
    synopsis: 'Due to a conspiracy, Goku and his friends are turned small. What kind of adventure awaits Goku, the Supreme Kai, and new companions Glorio and Panzy in this mysterious and unknown world?',
    link: 'https://myanimelist.net/anime/56880/Dragon_Ball_Daima',
    hianimeSlugs: ['dragon-ball-daima-19329', '19329', '56880'],
  },

  // 21. Blue Lock
  '49596': {
    _id: '49596',
    id: 49596,
    title: 'Blue Lock',
    alternativeTitles: ['BLUELOCK', 'ブルーロック'],
    ranking: 195,
    genres: ['Sports'],
    episodes: 24,
    image: 'https://cdn.myanimelist.net/images/anime/1258/126926.jpg',
    thumb: 'https://cdn.myanimelist.net/images/anime/1258/126926t.jpg',
    type: 'TV',
    status: 'Finished Airing',
    synopsis: 'After reflecting on the current state of Japanese soccer, the Japan Football Association decides to hire the enigmatic and eccentric coach Jinpachi Ego to achieve their dream of winning the World Cup. Believing that Japan lacks an egoistic striker hungry for goals, Jinpachi initiates the Blue Lock.',
    link: 'https://myanimelist.net/anime/49596/Blue_Lock',
    hianimeSlugs: ['blue-lock-vs-u-20-japan-19322', 'blue-lock-17899', '19322', '17899', '49596'],
  },

  // 22. Spy x Family
  '50265': {
    _id: '50265',
    id: 50265,
    title: 'Spy x Family',
    alternativeTitles: ['SPY×FAMILY', 'スパイファミリー'],
    ranking: 85,
    genres: ['Action', 'Comedy'],
    episodes: 12,
    image: 'https://cdn.myanimelist.net/images/anime/1441/122795.jpg',
    thumb: 'https://cdn.myanimelist.net/images/anime/1441/122795t.jpg',
    type: 'TV',
    status: 'Finished Airing',
    synopsis: 'Corrupt politicians, frenzied nationalists, and other warmongering forces constantly jeopardize the thin veneer of peace between neighboring countries Ostania and Westalis. To counter these bad actors, Twilight must infiltrate an elite school under the guise of an adoptive father.',
    link: 'https://myanimelist.net/anime/50265/Spy_x_Family',
    hianimeSlugs: ['spy-x-family-17978', 'spy-x-family-season-2-18545', '17978', '18545', '50265'],
  },

  // 23. Vinland Saga
  '37521': {
    _id: '37521',
    id: 37521,
    title: 'Vinland Saga',
    alternativeTitles: ['Vinland Saga', 'ヴィンランド・サガ'],
    ranking: 45,
    genres: ['Action', 'Adventure', 'Drama'],
    episodes: 24,
    image: 'https://cdn.myanimelist.net/images/anime/1500/103005.jpg',
    thumb: 'https://cdn.myanimelist.net/images/anime/1500/103005t.jpg',
    type: 'TV',
    status: 'Finished Airing',
    synopsis: 'Young Thorfinn grew up listening to the stories of old sailors that had traveled the ocean and reached the place of legend, Vinland. It\'s said to be warm and fertile, a place where there would be no need for fighting—not at all like the frozen village in Iceland where he was born.',
    link: 'https://myanimelist.net/anime/37521/Vinland_Saga',
    hianimeSlugs: ['vinland-saga-458', 'vinland-saga-season-2-18151', '458', '18151', '37521'],
  },

  // 24. Mob Psycho 100
  '32182': {
    _id: '32182',
    id: 32182,
    title: 'Mob Psycho 100',
    alternativeTitles: ['Mob Psycho 100', 'モブサイコ100'],
    ranking: 40,
    genres: ['Action', 'Comedy', 'Supernatural'],
    episodes: 12,
    image: 'https://cdn.myanimelist.net/images/anime/11/80103.jpg',
    thumb: 'https://cdn.myanimelist.net/images/anime/11/80103t.jpg',
    type: 'TV',
    status: 'Finished Airing',
    synopsis: 'Eighth-grader Shigeo "Mob" Kageyama has tapped into his inner wellspring of psychic prowess at a young age. But the power quickly proves to be a liability when he realizes the potential danger in his skills. Choosing to suppress his power, Mob\'s only present use for his ability is to impress his longtime crush, Tsubomi.',
    link: 'https://myanimelist.net/anime/32182/Mob_Psycho_100',
    hianimeSlugs: ['mob-psycho-100-244', 'mob-psycho-100-ii-245', '244', '245', '32182'],
  },

  // 25. Reincarnated as a Sword
  '49891': {
    _id: '49891',
    id: 49891,
    title: 'Reincarnated as a Sword',
    alternativeTitles: ['Tensei shitara Ken Deshita', '転生したら剣でした'],
    ranking: 310,
    genres: ['Action', 'Fantasy'],
    episodes: 12,
    image: 'https://cdn.myanimelist.net/images/anime/1208/123849.jpg',
    thumb: 'https://cdn.myanimelist.net/images/anime/1208/123849t.jpg',
    type: 'TV',
    status: 'Finished Airing',
    synopsis: 'Reincarnated as a sentient weapon with memories of his past life, but not his name, a magical sword saves a young beastgirl from a life of slavery. Fran, the cat-eared girl, becomes his wielder, and the two embark on a journey together.',
    link: 'https://myanimelist.net/anime/49891/Tensei_shitara_Ken_Deshita',
    hianimeSlugs: ['tensei-shitara-ken-deshita-2nd-season-16828', '16828', '49891'],
  },

  // 26. A Returner's Magic Should Be Special
  '54852': {
    _id: '54852',
    id: 54852,
    title: "A Returner's Magic Should Be Special",
    alternativeTitles: ['Kikansha no Mahou wa Tokubetsu desu', '帰還者の魔法は特別です'],
    ranking: 420,
    genres: ['Action', 'Fantasy'],
    episodes: 12,
    image: 'https://cdn.myanimelist.net/images/anime/1487/138139.jpg',
    thumb: 'https://cdn.myanimelist.net/images/anime/1487/138139t.jpg',
    type: 'TV',
    status: 'Finished Airing',
    synopsis: 'The Shadow Labyrinth has plagued humanity for ten long years. Just as Desir Arman and his final squad prepare to meet their end within it, Desir awakens thirteen years in the past, back when he first enrolled in the Hebrion Academy.',
    link: 'https://myanimelist.net/anime/54852/Kikansha_no_Mahou_wa_Tokubetsu_desu',
    hianimeSlugs: ['a-returner-s-magic-should-be-special-season-2-17860', '17860', '54852'],
  },

  // 27. Ranma 1/2 (2024)
  '59048': {
    _id: '59048',
    id: 59048,
    title: 'Ranma 1/2 (2024)',
    alternativeTitles: ['Ranma 1/2 (2024)', 'らんま1/2'],
    ranking: 250,
    genres: ['Action', 'Comedy', 'Romance'],
    episodes: 12,
    image: 'https://cdn.myanimelist.net/images/anime/1487/144703.jpg',
    thumb: 'https://cdn.myanimelist.net/images/anime/1487/144703t.jpg',
    type: 'TV',
    status: 'Finished Airing',
    synopsis: 'Ranma Saotome and Akane Tendo of the Tendo Dojo are betrothed by their parents. But Ranma faces a unique challenge: when splashed with cold water, he turns into a girl, and warm water turns him back into a boy!',
    link: 'https://myanimelist.net/anime/59048/Ranma_1_2_2024',
    hianimeSlugs: ['ranma-12-2024-19318', '19318', '59048'],
  },

  // 28. Shangri-La Frontier
  '52347': {
    _id: '52347',
    id: 52347,
    title: 'Shangri-La Frontier',
    alternativeTitles: ['Shangri-La Frontier: Kusoge Hunter, Kamige ni Idoman to su', 'シャングリラ・フロンティア'],
    ranking: 110,
    genres: ['Action', 'Adventure', 'Fantasy'],
    episodes: 25,
    image: 'https://cdn.myanimelist.net/images/anime/1912/138407.jpg',
    thumb: 'https://cdn.myanimelist.net/images/anime/1912/138407t.jpg',
    type: 'TV',
    status: 'Finished Airing',
    synopsis: 'Second-year high schooler Rakuro Hizutome is interested in one thing only: finding "trash games" and beating the crap out of them. His gaming skills are second to none, and no game is too bad for him to enjoy.',
    link: 'https://myanimelist.net/anime/52347/Shangri-La_Frontier',
    hianimeSlugs: ['shangri-la-frontier-season-2-19333', 'shangri-la-frontier-3rd-season-19522', '19333', '19522', '52347'],
  },

  // 29. Bleach (Original Series)
  '269': {
    _id: '269',
    id: 269,
    title: 'Bleach',
    alternativeTitles: ['BLEACH', 'ブリーチ'],
    ranking: 170,
    genres: ['Action', 'Adventure', 'Supernatural'],
    episodes: 366,
    image: 'https://cdn.myanimelist.net/images/anime/3/40451.jpg',
    thumb: 'https://cdn.myanimelist.net/images/anime/3/40451t.jpg',
    type: 'TV',
    status: 'Finished Airing',
    synopsis: 'Ichigo Kurosaki is a normal high school student—until his family is attacked by a Hollow, a corrupt spirit that seeks to devour human souls. It is then that he meets a Soul Reaper named Rukia Kuchiki, who gets injured while protecting Ichigo\'s family. To save his family, Ichigo accepts Rukia\'s offer of taking her powers and becomes a Soul Reaper as a result.',
    link: 'https://myanimelist.net/anime/269/Bleach',
    hianimeSlugs: ['bleach-238', '238', '269'],
  },

  // 30. Naruto: Shippuuden
  '1735': {
    _id: '1735',
    id: 1735,
    title: 'Naruto: Shippuuden',
    alternativeTitles: ['Naruto Shippuden', 'ナルト- 疾風伝'],
    ranking: 85,
    genres: ['Action', 'Adventure', 'Fantasy'],
    episodes: 500,
    image: 'https://cdn.myanimelist.net/images/anime/1565/111305.jpg',
    thumb: 'https://cdn.myanimelist.net/images/anime/1565/111305t.jpg',
    type: 'TV',
    status: 'Finished Airing',
    synopsis: 'It has been two and a half years since Naruto Uzumaki left Konohagakure, the Hidden Leaf Village, for intense training following events which fueled his desire to be stronger. Now Akatsuki, the mysterious organization of elite rogue ninja, is closing in on their grand plan which may threaten the safety of the entire shinobi world.',
    link: 'https://myanimelist.net/anime/1735/Naruto__Shippuuden',
    hianimeSlugs: ['naruto-shippuden-1493', '1493', '1735'],
  },

  // 31. That Time I Got Reincarnated as a Slime
  '37430': {
    _id: '37430',
    id: 37430,
    title: 'That Time I Got Reincarnated as a Slime',
    alternativeTitles: ['Tensei shitara Slime Datta Ken', '転生したらスライムだった件'],
    ranking: 104,
    genres: ['Action', 'Adventure', 'Comedy', 'Fantasy'],
    episodes: 24,
    image: 'https://cdn.myanimelist.net/images/anime/1792/95256.jpg',
    thumb: 'https://cdn.myanimelist.net/images/anime/1792/95256t.jpg',
    type: 'TV',
    status: 'Finished Airing',
    synopsis: 'Thirty-seven-year-old Satoru Mikami is a typical corporate worker, who is perfectly content with his monotonous lifestyle in Tokyo. One day, he falls victim to a random assailant on the streets and is stabbed. While succumbing to his injuries, a peculiar voice echoes in his mind and recites a bunch of commands which he cannot make sense of. Awakening, Satoru discovers he has reincarnated as a slime in an unfamiliar realm.',
    link: 'https://myanimelist.net/anime/37430/Tensei_shitara_Slime_Datta_Ken',
    hianimeSlugs: ['that-time-i-got-reincarnated-as-a-slime-season-4-18898', 'that-time-i-got-reincarnated-as-a-slime-season-3-19129', '18898', '19129', '37430'],
  },

  // 32. Mushoku Tensei: Jobless Reincarnation
  '39535': {
    _id: '39535',
    id: 39535,
    title: 'Mushoku Tensei: Jobless Reincarnation',
    alternativeTitles: ['Mushoku Tensei: Isekai Ittara Honki Dasu', '無職転生 ～異世界行ったら本気だす～'],
    ranking: 40,
    genres: ['Adventure', 'Drama', 'Fantasy'],
    episodes: 23,
    image: 'https://cdn.myanimelist.net/images/anime/1530/117776.jpg',
    thumb: 'https://cdn.myanimelist.net/images/anime/1530/117776t.jpg',
    type: 'TV',
    status: 'Finished Airing',
    synopsis: 'Despite being bullied, scorned, and oppressed all his life, a 34-year-old shut-in still found the resolve to attempt something heroic—only for it to end in a tragic accident. But in a twist of fate, he awakens in another world as Rudeus Greyrat, starting life again as a baby born to two loving parents.',
    link: 'https://myanimelist.net/anime/39535/Mushoku_Tensei__Isekai_Ittara_Honki_Dasu',
    hianimeSlugs: ['mushoku-tensei-jobless-reincarnation-season-3-18523', 'mushoku-tensei-jobless-reincarnation-season-2-part-2-19139', '18523', '19139', '39535'],
  },

  // 33. As a Reincarnated Aristocrat, I'll Use My Appraisal Skill
  '55265': {
    _id: '55265',
    id: 55265,
    title: "As a Reincarnated Aristocrat, I'll Use My Appraisal Skill to Rise in the World",
    alternativeTitles: ['Tensei Kizoku, Kantei Skill de Nariagaru', '転生貴族、鑑定スキルで成り上がる'],
    ranking: 310,
    genres: ['Adventure', 'Fantasy'],
    episodes: 12,
    image: 'https://cdn.myanimelist.net/images/anime/1090/141071.jpg',
    thumb: 'https://cdn.myanimelist.net/images/anime/1090/141071t.jpg',
    type: 'TV',
    status: 'Finished Airing',
    synopsis: 'After dying of heart failure, an ordinary Japanese salaryman is reborn as Ars Louvent, the young heir to a minor noble family in a fantasy realm. While he possesses no extraordinary physical prowess or magical talent, Ars possesses a remarkable appraisal skill.',
    link: 'https://myanimelist.net/anime/55265/Tensei_Kizoku_Kantei_Skill_de_Nariagaru',
    hianimeSlugs: [
      'as-a-reincarnated-aristocrat-i-ll-use-my-appraisal-skill-to-rise-in-the-world-17098',
      'as-a-reincarnated-aristocrat-i-ll-use-my-appraisal-skill-to-rise-in-the-world-season-2-18398',
      '17098',
      '18398',
      '55265'
    ],
  },
};

/**
 * Normalizes string for fuzzy/token search matching
 */
function cleanQuery(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Lookup a canonical record by Anime DB numeric ID, slug, or scraper ID
 */
export function getArchiveAnimeByIdOrSlug(idOrSlug: string): CanonicalAnimeRecord | null {
  if (!idOrSlug) return null;
  const raw = idOrSlug.trim();
  const lower = raw.toLowerCase();

  // 1. Direct ID lookup
  if (ANIME_DB_CANONICAL_ARCHIVE[raw]) {
    return ANIME_DB_CANONICAL_ARCHIVE[raw];
  }

  // 2. Iterate through records and match ID, _id, or hianimeSlugs
  for (const record of Object.values(ANIME_DB_CANONICAL_ARCHIVE)) {
    if (String(record.id) === raw || String(record._id) === raw) {
      return record;
    }
    if (record.hianimeSlugs && record.hianimeSlugs.some((s) => s.toLowerCase() === lower)) {
      return record;
    }
  }

  // 3. Match slug ending with ID e.g. "attack-on-titan-6436" -> check "6436"
  const trailingNum = lower.match(/-(\d+)$/);
  if (trailingNum && trailingNum[1]) {
    const num = trailingNum[1];
    for (const record of Object.values(ANIME_DB_CANONICAL_ARCHIVE)) {
      if (record.hianimeSlugs && record.hianimeSlugs.includes(num)) {
        return record;
      }
    }
  }

  return null;
}

/**
 * Searches canonical archive by title or alternative titles
 */
export function searchArchiveAnime(query: string): CanonicalAnimeRecord[] {
  if (!query || !query.trim()) return [];
  const cleanQ = cleanQuery(query);
  const qTokens = cleanQ.split(' ').filter(Boolean);

  const results: { record: CanonicalAnimeRecord; score: number }[] = [];

  for (const record of Object.values(ANIME_DB_CANONICAL_ARCHIVE)) {
    const cleanTitle = cleanQuery(record.title);
    const alts = (record.alternativeTitles || []).map(cleanQuery);

    // Exact title match
    if (cleanTitle === cleanQ || alts.includes(cleanQ)) {
      results.push({ record, score: 100 });
      continue;
    }

    // Substring match
    if (cleanTitle.includes(cleanQ) || alts.some((a) => a.includes(cleanQ))) {
      results.push({ record, score: 75 });
      continue;
    }

    // All query tokens present in title or alternatives
    const allTokensInTitle = qTokens.every((t) => cleanTitle.includes(t) || alts.some((a) => a.includes(t)));
    if (allTokensInTitle && qTokens.length > 0) {
      results.push({ record, score: 50 });
      continue;
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .map((r) => r.record);
}
