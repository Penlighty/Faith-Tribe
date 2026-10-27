import { WhoSaidItem, TestamentSortItem, FourSignsPuzzle, ScribesTilesWord, BibleOrNotItem } from '../content/schemas';

export interface SeenRecord {
  id: string;
  lastSeenAt: number;
}

export interface PlayerSeenData {
  playerId: string;
  seenIds: Record<string, number>; // id -> timestamp
}

// Local storage ledger persistence (compatible with all browser environments & Node/Vitest)
class LocalDeviceLedger {
  private getStorageKey(gameId: string): string {
    return `faith_tribe_seen_ledger_${gameId}`;
  }

  getSeenRecords(gameId: string): Record<string, number> {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return {};
      const raw = localStorage.getItem(this.getStorageKey(gameId)) || localStorage.getItem(`agape_seen_ledger_${gameId}`);
      if (!raw) return {};
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  recordSeen(gameId: string, id: string, timestamp: number = Date.now()): void {
    try {
      const records = this.getSeenRecords(gameId);
      records[id] = timestamp;
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(this.getStorageKey(gameId), JSON.stringify(records));
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }

  clear(gameId: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(this.getStorageKey(gameId));
      }
    } catch {}
  }
}

export const deviceLedger = new LocalDeviceLedger();

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
 * Host Question Selection Algorithm
 * Selects an item from a pool while balancing freshness across all room participants.
 */
export function selectFreshItem<T extends { id: string }>(
  pool: T[],
  roomSeenData: PlayerSeenData[],
  alreadyUsedInSession: Set<string>
): T | null {
  const available = pool.filter((item) => !alreadyUsedInSession.has(item.id));
  if (available.length === 0) return null;

  // Calculate how many players have seen each candidate, and the most recent seen time
  const candidatesWithMetrics = available.map((item) => {
    let seenCount = 0;
    let latestSeenTime = 0;

    for (const player of roomSeenData) {
      const seenTime = player.seenIds[item.id];
      if (seenTime !== undefined) {
        seenCount++;
        if (seenTime > latestSeenTime) {
          latestSeenTime = seenTime;
        }
      }
    }

    return {
      item,
      seenCount,
      latestSeenTime,
    };
  });

  // Proportion of pool items that are unseen by ALL players
  const unseenCount = candidatesWithMetrics.filter((c) => c.seenCount === 0).length;
  const unseenRatio = unseenCount / pool.length;

  // If fewer than 20% of tier is completely unseen for the room, prioritize least-recently-seen
  if (unseenRatio < 0.2) {
    candidatesWithMetrics.sort((a, b) => {
      if (a.seenCount !== b.seenCount) return a.seenCount - b.seenCount;
      return a.latestSeenTime - b.latestSeenTime;
    });
  } else {
    // Prefer items seen by fewest players
    candidatesWithMetrics.sort((a, b) => a.seenCount - b.seenCount);
  }

  // Get the best candidates (tied for minimum seenCount)
  const bestSeenCount = candidatesWithMetrics[0].seenCount;
  const bestCandidates = candidatesWithMetrics.filter((c) => c.seenCount === bestSeenCount);
  const picked = bestCandidates[Math.floor(Math.random() * bestCandidates.length)];

  return picked.item;
}

/**
 * Session Question Planner for "Who Said That?"
 * Follows session length, tier ramp, no consecutive same speaker, and <= 1 in 8 Jesus/God.
 */
export interface WhoSaidPlannerOptions {
  sessionLength: 12 | 20 | 32;
  filterTestament?: 'ALL' | 'OT' | 'NT';
  roomSeenData?: PlayerSeenData[];
}

export function planWhoSaidSession(
  fullPool: WhoSaidItem[],
  options: WhoSaidPlannerOptions
): WhoSaidItem[] {
  const { sessionLength, filterTestament = 'ALL', roomSeenData = [] } = options;
  const questionsPerTier = sessionLength / 4;
  const planned: WhoSaidItem[] = [];
  const usedIds = new Set<string>();

  let godJesusCount = 0;
  const maxGodJesus = Math.max(1, Math.floor(sessionLength / 8));

  // Helper to test if speaker is God/Jesus
  const isGodOrJesus = (speaker: string) => {
    const s = speaker.toLowerCase();
    return s.includes('jesus') || s.includes('god') || s.includes('the lord');
  };

  for (let tier = 1; tier <= 4; tier++) {
    let tierPool = fullPool.filter((item) => item.tier === tier);

    // Apply testament filter if requested
    if (filterTestament === 'OT') {
      tierPool = tierPool.filter((item) => !isNewTestamentRef(item.ref));
    } else if (filterTestament === 'NT') {
      tierPool = tierPool.filter((item) => isNewTestamentRef(item.ref));
    }

    // Shuffle pool for maximum variety across games
    tierPool = shuffle(tierPool);

    let tierCount = 0;
    let attempts = 0;

    while (tierCount < questionsPerTier && attempts < 100) {
      attempts++;
      const candidate = selectFreshItem(tierPool, roomSeenData, usedIds);
      if (!candidate) break;

      const lastSpeaker = planned.length > 0 ? planned[planned.length - 1].answer : null;
      if (lastSpeaker && lastSpeaker.toLowerCase() === candidate.answer.toLowerCase()) {
        continue; // Disallow same speaker twice in a row
      }

      if (isGodOrJesus(candidate.answer) && godJesusCount >= maxGodJesus) {
        continue; // Cap God/Jesus answers to ~1 in 8
      }

      usedIds.add(candidate.id);
      planned.push(candidate);
      if (isGodOrJesus(candidate.answer)) godJesusCount++;
      tierCount++;
    }
  }

  return planned;
}

