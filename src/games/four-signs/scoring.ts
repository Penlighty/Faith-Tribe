import { FourSignsPowerUp } from './types';

export const TIER_BASE_SCORES: Record<1 | 2 | 3 | 4, number> = {
  1: 800,
  2: 1000,
  3: 1200,
  4: 1500,
};

export const FIRST_CORRECT_BONUS = 200;

export function calculateFourSignsTimeLimit(tier: 1 | 2 | 3 | 4, gentleMode = false): number {
  const base = tier >= 3 ? 20 : 18;
  return gentleMode ? Math.round(base * 1.3) : base;
}

export function calculateFourSignsScore(
  tier: 1 | 2 | 3 | 4,
  elapsedSeconds: number,
  timeLimit: number,
  isCorrect: boolean,
  isFirstCorrect: boolean,
  streakCount: number,
  powerUpActive: FourSignsPowerUp | null
): { score: number; isProtected: boolean } {
  if (!isCorrect) {
    if (powerUpActive === 'shield') {
      return { score: 100, isProtected: true };
    }
    return { score: 0, isProtected: false };
  }

  const basePoints = TIER_BASE_SCORES[tier] || 1000;
  const clampedElapsed = Math.max(0, Math.min(elapsedSeconds, timeLimit));

  // Time decay factor: 1.0 down to 0.4
  const timeFactor = 1.0 - (clampedElapsed / timeLimit) * 0.6;
  let score = Math.round(basePoints * timeFactor);

  if (isFirstCorrect) {
    score += FIRST_CORRECT_BONUS;
  }

  // Streak multiplier
  if (streakCount >= 5) {
    score = Math.round(score * 1.5);
  } else if (streakCount >= 3) {
    score = Math.round(score * 1.25);
  }

  return { score, isProtected: false };
}
