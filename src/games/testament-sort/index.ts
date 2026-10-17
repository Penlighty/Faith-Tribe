import { GamePlugin } from '../../engine/types';
import { TestamentSortState } from './types';
import { TestamentSortItem } from '../../engine/content/schemas';
import { allTestamentSortItems } from '../../engine/content/loader';
import { setupTestamentSort, reduceTestamentSort, scoreTestamentSort } from './reducer';
import { TestamentSortHostView } from './HostView';
import { TestamentSortPlayerView } from './PlayerView';

export const testamentSortPlugin: GamePlugin<TestamentSortState, TestamentSortItem[]> = {
  meta: {
    id: 'testament-sort',
    name: 'Testament Sort',
    tagline: 'Is it Old Testament, New Testament, or Both? Fast-paced biblical sorting!',
    description:
      'A biblical person, place, or thing appears on screen. Sort it into the right testament before time runs out! Remember: a name counts for a testament if it appears anywhere in it!',
    rulesSteps: [
      'A biblical name appears with a type badge (Person, Place, or Thing).',
      'Decide whether that name appears in the Old Testament, the New Testament, or Both.',
      'Lock in your pick quickly for higher points. Clues are available if you get stuck!',
    ],
    minPlayers: 1,
    maxPlayers: 20,
    supportsTeams: true,
    supportedPlayModes: ['individuals', 'pairs', 'teams'],
    estimatedMinutes: 10,
    accentSeedColor: 'mint',
    iconName: 'BookOpen',
    categoryTag: 'Party',
    supportsSoloPractice: true,
  },
  phases: [
    { id: 'countdown', name: 'Get Ready', durationSeconds: 3, hasTimer: true },
    { id: 'card', name: 'Sort the Name', durationSeconds: 15, hasTimer: true },
    { id: 'reveal', name: 'Scripture Reveal & Scores', durationSeconds: 8, hasTimer: true },
  ],
  content: allTestamentSortItems,
  setup: setupTestamentSort,
  reduce: reduceTestamentSort,
  scoring: scoreTestamentSort,
  HostView: TestamentSortHostView,
  PlayerView: TestamentSortPlayerView,
};
