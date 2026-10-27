import { Player, Team, SessionConfig, GameIntent, LeaderboardEntry } from '../../engine/types';
import { ScribesTilesWord } from '../../engine/content/schemas';
import { allScribesTilesWords } from '../../engine/content/loader';
import { planScribesTilesSession } from '../../engine/services/antiRepeatLedger';
import {
  ScribesTilesState,
  ScribesTilesMode,
  PlayerScribesTilesState,
  ScribeTile,
} from './types';
import { calculateScribesTilesScore, calculateScribesTilesTimeLimit } from './scoring';

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function createPlayerRack(word: ScribesTilesWord, pid: string): ScribeTile[] {
  const letters = word.answer.toUpperCase().split('');
  const decoys = (word.decoys || []).map((d) => d.toUpperCase());
  const allLetters = [...letters, ...decoys];

  const tiles: ScribeTile[] = allLetters.map((letter, idx) => ({
    id: `${pid}_tile_${idx}_${letter}`,
    letter,
  }));

  return shuffleArray(tiles);
}

export function setupScribesTiles(
  config: SessionConfig,
  players: Player[],
  _teams: Team[],
  content?: ScribesTilesWord[]
): ScribesTilesState {
  const isSolo = players.length === 1;
  let mode: ScribesTilesMode = 'fastest_finger';
  if (isSolo) {
    mode = 'solo';
  } else if (config.playMode === 'pairs') {
    mode = 'pair_duel';
  } else if (config.playMode === 'teams') {
    mode = 'team_rush';
  }

  const pool = content && content.length > 0 ? content : allScribesTilesWords;
  const sessionLength = config.roundsCount || 8;
  const plannedWords = planScribesTilesSession(pool, { sessionLength });

  const currentWord = plannedWords[0] || pool[0];
  const timeLimit = calculateScribesTilesTimeLimit(currentWord.tier, false);

  const initialPlayerStates: Record<string, PlayerScribesTilesState> = {};
  const scores: Record<string, number> = {};

  for (const p of players) {
    scores[p.id] = 0;
    initialPlayerStates[p.id] = {
      playerId: p.id,
      rack: createPlayerRack(currentWord, p.id),
      placedTiles: Array(currentWord.length).fill(null),
      locked: false,
      lockedAtTime: 0,
      isCorrect: false,
      scoreEarned: 0,
      streakCount: 0,
      hintsUsed: 0,
      shakeError: false,
    };
  }

  return {
    phaseIndex: 0,
    currentPhaseId: 'countdown',
    roundNumber: 1,
    totalRounds: plannedWords.length,
    phaseTimeRemaining: 3,
    phaseDuration: 3,
    isGameOver: false,
    scores,
    mode,
    currentWord,
    wordsPool: plannedWords,
    currentIndex: 0,
    totalWords: plannedWords.length,
    gentleMode: false,
    wordStartTime: 0,
    timeLimit,
    isCloseCall: false,
    playerStates: initialPlayerStates,
    strikes: 0,
    maxStrikes: 3,
    consecutiveCorrect: 0,
    consecutiveWrong: 0,
  };
}

