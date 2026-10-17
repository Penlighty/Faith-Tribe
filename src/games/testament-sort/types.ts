import { BaseGameState } from '../../engine/types';
import { TestamentSortItem } from '../../engine/content/schemas';

export type TestamentSortMode = 'solo' | 'everyone' | 'huddle' | 'rush';
export type TestamentChoice = 'OT' | 'NT' | 'BOTH';

export interface PlayerCardState {
  playerId: string;
  selectedChoice: TestamentChoice | null;
  locked: boolean;
  lockedAtTime: number; // elapsed seconds when locked
  hintUsed: boolean;
  scoreEarned: number;
  isCorrect: boolean;
  streakCount: number;
}

export interface TeamHuddleVote {
  teamId: string;
  teamChoice: TestamentChoice | null;
  isTie: boolean;
  votes: Record<TestamentChoice, number>;
}

export interface TestamentSortState extends BaseGameState {
  mode: TestamentSortMode;
  currentCard: TestamentSortItem;
  cardsPool: TestamentSortItem[];
  currentIndex: number;
  totalCards: number;
  riskMode: boolean;

  // Round player states: playerId -> PlayerCardState
  playerCardStates: Record<string, PlayerCardState>;

  // Strikes for solo mode (3 strikes = game over)
  strikes: number;
  maxStrikes: number;

  // Huddle mode tracking
  teamHintBudgets: Record<string, number>; // teamId -> remaining hints (starts at 3)
  teamHuddleVotes: Record<string, TeamHuddleVote>; // teamId -> vote info

  // Sort Rush mode tracking
  rushTimeRemaining?: number;
  rushCardsCompleted?: number;

  // Room voting tally on reveal: { OT: count, NT: count, BOTH: count }
  roundTally: Record<TestamentChoice, number>;
  correctAnswer: TestamentChoice;
}
