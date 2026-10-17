import { describe, it, expect } from 'vitest';
import rawWhoSaid from '../src/content/who-said.json';
import rawTestamentSort from '../src/content/testament-sort.json';
import {
  validateWhoSaidData,
  validateTestamentSortData,
} from '../src/engine/content/schemas';
import {
  planWhoSaidSession,
  planTestamentSortSession,
  selectFreshItem,
} from '../src/engine/services/antiRepeatLedger';

describe('Step 1: Content Schemas & Anti-Repeat Ledger', () => {
  it('validates all 72 Who Said That items with Zod schema', () => {
    const validated = validateWhoSaidData(rawWhoSaid as unknown[]);
    expect(validated.length).toBe(72);

    // Verify 18 questions per tier
    const t1 = validated.filter((q) => q.tier === 1);
    const t2 = validated.filter((q) => q.tier === 2);
    const t3 = validated.filter((q) => q.tier === 3);
    const t4 = validated.filter((q) => q.tier === 4);
    expect(t1.length).toBe(18);
    expect(t2.length).toBe(18);
    expect(t3.length).toBe(18);
    expect(t4.length).toBe(18);

    // Verify every question has 4 unique options including the answer
    for (const q of validated) {
      expect(q.options.length).toBe(4);
      expect(new Set(q.options).size).toBe(4);
      expect(q.options.includes(q.answer)).toBe(true);
      expect(q.ref).toBeTruthy();
      expect(q.note).toBeTruthy();
    }
  });

  it('validates all 100 Testament Sort items with Zod schema', () => {
    const validated = validateTestamentSortData(rawTestamentSort as unknown[]);
    expect(validated.length).toBe(100);

    // Verify 25 entries per tier
    const t1 = validated.filter((q) => q.tier === 1);
    const t2 = validated.filter((q) => q.tier === 2);
    const t3 = validated.filter((q) => q.tier === 3);
    const t4 = validated.filter((q) => q.tier === 4);
    expect(t1.length).toBe(25);
    expect(t2.length).toBe(25);
    expect(t3.length).toBe(25);
    expect(t4.length).toBe(25);

    // Verify answers and hints do not spoil OT/NT explicitly
    for (const item of validated) {
      expect(['OT', 'NT', 'BOTH']).toContain(item.answer);
      expect(['person', 'place', 'thing']).toContain(item.type);
      expect(item.hint).not.toMatch(/Old Testament/i);
      expect(item.hint).not.toMatch(/New Testament/i);
    }
  });

  it('plans a 20-question Who Said That session with freshness and constraint rules', () => {
    const items = validateWhoSaidData(rawWhoSaid as unknown[]);
    const session = planWhoSaidSession(items, { sessionLength: 20 });
    expect(session.length).toBe(20);

    // Unique IDs check
    const ids = session.map((s) => s.id);
    expect(new Set(ids).size).toBe(20);

    // Tier schedule: 5 per tier
    expect(session.slice(0, 5).every((s) => s.tier === 1)).toBe(true);
    expect(session.slice(5, 10).every((s) => s.tier === 2)).toBe(true);
    expect(session.slice(10, 15).every((s) => s.tier === 3)).toBe(true);
    expect(session.slice(15, 20).every((s) => s.tier === 4)).toBe(true);

    // No consecutive same speaker
    for (let i = 1; i < session.length; i++) {
      expect(session[i].answer.toLowerCase()).not.toBe(session[i - 1].answer.toLowerCase());
    }

    // God/Jesus capped at <= 1 in 8
    const jesusCount = session.filter(
      (s) =>
        s.answer.toLowerCase().includes('jesus') ||
        s.answer.toLowerCase().includes('god')
    ).length;
    expect(jesusCount).toBeLessThanOrEqual(3);
  });

  it('plans a 12-question Testament Sort session avoiding 3 consecutive same answers', () => {
    const items = validateTestamentSortData(rawTestamentSort as unknown[]);
    const session = planTestamentSortSession(items, { sessionLength: 12 });
    expect(session.length).toBe(12);

    // Unique IDs
    expect(new Set(session.map((s) => s.id)).size).toBe(12);

    // Check no 3 in a row
    for (let i = 2; i < session.length; i++) {
      const sameThree =
        session[i].answer === session[i - 1].answer &&
        session[i - 1].answer === session[i - 2].answer;
      expect(sameThree).toBe(false);
    }
  });

  it('selectFreshItem prefers unseen questions for players in room', () => {
    const pool = [
      { id: 'q1', text: 'Item 1' },
      { id: 'q2', text: 'Item 2' },
      { id: 'q3', text: 'Item 3' },
    ];
    // Player 1 and Player 2 have seen q1 and q2, but no one has seen q3
    const roomSeenData = [
      { playerId: 'p1', seenIds: { q1: 100, q2: 200 } },
      { playerId: 'p2', seenIds: { q1: 150, q2: 250 } },
    ];

    const picked = selectFreshItem(pool, roomSeenData, new Set());
    expect(picked?.id).toBe('q3');
  });
});
