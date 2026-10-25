import { pairIndex, pairIndexMap, allSchemes } from './loader';
import { CardLogEntry } from './types';

export interface PairStat {
  seen: number;
  miss: number;
  lastSeenAt: number;
}

const LEDGER_STORAGE_KEY = 'ft_shelf_rush_ledger';
const CONTENT_VERSION = 1;

export class ShelfRushLedger {
  private pairs: Map<string, PairStat> = new Map();

  constructor() {
    this.load();
  }

  private load(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(LEDGER_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.version === CONTENT_VERSION && parsed.data) {
          for (const [key, stat] of Object.entries(parsed.data)) {
            this.pairs.set(key, stat as PairStat);
          }
        }
      }
    } catch {
      // ignore
    }
  }

  public save(): void {
    if (typeof window === 'undefined') return;
    try {
      const obj: Record<string, PairStat> = {};
      for (const [k, v] of this.pairs.entries()) {
        obj[k] = v;
      }
      localStorage.setItem(
        LEDGER_STORAGE_KEY,
        JSON.stringify({ version: CONTENT_VERSION, data: obj })
      );
    } catch {
      // ignore
    }
  }

  public recordRun(log: CardLogEntry[]): void {
    const now = Date.now();
    for (const entry of log) {
      const pairKey = `${entry.bookId}|${entry.schemeId}`;
      const existing = this.pairs.get(pairKey) || { seen: 0, miss: 0, lastSeenAt: 0 };
      const newSeen = Math.min(255, existing.seen + 1);
      const newMiss = Math.min(255, existing.miss + (entry.correct ? 0 : 1));

      this.pairs.set(pairKey, {
        seen: newSeen,
        miss: newMiss,
        lastSeenAt: now,
      });
    }
    this.save();
  }

  public summary(): { seen: number[]; miss: number[]; version: number } {
    const seen: number[] = new Array(pairIndex.length).fill(0);
    const miss: number[] = new Array(pairIndex.length).fill(0);

    for (let i = 0; i < pairIndex.length; i++) {
      const key = pairIndex[i];
      const stat = this.pairs.get(key);
      if (stat) {
        seen[i] = stat.seen;
        miss[i] = stat.miss;
      }
    }

    return { seen, miss, version: CONTENT_VERSION };
  }

  public age(schemeId: string): void {
    const schemePairs = pairIndex.filter((p) => p.endsWith(`|${schemeId}`));
    if (schemePairs.length === 0) return;

    let seenCount = 0;
    for (const p of schemePairs) {
      if ((this.pairs.get(p)?.seen || 0) >= 1) {
        seenCount++;
      }
    }

    // If at least 90% of scheme pairs have seen >= 1, age by -1
    if (seenCount / schemePairs.length >= 0.9) {
      for (const p of schemePairs) {
        const stat = this.pairs.get(p);
        if (stat && stat.seen > 0) {
          stat.seen = Math.max(0, stat.seen - 1);
        }
      }
      this.save();
    }
  }

  public getPairStat(bookId: string, schemeId: string): PairStat {
    return this.pairs.get(`${bookId}|${schemeId}`) || { seen: 0, miss: 0, lastSeenAt: 0 };
  }

  public getBookStats(bookId: string): { seen: number; correct: number; accuracy: number } {
    let seen = 0;
    let miss = 0;
    for (const [key, stat] of this.pairs.entries()) {
      if (key.startsWith(`${bookId}|`)) {
        seen += stat.seen;
        miss += stat.miss;
      }
    }
    const correct = Math.max(0, seen - miss);
    const accuracy = seen > 0 ? Math.round((correct / seen) * 100) : 0;
    return { seen, correct, accuracy };
  }

  public resetProgress(): void {
    this.pairs.clear();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LEDGER_STORAGE_KEY);
      localStorage.removeItem('ft_shelf_rush_mastery');
      localStorage.removeItem('ft_shelf_rush_bests');
    }
  }
}

export const shelfRushLedger = new ShelfRushLedger();
