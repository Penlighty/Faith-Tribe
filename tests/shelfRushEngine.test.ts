import { describe, it, expect } from 'vitest';
import { calculateCardScore, calculateSchemeRunBonus, calculateAscentRunBonus } from '../src/games/shelf-rush/engine/scoring';
import { calculateSchemeWindowMs, calculateAscentWindowMs } from '../src/games/shelf-rush/engine/timing';
import { createInitialRunState, reduceRun } from '../src/games/shelf-rush/engine/run';
import { buildSchemeDeck, buildAscentDeck, getBookFamily, largestRemainder } from '../src/games/shelf-rush/engine/deck';
import { buildShelfRushLeaderboard } from '../src/games/shelf-rush/engine/leaderboard';
import { createRNG } from '../src/games/shelf-rush/engine/rng';
import { allSchemes, getScheme } from '../src/games/shelf-rush/engine/loader';

describe('Shelf Rush Engine: Scoring', () => {
  it('matches worked example 1: Testament scheme (2 bins), answered instantly, streakBefore 0 = 20 points', () => {
    // numBins=2, remainingMs=4000, windowMs=4000 (instant => speedFactor=2.0), streakBefore=0 => streakMult=1.0
    const points = calculateCardScore(2, 4000, 4000, 0);
    expect(points).toBe(20);
  });

  it('matches worked example 2: Testament scheme (2 bins), answered at buzzer, streakBefore 0 = 10 points', () => {
    // remainingMs=0, windowMs=4000 (buzzer => speedFactor=1.0), streakBefore=0 => streakMult=1.0
    const points = calculateCardScore(2, 0, 4000, 0);
    expect(points).toBe(10);
  });

  it('matches worked example 3: Genres scheme (6 bins), instantly, streakBefore 10 = 48 points', () => {
    // numBins=6 (binFactor=2.0), remainingMs=6000, windowMs=6000 (instant => speedFactor=2.0),
    // streakBefore=10 => streakMult = 1 + 0.1 * floor(10/5) = 1.2
    // round(10 * 2.0 * 2.0 * 1.2) = round(48.0) = 48
    const points = calculateCardScore(6, 6000, 6000, 10);
    expect(points).toBe(48);
  });

  it('calculates run completion bonuses for scheme mode', () => {
    const perfectBonus = calculateSchemeRunBonus({ completed: true, livesRemaining: 3, strikesUsed: 0 });
    // 100 completion + 3*50 lives + 100 perfect = 350
    expect(perfectBonus).toBe(350);

    const normalBonus = calculateSchemeRunBonus({ completed: true, livesRemaining: 1, strikesUsed: 2 });
    // 100 completion + 1*50 lives + 0 perfect = 150
    expect(normalBonus).toBe(150);

    const incomplete = calculateSchemeRunBonus({ completed: false, livesRemaining: 0, strikesUsed: 3 });
    expect(incomplete).toBe(0);
  });

  it('calculates ascent run bonuses', () => {
    const summitBonus = calculateAscentRunBonus({
      flawlessStepsCount: 15,
      reachedSummit: true,
      livesRemaining: 4,
    });
    // 15*25 + 150 summit + 4*50 = 375 + 150 + 200 = 725
    expect(summitBonus).toBe(725);
  });
});

