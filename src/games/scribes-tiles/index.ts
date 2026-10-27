import { GamePlugin } from '../../engine/types';
import { ScribesTilesState } from './types';
import { ScribesTilesWord } from '../../engine/content/schemas';
import { allScribesTilesWords } from '../../engine/content/loader';
import { setupScribesTiles, reduceScribesTiles, scoreScribesTiles } from './reducer';
import { ScribesTilesHostView } from './HostView';
import { ScribesTilesPlayerView } from './PlayerView';

export const scribesTilesPlugin: GamePlugin<ScribesTilesState, ScribesTilesWord[]> = {
  meta: {
    id: 'scribes-tiles',
    name: "Scribe's Tiles",
    tagline: 'Unscramble ancient letter tiles to spell the biblical word!',
    description:
      'A scribe clue appears with a scrambled rack of letter tiles and tricky decoys. Tap and assemble the letters into the sacred word before the sands run out!',
    rulesSteps: [
      'Read the biblical clue describing a person, place, book, or concept.',
      'Tap letters on your tile rack to place them into the answer slots.',
      'Beware of decoy letters! First scribe to correctly spell the word triggers a 5-second scramble!',
    ],
    minPlayers: 1,
    maxPlayers: 20,
    supportsTeams: true,
    supportedPlayModes: ['individuals', 'pairs', 'teams'],
    estimatedMinutes: 12,
    accentSeedColor: 'rust',
    iconName: 'scroll',
    categoryTag: 'Party',
    supportsSoloPractice: true,
  },
  phases: [
    { id: 'countdown', name: 'Get Ready', durationSeconds: 3, hasTimer: true },
    { id: 'solve', name: "Scribe's Rack", durationSeconds: 25, hasTimer: true },
    { id: 'reveal', name: 'Scripture Reveal', durationSeconds: 6, hasTimer: true },
  ],
  content: allScribesTilesWords,
  setup: setupScribesTiles,
  reduce: reduceScribesTiles,
  scoring: scoreScribesTiles,
  HostView: ScribesTilesHostView,
  PlayerView: ScribesTilesPlayerView,
};
