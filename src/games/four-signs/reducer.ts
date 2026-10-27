import { Player, Team, SessionConfig, GameIntent, LeaderboardEntry } from '../../engine/types';
import { FourSignsPuzzle } from '../../engine/content/schemas';
import { allFourSignsPuzzles } from '../../engine/content/loader';
import { planFourSignsSession } from '../../engine/services/antiRepeatLedger';
import {
  FourSignsState,
  FourSignsMode,
  FourSignsPowerUp,
  PlayerPuzzleState,
} from './types';
import { calculateFourSignsScore, calculateFourSignsTimeLimit } from './scoring';

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function setupFourSigns(
  config: SessionConfig,
  players: Player[],
  _teams: Team[],
  content?: FourSignsPuzzle[]
): FourSignsState {
  const isSolo = players.length === 1;
  let mode: FourSignsMode = 'fastest_finger';
  if (isSolo) {
    mode = 'solo';
  } else if (config.playMode === 'pairs') {
    mode = 'pair_duel';
  } else if (config.playMode === 'teams') {
    mode = 'team_rush';
  }

  const pool = content && content.length > 0 ? content : allFourSignsPuzzles;
  const sessionLength = config.roundsCount || 8;
  const plannedPuzzles = planFourSignsSession(pool, { sessionLength });

  const currentPuzzle = plannedPuzzles[0] || pool[0];
  const timeLimit = calculateFourSignsTimeLimit(currentPuzzle.tier, false);

  const initialPlayerStates: Record<string, PlayerPuzzleState> = {};
  const scores: Record<string, number> = {};

  const baseOptions = [currentPuzzle.answer, ...currentPuzzle.distractors];

  for (const p of players) {
    scores[p.id] = 0;
    initialPlayerStates[p.id] = {
      playerId: p.id,
      selectedOption: null,
      locked: false,
      lockedAtTime: 0,
      isCorrect: false,
      scoreEarned: 0,
      powerUpActive: null,
      powerUpsUsed: { fifty: false, reveal_hint: false, shield: false },
      hiddenOptions: [],
      shuffledOptions: shuffleArray([...baseOptions]),
      streakCount: 0,
    };
  }

  return {
    phaseIndex: 0,
    currentPhaseId: 'countdown',
    roundNumber: 1,
    totalRounds: plannedPuzzles.length,
    phaseTimeRemaining: 3,
    phaseDuration: 3,
    isGameOver: false,
    scores,
    mode,
    currentPuzzle,
    puzzlesPool: plannedPuzzles,
    currentIndex: 0,
    totalPuzzles: plannedPuzzles.length,
    gentleMode: false,
    revealedCluesCount: 4,
    puzzleStartTime: 0,
    timeLimit,
    isCloseCall: false,
    playerStates: initialPlayerStates,
    strikes: 0,
    maxStrikes: 3,
    consecutiveCorrect: 0,
    consecutiveWrong: 0,
  };
}

