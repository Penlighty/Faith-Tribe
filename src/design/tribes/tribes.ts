// Faith Tribe Visual Identity - 12 Biblical Tribes Definition & Trait System
// Grounded in Genesis 49, Deuteronomy 33, and 1 Chronicles 12

import { IconName } from '../icons/icons';

export interface TraitDimension {
  id: string;
  name: string;
  subtitle: string;
  biblicalAnchor: string;
  scriptureRef: string;
  lowLabel: string;
  lowDescription: string;
  highLabel: string;
  highDescription: string;
  iconName: IconName;
}

export const TRAIT_DIMENSIONS: TraitDimension[] = [
  {
    id: 'time_discernment',
    name: 'Understanding Times & Seasons',
    subtitle: 'Temporal foresight, chronos awareness, and divine timing',
    biblicalAnchor: 'Men of Issachar, who understood the times to know what Israel ought to do.',
    scriptureRef: '1 Chronicles 12:32',
    lowLabel: 'Spontaneous & Intuitive',
    lowDescription: 'Flows with the immediate moment, highly adaptable, thrives in unscripted environments.',
    highLabel: 'Strategic & Discerning',
    highDescription: 'Deeply conscious of seasons, divine appointments, calculated timing, and prophetic foresight.',
    iconName: 'timer',
  },
  {
    id: 'bold_initiative',
    name: 'Frontline Boldness & Valor',
    subtitle: 'Courage to lead from the front, take kingdom ground, and rally others',
    biblicalAnchor: 'Judah is a lion’s whelp; from the prey you have gone up; the scepter shall not depart.',
    scriptureRef: 'Genesis 49:8-10',
    lowLabel: 'Supportive Peacemaker',
    lowDescription: 'Prefers quiet execution behind the scenes, humble service, and lifting others into the spotlight.',
    highLabel: 'Lion-Hearted Vanguard',
    highDescription: 'Unflinching frontline trailblazer, commands the room, bold initiative under pressure.',
    iconName: 'bolt',
  },
  {
    id: 'sanctuary_devotion',
    name: 'Sacred Reflection & Prayer',
    subtitle: 'Spiritual intimacy, reverence for holiness, and sanctuary stewardship',
    biblicalAnchor: 'They shall teach Jacob Your judgments and Israel Your law; they shall put incense before You.',
    scriptureRef: 'Deuteronomy 33:8-10',
    lowLabel: 'Marketplace Practitioner',
    lowDescription: 'Expresses faith through tangible physical action, practical craftsmanship, and outer-court building.',
    highLabel: 'Sanctuary Intercessor',
    highDescription: 'Drawn to holy contemplation, deep Scripture study, unbroken altar communion, and sacred reverence.',
    iconName: 'book-open',
  },
  {
    id: 'tactical_precision',
    name: 'Discipline & Laser Precision',
    subtitle: 'Meticulous execution, disciplined mastery, and accuracy under pressure',
    biblicalAnchor: 'Every one could sling a stone at a hair’s breadth and not miss.',
    scriptureRef: 'Judges 20:16',
    lowLabel: 'Holistic Visionary',
    lowDescription: 'Focuses on the grand big picture, comfortable with broad brushstrokes and flexible margins.',
    highLabel: 'Master Marksman',
    highDescription: 'Surgically precise, disciplined, leaves nothing to chance, sharp mastery of detail.',
    iconName: 'target',
  },
  {
    id: 'fruitful_stewardship',
    name: 'Fruitfulness & Multiplication',
    subtitle: 'Resource stewardship, building lasting capacity, and kingdom enterprise',
    biblicalAnchor: 'Joseph is a fruitful bough by a spring; his branches climb over the wall.',
    scriptureRef: 'Genesis 49:22-26',
    lowLabel: 'Content Minimalist',
    lowDescription: 'Values lean simplicity, unattached to surplus, satisfied with basic daily sustenance.',
    highLabel: 'Visionary Multiplier',
    highDescription: 'Builds enduring capacity, multiplies talents and resources, visionary enterprise that shelters many.',
    iconName: 'wheat',
  },
  {
    id: 'pioneering_reach',
    name: 'Frontier Exploration & Outreach',
    subtitle: 'Venture mindset, crossing boundaries, and relational bridge-building',
    biblicalAnchor: 'Zebulun shall dwell at the seashore and become a haven for ships; he rejoices in going out.',
    scriptureRef: 'Genesis 49:13',
    lowLabel: 'Rooted Hearth-Keeper',
    lowDescription: 'Thrives in stable, familiar soil, guarding established traditions and deep home roots.',
    highLabel: 'Daring Voyager',
    highDescription: 'Loves discovering uncharted territory, launching ships into the deep, and connecting distant worlds.',
    iconName: 'mountain',
  },
  {
    id: 'justice_vigilance',
    name: 'Moral Fortitude & Defense of Truth',
    subtitle: 'Covenant righteousness, standing up for the vulnerable, and sharp vigilance',
    biblicalAnchor: 'Dan shall judge his people; Gad shall overcome at the last.',
    scriptureRef: 'Genesis 49:16-19',
    lowLabel: 'Gentle Accommodator',
    lowDescription: 'Prioritizes harmony, minimizes tension, approaches differences with soft diplomacy.',
    highLabel: 'Vigilant Defender',
    highDescription: 'Fierce guardian of truth, speaks up against injustice, uncompromising moral spine.',
    iconName: 'shield',
  },
];

