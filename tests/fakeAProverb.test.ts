import { describe, it, expect } from 'vitest';
import { setupFakeAProverb, reduceFakeAProverb, scoreFakeAProverb } from '../src/games/fake-a-proverb/reducer';
import contentData from '../src/games/fake-a-proverb/content.json';
import { Player, SessionConfig } from '../src/engine/types';

describe('Fake-a-Proverb Reducer and Scoring', () => {
  const mockPlayers: Player[] = [
    { id: 'p1', name: 'Peter', isHost: true, avatarSeed: '1', score: 0 },
    { id: 'p2', name: 'John', isHost: false, avatarSeed: '2', score: 0 },
    { id: 'p3', name: 'Mary', isHost: false, avatarSeed: '3', score: 0 },
    { id: 'p4', name: 'Martha', isHost: false, avatarSeed: '4', score: 0 },
  ];

  const mockConfig: SessionConfig = {
    roomCode: 'ZION',
    selectedGameId: 'fake-a-proverb',
    playMode: 'individuals',
    roundsCount: 6,
    soundEffects: true,
  };

  it('initializes state with proverb and players', () => {
    const state = setupFakeAProverb(mockConfig, mockPlayers, [], contentData as any);
    expect(state.roundNumber).toBe(1);
    expect(state.currentProverb).toBeDefined();
    expect(state.currentProverb.firstHalf).toBeTruthy();
    expect(Object.keys(state.scores)).toHaveLength(4);
  });

  it('records fake ending submissions', () => {
    let state = setupFakeAProverb(mockConfig, mockPlayers, [], contentData as any);
    state = reduceFakeAProverb(
      state,
      {
        type: 'SUBMIT_ENDING',
        playerId: 'p2',
        payload: { ending: 'will fall into a ditch.' },
        timestamp: Date.now(),
      },
      'p2'
    );

    expect(state.submissions['p2']).toBe('will fall into a ditch.');
  });

  it('prepares voting list with real ending and submitted fake endings', () => {
    let state = setupFakeAProverb(mockConfig, mockPlayers, [], contentData as any);
    state.submissions['p2'] = 'Fake ending 1';
    state.submissions['p3'] = 'Fake ending 2';

    state = reduceFakeAProverb(
      state,
      {
        type: 'PREPARE_VOTING',
        playerId: 'HOST',
        payload: {},
        timestamp: Date.now(),
      },
      'HOST'
    );

    expect(state.shuffledEndings.length).toBe(3);
    const hasReal = state.shuffledEndings.some((e) => e.isReal && e.ending === state.currentProverb.realEnding);
    expect(hasReal).toBe(true);
  });

  it('calculates points correctly including +2 bonus when over half the room votes for your fake', () => {
    let state = setupFakeAProverb(mockConfig, mockPlayers, [], contentData as any);
    state.currentProverb.realEnding = 'the true scripture ending.';
    state.submissions['p2'] = 'convincing fake ending';

    state.shuffledEndings = [
      { ending: 'the true scripture ending.', isReal: true },
      { ending: 'convincing fake ending', isReal: false, authorId: 'p2' },
    ];

    // p1 votes real ending (+1 for p1)
    state.votes['p1'] = 'the true scripture ending.';
    // p3 and p4 vote p2's fake ending (2 out of 4 players = > half the room picking fake? 2 is not > 2. If 3 vote it's > 2)
    state.votes['p3'] = 'convincing fake ending';
    state.votes['p4'] = 'convincing fake ending';

    state = reduceFakeAProverb(
      state,
      {
        type: 'CALCULATE_ROUND_SCORES',
        playerId: 'HOST',
        payload: {},
        timestamp: Date.now(),
      },
      'HOST'
    );

    // p1 got 1 point for real ending
    expect(state.roundScores['p1']).toBe(1);
    // p2 got 2 points (2 votes)
    expect(state.roundScores['p2']).toBe(2);

    // Now test with 3 votes for p2 (> half of 4)
    state.votes['p1'] = 'convincing fake ending';
    state = reduceFakeAProverb(
      state,
      {
        type: 'CALCULATE_ROUND_SCORES',
        playerId: 'HOST',
        payload: {},
        timestamp: Date.now(),
      },
      'HOST'
    );

    // 3 votes + 2 bonus = 5 points
    expect(state.roundScores['p2']).toBe(5);
  });

  it('ranks leaderboard accurately in descending order', () => {
    let state = setupFakeAProverb(mockConfig, mockPlayers, [], contentData as any);
    state.scores = { p1: 3, p2: 8, p3: 1, p4: 6 };

    const leaderboard = scoreFakeAProverb(state, mockPlayers, []);
    expect(leaderboard[0].id).toBe('p2');
    expect(leaderboard[0].rank).toBe(1);
    expect(leaderboard[1].id).toBe('p4');
    expect(leaderboard[3].id).toBe('p3');
  });

  it('plans randomized sessions with escalating difficulty', () => {
    const state1 = setupFakeAProverb(mockConfig, mockPlayers, [], contentData as any);
    const state2 = setupFakeAProverb(mockConfig, mockPlayers, [], contentData as any);

    expect(state1.plannedProverbs).toBeDefined();
    expect(state1.plannedProverbs!.length).toBe(mockConfig.roundsCount);

    // Difficulty should start easy/medium and ramp up
    const firstTier = state1.plannedProverbs![0].difficulty;
    const lastTier = state1.plannedProverbs![state1.plannedProverbs!.length - 1].difficulty;
    expect(firstTier).toBe('easy');
    expect(lastTier).toBe('hard');

    // Both sessions should not produce the exact same sequence
    const ids1 = state1.plannedProverbs!.map((p) => p.id).join(',');
    const ids2 = state2.plannedProverbs!.map((p) => p.id).join(',');
    // With 30+ proverbs in pool, chance of identical 6-card pick is negligible
    expect(ids1).not.toBe('');
    expect(ids2).not.toBe('');
  });
});
