import { BASE_POINTS, binFactor } from './constants';

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * Calculates card score for a correct sort.
 * Wrong sort or timeout gives 0 points.
 */
export function calculateCardScore(
  numBins: number,
  remainingMs: number,
  windowMs: number,
  streakBefore: number
): number {
  const speedFactor = 1 + clamp(remainingMs / windowMs, 0, 1);
  const streakMult = Math.min(2, 1 + 0.1 * Math.floor(streakBefore / 5));
  const factor = binFactor(numBins);
  return Math.round(BASE_POINTS * factor * speedFactor * streakMult);
}

export interface SchemeEndBonusParams {
  completed: boolean;
  livesRemaining: number;
  strikesUsed: number;
}

export function calculateSchemeRunBonus(params: SchemeEndBonusParams): number {
  if (!params.completed) return 0;
  let bonus = 100; // completion bonus
  bonus += params.livesRemaining * 50; // per life remaining
  if (params.strikesUsed === 0) {
    bonus += 100; // PERFECT_RUN
  }
  return bonus;
}

export interface AscentEndBonusParams {
  flawlessStepsCount: number; // steps cleared with 0 strikes
  reachedSummit: boolean;
  livesRemaining: number;
}

export function calculateAscentRunBonus(params: AscentEndBonusParams): number {
  let bonus = params.flawlessStepsCount * 25;
  if (params.reachedSummit && params.livesRemaining > 0) {
    bonus += 150; // Summit reached
    bonus += params.livesRemaining * 50; // per life remaining at Summit
  }
  return bonus;
}
