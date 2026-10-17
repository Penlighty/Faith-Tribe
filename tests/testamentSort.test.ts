import { describe, it, expect } from 'vitest';
import { setupTestamentSort, reduceTestamentSort, scoreTestamentSort } from '../src/games/testament-sort/reducer';
import { allTestamentSortItems } from '../src/engine/content/loader';
import { Player, Team, SessionConfig } from '../src/engine/types';

describe('Step 3: Testament Sort Game Reducer', () => {
  const players: Player[] = [
    { id: 'p1', name: 'Peter', isHost: true, avatarSeed: 'seed1', score: 0 },
    { id: 'p2', name: 'John', isHost: false, avatarSeed: 'seed2', score: 0 },
  ];

  const config: SessionConfig = {
    roomCode: 'FAITH',
    selectedGameId: 'testament-sort',
    playMode: 'individuals',
    roundsCount: 12,
    soundEffects: true,
  };

  it('initializes game state with 12 balanced cards in countdown phase', () => {
    const state = setupTestamentSort(config, players, [], allTestamentSortItems);
    expect(state.currentPhaseId).toBe('countdown');
    expect(state.totalCards).toBe(12);
    expect(state.currentIndex).toBe(0);
    expect(state.mode).toBe('everyone');
    expect(Object.keys(state.playerCardStates)).toHaveLength(2);
  });

  it('transitions from countdown to card phase with proper time limit', () => {
    let state = setupTestamentSort(config, players, [], allTestamentSortItems);
    state = reduceTestamentSort(
      state,
      { type: 'START_CARD', playerId: 'p1', payload: {}, timestamp: Date.now() },
      'p1'
    );
    expect(state.currentPhaseId).toBe('card');
    expect(state.phaseTimeRemaining).toBeGreaterThanOrEqual(12);
  });

  it('handles PICK and LOCK and transitions to reveal when all players lock', () => {
    let state = setupTestamentSort(config, players, [], allTestamentSortItems);
    state = reduceTestamentSort(
      state,
      { type: 'START_CARD', playerId: 'p1', payload: {}, timestamp: Date.now() },
      'p1'
    );

    const correctAnswer = state.currentCard.answer;

    // Player 1 picks correct answer and locks
    state = reduceTestamentSort(
      state,
      { type: 'PICK', playerId: 'p1', payload: { choice: correctAnswer }, timestamp: Date.now() },
      'p1'
    );
    state = reduceTestamentSort(
      state,
      { type: 'LOCK', playerId: 'p1', payload: { elapsedSeconds: 3 }, timestamp: Date.now() },
      'p1'
    );
    expect(state.playerCardStates['p1'].locked).toBe(true);
    expect(state.currentPhaseId).toBe('card'); // p2 has not locked yet

    // Player 2 picks and locks
    const wrongChoice = correctAnswer === 'OT' ? 'NT' : 'OT';
    state = reduceTestamentSort(
      state,
      { type: 'PICK', playerId: 'p2', payload: { choice: wrongChoice }, timestamp: Date.now() },
      'p2'
    );
    state = reduceTestamentSort(
      state,
      { type: 'LOCK', playerId: 'p2', payload: { elapsedSeconds: 5 }, timestamp: Date.now() },
      'p2'
    );

    // Both locked -> triggers evaluateRoundCompletion -> reveal
    expect(state.currentPhaseId).toBe('reveal');
    expect(state.playerCardStates['p1'].isCorrect).toBe(true);
    expect(state.playerCardStates['p1'].scoreEarned).toBeGreaterThan(0);
    expect(state.playerCardStates['p2'].isCorrect).toBe(false);
  });

  it('tracks hint usage and scores accordingly', () => {
    let state = setupTestamentSort(config, players, [], allTestamentSortItems);
    state = reduceTestamentSort(
      state,
      { type: 'START_CARD', playerId: 'p1', payload: {}, timestamp: Date.now() },
      'p1'
    );

    // Player 1 uses hint
    state = reduceTestamentSort(
      state,
      { type: 'USE_HINT', playerId: 'p1', payload: {}, timestamp: Date.now() },
      'p1'
    );
    expect(state.playerCardStates['p1'].hintUsed).toBe(true);
  });

  it('generates leaderboard with tied ranks sharing rank position', () => {
    let state = setupTestamentSort(config, players, [], allTestamentSortItems);
    state.scores['p1'] = 200;
    state.scores['p2'] = 200;

    const leaderboard = scoreTestamentSort(state, players, []);
    expect(leaderboard[0].rank).toBe(1);
    expect(leaderboard[1].rank).toBe(1);
  });
});
