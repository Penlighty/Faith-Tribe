import rawWhoSaid from '../../content/who-said.json';
import rawTestamentSort from '../../content/testament-sort.json';
import {
  WhoSaidItem,
  TestamentSortItem,
  validateWhoSaidData,
  validateTestamentSortData,
} from './schemas';

// Build-time / initial load validation
export const allWhoSaidItems: WhoSaidItem[] = validateWhoSaidData(rawWhoSaid as unknown[]);
export const allTestamentSortItems: TestamentSortItem[] = validateTestamentSortData(rawTestamentSort as unknown[]);

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
