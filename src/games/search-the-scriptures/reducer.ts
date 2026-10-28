import { SessionConfig, Player, Team, LeaderboardEntry } from '../../engine/types';
import { SearchTheScripturesState, SearchLevel, PlayerProgress } from './types';
import { calculateWordSearchPoints, LEVEL_CLEARED_BONUS, EARLY_RANK_BONUS } from './scoring';
import rawLevels from './content.json';

export function setupSearchTheScriptures(
  config: SessionConfig,
  players: Player[],
  teams: Team[],
  content?: SearchLevel[]
): SearchTheScripturesState {
  const levels: SearchLevel[] = content && content.length > 0 ? content : (rawLevels as SearchLevel[]);
  const initialProgress: Record<string, PlayerProgress> = {};
  const initialScores: Record<string, number> = {};

  const safePlayers = Array.isArray(players) && players.length > 0
    ? players
    : [{ id: 'solo_disciple', name: 'Disciple', isHost: true, avatarSeed: 'disciple', score: 0 }];

  for (const p of safePlayers) {
    initialProgress[p.id] = {
      playerId: p.id,
      currentLevelIndex: 0,
      score: 0,
      foundWords: [],
      foundWordsByLevel: {},
      levelScores: {},
      targetReached: false,
      isFinished: false,
      streak: 0,
    };
    initialScores[p.id] = 0;
  }

  return {
    phaseIndex: 0,
    currentPhaseId: 'search',
    roundNumber: 1,
    totalRounds: Math.min(levels.length, config.roundsCount || 3),
    isGameOver: false,
    scores: initialScores,
    levels,
    playerProgress: initialProgress,
    activityFeed: [],
  };
}

export function reduceSearchTheScriptures(
  state: SearchTheScripturesState,
  intent: { type: string; playerId: string; payload?: any; timestamp: number },
  hostPlayerId?: string
): SearchTheScripturesState {
  const { type, playerId, payload, timestamp } = intent;

  switch (type) {
    case 'WORD_FOUND': {
      const { word, levelIndex, timeToFindSec, playerName } = payload || {};
      if (!word || typeof levelIndex !== 'number') return state;

      const cleanWord = String(word).toUpperCase();
      const currentProg = state.playerProgress[playerId] || {
        playerId,
        currentLevelIndex: levelIndex,
        score: 0,
        foundWords: [],
        foundWordsByLevel: {},
        levelScores: {},
        targetReached: false,
        isFinished: false,
        streak: 0,
      };

      const levelFound = currentProg.foundWordsByLevel[levelIndex] || [];
      if (levelFound.includes(cleanWord)) {
        // Already found by this player in this level
        return state;
      }

      const nextStreak = (currentProg.streak || 0) + 1;
      const ptsResult = calculateWordSearchPoints(cleanWord, timeToFindSec, nextStreak);
      let earned = ptsResult.totalPoints;

      const updatedLevelFound = [...levelFound, cleanWord];
      const currentLevel = state.levels[levelIndex];
      const allFound = currentLevel && updatedLevelFound.length >= currentLevel.words.length;

      if (allFound) {
        earned += LEVEL_CLEARED_BONUS;
      }

      const newLevelScore = (currentProg.levelScores[levelIndex] || 0) + earned;
      const newTotalScore = (currentProg.score || 0) + earned;
      const targetReached = currentLevel ? newLevelScore >= currentLevel.targetScore : true;

      const updatedProg: PlayerProgress = {
        ...currentProg,
        score: newTotalScore,
        foundWords: [...currentProg.foundWords, cleanWord],
        foundWordsByLevel: {
          ...currentProg.foundWordsByLevel,
          [levelIndex]: updatedLevelFound,
        },
        levelScores: {
          ...currentProg.levelScores,
          [levelIndex]: newLevelScore,
        },
        targetReached,
        streak: nextStreak,
        lastFoundTimestamp: timestamp,
      };

      const activityItem = {
        id: `act_${timestamp}_${Math.random().toString(36).substring(2, 7)}`,
        playerId,
        playerName: playerName || 'Disciple',
        text: `found ${cleanWord}${allFound ? ' • Level Cleared!' : ''}`,
        points: earned,
        timestamp,
      };

      return {
        ...state,
        scores: {
          ...state.scores,
          [playerId]: newTotalScore,
        },
        playerProgress: {
          ...state.playerProgress,
          [playerId]: updatedProg,
        },
        activityFeed: [activityItem, ...(state.activityFeed || []).slice(0, 19)],
      };
    }

    case 'ADVANCE_LEVEL': {
      const { targetLevelIndex } = payload || {};
      const currentProg = state.playerProgress[playerId];
      if (!currentProg) return state;

      const nextLevelIndex = typeof targetLevelIndex === 'number'
        ? targetLevelIndex
        : currentProg.currentLevelIndex + 1;

      if (nextLevelIndex >= state.levels.length) {
        // Player completed all levels!
        return {
          ...state,
          playerProgress: {
            ...state.playerProgress,
            [playerId]: {
              ...currentProg,
              isFinished: true,
              finishedTimestamp: timestamp,
            },
          },
        };
      }

      return {
        ...state,
        playerProgress: {
          ...state.playerProgress,
          [playerId]: {
            ...currentProg,
            currentLevelIndex: nextLevelIndex,
            targetReached: false,
            streak: 0,
          },
        },
      };
    }

    case 'CLAIM_RANK': {
      const currentProg = state.playerProgress[playerId];
      if (!currentProg || currentProg.isFinished) return state;

      const bonus = EARLY_RANK_BONUS;
      const newTotal = (currentProg.score || 0) + bonus;

      return {
        ...state,
        scores: {
          ...state.scores,
          [playerId]: newTotal,
        },
        playerProgress: {
          ...state.playerProgress,
          [playerId]: {
            ...currentProg,
            score: newTotal,
            isFinished: true,
            finishedTimestamp: timestamp,
          },
        },
        activityFeed: [
          {
            id: `act_rank_${timestamp}`,
            playerId,
            playerName: payload?.playerName || 'Disciple',
            text: 'locked in rank & finished early!',
            points: bonus,
            timestamp,
          },
          ...(state.activityFeed || []).slice(0, 19),
        ],
      };
    }

    default:
      return state;
  }
}

export function scoreSearchTheScriptures(
  state: SearchTheScripturesState,
  players: Player[],
  teams: Team[]
): LeaderboardEntry[] {
  const safePlayers = Array.isArray(players) ? players : [];

  const entries: LeaderboardEntry[] = safePlayers.map((p) => {
    const prog = state.playerProgress[p.id];
    const score = prog?.score ?? (state.scores[p.id] || 0);
    const team = teams?.find((t) => t.id === p.teamId);

    return {
      id: p.id,
      playerId: p.id,
      name: p.name,
      score,
      secondaryScore: prog?.foundWords?.length || 0,
      rank: 1,
      avatarSeed: p.avatarSeed,
      teamColor: team?.color,
    };
  });

  // Sort descending by score; if tied, sort by secondaryScore (words found) or finished earlier
  entries.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const progA = state.playerProgress[a.id];
    const progB = state.playerProgress[b.id];
    if (progA?.finishedTimestamp && progB?.finishedTimestamp) {
      return progA.finishedTimestamp - progB.finishedTimestamp;
    }
    if (progA?.finishedTimestamp) return -1;
    if (progB?.finishedTimestamp) return 1;
    return (b.secondaryScore || 0) - (a.secondaryScore || 0);
  });

  return entries.map((entry, idx) => ({ ...entry, rank: idx + 1 }));
}
