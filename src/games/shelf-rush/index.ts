import { GamePlugin } from '../../engine/types';
import { ShelfRushGameState } from './engine/types';
import { allBooks, allSchemes } from './engine/loader';
import { setupShelfRush, reduceShelfRush, scoreShelfRush } from './reducer';
import { ShelfRushHostView } from './HostView';
import { ShelfRushPlayerView } from './PlayerView';

export const shelfRushPlugin: GamePlugin<ShelfRushGameState, any> = {
  meta: {
    id: 'shelf-rush',
    name: 'Shelf Rush',
    tagline: 'Sort Bible books in record time across 8 rich schemes and The Ascent campaign!',
    description:
      'Can you place Bible books onto their proper shelves before the clock runs out? Test your biblical recall across testaments, sections, Hebrew canon, chapter counts, and conquer The Ascent!',
    rulesSteps: [
      'A Bible book appears on the shelf belt.',
      'Tap or press 1-7 (or arrow keys) to sort it into the right category before time runs out.',
      'Maintain streaks for bonus multipliers, and conquer 15 steps in The Ascent!',
    ],
    minPlayers: 1,
    maxPlayers: 20,
    supportsTeams: false,
    supportedPlayModes: ['individuals'],
    estimatedMinutes: 5,
    accentSeedColor: 'purple',
    iconName: 'book-open',
    categoryTag: 'Party',
    supportsSoloPractice: true,
    hostCanPlay: true,
  },
  phases: [
    { id: 'setup', name: 'Scheme & Mode Setup' },
    { id: 'countdown', name: 'Get Ready', durationSeconds: 3, hasTimer: true },
    { id: 'run', name: 'Shelf Rush!', hasTimer: true },
    { id: 'results', name: 'Mastery & Standings' },
  ],
  content: { books: allBooks, schemes: allSchemes },
  setup: setupShelfRush,
  reduce: reduceShelfRush,
  scoring: scoreShelfRush,
  HostView: ShelfRushHostView,
  PlayerView: ShelfRushPlayerView,
  SoloView: ShelfRushPlayerView,
};
