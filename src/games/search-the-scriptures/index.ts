import { GamePlugin } from '../../engine/types';
import { SearchTheScripturesState, SearchLevel } from './types';
import { setupSearchTheScriptures, reduceSearchTheScriptures, scoreSearchTheScriptures } from './reducer';
import { SearchTheScripturesHostView } from './HostView';
import { SearchTheScripturesPlayerView } from './PlayerView';
import rawLevels from './content.json';

export const searchTheScripturesPlugin: GamePlugin<SearchTheScripturesState, SearchLevel[]> = {
  meta: {
    id: 'search-the-scriptures',
    name: 'Search the Scriptures',
    tagline: 'Uncover sacred words woven across the living biblical word search grid!',
    description:
      'Search and connect hidden biblical words across horizontal, vertical, and diagonal paths. Reach the target score to advance through holy themes, or finish early to lock in your room rank!',
    rulesSteps: [
      'Drag or tap letters across the grid to spell out the sacred words listed beneath the puzzle.',
      'Words can run in all 8 directions: across right/left, down, up, and diagonally!',
      'Reach the target score to unlock the next theme, or keep searching to rake in maximum points!',
    ],
    minPlayers: 1,
    maxPlayers: 24,
    supportsTeams: true,
    supportedPlayModes: ['individuals', 'pairs', 'teams'],
    estimatedMinutes: 10,
    accentSeedColor: 'sapphire',
    iconName: 'search',
    categoryTag: 'Party',
    supportsSoloPractice: true,
    hostCanPlay: true,
  },
  phases: [
    { id: 'search', name: 'Scripture Search', durationSeconds: 240, hasTimer: true },
  ],
  content: rawLevels as SearchLevel[],
  setup: setupSearchTheScriptures,
  reduce: reduceSearchTheScriptures,
  scoring: scoreSearchTheScriptures,
  HostView: SearchTheScripturesHostView,
  PlayerView: SearchTheScripturesPlayerView,
};
