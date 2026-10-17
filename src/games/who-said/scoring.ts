export interface WhoSaidScoringParams {
  tier: 1 | 2 | 3 | 4;
  quote: string;
  elapsedSeconds: number;
  isCorrect: boolean;
  isFirstCorrect?: boolean;
  streakCount?: number;
  gentleMode?: boolean;
  powerUp?: 'fifty' | 'double' | 'shield' | null;
  isTeamSweep?: boolean;
}

export interface WhoSaidScoreResult {
  points: number;
  base: number;
  timeLimit: number;
  timeFactor: number;
  firstCorrectBonus: number;
  penalty: number;
  streakBonus: number;
  powerUpModifier: number;
  teamSweepBonus: number;
  shieldUsed: boolean;
}

export function calculateWhoSaidTimeLimit(quote: string, gentleMode: boolean = false): number {
  const words = quote.trim().split(/\s+/).filter(Boolean).length;
  const raw = 8 + 0.5 * words;
  const clamped = Math.min(25, Math.max(12, raw));
  return gentleMode ? clamped * 1.5 : clamped;
}

export function calculateWhoSaidScore(params: WhoSaidScoringParams): WhoSaidScoreResult {
  const {
    tier,
    quote,
    elapsedSeconds,
    isCorrect,
    isFirstCorrect = false,
    streakCount = 0,
    gentleMode = false,
    powerUp = null,
    isTeamSweep = false,
  } = params;

  const baseValues: Record<1 | 2 | 3 | 4, number> = {
    1: 100,
    2: 150,
    3: 200,
    4: 300,
  };
  const base = baseValues[tier];
  const timeLimit = calculateWhoSaidTimeLimit(quote, gentleMode);

  // If wrong
  if (!isCorrect) {
    if (gentleMode) {
      return {
        points: 0,
        base,
        timeLimit,
        timeFactor: 0,
        firstCorrectBonus: 0,
        penalty: 0,
        streakBonus: 0,
        powerUpModifier: 1,
        teamSweepBonus: 0,
        shieldUsed: false,
      };
    }

    if (powerUp === 'shield') {
      return {
        points: 0,
        base,
        timeLimit,
        timeFactor: 0,
        firstCorrectBonus: 0,
        penalty: 0,
        streakBonus: 0,
        powerUpModifier: 1,
        teamSweepBonus: 0,
        shieldUsed: true,
      };
    }

    let penaltyRatio = 0.25;
    if (powerUp === 'double') {
      penaltyRatio = 0.5; // Double down penalty
    }

    const penalty = Math.round(base * penaltyRatio);
    return {
      points: -penalty,
      base,
      timeLimit,
      timeFactor: 0,
      firstCorrectBonus: 0,
      penalty,
      streakBonus: 0,
      powerUpModifier: powerUp === 'double' ? 2 : 1,
      teamSweepBonus: 0,
      shieldUsed: false,
    };
  }

  // Correct Answer
  const clampedElapsed = Math.min(timeLimit, Math.max(0, elapsedSeconds));
  const timeFactor = Math.max(0.2, 1 - 0.8 * (clampedElapsed / timeLimit));
  let calculated = Math.round(base * timeFactor);

  // First correct bonus (+20% of base)
  let firstCorrectBonus = 0;
  if (isFirstCorrect) {
    firstCorrectBonus = Math.round(base * 0.2);
  }

  // Streak bonus on correct answers: 3 in a row +10%, 5 +20%, 7+ +30%
  let streakBonus = 0;
  if (streakCount >= 7) {
    streakBonus = Math.round(base * 0.3);
  } else if (streakCount >= 5) {
    streakBonus = Math.round(base * 0.2);
  } else if (streakCount >= 3) {
    streakBonus = Math.round(base * 0.1);
  }

  // Team sweep bonus (+25% of base)
  let teamSweepBonus = 0;
  if (isTeamSweep) {
    teamSweepBonus = Math.round(base * 0.25);
  }

  let totalBeforePowerUp = calculated + firstCorrectBonus + streakBonus + teamSweepBonus;

  // Power-up modifications
  let powerUpModifier = 1;
  if (powerUp === 'fifty') {
    powerUpModifier = 0.5;
    totalBeforePowerUp = Math.round(totalBeforePowerUp * 0.5);
  } else if (powerUp === 'double') {
    powerUpModifier = 2.0;
    totalBeforePowerUp = Math.round(totalBeforePowerUp * 2.0);
  }

  return {
    points: totalBeforePowerUp,
    base,
    timeLimit,
    timeFactor,
    firstCorrectBonus,
    penalty: 0,
    streakBonus,
    powerUpModifier,
    teamSweepBonus,
    shieldUsed: false,
  };
}
