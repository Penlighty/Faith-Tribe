import { BaseGameState } from '../../engine/types';
import { BibleOrNotItem } from '../../engine/content/schemas';

export type BibleOrNotChoice = 'IN_BIBLE' | 'NOT_IN_BIBLE';

export interface PlayerCardState {
  playerId: string;
  selectedChoice: BibleOrNotChoice | null;
  locked: boolean;
  lockedAtElapsed: number; // seconds into the card phase when player locked
  scoreEarned: number;
  isCorrect: boolean;
  streakCount: number;
}

export interface TournamentRoundSummary {
  roundNumber: number;
  roundName: string;
  survivorIds: string[];
  eliminatedIds: string[];
}

export interface BibleOrNotState extends BaseGameState {
  mode: 'tournament' | 'standard' | 'solo';
  currentCard: BibleOrNotItem;
  cardsPool: BibleOrNotItem[];
  currentIndex: number;
  totalCards: number;

  // Tournament / Elimination Mechanics
  currentRound: number;
  totalRounds: number;
  cardsPerRound: number;
  cardIndexInRound: number;
  eliminatedPlayerIds: string[];
  survivingPlayerIds: string[];
  podium: {
    first?: string;
    second?: string;
    third?: string;
  };

  // Round player states: playerId -> PlayerCardState
  playerCardStates: Record<string, PlayerCardState>;

  // Room voting tally for current card reveal
  roundTally: Record<BibleOrNotChoice, number>;
  correctAnswer: BibleOrNotChoice;

  // Solo mode tracking
  soloTier: 1 | 2 | 3 | 4;
  strikes: number;
  maxStrikes: number;
  levelTarget: number;
  levelProgress: number;
}
