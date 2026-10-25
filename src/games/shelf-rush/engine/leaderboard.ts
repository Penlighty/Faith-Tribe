import { LeaderboardEntry } from './types';

export interface RawPlayerResult {
  playerId: string;
  name: string;
  avatarSeed?: string;
  completion: number;
  points: number;
  totalTimeMs: number;
  isPerfectRun?: boolean;
  reachedSummit?: boolean;
  isBlitz?: boolean;
  isCurrentUser?: boolean;
}

/**
 * Pure leaderboard comparator and rank assigner.
 * Sort by completion desc, points desc, totalTimeMs asc, then name asc.
 * Equal completion, points, and totalTimeMs share a rank.
 */
export function buildShelfRushLeaderboard(
  results: RawPlayerResult[]
): LeaderboardEntry[] {
  const sorted = [...results].sort((a, b) => {
    if (b.completion !== a.completion) {
      return b.completion - a.completion;
    }
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    if (a.totalTimeMs !== b.totalTimeMs) {
      return a.totalTimeMs - b.totalTimeMs;
    }
    return a.name.localeCompare(b.name);
  });

  const entries: LeaderboardEntry[] = [];
  let currentRank = 1;

  for (let i = 0; i < sorted.length; i++) {
    const p = sorted[i];

    if (i > 0) {
      const prev = sorted[i - 1];
      const isTie =
        prev.completion === p.completion &&
        prev.points === p.points &&
        prev.totalTimeMs === p.totalTimeMs;
      if (!isTie) {
        currentRank = i + 1;
      }
    }

    const badges: string[] = [];
    if (p.isPerfectRun) badges.push('Perfect');
    if (p.reachedSummit) badges.push('Summit');
    if (p.isBlitz) badges.push('Blitz');

    entries.push({
      id: p.playerId,
      playerId: p.playerId,
      name: p.name,
      avatarSeed: p.avatarSeed,
      completion: p.completion,
      score: p.points,
      totalTimeMs: p.totalTimeMs,
      rank: currentRank,
      isCurrentUser: p.isCurrentUser,
      badges,
    });
  }

  return entries;
}

export const rankLeaderboard = buildShelfRushLeaderboard;

