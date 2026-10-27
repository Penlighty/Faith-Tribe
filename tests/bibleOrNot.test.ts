import { describe, it, expect } from 'vitest';
import { setupBibleOrNot, reduceBibleOrNot, scoreBibleOrNot } from '../src/games/bible-or-not/reducer';
import { calculateBibleOrNotScore, getBibleOrNotTimeLimit } from '../src/games/bible-or-not/scoring';
import { allBibleOrNotItems } from '../src/engine/content/loader';
import { BibleOrNotItemSchema } from '../src/engine/content/schemas';
import { planBibleOrNotSession } from '../src/engine/services/antiRepeatLedger';
import { Player, SessionConfig } from '../src/engine/types';

import {
  shuffleBalancedBibleOrNotDeck,
  getFreshBibleOrNotPool,
  markItemSeen,
} from '../src/engine/services/randomizer';

describe('Bible or Not Game Plugin & Reducer Suite', () => {
  const players: Player[] = [
    { id: 'p1', name: 'Peter', isHost: true, avatarSeed: 'seed1', score: 0 },
    { id: 'p2', name: 'John', isHost: false, avatarSeed: 'seed2', score: 0 },
    { id: 'p3', name: 'James', isHost: false, avatarSeed: 'seed3', score: 0 },
    { id: 'p4', name: 'Andrew', isHost: false, avatarSeed: 'seed4', score: 0 },
  ];

  const config: SessionConfig = {
    roomCode: 'WORD',
    selectedGameId: 'bible-or-not',
    playMode: 'individuals',
    roundsCount: 12,
    soundEffects: true,
  };

  it('validates the complete 600+ dataset schema and uniqueness', () => {
    expect(allBibleOrNotItems.length).toBeGreaterThanOrEqual(600);
    const ids = new Set<string>();

    let inBibleCount = 0;
    let notInBibleCount = 0;

    for (const item of allBibleOrNotItems) {
      expect(() => BibleOrNotItemSchema.parse(item)).not.toThrow();
      expect(ids.has(item.id)).toBe(false);
      ids.add(item.id);

      if (item.answer === 'IN_BIBLE') inBibleCount++;
      if (item.answer === 'NOT_IN_BIBLE') notInBibleCount++;
    }

    expect(inBibleCount).toBeGreaterThanOrEqual(300);
    expect(notInBibleCount).toBeGreaterThanOrEqual(300);
  });

  it('plans balanced non-repeating cards via antiRepeatLedger with answer balance & anti-clustering', () => {
    const planned = planBibleOrNotSession(allBibleOrNotItems, { sessionLength: 12 });
    expect(planned).toHaveLength(12);

    const ids = new Set(planned.map((c) => c.id));
    expect(ids.size).toBe(12);

    // Balanced 50/50: 6 IN_BIBLE, 6 NOT_IN_BIBLE
    const inCount = planned.filter((c) => c.answer === 'IN_BIBLE').length;
    const notCount = planned.filter((c) => c.answer === 'NOT_IN_BIBLE').length;
    expect(inCount).toBe(6);
    expect(notCount).toBe(6);

    // Anti-clustering: Never more than 2 consecutive identical answers in a row
    for (let i = 2; i < planned.length; i++) {
      const runOfThree =
        planned[i].answer === planned[i - 1].answer &&
        planned[i].answer === planned[i - 2].answer;
      expect(runOfThree).toBe(false);
    }
  });

  it('shuffles non-deterministically across multiple planning sessions', () => {
    const plan1 = planBibleOrNotSession(allBibleOrNotItems, { sessionLength: 12 });
    const plan2 = planBibleOrNotSession(allBibleOrNotItems, { sessionLength: 12 });

    const ids1 = plan1.map((c) => c.id).join(',');
    const ids2 = plan2.map((c) => c.id).join(',');
    // The probability of two random 12-item draws from a 640-item pool being identical is vanishingly small
    expect(ids1).not.toBe(ids2);
  });

  it('shuffleBalancedBibleOrNotDeck strictly limits consecutive same answers and balances 50/50', () => {
    const tier1Items = allBibleOrNotItems.filter((i) => i.tier === 1);
    const deck = shuffleBalancedBibleOrNotDeck(tier1Items);
    expect(deck).toHaveLength(tier1Items.length);

    // Check no 3 in a row
    for (let i = 2; i < deck.length; i++) {
      const threeInARow =
        deck[i].answer === deck[i - 1].answer &&
        deck[i].answer === deck[i - 2].answer;
      expect(threeInARow).toBe(false);
    }

    // Check first 10 cards have a fair mix (not all NOT_IN_BIBLE or all IN_BIBLE)
    const first10 = deck.slice(0, 10);
    const inCount10 = first10.filter((c) => c.answer === 'IN_BIBLE').length;
    expect(inCount10).toBeGreaterThanOrEqual(4);
    expect(inCount10).toBeLessThanOrEqual(6);
  });

  it('getFreshBibleOrNotPool delivers balanced cards and prioritizes unseen items', () => {
    // Mark a few cards as seen
    const t1 = allBibleOrNotItems.filter((i) => i.tier === 1);
    const seenCard = t1[0];
    markItemSeen('bible-or-not', seenCard.id);

    const freshPool = getFreshBibleOrNotPool(1);
    expect(freshPool.length).toBe(t1.length);

    // First cards must not be the seen card when unseen pool is abundant
    const first5Ids = freshPool.slice(0, 5).map((c) => c.id);
    expect(first5Ids).not.toContain(seenCard.id);

    // First 10 cards must still respect anti-clustering
    for (let i = 2; i < 10; i++) {
      const run =
        freshPool[i].answer === freshPool[i - 1].answer &&
        freshPool[i].answer === freshPool[i - 2].answer;
      expect(run).toBe(false);
    }
  });

  it('initializes game state in tournament countdown phase', () => {
    const state = setupBibleOrNot(config, players, [], allBibleOrNotItems);
    expect(state.currentPhaseId).toBe('countdown');
    expect(state.currentRound).toBe(1);
    expect(state.totalRounds).toBe(3);
    expect(state.survivingPlayerIds).toHaveLength(4);
    expect(state.eliminatedPlayerIds).toHaveLength(0);
    expect(Object.keys(state.playerCardStates)).toHaveLength(4);
  });

  it('transitions from countdown to card phase with proper time limit', () => {
    let state = setupBibleOrNot(config, players, [], allBibleOrNotItems);
    state = reduceBibleOrNot(
      state,
      { type: 'START_CARD', playerId: 'p1', payload: {}, timestamp: Date.now() },
      'p1'
    );
    expect(state.currentPhaseId).toBe('card');
    const expectedLimit = getBibleOrNotTimeLimit(state.currentCard.tier);
    expect(state.phaseTimeRemaining).toBe(expectedLimit);
  });

  it('handles player swipe, lock, and auto-reveal when all surviving players lock', () => {
    let state = setupBibleOrNot(config, players, [], allBibleOrNotItems);
    state = reduceBibleOrNot(
      state,
      { type: 'START_CARD', playerId: 'p1', payload: {}, timestamp: Date.now() },
      'p1'
    );

    const correctAnswer = state.currentCard.answer;

    // Player 1 picks and locks correctly
    state = reduceBibleOrNot(
      state,
      { type: 'PICK', playerId: 'p1', payload: { choice: correctAnswer }, timestamp: Date.now() },
      'p1'
    );
    state = reduceBibleOrNot(
      state,
      { type: 'LOCK', playerId: 'p1', payload: { choice: correctAnswer, elapsedSeconds: 2 }, timestamp: Date.now() },
      'p1'
    );
    expect(state.playerCardStates.p1.locked).toBe(true);
    expect(state.playerCardStates.p1.isCorrect).toBe(true);
    expect(state.scores.p1).toBeGreaterThan(0);

    // Remaining players lock
    for (const p of ['p2', 'p3', 'p4']) {
      state = reduceBibleOrNot(
        state,
        { type: 'LOCK', playerId: p, payload: { choice: 'NOT_IN_BIBLE', elapsedSeconds: 4 }, timestamp: Date.now() },
        p
      );
    }

    // Auto-transitions to reveal because all 4 active players are locked
    expect(state.currentPhaseId).toBe('reveal');
    expect(state.phaseTimeRemaining).toBe(6);
    expect(state.roundTally.IN_BIBLE + state.roundTally.NOT_IN_BIBLE).toBe(4);
  });

  it('calculates score with speed and streak bonuses', () => {
    // Incorrect answer
    const wrong = calculateBibleOrNotScore({
      tier: 1,
      elapsedSeconds: 3,
      isCorrect: false,
    });
    expect(wrong.points).toBe(0);

    // Fast correct answer
    const fast = calculateBibleOrNotScore({
      tier: 2,
      elapsedSeconds: 1,
      isCorrect: true,
      streakCount: 0,
    });
    expect(fast.points).toBeGreaterThan(100);

    // Streak bonus
    const withStreak = calculateBibleOrNotScore({
      tier: 2,
      elapsedSeconds: 1,
      isCorrect: true,
      streakCount: 5,
    });
    expect(withStreak.points).toBeGreaterThan(fast.points);
  });

  it('handles tournament elimination across rounds and produces final podium', () => {
    let state = setupBibleOrNot(config, players, [], allBibleOrNotItems);

    // Artificially assign differentiated scores
    state.scores = { p1: 500, p2: 400, p3: 300, p4: 100 };

    // Advance to end of Round 1 (cardIndexInRound = 3, cardsPerRound = 4)
    state.cardIndexInRound = 3;
    state.currentPhaseId = 'reveal';
    state.phaseTimeRemaining = 0;

    // Trigger timer tick to complete round 1
    state = reduceBibleOrNot(
      state,
      { type: 'TIMER_TICK', playerId: 'host', payload: {}, timestamp: Date.now() },
      'host'
    );

    // Moves to roundSummary phase with bottom player eliminated
    expect(state.currentPhaseId).toBe('roundSummary');
    expect(state.survivingPlayerIds).toContain('p1');
    expect(state.survivingPlayerIds).toContain('p2');
    expect(state.survivingPlayerIds).toContain('p3');
    expect(state.eliminatedPlayerIds).toContain('p4');

    // Score leaderboard rankings
    const leaderboard = scoreBibleOrNot(state);
    expect(leaderboard[0].playerId).toBe('p1');
    expect(leaderboard[0].rank).toBe(1);
    expect(leaderboard[3].playerId).toBe('p4');
    expect(leaderboard[3].rank).toBe(4);
  });
});
