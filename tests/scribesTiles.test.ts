import { describe, it, expect } from 'vitest';
import { allScribesTilesWords } from '../src/engine/content/loader';
import { setupScribesTiles, reduceScribesTiles, createPlayerRack } from '../src/games/scribes-tiles/reducer';
import { calculateScribesTilesScore, calculateScribesTilesTimeLimit } from '../src/games/scribes-tiles/scoring';
import { Player } from '../src/engine/types';

describe('Scribe\'s Tiles Game Engine', () => {
  const dummyPlayers: Player[] = [
    { id: 'p1', name: 'Baruch', isHost: false, avatarSeed: 'p1', score: 0 },
    { id: 'p2', name: 'Ezra', isHost: false, avatarSeed: 'p2', score: 0 },
  ];

  it('validates loaded scribes tiles words properly', () => {
    expect(allScribesTilesWords.length).toBeGreaterThanOrEqual(50);
    const first = allScribesTilesWords[0];
    expect(first.answer).toBeTruthy();
    expect(first.length).toBe(first.answer.length);
    expect(first.clue).toBeTruthy();
    expect(first.ref).toBeTruthy();
    expect(first.decoys.length).toBeGreaterThan(0);
  });

  it('generates a scrambled rack containing answer letters plus decoys', () => {
    const word = allScribesTilesWords[0]; // e.g. ADAM with decoys
    const rack = createPlayerRack(word, 'p1');

    const expectedLetters = [...word.answer.toUpperCase().split(''), ...word.decoys.map((d) => d.toUpperCase())];
    expect(rack.length).toBe(expectedLetters.length);

    const rackLetters = rack.map((t) => t.letter).sort();
    expect(rackLetters).toEqual(expectedLetters.sort());
  });

  it('initializes game state with empty answer slots', () => {
    const state = setupScribesTiles(
      { roomCode: 'TEST', selectedGameId: 'scribes-tiles', playMode: 'individuals', roundsCount: 4, timerMultiplier: 1, soundEffects: true },
      dummyPlayers,
      [],
      allScribesTilesWords
    );

    expect(state.currentPhaseId).toBe('countdown');
    expect(state.playerStates['p1']).toBeDefined();
    expect(state.playerStates['p1'].placedTiles).toHaveLength(state.currentWord.length);
    expect(state.playerStates['p1'].placedTiles.every((s) => s === null)).toBe(true);
  });

  it('handles PLACE_TILE and REMOVE_TILE correctly', () => {
    let state = setupScribesTiles(
      { roomCode: 'TEST', selectedGameId: 'scribes-tiles', playMode: 'individuals', roundsCount: 4, timerMultiplier: 1, soundEffects: true },
      dummyPlayers,
      [],
      allScribesTilesWords
    );
    state = reduceScribesTiles(state, { type: 'START_WORD', playerId: 'HOST', timestamp: Date.now() }, 'HOST');

    const p1Rack = state.playerStates['p1'].rack;
    const tileToPlace = p1Rack[0];

    // Place tile
    state = reduceScribesTiles(
      state,
      { type: 'PLACE_TILE', playerId: 'p1', payload: { tileId: tileToPlace.id }, timestamp: Date.now() },
      'p1'
    );

    const afterPlace = state.playerStates['p1'];
    expect(afterPlace.placedTiles[0]).toEqual(tileToPlace);
    expect(afterPlace.rack.some((t) => t.id === tileToPlace.id)).toBe(false);

    // Remove tile
    state = reduceScribesTiles(
      state,
      { type: 'REMOVE_TILE', playerId: 'p1', payload: { slotIndex: 0 }, timestamp: Date.now() },
      'p1'
    );

    const afterRemove = state.playerStates['p1'];
    expect(afterRemove.placedTiles[0]).toBeNull();
    expect(afterRemove.rack.some((t) => t.id === tileToPlace.id)).toBe(true);
  });

  it('handles CLEAR_TILES and SHUFFLE_RACK', () => {
    let state = setupScribesTiles(
      { roomCode: 'TEST', selectedGameId: 'scribes-tiles', playMode: 'individuals', roundsCount: 4, timerMultiplier: 1, soundEffects: true },
      dummyPlayers,
      [],
      allScribesTilesWords
    );
    state = reduceScribesTiles(state, { type: 'START_WORD', playerId: 'HOST', timestamp: Date.now() }, 'HOST');

    // Place first two tiles
    const tile1 = state.playerStates['p1'].rack[0];
    state = reduceScribesTiles(state, { type: 'PLACE_TILE', playerId: 'p1', payload: { tileId: tile1.id }, timestamp: Date.now() }, 'p1');

    expect(state.playerStates['p1'].placedTiles.filter((t) => t !== null).length).toBe(1);

    // Clear tiles
    state = reduceScribesTiles(state, { type: 'CLEAR_TILES', playerId: 'p1', timestamp: Date.now() }, 'p1');
    expect(state.playerStates['p1'].placedTiles.every((t) => t === null)).toBe(true);

    // Shuffle rack
    const rackBefore = [...state.playerStates['p1'].rack];
    state = reduceScribesTiles(state, { type: 'SHUFFLE_RACK', playerId: 'p1', timestamp: Date.now() }, 'p1');
    expect(state.playerStates['p1'].rack.length).toBe(rackBefore.length);
  });

  it('submits correct word and triggers solve, score and Close Call', () => {
    let state = setupScribesTiles(
      { roomCode: 'TEST', selectedGameId: 'scribes-tiles', playMode: 'individuals', roundsCount: 2, timerMultiplier: 1, soundEffects: true },
      dummyPlayers,
      [],
      allScribesTilesWords
    );
    state = reduceScribesTiles(state, { type: 'START_WORD', playerId: 'HOST', timestamp: Date.now() }, 'HOST');

    const targetAnswer = state.currentWord.answer.toUpperCase();

    // Place correct letters sequentially for player 1
    for (let i = 0; i < targetAnswer.length; i++) {
      const char = targetAnswer[i];
      const availableTile = state.playerStates['p1'].rack.find((t) => t.letter === char);
      expect(availableTile).toBeDefined();

      state = reduceScribesTiles(
        state,
        { type: 'PLACE_TILE', playerId: 'p1', payload: { tileId: availableTile!.id, slotIndex: i }, timestamp: Date.now() },
        'p1'
      );
    }

    const p1State = state.playerStates['p1'];
    expect(p1State.locked).toBe(true);
    expect(p1State.isCorrect).toBe(true);
    expect(state.firstCorrectPlayerId).toBe('p1');
    expect(state.isCloseCall).toBe(true);

    // Trigger reveal
    state = reduceScribesTiles(state, { type: 'TRIGGER_REVEAL', playerId: 'HOST', timestamp: Date.now() }, 'HOST');
    expect(state.currentPhaseId).toBe('reveal');
    expect(state.playerStates['p1'].scoreEarned).toBeGreaterThan(0);
    expect(state.scores['p1']).toBeGreaterThan(0);
  });

  it('handles shakeError when submitting incorrect word', () => {
    let state = setupScribesTiles(
      { roomCode: 'TEST', selectedGameId: 'scribes-tiles', playMode: 'individuals', roundsCount: 2, timerMultiplier: 1, soundEffects: true },
      dummyPlayers,
      [],
      allScribesTilesWords
    );
    state = reduceScribesTiles(state, { type: 'START_WORD', playerId: 'HOST', timestamp: Date.now() }, 'HOST');

    // Submit without all letters or wrong letters
    state = reduceScribesTiles(state, { type: 'SUBMIT_WORD', playerId: 'p1', timestamp: Date.now() }, 'p1');
    expect(state.playerStates['p1'].shakeError).toBe(true);
    expect(state.playerStates['p1'].locked).toBe(false);
  });

  it('calculates score based on speed, length, and hints', () => {
    const fastScore = calculateScribesTilesScore(1, 5, 3, 25, true, true, 0, 0);
    const slowScore = calculateScribesTilesScore(1, 5, 20, 25, true, false, 0, 0);
    expect(fastScore).toBeGreaterThan(slowScore);

    const hintScore = calculateScribesTilesScore(1, 5, 10, 25, true, false, 0, 1);
    const noHintScore = calculateScribesTilesScore(1, 5, 10, 25, true, false, 0, 0);
    expect(noHintScore).toBeGreaterThan(hintScore);
  });
});
