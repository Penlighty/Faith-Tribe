import shelfRushRaw from '../../../../content/shelf-rush.json';
import { ShelfRushBook, ShelfRushScheme } from './types';

export interface CampaignData {
  name: string;
  tagline: string;
  tiers: {
    easy: string[];
    medium: string[];
    hard: string[];
  };
  tierWeightsByBand: Record<string, [number, number, number]>;
  ramp: {
    rampFloor: number;
    rampPerStep: number;
    schemeChangeGraceMs: number;
  };
  length: Record<
    string,
    {
      steps: number;
      cardsPerStep: number;
      bands: number[];
      restStopsAfterStep: number[];
    }
  >;
}

export type { ShelfRushBook, ShelfRushScheme };

export const shelfRushData = (shelfRushRaw as unknown) as {
  version: number;
  canon: string;
  books: ShelfRushBook[];
  schemes: ShelfRushScheme[];
  campaign: CampaignData;
};


export const allBooks: ShelfRushBook[] = shelfRushData.books;
export const allSchemes: ShelfRushScheme[] = shelfRushData.schemes;
export const campaignData: CampaignData = shelfRushData.campaign;

const booksMap = new Map<string, ShelfRushBook>(allBooks.map((b) => [b.id, b]));
const schemesMap = new Map<string, ShelfRushScheme>(allSchemes.map((s) => [s.id, s]));

export function getBook(id: string): ShelfRushBook | undefined {
  return booksMap.get(id);
}

export function getScheme(id: string): ShelfRushScheme | undefined {
  return schemesMap.get(id);
}

export function binOf(schemeId: string, bookId: string): string | undefined {
  const scheme = schemesMap.get(schemeId);
  return scheme?.assign[bookId];
}

/**
 * pairIndex: an ordered list of "bookId|schemeId" keys (schemes in file order, then books in book order).
 * Exactly 343 distinct pairs defining ledger indexes.
 */
export const pairIndex: string[] = [];
for (const scheme of allSchemes) {
  for (const book of allBooks) {
    if (scheme.assign[book.id]) {
      pairIndex.push(`${book.id}|${scheme.id}`);
    }
  }
}

export const pairIndexMap = new Map<string, number>(
  pairIndex.map((key, idx) => [key, idx])
);