export interface TribeDefinition {
  id: string;
  name: string;
  title: string;
  archetype: string;
  container: string;
  ink: string;
  accent: string;
  emblemKey: string;
  source: string;
  verseText: string;
  strengths: string[];
  watchouts: string[];
  traits: Record<string, number>; // 0 - 100 for each trait id
}

export const TRIBES: TribeDefinition[] = [
  {
    id: 'issachar',
    name: 'Issachar',
    title: 'The Discerning Sage',
    archetype: 'Seer of Seasons & Divine Timing',
    container: '#EFE6D5',
    ink: '#4A3412',
    accent: '#B87A1E',
    emblemKey: 'sundial-stars',
    source: '1 Chr 12:32',
    verseText: 'Men of Issachar, who understood the times to know what Israel ought to do.',
    strengths: ['Prophetic timing & foresight', 'Strategic decision-making', 'Quiet, grounded counsel'],
    watchouts: ['Over-deliberation and analysis paralysis', 'Hesitation in the heat of immediate physical conflict'],
    traits: {
      time_discernment: 98,
      bold_initiative: 55,
      sanctuary_devotion: 82,
      tactical_precision: 75,
      fruitful_stewardship: 65,
      pioneering_reach: 42,
      justice_vigilance: 68,
    },
  },
  {
    id: 'judah',
    name: 'Judah',
    title: 'The Royal Vanguard',
    archetype: 'Lion-Hearted Leader & Champion of Praise',
    container: '#FBE8B3',
    ink: '#5A3E00',
    accent: '#D97706',
    emblemKey: 'lion-scepter',
    source: 'Gen 49:9',
    verseText: 'Judah is a lion’s whelp; from the prey you have gone up. The scepter shall not depart.',
    strengths: ['Bold frontline leadership', 'Rallying inspirational resolve', 'Fearless atmosphere of praise'],
    watchouts: ['Pride in personal strength', 'Rushing ahead of counsel without waiting on the Lord'],
    traits: {
      time_discernment: 72,
      bold_initiative: 98,
      sanctuary_devotion: 76,
      tactical_precision: 68,
      fruitful_stewardship: 76,
      pioneering_reach: 62,
      justice_vigilance: 84,
    },
  },
  {
    id: 'levi',
    name: 'Levi',
    title: 'The Sacred Steward',
    archetype: 'High Priest & Guardian of Holy Fire',
    container: '#EAE4F8',
    ink: '#362464',
    accent: '#7C3AED',
    emblemKey: 'breastplate-flame',
    source: 'Deut 33:8',
    verseText: 'Let Your Thummim and Urim be with Your holy one; they shall teach Your judgments.',
    strengths: ['Unbroken prayer & communion', 'Deep doctrinal discernment', 'Consecration to holiness'],
    watchouts: ['Spiritual elitism or isolation', 'Forgetting to translate altar devotion into practical love'],
    traits: {
      time_discernment: 65,
      bold_initiative: 50,
      sanctuary_devotion: 98,
      tactical_precision: 72,
      fruitful_stewardship: 38,
      pioneering_reach: 32,
      justice_vigilance: 78,
    },
  },
  {
    id: 'benjamin',
    name: 'Benjamin',
    title: 'The Precision Marksman',
    archetype: 'Disciplined Tactician & Fierce Brother',
    container: '#FCE0E8',
    ink: '#6E1B38',
    accent: '#DB2777',
    emblemKey: 'wolf-arrow',
    source: 'Judges 20:16',
    verseText: 'Benjamin is a ravenous wolf; every one could sling a stone at a hair’s breadth and not miss.',
    strengths: ['Laser accuracy under pressure', 'Fierce loyalty to brethren', 'Mastery of technical craft'],
    watchouts: ['Quick temper and stubborn defensiveness', 'Sectarian tribalism when challenged'],
    traits: {
      time_discernment: 62,
      bold_initiative: 74,
      sanctuary_devotion: 52,
      tactical_precision: 98,
      fruitful_stewardship: 52,
      pioneering_reach: 58,
      justice_vigilance: 82,
    },
  },
  {
    id: 'zebulun',
    name: 'Zebulun',
    title: 'The Seafaring Pioneer',
    archetype: 'Maritime Haven & Bridge Between Nations',
    container: '#DCE4F8',
    ink: '#152A68',
    accent: '#2563EB',
    emblemKey: 'ship-anchor',
    source: 'Gen 49:13',
    verseText: 'Zebulun shall dwell at the haven of the sea; and he shall be a haven for ships.',
    strengths: ['Venturing beyond comfort zones', 'Relational bridge-building', 'Resourceful commerce for the kingdom'],
    watchouts: ['Distraction by worldly trade', 'Drifting away from core community roots'],
    traits: {
      time_discernment: 68,
      bold_initiative: 68,
      sanctuary_devotion: 42,
      tactical_precision: 58,
      fruitful_stewardship: 82,
      pioneering_reach: 98,
      justice_vigilance: 52,
    },
  },
  {
    id: 'joseph',
    name: 'Joseph',
    title: 'The Fruitful Multiplier',
    archetype: 'Visionary Builder & Over-the-Wall Steward',
    container: '#D4F2CF',
    ink: '#144E20',
    accent: '#16A34A',
    emblemKey: 'fruitful-bough',
    source: 'Gen 49:22',
    verseText: 'Joseph is a fruitful bough by a well; his branches run over the wall.',
    strengths: ['Extraordinary organizational capacity', 'Generous kingdom multiplication', 'Forgiving heart that overcomes betrayal'],
    watchouts: ['Taking on the weight of the entire world', 'Relying on human administration over prayer'],
    traits: {
      time_discernment: 74,
      bold_initiative: 82,
      sanctuary_devotion: 72,
      tactical_precision: 66,
      fruitful_stewardship: 98,
      pioneering_reach: 64,
      justice_vigilance: 66,
    },
  },
  {
    id: 'naphtali',
    name: 'Naphtali',
    title: 'The Swift Herald',
    archetype: 'Messenger of Grace on Mountain Heights',
    container: '#D1F5F0',
    ink: '#0C4E47',
    accent: '#0D9488',
    emblemKey: 'swift-gazelle',
    source: 'Gen 49:21',
    verseText: 'Naphtali is a doe let loose; he gives beautiful and gracious words.',
    strengths: ['Infectious enthusiasm & joy', 'Artistic, eloquent speech', 'Swift, agile responsiveness'],
    watchouts: ['Shying away from necessary confrontation', 'Lack of follow-through when work becomes routine'],
    traits: {
      time_discernment: 48,
      bold_initiative: 48,
      sanctuary_devotion: 64,
      tactical_precision: 66,
      fruitful_stewardship: 56,
      pioneering_reach: 92,
      justice_vigilance: 36,
    },
  },
  {
    id: 'asher',
    name: 'Asher',
    title: 'The Joyful Steward',
    archetype: 'Provider of Royal Delights & Anointed Oil',
    container: '#FCE7D2',
    ink: '#6A3102',
    accent: '#EA580C',
    emblemKey: 'olive-bread',
    source: 'Deut 33:24',
    verseText: 'Most blessed of sons is Asher; let him dip his foot in oil; his bread shall be rich.',
    strengths: ['Radiant hospitality and generosity', 'Abundance mindset', 'Appreciation for God’s daily goodness'],
    watchouts: ['Complacency in times of ease', 'Reluctance to face hardship or spiritual warfare'],
    traits: {
      time_discernment: 52,
      bold_initiative: 42,
      sanctuary_devotion: 68,
      tactical_precision: 52,
      fruitful_stewardship: 92,
      pioneering_reach: 68,
      justice_vigilance: 42,
    },
  },
  {
    id: 'gad',
    name: 'Gad',
    title: 'The Resolute Vanguard',
    archetype: 'Overcomer in the Face of Adversity',
    container: '#F6D9CA',
    ink: '#68240B',
    accent: '#C2410C',
    emblemKey: 'vanguard-shield',
    source: 'Gen 49:19',
    verseText: 'Gad, a troop shall raid him, but he shall triumph at the last.',
    strengths: ['Unshakeable resilience and grit', 'Protective loyalty under fire', 'Finishing what was started'],
    watchouts: ['Hyper-vigilance and suspicion of others', 'Difficulty letting down guard to receive grace'],
    traits: {
      time_discernment: 66,
      bold_initiative: 88,
      sanctuary_devotion: 56,
      tactical_precision: 86,
      fruitful_stewardship: 62,
      pioneering_reach: 72,
      justice_vigilance: 96,
    },
  },
  {
    id: 'dan',
    name: 'Dan',
    title: 'The Vigilant Arbiter',
    archetype: 'Guardian of Equity & Keen Watchman',
    container: '#E5EECF',
    ink: '#30420E',
    accent: '#65A30D',
    emblemKey: 'scales-eagle',
    source: 'Gen 49:16',
    verseText: 'Dan shall judge his people as one of the tribes of Israel.',
    strengths: ['Sharp eye for deceit & injustice', 'Protector of the underdog', 'Incisive clarity when lines blur'],
    watchouts: ['Cynicism and harsh judgment', 'Taking retribution into one’s own hands'],
    traits: {
      time_discernment: 72,
      bold_initiative: 62,
      sanctuary_devotion: 52,
      tactical_precision: 82,
      fruitful_stewardship: 56,
      pioneering_reach: 52,
      justice_vigilance: 98,
    },
  },
  {
    id: 'reuben',
    name: 'Reuben',
    title: 'The Passionate Firstborn',
    archetype: 'Majestic River & Dignified Might',
    container: '#D9EEF9',
    ink: '#0C3D54',
    accent: '#0284C7',
    emblemKey: 'river-dawn',
    source: 'Gen 49:3',
    verseText: 'Reuben, you are my firstborn, my might and the beginning of my strength, the excellency of dignity.',
    strengths: ['Warm-hearted empathy', 'Natural nobility and presence', 'Passionate advocate for family'],
    watchouts: ['Emotional volatility and impulsiveness', 'Losing discipline when passions surge'],
    traits: {
      time_discernment: 36,
      bold_initiative: 76,
      sanctuary_devotion: 62,
      tactical_precision: 42,
      fruitful_stewardship: 66,
      pioneering_reach: 66,
      justice_vigilance: 62,
    },
  },
  {
    id: 'simeon',
    name: 'Simeon',
    title: 'The Zealous Guardian',
    archetype: 'Fortress Rampart & Covenant Defender',
    container: '#F2D5D3',
    ink: '#5C1C19',
    accent: '#B91C1C',
    emblemKey: 'rampart-blades',
    source: 'Gen 49:5',
    verseText: 'Simeon and Levi are brothers; instruments of fierce resolve.',
    strengths: ['Unyielding covenant conviction', 'Willingness to stand alone for righteousness', 'Deep fraternal solidarity'],
    watchouts: ['Zeal without wisdom', 'Harshness that alienates those who need mercy'],
    traits: {
      time_discernment: 42,
      bold_initiative: 72,
      sanctuary_devotion: 62,
      tactical_precision: 76,
      fruitful_stewardship: 46,
      pioneering_reach: 46,
      justice_vigilance: 92,
    },
  },
];

