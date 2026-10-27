import { GamePlugin } from '../../engine/types';
import { FourSignsState } from './types';
import { FourSignsPuzzle } from '../../engine/content/schemas';
import { allFourSignsPuzzles } from '../../engine/content/loader';
import { setupFourSigns, reduceFourSigns, scoreFourSigns } from './reducer';
import { FourSignsHostView } from './HostView';
import { FourSignsPlayerView } from './PlayerView';

export const fourSignsPlugin: GamePlugin<FourSignsState, FourSignsPuzzle[]> = {
  meta: {
    id: 'four-signs',
    name: 'Four Signs',
    tagline: 'Decipher the biblical mystery from 4 cryptic pictograms & clues!',
    description:
      'Four symbols and signs appear on screen representing a famous person, place, or event in Scripture. Connect the clues and lock in the right answer before time runs out!',
    rulesSteps: [
      'Examine the four pictograms and word signs revealed on screen.',
      'Deduce which biblical person, place, or thing connects all four clues.',
      'Tap the correct answer before the clock ticks down. First correct lock starts a 5-second scramble!',
    ],
    minPlayers: 1,
    maxPlayers: 20,
    supportsTeams: true,
    supportedPlayModes: ['individuals', 'pairs', 'teams'],
    estimatedMinutes: 10,
    accentSeedColor: 'amber',
    iconName: 'sparkles',
    categoryTag: 'Party',
    supportsSoloPractice: true,
  },
  phases: [
    { id: 'countdown', name: 'Get Ready', durationSeconds: 3, hasTimer: true },
    { id: 'clues', name: 'Four Signs', durationSeconds: 18, hasTimer: true },
    { id: 'reveal', name: 'Scripture Reveal', durationSeconds: 6, hasTimer: true },
  ],
  content: allFourSignsPuzzles,
  setup: setupFourSigns,
  reduce: reduceFourSigns,
  scoring: scoreFourSigns,
  HostView: FourSignsHostView,
  PlayerView: FourSignsPlayerView,
};
