import { BiblicalCharacterId } from '../../components/gamified/GamifiedMascot';

export type JourneyGameStyle =
  | 'bible-or-not'
  | 'who-said'
  | 'proverb'
  | 'testament'
  | 'four-signs'
  | 'scribes-tiles'
  | 'chest'
  | 'trophy';

export type ChronicleQuestionType =
  | 'trivia'
  | 'who-said'
  | 'bible-or-not'
  | 'four-signs'
  | 'scribes-tiles';

export interface ChronicleQuestion {
  prompt: string;
  speechText: string;
  category: string;
  options: string[];
  answer: string;
  ref: string;
  why?: string;
  questionType?: ChronicleQuestionType;
  fourSignsClues?: string[];
  wordLength?: number;
}

export interface ChronicleDay {
  dayNumber: number; // 1..365
  actIndex: number; // 1..12
  actTitle: string;
  actColor: string;
  actLipColor: string;
  chapterTitle: string;
  storyTitle: string;
  scriptureRef: string;
  blurb: string;
  characterId: BiblicalCharacterId;
  characterName: string;
  gameStyle: JourneyGameStyle;
  glyph: 'star' | 'book' | 'scroll' | 'trophy' | 'chest';
  xpReward: number;
  questions: ChronicleQuestion[];
}

export interface ChronicleChapter {
  title: string;
  startDay: number;
  endDay: number;
}

export interface ChronicleAct {
  actIndex: number;
  actTitle: string;
  subtitle: string;
  color: string;
  lipColor: string;
  tintColor: string;
  startDay: number;
  endDay: number;
  totalDays: number;
  characterId: BiblicalCharacterId;
  description: string;
  chapters: ChronicleChapter[];
}

/**
 * 12 Epic Sections / Acts of the Biblical Chronicle (Days 1 to 365)
 */
export const CHRONICLE_ACTS: ChronicleAct[] = [
  {
    actIndex: 1,
    actTitle: 'Act 1: Genesis & Origins',
    subtitle: 'From Creation to the Patriarchs',
    color: '#0D9488',
    lipColor: '#0F766E',
    tintColor: '#CCFBF1',
    startDay: 1,
    endDay: 50,
    totalDays: 50,
    characterId: 'adam',
    description: 'The wondrous creation of the cosmos, the fall, Noah’s ark, and God’s covenant with Abraham, Isaac, Jacob, and Joseph.',
    chapters: [
      { title: 'The Dawn of Creation & Eden', startDay: 1, endDay: 7 },
      { title: 'The Fall, Cain, & Noah’s Ark', startDay: 8, endDay: 18 },
      { title: 'Babel & The Call of Abraham', startDay: 19, endDay: 30 },
      { title: 'Isaac & Jacob’s Wrestling', startDay: 31, endDay: 40 },
      { title: 'Joseph & Deliverance in Egypt', startDay: 41, endDay: 50 },
    ],
  },
  {
    actIndex: 2,
    actTitle: 'Act 2: Exodus & The Wilderness',
    subtitle: 'Deliverance, Law & The Tabernacle',
    color: '#6366F1',
    lipColor: '#4F46E5',
    tintColor: '#E0E7FF',
    startDay: 51,
    endDay: 90,
    totalDays: 40,
    characterId: 'moshe',
    description: 'Moses at the burning bush, the ten plagues, parting of the Red Sea, the Ten Commandments at Sinai, and God dwelling with His people.',
    chapters: [
      { title: 'Moses, Burning Bush & Plagues', startDay: 51, endDay: 65 },
      { title: 'The Red Sea, Manna & Water', startDay: 66, endDay: 75 },
      { title: 'Sinai, Covenant & Tabernacle', startDay: 76, endDay: 90 },
    ],
  },
  {
    actIndex: 3,
    actTitle: 'Act 3: The Promised Land & Judges',
    subtitle: 'Conquest, Courage & Deliverers',
    color: '#8B5CF6',
    lipColor: '#7C3AED',
    tintColor: '#EDE9FE',
    startDay: 91,
    endDay: 130,
    totalDays: 40,
    characterId: 'joshua',
    description: 'Joshua leads Israel across the Jordan, Jericho falls, and God raises up Deborah, Gideon, Samson, and the redeeming faith of Ruth.',
    chapters: [
      { title: 'Crossing Jordan & Jericho', startDay: 91, endDay: 105 },
      { title: 'Deborah & The Song of Victory', startDay: 106, endDay: 115 },
      { title: 'Gideon’s 300 & Samson’s Might', startDay: 116, endDay: 123 },
      { title: 'Ruth & Boaz: The Redeemer', startDay: 124, endDay: 130 },
    ],
  },
  {
    actIndex: 4,
    actTitle: 'Act 4: The United Kingdom',
    subtitle: 'Kings, Psalms & Holy Temple',
    color: '#1CB0F6',
    lipColor: '#1899D6',
    tintColor: '#DDF3FE',
    startDay: 131,
    endDay: 175,
    totalDays: 45,
    characterId: 'david',
    description: 'Samuel anoints King Saul, shepherd David defeats Goliath, songs of the Psalms ascend, and Solomon erects the glorious Temple.',
    chapters: [
      { title: 'Samuel & Saul’s Reign', startDay: 131, endDay: 142 },
      { title: 'David & Goliath, King on Zion', startDay: 143, endDay: 158 },
      { title: 'Psalms of Praise & The Ark', startDay: 159, endDay: 166 },
      { title: 'Solomonic Wisdom & The Temple', startDay: 167, endDay: 175 },
    ],
  },
  {
    actIndex: 5,
    actTitle: 'Act 5: The Divided Kingdom & Prophets',
    subtitle: 'Fiery Zeal on Mount Carmel',
    color: '#F97316',
    lipColor: '#EA580C',
    tintColor: '#FFEDD5',
    startDay: 176,
    endDay: 220,
    totalDays: 45,
    characterId: 'eliyah',
    description: 'Israel and Judah divide, Elijah calls down fire from heaven on Mount Carmel, Elisha inherits a double portion, and Jonah journeys to Nineveh.',
    chapters: [
      { title: 'The Kingdom Divided', startDay: 176, endDay: 185 },
      { title: 'Elijah & The Carmel Firestorm', startDay: 186, endDay: 198 },
      { title: 'Elisha’s Double Portion & Signs', startDay: 199, endDay: 210 },
      { title: 'Jonah, Nineveh & The Prophets', startDay: 211, endDay: 220 },
    ],
  },
  {
    actIndex: 6,
    actTitle: 'Act 6: Major Prophets & The Exile',
    subtitle: 'Visions of Glory & Daniel’s Faith',
    color: '#3B82F6',
    lipColor: '#2563EB',
    tintColor: '#DBEAFE',
    startDay: 221,
    endDay: 260,
    totalDays: 40,
    characterId: 'daniel',
    description: 'Isaiah’s vision of the Holy Throne, Jeremiah’s tears and New Covenant, Ezekiel’s valley of dry bones, and Daniel in Babylon’s lions’ den.',
    chapters: [
      { title: 'Isaiah: The Suffering Servant', startDay: 221, endDay: 235 },
      { title: 'Jeremiah & The New Covenant', startDay: 236, endDay: 245 },
      { title: 'Ezekiel & Dry Bones Revived', startDay: 246, endDay: 252 },
      { title: 'Daniel in Babylon & The Lions', startDay: 253, endDay: 260 },
    ],
  },
  {
    actIndex: 7,
    actTitle: 'Act 7: Restoration & Esther',
    subtitle: 'Courage in Susa & Rebuilt Walls',
    color: '#EC4899',
    lipColor: '#DB2777',
    tintColor: '#FCE7F3',
    startDay: 261,
    endDay: 280,
    totalDays: 20,
    characterId: 'esther',
    description: 'Queen Esther stands courageous for her people, Ezra restores the sacred law, and Nehemiah rebuilds the walls of Jerusalem.',
    chapters: [
      { title: 'Esther: For Such a Time as This', startDay: 261, endDay: 270 },
      { title: 'Ezra’s Scrolls & Nehemiah’s Walls', startDay: 271, endDay: 280 },
    ],
  },
  {
    actIndex: 8,
    actTitle: 'Act 8: The Incarnation & Ministry',
    subtitle: 'The Light of the World Revealed',
    color: '#EAB308',
    lipColor: '#CA8A04',
    tintColor: '#FEF9C3',
    startDay: 281,
    endDay: 315,
    totalDays: 35,
    characterId: 'jesus',
    description: 'The birth of Jesus in Bethlehem, baptism in the Jordan, the Sermon on the Mount, kingdom parables, and miraculous healings.',
    chapters: [
      { title: 'The Nativity & Jordan Baptism', startDay: 281, endDay: 290 },
      { title: 'Sermon on the Mount & Beatitudes', startDay: 291, endDay: 300 },
      { title: 'Parables & Miracles of Grace', startDay: 301, endDay: 315 },
    ],
  },
  {
    actIndex: 9,
    actTitle: 'Act 9: Passion, Cross & Victory',
    subtitle: 'The Empty Tomb & Risen Lord',
    color: '#EF4444',
    lipColor: '#DC2626',
    tintColor: '#FEE2E2',
    startDay: 316,
    endDay: 330,
    totalDays: 15,
    characterId: 'jesus',
    description: 'Triumphal entry, the Last Supper, agony in Gethsemane, the cross of Calvary, glorious resurrection, and the Great Commission.',
    chapters: [
      { title: 'Triumphal Entry & Last Supper', startDay: 316, endDay: 322 },
      { title: 'Gethsemane, Cross & Tomb', startDay: 323, endDay: 327 },
      { title: 'Resurrection & Great Commission', startDay: 328, endDay: 330 },
    ],
  },
  {
    actIndex: 10,
    actTitle: 'Act 10: Acts & The Holy Spirit',
    subtitle: 'Pentecost Fire & The Early Church',
    color: '#10B981',
    lipColor: '#059669',
    tintColor: '#D1FAE5',
    startDay: 331,
    endDay: 345,
    totalDays: 15,
    characterId: 'peter',
    description: 'The Holy Spirit arrives at Pentecost, the bold witness of Peter and Stephen, Philip in Samaria, and Saul’s encounter on the Damascus road.',
    chapters: [
      { title: 'Pentecost & The Bold Church', startDay: 331, endDay: 337 },
      { title: 'Stephen, Philip & Saul’s Damascus', startDay: 338, endDay: 345 },
    ],
  },
  {
    actIndex: 11,
    actTitle: 'Act 11: Paul’s Letters & Apostles',
    subtitle: 'Letters of Grace, Faith & Hope',
    color: '#A855F7',
    lipColor: '#9333EA',
    tintColor: '#F3E8FF',
    startDay: 346,
    endDay: 357,
    totalDays: 12,
    characterId: 'paul',
    description: 'Paul’s epistles to Rome, Corinth, Galatia, Ephesus, and Philippi, alongside James, Peter, and Hebrews urging endurance in faith.',
    chapters: [
      { title: 'Romans, Corinthians & Galatians', startDay: 346, endDay: 351 },
      { title: 'Ephesians, Hebrews & James', startDay: 352, endDay: 357 },
    ],
  },
  {
    actIndex: 12,
    actTitle: 'Act 12: Revelation & The Kingdom',
    subtitle: 'Alpha & Omega, The New Jerusalem',
    color: '#6366F1',
    lipColor: '#4F46E5',
    tintColor: '#EEF2FF',
    startDay: 358,
    endDay: 365,
    totalDays: 8,
    characterId: 'john',
    description: 'John’s vision of the glorified Christ, the throne room of heaven, the defeat of evil, and the New Jerusalem with the River of Life.',
    chapters: [
      { title: 'Seven Churches & The Throne Room', startDay: 358, endDay: 361 },
      { title: 'The New Heaven, Earth & Tree of Life', startDay: 362, endDay: 365 },
    ],
  },
];

/**
 * Curated Milestone Seed Data for Anchor Days across Genesis to Revelation
 */
interface SeedMilestone {
  dayNumber: number;
  storyTitle: string;
  scriptureRef: string;
  blurb: string;
  characterId: BiblicalCharacterId;
  characterName: string;
  gameStyle: JourneyGameStyle;
  glyph: 'star' | 'book' | 'scroll' | 'trophy' | 'chest';
  questions: ChronicleQuestion[];
}

