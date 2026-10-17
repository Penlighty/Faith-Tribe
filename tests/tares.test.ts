import { describe, it, expect } from 'vitest';
import { setupTares, reduceTares, scoreTares } from '../src/games/tares-among-the-wheat/reducer';
import contentData from '../src/games/tares-among-the-wheat/content.json';
import { Player, SessionConfig } from '../src/engine/types';

describe('Tares Among the Wheat Reducer and Scoring', () => {
  const mockPlayers: Player[] = [
    { id: 'p1', name: 'Peter', isHost: true, avatarSeed: '1', score: 0 },
    { id: 'p2', name: 'John', isHost: false, avatarSeed: '2', score: 0 },
    { id: 'p3', name: 'Mary', isHost: false, avatarSeed: '3', score: 0 },
    { id: 'p4', name: 'Martha', isHost: false, avatarSeed: '4', score: 0 },
    { id: 'p5', name: 'Luke', isHost: false, avatarSeed: '5', score: 0 },
    { id: 'p6', name: 'Barnabas', isHost: false, avatarSeed: '6', score: 0 },
  ];

  const mockConfig: SessionConfig = {
    roomCode: 'WHEAT',
    selectedGameId: 'tares-among-the-wheat',
    playMode: 'individuals',
    roundsCount: 6,
    soundEffects: true,
  };

  it('assigns 1 tare secret role for 6 players', () => {
    const state = setupTares(mockConfig, mockPlayers, [], contentData as any);
    expect(state.tarePlayerIds.length).toBe(1);
    expect(mockPlayers.some((p) => p.id === state.tarePlayerIds[0])).toBe(true);
    expect(state.currentPassage).toBeDefined();
  });

  it('advances clue turns when player finishes speaking clue', () => {
    let state = setupTares(mockConfig, mockPlayers, [], contentData as any);
    expect(state.activeCluePlayerIndex).toBe(0);

    state = reduceTares(
      state,
      {
        type: 'CLUE_DONE',
        playerId: 'p1',
        payload: {},
        timestamp: Date.now(),
      },
      'p1'
    );

    expect(state.activeCluePlayerIndex).toBe(1);
  });

  it('scores wheat +1 when the tare is unmasked by majority vote', () => {
    let state = setupTares(mockConfig, mockPlayers, [], contentData as any);
    state.tarePlayerIds = ['p6']; // Barnabas is the tare

    // Everyone votes for Barnabas (p6)
    mockPlayers.slice(0, 5).forEach((p) => {
      state = reduceTares(
        state,
        {
          type: 'CAST_VOTE',
          playerId: p.id,
          payload: { accusedPlayerId: 'p6' },
          timestamp: Date.now(),
        },
        p.id
      );
    });

    state = reduceTares(
      state,
      {
        type: 'RESOLVE_VOTES',
        playerId: 'HOST',
        payload: {},
        timestamp: Date.now(),
      },
      'HOST'
    );

    expect(state.isTareCaught).toBe(true);
    expect(state.roundScores['p1']).toBe(1);
    expect(state.roundScores['p6']).toBe(0);
  });

  it('scores tare +2 when surviving uncaught', () => {
    let state = setupTares(mockConfig, mockPlayers, [], contentData as any);
    state.tarePlayerIds = ['p6'];

    // Disciples wrongfully accuse Peter (p1)
    mockPlayers.forEach((p) => {
      state.votes[p.id] = 'p1';
    });

    state = reduceTares(
      state,
      {
        type: 'RESOLVE_VOTES',
        playerId: 'HOST',
        payload: {},
        timestamp: Date.now(),
      },
      'HOST'
    );

    expect(state.isTareCaught).toBe(false);
    expect(state.roundScores['p6']).toBe(2);
    expect(state.roundScores['p1']).toBe(0);
  });

  it('awards tare +1 point if caught but makes a successful steal guess', () => {
    let state = setupTares(mockConfig, mockPlayers, [], contentData as any);
    state.tarePlayerIds = ['p6'];
    state.currentPassage.title = 'David and Goliath in the Valley of Elah';

    state = reduceTares(
      state,
      {
        type: 'TARE_STEAL',
        playerId: 'p6',
        payload: { guessedTitle: 'David and Goliath in the Valley of Elah' },
        timestamp: Date.now(),
      },
      'p6'
    );

    expect(state.isStealSuccessful).toBe(true);
    expect(state.roundScores['p6']).toBe(1);
  });

  it('plans randomized sessions with escalating passage difficulty', () => {
    const state = setupTares(mockConfig, mockPlayers, [], contentData as any);
    expect(state.plannedPassages).toBeDefined();
    expect(state.plannedPassages!.length).toBe(mockConfig.roundsCount);

    const firstPassage = state.plannedPassages![0];
    const lastPassage = state.plannedPassages![state.plannedPassages!.length - 1];
    expect(firstPassage).toBeDefined();
    expect(lastPassage).toBeDefined();
    expect(firstPassage.id).not.toBe(lastPassage.id);
  });
});
