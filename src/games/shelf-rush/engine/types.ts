import { SpeedSetting, AccessTimeSetting, LifeRule } from './constants';

export interface ShelfRushBook {
  id: string;
  name: string;
  abbr: string;
  order: number;
  testament: 'OT' | 'NT';
  chapters: number;
  blurb: string;
}

export interface ShelfRushBin {
  id: string;
  label: string;
  icon?: string | null;
}

export interface ShelfRushScheme {
  id: string;
  name: string;
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tradition: string;
  deckSize: number;
  bins: ShelfRushBin[];
  assign: Record<string, string>;
  notes?: Record<string, string>;
  excluded?: Record<string, string>;
}

export interface ShelfRushCard {
  index: number;
  step?: number;
  bookId: string;
  schemeId: string;
  tier?: 'easy' | 'medium' | 'hard';
  schemeChange?: boolean;
  stepStart?: boolean;
}

export interface ShelfRushConfig {
  mode: 'scheme' | 'ascent';
  schemeId?: string;
  length?: 'full' | 'short';
  speed: SpeedSetting;
  lifeRule: LifeRule;
  play?: 'solo' | 'race' | 'practice';
  playMode?: 'solo' | 'race' | 'practice';
  accessTime: AccessTimeSetting;
  weak?: boolean;
  weakBooks?: boolean;
  seed?: number;
}

export interface CardLogEntry {
  cardIndex: number;
  bookId: string;
  schemeId: string;
  binId: string | null;
  correct: boolean;
  ms: number;
  windowMs: number;
  points: number;
  livesAfter: number;
}

export type ShelfRushRunLog = CardLogEntry;

export interface RunState {
  config: ShelfRushConfig;
  deck: ShelfRushCard[];
  cursor: number;
  lives: number;
  maxLives: number;
  streak: number;
  bestStreak: number;
  score: number;
  correctBooks: Set<string>;
  log: CardLogEntry[];
  requeueCount: number;
  step: number;
  stepStrikes: number;
  status: 'ready' | 'showing' | 'revealing' | 'won' | 'lost' | 'finished';
  shownAt?: number;
}

export type RunEvent =
  | { type: 'START' }
  | { type: 'SHOW'; timestamp: number }
  | { type: 'SORT'; binId: string; timestamp: number }
  | { type: 'TIMEOUT'; timestamp: number }
  | { type: 'REVEAL_DONE' }
  | { type: 'RESUME' };

export interface LeaderboardEntry {
  id: string;
  playerId: string;
  name: string;
  avatarSeed?: string;
  completion: number;
  score: number;
  totalTimeMs: number;
  rank: number;
  isCurrentUser?: boolean;
  badges: string[];
}


export interface PlayerProgressData {
  cardsDone: number;
  correctCount: number;
  score: number;
  lives: number;
  maxLives: number;
  streak: number;
  status: 'ready' | 'showing' | 'revealing' | 'won' | 'lost' | 'finished';
  lastUpdateMs: number;
  totalTimeMs?: number;
  log?: CardLogEntry[];
  summary?: Record<string, { seen: number; miss: number }>;
}

export interface ShelfRushGameState {
  phaseIndex: number;
  currentPhaseId: 'setup' | 'countdown' | 'run' | 'collect' | 'results';
  roundNumber: number;
  totalRounds: number;
  phaseTimeRemaining?: number;
  phaseDuration?: number;
  isGameOver: boolean;
  scores: Record<string, number>;
  config: ShelfRushConfig;
  deck: ShelfRushCard[];
  playerProgress: Record<string, PlayerProgressData>;
  startTime?: number;
  capMs?: number;
}

