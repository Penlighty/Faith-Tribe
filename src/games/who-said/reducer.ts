import { Player, Team, SessionConfig, GameIntent, LeaderboardEntry } from '../../engine/types';
import { WhoSaidItem } from '../../engine/content/schemas';
import { allWhoSaidItems } from '../../engine/content/loader';
import { planWhoSaidSession } from '../../engine/services/antiRepeatLedger';
import {
  WhoSaidState,
  WhoSaidMode,
  WhoSaidPowerUp,
  PlayerQuestionState,
} from './types';
import { calculateWhoSaidScore, calculateWhoSaidTimeLimit } from './scoring';

export function setupWhoSaid(
  config: SessionConfig,
  players: Player[],
  teams: Team[],
  content?: WhoSaidItem[]
): WhoSaidState {
  const isSolo = players.length === 1;
  let mode: WhoSaidMode = 'fastest_finger';
  if (isSolo) {
    mode = 'solo';
  } else if (config.playMode === 'pairs') {
    mode = 'pair_duel';
  } else if (config.playMode === 'teams') {
    mode = 'team_rush';
  }

  const pool = content && content.length > 0 ? content : allWhoSaidItems;
  const sessionLength = (config.roundsCount === 32 ? 32 : config.roundsCount === 12 ? 12 : 20) as 12 | 20 | 32;
  const plannedQuestions = planWhoSaidSession(pool, { sessionLength });

  const currentQuestion = plannedQuestions[0] || pool[0];
  const timeLimit = calculateWhoSaidTimeLimit(currentQuestion.quote, false);

  const initialPlayerStates: Record<string, PlayerQuestionState> = {};
  const scores: Record<string, number> = {};

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
      powerUpsUsed: { fifty: false, double: false, shield: false },
      hiddenOptions: [],
      shuffledOptions: shuffleArray([...currentQuestion.options]),
      streakCount: 0,
    };
  }

  return {
    phaseIndex: 0,
    currentPhaseId: 'countdown',
    roundNumber: 1,
    totalRounds: plannedQuestions.length,
    phaseTimeRemaining: 3,
    phaseDuration: 3,
    isGameOver: false,
    scores,
    mode,
    currentQuestion,
    questionsPool: plannedQuestions,
    currentIndex: 0,
    totalQuestions: plannedQuestions.length,
    gentleMode: false,
    questionStartTime: 0,
    timeLimit,
    isCloseCall: false,
    playerStates: initialPlayerStates,
    strikes: 0,
    maxStrikes: 3,
    consecutiveCorrect: 0,
    consecutiveWrong: 0,
  };
}

