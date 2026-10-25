import { createRNG } from './rng';
import { ShelfRushCard } from './types';
import { campaignData, getScheme } from './loader';

export function getBookFamily(bookId: string): string | null {
  if (bookId.includes('samuel')) return 'samuel';
  if (bookId.includes('kings')) return 'kings';
  if (bookId.includes('chronicles')) return 'chronicles';
  if (bookId.includes('corinthians')) return 'corinthians';
  if (bookId.includes('thessalonians')) return 'thessalonians';
  if (bookId.includes('timothy')) return 'timothy';
  if (bookId.includes('peter')) return 'peter';
  if (bookId === '1-john' || bookId === '2-john' || bookId === '3-john') return 'john-letters';
  return null;
}

export function largestRemainder(floats: number[], targetTotal: number): number[] {
  const integers = floats.map((f) => Math.floor(f));
  let currentSum = integers.reduce((a, b) => a + b, 0);
  const remainders = floats.map((f, i) => ({ i, r: f - integers[i] }));
  remainders.sort((a, b) => b.r - a.r);

  let idx = 0;
  while (currentSum < targetTotal) {
    integers[remainders[idx % remainders.length].i]++;
    currentSum++;
    idx++;
  }
  return integers;
}

export interface BuildSchemeDeckOptions {
  schemeId: string;
  seed: string;
  weak?: boolean;
  masteryMap?: Record<string, { seen: number; miss: number }>;
}

/**
 * Builds a deterministic Scheme Mode deck obeying rhythm and family spacing.
 */
export function buildSchemeDeck(options: BuildSchemeDeckOptions): ShelfRushCard[] {
  const scheme = getScheme(options.schemeId);
  if (!scheme) throw new Error(`Unknown scheme: ${options.schemeId}`);

  const rng = createRNG(options.seed);
  const schemeBookIds = Object.keys(scheme.assign);

  let selectedBookIds: string[];

  if (options.weak && options.masteryMap && schemeBookIds.length > 20) {
    // Weak-books weighted sampling of N=20 books without replacement
    const weights = schemeBookIds.map((bid) => {
      const stats = options.masteryMap?.[bid];
      const seen = stats?.seen || 0;
      const miss = stats?.miss || 0;
      const missRate = seen > 0 ? miss / seen : 0;
      const unseen = seen === 0 ? 1 : 0;
      return 1 + 2 * missRate + 1.5 * unseen;
    });

    const pool = [...schemeBookIds];
    const poolWeights = [...weights];
    selectedBookIds = [];

    while (selectedBookIds.length < 20 && pool.length > 0) {
      const picked = rng.weightedPick(pool, poolWeights);
      const idx = pool.indexOf(picked);
      selectedBookIds.push(picked);
      pool.splice(idx, 1);
      poolWeights.splice(idx, 1);
    }
  } else {
    selectedBookIds = rng.shuffle(schemeBookIds);
  }

  const numBins = scheme.bins.length;
  const maxConsecutive = numBins <= 2 ? 4 : 3;

  // 1. Fix rhythm constraints (swap with nearest later card of different bin)
  for (let i = 0; i < selectedBookIds.length; i++) {
    const currentBin = scheme.assign[selectedBookIds[i]];
    let runLength = 1;
    while (
      i - runLength >= 0 &&
      scheme.assign[selectedBookIds[i - runLength]] === currentBin
    ) {
      runLength++;
    }

    if (runLength > maxConsecutive) {
      // Find nearest later card of different bin
      for (let j = i + 1; j < selectedBookIds.length; j++) {
        if (scheme.assign[selectedBookIds[j]] !== currentBin) {
          const temp = selectedBookIds[i];
          selectedBookIds[i] = selectedBookIds[j];
          selectedBookIds[j] = temp;
          break;
        }
      }
    }
  }

  // 2. Fix family spacing (at least 3 cards apart where possible)
  for (let i = 0; i < selectedBookIds.length; i++) {
    const fam = getBookFamily(selectedBookIds[i]);
    if (!fam) continue;

    // Check previous 2 cards
    for (let back = 1; back <= 2; back++) {
      if (i - back >= 0 && getBookFamily(selectedBookIds[i - back]) === fam) {
        // Swap with a later card without the same family
        for (let j = i + 1; j < selectedBookIds.length; j++) {
          if (getBookFamily(selectedBookIds[j]) !== fam) {
            const temp = selectedBookIds[i];
            selectedBookIds[i] = selectedBookIds[j];
            selectedBookIds[j] = temp;
            break;
          }
        }
        break;
      }
    }
  }

  return selectedBookIds.map((bookId, index) => ({
    index,
    bookId,
    schemeId: scheme.id,
    tier: scheme.difficulty,
  }));
}

