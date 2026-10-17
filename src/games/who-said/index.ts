import { GamePlugin } from '../../engine/types';
import { WhoSaidState } from './types';
import { WhoSaidItem } from '../../engine/content/schemas';
import { allWhoSaidItems } from '../../engine/content/loader';
import { setupWhoSaid, reduceWhoSaid, scoreWhoSaid } from './reducer';
import { WhoSaidHostView } from './HostView';
import { WhoSaidPlayerView } from './PlayerView';

export const whoSaidPlugin: GamePlugin<WhoSaidState, WhoSaidItem[]> = {
  meta: {
    id: 'who-said',
    name: 'Who Said That?',
    tagline: 'Identify the biblical speaker before time runs out. Fastest finger wins!',
    description:
      'A line of spoken Scripture appears on screen with four possible speakers. Lock in the right speaker as fast as you can. When the first correct answer locks, the room enters a 5-second Close Call scramble!',
    rulesSteps: [
      'Read the verbatim spoken Scripture quote displayed on screen.',
      'Tap the correct biblical speaker among the four shuffled options.',
      'Be fast! Points decay with time, and the first correct answer starts a 5-second close-call scramble.',
    ],
    minPlayers: 1,
    maxPlayers: 20,
    supportsTeams: true,
    supportedPlayModes: ['individuals', 'pairs', 'teams'],
    estimatedMinutes: 12,
    accentSeedColor: 'lavender',
    iconName: 'MessageSquare',
    categoryTag: 'Party',
    supportsSoloPractice: true,
  },
  phases: [
    { id: 'countdown', name: 'Get Ready', durationSeconds: 3, hasTimer: true },
    { id: 'question', name: 'Identify Speaker', durationSeconds: 15, hasTimer: true },
    { id: 'reveal', name: 'Scripture Reveal & Scores', durationSeconds: 6, hasTimer: true },
  ],
  content: allWhoSaidItems,
  setup: setupWhoSaid,
  reduce: reduceWhoSaid,
  scoring: scoreWhoSaid,
  HostView: WhoSaidHostView,
  PlayerView: WhoSaidPlayerView,
};
