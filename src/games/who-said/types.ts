import { BaseGameState } from '../../engine/types';
import { WhoSaidItem } from '../../engine/content/schemas';

export type WhoSaidMode = 'solo' | 'fastest_finger' | 'pair_duel' | 'team_rush';
export type WhoSaidPowerUp = 'fifty' | 'double' | 'shield';

export interface PlayerQuestionState {
  playerId: string;
  selectedOption: string | null;
  locked: boolean;
  lockedAtTime: number; // elapsed seconds
  isCorrect: boolean;
  scoreEarned: number;
  powerUpActive: WhoSaidPowerUp | null;
  powerUpsUsed: Record<WhoSaidPowerUp, boolean>;
  hiddenOptions: string[]; // Options removed by Fifty-Fifty
  shuffledOptions: string[]; // Shuffled per-player options
  streakCount: number;
}

export interface WhoSaidState extends BaseGameState {
  mode: WhoSaidMode;
  currentQuestion: WhoSaidItem;
  questionsPool: WhoSaidItem[];
  currentIndex: number;
  totalQuestions: number;
  gentleMode: boolean;

  // Question timing
  questionStartTime: number;
  timeLimit: number;
  isCloseCall: boolean;
  closeCallTriggeredAt?: number;
  firstCorrectPlayerId?: string;

  // Player question states: playerId -> PlayerQuestionState
  playerStates: Record<string, PlayerQuestionState>;

  // Solo mode tracking (adaptive tier and 3 strikes)
  strikes: number;
  maxStrikes: number;
  consecutiveCorrect: number;
  consecutiveWrong: number;
}