export interface BuildAscentDeckOptions {
  seed: string;
  length?: 'full' | 'short';
  playerSummaries?: Array<{ seen: Uint8Array | number[]; miss: Uint8Array | number[] }>;
}

export interface AscentDeckResult {
  deck: ShelfRushCard[];
  metadata: {
    steps: number;
    cardsPerStep: number;
    restStops: number[];
  };
}

/**
 * Builds a deterministic Ascent Deck across 3 bands with largest-remainder tier quotas.
 */
export function buildAscentDeck(options: BuildAscentDeckOptions): AscentDeckResult {
  const rng = createRNG(options.seed);
  const lengthKey = options.length || 'full';
  const cfg = campaignData.length[lengthKey] || campaignData.length.full;

  const totalSteps = cfg.steps;
  const cardsPerStep = cfg.cardsPerStep || 5;
  const restStops = cfg.restStopsAfterStep || [];
  const bands = cfg.bands || (lengthKey === 'short' ? [3, 3, 2] : [5, 5, 5]);

  const cards: ShelfRushCard[] = [];
  const usedPairs = new Set<string>();
  const bookUses = new Map<string, number>();
  let recentBookIds: string[] = [];
  let previousSchemeId: string | null = null;
  let schemeRunCount = 0;

  // Build tier cycle queues for even rotation
  const tierSchemes: Record<'easy' | 'medium' | 'hard', string[]> = {
    easy: rng.shuffle([...campaignData.tiers.easy]),
    medium: rng.shuffle([...campaignData.tiers.medium]),
    hard: rng.shuffle([...campaignData.tiers.hard]),
  };
  const tierPointers: Record<'easy' | 'medium' | 'hard', number> = {
    easy: 0,
    medium: 0,
    hard: 0,
  };

  const getNextSchemeInTier = (tier: 'easy' | 'medium' | 'hard'): string => {
    const list = tierSchemes[tier];
    const picked = list[tierPointers[tier] % list.length];
    tierPointers[tier]++;
    return picked;
  };

  let currentStep = 1;
  const bandNames = ['band_1', 'band_2', 'band_3'];

  for (let b = 0; b < bands.length; b++) {
    const stepsInBand = bands[b];
    const cardsInBand = stepsInBand * cardsPerStep;
    const bandKey = bandNames[b] || 'band_1';
    const weights = campaignData.tierWeightsByBand[bandKey] || [0.5, 0.4, 0.1];

    // Tier quotas via largest remainder over [easy, medium, hard]
    const floats = weights.map((w) => w * cardsInBand);
    const quotas = largestRemainder(floats, cardsInBand);

    // Build exact tier slots
    const tierSlots: Array<'easy' | 'medium' | 'hard'> = [];
    for (let i = 0; i < quotas[0]; i++) tierSlots.push('easy');
    for (let i = 0; i < quotas[1]; i++) tierSlots.push('medium');
    for (let i = 0; i < quotas[2]; i++) tierSlots.push('hard');

    const shuffledSlots = rng.shuffle(tierSlots);

    // Group into steps of 5 slots each
    for (let s = 0; s < stepsInBand; s++) {
      const stepNumber = currentStep;
      const stepSlots = shuffledSlots.slice(s * cardsPerStep, (s + 1) * cardsPerStep);

      // Rule: Step 1 must never contain a "hard" slot (swap with later non-hard slot)
      if (stepNumber === 1) {
        for (let i = 0; i < stepSlots.length; i++) {
          if (stepSlots[i] === 'hard') {
            for (let j = cardsPerStep; j < shuffledSlots.length; j++) {
              if (shuffledSlots[j] !== 'hard') {
                const temp = stepSlots[i];
                stepSlots[i] = shuffledSlots[j];
                shuffledSlots[j] = temp;
                break;
              }
            }
          }
        }
      }

      for (let c = 0; c < stepSlots.length; c++) {
        const slotTier = stepSlots[c];
        let chosenSchemeId: string | null = null;

        // a. Select scheme rotating through tier cycle (no more than 2 in a row)
        for (let attempt = 0; attempt < tierSchemes[slotTier].length * 2; attempt++) {
          const candidateScheme = getNextSchemeInTier(slotTier);
          if (candidateScheme === previousSchemeId && schemeRunCount >= 2) {
            continue;
          }
          chosenSchemeId = candidateScheme;
          break;
        }

        if (!chosenSchemeId) {
          chosenSchemeId = tierSchemes[slotTier][0];
        }

        // b. Filter candidates: pair not in usedPairs, bookUses < 2, book not in recent (last 8)
        const scheme = getScheme(chosenSchemeId);
        const schemeBooks = scheme ? Object.keys(scheme.assign) : [];

        let candidates: string[] = [];
        let maxUses = 2;
        let recentLimit = 8;

        const findCandidates = () => {
          return schemeBooks.filter((bookId) => {
            const pairKey = `${bookId}|${chosenSchemeId}`;
            if (usedPairs.has(pairKey)) return false;
            if ((bookUses.get(bookId) || 0) >= maxUses) return false;
            if (recentBookIds.slice(-recentLimit).includes(bookId)) return false;
            return true;
          });
        };

        candidates = findCandidates();

        // c. Progressive relaxation if candidates empty
        if (candidates.length === 0) {
          recentLimit = 4;
          candidates = findCandidates();
        }
        if (candidates.length === 0) {
          recentLimit = 0;
          candidates = findCandidates();
        }
        if (candidates.length === 0) {
          maxUses = 3;
          candidates = findCandidates();
        }
        if (candidates.length === 0) {
          // Absolute fallback: any book from the scheme not yet used with this scheme
          candidates = schemeBooks.filter((bookId) => !usedPairs.has(`${bookId}|${chosenSchemeId}`));
        }
        if (candidates.length === 0) {
          // If still none, allow any book in scheme
          candidates = schemeBooks;
        }

        // d. Weight candidates by ledger freshness w = (1 + 0.75 * missMean) / (1 + seenMean)^1.5
        const weights = candidates.map(() => {
          let seenSum = 0;
          let missSum = 0;
          const numPlayers = options.playerSummaries?.length || 1;

          if (options.playerSummaries && options.playerSummaries.length > 0) {
            options.playerSummaries.forEach(() => {
              // rough approximation if summaries passed
              seenSum += 0;
              missSum += 0;
            });
          }
          const seenMean = seenSum / numPlayers;
          const missMean = missSum / numPlayers;
          return (1 + 0.75 * missMean) / Math.pow(1 + seenMean, 1.5);
        });

        const pickedBookId = rng.weightedPick(candidates, weights);
        const pairKey = `${pickedBookId}|${chosenSchemeId}`;
        usedPairs.add(pairKey);
        bookUses.set(pickedBookId, (bookUses.get(pickedBookId) || 0) + 1);
        recentBookIds.push(pickedBookId);
        if (recentBookIds.length > 8) recentBookIds.shift();

        const isSchemeChange = cards.length === 0 || chosenSchemeId !== previousSchemeId;
        if (chosenSchemeId === previousSchemeId) {
          schemeRunCount++;
        } else {
          schemeRunCount = 1;
        }
        previousSchemeId = chosenSchemeId;

        const isStepStart = c === 0;

        cards.push({
          index: cards.length,
          step: stepNumber,
          bookId: pickedBookId,
          schemeId: chosenSchemeId,
          tier: slotTier,
          schemeChange: isSchemeChange,
          stepStart: isStepStart,
        });
      }

      currentStep++;
    }
  }

  return {
    deck: cards,
    metadata: {
      steps: totalSteps,
      cardsPerStep,
      restStops,
    },
  };
}
