import { describe, it, expect, beforeEach } from 'vitest';
import {
  fetchFellowshipStats,
  getCachedFellowshipStats,
  saveCachedFellowshipStats,
  getEmptyFellowshipStats,
  recordGameResult,
  GameResultRecord,
} from '../src/engine/services/gameDataService';

// Mock localStorage and window for Node test environment
const memoryStorage: Record<string, string> = {};
const mockStorage = {
  getItem: (k: string) => memoryStorage[k] || null,
  setItem: (k: string, v: string) => {
    memoryStorage[k] = v;
  },
  removeItem: (k: string) => {
    delete memoryStorage[k];
  },
  clear: () => {
    Object.keys(memoryStorage).forEach((k) => delete memoryStorage[k]);
  },
};

(globalThis as any).localStorage = mockStorage;
(globalThis as any).sessionStorage = mockStorage;
(globalThis as any).window = {
  location: { origin: 'http://localhost:3000' },
};

describe('User Data Privacy & Isolation System', () => {
  beforeEach(() => {
    mockStorage.clear();
  });

  it('returns clean zero-state for new users with zero data leakage', async () => {
    const stats = await fetchFellowshipStats('new_user_123', 'NewDisciple');

    expect(stats.gamesPlayedThisMonth).toBe(0);
    expect(stats.totalGamesPlayed).toBe(0);
    expect(stats.winsCount).toBe(0);
    expect(stats.victoryRate).toBe(0);
    expect(stats.favoritePick).toBe('None Yet');
    expect(stats.recentlyGathered).toEqual([]);
    expect(stats.activeCount).toBe(0);
  });

  it('partitions cached fellowship stats per user ID so User A never sees User B stats', () => {
    const userAStats = {
      ...getEmptyFellowshipStats(),
      gamesPlayedThisMonth: 12,
      winsCount: 8,
      victoryRate: 67,
      favoritePick: 'Proverbs',
    };

    const userBStats = {
      ...getEmptyFellowshipStats(),
      gamesPlayedThisMonth: 2,
      winsCount: 1,
      victoryRate: 50,
      favoritePick: 'Hot Coal',
    };

    saveCachedFellowshipStats(userAStats, 'user_a');
    saveCachedFellowshipStats(userBStats, 'user_b');

    const cachedA = getCachedFellowshipStats('user_a');
    const cachedB = getCachedFellowshipStats('user_b');
    const cachedGuest = getCachedFellowshipStats();

    expect(cachedA?.gamesPlayedThisMonth).toBe(12);
    expect(cachedB?.gamesPlayedThisMonth).toBe(2);
    expect(cachedGuest).toBeNull();
  });

  it('calculates personal activity strictly for games the user participated in', async () => {
    const userAId = 'user_david';
    const userAName = 'David King';

    // Store local match history for user_david
    const davidMatches: GameResultRecord[] = [
      {
        id: 'rec_1',
        gameId: 'fake-a-proverb',
        gameName: 'Fake a Proverb',
        roomCode: 'PSAL',
        connectionMode: 'online',
        finishedAt: Date.now(),
        totalRounds: 4,
        players: [
          { id: userAId, name: userAName, score: 240, isWinner: true },
          { id: 'user_jonathan', name: 'Jonathan', score: 180, isWinner: false },
        ],
      },
      {
        id: 'rec_2',
        gameId: 'fake-a-proverb',
        gameName: 'Fake a Proverb',
        roomCode: 'ZION',
        connectionMode: 'online',
        finishedAt: Date.now(),
        totalRounds: 4,
        players: [
          { id: userAId, name: userAName, score: 110, isWinner: false },
          { id: 'user_samuel', name: 'Samuel Prophet', score: 300, isWinner: true },
        ],
      },
    ];

    mockStorage.setItem(`faith_tribe_user_matches_${userAId}`, JSON.stringify(davidMatches));

    const stats = await fetchFellowshipStats(userAId, userAName);

    expect(stats.gamesPlayedThisMonth).toBe(2);
    expect(stats.totalGamesPlayed).toBe(2);
    expect(stats.winsCount).toBe(1);
    expect(stats.victoryRate).toBe(50);
    expect(stats.favoritePick).toBe('Proverbs');
    // Recently gathered must only include co-players Jonathan and Samuel, never strangers or David himself
    const gatheredNames = stats.recentlyGathered.map((g) => g.name);
    expect(gatheredNames).toContain('Jonathan');
    expect(gatheredNames).toContain('Samuel Prophet');
    expect(gatheredNames).not.toContain(userAName);
  });

  it('guarantees that an unrelated user cannot see David co-players or games', async () => {
    const userBId = 'user_stranger';
    const userBName = 'Stranger Disciple';

    // user_stranger has no games
    const stats = await fetchFellowshipStats(userBId, userBName);

    expect(stats.gamesPlayedThisMonth).toBe(0);
    expect(stats.totalGamesPlayed).toBe(0);
    expect(stats.winsCount).toBe(0);
    expect(stats.recentlyGathered).toEqual([]);
  });

  it('allows tribe members to see fellow fellowship disciples without leaking non-tribe users', async () => {
    const fellowTribeMembers = [
      { id: 'mbr_1', name: 'Peter Apostle', avatarSeed: 'peter' },
      { id: 'mbr_2', name: 'Paul Apostle', avatarSeed: 'paul' },
    ];

    const stats = await fetchFellowshipStats('user_new', 'New Believer', ['trb_antioch'], fellowTribeMembers);

    expect(stats.gamesPlayedThisMonth).toBe(0);
    expect(stats.recentlyGathered).toHaveLength(2);
    expect(stats.recentlyGathered.map((m) => m.name)).toEqual(['Peter Apostle', 'Paul Apostle']);
  });
});
