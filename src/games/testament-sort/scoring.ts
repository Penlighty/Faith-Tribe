export interface TestamentSortScoringParams {
  tier: 1 | 2 | 3 | 4;
  elapsedSeconds: number;
  isCorrect: boolean;
  correctAnswer: 'OT' | 'NT' | 'BOTH';
  hintUsed: boolean;
  streakCount?: number;
  riskMode?: boolean;
}

export interface TestamentSortScoreResult {
  points: number;
  base: number;
  timeLimit: number;
  timeFactor: number;
  hintFactor: number;
  bothBonus: number;
  streakBonus: number;
  penalty: number;
}

export function getTestamentSortTimeLimit(tier: 1 | 2 | 3 | 4): number {
  const limits: Record<1 | 2 | 3 | 4, number> = {
    1: 15,
    2: 15,
    3: 12,
    4: 12,
  };
  return limits[tier];
}

export function calculateTestamentSortScore(params: TestamentSortScoringParams): TestamentSortScoreResult {
  const {
    tier,
    elapsedSeconds,
    isCorrect,
    correctAnswer,
    hintUsed,
    streakCount = 0,
    riskMode = false,
  } = params;

  const baseValues: Record<1 | 2 | 3 | 4, number> = {
    1: 100,
    2: 150,
    3: 200,
    4: 250,
  };
  const base = baseValues[tier];
  const timeLimit = getTestamentSortTimeLimit(tier);

  if (!isCorrect) {
    const penalty = riskMode ? Math.round(base * 0.2) : 0;
    return {
      points: penalty === 0 ? 0 : -penalty,
      base,
      timeLimit,
      timeFactor: 0,
      hintFactor: 1,
      bothBonus: 1,
      streakBonus: 0,
      penalty,
    };
  }

  const clampedElapsed = Math.min(timeLimit, Math.max(0, elapsedSeconds));
  const timeFactor = Math.max(0.25, 1 - 0.75 * (clampedElapsed / timeLimit));
  const hintFactor = hintUsed ? 0.6 : 1.0;
  const bothBonus = correctAnswer === 'BOTH' ? 1.25 : 1.0;

  // Base scored points
  let points = Math.round(base * timeFactor * hintFactor * bothBonus);

  // Streak bonus on correct answers: 3 in a row +10%, 5 +20%, 7+ +30%
  let streakBonus = 0;
  if (streakCount >= 7) {
    streakBonus = Math.round(base * 0.3);
  } else if (streakCount >= 5) {
    streakBonus = Math.round(base * 0.2);
  } else if (streakCount >= 3) {
    streakBonus = Math.round(base * 0.1);
  }

  points += streakBonus;

  return {
    points,
    base,
    timeLimit,
    timeFactor,
    hintFactor,
    bothBonus,
    streakBonus,
    penalty: 0,
  };
}
