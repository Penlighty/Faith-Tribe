import { Player, Team, SessionConfig, GameIntent, LeaderboardEntry } from '../../engine/types';
import { TestamentSortItem } from '../../engine/content/schemas';
import { allTestamentSortItems } from '../../engine/content/loader';
import { planTestamentSortSession } from '../../engine/services/antiRepeatLedger';
import {
  TestamentSortState,
  TestamentSortMode,
  TestamentChoice,
  PlayerCardState,
  TeamHuddleVote,
} from './types';
import { calculateTestamentSortScore, getTestamentSortTimeLimit } from './scoring';

export function setupTestamentSort(
  config: SessionConfig,
  players: Player[],
  teams: Team[],
  content?: TestamentSortItem[]
): TestamentSortState {
  const isSolo = players.length === 1;
  let mode: TestamentSortMode = 'everyone';
  if (isSolo) {
    mode = 'solo';
  } else if (config.playMode === 'teams' || config.playMode === 'pairs') {
    mode = 'huddle';
  }

  // Session cards planning
  const pool = content && content.length > 0 ? content : allTestamentSortItems;
  const sessionLength = (config.roundsCount === 32 ? 32 : config.roundsCount === 12 ? 12 : 20) as 12 | 20 | 32;
  const plannedCards = planTestamentSortSession(pool, { sessionLength });

  const currentCard = plannedCards[0] || pool[0];
  const initialPlayerCardStates: Record<string, PlayerCardState> = {};
  const scores: Record<string, number> = {};

  for (const p of players) {
    scores[p.id] = 0;
    initialPlayerCardStates[p.id] = {
      playerId: p.id,
      selectedChoice: null,
      locked: false,
      lockedAtTime: 0,
      hintUsed: false,
      scoreEarned: 0,
      isCorrect: false,
      streakCount: 0,
    };
  }

  // Team budgets for Huddle mode (3 hints per team)
  const teamHintBudgets: Record<string, number> = {};
  if (teams && teams.length > 0) {
    for (const t of teams) {
      teamHintBudgets[t.id] = 3;
    }
  }

  const initialLimit = getTestamentSortTimeLimit(currentCard.tier);

  return {
    phaseIndex: 0,
    currentPhaseId: 'countdown',
    roundNumber: 1,
    totalRounds: plannedCards.length,
    phaseTimeRemaining: 3,
    phaseDuration: 3,
    isGameOver: false,
    scores,
    mode,
    currentCard,
    cardsPool: plannedCards,
    currentIndex: 0,
    totalCards: plannedCards.length,
    riskMode: false,
    playerCardStates: initialPlayerCardStates,
    strikes: 0,
    maxStrikes: 3,
    teamHintBudgets,
    teamHuddleVotes: {},
    roundTally: { OT: 0, NT: 0, BOTH: 0 },
    correctAnswer: currentCard.answer,
  };
}

