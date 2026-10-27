import rawWhoSaid from '../../content/who-said.json';
import rawTestamentSort from '../../content/testament-sort.json';
import rawFourSigns from '../../content/four-signs.json';
import rawScribesTiles from '../../content/scribes-tiles.json';
import rawBibleOrNot from '../../content/bible-or-not.json';
import {
  WhoSaidItem,
  TestamentSortItem,
  FourSignsPuzzle,
  FourSignsIcon,
  ScribesTilesWord,
  BibleOrNotItem,
  validateWhoSaidData,
  validateTestamentSortData,
  validateFourSignsData,
  validateScribesTilesData,
  validateBibleOrNotData,
} from './schemas';

// Build-time / initial load validation
export const allWhoSaidItems: WhoSaidItem[] = validateWhoSaidData(rawWhoSaid as unknown[]);
export const allTestamentSortItems: TestamentSortItem[] = validateTestamentSortData(rawTestamentSort as unknown[]);

export const allFourSignsPuzzles: FourSignsPuzzle[] = validateFourSignsData(
  ((rawFourSigns as any).puzzles || rawFourSigns) as unknown[]
);
export const allFourSignsIcons: FourSignsIcon[] = ((rawFourSigns as any).icons || []) as FourSignsIcon[];

export const allScribesTilesWords: ScribesTilesWord[] = validateScribesTilesData(
  ((rawScribesTiles as any).words || rawScribesTiles) as unknown[]
);
export const scribesTilesDecoysByTier: Record<string, number> = (rawScribesTiles as any).decoysByTier || {
  '1': 2,
  '2': 3,
  '3': 4,
  '4': 5,
};

export const allBibleOrNotItems: BibleOrNotItem[] = validateBibleOrNotData(rawBibleOrNot as unknown[]);

export function getWhoSaidPool(tier?: 1 | 2 | 3 | 4): WhoSaidItem[] {
  if (tier) {
    return allWhoSaidItems.filter((item) => item.tier === tier);
  }
  return allWhoSaidItems;
}

export function getTestamentSortPool(tier?: 1 | 2 | 3 | 4): TestamentSortItem[] {
  if (tier) {
    return allTestamentSortItems.filter((item) => item.tier === tier);
  }
  return allTestamentSortItems;
}

export function getFourSignsPool(tier?: 1 | 2 | 3 | 4): FourSignsPuzzle[] {
  if (tier) {
    return allFourSignsPuzzles.filter((item) => item.tier === tier);
  }
  return allFourSignsPuzzles;
}

export function getScribesTilesPool(tier?: 1 | 2 | 3 | 4): ScribesTilesWord[] {
  if (tier) {
    return allScribesTilesWords.filter((item) => item.tier === tier);
  }
  return allScribesTilesWords;
}

export function getBibleOrNotPool(tier?: 1 | 2 | 3 | 4): BibleOrNotItem[] {
  if (tier) {
    return allBibleOrNotItems.filter((item) => item.tier === tier);
  }
  return allBibleOrNotItems;
}