const SEED_MILESTONES: Record<number, SeedMilestone> = {
  // Day 1: Creation
  1: {
    dayNumber: 1,
    storyTitle: 'In the Beginning: Light & Heavens',
    scriptureRef: 'Genesis 1:1-5',
    blurb: 'God spoke into the formless void: "Let there be light," separating illumination from the darkness on the first day.',
    characterId: 'adam',
    characterName: 'Ādām',
    gameStyle: 'bible-or-not',
    glyph: 'star',
    questions: [
      {
        prompt: 'On the very first day of creation, what did God command into existence?',
        speechText: 'Let there be light!',
        category: 'Creation Week',
        options: ['Light', 'The Sun and Moon', 'Birds of the air', 'Dry land'],
        answer: 'Light',
        ref: 'Genesis 1:3',
        why: 'God commanded light before creating the celestial bodies on Day 4.',
      },
      {
        prompt: 'What was the state of the earth before God’s creative command in Genesis 1:2?',
        speechText: 'Darkness hovered over the deep...',
        category: 'Genesis Foundations',
        options: ['Formless and empty', 'Covered in desert sands', 'Inhabited by creatures', 'Divided into continents'],
        answer: 'Formless and empty',
        ref: 'Genesis 1:2',
        why: 'The Spirit of God hovered over the face of the deep waters.',
      },
      {
        prompt: 'Complete the sacred opening verse: "In the beginning, God created..."',
        speechText: 'The foundation of all scripture!',
        category: 'Scripture Memory',
        options: ['the heavens and the earth', 'the angels and the stars', 'mankind in the garden', 'time and eternity'],
        answer: 'the heavens and the earth',
        ref: 'Genesis 1:1',
        why: 'Genesis 1:1 begins the epic narrative of all Scripture.',
      },
    ],
  },
  // Day 2: The Expanse & Sky
  2: {
    dayNumber: 2,
    storyTitle: 'The Expanse: Waters Above & Below',
    scriptureRef: 'Genesis 1:6-8',
    blurb: 'God formed the vault of heaven, calling the expanse "sky" to separate the waters above from the waters below.',
    characterId: 'adam',
    characterName: 'Ādām',
    gameStyle: 'testament',
    glyph: 'scroll',
    questions: [
      {
        prompt: 'What did God call the expanse created on Day 2?',
        speechText: 'Look up into the expanse above!',
        category: 'Creation Week',
        options: ['Sky (Heaven)', 'Firmament of Stone', 'The Great Ocean', 'The Atmosphere'],
        answer: 'Sky (Heaven)',
        ref: 'Genesis 1:8',
        why: 'God called the expanse Sky, and there was evening and morning, the second day.',
      },
      {
        prompt: 'What did the expanse separate on Day 2?',
        speechText: 'Dividing the waters!',
        category: 'Creation Week',
        options: ['Waters below from waters above', 'Earth from the stars', 'Day from night', 'Land from sea'],
        answer: 'Waters below from waters above',
        ref: 'Genesis 1:6-7',
        why: 'The vault separated upper atmospheric moisture from the seas below.',
      },
      {
        prompt: 'Is Genesis found in the Old Testament or New Testament?',
        speechText: 'Classify the sacred testament!',
        category: 'Canon Navigation',
        options: ['Old Testament', 'New Testament', 'Apocrypha', 'Epistles'],
        answer: 'Old Testament',
        ref: 'Genesis Canon',
        why: 'Genesis is the first book of the Pentateuch (Torah) in the Old Testament.',
      },
    ],
  },
  // Day 7: The Sabbath Rest
  7: {
    dayNumber: 7,
    storyTitle: 'The Seventh Day: Holy Rest',
    scriptureRef: 'Genesis 2:1-3',
    blurb: 'By the seventh day God completed His work; He rested and blessed the day, sanctifying it for holy reflection.',
    characterId: 'adam',
    characterName: 'Ādām',
    gameStyle: 'chest',
    glyph: 'chest',
    questions: [
      {
        prompt: 'What did God do on the seventh day of creation?',
        speechText: 'The work was finished and declared very good!',
        category: 'Sabbath Origins',
        options: ['He rested and blessed the day', 'He created the stars', 'He planted the cedars of Lebanon', 'He spoke to the angels'],
        answer: 'He rested and blessed the day',
        ref: 'Genesis 2:2-3',
        why: 'God ceased from all His work and made the seventh day holy.',
      },
      {
        prompt: 'How did God describe everything He had made at the conclusion of Day 6?',
        speechText: 'The divine review of all creation!',
        category: 'Genesis Origins',
        options: ['Very good', 'Acceptable', 'Complete for now', 'Worthy of praise'],
        answer: 'Very good',
        ref: 'Genesis 1:31',
        why: 'After creating humanity, God surveyed everything and saw it was very good.',
      },
      {
        prompt: 'Out of what did the Lord God form the first man, Adam?',
        speechText: 'Dust of the earth breathed with divine breath!',
        category: 'Creation of Humanity',
        options: ['Dust of the ground', 'Pebbles from the river', 'Sparks of holy fire', 'Leaves from Eden’s trees'],
        answer: 'Dust of the ground',
        ref: 'Genesis 2:7',
        why: 'The Lord breathed into his nostrils the breath of life, and man became a living soul.',
      },
    ],
  },
  // Day 14: Noah's Ark & The Flood
  14: {
    dayNumber: 14,
    storyTitle: 'Noah & The Ark of Deliverance',
    scriptureRef: 'Genesis 6:13-22',
    blurb: 'Surrounded by corruption, righteous Noah walked with God and built an ark of gopher wood according to divine specifications.',
    characterId: 'noah',
    characterName: 'Nōaḥ',
    gameStyle: 'scribes-tiles',
    glyph: 'book',
    questions: [
      {
        prompt: 'What kind of wood was Noah instructed to construct the Ark with?',
        speechText: 'Measure with cubits and pitch it within and without!',
        category: 'Noah’s Ark',
        options: ['Gopher wood', 'Cedar of Lebanon', 'Acacia wood', 'Oak'],
        answer: 'Gopher wood',
        ref: 'Genesis 6:14',
        why: 'Genesis 6:14 specifically specifies gopher wood coated with pitch inside and out.',
      },
      {
        prompt: 'How many days and nights did rain pour over the earth during the great flood?',
        speechText: 'The windows of heaven were opened!',
        category: 'The Great Flood',
        options: ['40 days and 40 nights', '7 days and 7 nights', '100 days and nights', '150 days'],
        answer: '40 days and 40 nights',
        ref: 'Genesis 7:12',
        why: 'Rain fell upon the earth for forty days and forty nights.',
      },
      {
        prompt: 'What sign did God place in the sky as an everlasting covenant to never flood the whole earth again?',
        speechText: 'A radiant promise across the clouds!',
        category: 'Covenant of Peace',
        options: ['Rainbow', 'Pillar of cloud', 'Shooting star', 'Golden eagle'],
        answer: 'Rainbow',
        ref: 'Genesis 9:13',
        why: '"I have set my rainbow in the clouds, and it will be the sign of the covenant."',
      },
    ],
  },
  // Day 25: Call of Abraham
  25: {
    dayNumber: 25,
    storyTitle: 'The Call of Abraham: Stars of the Sky',
    scriptureRef: 'Genesis 15:1-6',
    blurb: 'God led Abram outside beneath the desert night: "Look up at the heavens and count the stars — so shall your offspring be."',
    characterId: 'abraham',
    characterName: 'Avrāhām',
    gameStyle: 'who-said',
    glyph: 'star',
    questions: [
      {
        prompt: 'What did Abram do when God promised his descendants would be as numerous as the stars?',
        speechText: 'Count the stars, if indeed you can count them!',
        category: 'Abrahamic Covenant',
        options: ['He believed the Lord, and it was credited as righteousness', 'He asked for a golden tablet', 'He returned to Ur', 'He doubted and laughed'],
        answer: 'He believed the Lord, and it was credited as righteousness',
        ref: 'Genesis 15:6',
        why: 'Abraham’s foundational faith became the pattern of righteousness through faith.',
      },
      {
        prompt: 'From which ancient Mesopotamian city was Abram called to leave his family and homeland?',
        speechText: 'Leave your country, your people and your father’s household...',
        category: 'Patriarchal Journey',
        options: ['Ur of the Chaldeans', 'Babylon', 'Nineveh', 'Damascus'],
        answer: 'Ur of the Chaldeans',
        ref: 'Genesis 11:31',
        why: 'Terah and Abram departed from Ur of the Chaldees traveling towards Canaan.',
      },
      {
        prompt: 'Who was the king of Salem and priest of God Most High who brought bread and wine to Abram?',
        speechText: 'Blessed be Abram by God Most High, Creator of heaven and earth!',
        category: 'Patriarchal Encounters',
        options: ['Melchizedek', 'Abimelech', 'Potiphar', 'Jethro'],
        answer: 'Melchizedek',
        ref: 'Genesis 14:18-20',
        why: 'Melchizedek met Abram after the battle, foreshadowing the priesthood of Christ.',
      },
    ],
  },
  // Day 45: Joseph in Egypt
  45: {
    dayNumber: 45,
    storyTitle: 'Joseph: What Was Meant for Evil, God Used for Good',
    scriptureRef: 'Genesis 50:15-21',
    blurb: 'Reunited with his brothers who sold him into slavery, Joseph forgave them with tears: "God intended it for good to save many lives."',
    characterId: 'joseph',
    characterName: 'Yōsēf',
    gameStyle: 'who-said',
    glyph: 'trophy',
    questions: [
      {
        prompt: 'What did Joseph tell his brothers when they feared his retribution after Jacob died?',
        speechText: 'You intended to harm me, but God intended it for good...',
        category: 'Joseph’s Deliverance',
        options: [
          'You intended to harm me, but God intended it for good',
          'You must remain in Egypt as servants',
          'The guilt will follow you forever',
          'Give me back my coat of many colors',
        ],
        answer: 'You intended to harm me, but God intended it for good',
        ref: 'Genesis 50:20',
        why: 'Genesis 50:20 is one of the crowning verses on God’s sovereign providence in Scripture.',
      },
      {
        prompt: 'What special garment did Jacob give to Joseph that sparked his brothers’ jealousy?',
        speechText: 'A father’s favored gift that stirred rivalry!',
        category: 'Patriarchal History',
        options: ['A coat of many colors (richly ornamented robe)', 'A silver breastplate', 'A golden signet ring', 'A linen turban'],
        answer: 'A coat of many colors (richly ornamented robe)',
        ref: 'Genesis 37:3',
        why: 'Israel loved Joseph more than any of his other sons, making him an ornate robe.',
      },
      {
        prompt: 'Whose dreams did Joseph interpret while in Pharaoh’s prison in Egypt?',
        speechText: 'Visions of vines and baskets of bread!',
        category: 'Prison in Egypt',
        options: ['The Cupbearer and the Baker', 'The Captain and the Guard', 'Pharaoh’s daughters', 'The Chief Architect'],
        answer: 'The Cupbearer and the Baker',
        ref: 'Genesis 40:1-23',
        why: 'Joseph accurately interpreted the dreams of the royal cupbearer and baker.',
      },
    ],
  },
  // Day 60: Moses & The Burning Bush
  60: {
    dayNumber: 60,
    storyTitle: 'The Burning Bush: Holy Ground at Horeb',
    scriptureRef: 'Exodus 3:1-15',
    blurb: 'On Mount Horeb, an acacia bush blazed with fire without being consumed. God commanded: "Take off your sandals, for the ground is holy."',
    characterId: 'moshe',
    characterName: 'Mōshē',
    gameStyle: 'four-signs',
    glyph: 'scroll',
    questions: [
      {
        prompt: 'What did God tell Moses when he approached the burning bush?',
        speechText: 'Do not come any closer. Take off your sandals!',
        category: 'Call of Moses',
        options: [
          'Take off your sandals, for the place where you are standing is holy ground',
          'Build an altar of stone on this peak',
          'Return quickly to Midian and hide',
          'Gather forty men to be your witnesses',
        ],
        answer: 'Take off your sandals, for the place where you are standing is holy ground',
        ref: 'Exodus 3:5',
        why: 'God’s manifest presence consecrated the desert ground as holy.',
      },
      {
        prompt: 'By what eternal name did God reveal Himself to Moses at the bush?',
        speechText: 'Tell the children of Israel this name!',
        category: 'Divine Revelation',
        options: ['I AM WHO I AM', 'The God of Thunder', 'The Mighty Sun', 'The Angel of Peace'],
        answer: 'I AM WHO I AM',
        ref: 'Exodus 3:14',
        why: 'God said to Moses: "I AM WHO I AM. Say to the Israelites: I AM has sent me to you."',
      },
      {
        prompt: 'What did Moses’ shepherd staff turn into when he threw it on the ground before God?',
        speechText: 'A sign to prove the Lord has spoken!',
        category: 'Signs of Moses',
        options: ['A snake (serpent)', 'A burning torch', 'A golden scepter', 'A flowering almond branch'],
        answer: 'A snake (serpent)',
        ref: 'Exodus 4:2-3',
        why: 'The staff became a serpent, and when Moses caught it by the tail, it became a staff again.',
      },
    ],
  },
  // Day 70: Parting of the Red Sea
  70: {
    dayNumber: 70,
    storyTitle: 'Parting of the Red Sea: The Lord Fights for You',
    scriptureRef: 'Exodus 14:13-31',
    blurb: 'Trapped between Pharaoh’s chariots and the raging sea, Moses raised his staff. An east wind divided the waters, and Israel walked on dry ground.',
    characterId: 'moshe',
    characterName: 'Mōshē',
    gameStyle: 'who-said',
    glyph: 'star',
    questions: [
      {
        prompt: 'What courage did Moses proclaim to the trembling people before the Red Sea opened?',
        speechText: 'Do not be afraid. Stand firm and see the deliverance of the Lord!',
        category: 'The Exodus Deliverance',
        options: [
          'The Lord will fight for you; you need only to be still',
          'Turn back and surrender to Egypt’s chariots',
          'Swim across before nightfall arrives',
          'Draw your swords and attack the army',
        ],
        answer: 'The Lord will fight for you; you need only to be still',
        ref: 'Exodus 14:14',
        why: 'Exodus 14:14 captures Israel’s definitive proclamation of divine deliverance.',
      },
      {
        prompt: 'What led the children of Israel by day and night through the wilderness?',
        speechText: 'A celestial pillar guiding the covenant people!',
        category: 'Wilderness Guidance',
        options: ['Pillar of cloud by day and pillar of fire by night', 'A bronze compass', 'The flight of eagles', 'Desert scouts from Judah'],
        answer: 'Pillar of cloud by day and pillar of fire by night',
        ref: 'Exodus 13:21-22',
        why: 'The Lord went before them by day in a pillar of cloud, and by night in a pillar of fire.',
      },
      {
        prompt: 'Who took up a timbrel and led the women in singing of God’s triumph over Egypt’s chariots?',
        speechText: 'Sing to the Lord, for He has triumphed gloriously!',
        category: 'Song of the Sea',
        options: ['Miriam (Mīryām)', 'Deborah', 'Zipporah', 'Jochebed'],
        answer: 'Miriam (Mīryām)',
        ref: 'Exodus 15:20-21',
        why: 'Miriam the prophetess, Aaron’s sister, led Israel in jubilant song with timbrels.',
      },
    ],
  },
  // Day 145: David & Goliath
  145: {
    dayNumber: 145,
    storyTitle: 'David & Goliath: The Battle is the Lord’s',
    scriptureRef: '1 Samuel 17:38-51',
    blurb: 'Armed with only a sling, five smooth stones, and unwavering trust in the Living God, young David brought down the giant of Gath.',
    characterId: 'david',
    characterName: 'Dāvīd',
    gameStyle: 'who-said',
    glyph: 'trophy',
    questions: [
      {
        prompt: 'What did David declare to Goliath as he sprinted toward the Philistine champion?',
        speechText: 'You come against me with sword and spear and javelin...',
        category: 'Valley of Elah',
        options: [
          'I come against you in the name of the Lord of Hosts, the God of the armies of Israel',
          'I come with Saul’s royal bronze armor',
          'My brothers will strike you down from behind',
          'Flee back to Gath before sunset',
        ],
        answer: 'I come against you in the name of the Lord of Hosts, the God of the armies of Israel',
        ref: '1 Samuel 17:45',
        why: 'David anchored his victory not in weapons, but in the name of the living God.',
      },
      {
        prompt: 'How many smooth stones did David choose from the brook before facing Goliath?',
        speechText: 'Gathered from the water’s edge into his shepherd bag!',
        category: 'Shepherd Weapons',
        options: ['Five', 'Seven', 'Twelve', 'Three'],
        answer: 'Five',
        ref: '1 Samuel 17:40',
        why: 'David chose five smooth stones from the stream and put them in his shepherd’s pouch.',
      },
      {
        prompt: 'What instrument did young David play to soothe the troubled spirit of King Saul?',
        speechText: 'Strumming sacred melodies in the palace!',
        category: 'David’s Musician Skill',
        options: ['Harp (Lyre)', 'Silver Trumpet', 'Flute', 'Cymbals'],
        answer: 'Harp (Lyre)',
        ref: '1 Samuel 16:23',
        why: 'Whenever the harmful spirit came upon Saul, David took his lyre and played.',
      },
    ],
  },
  // Day 190: Elijah on Mount Carmel
  190: {
    dayNumber: 190,
    storyTitle: 'Elijah on Mount Carmel: The God Who Answers by Fire',
    scriptureRef: '1 Kings 18:20-40',
    blurb: 'Challenging 450 prophets of Baal, Elijah rebuilt the Lord’s altar with 12 stones and drenched it with water. Fire fell and consumed the sacrifice!',
    characterId: 'eliyah',
    characterName: 'Eliyāh',
    gameStyle: 'who-said',
    glyph: 'trophy',
    questions: [
      {
        prompt: 'What test did Elijah propose to all Israel on Mount Carmel?',
        speechText: 'How long will you waver between two opinions?',
        category: 'Mount Carmel Showdown',
        options: [
          'The God who answers by fire, He is God',
          'Whoever can build the tallest stone pillar',
          'The prophet who can run fastest to Jezreel',
          'A vote among the elders of Samaria',
        ],
        answer: 'The God who answers by fire, He is God',
        ref: '1 Kings 18:24',
        why: 'All the people replied: "What you say is good. The God who answers by fire is God."',
      },
      {
        prompt: 'What did the people shout when the fire of the Lord fell and burned the sacrifice and water?',
        speechText: 'Falling face down upon the mountain!',
        category: 'Carmel Victory',
        options: [
          'The Lord, He is God! The Lord, He is God!',
          'Great is Baal of the storms!',
          'Mercy upon King Ahab!',
          'Let us flee from the mountain!',
        ],
        answer: 'The Lord, He is God! The Lord, He is God!',
        ref: '1 Kings 18:39',
        why: 'Seeing the miraculous fire, the entire assembly fell prostrate in worship.',
      },
      {
        prompt: 'In what form did God speak to Elijah when he hid in the cave on Mount Horeb?',
        speechText: 'Not in the wind, earthquake, or fire...',
        category: 'Whisper of God',
        options: ['A gentle whisper (still small voice)', 'A mighty hurricane', 'An erupting volcano', 'A flash of lightning'],
        answer: 'A gentle whisper (still small voice)',
        ref: '1 Kings 19:12',
        why: 'After the fire came a gentle whisper, and Elijah pulled his cloak over his face.',
      },
    ],
  },
  // Day 255: Daniel in the Lions' Den
  255: {
    dayNumber: 255,
    storyTitle: 'Daniel in the Lions’ Den: Unbroken Prayer',
    scriptureRef: 'Daniel 6:10-23',
    blurb: 'Refusing King Darius’s decree, Daniel knelt toward Jerusalem three times a day. Cast into the den of lions, God shut the lions’ mouths!',
    characterId: 'daniel',
    characterName: 'Dāniyēl',
    gameStyle: 'who-said',
    glyph: 'trophy',
    questions: [
      {
        prompt: 'What did Daniel do after the king signed the decree forbidding prayer to any god or man?',
        speechText: 'Three times a day with windows open toward Jerusalem!',
        category: 'Steadfast Prayer',
        options: [
          'He went home and prayed three times a day just as he had done before',
          'He fled to the desert of Judea',
          'He disguised himself in merchant clothes',
          'He prayed only in secret under his bed',
        ],
        answer: 'He went home and prayed three times a day just as he had done before',
        ref: 'Daniel 6:10',
        why: 'Daniel remained openly steadfast in worship of the Living God.',
      },
      {
        prompt: 'What joyful answer did Daniel give King Darius when he called into the lions’ den at dawn?',
        speechText: 'May the king live forever!',
        category: 'Divine Rescue',
        options: [
          'My God sent His angel and shut the lions’ mouths',
          'The lions were not hungry',
          'I tamed the beasts with my staff',
          'I climbed out through the stone opening',
        ],
        answer: 'My God sent His angel and shut the lions’ mouths',
        ref: 'Daniel 6:22',
        why: 'God preserved His faithful servant without a scratch because he trusted in Him.',
      },
      {
        prompt: 'Who were Daniel’s three faithful companions preserved in the fiery furnace?',
        speechText: 'Four men walking untied and unharmed in the fire!',
        category: 'Babylonian Captivity',
        options: ['Shadrach, Meshach, and Abednego', 'Haggai, Zechariah, and Malachi', 'Ezra, Nehemiah, and Zerubbabel', 'Elihu, Eliphaz, and Bildad'],
        answer: 'Shadrach, Meshach, and Abednego',
        ref: 'Daniel 3:12-25',
        why: 'The three young Hebrew men refused to bow to Nebuchadnezzar’s golden statue.',
      },
    ],
  },
  // Day 285: The Nativity of Jesus
  285: {
    dayNumber: 285,
    storyTitle: 'The Nativity: Glory to God in the Highest',
    scriptureRef: 'Luke 2:1-20',
    blurb: 'In the City of David, Mary wrapped her newborn Son in swaddling clothes and laid Him in a manger, as angels proclaimed peace to shepherds.',
    characterId: 'jesus',
    characterName: 'Yēshūa',
    gameStyle: 'who-said',
    glyph: 'star',
    questions: [
      {
        prompt: 'What good news of great joy did the angel bring to the shepherds in the fields of Bethlehem?',
        speechText: 'Do not be afraid! I bring you good news of great joy...',
        category: 'The Nativity Announcement',
        options: [
          'Today in the town of David a Savior has been born to you; He is the Messiah, the Lord',
          'The Roman tax has been canceled',
          'A great king has taken the throne in Rome',
          'Gold will rain upon your flocks tonight',
        ],
        answer: 'Today in the town of David a Savior has been born to you; He is the Messiah, the Lord',
        ref: 'Luke 2:11',
        why: 'The angelic message announced the arrival of the promised Christ.',
      },
      {
        prompt: 'Where was the infant Jesus laid because there was no guest room available for Mary and Joseph?',
        speechText: 'Wrapped in cloths in a humble resting place!',
        category: 'Birth of Christ',
        options: ['In a manger (animal feeding trough)', 'In a royal cradle of cedar', 'On the floor of the synagogue', 'In a tent outside the city'],
        answer: 'In a manger (animal feeding trough)',
        ref: 'Luke 2:7',
        why: 'Mary wrapped Jesus in swaddling cloths and placed Him in a manger.',
      },
      {
        prompt: 'What three gifts did the Magi from the east present to the young child Jesus?',
        speechText: 'Treasures of royal honor!',
        category: 'The Magi Visit',
        options: ['Gold, frankincense, and myrrh', 'Silver, wool, and olive oil', 'Bread, wine, and pomegranates', 'Pearls, bronze, and purple silk'],
        answer: 'Gold, frankincense, and myrrh',
        ref: 'Matthew 2:11',
        why: 'The wise men opened their treasures and presented gold, incense, and myrrh.',
      },
    ],
  },
  // Day 325: The Cross & Resurrection
  325: {
    dayNumber: 325,
    storyTitle: 'The Resurrection: He is Not Here, He Has Risen!',
    scriptureRef: 'Matthew 28:1-10',
    blurb: 'At dawn on the first day of the week, the earth shook, an angel rolled away the heavy stone, and proclaimed: "He is risen, just as He said!"',
    characterId: 'jesus',
    characterName: 'Yēshūa',
    gameStyle: 'trophy',
    glyph: 'trophy',
    questions: [
      {
        prompt: 'What did the angel at the empty tomb say to Mary Magdalene and the other women?',
        speechText: 'Why do you look for the living among the dead?',
        category: 'The Glorious Resurrection',
        options: [
          'He is not here; He has risen, just as He said',
          'Search the garden for his resting place',
          'Go back to Galilee and mourn no longer',
          'Wait here until the evening falls',
        ],
        answer: 'He is not here; He has risen, just as He said',
        ref: 'Matthew 28:6',
        why: 'The glorious proclamation that Christ has conquered sin and death forever.',
      },
      {
        prompt: 'What was Jesus’ final triumph declaration on the cross before He yielded up His spirit?',
        speechText: 'The work of redemption is accomplished!',
        category: 'Calvary’s Triumph',
        options: ['It is finished', 'Remember my mother', 'The battle has begun', 'Forgive the Roman soldiers'],
        answer: 'It is finished',
        ref: 'John 19:30',
        why: 'Jesus said "Tetelestai" ("It is finished"), having completed the work of atonement.',
      },
      {
        prompt: 'On which day of the week did Jesus rise from the dead?',
        speechText: 'The dawn of a new creation!',
        category: 'The Lord’s Day',
        options: ['First day of the week (Sunday)', 'Seventh day (Sabbath)', 'Fourth day (Wednesday)', 'Sixth day (Preparation Day)'],
        answer: 'First day of the week (Sunday)',
        ref: 'Luke 24:1',
        why: 'On the first day of the week, very early in the morning, the women came to the tomb.',
      },
    ],
  },
  // Day 365: Revelation - The New Jerusalem & Tree of Life
  365: {
    dayNumber: 365,
    storyTitle: 'The New Jerusalem: Behold, I Make All Things New!',
    scriptureRef: 'Revelation 21:1-7; 22:1-5',
    blurb: 'The grand finale of Scripture! God wipes away every tear: no more death, sorrow, or crying. The River of Life flows from the Throne of God forever!',
    characterId: 'john',
    characterName: 'Yōḥānān',
    gameStyle: 'trophy',
    glyph: 'trophy',
    questions: [
      {
        prompt: 'What promise does God make from His heavenly throne in Revelation 21:4?',
        speechText: 'He will wipe every tear from their eyes...',
        category: 'The Eternal Hope',
        options: [
          'There will be no more death, mourning, crying, or pain',
          'Wars will happen every thousand years',
          'The old earth will continue alongside the new',
          'Only kings will walk the streets of gold',
        ],
        answer: 'There will be no more death, mourning, crying, or pain',
        ref: 'Revelation 21:4',
        why: 'The old order of things has passed away, and God dwells directly with His people.',
      },
      {
        prompt: 'What flows from the throne of God and of the Lamb down the middle of the holy city?',
        speechText: 'Clear as crystal, giving life to all nations!',
        category: 'New Jerusalem',
        options: ['The River of the Water of Life', 'A stream of pure liquid gold', 'A cascade of morning mist', 'The ancient Jordan River'],
        answer: 'The River of the Water of Life',
        ref: 'Revelation 22:1',
        why: 'The river of the water of life flows clear as crystal from the throne.',
      },
      {
        prompt: 'What are the closing comforting words of the Lord Jesus in Revelation 22:20?',
        speechText: 'Amen. Come, Lord Jesus!',
        category: 'Closing of the Canon',
        options: [
          'Yes, I am coming soon',
          'Keep studying the sacred scrolls',
          'Peace be upon all the churches',
          'Seal this book for ten thousand years',
        ],
        answer: 'Yes, I am coming soon',
        ref: 'Revelation 22:20',
        why: 'He who testifies to these things says: "Yes, I am coming soon." Amen! Come, Lord Jesus.',
      },
    ],
  },
};

