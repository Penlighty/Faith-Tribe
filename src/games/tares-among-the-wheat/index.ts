import { GamePlugin } from '../../engine/types';
import { TaresState, TaresContent } from './types';
import contentData from './content.json';
import { setupTares, reduceTares, scoreTares } from './reducer';
import { TaresHostView } from './HostView';
import { TaresPlayerView } from './PlayerView';

export const taresPlugin: GamePlugin<TaresState, TaresContent> = {
  meta: {
    id: 'tares-among-the-wheat',
    name: 'Tares Among the Wheat',
    tagline: 'Spot the imposter who does not know the passage before they steal the win!',
    description:
      'All righteous wheat receive a secret biblical passage title. The deceptive tare receives nothing (or a twin story). Players take turns saying a short spoken clue. Debate, vote on who is the tare, and beware of a last-second steal guess! First to 10 points wins.',
    rulesSteps: [
      'Wheat read the secret passage title; the tare only knows they are an imposter.',
      'Take turns speaking aloud a one-word or brief clue to prove you know the story.',
      'Debate together, vote to expose the tare. If caught, the tare gets one chance to steal!',
    ],
    minPlayers: 6,
    maxPlayers: 20,
    supportsTeams: true,
    supportedPlayModes: ['individuals', 'teams'],
    estimatedMinutes: 20,
    accentSeedColor: 'mint',
    iconName: 'Wheat',
    categoryTag: 'Team',
    supportsSoloPractice: false,
  },
  phases: [
    { id: 'deal', name: 'Secret Scripture Cards', durationSeconds: 15, hasTimer: true },
    { id: 'clues', name: 'Spoken Clues in Turn', durationSeconds: 60, hasTimer: true },
    { id: 'debate', name: 'Room Debate', durationSeconds: 120, hasTimer: true },
    { id: 'vote', name: 'Cast Your Accusation', durationSeconds: 30, hasTimer: true },
    { id: 'reveal', name: 'Tare Unmasking & Steal', durationSeconds: 25, hasTimer: true },
  ],
  content: contentData as TaresContent,
  setup: setupTares,
  reduce: reduceTares,
  scoring: scoreTares,
  HostView: TaresHostView,
  PlayerView: TaresPlayerView,
};
