import { HotCoalState, HotCoalContent, HotCoalCategory } from './types';
import { GameIntent, Player, Team, SessionConfig, LeaderboardEntry } from '../../engine/types';

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function planHotCoalSession(categories: HotCoalCategory[], totalRounds: number = 5): HotCoalCategory[] {
  if (categories.length === 0) return [];
  const easy = shuffle(categories.filter((c) => c.difficulty === 'easy'));
  const medium = shuffle(categories.filter((c) => c.difficulty === 'medium'));
  const hard = shuffle(categories.filter((c) => c.difficulty === 'hard'));

  const planned: HotCoalCategory[] = [];
  const easyCount = Math.max(1, Math.round(totalRounds * 0.4));
  const mediumCount = Math.max(1, Math.round(totalRounds * 0.4));
  const hardCount = Math.max(1, totalRounds - easyCount - mediumCount);

  planned.push(...easy.slice(0, easyCount));
  planned.push(...medium.slice(0, mediumCount));
  planned.push(...hard.slice(0, hardCount));

  if (planned.length < totalRounds) {
    const usedIds = new Set(planned.map((c) => c.id));
    const remaining = shuffle(categories.filter((c) => !usedIds.has(c.id)));
    planned.push(...remaining.slice(0, totalRounds - planned.length));
  }

  return planned;
}

export function setupHotCoal(
  config: SessionConfig,
  players: Player[],
  _teams: Team[],
  content: HotCoalContent
): HotCoalState {
  const categories = content.categories || [];
  const totalRounds = config.roundsCount || 5;
  const plannedCategories = planHotCoalSession(categories, totalRounds);
  const initialCategory = plannedCategories[0] || categories[Math.floor(Math.random() * categories.length)];

  // Random initial coal holder
  const randomHolder = players[Math.floor(Math.random() * players.length)];

  // Fuse is randomly timed between 25 and 45 seconds
  const randomFuse = Math.floor(Math.random() * 20) + 25;

  const initialBurns: Record<string, number> = {};
  players.forEach((p) => {
    initialBurns[p.id] = 0;
  });

  return {
    phaseIndex: 0,
    currentPhaseId: 'category',
    roundNumber: 1,
    totalRounds,
    isGameOver: false,
    scores: initialBurns,
    burnCount: initialBurns,
    currentCategory: initialCategory,
    plannedCategories,
    coalHolderId: randomHolder?.id || players[0]?.id || '',
    fuseDurationSeconds: randomFuse,
    fuseRemainingSeconds: randomFuse,
    passedPlayerIds: [],
    activeChallenge: null,
  };
}

export function reduceHotCoal(
  state: HotCoalState,
  intent: GameIntent,
  _playerId: string
): HotCoalState {
  switch (intent.type) {
    case 'PASS_COAL': {
      const { targetPlayerId } = intent.payload || {};
      if (!targetPlayerId || targetPlayerId === state.coalHolderId) return state;

      // Only the current holder can pass
      if (intent.playerId !== state.coalHolderId) return state;

      return {
        ...state,
        coalHolderId: targetPlayerId,
        passedPlayerIds: [...state.passedPlayerIds, state.coalHolderId],
      };
    }

    case 'INITIATE_CHALLENGE': {
      // Anyone can challenge the current holder / previous speaker
      const challengedId = state.coalHolderId;
      return {
        ...state,
        activeChallenge: {
          challengerId: intent.playerId,
          challengedId,
          resolved: false,
        },
      };
    }

    case 'RESOLVE_CHALLENGE': {
      const { wasValidAnswer } = intent.payload || {};
      if (!state.activeChallenge) return state;

      // If valid answer, challenger was wrong and takes burn.
      // If invalid answer, challenged player was wrong and takes burn.
      const loserId = wasValidAnswer
        ? state.activeChallenge.challengerId
        : state.activeChallenge.challengedId;

      const newBurns = {
        ...state.burnCount,
        [loserId]: (state.burnCount[loserId] || 0) + 1,
      };

      return {
        ...state,
        burnCount: newBurns,
        scores: newBurns,
        lastBurnedPlayerId: loserId,
        activeChallenge: {
          ...state.activeChallenge,
          resolved: true,
          loserId,
        },
      };
    }

    case 'TRIGGER_BURN': {
      // Fuse ran out! Current holder burns
      const burnedPlayerId = state.coalHolderId;
      const newBurns = {
        ...state.burnCount,
        [burnedPlayerId]: (state.burnCount[burnedPlayerId] || 0) + 1,
      };

      return {
        ...state,
        burnCount: newBurns,
        scores: newBurns,
        lastBurnedPlayerId: burnedPlayerId,
      };
    }

    case 'START_ROUND': {
      const { nextCategory, nextHolderId } = intent.payload || {};
      const nextPlanned = state.plannedCategories && state.plannedCategories[state.roundNumber];
      const newFuse = Math.floor(Math.random() * 20) + 25;

      return {
        ...state,
        roundNumber: state.roundNumber + 1,
        currentCategory: nextCategory || nextPlanned || state.currentCategory,
        coalHolderId: nextHolderId || state.coalHolderId,
        fuseDurationSeconds: newFuse,
        fuseRemainingSeconds: newFuse,
        passedPlayerIds: [],
        activeChallenge: null,
        lastBurnedPlayerId: undefined,
      };
    }

    default:
      return state;
  }
}

export function scoreHotCoal(
  state: HotCoalState,
  players: Player[],
  _teams: Team[]
): LeaderboardEntry[] {
  // In Hot Coal: FEWEST burns wins!
  const entries: LeaderboardEntry[] = players.map((player) => {
    const burns = state.burnCount[player.id] || 0;
    return {
      id: player.id,
      name: player.name,
      score: burns, // burns taken
      rank: 1,
      avatarSeed: player.avatarSeed,
    };
  });

  // Sort ascending by burns (0 burns is 1st place)
  entries.sort((a, b) => a.score - b.score);

  entries.forEach((entry, idx) => {
    entry.rank = idx + 1;
  });

  return entries;
}