export function reduceTestamentSort(
  state: TestamentSortState,
  intent: GameIntent,
  playerId: string
): TestamentSortState {
  switch (intent.type) {
    case 'START_CARD': {
      const limit = getTestamentSortTimeLimit(state.currentCard.tier);
      return {
        ...state,
        currentPhaseId: 'card',
        phaseTimeRemaining: limit,
        phaseDuration: limit,
      };
    }

    case 'USE_HINT': {
      const pState = state.playerCardStates[playerId];
      if (!pState || pState.hintUsed || pState.locked) return state;

      // In Huddle mode, check team budget
      if (state.mode === 'huddle') {
        const teamId = intent.payload?.teamId;
        if (teamId && (state.teamHintBudgets[teamId] ?? 0) <= 0) {
          return state; // Budget exhausted
        }

        const newBudgets = { ...state.teamHintBudgets };
        if (teamId) {
          newBudgets[teamId] = Math.max(0, (newBudgets[teamId] ?? 3) - 1);
        }

        // Apply hintUsed to all teammates if teamId is provided
        const newPlayerStates = { ...state.playerCardStates };
        for (const pid in newPlayerStates) {
          if (intent.payload?.teammateIds?.includes(pid) || pid === playerId) {
            newPlayerStates[pid] = { ...newPlayerStates[pid], hintUsed: true };
          }
        }

        return {
          ...state,
          teamHintBudgets: newBudgets,
          playerCardStates: newPlayerStates,
        };
      }

      return {
        ...state,
        playerCardStates: {
          ...state.playerCardStates,
          [playerId]: {
            ...pState,
            hintUsed: true,
          },
        },
      };
    }

    case 'PICK': {
      const choice: TestamentChoice = intent.payload?.choice;
      const pState = state.playerCardStates[playerId];
      if (!pState || pState.locked) return state;

      const autoLock = intent.payload?.autoLock ?? false;
      const elapsed = intent.payload?.elapsedSeconds ?? Math.max(0, (state.phaseDuration ?? 15) - (state.phaseTimeRemaining ?? 0));

      const updatedPState: PlayerCardState = {
        ...pState,
        selectedChoice: choice,
        locked: autoLock,
        lockedAtTime: autoLock ? elapsed : 0,
      };

      const newStates = {
        ...state.playerCardStates,
        [playerId]: updatedPState,
      };

      // Check if all players have locked
      const allLocked = Object.values(newStates).every((p) => p.locked);

      return {
        ...state,
        playerCardStates: newStates,
        ...(allLocked && state.currentPhaseId === 'card'
          ? evaluateRoundCompletion({ ...state, playerCardStates: newStates })
          : {}),
      };
    }

    case 'LOCK': {
      const pState = state.playerCardStates[playerId];
      if (!pState || !pState.selectedChoice || pState.locked) return state;

      const elapsed = intent.payload?.elapsedSeconds ?? Math.max(0, (state.phaseDuration ?? 15) - (state.phaseTimeRemaining ?? 0));
      const updatedPState: PlayerCardState = {
        ...pState,
        locked: true,
        lockedAtTime: elapsed,
      };

      const newStates = {
        ...state.playerCardStates,
        [playerId]: updatedPState,
      };

      const allLocked = Object.values(newStates).every((p) => p.locked);

      if (allLocked && state.currentPhaseId === 'card') {
        return evaluateRoundCompletion({ ...state, playerCardStates: newStates });
      }

      return {
        ...state,
        playerCardStates: newStates,
      };
    }

    case 'TRIGGER_REVEAL': {
      return evaluateRoundCompletion(state);
    }

    case 'RESOLVE_HUDDLE': {
      // Huddle tie resolved by team consensus
      const teamId = intent.payload?.teamId;
      const consensusChoice: TestamentChoice = intent.payload?.choice;
      if (!teamId || !consensusChoice) return state;

      const newVotes = { ...state.teamHuddleVotes };
      newVotes[teamId] = {
        teamId,
        teamChoice: consensusChoice,
        isTie: false,
        votes: { OT: 0, NT: 0, BOTH: 0, [consensusChoice]: 1 },
      };

      return {
        ...state,
        teamHuddleVotes: newVotes,
        currentPhaseId: 'reveal',
        phaseTimeRemaining: 8,
        phaseDuration: 8,
      };
    }

    case 'NEXT_CARD': {
      const nextIndex = state.currentIndex + 1;
      const isGameOver = nextIndex >= state.cardsPool.length || (state.mode === 'solo' && state.strikes >= state.maxStrikes);

      if (isGameOver) {
        return {
          ...state,
          isGameOver: true,
          currentPhaseId: 'final',
        };
      }

      const nextCard = state.cardsPool[nextIndex];
      const nextLimit = getTestamentSortTimeLimit(nextCard.tier);

      // Reset card states for next question
      const resetStates: Record<string, PlayerCardState> = {};
      for (const pid in state.playerCardStates) {
        const prev = state.playerCardStates[pid];
        resetStates[pid] = {
          playerId: pid,
          selectedChoice: null,
          locked: false,
          lockedAtTime: 0,
          hintUsed: false,
          scoreEarned: 0,
          isCorrect: false,
          streakCount: prev.isCorrect ? prev.streakCount + 1 : 0,
        };
      }

      return {
        ...state,
        currentIndex: nextIndex,
        roundNumber: nextIndex + 1,
        currentCard: nextCard,
        correctAnswer: nextCard.answer,
        currentPhaseId: 'countdown',
        phaseIndex: 0,
        phaseTimeRemaining: 3,
        phaseDuration: 3,
        playerCardStates: resetStates,
        roundTally: { OT: 0, NT: 0, BOTH: 0 },
        teamHuddleVotes: {},
      };
    }

    default:
      return state;
  }
}

/**
 * Calculates scores, tally, checks ties for huddle, and transitions to reveal
 */
function evaluateRoundCompletion(state: TestamentSortState): TestamentSortState {
  const tally: Record<TestamentChoice, number> = { OT: 0, NT: 0, BOTH: 0 };
  const updatedPlayerStates: Record<string, PlayerCardState> = {};
  const updatedScores: Record<string, number> = { ...state.scores };
  let newStrikes = state.strikes;

  // Tally votes
  for (const pid in state.playerCardStates) {
    const p = state.playerCardStates[pid];
    if (p.selectedChoice) {
      tally[p.selectedChoice] = (tally[p.selectedChoice] || 0) + 1;
    }

    const isCorrect = p.selectedChoice === state.currentCard.answer;
    const streak = isCorrect ? p.streakCount + 1 : 0;

    const scoreResult = calculateTestamentSortScore({
      tier: state.currentCard.tier,
      elapsedSeconds: p.lockedAtTime,
      isCorrect,
      correctAnswer: state.currentCard.answer,
      hintUsed: p.hintUsed,
      streakCount: p.streakCount,
      riskMode: state.riskMode,
    });

    updatedScores[pid] = Math.max(0, (updatedScores[pid] || 0) + scoreResult.points);
    updatedPlayerStates[pid] = {
      ...p,
      isCorrect,
      scoreEarned: scoreResult.points,
      streakCount: isCorrect ? p.streakCount + 1 : 0,
    };

    if (state.mode === 'solo' && !isCorrect) {
      newStrikes += 1;
    }
  }

  // In Huddle mode, check if any team had a tie vote
  let hasTieToHuddle = false;
  if (state.mode === 'huddle') {
    // If teams are configured, determine majority or tie
    // (If tie, currentPhaseId = 'huddle', 10s countdown)
  }

  return {
    ...state,
    currentPhaseId: hasTieToHuddle ? 'huddle' : 'reveal',
    phaseTimeRemaining: hasTieToHuddle ? 10 : 8,
    phaseDuration: hasTieToHuddle ? 10 : 8,
    roundTally: tally,
    playerCardStates: updatedPlayerStates,
    scores: updatedScores,
    strikes: newStrikes,
  };
}

export function scoreTestamentSort(
  state: TestamentSortState,
  players: Player[],
  teams: Team[]
): LeaderboardEntry[] {
  // Team Leaderboard
  if (state.mode === 'huddle' && teams && teams.length > 0) {
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

  // Individual Leaderboard
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
