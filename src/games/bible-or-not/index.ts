import { GamePlugin } from '../../engine/types';
import { BibleOrNotState } from './types';
import { BibleOrNotItem } from '../../engine/content/schemas';
import { allBibleOrNotItems } from '../../engine/content/loader';
import { setupBibleOrNot, reduceBibleOrNot, scoreBibleOrNot } from './reducer';
import { BibleOrNotHostView } from './HostView';
import { BibleOrNotPlayerView } from './PlayerView';

export const bibleOrNotPlugin: GamePlugin<BibleOrNotState, BibleOrNotItem[]> = {
  meta: {
    id: 'bible-or-not',
    name: 'Bible or Not',
    tagline: 'Swipe Right if in Scripture, Left if not! Unmask famous biblical myths.',
    description:
      'A popular saying, proverb, or quote appears on a 3D flashcard stack. Swipe Right if it is in the Bible, or Swipe Left if it is not! Unmask common folklore and master the true Word of God.',
    rulesSteps: [
      'Read the quote or proverb on the top flashcard.',
      'Swipe Right (or press →) if the phrase is truly in the Bible.',
      'Swipe Left (or press ←) if it is folklore, literature, or a common myth.',
      'Survive tournament rounds to make the final podium, or test your mastery solo across 4 tiers!',
    ],
    minPlayers: 1,
    maxPlayers: 24,
    supportsTeams: true,
    supportedPlayModes: ['individuals', 'pairs', 'teams'],
    estimatedMinutes: 10,
    accentSeedColor: 'cyan',
    iconName: 'book-open',
    categoryTag: 'Party',
    supportsSoloPractice: true,
  },
  phases: [
    { id: 'countdown', name: 'Get Ready', durationSeconds: 3, hasTimer: true },
    { id: 'card', name: 'Swipe the Card', durationSeconds: 15, hasTimer: true },
    { id: 'reveal', name: 'Scripture Reveal', durationSeconds: 6, hasTimer: true },
    { id: 'roundSummary', name: 'Round Survivor Reveal', durationSeconds: 5, hasTimer: true },
  ],
  content: allBibleOrNotItems,
  setup: setupBibleOrNot,
  reduce: reduceBibleOrNot,
  scoring: scoreBibleOrNot,
  HostView: BibleOrNotHostView,
  PlayerView: BibleOrNotPlayerView,
};
