export interface BibleOrNotScoringParams {
  tier: 1 | 2 | 3 | 4;
  elapsedSeconds: number;
  isCorrect: boolean;
  streakCount?: number;
}

export interface BibleOrNotScoreResult {
  points: number;
  base: number;
  timeLimit: number;
  timeFactor: number;
  speedBonus: number;
  streakBonus: number;
}

export function getBibleOrNotTimeLimit(tier: 1 | 2 | 3 | 4): number {
  const limits: Record<1 | 2 | 3 | 4, number> = {
    1: 15,
    2: 14,
    3: 12,
    4: 10,
  };
  return limits[tier];
}

export function calculateBibleOrNotScore(params: BibleOrNotScoringParams): BibleOrNotScoreResult {
  const { tier, elapsedSeconds, isCorrect, streakCount = 0 } = params;

  const baseValues: Record<1 | 2 | 3 | 4, number> = {
    1: 100,
    2: 150,
    3: 200,
    4: 250,
  };
  const base = baseValues[tier];
  const timeLimit = getBibleOrNotTimeLimit(tier);

  if (!isCorrect) {
    return {
      points: 0,
      base,
      timeLimit,
      timeFactor: 0,
      speedBonus: 0,
      streakBonus: 0,
    };
  }

  const clampedElapsed = Math.min(timeLimit, Math.max(0, elapsedSeconds));
  // Speed factor: 1.0 (instant swipe) down to 0.4 (at final second)
  const timeFactor = Math.max(0.4, 1 - 0.6 * (clampedElapsed / timeLimit));
  const speedBonus = Math.round(base * (timeFactor - 0.4));

  // Streak bonus: 3+ (+15%), 5+ (+25%), 7+ (+40%)
  let streakBonus = 0;
  if (streakCount >= 7) {
    streakBonus = Math.round(base * 0.4);
  } else if (streakCount >= 5) {
    streakBonus = Math.round(base * 0.25);
  } else if (streakCount >= 3) {
    streakBonus = Math.round(base * 0.15);
  }

  const points = Math.round(base * 0.4) + speedBonus + streakBonus;

  return {
    points,
    base,
    timeLimit,
    timeFactor,
    speedBonus,
    streakBonus,
  };
}