export function reduceScribesTiles(
  state: ScribesTilesState,
  intent: GameIntent,
  playerId: string
): ScribesTilesState {
  switch (intent.type) {
    case 'START_WORD': {
      const limit = calculateScribesTilesTimeLimit(state.currentWord.tier, state.gentleMode);
      return {
        ...state,
        currentPhaseId: 'solve',
        phaseTimeRemaining: limit,
        phaseDuration: limit,
        wordStartTime: Date.now(),
        isCloseCall: false,
        firstCorrectPlayerId: undefined,
      };
    }

    case 'PLACE_TILE': {
      const pState = state.playerStates[playerId];
      if (!pState || pState.locked || state.currentPhaseId === 'reveal') return state;

      const tileId: string = intent.payload?.tileId;
      const targetSlot: number | undefined = intent.payload?.slotIndex;

      const tileIndex = pState.rack.findIndex((t) => t.id === tileId);
      if (tileIndex === -1) return state;

      const tile = pState.rack[tileIndex];
      const newPlaced = [...pState.placedTiles];

      let slotIdx = targetSlot;
      if (slotIdx === undefined || slotIdx < 0 || slotIdx >= newPlaced.length) {
        slotIdx = newPlaced.findIndex((slot) => slot === null);
      }

      if (slotIdx === -1 || slotIdx >= newPlaced.length) {
        return state; // No open slot
      }

      // If replacing a tile already in that slot, return replaced tile to rack
      const existing = newPlaced[slotIdx];
      const newRack = [...pState.rack];
      newRack.splice(tileIndex, 1);

      if (existing) {
        newRack.push(existing);
      }
      newPlaced[slotIdx] = tile;

      // Check if auto-complete condition met
      const isComplete = newPlaced.every((s) => s !== null);
      const spelled = newPlaced.map((s) => s?.letter || '').join('');
      const isCorrect = isComplete && spelled.toUpperCase() === state.currentWord.answer.toUpperCase();

      let updatedPState: PlayerScribesTilesState = {
        ...pState,
        rack: newRack,
        placedTiles: newPlaced,
        shakeError: false,
      };

      let firstCorrectId = state.firstCorrectPlayerId;
      let snapCloseCall = state.isCloseCall;
      let newRemaining = state.phaseTimeRemaining ?? 0;

      if (isCorrect) {
        const elapsed =
          intent.payload?.elapsedSeconds ??
          Math.max(0, (state.phaseDuration ?? 25) - (state.phaseTimeRemaining ?? 0));

        if (!firstCorrectId && state.mode !== 'solo') {
          firstCorrectId = playerId;
          snapCloseCall = true;
          newRemaining = Math.min(newRemaining, 5);
        }

        updatedPState = {
          ...updatedPState,
          locked: true,
          lockedAtTime: elapsed,
          isCorrect: true,
        };
      }

      const newStates = {
        ...state.playerStates,
        [playerId]: updatedPState,
      };

      const allLocked = Object.values(newStates).every((p) => p.locked);

      const intermediateState: ScribesTilesState = {
        ...state,
        playerStates: newStates,
        firstCorrectPlayerId: firstCorrectId,
        isCloseCall: snapCloseCall,
        phaseTimeRemaining: newRemaining,
      };

      if (allLocked) {
        return evaluateScribesTilesReveal(intermediateState);
      }

      return intermediateState;
    }

    case 'REMOVE_TILE': {
      const pState = state.playerStates[playerId];
      if (!pState || pState.locked || state.currentPhaseId === 'reveal') return state;

      const slotIndex: number = intent.payload?.slotIndex;
      if (slotIndex === undefined || slotIndex < 0 || slotIndex >= pState.placedTiles.length) {
        return state;
      }

      const tile = pState.placedTiles[slotIndex];
      if (!tile) return state;

      const newPlaced = [...pState.placedTiles];
      newPlaced[slotIndex] = null;

      const newRack = [...pState.rack, tile];

      return {
        ...state,
        playerStates: {
          ...state.playerStates,
          [playerId]: {
            ...pState,
            rack: newRack,
            placedTiles: newPlaced,
            shakeError: false,
          },
        },
      };
    }

    case 'CLEAR_TILES': {
      const pState = state.playerStates[playerId];
      if (!pState || pState.locked || state.currentPhaseId === 'reveal') return state;

      const placedOnly = pState.placedTiles.filter((t): t is ScribeTile => t !== null);
      if (placedOnly.length === 0) return state;

      return {
        ...state,
        playerStates: {
          ...state.playerStates,
          [playerId]: {
            ...pState,
            rack: [...pState.rack, ...placedOnly],
            placedTiles: Array(state.currentWord.length).fill(null),
            shakeError: false,
          },
        },
      };
    }

    case 'SHUFFLE_RACK': {
      const pState = state.playerStates[playerId];
      if (!pState || pState.locked || state.currentPhaseId === 'reveal') return state;

      return {
        ...state,
        playerStates: {
          ...state.playerStates,
          [playerId]: {
            ...pState,
            rack: shuffleArray([...pState.rack]),
          },
        },
      };
    }

    case 'SUBMIT_WORD': {
      const pState = state.playerStates[playerId];
      if (!pState || pState.locked || state.currentPhaseId === 'reveal') return state;

      const spelled = pState.placedTiles.map((s) => s?.letter || '').join('');
      const isCorrect = spelled.toUpperCase() === state.currentWord.answer.toUpperCase();

      if (!isCorrect) {
        return {
          ...state,
          playerStates: {
            ...state.playerStates,
            [playerId]: {
              ...pState,
              shakeError: true,
            },
          },
        };
      }

      const elapsed =
        intent.payload?.elapsedSeconds ??
        Math.max(0, (state.phaseDuration ?? 25) - (state.phaseTimeRemaining ?? 0));

      let firstCorrectId = state.firstCorrectPlayerId;
      let snapCloseCall = state.isCloseCall;
      let newRemaining = state.phaseTimeRemaining ?? 0;

      if (!firstCorrectId && state.mode !== 'solo') {
        firstCorrectId = playerId;
        snapCloseCall = true;
        newRemaining = Math.min(newRemaining, 5);
      }

      const newStates = {
        ...state.playerStates,
        [playerId]: {
          ...pState,
          locked: true,
          lockedAtTime: elapsed,
          isCorrect: true,
          shakeError: false,
        },
      };

      const allLocked = Object.values(newStates).every((p) => p.locked);

      const intermediateState: ScribesTilesState = {
        ...state,
        playerStates: newStates,
        firstCorrectPlayerId: firstCorrectId,
        isCloseCall: snapCloseCall,
        phaseTimeRemaining: newRemaining,
      };

      if (allLocked) {
        return evaluateScribesTilesReveal(intermediateState);
      }

      return intermediateState;
    }

    case 'TRIGGER_REVEAL': {
      return evaluateScribesTilesReveal(state);
    }

    case 'NEXT_WORD': {
      const nextIndex = state.currentIndex + 1;
      let isGameOver = nextIndex >= state.wordsPool.length;

      if (state.mode === 'solo' && state.strikes >= state.maxStrikes) {
        isGameOver = true;
      }

      if (isGameOver) {
        return {
          ...state,
          isGameOver: true,
          currentPhaseId: 'final',
        };
      }

      const nextWord = state.wordsPool[nextIndex];
      const nextLimit = calculateScribesTilesTimeLimit(nextWord.tier, state.gentleMode);

      const resetStates: Record<string, PlayerScribesTilesState> = {};
      for (const pid in state.playerStates) {
        const prev = state.playerStates[pid];
        resetStates[pid] = {
          playerId: pid,
          rack: createPlayerRack(nextWord, pid),
          placedTiles: Array(nextWord.length).fill(null),
          locked: false,
          lockedAtTime: 0,
          isCorrect: false,
          scoreEarned: 0,
          streakCount: prev.isCorrect ? prev.streakCount + 1 : 0,
          hintsUsed: 0,
          shakeError: false,
        };
      }

      return {
        ...state,
        currentIndex: nextIndex,
        roundNumber: nextIndex + 1,
        currentWord: nextWord,
        currentPhaseId: 'countdown',
        phaseIndex: 0,
        phaseTimeRemaining: 3,
        phaseDuration: 3,
        timeLimit: nextLimit,
        isCloseCall: false,
        firstCorrectPlayerId: undefined,
        playerStates: resetStates,
      };
    }

    default:
      return state;
  }
}