describe('Shelf Rush Engine: Timing', () => {
  it('calculates scheme windows for 2, 4, 6, and 7 bins at start and floor', () => {
    const start2 = calculateSchemeWindowMs({ numBins: 2, deckSize: 66, correctCount: 0, speed: 'standard', accessTime: 1 });
    expect(start2).toBe(4000);

    const floor2 = calculateSchemeWindowMs({ numBins: 2, deckSize: 66, correctCount: 40, speed: 'standard', accessTime: 1 });
    expect(floor2).toBe(1600);

    const start4 = calculateSchemeWindowMs({ numBins: 4, deckSize: 66, correctCount: 0, speed: 'standard', accessTime: 1 });
    expect(start4).toBe(5000);

    const floor4 = calculateSchemeWindowMs({ numBins: 4, deckSize: 66, correctCount: 40, speed: 'standard', accessTime: 1 });
    expect(floor4).toBe(2400);

    const start6 = calculateSchemeWindowMs({ numBins: 6, deckSize: 66, correctCount: 0, speed: 'standard', accessTime: 1 });
    expect(start6).toBe(6000);

    const floor6 = calculateSchemeWindowMs({ numBins: 6, deckSize: 66, correctCount: 40, speed: 'standard', accessTime: 1 });
    expect(floor6).toBe(3000);
  });

  it('applies speed and access multipliers and enforces MIN_WINDOW_MS', () => {
    // Blitz speed 0.7 on 2 bins floor (1600 * 0.7 = 1120)
    const blitzFloor = calculateSchemeWindowMs({ numBins: 2, deckSize: 66, correctCount: 40, speed: 'blitz', accessTime: 1 });
    expect(blitzFloor).toBe(1120);

    // Access time 2.0 multiplies window
    const access2 = calculateSchemeWindowMs({ numBins: 2, deckSize: 66, correctCount: 0, speed: 'standard', accessTime: 2 });
    expect(access2).toBe(8000);
  });

  it('adds scheme change grace period in Ascent', () => {
    const standardAscent = calculateAscentWindowMs({
      numBins: 2,
      step: 1,
      speed: 'standard',
      accessTime: 1,
      schemeChange: false,
    });
    const graceAscent = calculateAscentWindowMs({
      numBins: 2,
      step: 1,
      speed: 'standard',
      accessTime: 1,
      schemeChange: true,
    });

    expect(graceAscent - standardAscent).toBe(1000);
  });
});

describe('Shelf Rush Engine: Run Reducer', () => {
  it('manages lives, streak, and scoring on correct/wrong sorts', () => {
    const config = {
      mode: 'scheme' as const,
      schemeId: 'testament',
      speed: 'standard' as const,
      lifeRule: 'forgiving' as const,
      play: 'solo' as const,
      accessTime: 1 as const,
    };

    const mockDeck = [
      { index: 0, bookId: 'genesis', schemeId: 'testament' },
      { index: 1, bookId: 'matthew', schemeId: 'testament' },
    ];

    let state = createInitialRunState(config, mockDeck);
    expect(state.lives).toBe(3);
    expect(state.status).toBe('ready');

    state = reduceRun(state, { type: 'START' });
    expect(state.status).toBe('showing');

    // Genesis is OT
    state = reduceRun(state, { type: 'SHOW', timestamp: 1000 });
    state = reduceRun(state, { type: 'SORT', binId: 'ot', timestamp: 1500 });

    expect(state.score).toBeGreaterThan(0);
    expect(state.streak).toBe(1);
    expect(state.lives).toBe(3);

    // Matthew is NT, answer wrong with 'ot'
    state = reduceRun(state, { type: 'SHOW', timestamp: 2000 });
    state = reduceRun(state, { type: 'SORT', binId: 'ot', timestamp: 2500 });

    expect(state.streak).toBe(0);
    expect(state.lives).toBe(2);
    // Boomerang requeue was appended/inserted
    expect(state.requeueCount).toBe(1);
  });

  it('handles timeout as wrong answer and deducts life', () => {
    const config = {
      mode: 'scheme' as const,
      schemeId: 'testament',
      speed: 'standard' as const,
      lifeRule: 'strict' as const,
      play: 'solo' as const,
      accessTime: 1 as const,
    };

    const mockDeck = [{ index: 0, bookId: 'genesis', schemeId: 'testament' }];
    let state = createInitialRunState(config, mockDeck);
    state = reduceRun(state, { type: 'START' });
    state = reduceRun(state, { type: 'SHOW', timestamp: 1000 });
    state = reduceRun(state, { type: 'TIMEOUT', timestamp: 5000 });

    expect(state.lives).toBe(2);
    expect(state.streak).toBe(0);
  });
});

