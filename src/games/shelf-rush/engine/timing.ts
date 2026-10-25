import {
  getWindowRangeForBins,
  SPEED_MULTIPLIER,
  ACCESS_TIME_MULTIPLIER,
  SpeedSetting,
  AccessTimeSetting,
  MIN_WINDOW_MS,
  SCHEME_CHANGE_GRACE_MS,
} from './constants';

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export interface SchemeTimingParams {
  numBins: number;
  deckSize: number;
  correctCount: number;
  speed: SpeedSetting;
  accessTime: AccessTimeSetting;
}

export function calculateSchemeWindowMs(params: SchemeTimingParams): number {
  const { start, floor } = getWindowRangeForBins(params.numBins);
  const progress = Math.min(1, params.correctCount / Math.min(params.deckSize, 40));
  const rawWindow = lerp(start, floor, progress);
  const speedMult = SPEED_MULTIPLIER[params.speed] || 1.0;
  const accessMult = ACCESS_TIME_MULTIPLIER[params.accessTime] || 1.0;

  let scaled = rawWindow * speedMult * accessMult;
  return Math.max(MIN_WINDOW_MS, Math.round(scaled));
}

export interface AscentTimingParams {
  numBins: number;
  step: number;
  rampFloor?: number;
  rampPerStep?: number;
  schemeChange?: boolean;
  speed: SpeedSetting;
  accessTime: AccessTimeSetting;
}

export function calculateAscentWindowMs(params: AscentTimingParams): number {
  const { start } = getWindowRangeForBins(params.numBins);
  const floorRatio = params.rampFloor ?? 0.55;
  const perStep = params.rampPerStep ?? 0.035;

  const stepFactor = Math.max(floorRatio, 1 - perStep * (params.step - 1));
  const speedMult = SPEED_MULTIPLIER[params.speed] || 1.0;
  const accessMult = ACCESS_TIME_MULTIPLIER[params.accessTime] || 1.0;

  let windowMs = Math.round(start * stepFactor * speedMult * accessMult);
  windowMs = Math.max(MIN_WINDOW_MS, windowMs);

  if (params.schemeChange) {
    windowMs += SCHEME_CHANGE_GRACE_MS;
  }

  return windowMs;
}

export function getCardWindowMs(params: {
  config: import('./types').ShelfRushConfig;
  card: import('./types').ShelfRushCard;
  numBins: number;
  correctCount?: number;
  deckSize?: number;
  step?: number;
}): number {
  if (params.config.mode === 'ascent') {
    return calculateAscentWindowMs({
      numBins: params.numBins,
      step: params.step || 1,
      schemeChange: params.card.schemeChange,
      speed: params.config.speed,
      accessTime: params.config.accessTime,
    });
  } else {
    return calculateSchemeWindowMs({
      numBins: params.numBins,
      deckSize: params.deckSize || 66,
      correctCount: params.correctCount || 0,
      speed: params.config.speed,
      accessTime: params.config.accessTime,
    });
  }
}

