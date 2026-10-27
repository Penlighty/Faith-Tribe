import { BaseGameState } from '../../engine/types';
import { FourSignsPuzzle } from '../../engine/content/schemas';

export type FourSignsMode = 'solo' | 'fastest_finger' | 'pair_duel' | 'team_rush';
export type FourSignsPowerUp = 'fifty' | 'reveal_hint' | 'shield';

export interface PlayerPuzzleState {
  playerId: string;
  selectedOption: string | null;
  locked: boolean;
  lockedAtTime: number; // elapsed seconds
  isCorrect: boolean;
  scoreEarned: number;
  powerUpActive: FourSignsPowerUp | null;
  powerUpsUsed: Record<FourSignsPowerUp, boolean>;
  hiddenOptions: string[]; // Options removed by 50-50
  shuffledOptions: string[]; // Shuffled per-player options
  streakCount: number;
}

export interface FourSignsState extends BaseGameState {
  mode: FourSignsMode;
  currentPuzzle: FourSignsPuzzle;
  puzzlesPool: FourSignsPuzzle[];
  currentIndex: number;
  totalPuzzles: number;
  gentleMode: boolean;

  // Clue display tracking
  revealedCluesCount: number; // 1..4 (or 4 when all visible)
  puzzleStartTime: number;
  timeLimit: number;
  isCloseCall: boolean;
  closeCallTriggeredAt?: number;
  firstCorrectPlayerId?: string;

  // Player states: playerId -> PlayerPuzzleState
  playerStates: Record<string, PlayerPuzzleState>;

  // Solo mode tracking (adaptive tier and 3 strikes)
  strikes: number;
  maxStrikes: number;
  consecutiveCorrect: number;
  consecutiveWrong: number;
}