describe('Shelf Rush Engine: Deck Generation', () => {
  it('generates scheme deck with all books exactly once and rhythm constraints', () => {
    const deck = buildSchemeDeck({ schemeId: 'testament', seed: 'test_seed_123' });
    expect(deck).toHaveLength(66);

    const ids = deck.map((c) => c.bookId);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(66);

    // Check rhythm constraint: <= 4 consecutive same bin in 2-bin scheme
    const scheme = getScheme('testament')!;
    let maxRun = 0;
    let curRun = 0;
    let prevBin = '';

    for (const card of deck) {
      const bin = scheme.assign[card.bookId];
      if (bin === prevBin) {
        curRun++;
      } else {
        curRun = 1;
        prevBin = bin;
      }
      if (curRun > maxRun) maxRun = curRun;
    }

    expect(maxRun).toBeLessThanOrEqual(4);
  });

  it('generates deterministic full Ascent deck of 75 cards without duplicate pairs', () => {
    const result1 = buildAscentDeck({ seed: 'ascent_test_456', length: 'full' });
    const result2 = buildAscentDeck({ seed: 'ascent_test_456', length: 'full' });

    expect(result1.deck).toHaveLength(75);
    expect(result1.metadata.steps).toBe(15);
    expect(result1.metadata.cardsPerStep).toBe(5);

    // Exact determinism
    expect(result1.deck).toEqual(result2.deck);

    // Step 1 contains NO hard scheme
    const step1Cards = result1.deck.filter((c) => c.step === 1);
    expect(step1Cards).toHaveLength(5);
    expect(step1Cards.some((c) => c.tier === 'hard')).toBe(false);

    // No duplicate (book, scheme) pair in the run
    const pairs = new Set<string>();
    for (const card of result1.deck) {
      const key = `${card.bookId}|${card.schemeId}`;
      expect(pairs.has(key)).toBe(false);
      pairs.add(key);
    }
  });

  it('generates short Ascent deck of 40 cards', () => {
    const shortResult = buildAscentDeck({ seed: 'short_seed', length: 'short' });
    expect(shortResult.deck).toHaveLength(40);
    expect(shortResult.metadata.steps).toBe(8);
  });
});

describe('Shelf Rush Engine: Leaderboard', () => {
  it('ranks players by completion desc, points desc, totalTimeMs asc, sharing rank on ties', () => {
    const rawResults = [
      { playerId: 'p1', name: 'Alice', completion: 1.0, points: 500, totalTimeMs: 40000 },
      { playerId: 'p2', name: 'Bob', completion: 1.0, points: 500, totalTimeMs: 40000 }, // tie with Alice
      { playerId: 'p3', name: 'Charlie', completion: 1.0, points: 450, totalTimeMs: 38000 },
      { playerId: 'p4', name: 'David', completion: 0.8, points: 300, totalTimeMs: 50000 },
    ];

    const lb = buildShelfRushLeaderboard(rawResults);
    expect(lb[0].rank).toBe(1);
    expect(lb[1].rank).toBe(1); // tied rank 1
    expect(lb[2].rank).toBe(3); // Charlie is rank 3
    expect(lb[3].rank).toBe(4); // David is rank 4
  });

  it('protects lives and enters revealing only on wrong sorts in practice mode', () => {
    const config = {
      mode: 'scheme' as const,
      schemeId: 'testament',
      speed: 'standard' as const,
      lifeRule: 'strict' as const,
      play: 'practice' as const,
      accessTime: 1 as const,
    };

    const mockDeck = [
      { index: 0, bookId: 'genesis', schemeId: 'testament' },
      { index: 1, bookId: 'matthew', schemeId: 'testament' },
    ];

    let state = createInitialRunState(config, mockDeck);
    state = reduceRun(state, { type: 'START' });
    state = reduceRun(state, { type: 'SHOW', timestamp: 1000 });

    // Correct sort: Genesis is OT -> stays showing (or advances), status should NOT be revealing
    state = reduceRun(state, { type: 'SORT', binId: 'ot', timestamp: 1500 });
    expect(state.status).toBe('showing');
    expect(state.lives).toBe(3); // protected

    // Wrong sort: Matthew is NT, answering 'ot' -> enters revealing and preserves lives
    state = reduceRun(state, { type: 'SHOW', timestamp: 2000 });
    state = reduceRun(state, { type: 'SORT', binId: 'ot', timestamp: 2500 });
    expect(state.status).toBe('revealing');
    expect(state.lives).toBe(3); // lives protected in practice mode!
  });

  it('marks run as finished or won when completing the deck', () => {
    const schemeConfig = {
      mode: 'scheme' as const,
      schemeId: 'testament',
      speed: 'standard' as const,
      lifeRule: 'strict' as const,
      play: 'solo' as const,
      accessTime: 1 as const,
    };

    const mockDeck = [{ index: 0, bookId: 'genesis', schemeId: 'testament' }];
    let state = createInitialRunState(schemeConfig, mockDeck);
    state = reduceRun(state, { type: 'START' });
    state = reduceRun(state, { type: 'SHOW', timestamp: 1000 });
    state = reduceRun(state, { type: 'SORT', binId: 'ot', timestamp: 1500 });

    // Finished scheme mode
    expect(state.status).toBe('finished');
  });
});

