import { BaseGameState } from '../../engine/types';

export interface PassageItem {
  id: string;
  title: string;
  reference: string;
  keywords: string[];
  similarPassageId?: string;
  wrongGuesses: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  needsReview?: boolean;
}

export interface TaresContent {
  passages: PassageItem[];
}

export interface TaresState extends BaseGameState {
  currentPassage: PassageItem;
  plannedPassages?: PassageItem[];
  similarPassage?: PassageItem;
  twinStoriesMode: boolean;
  tarePlayerIds: string[]; // 1 tare per team or 1-2 tares for individuals
  activeCluePlayerIndex: number;
  cluePlayerOrder: string[];
  votes: Record<string, string>; // voterId -> accusedPlayerId
  tareStealGuess?: string;
  isTareCaught?: boolean;
  isStealSuccessful?: boolean;
  roundScores: Record<string, number>;
}
