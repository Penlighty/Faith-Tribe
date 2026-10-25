/**
 * Seedable PRNG using xmur3 hash and mulberry32 generator.
 * Deterministic across all environments and platforms.
 */

export function xmur3(str: string): () => number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

export function mulberry32(a: number): () => number {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface PRNG {
  next(): number;
  int(minInclusive: number, maxInclusive: number): number;
  pick<T>(arr: T[]): T;
  weightedPick<T>(items: T[], weights: number[]): T;
  shuffle<T>(arr: T[]): T[];
}

export function createRNG(seedStr: string): PRNG {
  const seedGen = xmur3(seedStr);
  const nextFloat = mulberry32(seedGen());

  const rng: PRNG = {
    next() {
      return nextFloat();
    },
    int(a: number, b: number) {
      const min = Math.min(a, b);
      const max = Math.max(a, b);
      return Math.floor(nextFloat() * (max - min + 1)) + min;
    },
    pick<T>(arr: T[]): T {
      if (arr.length === 0) throw new Error('Cannot pick from empty array');
      const idx = Math.floor(nextFloat() * arr.length);
      return arr[idx];
    },
    weightedPick<T>(items: T[], weights: number[]): T {
      if (items.length === 0) throw new Error('Cannot weightedPick from empty items');
      let total = 0;
      for (const w of weights) total += Math.max(0, w);
      if (total <= 0) return rng.pick(items);

      let threshold = nextFloat() * total;
      for (let i = 0; i < items.length; i++) {
        threshold -= Math.max(0, weights[i]);
        if (threshold <= 0) return items[i];
      }
      return items[items.length - 1];
    },
    shuffle<T>(arr: T[]): T[] {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(nextFloat() * (i + 1));
        const temp = copy[i];
        copy[i] = copy[j];
        copy[j] = temp;
      }
      return copy;
    },
  };

  return rng;
}
