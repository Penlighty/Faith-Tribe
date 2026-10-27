export const TIER_BASE_SCORES: Record<1 | 2 | 3 | 4, number> = {
  1: 800,
  2: 1000,
  3: 1200,
  4: 1500,
};

export const FIRST_SOLVER_BONUS = 250;

export function calculateScribesTilesTimeLimit(tier: 1 | 2 | 3 | 4, gentleMode = false): number {
  const base = tier === 1 ? 22 : tier === 2 ? 25 : tier === 3 ? 28 : 30;
  return gentleMode ? Math.round(base * 1.3) : base;
}

export function calculateScribesTilesScore(
  tier: 1 | 2 | 3 | 4,
  wordLength: number,
  elapsedSeconds: number,
  timeLimit: number,
  isCorrect: boolean,
  isFirstCorrect: boolean,
  streakCount: number,
  hintsUsed: number
): number {
  if (!isCorrect) return 0;

  const basePoints = (TIER_BASE_SCORES[tier] || 1000) + Math.max(0, wordLength - 4) * 30;
  const clampedElapsed = Math.max(0, Math.min(elapsedSeconds, timeLimit));

  // Time decay factor: 1.0 down to 0.4
  const timeFactor = 1.0 - (clampedElapsed / timeLimit) * 0.6;
  let score = Math.round(basePoints * timeFactor);

  if (isFirstCorrect) {
    score += FIRST_SOLVER_BONUS;
  }

  // Deduct penalty for hints used
  if (hintsUsed > 0) {
    score = Math.max(200, score - hintsUsed * 100);
  }

  // Streak multiplier
  if (streakCount >= 5) {
    score = Math.round(score * 1.5);
  } else if (streakCount >= 3) {
    score = Math.round(score * 1.25);
  }

  return score;
}
