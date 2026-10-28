import { BaseGameState } from '../../engine/types';

export type CellCoord = [number, number];

export interface PlacedWord {
  word: string;
  start: CellCoord;
  end: CellCoord;
  cells: CellCoord[];
  direction: [number, number];
}

export interface GeneratedWordSearchGrid {
  grid: string[][];
  size: number;
  placedWords: PlacedWord[];
  words: string[];
}

export interface SearchLevel {
  level: number;
  theme: string;
  scripture: string;
  clue: string;
  words: string[];
  targetScore: number;
  gridSize: number;
}

export interface PlayerWordSearchProgress {
  playerId: string;
  currentLevelIndex: number;
  score: number;
  foundWords: string[];
  foundWordsByLevel: Record<number, string[]>;
  levelScores: Record<number, number>;
  targetReached: boolean;
  isFinished: boolean;
  finishedTimestamp?: number;
  streak: number;
  lastFoundTimestamp?: number;
}

export interface SearchActivityItem {
  id: string;
  playerId: string;
  playerName: string;
  text: string;
  points: number;
  timestamp: number;
}

export interface SearchTheScripturesState extends BaseGameState {
  levels: SearchLevel[];
  playerProgress: Record<string, PlayerProgress>;
  activityFeed: SearchActivityItem[];
}

export type PlayerProgress = PlayerWordSearchProgress;
