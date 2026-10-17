import { GamePlugin } from '../../engine/types';
import { HotCoalState, HotCoalContent } from './types';
import contentData from './content.json';
import { setupHotCoal, reduceHotCoal, scoreHotCoal } from './reducer';
import { HotCoalHostView } from './HostView';
import { HotCoalPlayerView } from './PlayerView';

export const hotCoalPlugin: GamePlugin<HotCoalState, HotCoalContent> = {
  meta: {
    id: 'hot-coal',
    name: 'Hot Coal',
    tagline: 'Pass the burning coal before the fuse runs out. Challenge bad answers!',
    description:
      'A fiery biblical hot-potato! One disciple holds the coal, shouts a valid scripture item in the category, and taps another player to pass it. If someone shouts a fake or duplicate answer, hit Challenge! Fewest burns wins.',
    rulesSteps: [
      'Look at the active Biblical category on screen.',
      'When you hold the coal, shout a valid item and tap a player on your screen to pass it.',
      'Challenge players who repeat an item or make up an answer. Avoid burns!',
    ],
    minPlayers: 5,
    maxPlayers: 20,
    supportsTeams: false,
    supportedPlayModes: ['individuals'],
    estimatedMinutes: 10,
    accentSeedColor: 'peach',
    iconName: 'Flame',
    categoryTag: 'Party',
    supportsSoloPractice: false,
  },
  phases: [
    { id: 'category', name: 'Biblical Category', durationSeconds: 15, hasTimer: true },
    { id: 'play', name: 'Pass The Coal!', durationSeconds: 40, hasTimer: true },
    { id: 'challenge', name: 'Challenge Review', durationSeconds: 25, hasTimer: true },
    { id: 'burn', name: 'Round Burn Results', durationSeconds: 15, hasTimer: true },
  ],
  content: contentData as HotCoalContent,
  setup: setupHotCoal,
  reduce: reduceHotCoal,
  scoring: scoreHotCoal,
  HostView: HotCoalHostView,
  PlayerView: HotCoalPlayerView,
};
