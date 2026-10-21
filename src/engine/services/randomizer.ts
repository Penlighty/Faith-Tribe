import { deviceLedger } from './antiRepeatLedger';

/**
 * Modern Fisher-Yates shuffle that produces an unbiased random permutation.
 */
export function shuffle<T>(array: readonly T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

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
 * Mark item as seen in the local ledger
 */
export function markItemSeen(gameId: string, itemId: string) {
  deviceLedger.recordSeen(gameId, itemId);
}
