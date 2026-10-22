import React from 'react';
import { PaletteKey } from '../theme/ThemeContext';

export type PlayMode = 'individuals' | 'pairs' | 'teams';

export type ConnectionMode = 'online' | 'onsite';

export interface HotspotInfo {
  ssid: string;
  password?: string;
  security?: 'WPA' | 'WEP' | 'nopass';
  frequency?: '2.4GHz' | '5GHz' | 'any';
  ipAddress?: string;
}

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  avatarSeed: string;
  teamId?: string;
  score: number;
  isReady?: boolean;
  connectionMode?: ConnectionMode;
}

export interface Team {
  id: string;
  name: string;
  color: string;
  playerIds: string[];
  score: number;
}

export interface SessionConfig {
  roomCode: string;
  selectedGameId: string;
  playMode: PlayMode;
  roundsCount?: number;
  timerMultiplier?: number; // 0.8 fast, 1 normal, 1.2 relaxed
  soundEffects: boolean;
  connectionMode?: ConnectionMode; // 'online' (Cloud) | 'onsite' (Local Hotspot P2P)
  hotspotInfo?: HotspotInfo;
}


export interface LeaderboardEntry {
  id: string; // playerId or teamId
  name: string;
  score: number;
  secondaryScore?: number;
  rank: number;
  avatarSeed?: string;
  teamColor?: string;
  isCurrentUser?: boolean;
}

export interface PhaseDefinition {
  id: string;
  name: string;
  durationSeconds?: number;
  hasTimer?: boolean;
  skippableByHost?: boolean;
}

export interface GameIntent<P = any> {
  type: string;
  playerId: string;
  payload?: P;
  timestamp: number;
}

export interface BaseGameState {
  phaseIndex: number;
  currentPhaseId: string;
  roundNumber: number;
  totalRounds: number;
  phaseTimeRemaining?: number;
  phaseDuration?: number;
  isGameOver: boolean;
  scores: Record<string, number>; // playerId -> score
  scoresBreakdown?: Record<string, Record<string, number>>;
}

export interface GameMeta {
  id: string;
  name: string;
  tagline: string;
  description: string;
  rulesSteps: string[];
  minPlayers: number;
  maxPlayers: number;
  supportsTeams: boolean;
  supportedPlayModes: PlayMode[];
  estimatedMinutes: number;
  accentSeedColor: PaletteKey;
  iconName: string;
  categoryTag: 'Party' | 'Team' | 'Solo' | 'Classic';
  supportsSoloPractice?: boolean;
}

export interface GameViewProps<S extends BaseGameState = BaseGameState> {
  state: S;
  playerId: string;
  isHost: boolean;
  player: Player;
  players: Player[];
  teams: Team[];
  dispatchIntent: (type: string, payload?: any) => void;
  openBottomSheet: (content: { title: string; component: React.ReactNode }) => void;
}

export interface GamePlugin<
  S extends BaseGameState = BaseGameState,
  C = any
> {
  meta: GameMeta;
  phases: PhaseDefinition[];
  content: C;
  setup: (config: SessionConfig, players: Player[], teams: Team[], content: C) => S;
  reduce: (state: S, intent: GameIntent, playerId: string) => S;
  scoring: (state: S, players: Player[], teams: Team[]) => LeaderboardEntry[];
  HostView: React.FC<GameViewProps<S>>;
  PlayerView: React.FC<GameViewProps<S>>;
  SoloView?: React.FC<GameViewProps<S>>;
}

export interface SessionSnapshot<S = any> {
  version: number;
  gameId: string;
  roomCode: string;
  gameState: S;
  players: Player[];
  teams: Team[];
  config: SessionConfig;
  status: 'lobby' | 'in_game' | 'round_results' | 'final_leaderboard';
}
