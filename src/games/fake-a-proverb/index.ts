import { GamePlugin } from '../../engine/types';
import { FakeAProverbState, FakeAProverbContent } from './types';
import contentData from './content.json';
import { setupFakeAProverb, reduceFakeAProverb, scoreFakeAProverb } from './reducer';
import { FakeAProverbHostView } from './HostView';
import { FakeAProverbPlayerView } from './PlayerView';

export const fakeAProverbPlugin: GamePlugin<FakeAProverbState, FakeAProverbContent> = {
  meta: {
    id: 'fake-a-proverb',
    name: 'Fake-a-Proverb',
    tagline: 'Write deceptive endings to ancient Proverbs. Spot the real verse!',
    description:
      'The host displays the first half of a real biblical proverb. Disciples secretly write believable fake endings. Everyone votes on which ending is genuine Scripture. Fool your friends for bonus points!',
    rulesSteps: [
      'Read the first half of a genuine biblical proverb on screen.',
      'Secretly write a convincing fake ending on your device within 45 seconds.',
      'Vote for the genuine scripture among all shuffled endings (no voting for your own!).',
    ],
    minPlayers: 4,
    maxPlayers: 20,
    supportsTeams: true,
    supportedPlayModes: ['individuals', 'pairs', 'teams'],
    estimatedMinutes: 15,
    accentSeedColor: 'butter',
    iconName: 'Scroll',
    categoryTag: 'Party',
    supportsSoloPractice: true,
  },
  phases: [
    { id: 'prompt', name: 'Scripture Prompt', durationSeconds: 15, hasTimer: true },
    { id: 'write', name: 'Write Fake Ending', durationSeconds: 45, hasTimer: true },
    { id: 'vote', name: 'Vote on Genuine Verse', durationSeconds: 30, hasTimer: true },
    { id: 'reveal', name: 'Scripture Reveal & Scores', durationSeconds: 20, hasTimer: true },
  ],
  content: contentData as FakeAProverbContent,
  setup: setupFakeAProverb,
  reduce: reduceFakeAProverb,
  scoring: scoreFakeAProverb,
  HostView: FakeAProverbHostView,
  PlayerView: FakeAProverbPlayerView,
};
