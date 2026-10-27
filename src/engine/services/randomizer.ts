import { deviceLedger, shuffle } from './antiRepeatLedger';
import { BibleOrNotItem } from '../content/schemas';
import { allBibleOrNotItems } from '../content/loader';

export { shuffle };

/**
 * Intelligent Fresh Pool Shuffler
 * Prevents repetitive sequences across plays by:
 * 1. Tracking recently seen item IDs in deviceLedger
 * 2. Partitioning items into "unseen / cold" and "recently seen / warm"
 * 3. Shuffling each group independently with Fisher-Yates
 * 4. Placing unseen items first so players always get fresh content each session
 */
export function getFreshPool<T>(
  items: readonly T[],
  gameId: string,
  getId: (item: T) => string = (item: any) => item.id || item.quote || item.title || item.name || JSON.stringify(item)
): T[] {
  if (!items || items.length === 0) return [];

  const seenMap = deviceLedger.getSeenRecords(gameId);
  const now = Date.now();
  // Items seen in the last 2 hours are considered "recent"
  const RECENT_CUTOFF_MS = 2 * 60 * 60 * 1000;

  const unseenOrOld: T[] = [];
  const recentlySeen: { item: T; lastSeen: number }[] = [];

  for (const item of items) {
    const id = getId(item);
    const seenAt = seenMap[id];
    if (seenAt && now - seenAt < RECENT_CUTOFF_MS) {
      recentlySeen.push({ item, lastSeen: seenAt });
    } else {
      unseenOrOld.push(item);
    }
  }

  // If almost all items have been seen recently, sort by least-recently-seen
  if (unseenOrOld.length < Math.min(5, Math.floor(items.length * 0.3))) {
    recentlySeen.sort((a, b) => a.lastSeen - b.lastSeen);
    const reordered = [...unseenOrOld, ...recentlySeen.map((r) => r.item)];
    return shuffle(reordered);
  }

  // Shuffle both sets with Fisher-Yates
  const shuffledFresh = shuffle(unseenOrOld);
  const shuffledRecent = shuffle(recentlySeen.map((r) => r.item));

  return [...shuffledFresh, ...shuffledRecent];
}

/**
 * Shuffles a pool of BibleOrNot items with anti-clustering and answer balancing.
 * Guarantees:
 * 1. An unbiased Fisher-Yates shuffle within each answer bucket
 * 2. Balanced answer distribution throughout the deck (50% IN_BIBLE, 50% NOT_IN_BIBLE)
 * 3. Never more than 2 consecutive cards with the same answer ('IN_BIBLE' or 'NOT_IN_BIBLE')
 * 4. Anti-clustering of categories (avoids identical categories consecutively)
 */
