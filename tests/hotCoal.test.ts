import { describe, it, expect } from 'vitest';
import { setupHotCoal, reduceHotCoal, scoreHotCoal } from '../src/games/hot-coal/reducer';
import contentData from '../src/games/hot-coal/content.json';
import { Player, SessionConfig } from '../src/engine/types';

describe('Hot Coal Reducer and Scoring', () => {
  const mockPlayers: Player[] = [
    { id: 'p1', name: 'Peter', isHost: true, avatarSeed: '1', score: 0 },
    { id: 'p2', name: 'John', isHost: false, avatarSeed: '2', score: 0 },
    { id: 'p3', name: 'Mary', isHost: false, avatarSeed: '3', score: 0 },
    { id: 'p4', name: 'Martha', isHost: false, avatarSeed: '4', score: 0 },
    { id: 'p5', name: 'Luke', isHost: false, avatarSeed: '5', score: 0 },
  ];

  const mockConfig: SessionConfig = {
    roomCode: 'FIRE',
    selectedGameId: 'hot-coal',
    playMode: 'individuals',
    roundsCount: 5,
    soundEffects: true,
  };

  it('initializes Hot Coal with a random holder and category', () => {
    const state = setupHotCoal(mockConfig, mockPlayers, [], contentData as any);
    expect(state.currentCategory).toBeDefined();
    expect(state.coalHolderId).toBeTruthy();
    expect(state.fuseDurationSeconds).toBeGreaterThan(0);
  });

  it('passes coal from current holder to target disciple', () => {
    let state = setupHotCoal(mockConfig, mockPlayers, [], contentData as any);
    state.coalHolderId = 'p1';

    state = reduceHotCoal(
      state,
      {
        type: 'PASS_COAL',
        playerId: 'p1',
        payload: { targetPlayerId: 'p3' },
        timestamp: Date.now(),
      },
      'p1'
    );

    expect(state.coalHolderId).toBe('p3');
    expect(state.passedPlayerIds).toContain('p1');
  });

  it('resolves challenge against an invalid answer causing challenged player to burn', () => {
    let state = setupHotCoal(mockConfig, mockPlayers, [], contentData as any);
    state.coalHolderId = 'p2';

    // p1 initiates challenge against p2
    state = reduceHotCoal(
      state,
      {
        type: 'INITIATE_CHALLENGE',
        playerId: 'p1',
        payload: {},
        timestamp: Date.now(),
      },
      'p1'
    );

    expect(state.activeChallenge?.challengerId).toBe('p1');
    expect(state.activeChallenge?.challengedId).toBe('p2');

    // Answer was invalid
    state = reduceHotCoal(
      state,
      {
        type: 'RESOLVE_CHALLENGE',
        playerId: 'HOST',
        payload: { wasValidAnswer: false },
        timestamp: Date.now(),
      },
      'HOST'
    );

    expect(state.burnCount['p2']).toBe(1);
    expect(state.lastBurnedPlayerId).toBe('p2');
  });

  it('triggers burn on current holder when fuse ends', () => {
    let state = setupHotCoal(mockConfig, mockPlayers, [], contentData as any);
    state.coalHolderId = 'p4';

    state = reduceHotCoal(
      state,
      {
        type: 'TRIGGER_BURN',
        playerId: 'HOST',
        payload: {},
        timestamp: Date.now(),
      },
      'HOST'
    );

    expect(state.burnCount['p4']).toBe(1);
    expect(state.lastBurnedPlayerId).toBe('p4');
  });

  it('ranks players with fewest burns first (ascending)', () => {
    let state = setupHotCoal(mockConfig, mockPlayers, [], contentData as any);
    state.burnCount = { p1: 0, p2: 3, p3: 1, p4: 2, p5: 0 };

    const leaderboard = scoreHotCoal(state, mockPlayers, []);
    expect(leaderboard[0].score).toBe(0);
    expect(leaderboard[0].rank).toBe(1);
    expect(leaderboard[4].score).toBe(3); // 3 burns is lowest rank
  });

  it('plans randomized sessions with escalating category difficulty', () => {
    const state = setupHotCoal(mockConfig, mockPlayers, [], contentData as any);
    expect(state.plannedCategories).toBeDefined();
    expect(state.plannedCategories!.length).toBe(mockConfig.roundsCount);

    const firstCat = state.plannedCategories![0];
    const lastCat = state.plannedCategories![state.plannedCategories!.length - 1];
    expect(firstCat.difficulty).toBe('easy');
    expect(lastCat.difficulty).toBe('hard');
  });
});