/**
 * Enrich and guarantee at least 10 context-specific questions for every single day.
 * Incorporates multiple styles: narrative facts, quotes, true/false, symbol deciphering,
 * scripture completion, and theological meaning.
 */
function buildTenChronicleQuestions(
  dayNumber: number,
  act: ChronicleAct,
  chapter: ChronicleChapter,
  storyTitle: string,
  scriptureRef: string,
  blurb: string,
  characterId: BiblicalCharacterId,
  characterName: string,
  gameStyle: JourneyGameStyle,
  curatedQuestions: ChronicleQuestion[]
): ChronicleQuestion[] {
  const list: ChronicleQuestion[] = [...curatedQuestions];

  const addUnique = (q: ChronicleQuestion) => {
    if (!list.some((existing) => existing.prompt === q.prompt)) {
      list.push(q);
    }
  };

  // Provide rich Act-specific question pool
  switch (act.actIndex) {
    case 1: {
      // Act 1: Genesis & Origins (Days 1–50)
      addUnique({
        prompt: `Which ancient section of Scripture contains the narrative of ${storyTitle}?`,
        speechText: `Trace the sacred canon!`,
        category: 'Canon & Scripture',
        options: ['Old Testament (Torah / Pentateuch)', 'New Testament Epistles', 'The Gospels', 'Apocrypha'],
        answer: 'Old Testament (Torah / Pentateuch)',
        ref: `${scriptureRef}`,
        why: 'Genesis is the opening book of the Torah in the Old Testament.',
      });
      addUnique({
        prompt: `What is the primary spiritual theme revealed in ${storyTitle}?`,
        speechText: `Reflect on God's eternal covenant!`,
        category: 'Spiritual Meaning',
        options: [
          'God’s sovereign creation and covenant faithfulness',
          'Human self-sufficiency and military might',
          'Ancient pagan mythology',
          'Building empires with bronze weapons',
        ],
        answer: 'God’s sovereign creation and covenant faithfulness',
        ref: `${scriptureRef}`,
        why: 'Genesis reveals God’s sovereign power and His unshakeable covenant promises to humanity.',
      });
      addUnique({
        prompt: `True or False: In Genesis, God established an everlasting covenant with His people based on faith.`,
        speechText: `Is it written in the Word of God?`,
        category: 'Bible or Not',
        options: ['True', 'False', 'Only for priests', 'Not mentioned in Genesis'],
        answer: 'True',
        ref: 'Genesis 15:6; 17:7',
        why: 'God established an everlasting covenant with Abraham and his seed through faith.',
      });
      addUnique({
        prompt: `What Hebrew term translates to "In the beginning", serving as the traditional title for Genesis?`,
        speechText: `Sacred language of the scribes!`,
        category: 'Scribe’s Vocabulary',
        options: ['Bereshit', 'Shemot', 'Vayikra', 'Bamidbar'],
        answer: 'Bereshit',
        ref: 'Genesis 1:1',
        why: 'The Hebrew name for Genesis is Bereshit, meaning "In the beginning".',
      });
      addUnique({
        prompt: `Which biblical character is central to this milestone and walked in obedience to God?`,
        speechText: `Identify the covenant pioneer!`,
        category: 'Biblical Figures',
        options: [characterName, 'King Xerxes', 'Pontius Pilate', 'Sanballat'],
        answer: characterName,
        ref: `${scriptureRef}`,
        why: `${characterName} stands as a key figure in this chapter of Genesis history.`,
      });
      addUnique({
        prompt: `What emblem or sign is associated with God’s covenant promise in the early world?`,
        speechText: `A celestial token of peace!`,
        category: 'Signs of Faith',
        options: ['A rainbow set in the clouds', 'A silver battle shield', 'A crown of iron', 'A carved marble sphinx'],
        answer: 'A rainbow set in the clouds',
        ref: 'Genesis 9:13',
        why: 'God placed the rainbow in the clouds as an everlasting sign of peace.',
      });
      addUnique({
        prompt: `How did Abraham respond when God asked him to leave his country and journey to an unknown land?`,
        speechText: `By faith Abraham obeyed when called!`,
        category: 'Patriarchal Faith',
        options: [
          'He departed in faith, not knowing where he was going',
          'He refused to leave his homeland of Ur',
          'He built a fortress in Haran and stayed',
          'He asked for a written treaty from Egypt',
        ],
        answer: 'He departed in faith, not knowing where he was going',
        ref: 'Genesis 12:1-4; Hebrews 11:8',
        why: 'Abraham trusted the divine promise and set out in bold obedience.',
      });
      break;
    }

    case 2: {
      // Act 2: Exodus & Wilderness (Days 51–90)
      addUnique({
        prompt: `In which book of the Bible is the miraculous deliverance of Israel from Egypt recorded?`,
        speechText: `The great departure under God’s outstretched arm!`,
        category: 'The Pentateuch',
        options: ['Book of Exodus', 'Book of Proverbs', 'Book of Revelation', 'Epistle to the Romans'],
        answer: 'Book of Exodus',
        ref: `${scriptureRef}`,
        why: 'Exodus documents the departure from Egypt, Red Sea parting, and giving of the Law.',
      });
      addUnique({
        prompt: `What miraculous provision sustained Israel each morning during forty years in the wilderness?`,
        speechText: `Bread from heaven covering the desert floor!`,
        category: 'Wilderness Miracles',
        options: ['Manna from heaven', 'Barley loaves from Damascus', 'Figs from the oasis', 'Stored grain from Memphis'],
        answer: 'Manna from heaven',
        ref: 'Exodus 16:14-31',
        why: 'God provided daily manna to teach His people that man does not live on bread alone.',
      });
      addUnique({
        prompt: `True or False: At Mount Sinai, God spoke the Ten Commandments and inscribed them upon tablets of stone.`,
        speechText: `Test the sacred account!`,
        category: 'Bible or Not',
        options: ['True', 'False', 'They were written on papyrus only', 'Moses invented them'],
        answer: 'True',
        ref: 'Exodus 20:1-17; 31:18',
        why: 'The tablets were the work of God, and the writing was the writing of God inscribed on stone.',
      });
      addUnique({
        prompt: `What sacred furniture item held the stone tablets of testimony beneath the golden cherubim?`,
        speechText: `The heart of the Tabernacle sanctuary!`,
        category: 'The Tabernacle',
        options: ['The Ark of the Covenant', 'The Table of Showbread', 'The Bronze Altar of Burnt Offering', 'The Golden Lampstand'],
        answer: 'The Ark of the Covenant',
        ref: 'Exodus 25:10-22',
        why: 'The Ark of the Covenant was placed within the Holy of Holies.',
      });
      addUnique({
        prompt: `Who served as the high priest and Moses’ brother, speaking alongside him before Pharaoh?`,
        speechText: `Bearing the sacred breastplate of judgment!`,
        category: 'Priesthood of Israel',
        options: ['Aaron (Ahărōn)', 'Caleb', 'Hur', 'Jethro'],
        answer: 'Aaron (Ahărōn)',
        ref: 'Exodus 4:14; 28:1',
        why: 'Aaron was chosen as the first high priest of Israel.',
      });
      addUnique({
        prompt: `What happened to the waters of the Red Sea when Moses stretched out his hand at God's command?`,
        speechText: `Stand firm and see the salvation of the Lord!`,
        category: 'Deliverance at the Sea',
        options: [
          'The waters were divided, standing as a wall on both sides',
          'A stone bridge rose from the seafloor',
          'Boats appeared from Midian to rescue them',
          'The sea dried completely from north to south',
        ],
        answer: 'The waters were divided, standing as a wall on both sides',
        ref: 'Exodus 14:21-22',
        why: 'The waters were divided and the children of Israel went through the midst of the sea on dry ground.',
      });
      addUnique({
        prompt: `What divine guidance accompanied Israel through the wilderness by day and by night?`,
        speechText: `A celestial beacon in the desert!`,
        category: 'Divine Presence',
        options: [
          'A pillar of cloud by day and a pillar of fire by night',
          'A golden chariot guided by angels',
          'Desert runners carrying torches',
          'A flock of white doves',
        ],
        answer: 'A pillar of cloud by day and a pillar of fire by night',
        ref: 'Exodus 13:21-22',
        why: 'The Lord preceded them by day in a pillar of cloud and by night in a pillar of fire.',
      });
      break;
    }

    case 3: {
      // Act 3: Promised Land, Judges, Ruth (Days 91–130)
      addUnique({
        prompt: `Who was appointed by God to lead Israel across the Jordan River into the Promised Land?`,
        speechText: `Be strong and of good courage!`,
        category: 'Conquest of Canaan',
        options: ['Joshua (Yəhōshūa)', 'Gideon', 'Samson', 'Samuel'],
        answer: 'Joshua (Yəhōshūa)',
        ref: 'Joshua 1:1-9',
        why: 'God commanded Joshua to lead Israel across the Jordan following the death of Moses.',
      });
      addUnique({
        prompt: `What happened on the seventh day of marching around the fortified city of Jericho?`,
        speechText: `Blow the rams’ horns and shout!`,
        category: 'Fall of Jericho',
        options: [
          'The army shouted, horns blew, and the walls collapsed flat',
          'The defenders surrendered without a battle',
          'An earthquake swallowed the entire valley',
          'A fire fell from heaven burning the towers',
        ],
        answer: 'The army shouted, horns blew, and the walls collapsed flat',
        ref: 'Joshua 6:20',
        why: 'When the priests blew the trumpets and the people shouted with a great shout, the wall fell down flat.',
      });
      addUnique({
        prompt: `Which courageous woman served as both judge and prophetess, inspiring victory under a palm tree?`,
        speechText: `Awake, awake, Deborah! Utter a song!`,
        category: 'Judges of Israel',
        options: ['Deborah (Debōrāh)', 'Jael', 'Delilah', 'Peninnah'],
        answer: 'Deborah (Debōrāh)',
        ref: 'Judges 4:4-5',
        why: 'Deborah judged Israel at that time and led the battle against Sisera.',
      });
      addUnique({
        prompt: `With how many warriors did Gideon rout the vast Midianite camp using jars, torches, and horns?`,
        speechText: `The sword of the Lord and of Gideon!`,
        category: 'Gideon’s 300',
        options: ['300 men', '10,000 men', '32,000 men', '1,200 men'],
        answer: '300 men',
        ref: 'Judges 7:7-22',
        why: 'The Lord delivered Midian into Gideon’s hands with only three hundred men.',
      });
      addUnique({
        prompt: `What role did Boaz fulfill for Ruth and Naomi in Bethlehem according to biblical law?`,
        speechText: `A redeemer who protects the vulnerable!`,
        category: 'Story of Ruth',
        options: ['Kinsman-Redeemer (Go’el)', 'High Priest of Shiloh', 'Roman Tribune', 'Chief Scribe of Judea'],
        answer: 'Kinsman-Redeemer (Go’el)',
        ref: 'Ruth 3:9-12; 4:9-10',
        why: 'Boaz acted as kinsman-redeemer, marrying Ruth and becoming ancestor to King David and Christ.',
      });
      addUnique({
        prompt: `True or False: Ruth was born a Moabite but chose the God of Israel as her own God.`,
        speechText: `Thy people shall be my people, and thy God my God!`,
        category: 'Bible or Not',
        options: ['True', 'False', 'She was an Egyptian princess', 'She returned to Moab'],
        answer: 'True',
        ref: 'Ruth 1:16',
        why: 'Ruth’s confession of faith brought her into the royal genealogy of the Messiah.',
      });
      addUnique({
        prompt: `What solemn declaration did Joshua make to all Israel at Shechem before his death?`,
        speechText: `Choose this day whom you will serve!`,
        category: 'Joshua’s Covenant',
        options: [
          'As for me and my house, we will serve the Lord',
          'Return to the wilderness of Sinai',
          'Adopt the deities of the Canaanites',
          'Elect a king from the tribe of Benjamin',
        ],
        answer: 'As for me and my house, we will serve the Lord',
        ref: 'Joshua 24:15',
        why: 'Joshua 24:15 remains one of the greatest covenant declarations of faith in Scripture.',
      });
      break;
    }

    case 4: {
      // Act 4: United Kingdom (Days 131–175)
      addUnique({
        prompt: `Who was the prophet and judge who anointed both King Saul and King David?`,
        speechText: `Speak, Lord, for your servant hears!`,
        category: 'Anointing Kings',
        options: ['Samuel (Shmū’ēl)', 'Nathan', 'Elijah', 'Gad'],
        answer: 'Samuel (Shmū’ēl)',
        ref: '1 Samuel 10:1; 16:13',
        why: 'Samuel anointed Saul and later David as king over Israel.',
      });
      addUnique({
        prompt: `What weapon did young David use to defeat the giant Goliath in the Valley of Elah?`,
        speechText: `I come to you in the name of the Lord of Hosts!`,
        category: 'David & Goliath',
        options: [
          'A sling and smooth stones in the name of the Lord',
          'A royal bronze spear from Saul’s armory',
          'An iron battle chariot',
          'A golden bow from Bethlehem',
        ],
        answer: 'A sling and smooth stones in the name of the Lord',
        ref: '1 Samuel 17:45-50',
        why: 'David felled Goliath with a single stone from his sling, trusting in the Living God.',
      });
      addUnique({
        prompt: `What book of sacred poetry, prayers, and hymns was largely composed by King David?`,
        speechText: `The Lord is my shepherd, I shall not want!`,
        category: 'Psalms of David',
        options: ['Book of Psalms', 'Book of Proverbs', 'Book of Lamentations', 'Song of Songs'],
        answer: 'Book of Psalms',
        ref: 'Psalm 23:1',
        why: 'David authored many of the Psalms expressing worship, repentance, and praise.',
      });
      addUnique({
        prompt: `What did King Solomon ask God for when given the opportunity to request anything?`,
        speechText: `Give Your servant an understanding heart!`,
        category: 'Solomon’s Wisdom',
        options: [
          'Wisdom and an understanding heart to judge the people',
          'Vast wealth, silver, and gold palaces',
          'Victory and destruction of all enemies',
          'Immunity from sickness and long life',
        ],
        answer: 'Wisdom and an understanding heart to judge the people',
        ref: '1 Kings 3:9-12',
        why: 'God granted Solomon unmatched wisdom because he asked for discernment rather than riches.',
      });
      addUnique({
        prompt: `Where did King Solomon build the magnificent Temple for the Lord with cedar and gold?`,
        speechText: `Mount Moriah in the Holy City!`,
        category: 'The Temple',
        options: ['Jerusalem (Mount Zion / Moriah)', 'Hebron', 'Samaria', 'Bethel'],
        answer: 'Jerusalem (Mount Zion / Moriah)',
        ref: '2 Chronicles 3:1',
        why: 'Solomon built the First Temple on Mount Moriah in Jerusalem.',
      });
      addUnique({
        prompt: `Complete the ancient proverb from Proverbs 3:5: "Trust in the Lord with all your heart..."`,
        speechText: `And lean not on your own understanding!`,
        category: 'Solomonic Wisdom',
        options: [
          'and lean not on your own understanding',
          'and accumulate riches for the future',
          'and fear the armies of the nations',
          'and build high towers of stone',
        ],
        answer: 'and lean not on your own understanding',
        ref: 'Proverbs 3:5',
        why: 'Proverbs 3:5 instructs believers to trust God completely rather than relying on human wisdom.',
      });
      addUnique({
        prompt: `True or False: King David brought the Ark of the Covenant into Jerusalem with joyful dancing and music.`,
        speechText: `Leaping and dancing before the Lord!`,
        category: 'Bible or Not',
        options: ['True', 'False', 'The Ark remained in Egypt', 'David hid the Ark in a cave'],
        answer: 'True',
        ref: '2 Samuel 6:14-15',
        why: 'David danced before the Lord with all his might as the Ark entered Jerusalem.',
      });
      break;
    }

    case 5: {
      // Act 5: Divided Kingdom & Prophets (Days 176–220)
      addUnique({
        prompt: `Following the reign of Solomon, into which two kingdoms was the nation divided?`,
        speechText: `A divided realm in need of prophetic truth!`,
        category: 'Divided Kingdom',
        options: [
          'Israel (Northern Kingdom) and Judah (Southern Kingdom)',
          'Egypt and Assyria',
          'Moab and Edom',
          'Syria and Phoenicia',
        ],
        answer: 'Israel (Northern Kingdom) and Judah (Southern Kingdom)',
        ref: '1 Kings 12:16-24',
        why: 'Ten northern tribes formed Israel, while Judah and Benjamin formed the southern kingdom.',
      });
      addUnique({
        prompt: `On which mountain did Elijah challenge the false prophets of Baal to answer with fire?`,
        speechText: `The God who answers by fire, He is God!`,
        category: 'Prophet Elijah',
        options: ['Mount Carmel', 'Mount Sinai', 'Mount Nebo', 'Mount Hermon'],
        answer: 'Mount Carmel',
        ref: '1 Kings 18:19-39',
        why: 'God answered Elijah’s prayer with fire from heaven on Mount Carmel.',
      });
      addUnique({
        prompt: `How did God speak to Elijah when the prophet took refuge in the cave at Mount Horeb?`,
        speechText: `Not in the wind, earthquake, or fire!`,
        category: 'Voice of God',
        options: [
          'In a gentle whisper (still small voice)',
          'In a shattering hurricane',
          'In an erupting earthquake',
          'Through a blinding flash of lightning',
        ],
        answer: 'In a gentle whisper (still small voice)',
        ref: '1 Kings 19:11-13',
        why: 'God revealed Himself to Elijah not in violent forces, but in a still, small voice.',
      });
      addUnique({
        prompt: `What did Elisha ask of Elijah before Elijah was taken up into heaven?`,
        speechText: `A bold request for spiritual inheritance!`,
        category: 'Prophetic Mantle',
        options: ['A double portion of your spirit', 'Your silver walking staff', 'The kingship of Samaria', 'A golden chariot'],
        answer: 'A double portion of your spirit',
        ref: '2 Kings 2:9',
        why: 'Elisha asked to receive a double portion of Elijah’s prophetic spirit.',
      });
      addUnique({
        prompt: `Which prophet attempted to flee to Tarshish but was swallowed by a great fish?`,
        speechText: `Out of the belly of Sheol I cried!`,
        category: 'Prophets of the Lord',
        options: ['Jonah (Yōnāh)', 'Amos', 'Hosea', 'Micah'],
        answer: 'Jonah (Yōnāh)',
        ref: 'Jonah 1:17; 2:1-2',
        why: 'God appointed a great fish to swallow Jonah before sending him to preach to Nineveh.',
      });
      addUnique({
        prompt: `What miraculous event took Elijah up into heaven in 2 Kings 2:11?`,
        speechText: `Chariot of fire and horses of fire!`,
        category: 'Elijah’s Ascension',
        options: [
          'He ascended in a whirlwind with a chariot of fire',
          'He passed away quietly in his bed at Bethel',
          'He sailed across the Great Sea to Rome',
          'He disappeared into the Jordan waters',
        ],
        answer: 'He ascended in a whirlwind with a chariot of fire',
        ref: '2 Kings 2:11',
        why: 'A chariot of fire appeared and Elijah went up by a whirlwind into heaven.',
      });
      addUnique({
        prompt: `True or False: The Syrian military commander Naaman was healed of leprosy by dipping seven times in the Jordan River.`,
        speechText: `Wash and be clean!`,
        category: 'Bible or Not',
        options: ['True', 'False', 'He refused and remained leprous', 'He washed in the Nile'],
        answer: 'True',
        ref: '2 Kings 5:14',
        why: 'Naaman obeyed Elisha’s word and his flesh was restored like that of a little child.',
      });
      break;
    }

    case 6: {
      // Act 6: Major Prophets & Exile (Days 221–260)
      addUnique({
        prompt: `Which prophet beheld the Lord on His throne with seraphim crying: "Holy, holy, holy"?`,
        speechText: `Here am I! Send me!`,
        category: 'Vision of Isaiah',
        options: ['Isaiah (Yəšaʿyāhū)', 'Jeremiah', 'Ezekiel', 'Daniel'],
        answer: 'Isaiah (Yəšaʿyāhū)',
        ref: 'Isaiah 6:1-8',
        why: 'Isaiah received his prophetic commission when beholding the holiness of God.',
      });
      addUnique({
        prompt: `What does the famous prophecy of Isaiah 53 describe concerning the Messiah?`,
        speechText: `He was pierced for our transgressions, crushed for our iniquities!`,
        category: 'Messianic Prophecy',
        options: [
          'The Suffering Servant wounded for our transgressions',
          'A military conqueror of Roman legions',
          'A philosopher king of Athens',
          'An earthly ruler of silver castles',
        ],
        answer: 'The Suffering Servant wounded for our transgressions',
        ref: 'Isaiah 53:5',
        why: 'Isaiah 53 foretells Christ’s substitutionary atonement on the cross.',
      });
      addUnique({
        prompt: `Which prophet is known as the "weeping prophet" who foretold the New Covenant written on human hearts?`,
        speechText: `I will write My law upon their hearts!`,
        category: 'The New Covenant',
        options: ['Jeremiah (Yirməyāhū)', 'Haggai', 'Zechariah', 'Malachi'],
        answer: 'Jeremiah (Yirməyāhū)',
        ref: 'Jeremiah 31:31-34',
        why: 'Jeremiah prophesied the New Covenant where God writes His law directly on believers’ hearts.',
      });
      addUnique({
        prompt: `What did the vision of the valley of dry bones given to Ezekiel in Ezekiel 37 signify?`,
        speechText: `Breath came into them, and they lived and stood on their feet!`,
        category: 'Ezekiel’s Visions',
        options: [
          'God’s power to breathe life and restore the nation of Israel',
          'The destruction of ancient Egyptian armies',
          'The construction of the second temple',
          'A famine in the desert of Babylon',
        ],
        answer: 'God’s power to breathe life and restore the nation of Israel',
        ref: 'Ezekiel 37:1-14',
        why: 'The dry bones coming alive symbolizes God’s spiritual restoration and resurrection power.',
      });
      addUnique({
        prompt: `Who were Daniel’s three companions delivered from King Nebuchadnezzar’s fiery furnace?`,
        speechText: `Four men walking loose in the midst of the fire!`,
        category: 'Faith in Babylon',
        options: [
          'Shadrach, Meshach, and Abednego (Hananiah, Mishael, Azariah)',
          'Ezra, Nehemiah, and Zerubbabel',
          'Haggai, Zechariah, and Malachi',
          'Elihu, Eliphaz, and Bildad',
        ],
        answer: 'Shadrach, Meshach, and Abednego (Hananiah, Mishael, Azariah)',
        ref: 'Daniel 3:19-25',
        why: 'God preserved the three faithful men in the blazing furnace without a hair singed.',
      });
      addUnique({
        prompt: `Why was Daniel cast into the den of lions under King Darius of the Medes and Persians?`,
        speechText: `Faithful prayer three times a day toward Jerusalem!`,
        category: 'Daniel & The Lions',
        options: [
          'He continued praying to the Living God three times a day',
          'He attempted to overthrow the king’s palace',
          'He stole gold from the royal treasury',
          'He refused to speak the Persian language',
        ],
        answer: 'He continued praying to the Living God three times a day',
        ref: 'Daniel 6:10-16',
        why: 'Daniel refused to compromise his devotion to the Lord despite the royal decree.',
      });
      addUnique({
        prompt: `True or False: An angel of God shut the mouths of the lions so that Daniel was found completely unhurt.`,
        speechText: `My God sent His angel and shut the lions’ mouths!`,
        category: 'Bible or Not',
        options: ['True', 'False', 'Daniel used a sword to defend himself', 'The lions had escaped'],
        answer: 'True',
        ref: 'Daniel 6:22',
        why: 'Daniel was found without any injury because he trusted in his God.',
      });
      break;
    }

    case 7: {
      // Act 7: Restoration & Esther (Days 261–280)
      addUnique({
        prompt: `In which Persian capital city did Queen Esther risk her life to plead for the survival of her people?`,
        speechText: `Courage in the royal palace!`,
        category: 'Queen Esther',
        options: ['Susa (Shushan)', 'Babylon', 'Persepolis', 'Ecbatana'],
        answer: 'Susa (Shushan)',
        ref: 'Esther 1:2; 4:14',
        why: 'The events of Esther took place in the citadel of Susa under King Ahasuerus.',
      });
      addUnique({
        prompt: `What famous resolve did Esther express before going into the king’s presence unsummoned?`,
        speechText: `I will go to the king, though it is against the law...`,
        category: 'Esther’s Courage',
        options: [
          'If I perish, I perish',
          'I shall conquer with my royal guard',
          'The king will grant me half his empire',
          'Let us flee across the Euphrates',
        ],
        answer: 'If I perish, I perish',
        ref: 'Esther 4:16',
        why: 'Esther’s courageous words reflect total surrender for the salvation of her people.',
      });
      addUnique({
        prompt: `What joyful Jewish festival was established to celebrate the deliverance documented in Esther?`,
        speechText: `Feasting, joy, and giving gifts to the poor!`,
        category: 'Biblical Feasts',
        options: ['Purim', 'Passover', 'Hanukkah', 'Yom Kippur'],
        answer: 'Purim',
        ref: 'Esther 9:26-28',
        why: 'Purim was instituted to celebrate the preservation of the Jewish people from Haman’s plot.',
      });
      addUnique({
        prompt: `In how many days were the broken walls of Jerusalem rebuilt under the leadership of Nehemiah?`,
        speechText: `Working with a trowel in one hand and a sword in the other!`,
        category: 'Nehemiah’s Mission',
        options: ['52 days', '100 days', '7 years', '40 days'],
        answer: '52 days',
        ref: 'Nehemiah 6:15',
        why: 'The wall was completed in fifty-two days through miraculous divine help and unified labor.',
      });
      addUnique({
        prompt: `Who was the priest and ready scribe who brought the Book of the Law of Moses to read before all the people?`,
        speechText: `Reading from the Law of God distinctly and giving the sense!`,
        category: 'Ezra’s Revival',
        options: ['Ezra (ʿEzrā)', 'Zerubbabel', 'Mordecai', 'Sanballat'],
        answer: 'Ezra (ʿEzrā)',
        ref: 'Nehemiah 8:1-8; Ezra 7:6',
        why: 'Ezra read the Law of Moses to the assembly, sparking national revival.',
      });
      addUnique({
        prompt: `Which Persian monarch issued the decree permitting the exiled Jews to return and rebuild the Temple in Jerusalem?`,
        speechText: `Fulfilling the word of the Lord by the mouth of Jeremiah!`,
        category: 'Decree of Restoration',
        options: ['King Cyrus the Great', 'King Xerxes', 'King Darius III', 'King Nebuchadnezzar'],
        answer: 'King Cyrus the Great',
        ref: 'Ezra 1:1-4',
        why: 'King Cyrus issued the historic decree allowing the Jews to return and rebuild.',
      });
      addUnique({
        prompt: `True or False: Nehemiah served as the royal cupbearer to the Persian king before leading the rebuilding of Jerusalem’s walls.`,
        speechText: `From the Persian palace to the gates of Zion!`,
        category: 'Bible or Not',
        options: ['True', 'False', 'He was a general of Egypt', 'He was a merchant of Tyre'],
        answer: 'True',
        ref: 'Nehemiah 1:11; 2:1',
        why: 'Nehemiah was cupbearer to King Artaxerxes before departing to rebuild the walls.',
      });
      break;
    }

    case 8: {
      // Act 8: Gospels & Ministry of Jesus (Days 281–315)
      addUnique({
        prompt: `In which humble town of Judea was Jesus Christ born, fulfilling ancient prophecy?`,
        speechText: `Away in a manger in the City of David!`,
        category: 'The Nativity',
        options: ['Bethlehem (Beit Leḥem)', 'Nazareth', 'Capernaum', 'Jericho'],
        answer: 'Bethlehem (Beit Leḥem)',
        ref: 'Matthew 2:1; Luke 2:4',
        why: 'Jesus was born in Bethlehem, fulfilling the prophecy of Micah 5:2.',
      });
      addUnique({
        prompt: `Where was Jesus baptized by John the Baptist as the heavens opened and the Spirit descended as a dove?`,
        speechText: `This is My beloved Son, in whom I am well pleased!`,
        category: 'Baptism of the Lord',
        options: ['The Jordan River', 'The Sea of Galilee', 'The Pool of Bethesda', 'The Mediterranean Sea'],
        answer: 'The Jordan River',
        ref: 'Matthew 3:13-17',
        why: 'Jesus was baptized by John in the Jordan River before beginning His public ministry.',
      });
      addUnique({
        prompt: `What famous discourse by Jesus begins with the Beatitudes in Matthew 5?`,
        speechText: `Blessed are the poor in spirit, for theirs is the kingdom of heaven!`,
        category: 'Teachings of Christ',
        options: ['Sermon on the Mount', 'Olivet Discourse', 'Upper Room Discourse', 'Temple Court Sermon'],
        answer: 'Sermon on the Mount',
        ref: 'Matthew 5:1-12',
        why: 'The Sermon on the Mount contains the foundational ethical and kingdom teachings of Jesus.',
      });
      addUnique({
        prompt: `With what small boy's lunch did Jesus miraculously feed a crowd of over five thousand men besides women and children?`,
        speechText: `Blessed, broken, and multiplied with twelve baskets left over!`,
        category: 'Miracles of Jesus',
        options: [
          'Five barley loaves and two small fish',
          'Seven honey cakes and dried figs',
          'Three loaves of wheat and oil',
          'Ten fish and unleavened wafers',
        ],
        answer: 'Five barley loaves and two small fish',
        ref: 'John 6:9-13',
        why: 'Jesus multiplied the five barley loaves and two fish to feed the multitudes.',
      });
      addUnique({
        prompt: `In the Parable of the Prodigal Son, what did the loving father do when he saw his returning son afar off?`,
        speechText: `Filled with compassion, he ran and embraced him!`,
        category: 'Parables of Grace',
        options: [
          'He ran, threw his arms around him, and kissed him',
          'He shut the gates of the estate and turned him away',
          'He demanded seventy days of hard labor first',
          'He required him to pay back the lost inheritance',
        ],
        answer: 'He ran, threw his arms around him, and kissed him',
        ref: 'Luke 15:20',
        why: 'The father’s loving embrace illustrates God’s boundless mercy toward every repenting soul.',
      });
      addUnique({
        prompt: `Whom did Jesus raise from the dead in Bethany after he had been in the tomb four days?`,
        speechText: `Lazarus, come forth!`,
        category: 'Resurrection Power',
        options: ['Lazarus', 'Bartimaeus', 'Jairus', 'Nicodemus'],
        answer: 'Lazarus',
        ref: 'John 11:43-44',
        why: 'Jesus raised Lazarus from the grave, declaring: "I am the resurrection and the life."',
      });
      addUnique({
        prompt: `True or False: Jesus calmed a raging tempest on the Sea of Galilee by saying: "Peace, be still!"`,
        speechText: `Even the winds and the waves obey Him!`,
        category: 'Bible or Not',
        options: ['True', 'False', 'The boat sank and they swam', 'The disciples built a sail'],
        answer: 'True',
        ref: 'Mark 4:39',
        why: 'Jesus rebuked the wind and sea, and there was an immediate, great calm.',
      });
      break;
    }

    case 9: {
      // Act 9: Passion, Cross & Victory (Days 316–330)
      addUnique({
        prompt: `On what animal did Jesus ride into Jerusalem during His Triumphal Entry on Palm Sunday?`,
        speechText: `Hosanna! Blessed is He who comes in the name of the Lord!`,
        category: 'Triumphal Entry',
        options: ['A colt of a donkey', 'A white war stallion', 'A golden royal carriage', 'A camel from the desert'],
        answer: 'A colt of a donkey',
        ref: 'Zechariah 9:9; Matthew 21:5',
        why: 'Jesus entered Jerusalem riding on a donkey’s colt, fulfilling Zechariah 9:9.',
      });
      addUnique({
        prompt: `What sacrament did Jesus institute with bread and wine at the Last Supper?`,
        speechText: `This cup is the new covenant in My blood, shed for you!`,
        category: 'The Last Supper',
        options: ['The Lord’s Supper (Holy Communion)', 'The Feast of Booths', 'The Nazarite Vow', 'The Passover of Hezekiah'],
        answer: 'The Lord’s Supper (Holy Communion)',
        ref: 'Luke 22:19-20',
        why: 'Jesus established Holy Communion as an enduring memorial of His body and blood.',
      });
      addUnique({
        prompt: `In which garden on the Mount of Olives did Jesus pray in agony: "Not My will, but Yours be done"?`,
        speechText: `Father, if You are willing, remove this cup from Me!`,
        category: 'Gethsemane Prayer',
        options: ['Garden of Gethsemane', 'Garden of Eden', 'Garden of Uzza', 'Palace Garden of Herod'],
        answer: 'Garden of Gethsemane',
        ref: 'Luke 22:42',
        why: 'In Gethsemane, Jesus surrendered His human will to the Father’s redemptive plan.',
      });
      addUnique({
        prompt: `What were Jesus’ final triumphant words on the cross before yielding up His spirit?`,
        speechText: `The eternal debt of sin is paid in full!`,
        category: 'Calvary’s Triumph',
        options: ['It is finished (Tetelestai)', 'The kingdom is delayed', 'Remember My family', 'Call the Roman centurion'],
        answer: 'It is finished (Tetelestai)',
        ref: 'John 19:30',
        why: '"Tetelestai" signifies that the work of redemption is completely accomplished.',
      });
      addUnique({
        prompt: `On which day of the week did Jesus triumphantly rise from the dead?`,
        speechText: `He is not here; He has risen!`,
        category: 'The Resurrection',
        options: [
          'The first day of the week (Sunday / Lord’s Day)',
          'The seventh day (Sabbath)',
          'The fourth day (Wednesday)',
          'The sixth day (Preparation Day)',
        ],
        answer: 'The first day of the week (Sunday / Lord’s Day)',
        ref: 'Matthew 28:1; Luke 24:1',
        why: 'Jesus rose on the first day of the week, establishing the dawn of the New Covenant.',
      });
      addUnique({
        prompt: `What message did the risen Jesus commission His disciples with on the mountain in Galilee?`,
        speechText: `All authority in heaven and on earth has been given to Me!`,
        category: 'The Great Commission',
        options: [
          'Go and make disciples of all nations, baptizing and teaching them',
          'Remain permanently inside Jerusalem and do not preach',
          'Build an earthly military empire in Rome',
          'Keep the gospel secret for future generations',
        ],
        answer: 'Go and make disciples of all nations, baptizing and teaching them',
        ref: 'Matthew 28:19-20',
        why: 'The Great Commission instructs believers to carry the gospel to every nation on earth.',
      });
      addUnique({
        prompt: `True or False: The heavy stone was rolled away from the entrance of the tomb by an angel of the Lord.`,
        speechText: `Behold, there was a great earthquake!`,
        category: 'Bible or Not',
        options: ['True', 'False', 'Roman soldiers rolled it away', 'The disciples broke it open'],
        answer: 'True',
        ref: 'Matthew 28:2',
        why: 'An angel of the Lord descended from heaven, rolled back the stone, and sat on it.',
      });
      break;
    }

    case 10: {
      // Act 10: Acts & Early Church (Days 331–345)
      addUnique({
        prompt: `On which holy festival day was the Holy Spirit poured out with the sound of a rushing wind?`,
        speechText: `Filled with the Holy Spirit and speaking with other tongues!`,
        category: 'Day of Pentecost',
        options: ['Day of Pentecost (Shavuot)', 'Feast of Tabernacles', 'Day of Atonement', 'Feast of Dedication'],
        answer: 'Day of Pentecost (Shavuot)',
        ref: 'Acts 2:1-4',
        why: 'The Holy Spirit fell upon the disciples on the Day of Pentecost.',
      });
      addUnique({
        prompt: `How many people accepted the Word and were baptized following Peter’s bold Pentecost sermon?`,
        speechText: `Repent and be baptized, every one of you!`,
        category: 'Early Church Growth',
        options: ['About three thousand souls', 'One hundred and twenty', 'Five hundred brothers', 'Ten thousand leaders'],
        answer: 'About three thousand souls',
        ref: 'Acts 2:41',
        why: 'About 3,000 people were added to the church on the Day of Pentecost.',
      });
      addUnique({
        prompt: `Who was the faithful deacon full of faith and the Holy Spirit who became the first Christian martyr?`,
        speechText: `Lord Jesus, receive my spirit!`,
        category: 'Faithful Witness',
        options: ['Stephen (Stephanos)', 'Philip', 'Barnabas', 'Silas'],
        answer: 'Stephen (Stephanos)',
        ref: 'Acts 7:59-60',
        why: 'Stephen gave his life as the first martyr of the early church while forgiving his persecutors.',
      });
      addUnique({
        prompt: `On which road was Saul stopped by a blinding heavenly light and transformed into Paul the Apostle?`,
        speechText: `Saul, Saul, why are you persecuting Me?`,
        category: 'Conversion of Paul',
        options: ['Road to Damascus', 'Road to Jericho', 'Road to Emmaus', 'Way of the Sea'],
        answer: 'Road to Damascus',
        ref: 'Acts 9:3-6',
        why: 'Jesus appeared directly to Saul on the road to Damascus, commissioning him as apostle.',
      });
      addUnique({
        prompt: `In which city were the followers of Jesus first called "Christians"?`,
        speechText: `A diverse hub of vibrant discipleship!`,
        category: 'The Early Church',
        options: ['Antioch', 'Jerusalem', 'Rome', 'Alexandria'],
        answer: 'Antioch',
        ref: 'Acts 11:26',
        why: 'The disciples were first called Christians in Antioch as the gospel expanded to the Gentiles.',
      });
      addUnique({
        prompt: `To which royal court official from Africa reading Isaiah did Philip explain the gospel and baptize?`,
        speechText: `See, here is water! What hinders me from being baptized?`,
        category: 'Philip’s Ministry',
        options: [
          'The Ethiopian Eunuch (treasurer to Candace)',
          'The Governor of Crete',
          'The Centurion of Capernaum',
          'The Scribe of Damascus',
        ],
        answer: 'The Ethiopian Eunuch (treasurer to Candace)',
        ref: 'Acts 8:27-38',
        why: 'Philip guided the Ethiopian official to faith in Jesus through the prophecy of Isaiah 53.',
      });
      addUnique({
        prompt: `True or False: In Joppa, Peter saw a vision of heaven opening with a great sheet teaching that no human is unclean in God's eyes.`,
        speechText: `What God has cleansed, do not call common!`,
        category: 'Bible or Not',
        options: ['True', 'False', 'The vision was shown to Paul', 'Peter rejected the vision'],
        answer: 'True',
        ref: 'Acts 10:9-15',
        why: 'Peter’s vision opened the door for Cornelius and the Gentile nations to receive the Holy Spirit.',
      });
      break;
    }

    case 11: {
      // Act 11: Epistles & Apostles' Letters (Days 346–357)
      addUnique({
        prompt: `According to Romans 8:31, what unshakeable truth encourages all believers in trials?`,
        speechText: `If God is for us, who can be against us?`,
        category: 'Epistle to the Romans',
        options: [
          'If God is for us, who can be against us?',
          'Trials will vanish with wealth',
          'Human philosophy will protect us',
          'Rome will grant us favor',
        ],
        answer: 'If God is for us, who can be against us?',
        ref: 'Romans 8:31',
        why: 'Romans 8 affirms that nothing can separate believers from God’s love.',
      });
      addUnique({
        prompt: `In 1 Corinthians 13, which three theological virtues remain, with love being the greatest?`,
        speechText: `Now abide faith, hope, love, these three; but the greatest of these is love!`,
        category: 'The Love Chapter',
        options: ['Faith, Hope, and Love', 'Power, Wealth, and Fame', 'Courage, Honor, and Zeal', 'Wisdom, Strength, and Speed'],
        answer: 'Faith, Hope, and Love',
        ref: '1 Corinthians 13:13',
        why: 'Paul identifies faith, hope, and love as enduring virtues, with love being supreme.',
      });
      addUnique({
        prompt: `According to Ephesians 2:8-9, how are believers saved?`,
        speechText: `Not of works, lest anyone should boast!`,
        category: 'Grace & Faith',
        options: [
          'By grace through faith, as the gift of God',
          'By performing fifty sacrificial rituals',
          'By keeping cultural legalisms perfectly',
          'By royal family heritage',
        ],
        answer: 'By grace through faith, as the gift of God',
        ref: 'Ephesians 2:8-9',
        why: 'Salvation is a free gift of God’s grace received through faith in Christ.',
      });
      addUnique({
        prompt: `What spiritual weapon in the Armor of God (Ephesians 6) is identified as the "Sword of the Spirit"?`,
        speechText: `Take the helmet of salvation, and the sword of the Spirit!`,
        category: 'Armor of God',
        options: ['The Word of God', 'Good intentions', 'An iron spear', 'Golden shields'],
        answer: 'The Word of God',
        ref: 'Ephesians 6:17',
        why: 'Ephesians 6:17 specifies that the Sword of the Spirit is the Word of God.',
      });
      addUnique({
        prompt: `Which celebrated chapter in the Epistle to the Hebrews is honored as the "Hall of Faith"?`,
        speechText: `Now faith is the substance of things hoped for, evidence of things not seen!`,
        category: 'Hall of Faith',
        options: ['Hebrews 11', 'Hebrews 1', 'Hebrews 7', 'Hebrews 13'],
        answer: 'Hebrews 11',
        ref: 'Hebrews 11:1',
        why: 'Hebrews 11 recounts the heroes of faith from Abel, Enoch, and Noah to Abraham and Moses.',
      });
      addUnique({
        prompt: `What does the Apostle James declare in James 2:26 regarding faith that produces no loving deeds?`,
        speechText: `Show me your faith without your works, and I will show you my faith by my works!`,
        category: 'Epistle of James',
        options: [
          'Faith without works is dead',
          'Faith without works is acceptable',
          'Faith requires no visible fruit',
          'Works alone save without faith',
        ],
        answer: 'Faith without works is dead',
        ref: 'James 2:26',
        why: 'Genuine living faith naturally bears the fruit of love and compassion.',
      });
      addUnique({
        prompt: `True or False: In Philippians 4:13, Paul wrote from prison: "I can do all things through Christ who strengthens me."`,
        speechText: `Rejoice in the Lord always! Again I will say, rejoice!`,
        category: 'Bible or Not',
        options: ['True', 'False', 'Paul wrote this from Athens', 'He said only kings have strength'],
        answer: 'True',
        ref: 'Philippians 4:13',
        why: 'Paul found contentment and strength in Christ even while imprisoned in Rome.',
      });
      break;
    }

    case 12:
    default: {
      // Act 12: Revelation & New Creation (Days 358–365)
      addUnique({
        prompt: `On which island was the Apostle John in exile when he received the Revelation of Jesus Christ?`,
        speechText: `I, John, was on the island called Patmos for the word of God!`,
        category: 'The Apocalypse',
        options: ['Isle of Patmos', 'Isle of Crete', 'Isle of Malta', 'Isle of Cyprus'],
        answer: 'Isle of Patmos',
        ref: 'Revelation 1:9',
        why: 'John was exiled on Patmos when Jesus revealed the visions of Revelation.',
      });
      addUnique({
        prompt: `How many historical churches in Asia Minor received individual messages from Jesus in Revelation 2–3?`,
        speechText: `He who has an ear, let him hear what the Spirit says to the churches!`,
        category: 'Seven Churches',
        options: ['Seven Churches', 'Twelve Churches', 'Three Churches', 'Forty Churches'],
        answer: 'Seven Churches',
        ref: 'Revelation 1:11; 2–3',
        why: 'Jesus sent letters to the seven churches: Ephesus, Smyrna, Pergamum, Thyatira, Sardis, Philadelphia, Laodicea.',
      });
      addUnique({
        prompt: `Who is the only One declared worthy to open the scroll with seven seals in the heavenly throne room?`,
        speechText: `Worthy is the Lamb who was slain to receive power and wisdom!`,
        category: 'The Heavenly Throne',
        options: [
          'The Lion of the tribe of Judah, the Lamb that was slain (Jesus Christ)',
          'The Archangel Gabriel',
          'Moses the Lawgiver',
          'The Elders of Jerusalem',
        ],
        answer: 'The Lion of the tribe of Judah, the Lamb that was slain (Jesus Christ)',
        ref: 'Revelation 5:5-9',
        why: 'Jesus Christ alone has triumphed to open the scroll and its seven seals.',
      });
      addUnique({
        prompt: `What holy city descends out of heaven from God prepared as a bride adorned for her husband?`,
        speechText: `The New Jerusalem shining with the glory of God!`,
        category: 'The New Jerusalem',
        options: ['The New Jerusalem (Holy City)', 'The Citadel of Babylon', 'The Palace of Tyre', 'Ancient Alexandria'],
        answer: 'The New Jerusalem (Holy City)',
        ref: 'Revelation 21:2-10',
        why: 'John beheld the New Jerusalem descending from heaven as the dwelling place of God with humanity.',
      });
      addUnique({
        prompt: `What comforting promise does God proclaim from His throne in Revelation 21:4?`,
        speechText: `He will wipe away every tear from their eyes!`,
        category: 'Eternal Hope',
        options: [
          'There shall be no more death, sorrow, crying, or pain',
          'Wars will resume every millennium',
          'Only earthly kings may enter the gates',
          'The old earth will remain corrupted',
        ],
        answer: 'There shall be no more death, sorrow, crying, or pain',
        ref: 'Revelation 21:4',
        why: 'In the New Creation, death and suffering are banished forever.',
      });
      addUnique({
        prompt: `What river flows clear as crystal from the throne of God and of the Lamb?`,
        speechText: `Water of life giving refreshment to all!`,
        category: 'River of Life',
        options: ['River of the Water of Life', 'The Nile River', 'The Euphrates River', 'The Jordan River'],
        answer: 'River of the Water of Life',
        ref: 'Revelation 22:1',
        why: 'The River of the Water of Life flows from the throne down the middle of the city.',
      });
      addUnique({
        prompt: `What stands on either side of the river, bearing twelve crops of fruit with leaves for the healing of the nations?`,
        speechText: `Restored access to the eternal garden!`,
        category: 'Tree of Life',
        options: ['The Tree of Life', 'A golden watchtower', 'The bronze serpent', 'A stone obelisk'],
        answer: 'The Tree of Life',
        ref: 'Revelation 22:2',
        why: 'The Tree of Life, first seen in Eden, is restored in the New Jerusalem.',
      });
      addUnique({
        prompt: `What is the closing promise and response in Revelation 22:20 that concludes the entire Bible?`,
        speechText: `Amen! Even so, come, Lord Jesus!`,
        category: 'Closing of the Canon',
        options: [
          'He says: "Yes, I am coming soon." Amen. Come, Lord Jesus!',
          'Seal this book for ten thousand years in silence',
          'Depart back to your lands and build high walls',
          'Only angels may read these prophecies',
        ],
        answer: 'He says: "Yes, I am coming soon." Amen. Come, Lord Jesus!',
        ref: 'Revelation 22:20',
        why: 'The canon of Scripture concludes with the joyous promise of Christ’s return.',
      });
      break;
    }
  }

  // Enrich with diverse game styles: Who Said That, Bible or Not, Four Signs, Scribe's Tiles

  // 1. Who Said That generator
  const quotesByAct: Record<number, { quote: string; speaker: string; decoys: string[]; ref: string }> = {
    1: { quote: 'Let there be light!', speaker: 'God (The Creator)', decoys: ['Adam', 'Noah', 'Abraham'], ref: 'Genesis 1:3' },
    2: { quote: 'The Lord will fight for you; you need only to be still.', speaker: 'Moses', decoys: ['Aaron', 'Pharaoh', 'Joshua'], ref: 'Exodus 14:14' },
    3: { quote: 'As for me and my household, we will serve the Lord.', speaker: 'Joshua', decoys: ['Gideon', 'Samson', 'Caleb'], ref: 'Joshua 24:15' },
    4: { quote: 'People look at outward appearance, but the Lord looks at the heart.', speaker: 'The Lord to Samuel', decoys: ['King Saul', 'Jesse', 'Eli'], ref: '1 Samuel 16:7' },
    5: { quote: 'Trust in the Lord with all your heart and lean not on your own understanding.', speaker: 'Solomon (Proverbs)', decoys: ['David', 'Rehoboam', 'Job'], ref: 'Proverbs 3:5' },
    6: { quote: 'The God who answers by fire, He is God!', speaker: 'Elijah the Prophet', decoys: ['King Ahab', 'Jezebel', 'Elisha'], ref: '1 Kings 18:24' },
    7: { quote: 'For I know the plans I have for you, plans to give you hope and a future.', speaker: 'Jeremiah (Word of the Lord)', decoys: ['Baruch', 'Nebuchadnezzar', 'Zedekiah'], ref: 'Jeremiah 29:11' },
    8: { quote: 'Do not be afraid, Mary; you have found favor with God.', speaker: 'Angel Gabriel', decoys: ['Zechariah', 'Joseph', 'Simeon'], ref: 'Luke 1:30' },
    9: { quote: 'Blessed are the peacemakers, for they shall be called children of God.', speaker: 'Jesus Christ', decoys: ['John the Baptist', 'Peter', 'Nicodemus'], ref: 'Matthew 5:9' },
    10: { quote: 'Father, forgive them, for they know not what they do.', speaker: 'Jesus Christ upon the Cross', decoys: ['Centurion', 'Joseph of Arimathea', 'John'], ref: 'Luke 23:34' },
    11: { quote: 'I can do all things through Christ who strengthens me.', speaker: 'Apostle Paul', decoys: ['Barnabas', 'Silas', 'Timothy'], ref: 'Philippians 4:13' },
    12: { quote: 'I am the Alpha and the Omega, the First and the Last.', speaker: 'Jesus Christ (The Risen King)', decoys: ['Apostle John', 'Archangel Michael', 'The 24 Elders'], ref: 'Revelation 22:13' },
  };

  const whoSaidItem = quotesByAct[act.actIndex] || quotesByAct[1];
  addUnique({
    prompt: `Who Said That? Who spoke these words in ${chapter.title}?`,
    speechText: `"${whoSaidItem.quote}"`,
    category: 'Who Said That?',
    questionType: 'who-said',
    options: [whoSaidItem.speaker, ...whoSaidItem.decoys].sort(() => 0.5 - Math.random()),
    answer: whoSaidItem.speaker,
    ref: whoSaidItem.ref,
    why: `${whoSaidItem.speaker} proclaimed this in ${whoSaidItem.ref}.`,
  });

  // 2. Bible or Not generator
  const mythPairs = [
    { quote: 'God helps those who help themselves.', isBible: false, ref: 'Popular cultural idiom (NOT in Scripture)', why: 'Scripture teaches that God helps the helpless who trust in Him (Romans 5:6).' },
    { quote: 'The love of money is a root of all kinds of evil.', isBible: true, ref: '1 Timothy 6:10', why: 'Often misquoted as "money is the root", 1 Timothy 6:10 specifies the *love* of money is the root of evil.' },
    { quote: 'Pride goes before destruction, a haughty spirit before a fall.', isBible: true, ref: 'Proverbs 16:18', why: 'Proverbs 16:18 warns against arrogance.' },
    { quote: 'Cleanliness is next to godliness.', isBible: false, ref: 'Cultural quote from John Wesley in 1778', why: 'This phrase is from an 18th-century sermon by John Wesley, not Scripture!' },
    { quote: 'God will not give you more than you can handle.', isBible: false, ref: 'Common misinterpretation of 1 Corinthians 10:13', why: 'Scripture says God will not let you be *tempted* beyond what you can bear, not that life won’t exceed your human strength.' },
    { quote: 'The joy of the Lord is your strength.', isBible: true, ref: 'Nehemiah 8:10', why: 'Proclaimed by Nehemiah and Ezra in Nehemiah 8:10.' },
    { quote: 'This too shall pass.', isBible: false, ref: 'Ancient Persian adage, not in the Bible', why: 'While a popular comforting saying, "this too shall pass" appears nowhere in Scripture.' },
    { quote: 'I am fearfully and wonderfully made.', isBible: true, ref: 'Psalm 139:14', why: 'King David declares this sacred truth in Psalm 139:14.' },
  ];

  const pick1 = mythPairs[(dayNumber * 2) % mythPairs.length];
  addUnique({
    prompt: 'Bible or Not? Is this quote actually found in the Holy Bible?',
    speechText: `"${pick1.quote}"`,
    category: 'Bible or Not',
    questionType: 'bible-or-not',
    options: ['In the Bible', 'Not in the Bible'],
    answer: pick1.isBible ? 'In the Bible' : 'Not in the Bible',
    ref: pick1.ref,
    why: pick1.why,
  });

  const pick2 = mythPairs[(dayNumber * 2 + 1) % mythPairs.length];
  addUnique({
    prompt: 'Bible or Not? Is this phrase written in the Word of God?',
    speechText: `"${pick2.quote}"`,
    category: 'Bible or Not',
    questionType: 'bible-or-not',
    options: ['In the Bible', 'Not in the Bible'],
    answer: pick2.isBible ? 'In the Bible' : 'Not in the Bible',
    ref: pick2.ref,
    why: pick2.why,
  });

  // 3. Four Signs generator
  const signsByAct: Record<number, { clues: string[]; answer: string; distractors: string[]; ref: string }> = {
    1: { clues: ['earth', 'tree', 'sun', 'star'], answer: 'The Creation of Eden', distractors: ['The Tower of Babel', 'The Great Flood', 'The Golden Altar'], ref: 'Genesis 1–2' },
    2: { clues: ['fire', 'sand', 'water', 'scroll'], answer: 'The Exodus & Sinai Covenant', distractors: ['The Walls of Jericho', 'Solomon’s Temple', 'The Exile in Babylon'], ref: 'Exodus 19–20' },
    3: { clues: ['horn', 'wall', 'sword', 'shield'], answer: 'The Battle of Jericho', distractors: ['David & Goliath', 'Gideon’s Fleece', 'Samson in Gaza'], ref: 'Joshua 6' },
    4: { clues: ['crown', 'stone', 'harp', 'shepherd'], answer: 'David Anointed King of Israel', distractors: ['King Saul', 'Absalom', 'Jonathan'], ref: '1 Samuel 16–17' },
    5: { clues: ['temple', 'crown', 'scroll', 'wheat'], answer: 'Solomon’s Temple & Wisdom', distractors: ['The Tabernacle', 'Nehemiah’s Wall', 'Herod’s Court'], ref: '1 Kings 6–8' },
    6: { clues: ['fire', 'raven', 'cloud', 'mountain'], answer: 'Elijah & The Fire on Mount Carmel', distractors: ['Elisha & Naaman', 'Jonah at Nineveh', 'Isaiah’s Vision'], ref: '1 Kings 18' },
    7: { clues: ['scroll', 'chain', 'wall', 'clay'], answer: 'Jeremiah & The Babylonian Exile', distractors: ['The Exodus', 'The Maccabees', 'The Conquest'], ref: 'Jeremiah 25–29' },
    8: { clues: ['star', 'manger', 'shepherd', 'dove'], answer: 'The Nativity of Jesus Christ', distractors: ['The Wedding at Cana', 'Feeding of 5000', 'Transfiguration'], ref: 'Luke 2:1-20' },
    9: { clues: ['bread', 'fish', 'wave', 'light'], answer: 'The Kingdom Miracles of Jesus', distractors: ['Wilderness Temptation', 'Trial before Pilate', 'Paul’s Shipwreck'], ref: 'Matthew 14' },
    10: { clues: ['cross', 'cup', 'stone', 'sunrise'], answer: 'The Resurrection of Jesus Christ', distractors: ['Burial of Moses', 'Stoning of Stephen', 'Peter’s Vision'], ref: 'Matthew 28:1-10' },
    11: { clues: ['ship', 'chain', 'quill', 'torch'], answer: 'Paul’s Apostolic Missionary Journeys', distractors: ['Pentecost Fire', 'Philip in Samaria', 'John on Patmos'], ref: 'Acts 13–28' },
    12: { clues: ['crown', 'throne', 'scroll', 'river'], answer: 'The New Jerusalem & River of Life', distractors: ['The Tower of Babel', 'Babylon Citadel', 'Solomon Palace'], ref: 'Revelation 21–22' },
  };

  const sign = signsByAct[act.actIndex] || signsByAct[1];
  addUnique({
    prompt: `Four Signs: What sacred event in ${chapter.title} do these four symbols reveal?`,
    speechText: 'Decipher the four prophetic clues!',
    category: 'Four Signs',
    questionType: 'four-signs',
    fourSignsClues: sign.clues,
    options: [sign.answer, ...sign.distractors].sort(() => 0.5 - Math.random()),
    answer: sign.answer,
    ref: sign.ref,
    why: `The four signs signify ${sign.answer} in ${sign.ref}.`,
  });

  // 4. Scribe's Tiles generator
  const wordsByAct: Record<number, { word: string; clue: string; distractors: string[]; ref: string }> = {
    1: { word: 'COVENANT', clue: 'God’s solemn, eternal promise pledged to humanity', distractors: ['KINGDOM', 'OFFERING', 'BLESSING'], ref: 'Genesis 9:11; 15:18' },
    2: { word: 'PASSOVER', clue: 'The feast celebrating deliverance under the blood of the lamb', distractors: ['TABERNACLE', 'PENTECOST', 'SABBATH'], ref: 'Exodus 12:11' },
    3: { word: 'JOSHUA', clue: 'The courageous commander who led Israel across the Jordan', distractors: ['GIDEON', 'SAMUEL', 'CALEB'], ref: 'Joshua 1:1' },
    4: { word: 'SHEPHERD', clue: 'David’s early calling and sacred Psalm 23 title: "The Lord is my..."', distractors: ['WARRIOR', 'PROPHET', 'MONARCH'], ref: 'Psalm 23:1' },
    5: { word: 'WISDOM', clue: 'The supreme gift Solomon asked of God to govern with justice', distractors: ['HONOR', 'VICTORY', 'WEALTH'], ref: '1 Kings 3:9' },
    6: { word: 'PROPHET', clue: 'A consecrated messenger who proclaims the living word of God', distractors: ['SCRIBE', 'PRIEST', 'HERALD'], ref: '1 Kings 18:22' },
    7: { word: 'REMNANT', clue: 'The faithful believers preserved through exile to rebuild', distractors: ['NATION', 'PEOPLE', 'TRIBE'], ref: 'Isaiah 10:20' },
    8: { word: 'MESSIAH', clue: 'The Anointed Savior promised throughout the ancient prophets', distractors: ['TEACHER', 'DELIVERER', 'COUNSELOR'], ref: 'John 1:41' },
    9: { word: 'BEATITUDE', clue: 'The kingdom declarations of blessedness spoken on the mount', distractors: ['PARABLE', 'MIRACLE', 'COMMAND'], ref: 'Matthew 5:3' },
    10: { word: 'RESURRECTION', clue: 'Christ’s triumph over the grave on the third day at dawn', distractors: ['ASCENSION', 'CRUCIFIXION', 'SALVATION'], ref: '1 Corinthians 15:20' },
    11: { word: 'GRACE', clue: 'God’s unmerited gift of love and redemption through faith', distractors: ['FAITH', 'MERCY', 'PEACE'], ref: 'Ephesians 2:8' },
    12: { word: 'SHALOM', clue: 'The holy fullness of divine peace and harmony in the New Creation', distractors: ['VICTORY', 'MAJESTY', 'GLORY'], ref: 'Revelation 21:3' },
  };

  const scribeWord = wordsByAct[act.actIndex] || wordsByAct[1];
  addUnique({
    prompt: `Scribe’s Tiles: Identify the sacred ${scribeWord.word.length}-letter word from the clue:`,
    speechText: `"${scribeWord.clue}"`,
    category: "Scribe's Tiles",
    questionType: 'scribes-tiles',
    wordLength: scribeWord.word.length,
    options: [scribeWord.word, ...scribeWord.distractors].sort(() => 0.5 - Math.random()),
    answer: scribeWord.word,
    ref: scribeWord.ref,
    why: `${scribeWord.word} (${scribeWord.word.length} letters): ${scribeWord.clue}.`,
  });

  // Ensure list has strictly at least 10 questions for every single day
  let fillerIdx = 1;
  while (list.length < 10) {
    const qNum = list.length + 1;
    list.push({
      prompt: `Key Insight #${qNum} for ${storyTitle}: What does ${scriptureRef} teach believers?`,
      speechText: `Reflect upon ${chapter.title}!`,
      category: 'Scripture Understanding',
      questionType: 'trivia',
      options: [
        `God’s enduring covenant truth in ${chapter.title}`,
        `Relying on human strength alone`,
        `Trusting in worldly wealth`,
        `Ignoring the counsel of God`,
      ],
      answer: `God’s enduring covenant truth in ${chapter.title}`,
      ref: scriptureRef,
      why: `Scripture in ${scriptureRef} reveals God’s faithful providence and guidance.`,
    });
    fillerIdx++;
  }

  // Tag all questions with an appropriate questionType if missing
  return list.map((q) => {
    if (q.questionType) return q;
    const p = q.prompt.toLowerCase();
    const c = q.category.toLowerCase();
    if (p.includes('who said') || p.includes('who spoke') || c.includes('voice') || c.includes('speaker')) {
      return { ...q, questionType: 'who-said' as const };
    }
    if (p.includes('true or false') || p.includes('bible or not') || c.includes('bible or not')) {
      return {
        ...q,
        questionType: 'bible-or-not' as const,
        options: ['In the Bible', 'Not in the Bible'],
        answer: q.answer === 'True' ? 'In the Bible' : q.answer === 'False' ? 'Not in the Bible' : q.answer,
      };
    }
    if (q.fourSignsClues && q.fourSignsClues.length >= 4) {
      return { ...q, questionType: 'four-signs' as const };
    }
    if (c.includes('scribe') || p.includes('letters') || p.includes('vocabulary') || q.wordLength) {
      return { ...q, questionType: 'scribes-tiles' as const, wordLength: q.wordLength || q.answer.length };
    }
    return { ...q, questionType: 'trivia' as const };
  });
}

