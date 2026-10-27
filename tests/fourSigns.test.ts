import { describe, it, expect } from 'vitest';
import { allFourSignsPuzzles, allFourSignsIcons } from '../src/engine/content/loader';
import { setupFourSigns, reduceFourSigns } from '../src/games/four-signs/reducer';
import { calculateFourSignsScore, calculateFourSignsTimeLimit } from '../src/games/four-signs/scoring';
import { Player } from '../src/engine/types';

describe('Four Signs Game Engine', () => {
  const dummyPlayers: Player[] = [
    { id: 'p1', name: 'Peter', isHost: false, avatarSeed: 'p1', score: 0 },
    { id: 'p2', name: 'Paul', isHost: false, avatarSeed: 'p2', score: 0 },
  ];

  it('validates loaded puzzles and icons properly', () => {
    expect(allFourSignsPuzzles.length).toBeGreaterThanOrEqual(50);
    expect(allFourSignsIcons.length).toBeGreaterThan(0);

    const first = allFourSignsPuzzles[0];
    expect(first.clues).toHaveLength(4);
    expect(first.distractors).toHaveLength(3);
    expect(first.answer).toBeTruthy();
    expect(first.ref).toBeTruthy();
    expect(first.why).toBeTruthy();
  });

  it('initializes game state with shuffled options per player', () => {
    const state = setupFourSigns(
      { roomCode: 'TEST', selectedGameId: 'four-signs', playMode: 'individuals', roundsCount: 6, timerMultiplier: 1, soundEffects: true },
      dummyPlayers,
      [],
      allFourSignsPuzzles
    );

    expect(state.currentPhaseId).toBe('countdown');
    expect(state.puzzlesPool.length).toBe(6);
    expect(state.playerStates['p1']).toBeDefined();
    expect(state.playerStates['p2']).toBeDefined();

    const p1Options = state.playerStates['p1'].shuffledOptions;
    expect(p1Options).toHaveLength(4);
    expect(p1Options).toContain(state.currentPuzzle.answer);
  });

  it('handles START_PUZZLE phase transition and timer setting', () => {
    let state = setupFourSigns(
      { roomCode: 'TEST', selectedGameId: 'four-signs', playMode: 'individuals', roundsCount: 6, timerMultiplier: 1, soundEffects: true },
      dummyPlayers,
      [],
      allFourSignsPuzzles
    );

    state = reduceFourSigns(state, { type: 'START_PUZZLE', playerId: 'HOST', timestamp: Date.now() }, 'HOST');
    expect(state.currentPhaseId).toBe('clues');
    expect(state.phaseTimeRemaining).toBeGreaterThan(10);
    expect(state.isCloseCall).toBe(false);
  });

  it('uses 50-50 power-up to hide 2 wrong options', () => {
    let state = setupFourSigns(
      { roomCode: 'TEST', selectedGameId: 'four-signs', playMode: 'individuals', roundsCount: 6, timerMultiplier: 1, soundEffects: true },
      dummyPlayers,
      [],
      allFourSignsPuzzles
    );
    state = reduceFourSigns(state, { type: 'START_PUZZLE', playerId: 'HOST', timestamp: Date.now() }, 'HOST');

    state = reduceFourSigns(state, { type: 'USE_POWERUP', playerId: 'p1', payload: { type: 'fifty' }, timestamp: Date.now() }, 'p1');
    const p1State = state.playerStates['p1'];
    expect(p1State.powerUpsUsed.fifty).toBe(true);
    expect(p1State.hiddenOptions).toHaveLength(2);
    expect(p1State.hiddenOptions).not.toContain(state.currentPuzzle.answer);
  });

  it('locks in answer and triggers Close Call on first correct solver', () => {
    let state = setupFourSigns(
      { roomCode: 'TEST', selectedGameId: 'four-signs', playMode: 'individuals', roundsCount: 6, timerMultiplier: 1, soundEffects: true },
      dummyPlayers,
      [],
      allFourSignsPuzzles
    );
    state = reduceFourSigns(state, { type: 'START_PUZZLE', playerId: 'HOST', timestamp: Date.now() }, 'HOST');

    // Player 1 locks correct answer
    state = reduceFourSigns(
      state,
      { type: 'ANSWER', playerId: 'p1', payload: { option: state.currentPuzzle.answer, elapsedSeconds: 3 }, timestamp: Date.now() },
      'p1'
    );

    expect(state.playerStates['p1'].locked).toBe(true);
    expect(state.playerStates['p1'].isCorrect).toBe(true);
    expect(state.firstCorrectPlayerId).toBe('p1');
    expect(state.isCloseCall).toBe(true);
    expect(state.phaseTimeRemaining).toBeLessThanOrEqual(5);
  });

  it('calculates score and advances through reveal and next puzzle', () => {
    let state = setupFourSigns(
      { roomCode: 'TEST', selectedGameId: 'four-signs', playMode: 'individuals', roundsCount: 2, timerMultiplier: 1, soundEffects: true },
      dummyPlayers,
      [],
      allFourSignsPuzzles
    );
    state = reduceFourSigns(state, { type: 'START_PUZZLE', playerId: 'HOST', timestamp: Date.now() }, 'HOST');

    // Both players answer
    state = reduceFourSigns(
      state,
      { type: 'ANSWER', playerId: 'p1', payload: { option: state.currentPuzzle.answer, elapsedSeconds: 2 }, timestamp: Date.now() },
      'p1'
    );
    state = reduceFourSigns(
      state,
      { type: 'ANSWER', playerId: 'p2', payload: { option: state.currentPuzzle.distractors[0], elapsedSeconds: 4 }, timestamp: Date.now() },
      'p2'
    );

    // All locked auto-triggers reveal
    expect(state.currentPhaseId).toBe('reveal');
    expect(state.playerStates['p1'].scoreEarned).toBeGreaterThan(0);
    expect(state.playerStates['p2'].scoreEarned).toBe(0);
    expect(state.scores['p1']).toBeGreaterThan(0);

    // Next puzzle
    state = reduceFourSigns(state, { type: 'NEXT_PUZZLE', playerId: 'HOST', timestamp: Date.now() }, 'HOST');
    expect(state.currentIndex).toBe(1);
    expect(state.currentPhaseId).toBe('countdown');
  });

  it('tests scoring decay and bonus logic', () => {
    const fastScore = calculateFourSignsScore(1, 2, 18, true, true, 0, null);
    const slowScore = calculateFourSignsScore(1, 16, 18, true, false, 0, null);

    expect(fastScore.score).toBeGreaterThan(slowScore.score);

    // Shield protection
    const shielded = calculateFourSignsScore(1, 10, 18, false, false, 2, 'shield');
    expect(shielded.isProtected).toBe(true);
    expect(shielded.score).toBe(100);
  });
});
