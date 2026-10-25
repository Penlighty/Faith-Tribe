import fs from 'node:fs';
import path from 'node:path';

export interface ShelfRushBook {
  id: string;
  name: string;
  abbr: string;
  order: number;
  testament: 'OT' | 'NT';
  chapters: number;
  blurb: string;
}

export interface ShelfRushBin {
  id: string;
  label: string;
  icon?: string | null;
}

export interface ShelfRushScheme {
  id: string;
  name: string;
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tradition: string;
  deckSize: number;
  bins: ShelfRushBin[];
  assign: Record<string, string>;
  notes?: Record<string, string>;
  excluded?: Record<string, string>;
}

export interface ShelfRushData {
  version: number;
  canon: string;
  books: ShelfRushBook[];
  schemes: ShelfRushScheme[];
  campaign: {
    name: string;
    tagline?: string;
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
    length: Record<string, {
      steps: number;
      cardsPerStep: number;
      bands: number[];
      restStopsAfterStep: number[];
    }>;
  };
}

export function validateShelfRushData(data: ShelfRushData): void {
  // 1. 66 books, unique ids, chapters sum to 1189 (929 OT + 260 NT), OT = first 39 by order.
  if (!Array.isArray(data.books) || data.books.length !== 66) {
    throw new Error(`Expected exactly 66 books, received ${data.books?.length}`);
  }

  const bookIds = new Set<string>();
  let totalChapters = 0;
  let otChapters = 0;
  let ntChapters = 0;

  data.books.forEach((b, idx) => {
    if (bookIds.has(b.id)) {
      throw new Error(`Duplicate book id: ${b.id}`);
    }
    bookIds.add(b.id);
    totalChapters += b.chapters;

    if (b.order <= 39) {
      if (b.testament !== 'OT') {
        throw new Error(`Book ${b.id} with order ${b.order} must be OT`);
      }
      otChapters += b.chapters;
    } else {
      if (b.testament !== 'NT') {
        throw new Error(`Book ${b.id} with order ${b.order} must be NT`);
      }
      ntChapters += b.chapters;
    }

    if (b.order !== idx + 1) {
      throw new Error(`Book ${b.id} order mismatch: expected ${idx + 1}, got ${b.order}`);
    }
  });

  if (totalChapters !== 1189) {
    throw new Error(`Total chapters must be 1189, got ${totalChapters}`);
  }
  if (otChapters !== 929) {
    throw new Error(`OT chapters must be 929, got ${otChapters}`);
  }
  if (ntChapters !== 260) {
    throw new Error(`NT chapters must be 260, got ${ntChapters}`);
  }

  // 2. Schemes validation
  if (!Array.isArray(data.schemes) || data.schemes.length !== 8) {
    throw new Error(`Expected 8 schemes, got ${data.schemes?.length}`);
  }

  let totalDeckSize = 0;
  const schemeIds = new Set<string>();

  for (const scheme of data.schemes) {
    schemeIds.add(scheme.id);
    totalDeckSize += scheme.deckSize;

    const binIds = new Set(scheme.bins.map((bin) => bin.id));
    const assignedBins = new Set<string>();
    const assignedBookKeys = Object.keys(scheme.assign);

    if (assignedBookKeys.length !== scheme.deckSize) {
      throw new Error(`Scheme ${scheme.id}: deckSize ${scheme.deckSize} does not match assign keys length ${assignedBookKeys.length}`);
    }

    for (const [bookId, binId] of Object.entries(scheme.assign)) {
      if (!bookIds.has(bookId)) {
        throw new Error(`Scheme ${scheme.id} assigns non-existent book: ${bookId}`);
      }
      if (!binIds.has(binId)) {
        throw new Error(`Scheme ${scheme.id} assigns non-existent bin: ${binId} for book ${bookId}`);
      }
      assignedBins.add(binId);
    }

    for (const bin of scheme.bins) {
      if (!assignedBins.has(bin.id)) {
        throw new Error(`Scheme ${scheme.id}: Bin ${bin.id} has no books assigned`);
      }
    }
  }

  // Total deckSize across schemes equals 343
  if (totalDeckSize !== 343) {
    throw new Error(`Total deckSize across all schemes must be 343, got ${totalDeckSize}`);
  }

  // 3. Campaign validation
  const allTierSchemes = [
    ...(data.campaign.tiers.easy || []),
    ...(data.campaign.tiers.medium || []),
    ...(data.campaign.tiers.hard || []),
  ];

  for (const sId of allTierSchemes) {
    if (!schemeIds.has(sId)) {
      throw new Error(`Campaign references unknown scheme id: ${sId}`);
    }
  }

  for (const [bandName, weights] of Object.entries(data.campaign.tierWeightsByBand)) {
    const sum = weights.reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 1.0) > 0.0001) {
      throw new Error(`Tier weights for band ${bandName} must sum to 1, got ${sum}`);
    }
  }

  console.log('✓ Shelf Rush data validated successfully: 66 books, 1189 chapters, 8 schemes, 343 pair space.');
}

if (process.argv[1] && process.argv[1].endsWith('validate-shelf-rush.ts')) {
  const filePath = path.resolve(process.cwd(), 'content/shelf-rush.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw) as ShelfRushData;
  validateShelfRushData(data);
}