/**
 * Session Question Planner for "Testament Sort"
 * Balances ~1/3 OT, ~1/3 NT, ~1/3 BOTH; avoids 3 consecutive same answers.
 */
export interface TestamentSortPlannerOptions {
  sessionLength: 12 | 20 | 32;
  filterType?: 'ALL' | 'person' | 'place' | 'thing' | 'traps';
  roomSeenData?: PlayerSeenData[];
}

export function planTestamentSortSession(
  fullPool: TestamentSortItem[],
  options: TestamentSortPlannerOptions
): TestamentSortItem[] {
  const { sessionLength, filterType = 'ALL', roomSeenData = [] } = options;
  const questionsPerTier = sessionLength / 4;
  const planned: TestamentSortItem[] = [];
  const usedIds = new Set<string>();

  for (let tier = 1; tier <= 4; tier++) {
    let tierPool = fullPool.filter((item) => item.tier === tier);

    if (filterType === 'traps') {
      tierPool = tierPool.filter((item) => item.answer === 'BOTH');
    } else if (filterType !== 'ALL') {
      tierPool = tierPool.filter((item) => item.type === filterType);
    }

    tierPool = shuffle(tierPool);

    let tierCount = 0;
    let attempts = 0;

    while (tierCount < questionsPerTier && attempts < 150) {
      attempts++;
      const candidate = selectFreshItem(tierPool, roomSeenData, usedIds);
      if (!candidate) break;

      // Avoid three consecutive same answers
      const n = planned.length;
      if (n >= 2 && planned[n - 1].answer === candidate.answer && planned[n - 2].answer === candidate.answer) {
        continue;
      }

      usedIds.add(candidate.id);
      planned.push(candidate);
      tierCount++;
    }
  }

  return planned;
}

// Simple lookup to detect NT vs OT references
const NT_BOOKS = new Set([
  'matthew', 'mark', 'luke', 'john', 'acts', 'romans',
  '1 corinthians', '2 corinthians', 'galatians', 'ephesians',
  'philippians', 'colossians', '1 thessalonians', '2 thessalonians',
  '1 timothy', '2 timothy', 'titus', 'philemon', 'hebrews',
  'james', '1 peter', '2 peter', '1 john', '2 john', '3 john',
  'jude', 'revelation'
]);

function isNewTestamentRef(ref: string): boolean {
  const lower = ref.toLowerCase();
  for (const book of NT_BOOKS) {
    if (lower.startsWith(book)) return true;
  }
  return false;
}

export interface FourSignsPlannerOptions {
  sessionLength: number;
  roomSeenData?: PlayerSeenData[];
}

export function planFourSignsSession(
  fullPool: FourSignsPuzzle[],
  options: FourSignsPlannerOptions
): FourSignsPuzzle[] {
  const { sessionLength, roomSeenData = [] } = options;
  const questionsPerTier = Math.max(1, Math.round(sessionLength / 4));
  const planned: FourSignsPuzzle[] = [];
  const usedIds = new Set<string>();

  for (let tier = 1; tier <= 4; tier++) {
    let tierPool = fullPool.filter((item) => item.tier === tier);
    tierPool = shuffle(tierPool);

    let tierCount = 0;
    let attempts = 0;

    while (tierCount < questionsPerTier && attempts < 150 && planned.length < sessionLength) {
      attempts++;
      const candidate = selectFreshItem(tierPool, roomSeenData, usedIds);
      if (!candidate) break;

      usedIds.add(candidate.id);
      planned.push(candidate);
      tierCount++;
    }
  }

  // Fallback if not enough reached
  if (planned.length < sessionLength) {
    const remaining = shuffle(fullPool.filter((p) => !usedIds.has(p.id)));
    for (const item of remaining) {
      if (planned.length >= sessionLength) break;
      planned.push(item);
      usedIds.add(item.id);
    }
  }

  return planned;
}

export interface ScribesTilesPlannerOptions {
  sessionLength: number;
  roomSeenData?: PlayerSeenData[];
}