/**
 * Deterministic procedural generator for all 365 Days across the 12 Acts.
 * Combines curated seed anchors with structured chronological content
 * spanning Genesis through Revelation.
 */
function buildFullChronicle(): ChronicleDay[] {
  const days: ChronicleDay[] = [];

  for (let d = 1; d <= 365; d++) {
    // 1. Find the parent Act
    const act = CHRONICLE_ACTS.find((a) => d >= a.startDay && d <= a.endDay) || CHRONICLE_ACTS[0];

    // 2. Find the parent Chapter
    const chapter =
      act.chapters.find((c) => d >= c.startDay && d <= c.endDay) || act.chapters[0];

    // 3. Check for handcrafted seed milestone
    if (SEED_MILESTONES[d]) {
      const seed = SEED_MILESTONES[d];
      const questionsWithTen = buildTenChronicleQuestions(
        d,
        act,
        chapter,
        seed.storyTitle,
        seed.scriptureRef,
        seed.blurb,
        seed.characterId,
        seed.characterName,
        seed.gameStyle,
        seed.questions
      );

      days.push({
        ...seed,
        actIndex: act.actIndex,
        actTitle: act.actTitle,
        actColor: act.color,
        actLipColor: act.lipColor,
        chapterTitle: chapter.title,
        questions: questionsWithTen,
        xpReward: seed.glyph === 'trophy' ? 50 : seed.glyph === 'chest' ? 40 : 30,
      });
      continue;
    }

    // 4. Procedurally construct rich chronological entry based on book & day in act
    const dayInAct = d - act.startDay + 1;
    const isChestDay = d % 14 === 0;
    const isTrophyDay = d === act.endDay || d % 28 === 0;
    const glyph: ChronicleDay['glyph'] = isChestDay
      ? 'chest'
      : isTrophyDay
      ? 'trophy'
      : d % 3 === 0
      ? 'book'
      : d % 2 === 0
      ? 'scroll'
      : 'star';

    const gameStyle: JourneyGameStyle = isChestDay
      ? 'chest'
      : d % 5 === 0
      ? 'who-said'
      : d % 4 === 0
      ? 'four-signs'
      : d % 3 === 0
      ? 'scribes-tiles'
      : d % 2 === 0
      ? 'proverb'
      : 'bible-or-not';

    // Contextual story and base questions by Biblical Act
    const { storyTitle, scriptureRef, blurb, characterId, characterName, questions } =
      generateActDayContent(act, chapter, d, dayInAct);

    const questionsWithTen = buildTenChronicleQuestions(
      d,
      act,
      chapter,
      storyTitle,
      scriptureRef,
      blurb,
      characterId,
      characterName,
      gameStyle,
      questions
    );

    days.push({
      dayNumber: d,
      actIndex: act.actIndex,
      actTitle: act.actTitle,
      actColor: act.color,
      actLipColor: act.lipColor,
      chapterTitle: chapter.title,
      storyTitle,
      scriptureRef,
      blurb,
      characterId,
      characterName,
      gameStyle,
      glyph,
      xpReward: isTrophyDay ? 45 : isChestDay ? 35 : 25,
      questions: questionsWithTen,
    });
  }

  return days;
}