function evaluateScribesTilesReveal(state: ScribesTilesState): ScribesTilesState {
  const updatedPlayerStates: Record<string, PlayerScribesTilesState> = {};
  const updatedScores: Record<string, number> = { ...state.scores };

  let strikes = state.strikes;
  let consecutiveCorrect = state.consecutiveCorrect;
  let consecutiveWrong = state.consecutiveWrong;

  for (const pid in state.playerStates) {
    const p = state.playerStates[pid];
    const isFirst = state.firstCorrectPlayerId === pid;

    // Check correctness
    const spelled = p.placedTiles.map((s) => s?.letter || '').join('');
    const isCorrect = p.isCorrect || spelled.toUpperCase() === state.currentWord.answer.toUpperCase();

    const score = calculateScribesTilesScore(
      state.currentWord.tier,
      state.currentWord.length,
      p.lockedAtTime || state.timeLimit,
      state.timeLimit,
      isCorrect,
      isFirst,
      p.streakCount,
      p.hintsUsed
    );

    const newStreak = isCorrect ? p.streakCount + 1 : 0;

    updatedPlayerStates[pid] = {
      ...p,
      isCorrect,
      scoreEarned: score,
      streakCount: newStreak,
    };

    updatedScores[pid] = (updatedScores[pid] || 0) + score;

    // Solo mode metrics
    if (state.mode === 'solo') {
      if (isCorrect) {
        consecutiveCorrect++;
        consecutiveWrong = 0;
      } else {
        strikes++;
        consecutiveWrong++;
        consecutiveCorrect = 0;
      }
    }
  }

  const isGameOver =
    state.currentIndex + 1 >= state.wordsPool.length ||
    (state.mode === 'solo' && strikes >= state.maxStrikes);

  return {
    ...state,
    currentPhaseId: 'reveal',
    phaseIndex: 2,
    phaseTimeRemaining: 6,
    phaseDuration: 6,
    scores: updatedScores,
    playerStates: updatedPlayerStates,
    strikes,
    consecutiveCorrect,
    consecutiveWrong,
    isGameOver,
  };
}

export function scoreScribesTiles(
  state: ScribesTilesState,
  players: Player[],
  teams: Team[]
): LeaderboardEntry[] {
  if (teams && teams.length > 0 && state.mode === 'team_rush') {
    const teamScores: Record<string, number> = {};
    for (const t of teams) teamScores[t.id] = 0;
    for (const p of players) {
      if (p.teamId && teamScores[p.teamId] !== undefined) {
        teamScores[p.teamId] += state.scores[p.id] || 0;
      }
    }

    const teamEntries: LeaderboardEntry[] = teams.map((team) => ({
      id: team.id,
      name: team.name,
      score: teamScores[team.id] || 0,
      rank: 1,
      teamColor: team.color,
    }));

    teamEntries.sort((a, b) => b.score - a.score);
    return assignRanksWithTies(teamEntries);
  }

  const entries: LeaderboardEntry[] = players.map((p) => ({
    id: p.id,
    name: p.name,
    score: state.scores[p.id] || 0,
    rank: 1,
    avatarSeed: p.avatarSeed,
  }));

  entries.sort((a, b) => b.score - a.score);
  return assignRanksWithTies(entries);
}

function assignRanksWithTies(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  let currentRank = 1;
  for (let i = 0; i < entries.length; i++) {
    if (i > 0 && entries[i].score < entries[i - 1].score) {
      currentRank = i + 1;
    }
    entries[i].rank = currentRank;
  }
  return entries;
}