export function reduceFourSigns(
  state: FourSignsState,
  intent: GameIntent,
  playerId: string
): FourSignsState {
  switch (intent.type) {
    case 'START_PUZZLE': {
      const limit = calculateFourSignsTimeLimit(state.currentPuzzle.tier, state.gentleMode);
      return {
        ...state,
        currentPhaseId: 'clues',
        phaseTimeRemaining: limit,
        phaseDuration: limit,
        puzzleStartTime: Date.now(),
        isCloseCall: false,
        firstCorrectPlayerId: undefined,
        revealedCluesCount: 4,
      };
    }

    case 'USE_POWERUP': {
      const powerUp: FourSignsPowerUp = intent.payload?.type;
      const pState = state.playerStates[playerId];
      if (!pState || pState.locked || pState.powerUpsUsed[powerUp]) return state;

      let hiddenOptions: string[] = pState.hiddenOptions;
      if (powerUp === 'fifty') {
        const wrong = state.currentPuzzle.distractors;
        hiddenOptions = shuffleArray(wrong).slice(0, 2);
      }

      return {
        ...state,
        playerStates: {
          ...state.playerStates,
          [playerId]: {
            ...pState,
            powerUpActive: powerUp,
            powerUpsUsed: {
              ...pState.powerUpsUsed,
              [powerUp]: true,
            },
            hiddenOptions,
          },
        },
      };
    }

    case 'ANSWER': {
      const pState = state.playerStates[playerId];
      if (!pState || pState.locked || state.currentPhaseId === 'reveal') return state;

      const selectedOption: string = intent.payload?.option;
      const elapsed =
        intent.payload?.elapsedSeconds ??
        Math.max(0, (state.phaseDuration ?? 18) - (state.phaseTimeRemaining ?? 0));
      const isCorrect = selectedOption.toUpperCase() === state.currentPuzzle.answer.toUpperCase();

      let firstCorrectId = state.firstCorrectPlayerId;
      let snapCloseCall = state.isCloseCall;
      let newRemaining = state.phaseTimeRemaining ?? 0;

      // Close Call Trigger: when first correct answer locks in group modes
      if (isCorrect && !firstCorrectId && state.mode !== 'solo') {
        firstCorrectId = playerId;
        snapCloseCall = true;
        newRemaining = Math.min(newRemaining, 5);
      }

      const updatedPState: PlayerPuzzleState = {
        ...pState,
        selectedOption,
        locked: true,
        lockedAtTime: elapsed,
        isCorrect,
      };

      const newStates = {
        ...state.playerStates,
        [playerId]: updatedPState,
      };

      // In Pair Duel: lock in for partner if provided
      if (state.mode === 'pair_duel' && intent.payload?.partnerId) {
        const partnerId = intent.payload.partnerId;
        if (newStates[partnerId]) {
          newStates[partnerId] = {
            ...newStates[partnerId],
            selectedOption,
            locked: true,
            lockedAtTime: elapsed,
            isCorrect,
          };
        }
      }

      const allLocked = Object.values(newStates).every((p) => p.locked);

      const intermediateState: FourSignsState = {
        ...state,
        playerStates: newStates,
        firstCorrectPlayerId: firstCorrectId,
        isCloseCall: snapCloseCall,
        phaseTimeRemaining: newRemaining,
      };

      if (allLocked) {
        return evaluateFourSignsReveal(intermediateState);
      }

      return intermediateState;
    }

    case 'TRIGGER_REVEAL': {
      return evaluateFourSignsReveal(state);
    }

    case 'NEXT_PUZZLE': {
      const nextIndex = state.currentIndex + 1;
      let isGameOver = nextIndex >= state.puzzlesPool.length;

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

      const nextPuzzle = state.puzzlesPool[nextIndex];
      const nextLimit = calculateFourSignsTimeLimit(nextPuzzle.tier, state.gentleMode);
      const baseOptions = [nextPuzzle.answer, ...nextPuzzle.distractors];

      const resetStates: Record<string, PlayerPuzzleState> = {};
      for (const pid in state.playerStates) {
        const prev = state.playerStates[pid];
        resetStates[pid] = {
          playerId: pid,
          selectedOption: null,
          locked: false,
          lockedAtTime: 0,
          isCorrect: false,
          scoreEarned: 0,
          powerUpActive: null,
          powerUpsUsed: prev.powerUpsUsed,
          hiddenOptions: [],
          shuffledOptions: shuffleArray([...baseOptions]),
          streakCount: prev.isCorrect ? prev.streakCount + 1 : 0,
        };
      }

      return {
        ...state,
        currentIndex: nextIndex,
        roundNumber: nextIndex + 1,
        currentPuzzle: nextPuzzle,
        currentPhaseId: 'countdown',
        phaseIndex: 0,
        phaseTimeRemaining: 3,
        phaseDuration: 3,
        timeLimit: nextLimit,
        isCloseCall: false,
        firstCorrectPlayerId: undefined,
        revealedCluesCount: 4,
        playerStates: resetStates,
      };
    }

    default:
      return state;
  }
}

function evaluateFourSignsReveal(state: FourSignsState): FourSignsState {
  const updatedPlayerStates: Record<string, PlayerPuzzleState> = {};
  const updatedScores: Record<string, number> = { ...state.scores };

  let strikes = state.strikes;
  let consecutiveCorrect = state.consecutiveCorrect;
  let consecutiveWrong = state.consecutiveWrong;

  for (const pid in state.playerStates) {
    const p = state.playerStates[pid];
    const isFirst = state.firstCorrectPlayerId === pid;
    const { score, isProtected } = calculateFourSignsScore(
      state.currentPuzzle.tier,
      p.lockedAtTime || state.timeLimit,
      state.timeLimit,
      p.isCorrect,
      isFirst,
      p.streakCount,
      p.powerUpActive
    );

    const newStreak = p.isCorrect ? p.streakCount + 1 : isProtected ? p.streakCount : 0;

    updatedPlayerStates[pid] = {
      ...p,
      scoreEarned: score,
      streakCount: newStreak,
    };

    updatedScores[pid] = (updatedScores[pid] || 0) + score;

    // Solo mode metrics
    if (state.mode === 'solo') {
      if (p.isCorrect) {
        consecutiveCorrect++;
        consecutiveWrong = 0;
      } else {
        if (!isProtected) strikes++;
        consecutiveWrong++;
        consecutiveCorrect = 0;
      }
    }
  }

  const isGameOver =
    state.currentIndex + 1 >= state.puzzlesPool.length ||
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

export function scoreFourSigns(
  state: FourSignsState,
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