/**
 * Procedural content generator mapping every day in an Act to authentic Biblical context
 */
function generateActDayContent(
  act: ChronicleAct,
  chapter: ChronicleChapter,
  globalDay: number,
  dayInAct: number
): {
  storyTitle: string;
  scriptureRef: string;
  blurb: string;
  characterId: BiblicalCharacterId;
  characterName: string;
  questions: ChronicleQuestion[];
} {
  switch (act.actIndex) {
    case 1: {
      // Genesis (Creation, Patriarchs)
      if (globalDay <= 10) {
        return {
          storyTitle: `Genesis Day ${globalDay}: Garden of Eden & The Tree of Life`,
          scriptureRef: `Genesis 2:${Math.min(25, globalDay + 5)}-${Math.min(25, globalDay + 10)}`,
          blurb: 'God placed man in the garden of delight to work it and keep it, commanding him freely to eat of every tree except one.',
          characterId: 'adam',
          characterName: 'Ādām',
          questions: [
            {
              prompt: 'Where did the Lord God place man to work and take care of the land?',
              speechText: 'A lush sanctuary watered by four rivers!',
              category: 'Eden Origins',
              options: ['Garden of Eden', 'Plains of Mamre', 'Mount Sinai', 'Valley of Hebron'],
              answer: 'Garden of Eden',
              ref: 'Genesis 2:15',
              why: 'Genesis 2:15 notes God took the man and put him in the Garden of Eden.',
            },
            {
              prompt: 'What was the name of the tree whose fruit was forbidden to be eaten?',
              speechText: 'Guarded by divine commandment!',
              category: 'The Garden Command',
              options: ['Tree of the Knowledge of Good and Evil', 'Tree of Eternity', 'Tree of Gold', 'Tree of the Desert'],
              answer: 'Tree of the Knowledge of Good and Evil',
              ref: 'Genesis 2:17',
              why: '"For when you eat from it you will certainly die."',
            },
            {
              prompt: 'Who was created from Adam’s side as a suitable helper and partner for life?',
              speechText: 'Bone of my bones and flesh of my flesh!',
              category: 'Creation of Woman',
              options: ['Eve (Ḥawwāh)', 'Sarah', 'Rachel', 'Rebekah'],
              answer: 'Eve (Ḥawwāh)',
              ref: 'Genesis 2:22-23',
              why: 'The Lord God made a woman from the rib He had taken out of the man.',
            },
          ],
        };
      } else if (globalDay <= 25) {
        return {
          storyTitle: `Covenant of Faith: Abraham Journeys to Canaan`,
          scriptureRef: `Genesis 12:${globalDay - 10}-20`,
          blurb: 'Abram journeyed as the Lord instructed him, building altars of prayer at Shechem and Bethel as he trusted God’s promise.',
          characterId: 'abraham',
          characterName: 'Avrāhām',
          questions: [
            {
              prompt: 'What did God promise Abram when He told him: "In you all the families of the earth will be blessed"?',
              speechText: 'The everlasting covenant of blessing!',
              category: 'Abrahamic Blessing',
              options: ['All nations will be blessed through his offspring', 'He would build an empire of silver', 'He would conquer Egypt', 'He would live forever on earth'],
              answer: 'All nations will be blessed through his offspring',
              ref: 'Genesis 12:3',
              why: 'God’s covenant pointed forward to the Messiah coming through Abraham’s line.',
            },
            {
              prompt: 'What was the name of Abram’s wife who received the promise of a son in her old age?',
              speechText: 'Mother of nations!',
              category: 'Patriarchal Family',
              options: ['Sarah (Sarai)', 'Hagar', 'Keturah', 'Milcah'],
              answer: 'Sarah (Sarai)',
              ref: 'Genesis 17:15',
              why: 'God changed Sarai’s name to Sarah, meaning princess, mother of nations.',
            },
            {
              prompt: 'What was the name of the son born of the promise to Abraham and Sarah?',
              speechText: 'Laughter and joy fulfilled!',
              category: 'Child of Promise',
              options: ['Isaac (Yiṣḥāq)', 'Ishmael', 'Esau', 'Jacob'],
              answer: 'Isaac (Yiṣḥāq)',
              ref: 'Genesis 21:3',
              why: 'Abraham named the son Sarah bore to him Isaac ("he laughs").',
            },
          ],
        };
      } else {
        return {
          storyTitle: `Jacob & Joseph: Providence in the Land of Goshen`,
          scriptureRef: `Genesis 46:1-${Math.min(34, dayInAct)}`,
          blurb: 'Jacob’s family gathered seventy strong into Egypt’s fertile Goshen, where Joseph sustained them through years of famine.',
          characterId: 'joseph',
          characterName: 'Yōsēf',
          questions: [
            {
              prompt: 'What new name did God bestow upon Jacob after he wrestled at the Jabbok ford?',
              speechText: 'You have struggled with God and humans and have overcome!',
              category: 'Patriarchal Identity',
              options: ['Israel (Yisra’el)', 'Abraham', 'Jeshurun', 'Judah'],
              answer: 'Israel (Yisra’el)',
              ref: 'Genesis 32:28',
              why: 'God said: "Your name will no longer be Jacob, but Israel."',
            },
            {
              prompt: 'In which fertile region of Egypt did Joseph settle his father Jacob and his brothers?',
              speechText: 'A pastureland for shepherds!',
              category: 'Goshen Settlement',
              options: ['Land of Goshen', 'Alexandria', 'The Nile Delta of Memphis', 'The Valley of Thebes'],
              answer: 'Land of Goshen',
              ref: 'Genesis 47:6',
              why: 'Pharaoh granted the best of the land, the district of Goshen, to Israel’s family.',
            },
            {
              prompt: 'How many sons of Jacob became the ancestral leaders of the Twelve Tribes of Israel?',
              speechText: 'The twelve pillars of the covenant family!',
              category: 'Twelve Tribes',
              options: ['Twelve', 'Ten', 'Seven', 'Fourteen'],
              answer: 'Twelve',
              ref: 'Genesis 49:28',
              why: 'All these are the twelve tribes of Israel, blessed by Jacob.',
            },
          ],
        };
      }
    }

    case 2: {
      // Exodus, Law, Tabernacle
      return {
        storyTitle: `Exodus Pilgrimage: Manna from Heaven & The Ten Words`,
        scriptureRef: `Exodus 16:${Math.min(30, dayInAct)}-36`,
        blurb: 'Each morning, white flakes like coriander seed coated the desert dew. God provided daily bread and taught Israel holy obedience.',
        characterId: 'moshe',
        characterName: 'Mōshē',
        questions: [
          {
            prompt: 'What was the bread that rained down daily from heaven called by the Israelites?',
            speechText: 'What is it? Daily bread for the desert pilgrimage!',
            category: 'Wilderness Provision',
            options: ['Manna', 'Matzo', 'Shewbread', 'Quail cakes'],
            answer: 'Manna',
            ref: 'Exodus 16:31',
            why: 'The people of Israel called the bread manna; it was white like coriander seed and tasted like wafers with honey.',
          },
          {
            prompt: 'On which sacred mountain did Moses receive the Two Stone Tablets inscribed by God?',
            speechText: 'Thunder, lightning, and thick cloud covered the peak!',
            category: 'Mount Sinai',
            options: ['Mount Sinai (Horeb)', 'Mount Carmel', 'Mount Nebo', 'Mount Hermon'],
            answer: 'Mount Sinai (Horeb)',
            ref: 'Exodus 19:20',
            why: 'The Lord descended to the top of Mount Sinai and called Moses up.',
          },
          {
            prompt: 'What was the golden chest containing the stone tablets and mercy seat called?',
            speechText: 'The holy dwelling of God’s glory!',
            category: 'The Tabernacle',
            options: ['Ark of the Covenant', 'Altar of Incense', 'Table of Showbread', 'Golden Menorah'],
            answer: 'Ark of the Covenant',
            ref: 'Exodus 25:10-22',
            why: 'The Ark of the Covenant sat in the Holy of Holies beneath the golden cherubim.',
          },
        ],
      };
    }

    case 3: {
      // Promised Land, Joshua, Deborah, Gideon, Ruth
      const isRuth = globalDay >= 124;
      const charId: BiblicalCharacterId = isRuth ? 'ruth' : globalDay >= 106 ? 'deborah' : 'joshua';
      const charName = isRuth ? 'Rūth' : globalDay >= 106 ? 'Debōrāh' : 'Yəhōshūa';

      return {
        storyTitle: isRuth
          ? `Ruth’s Loyalty: Thy God Shall Be My God`
          : `Valor in Canaan: The Walls of Jericho & Judges`,
        scriptureRef: isRuth ? 'Ruth 1:16-22' : 'Joshua 6:1-20',
        blurb: isRuth
          ? 'Ruth clung to Naomi with unwavering love, gleaning in Boaz’s fields in Bethlehem and entering the royal ancestry of David.'
          : 'Marching around Jericho seven times on the seventh day, the priests blew the shofars, the army shouted, and the walls collapsed!',
        characterId: charId,
        characterName: charName,
        questions: [
          {
            prompt: isRuth
              ? 'What memorable pledge of devotion did Ruth make to her mother-in-law Naomi?'
              : 'How many times did Israel march around Jericho on the seventh day before the walls fell?',
            speechText: isRuth ? 'Where you go I will go, where you lodge I will lodge...' : 'Blow the ram’s horns with a great shout!',
            category: isRuth ? 'Devotion of Ruth' : 'Battle of Jericho',
            options: isRuth
              ? ['Your people will be my people, and your God my God', 'Return to Moab and live in peace', 'We will rebuild the house of Elimelech in Judah', 'Seek gold in the markets of Tyre']
              : ['Seven times', 'Three times', 'Once only', 'Twelve times'],
            answer: isRuth ? 'Your people will be my people, and your God my God' : 'Seven times',
            ref: isRuth ? 'Ruth 1:16' : 'Joshua 6:4',
            why: isRuth ? 'Ruth 1:16 expresses ultimate covenant fidelity.' : 'Joshua 6:4 commands seven circuits on the seventh day.',
          },
          {
            prompt: 'Which female judge and prophetess in Israel held court under a palm tree and led victory over Sisera?',
            speechText: 'Arise, Deborah, arise and sing a song of triumph!',
            category: 'Judges of Israel',
            options: ['Deborah', 'Jael', 'Hannah', 'Miriam'],
            answer: 'Deborah',
            ref: 'Judges 4:4-5',
            why: 'Deborah was judge and prophetess in Israel who inspired Barak to victory.',
          },
          {
            prompt: 'How many brave warriors did God choose to accompany Gideon against the vast Midianite host?',
            speechText: 'Lapping water like a watchman!',
            category: 'Gideon’s Army',
            options: ['300 men', '10,000 men', '32,000 men', '1,000 men'],
            answer: '300 men',
            ref: 'Judges 7:7',
            why: 'The Lord said to Gideon: "With the three hundred men that lapped I will save you."',
          },
        ],
      };
    }

    case 4: {
      // United Kingdom: David & Solomon
      return {
        storyTitle: `The Royal Kingdom: David’s Harp & Solomon’s Temple`,
        scriptureRef: `Psalm 23:1-6`,
        blurb: 'From the pastures of Bethlehem to the throne of Zion, David praised the Lord. Solomon built the holy Temple of cedar and gold in Jerusalem.',
        characterId: 'david',
        characterName: 'Dāvīd',
        questions: [
          {
            prompt: 'Complete the beloved Psalm 23: "The Lord is my shepherd..."',
            speechText: 'He makes me lie down in green pastures...',
            category: 'Psalms of David',
            options: ['I shall not want (I lack nothing)', 'I shall conquer my foes', 'I will build a sanctuary', 'My path is always easy'],
            answer: 'I shall not want (I lack nothing)',
            ref: 'Psalm 23:1',
            why: 'Psalm 23:1 is celebrated worldwide for comfort and pastoral trust.',
          },
          {
            prompt: 'What did young King Solomon ask God for when offered anything in a dream at Gibeon?',
            speechText: 'An understanding heart to govern this great people!',
            category: 'Solomon’s Request',
            options: ['Wisdom and an understanding heart', 'Immense wealth and silver', 'Long life and victory over enemies', 'A vast navy of ships'],
            answer: 'Wisdom and an understanding heart',
            ref: '1 Kings 3:9',
            why: 'God gave Solomon wisdom exceeding all the kings of the earth.',
          },
          {
            prompt: 'Which holy city did King David make the capital of Israel and bring up the Ark of God with dancing?',
            speechText: 'City of David, Mount Zion!',
            category: 'Davidic Kingdom',
            options: ['Jerusalem (Zion)', 'Hebron', 'Shechem', 'Samaria'],
            answer: 'Jerusalem (Zion)',
            ref: '2 Samuel 5:7-9',
            why: 'David captured the fortress of Zion, which became the City of David (Jerusalem).',
          },
        ],
      };
    }

    case 5: {
      // Divided Kingdom & Elijah / Elisha
      return {
        storyTitle: `The Mountain Prophets: Chariot of Fire & The Prophet’s Mantle`,
        scriptureRef: `2 Kings 2:9-14`,
        blurb: 'Elijah walked with Elisha across the parted Jordan. Suddenly, a chariot of fire and horses of fire appeared, and Elijah ascended in a whirlwind.',
        characterId: 'eliyah',
        characterName: 'Eliyāh',
        questions: [
          {
            prompt: 'What did Elisha ask of Elijah before Elijah was taken up into heaven?',
            speechText: 'A bold prayer of spiritual inheritance!',
            category: 'Elisha’s Request',
            options: ['A double portion of your spirit', 'Your silver walking staff', 'To build a school for the prophets', 'Protection from King Ahab'],
            answer: 'A double portion of your spirit',
            ref: '2 Kings 2:9',
            why: 'Elisha asked to inherit a double portion of Elijah’s prophetic spirit.',
          },
          {
            prompt: 'How was the prophet Elijah taken up into heaven in 2 Kings 2:11?',
            speechText: 'Behold, horses and chariot of blazing light!',
            category: 'Elijah’s Ascension',
            options: ['In a whirlwind with a chariot of fire', 'He fell asleep at Mount Horeb', 'In a great sailing vessel', 'By an angelic cloud'],
            answer: 'In a whirlwind with a chariot of fire',
            ref: '2 Kings 2:11',
            why: 'A chariot of fire appeared and Elijah ascended into heaven in a whirlwind.',
          },
          {
            prompt: 'Which prophet was swallowed by a great fish when he attempted to flee from preaching to Nineveh?',
            speechText: 'Three days and three nights in the depths!',
            category: 'Prophetic Stories',
            options: ['Jonah', 'Amos', 'Hosea', 'Micah'],
            answer: 'Jonah',
            ref: 'Jonah 1:17',
            why: 'The Lord provided a huge fish to swallow Jonah, pointing ahead to Christ’s resurrection.',
          },
        ],
      };
    }

    case 6: {
      // Major Prophets & Daniel
      return {
        storyTitle: `Prophets of Glory: Isaiah’s Holy Vision & Dry Bones Revived`,
        scriptureRef: `Isaiah 6:1-8`,
        blurb: 'In the year King Uzziah died, Isaiah saw the Lord high and exalted on His throne, seraphim calling: "Holy, holy, holy is the Lord of Hosts!"',
        characterId: 'daniel',
        characterName: 'Dāniyēl',
        questions: [
          {
            prompt: 'What did the seraphim cry to one another in Isaiah’s vision of the heavenly temple?',
            speechText: 'The whole earth is full of His glory!',
            category: 'Isaiah’s Vision',
            options: [
              'Holy, holy, holy is the Lord of Hosts; the whole earth is full of His glory',
              'Great and mighty is the king of Zion',
              'Bow before the altar of bronze',
              'Listen to the words of the prophets',
            ],
            answer: 'Holy, holy, holy is the Lord of Hosts; the whole earth is full of His glory',
            ref: 'Isaiah 6:3',
            why: 'Isaiah 6:3 is the threefold angelic hymn of God’s absolute holiness.',
          },
          {
            prompt: 'What did Isaiah respond when the Lord asked: "Whom shall I send, and who will go for Us?"',
            speechText: 'Here am I. Send me!',
            category: 'Call of Isaiah',
            options: ['Here am I. Send me!', 'Choose an elder of Judah', 'I am slow of speech and tongue', 'Send an angel from above'],
            answer: 'Here am I. Send me!',
            ref: 'Isaiah 6:8',
            why: 'Isaiah immediately surrendered his life to God’s prophetic mission.',
          },
          {
            prompt: 'What vision did Ezekiel witness in Ezekiel 37 that demonstrated God’s power to restore Israel?',
            speechText: 'Can these bones live? Lord God, You know!',
            category: 'Ezekiel’s Visions',
            options: ['A valley of dry bones coming alive with breath', 'A tree reaching into outer space', 'A golden ladder of emeralds', 'A burning temple of marble'],
            answer: 'A valley of dry bones coming alive with breath',
            ref: 'Ezekiel 37:1-10',
            why: 'The Spirit breathed into the dry bones and they stood up as a vast army.',
          },
        ],
      };
    }

    case 7: {
      // Esther, Ezra, Nehemiah
      return {
        storyTitle: `Courage in the Citadel: Queen Esther & Rebuilding Jerusalem`,
        scriptureRef: `Esther 4:10-17`,
        blurb: 'Mordecai reminded Esther: "Who knows whether you have not come to the kingdom for such a time as this?" Esther fasted and bravely approached the Persian king.',
        characterId: 'esther',
        characterName: 'Esthēr',
        questions: [
          {
            prompt: 'What courageous resolve did Queen Esther express before entering the inner court uninvited?',
            speechText: 'Fast for me three days, night and day...',
            category: 'Courage of Esther',
            options: [
              'If I perish, I perish',
              'I will hire royal guards to shield me',
              'The king will give me whatever I ask',
              'I will wait for next year’s festival',
            ],
            answer: 'If I perish, I perish',
            ref: 'Esther 4:16',
            why: 'Esther risked her life for her people with unreserved bravery.',
          },
          {
            prompt: 'Which Persian king held out the golden scepter to spare and welcome Queen Esther?',
            speechText: 'What is your request, Queen Esther? Up to half the kingdom!',
            category: 'Persian Royal Court',
            options: ['King Ahasuerus (Xerxes)', 'King Cyrus the Great', 'King Darius', 'King Artaxerxes'],
            answer: 'King Ahasuerus (Xerxes)',
            ref: 'Esther 5:2',
            why: 'The king extended the golden scepter that was in his hand to Esther.',
          },
          {
            prompt: 'What role did Nehemiah hold in the Persian palace before traveling to rebuild the walls of Jerusalem?',
            speechText: 'Serving wine before the royal throne!',
            category: 'Nehemiah’s Mission',
            options: ['Cupbearer to the King', 'Chief Scribe', 'Captain of the Chariots', 'High Priest'],
            answer: 'Cupbearer to the King',
            ref: 'Nehemiah 1:11',
            why: 'Nehemiah was cupbearer to King Artaxerxes before rebuilding Jerusalem’s walls in 52 days.',
          },
        ],
      };
    }

    case 8: {
      // Gospels: Ministry of Jesus
      return {
        storyTitle: `The Great Teacher: Sermon on the Mount & Kingdom Miracles`,
        scriptureRef: `Matthew 5:1-12`,
        blurb: 'Seeing the crowds, Jesus went up on the mountainside and opened His mouth, blessing the poor in spirit and peacemakers.',
        characterId: 'jesus',
        characterName: 'Yēshūa',
        questions: [
          {
            prompt: 'According to Jesus in the Beatitudes, who did He proclaim will inherit the earth?',
            speechText: 'Blessed are the meek...',
            category: 'Sermon on the Mount',
            options: ['The meek', 'The rich and powerful', 'The bold warriors', 'The scholars and rulers'],
            answer: 'The meek',
            ref: 'Matthew 5:5',
            why: 'Matthew 5:5: "Blessed are the meek, for they will inherit the earth."',
          },
          {
            prompt: 'With what small lunch did Jesus miraculously feed a crowd of over five thousand people?',
            speechText: 'Blessed, broken, and multiplied with twelve baskets left over!',
            category: 'Miracles of Christ',
            options: ['Five barley loaves and two small fish', 'Seven loaves and honey cakes', 'Three loaves and dates', 'Ten fish and unleavened bread'],
            answer: 'Five barley loaves and two small fish',
            ref: 'John 6:9',
            why: 'A boy offered his five small barley loaves and two small fish, which Jesus multiplied.',
          },
          {
            prompt: 'In the Parable of the Prodigal Son, what did the loving father do when he saw his returning child afar off?',
            speechText: 'Filled with compassion, he ran and threw his arms around him!',
            category: 'Parables of Grace',
            options: ['He was filled with compassion, ran, and embraced him', 'He locked the gates of the estate', 'He required forty days of servant labor', 'He turned him away'],
            answer: 'He was filled with compassion, ran, and embraced him',
            ref: 'Luke 15:20',
            why: 'The father ran to meet his son, illustrating God’s boundless mercy.',
          },
        ],
      };
    }

    case 9: {
      // Passion & Resurrection
      return {
        storyTitle: `Passion & Triumph: Gethsemane, The Cross & Emmaus Road`,
        scriptureRef: `Luke 24:13-35`,
        blurb: 'While walking to Emmaus, the risen Jesus drew near, opening the Scriptures to show how Moses and all the Prophets pointed to Him.',
        characterId: 'jesus',
        characterName: 'Yēshūa',
        questions: [
          {
            prompt: 'What did the disciples say after Jesus broke bread and their eyes were opened to recognize Him on the Emmaus road?',
            speechText: 'Were not our hearts burning within us while He talked with us on the road?',
            category: 'The Risen Savior',
            options: [
              'Were not our hearts burning within us while He opened the Scriptures?',
              'Let us return to Jerusalem and build a memorial',
              'Why did we doubt the vision of angels?',
              'We must tell the Roman centurion',
            ],
            answer: 'Were not our hearts burning within us while He opened the Scriptures?',
            ref: 'Luke 24:32',
            why: 'Their hearts burned with revelation as Jesus explained all prophecies concerning Himself.',
          },
          {
            prompt: 'What meal did Jesus share with His disciples in the Upper Room on the night He was betrayed?',
            speechText: 'This is My body, which is given for you; do this in remembrance of Me.',
            category: 'The Last Supper',
            options: ['The Passover Meal (The Last Supper)', 'The Feast of Booths', 'The Pentecost Breakfast', 'A feast of victory with the Sanhedrin'],
            answer: 'The Passover Meal (The Last Supper)',
            ref: 'Luke 22:15-20',
            why: 'Jesus instituted the New Covenant in His blood during the Passover feast.',
          },
          {
            prompt: 'What mandate did the risen Jesus commission His disciples with on the mountain in Galilee?',
            speechText: 'All authority in heaven and on earth has been given to Me!',
            category: 'The Great Commission',
            options: [
              'Go and make disciples of all nations, baptizing them in the name of the Father, Son, and Holy Spirit',
              'Remain in Jerusalem forever and do not travel',
              'Write letters only to the twelve tribes',
              'Build a fortress upon Mount Olivet',
            ],
            answer: 'Go and make disciples of all nations, baptizing them in the name of the Father, Son, and Holy Spirit',
            ref: 'Matthew 28:19-20',
            why: 'The Great Commission directs believers to bring the gospel to every nation on earth.',
          },
        ],
      };
    }

    case 10: {
      // Acts & The Early Church
      return {
        storyTitle: `The Church Ignited: Pentecost Fire & Bold Proclamation`,
        scriptureRef: `Acts 2:1-4`,
        blurb: 'When the Day of Pentecost arrived, suddenly a sound like a violent rushing wind filled the house, and tongues of fire rested on each disciple.',
        characterId: 'peter',
        characterName: 'Pētros',
        questions: [
          {
            prompt: 'What visual sign rested on the believers when the Holy Spirit was poured out at Pentecost?',
            speechText: 'A rushing wind and tongues of holy fire!',
            category: 'Day of Pentecost',
            options: ['Tongues as of fire', 'A cloud of gold dust', 'A white dove on each shoulder', 'Water pouring from the roof'],
            answer: 'Tongues as of fire',
            ref: 'Acts 2:3',
            why: 'They saw what seemed to be tongues of fire that separated and came to rest on each of them.',
          },
          {
            prompt: 'How many souls believed and were baptized after Peter preached his bold Pentecost sermon?',
            speechText: 'Repent and be baptized, every one of you!',
            category: 'Early Church Growth',
            options: ['About three thousand', 'Five hundred', 'One hundred and twenty', 'Ten thousand'],
            answer: 'About three thousand',
            ref: 'Acts 2:41',
            why: 'About three thousand were added to their number that day.',
          },
          {
            prompt: 'What happened to Saul on the road to Damascus that transformed him into the Apostle Paul?',
            speechText: 'Saul, Saul, why do you persecute Me?',
            category: 'Conversion of Paul',
            options: [
              'A bright light from heaven shone and Jesus spoke to him',
              'He read a parchment written by Peter',
              'He met an angel in the Roman Senate',
              'He had a dream while sleeping in Tarsus',
            ],
            answer: 'A bright light from heaven shone and Jesus spoke to him',
            ref: 'Acts 9:3-6',
            why: 'The risen Christ appeared to Saul on the Damascus road, calling him to the nations.',
          },
        ],
      };
    }

    case 11: {
      // Epistles
      return {
        storyTitle: `Epistles of Grace: Romans, The Armor of God & Faith`,
        scriptureRef: `Romans 8:31-39; Ephesians 6:10-18`,
        blurb: 'Paul exclaims with triumphant assurance: "If God is for us, who can be against us? Nothing can separate us from the love of God in Christ Jesus."',
        characterId: 'paul',
        characterName: 'Paulos',
        questions: [
          {
            prompt: 'According to Romans 8:38-39, what power in all creation is able to separate us from the love of God in Christ Jesus?',
            speechText: 'Neither death nor life, neither angels nor demons...',
            category: 'Unshakeable Love',
            options: ['Nothing in all creation', 'Difficult trials and persecutions', 'Distance and time', 'Angelic rulers'],
            answer: 'Nothing in all creation',
            ref: 'Romans 8:39',
            why: 'Paul affirms that nothing can separate believers from God’s love in Christ.',
          },
          {
            prompt: 'In Ephesians 6, what spiritual weapon is identified as "the Sword of the Spirit"?',
            speechText: 'Take up the full armor of God to stand firm!',
            category: 'The Armor of God',
            options: ['The Word of God', 'Good deeds', 'A golden medallion', 'Fasting and silence'],
            answer: 'The Word of God',
            ref: 'Ephesians 6:17',
            why: 'Ephesians 6:17 specifies: "Take the sword of the Spirit, which is the word of God."',
          },
          {
            prompt: 'According to Hebrews 11:1, what is the biblical definition of faith?',
            speechText: 'The substance of things hoped for, evidence of things not seen!',
            category: 'Hall of Faith',
            options: [
              'Confidence in what we hope for and assurance about what we do not see',
              'A vague wish for good circumstances',
              'Knowledge of ancient histories',
              'Following cultural traditions',
            ],
            answer: 'Confidence in what we hope for and assurance about what we do not see',
            ref: 'Hebrews 11:1',
            why: 'Hebrews 11:1 defines faith as confidence in what is hoped for and assurance of the unseen.',
          },
        ],
      };
    }

    case 12:
    default: {
      // Revelation
      return {
        storyTitle: `Revelation: The Lamb on the Throne & The River of Life`,
        scriptureRef: `Revelation 5:1-14; 22:1-5`,
        blurb: 'John weeps because no one in heaven or earth is worthy to open the scroll, until the elder cries: "The Lion of Judah, the Root of David, has triumphed!"',
        characterId: 'john',
        characterName: 'Yōḥānān',
        questions: [
          {
            prompt: 'Who was declared worthy to take the scroll and open its seven seals in Revelation 5?',
            speechText: 'Worthy is the Lamb who was slain to receive power and wealth and wisdom!',
            category: 'The Heavenly Throne',
            options: ['The Lamb who was slain (Jesus Christ)', 'The archangel Michael', 'Moses the lawgiver', 'The four living creatures'],
            answer: 'The Lamb who was slain (Jesus Christ)',
            ref: 'Revelation 5:9',
            why: 'Jesus Christ, the Lamb who was slain, alone is worthy to open the seals.',
          },
          {
            prompt: 'What did John see coming down out of heaven from God, prepared as a bride adorned for her husband?',
            speechText: 'I saw the Holy City!',
            category: 'The New Jerusalem',
            options: ['The New Jerusalem (Holy City)', 'A palace of cedar', 'The Ark of the Covenant', 'The ancient temple of Solomon'],
            answer: 'The New Jerusalem (Holy City)',
            ref: 'Revelation 21:2',
            why: 'John saw the Holy City, the New Jerusalem, coming down out of heaven from God.',
          },
          {
            prompt: 'What title does Jesus proclaim in Revelation 22:13, describing His eternal supremacy?',
            speechText: 'The First and the Last, the Beginning and the End!',
            category: 'Alpha & Omega',
            options: ['I am the Alpha and the Omega', 'The Emperor of Rome', 'The Silent Watchman', 'The Teacher of Galilee'],
            answer: 'I am the Alpha and the Omega',
            ref: 'Revelation 22:13',
            why: '"I am the Alpha and the Omega, the First and the Last, the Beginning and the End."',
          },
        ],
      };
    }
  }
}