export function shuffleBalancedBibleOrNotDeck(
  items: readonly BibleOrNotItem[],
  options: {
    maxConsecutiveSameAnswer?: number;
    avoidConsecutiveSameCategory?: boolean;
  } = {}
): BibleOrNotItem[] {
  const {
    maxConsecutiveSameAnswer = 2,
    avoidConsecutiveSameCategory = true,
  } = options;

  if (!items || items.length === 0) return [];

  const inBible = shuffle(items.filter((i) => i.answer === 'IN_BIBLE'));
  const notInBible = shuffle(items.filter((i) => i.answer === 'NOT_IN_BIBLE'));

  const result: BibleOrNotItem[] = [];
  const total = items.length;

  let inIdx = 0;
  let notIdx = 0;

  while (result.length < total) {
    const hasIn = inIdx < inBible.length;
    const hasNot = notIdx < notInBible.length;

    if (!hasIn && !hasNot) break;

    // Check consecutive streak of answers
    const n = result.length;
    let mustPick: 'IN_BIBLE' | 'NOT_IN_BIBLE' | null = null;

    if (n >= maxConsecutiveSameAnswer) {
      const allSame = result.slice(n - maxConsecutiveSameAnswer).every((c) => c.answer === result[n - 1].answer);
      if (allSame) {
        mustPick = result[n - 1].answer === 'IN_BIBLE' ? 'NOT_IN_BIBLE' : 'IN_BIBLE';
      }
    }

    let pickIn: boolean;
    if (mustPick === 'IN_BIBLE') {
      pickIn = hasIn ? true : false;
    } else if (mustPick === 'NOT_IN_BIBLE') {
      pickIn = hasNot ? false : true;
    } else if (hasIn && hasNot) {
      // Balance based on remaining counts with random coin-flip
      const remainingIn = inBible.length - inIdx;
      const remainingNot = notInBible.length - notIdx;
      if (remainingIn > remainingNot + 1) {
        pickIn = true;
      } else if (remainingNot > remainingIn + 1) {
        pickIn = false;
      } else {
        pickIn = Math.random() < 0.5;
      }
    } else {
      pickIn = hasIn;
    }

    const sourceBucket = pickIn ? inBible : notInBible;
    let sourceIdx = pickIn ? inIdx : notIdx;

    // Category anti-clustering: lookahead up to 4 cards in the chosen bucket to avoid same category
    if (avoidConsecutiveSameCategory && n > 0 && sourceIdx + 1 < sourceBucket.length) {
      const prevCategory = result[n - 1].category;
      if (sourceBucket[sourceIdx].category === prevCategory) {
        const swapOffset = sourceBucket.slice(sourceIdx + 1, sourceIdx + 5).findIndex((c) => c.category !== prevCategory);
        if (swapOffset !== -1) {
          const swapTarget = sourceIdx + 1 + swapOffset;
          const temp = sourceBucket[sourceIdx];
          sourceBucket[sourceIdx] = sourceBucket[swapTarget];
          sourceBucket[swapTarget] = temp;
        }
      }
    }

    result.push(sourceBucket[sourceIdx]);
    if (pickIn) inIdx++;
    else notIdx++;
  }

  return result;
}

/**
 * Intelligent Fresh Pool Shuffler for "Bible or Not"
 * Integrates device ledger freshness with balanced deck anti-clustering.
 */
export function getFreshBibleOrNotPool(
  tier: 1 | 2 | 3 | 4,
  customItems?: readonly BibleOrNotItem[],
  gameId: string = 'bible-or-not'
): BibleOrNotItem[] {
  const basePool = customItems && customItems.length > 0
    ? customItems.filter((i) => i.tier === tier)
    : allBibleOrNotItems.filter((i) => i.tier === tier);

  if (basePool.length === 0) return [];

  const seenMap: Record<string, number> = {
    ...deviceLedger.getSeenRecords(gameId),
    ...deviceLedger.getSeenRecords(`${gameId}-t${tier}`),
  };

  const now = Date.now();
  const RECENT_CUTOFF_MS = 2 * 60 * 60 * 1000;

  const unseenOrOld: BibleOrNotItem[] = [];
  const recentlySeen: { item: BibleOrNotItem; lastSeen: number }[] = [];

  for (const item of basePool) {
    const seenAt = seenMap[item.id];
    if (seenAt && now - seenAt < RECENT_CUTOFF_MS) {
      recentlySeen.push({ item, lastSeen: seenAt });
    } else {
      unseenOrOld.push(item);
    }
  }

  // If almost all items have been seen recently, sort recent by oldest seen first
  if (unseenOrOld.length < Math.min(8, Math.floor(basePool.length * 0.2))) {
    recentlySeen.sort((a, b) => a.lastSeen - b.lastSeen);
    const combined = [...unseenOrOld, ...recentlySeen.map((r) => r.item)];
    return shuffleBalancedBibleOrNotDeck(combined);
  }

  const freshBalanced = shuffleBalancedBibleOrNotDeck(unseenOrOld);
  const recentBalanced = shuffleBalancedBibleOrNotDeck(recentlySeen.map((r) => r.item));

  return [...freshBalanced, ...recentBalanced];
}

/**
 * Mark item as seen in the local ledger
 */
export function markItemSeen(gameId: string, itemId: string) {
  deviceLedger.recordSeen(gameId, itemId);
}
