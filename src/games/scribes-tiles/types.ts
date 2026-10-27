import { BaseGameState } from '../../engine/types';
import { ScribesTilesWord } from '../../engine/content/schemas';

export type ScribesTilesMode = 'solo' | 'fastest_finger' | 'pair_duel' | 'team_rush';

export interface ScribeTile {
  id: string;
  letter: string;
}

export interface PlayerScribesTilesState {
  playerId: string;
  rack: ScribeTile[]; // Available tiles on rack
  placedTiles: (ScribeTile | null)[]; // Tiles placed into the answer slots
  locked: boolean;
  lockedAtTime: number; // elapsed seconds
  isCorrect: boolean;
  scoreEarned: number;
  streakCount: number;
  hintsUsed: number;
  shakeError: boolean;
}

export interface ScribesTilesState extends BaseGameState {
  mode: ScribesTilesMode;
  currentWord: ScribesTilesWord;
  wordsPool: ScribesTilesWord[];
  currentIndex: number;
  totalWords: number;
  gentleMode: boolean;

  wordStartTime: number;
  timeLimit: number;
  isCloseCall: boolean;
  closeCallTriggeredAt?: number;
  firstCorrectPlayerId?: string;

  playerStates: Record<string, PlayerScribesTilesState>;

  // Solo mode tracking (adaptive tier and 3 strikes)
  strikes: number;
  maxStrikes: number;
  consecutiveCorrect: number;
  consecutiveWrong: number;
}