/**
 * Singleton cache for all 365 Days
 */
let cachedChronicle: ChronicleDay[] | null = null;

export function getAllChronicleDays(): ChronicleDay[] {
  if (!cachedChronicle) {
    cachedChronicle = buildFullChronicle();
  }
  return cachedChronicle;
}

export function getChronicleDay(dayNumber: number): ChronicleDay {
  const all = getAllChronicleDays();
  const clamped = Math.max(1, Math.min(365, dayNumber));
  return all[clamped - 1];
}

export function getAllActs(): ChronicleAct[] {
  return CHRONICLE_ACTS;
}

export function getActForDay(dayNumber: number): ChronicleAct {
  const clamped = Math.max(1, Math.min(365, dayNumber));
  return CHRONICLE_ACTS.find((a) => clamped >= a.startDay && clamped <= a.endDay) || CHRONICLE_ACTS[0];
}

/**
 * Calculate Day of Year (1..365)
 */
export function getDayOfYear(date: Date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff =
    date.getTime() -
    start.getTime() +
    (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000;
  const oneDay = 1000 * 60 * 60 * 24;
  const day = Math.floor(diff / oneDay);
  return Math.max(1, Math.min(365, day));
}

/**
 * Format Day of Year into human-readable date, e.g. "January 14" or "Oct 27"
 */
export function formatDayDate(dayNumber: number, year: number = new Date().getFullYear()): string {
  const date = new Date(year, 0);
  date.setDate(dayNumber);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Determine state of a day node:
 * - 'completed': player has finished it
 * - 'today': today's active calendar day
 * - 'missed': past day that hasn't been completed yet (catch-up available!)
 * - 'locked': future calendar day (> today)
 */
export type ChronicleDayStatus = 'completed' | 'today' | 'missed' | 'locked';

export function getChronicleDayStatus(
  dayNumber: number,
  completedDays: number[],
  currentDayOfYear: number = getDayOfYear()
): ChronicleDayStatus {
  if (completedDays.includes(dayNumber)) {
    return 'completed';
  }
  if (dayNumber === currentDayOfYear) {
    return 'today';
  }
  if (dayNumber < currentDayOfYear) {
    return 'missed';
  }
  return 'locked';
}

/**
 * Return seconds until midnight (next calendar day unlock)
 */
export function getSecondsUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  return Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
}