export const TRIBES_BY_ID = Object.fromEntries(TRIBES.map((t) => [t.id, t])) as Record<string, TribeDefinition>;

// Assessment Cooldown: 14 days (2 weeks)
export const TRIBAL_ASSESSMENT_COOLDOWN_DAYS = 14;
export const TRIBAL_ASSESSMENT_COOLDOWN_MS = TRIBAL_ASSESSMENT_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

/**
 * Checks whether a disciple can retake the Tribal Calling Assessment.
 */
export function canRetakeAssessment(lastAssessedAt?: number): {
  canRetake: boolean;
  daysRemaining: number;
  nextAvailableDate?: Date;
} {
  if (!lastAssessedAt) {
    return { canRetake: true, daysRemaining: 0 };
  }
  const now = Date.now();
  const elapsed = now - lastAssessedAt;
  if (elapsed >= TRIBAL_ASSESSMENT_COOLDOWN_MS) {
    return { canRetake: true, daysRemaining: 0 };
  }
  const remainingMs = TRIBAL_ASSESSMENT_COOLDOWN_MS - elapsed;
  const daysRemaining = Math.max(1, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
  const nextAvailableDate = new Date(lastAssessedAt + TRIBAL_ASSESSMENT_COOLDOWN_MS);
  return { canRetake: false, daysRemaining, nextAvailableDate };
}

export interface TribalMatchResult {
  primaryTribe: TribeDefinition;
  matchPercentage: number;
  secondaryTribe: TribeDefinition;
  secondaryMatchPercentage: number;
  topAlignedTraits: { trait: TraitDimension; userScore: number; tribeScore: number; delta: number }[];
  allRanked: { tribe: TribeDefinition; distance: number; matchPercentage: number }[];
}

/**
 * Computes Euclidean distance across the 7 personality trait dimensions
 * to match a disciple with their closest biblical ancestral tribe archetype.
 */
export function calculateTribalCalling(userTraits: Record<string, number>): TribalMatchResult {
  // Fallback defaults for missing keys
  const completeUserTraits: Record<string, number> = {};
  TRAIT_DIMENSIONS.forEach((dim) => {
    completeUserTraits[dim.id] = typeof userTraits[dim.id] === 'number' ? Math.max(0, Math.min(100, userTraits[dim.id])) : 50;
  });

  const ranked = TRIBES.map((tribe) => {
    let sumSquaredDiff = 0;
    TRAIT_DIMENSIONS.forEach((dim) => {
      const diff = completeUserTraits[dim.id] - tribe.traits[dim.id];
      sumSquaredDiff += diff * diff;
    });
    const distance = Math.sqrt(sumSquaredDiff);

    // Max theoretical distance in 7D space with coordinate differences up to 100 is ~264.57
    // We calibrate so that a very close match is 95-99% and a distant match is 60-70%
    const matchPercentage = Math.max(55, Math.min(99, Math.round(100 - (distance / 220) * 100)));
    return { tribe, distance, matchPercentage };
  });

  ranked.sort((a, b) => a.distance - b.distance);

  const primary = ranked[0];
  const secondary = ranked[1];

  // Calculate top aligned traits for primary tribe
  const topAlignedTraits = TRAIT_DIMENSIONS.map((dim) => {
    const userScore = completeUserTraits[dim.id];
    const tribeScore = primary.tribe.traits[dim.id];
    const delta = Math.abs(userScore - tribeScore);
    return { trait: dim, userScore, tribeScore, delta };
  })
    .sort((a, b) => a.delta - b.delta)
    .slice(0, 3);

  return {
    primaryTribe: primary.tribe,
    matchPercentage: primary.matchPercentage,
    secondaryTribe: secondary.tribe,
    secondaryMatchPercentage: secondary.matchPercentage,
    topAlignedTraits,
    allRanked: ranked,
  };
}