export function reduceWhoSaid(
  state: WhoSaidState,
  intent: GameIntent,
  playerId: string
): WhoSaidState {
  switch (intent.type) {
    case 'START_QUESTION': {
      const limit = calculateWhoSaidTimeLimit(state.currentQuestion.quote, state.gentleMode);
      return {
        ...state,
        currentPhaseId: 'question',
        phaseTimeRemaining: limit,
        phaseDuration: limit,
        questionStartTime: Date.now(),
        isCloseCall: false,
        firstCorrectPlayerId: undefined,
      };
    }

    case 'USE_POWERUP': {
      const powerUp: WhoSaidPowerUp = intent.payload?.type;
      const pState = state.playerStates[playerId];
      if (!pState || pState.locked || pState.powerUpsUsed[powerUp]) return state;

      let hiddenOptions: string[] = pState.hiddenOptions;
      if (powerUp === 'fifty') {
        // Remove two wrong options
        const wrongOptions = state.currentQuestion.options.filter(
          (opt) => opt !== state.currentQuestion.answer
        );
        hiddenOptions = shuffleArray(wrongOptions).slice(0, 2);
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

      const selectedOption: string = intent.payload?.optionSpeaker;
      const elapsed = intent.payload?.elapsedSeconds ?? Math.max(0, (state.phaseDuration ?? 15) - (state.phaseTimeRemaining ?? 0));
      const isCorrect = selectedOption === state.currentQuestion.answer;

      let firstCorrectId = state.firstCorrectPlayerId;
      let snapCloseCall = state.isCloseCall;
      let newRemaining = state.phaseTimeRemaining ?? 0;

      // Close Call Trigger: when first correct answer locks in group modes
      if (isCorrect && !firstCorrectId && state.mode !== 'solo') {
        firstCorrectId = playerId;
        snapCloseCall = true;
        newRemaining = Math.min(newRemaining, 5);
      }

      const updatedPState: PlayerQuestionState = {
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

      // In Pair Duel: lock in for partner as well if pair sharing
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

      // Check if all players have answered
      const allLocked = Object.values(newStates).every((p) => p.locked);

      const intermediateState: WhoSaidState = {
        ...state,
        playerStates: newStates,
        firstCorrectPlayerId: firstCorrectId,
        isCloseCall: snapCloseCall,
        phaseTimeRemaining: newRemaining,
      };

      if (allLocked) {
        return evaluateWhoSaidReveal(intermediateState);
      }

      return intermediateState;
    }

    case 'TRIGGER_REVEAL': {
      return evaluateWhoSaidReveal(state);
    }

    case 'NEXT_QUESTION': {
      let nextIndex = state.currentIndex + 1;
      let strikes = state.strikes;
      let isGameOver = nextIndex >= state.questionsPool.length;

      if (state.mode === 'solo' && strikes >= state.maxStrikes) {
        isGameOver = true;
      }

      if (isGameOver) {
        return {
          ...state,
          isGameOver: true,
          currentPhaseId: 'final',
        };
      }

      const nextQuestion = state.questionsPool[nextIndex];
      const nextLimit = calculateWhoSaidTimeLimit(nextQuestion.quote, state.gentleMode);

      // Reset round player states
      const resetStates: Record<string, PlayerQuestionState> = {};
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
          powerUpsUsed: prev.powerUpsUsed, // Power-up budget is once per game
          hiddenOptions: [],
          shuffledOptions: shuffleArray([...nextQuestion.options]),
          streakCount: prev.isCorrect ? prev.streakCount + 1 : 0,
        };
      }

      return {
        ...state,
        currentIndex: nextIndex,
        roundNumber: nextIndex + 1,
        currentQuestion: nextQuestion,
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

function evaluateWhoSaidReveal(state: WhoSaidState): WhoSaidState {
  const updatedPlayerStates: Record<string, PlayerQuestionState> = {};
  const updatedScores: Record<string, number> = { ...state.scores };
  let strikes = state.strikes;
  let consecutiveCorrect = state.consecutiveCorrect;
  let consecutiveWrong = state.consecutiveWrong;

  for (const pid in state.playerStates) {
    const p = state.playerStates[pid];
    const isFirstCorrect = pid === state.firstCorrectPlayerId;

    const scoreResult = calculateWhoSaidScore({
      tier: state.currentQuestion.tier,
      quote: state.currentQuestion.quote,
      elapsedSeconds: p.lockedAtTime,
      isCorrect: p.isCorrect,
      isFirstCorrect,
      streakCount: p.streakCount,
      gentleMode: state.gentleMode,
      powerUp: p.powerUpActive,
    });

    updatedScores[pid] = Math.max(0, (updatedScores[pid] || 0) + scoreResult.points);
    updatedPlayerStates[pid] = {
      ...p,
      scoreEarned: scoreResult.points,
      streakCount: p.isCorrect ? p.streakCount + 1 : 0,
    };

    if (state.mode === 'solo') {
      if (p.isCorrect) {
        consecutiveCorrect += 1;
        consecutiveWrong = 0;
      } else {
        strikes += 1;
        consecutiveWrong += 1;
        consecutiveCorrect = 0;
      }
    }
  }

  return {
    ...state,
    currentPhaseId: 'reveal',
    phaseTimeRemaining: 6,
    phaseDuration: 6,
    playerStates: updatedPlayerStates,
    scores: updatedScores,
    strikes,
    consecutiveCorrect,
    consecutiveWrong,
  };
}

export function scoreWhoSaid(
  state: WhoSaidState,
  players: Player[],
  teams: Team[]
): LeaderboardEntry[] {
  if (state.mode === 'team_rush' && teams && teams.length > 0) {
    const teamEntries: LeaderboardEntry[] = teams.map((team) => {
      let teamScore = 0;
      for (const pid of team.playerIds) {
        teamScore += state.scores[pid] || 0;
      }
      return {
        id: team.id,
        name: team.name,
        score: teamScore,
        rank: 1,
        teamColor: team.color,
      };
    });

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

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
