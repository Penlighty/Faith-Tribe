export const BASE_POINTS = 10;

export function binFactor(numBins: number): number {
  if (numBins <= 2) return 1.0;
  if (numBins <= 4) return 1.5;
  return 2.0;
}

export interface WindowRange {
  start: number;
  floor: number;
}

export function getWindowRangeForBins(numBins: number): WindowRange {
  if (numBins <= 2) {
    return { start: 4000, floor: 1600 };
  }
  if (numBins <= 4) {
    return { start: 5000, floor: 2400 };
  }
  return { start: 6000, floor: 3000 };
}

export const SPEED_MULTIPLIER = {
  relaxed: 1.5,
  standard: 1.0,
  blitz: 0.7,
} as const;

export type SpeedSetting = keyof typeof SPEED_MULTIPLIER;

export const ACCESS_TIME_MULTIPLIER = {
  1: 1.0,
  1.5: 1.5,
  2: 2.0,
} as const;

export type AccessTimeSetting = 1 | 1.5 | 2;

export const MIN_WINDOW_MS = 900;
export const SCHEME_CHANGE_GRACE_MS = 1000;

export const LIVES_BY_MODE = {
  scheme: 3,
  ascent: 5,
} as const;

export type LifeRule = 'forgiving' | 'strict';

/**
 * 7-pair BIN_PALETTE with high contrast (each >= 4.5:1),
 * distinct in hue and lightness so color-blind players can distinguish bins easily.
 */
export interface BinColor {
  container: string;
  ink: string;
  border: string;
}

export const BIN_PALETTE: BinColor[] = [
  { container: '#D2E7F6', ink: '#154164', border: '#A6CEEE' }, // 1. Sky Blue
  { container: '#F9D6DB', ink: '#6E1E2D', border: '#F0AAB5' }, // 2. Rose
  { container: '#CFEFD2', ink: '#184422', border: '#A2DFAB' }, // 3. Mint
  { container: '#F3EBA0', ink: '#524A0C', border: '#E4D568' }, // 4. Gold
  { container: '#E3DDF5', ink: '#37276B', border: '#C5B7EC' }, // 5. Lavender
  { container: '#FBDDBF', ink: '#6C2E0B', border: '#F6B984' }, // 6. Coral
  { container: '#C9EDE8', ink: '#0F4E46', border: '#92DDD3' }, // 7. Teal
];