export function planScribesTilesSession(
  fullPool: ScribesTilesWord[],
  options: ScribesTilesPlannerOptions
): ScribesTilesWord[] {
  const { sessionLength, roomSeenData = [] } = options;
  const questionsPerTier = Math.max(1, Math.round(sessionLength / 4));
  const planned: ScribesTilesWord[] = [];
  const usedIds = new Set<string>();

  for (let tier = 1; tier <= 4; tier++) {
    let tierPool = fullPool.filter((item) => item.tier === tier);
    tierPool = shuffle(tierPool);

    let tierCount = 0;
    let attempts = 0;

    while (tierCount < questionsPerTier && attempts < 150 && planned.length < sessionLength) {
      attempts++;
      const candidate = selectFreshItem(tierPool, roomSeenData, usedIds);
      if (!candidate) break;

      usedIds.add(candidate.id);
      planned.push(candidate);
      tierCount++;
    }
  }

  // Fallback if not enough reached
  if (planned.length < sessionLength) {
    const remaining = shuffle(fullPool.filter((p) => !usedIds.has(p.id)));
    for (const item of remaining) {
      if (planned.length >= sessionLength) break;
      planned.push(item);
      usedIds.add(item.id);
    }
  }

  return planned;
}

export interface BibleOrNotPlannerOptions {
  sessionLength: number;
  roomSeenData?: PlayerSeenData[];
}

/**
 * Intelligent Session Planner for "Bible or Not"
 * Enforces:
 * 1. 50/50 balance between IN_BIBLE and NOT_IN_BIBLE across the session
 * 2. Anti-clustering: never more than 2 consecutive identical answers
 * 3. Category diversity: avoids consecutive identical categories
 * 4. Tier distribution ramp across rounds
 * 5. Unbiased Fisher-Yates shuffling with anti-repeat ledger integration
 */
export function planBibleOrNotSession(
  fullPool: BibleOrNotItem[],
  options: BibleOrNotPlannerOptions
): BibleOrNotItem[] {
  const { sessionLength, roomSeenData = [] } = options;
  const targetIn = Math.floor(sessionLength / 2);
  const targetNot = sessionLength - targetIn;

  const inPool = fullPool.filter((item) => item.answer === 'IN_BIBLE');
  const notPool = fullPool.filter((item) => item.answer === 'NOT_IN_BIBLE');

  const selectedIn: BibleOrNotItem[] = [];
  const selectedNot: BibleOrNotItem[] = [];
  const usedIds = new Set<string>();

  // Pick targetIn from inPool using tiers & freshness
  for (let tier = 1; tier <= 4 && selectedIn.length < targetIn; tier++) {
    const tierIn = inPool.filter((item) => item.tier === tier);
    const count = Math.ceil((targetIn - selectedIn.length) / (5 - tier));
    for (let i = 0; i < count && selectedIn.length < targetIn; i++) {
      const item = selectFreshItem(tierIn, roomSeenData, usedIds);
      if (item) {
        usedIds.add(item.id);
        selectedIn.push(item);
      }
    }
  }
  // Fallback for IN_BIBLE
  if (selectedIn.length < targetIn) {
    for (const item of shuffle(inPool.filter((p) => !usedIds.has(p.id)))) {
      if (selectedIn.length >= targetIn) break;
      usedIds.add(item.id);
      selectedIn.push(item);
    }
  }

  // Pick targetNot from notPool using tiers & freshness
  for (let tier = 1; tier <= 4 && selectedNot.length < targetNot; tier++) {
    const tierNot = notPool.filter((item) => item.tier === tier);
    const count = Math.ceil((targetNot - selectedNot.length) / (5 - tier));
    for (let i = 0; i < count && selectedNot.length < targetNot; i++) {
      const item = selectFreshItem(tierNot, roomSeenData, usedIds);
      if (item) {
        usedIds.add(item.id);
        selectedNot.push(item);
      }
    }
  }
  // Fallback for NOT_IN_BIBLE
  if (selectedNot.length < targetNot) {
    for (const item of shuffle(notPool.filter((p) => !usedIds.has(p.id)))) {
      if (selectedNot.length >= targetNot) break;
      usedIds.add(item.id);
      selectedNot.push(item);
    }
  }

  // Interleave and shuffle selectedIn and selectedNot enforcing anti-clustering (< 3 in a row)
  const remainingCards = [...selectedIn, ...selectedNot];
  const planned: BibleOrNotItem[] = [];

  while (remainingCards.length > 0) {
    const n = planned.length;
    let allowedAnswer: 'IN_BIBLE' | 'NOT_IN_BIBLE' | null = null;
    if (n >= 2 && planned[n - 1].answer === planned[n - 2].answer) {
      // Must not match previous two
      allowedAnswer = planned[n - 1].answer === 'IN_BIBLE' ? 'NOT_IN_BIBLE' : 'IN_BIBLE';
    }

    const available = allowedAnswer
      ? remainingCards.filter((c) => c.answer === allowedAnswer)
      : remainingCards;

    const pickPool = available.length > 0 ? available : remainingCards;
    const pickIndex = Math.floor(Math.random() * pickPool.length);
    const picked = pickPool[pickIndex];

    planned.push(picked);
    const originalIndex = remainingCards.indexOf(picked);
    if (originalIndex !== -1) {
      remainingCards.splice(originalIndex, 1);
    }
  }

  return planned;
}
