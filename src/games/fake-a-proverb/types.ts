import { BaseGameState } from '../../engine/types';

export interface ProverbItem {
  id: string;
  firstHalf: string;
  realEnding: string;
  reference: string;
  translation: 'KJV' | 'WEB' | 'ASV';
  difficulty: 'easy' | 'medium' | 'hard';
  needsReview?: boolean;
}

export interface FakeAProverbContent {
  proverbs: ProverbItem[];
}

export interface ProverbSubmission {
  playerId: string;
  ending: string;
}

export interface ProverbVote {
  voterId: string;
  choiceEnding: string;
}

export interface FakeAProverbState extends BaseGameState {
  currentProverb: ProverbItem;
  plannedProverbs?: ProverbItem[];
  submissions: Record<string, string>; // playerId -> submitted fake ending
  votes: Record<string, string>; // voterId -> choiceEnding
  shuffledEndings: { ending: string; isReal: boolean; authorId?: string }[];
  roundScores: Record<string, number>;
}
