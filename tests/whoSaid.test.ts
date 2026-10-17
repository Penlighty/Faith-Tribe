import { describe, it, expect } from 'vitest';
import { setupWhoSaid, reduceWhoSaid, scoreWhoSaid } from '../src/games/who-said/reducer';
import { allWhoSaidItems } from '../src/engine/content/loader';
import { Player, Team, SessionConfig } from '../src/engine/types';

describe('Step 4: Who Said That? Game Reducer & Logic', () => {
  const players: Player[] = [
    { id: 'p1', name: 'Peter', isHost: true, avatarSeed: 'seed1', score: 0 },
    { id: 'p2', name: 'John', isHost: false, avatarSeed: 'seed2', score: 0 },
    { id: 'p3', name: 'Mary', isHost: false, avatarSeed: 'seed3', score: 0 },
  ];

  const config: SessionConfig = {
    roomCode: 'ZEAL',
    selectedGameId: 'who-said',
    playMode: 'individuals',
    roundsCount: 12,
    soundEffects: true,
  };

  it('initializes game with 12 planned questions and per-player shuffled options', () => {
    const state = setupWhoSaid(config, players, [], allWhoSaidItems);
    expect(state.currentPhaseId).toBe('countdown');
    expect(state.totalQuestions).toBe(12);
    expect(state.mode).toBe('fastest_finger');
    expect(state.isCloseCall).toBe(false);

    // Each player has 4 options containing the answer
    for (const p of players) {
      const pState = state.playerStates[p.id];
      expect(pState.shuffledOptions.length).toBe(4);
      expect(pState.shuffledOptions.includes(state.currentQuestion.answer)).toBe(true);
      expect(pState.locked).toBe(false);
    }
  });

  it('triggers Close Call window on first correct answer', () => {
    let state = setupWhoSaid(config, players, [], allWhoSaidItems);
    state = reduceWhoSaid(
      state,
      { type: 'START_QUESTION', playerId: 'p1', payload: {}, timestamp: Date.now() },
      'p1'
    );
    expect(state.currentPhaseId).toBe('question');
    expect(state.phaseTimeRemaining).toBeGreaterThan(5);

    const correctAnswer = state.currentQuestion.answer;

    // Player 1 locks in correct answer
    state = reduceWhoSaid(
      state,
      {
        type: 'ANSWER',
        playerId: 'p1',
        payload: { optionSpeaker: correctAnswer, elapsedSeconds: 2 },
        timestamp: Date.now(),
      },
      'p1'
    );

    // Close Call triggered! Timer snaps to at most 5s
    expect(state.firstCorrectPlayerId).toBe('p1');
    expect(state.isCloseCall).toBe(true);
    expect(state.phaseTimeRemaining).toBeLessThanOrEqual(5);
  });

  it('handles Fifty-Fifty power-up by removing two wrong options', () => {
    let state = setupWhoSaid(config, players, [], allWhoSaidItems);
    state = reduceWhoSaid(
      state,
      { type: 'START_QUESTION', playerId: 'p1', payload: {}, timestamp: Date.now() },
      'p1'
    );

    state = reduceWhoSaid(
      state,
      { type: 'USE_POWERUP', playerId: 'p1', payload: { type: 'fifty' }, timestamp: Date.now() },
      'p1'
    );

    const p1State = state.playerStates['p1'];
    expect(p1State.powerUpActive).toBe('fifty');
    expect(p1State.powerUpsUsed.fifty).toBe(true);
    expect(p1State.hiddenOptions.length).toBe(2);
    expect(p1State.hiddenOptions.includes(state.currentQuestion.answer)).toBe(false);
  });

  it('evaluates scores, awarding bonus to first correct answer', () => {
    let state = setupWhoSaid(config, players, [], allWhoSaidItems);
    state = reduceWhoSaid(
      state,
      { type: 'START_QUESTION', playerId: 'p1', payload: {}, timestamp: Date.now() },
      'p1'
    );

    const correctAnswer = state.currentQuestion.answer;
    const wrongAnswer = state.currentQuestion.options.find((o) => o !== correctAnswer)!;

    // p1 correct at 2s (first correct)
    state = reduceWhoSaid(
      state,
      {
        type: 'ANSWER',
        playerId: 'p1',
        payload: { optionSpeaker: correctAnswer, elapsedSeconds: 2 },
        timestamp: Date.now(),
      },
      'p1'
    );

    // p2 correct at 4s
    state = reduceWhoSaid(
      state,
      {
        type: 'ANSWER',
        playerId: 'p2',
        payload: { optionSpeaker: correctAnswer, elapsedSeconds: 4 },
        timestamp: Date.now(),
      },
      'p2'
    );

    // p3 wrong at 3s
    state = reduceWhoSaid(
      state,
      {
        type: 'ANSWER',
        playerId: 'p3',
        payload: { optionSpeaker: wrongAnswer, elapsedSeconds: 3 },
        timestamp: Date.now(),
      },
      'p3'
    );

    // All locked -> transitions to reveal
    expect(state.currentPhaseId).toBe('reveal');
    expect(state.playerStates['p1'].scoreEarned).toBeGreaterThan(state.playerStates['p2'].scoreEarned);
    expect(state.playerStates['p3'].scoreEarned).toBeLessThan(0); // Penalty
  });
});
