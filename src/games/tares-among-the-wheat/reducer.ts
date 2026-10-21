import { TaresState, TaresContent, PassageItem } from './types';
import { GameIntent, Player, Team, SessionConfig, LeaderboardEntry } from '../../engine/types';
import { getFreshPool, shuffle } from '../../engine/services/randomizer';

export function getPassageDifficulty(p: PassageItem): 'easy' | 'medium' | 'hard' {
  if (p.difficulty) return p.difficulty;
  const famous = ['goliath', 'flood', 'ark', 'jonah', 'red sea', 'manger', 'five thousand', 'lions', 'cross', 'resurrection', 'good samaritan'];
  const t = p.title.toLowerCase();
  if (famous.some((k) => t.includes(k))) return 'easy';
  const tricky = ['ehud', 'jephthah', 'apollos', 'ananias', 'michmash', 'oxgoad', 'axe head'];
  if (tricky.some((k) => t.includes(k))) return 'hard';
  return 'medium';
}

export function planTaresSession(passages: PassageItem[], totalRounds: number = 6): PassageItem[] {
  if (passages.length === 0) return [];
  const easy = getFreshPool(passages.filter((p) => getPassageDifficulty(p) === 'easy'), 'tares-easy');
  const medium = getFreshPool(passages.filter((p) => getPassageDifficulty(p) === 'medium'), 'tares-medium');
  const hard = getFreshPool(passages.filter((p) => getPassageDifficulty(p) === 'hard'), 'tares-hard');

  const planned: PassageItem[] = [];
  const easyCount = Math.max(1, Math.round(totalRounds * 0.35));
  const mediumCount = Math.max(1, Math.round(totalRounds * 0.35));
  const hardCount = Math.max(1, totalRounds - easyCount - mediumCount);

  planned.push(...easy.slice(0, easyCount));
  planned.push(...medium.slice(0, mediumCount));
  planned.push(...hard.slice(0, hardCount));

  if (planned.length < totalRounds) {
    const usedIds = new Set(planned.map((p) => p.id));
    const remaining = shuffle(passages.filter((p) => !usedIds.has(p.id)));
    planned.push(...remaining.slice(0, totalRounds - planned.length));
  }

  return planned;
}

export function setupTares(
  config: SessionConfig,
  players: Player[],
  teams: Team[],
  content: TaresContent
): TaresState {
  const passages = content.passages || [];
  const totalRounds = config.roundsCount || 6;
  const plannedPassages = planTaresSession(passages, totalRounds);
  const mainPassage = plannedPassages[0] || passages[Math.floor(Math.random() * passages.length)];
  const similarPassage = mainPassage?.similarPassageId
    ? passages.find((p) => p.id === mainPassage.similarPassageId)
    : undefined;

  // Assign tares: 1 tare per team if team mode, or 1-2 tares for individuals
  const tareIds: string[] = [];
  if (config.playMode === 'teams' && teams.length > 0) {
    teams.forEach((team) => {
      if (team.playerIds.length > 0) {
        const randomPlayerId = team.playerIds[Math.floor(Math.random() * team.playerIds.length)];
        tareIds.push(randomPlayerId);
      }
    });
  } else {
    // Individuals mode: 1 tare for up to 8 players, 2 for 9+
    const count = players.length >= 9 ? 2 : 1;
    const shuffled = [...players].sort(() => 0.5 - Math.random());
    shuffled.slice(0, count).forEach((p) => tareIds.push(p.id));
  }

  const initialScores: Record<string, number> = {};
  players.forEach((p) => {
    initialScores[p.id] = 0;
  });

  return {
    phaseIndex: 0,
    currentPhaseId: 'deal',
    roundNumber: 1,
    totalRounds,
    isGameOver: false,
    scores: initialScores,
    currentPassage: mainPassage,
    plannedPassages,
    similarPassage,
    twinStoriesMode: false,
    tarePlayerIds: tareIds,
    activeCluePlayerIndex: 0,
    cluePlayerOrder: players.map((p) => p.id),
    votes: {},
    roundScores: {},
  };
}

export function reduceTares(
  state: TaresState,
  intent: GameIntent,
  _playerId: string
): TaresState {
  switch (intent.type) {
    case 'CLUE_DONE': {
      const nextIndex = state.activeCluePlayerIndex + 1;
      return {
        ...state,
        activeCluePlayerIndex: nextIndex,
      };
    }

    case 'TOGGLE_TWIN_STORIES': {
      return {
        ...state,
        twinStoriesMode: !state.twinStoriesMode,
      };
    }

    case 'CAST_VOTE': {
      const { accusedPlayerId } = intent.payload || {};
      if (!accusedPlayerId) return state;

      return {
        ...state,
        votes: {
          ...state.votes,
          [intent.playerId]: accusedPlayerId,
        },
      };
    }

    case 'TARE_STEAL': {
      const { guessedTitle } = intent.payload || {};
      const isStealSuccessful =
        guessedTitle?.trim().toLowerCase() === state.currentPassage.title.trim().toLowerCase();

      const newScores = { ...state.scores };
      const roundScores = { ...state.roundScores };

      if (isStealSuccessful) {
        // Tare gets +1 for correct steal
        state.tarePlayerIds.forEach((tareId) => {
          newScores[tareId] = (newScores[tareId] || 0) + 1;
          roundScores[tareId] = (roundScores[tareId] || 0) + 1;
        });
      }

      return {
        ...state,
        tareStealGuess: guessedTitle,
        isStealSuccessful,
        scores: newScores,
        roundScores,
      };
    }

    case 'RESOLVE_VOTES': {
      // Tally votes to find most accused player
      const voteCounts: Record<string, number> = {};
      Object.values(state.votes).forEach((accusedId) => {
        voteCounts[accusedId] = (voteCounts[accusedId] || 0) + 1;
      });

      let topAccusedId: string | null = null;
      let maxVotes = 0;
      Object.entries(voteCounts).forEach(([pId, count]) => {
        if (count > maxVotes) {
          maxVotes = count;
          topAccusedId = pId;
        }
      });

      const isTareCaught = topAccusedId !== null && state.tarePlayerIds.includes(topAccusedId);

      const roundScores: Record<string, number> = {};
      const newScores = { ...state.scores };

      Object.keys(state.scores).forEach((pId) => {
        roundScores[pId] = 0;
      });

      if (isTareCaught) {
        // Wheat gets +1 for catching the tare
        Object.keys(state.scores).forEach((pId) => {
          if (!state.tarePlayerIds.includes(pId)) {
            roundScores[pId] = 1;
            newScores[pId] = (newScores[pId] || 0) + 1;
          }
        });
      } else {
        // Tare +2 for surviving
        state.tarePlayerIds.forEach((tareId) => {
          roundScores[tareId] = 2;
          newScores[tareId] = (newScores[tareId] || 0) + 2;
        });
      }

      // Check if any player or team reached 10 points
      const hasWinner = Object.values(newScores).some((s) => s >= 10);

      return {
        ...state,
        isTareCaught,
        roundScores,
        scores: newScores,
        isGameOver: hasWinner,
      };
    }

    case 'START_ROUND': {
      const { nextPassage, nextSimilar, newTareIds } = intent.payload || {};
      const nextPlanned = state.plannedPassages && state.plannedPassages[state.roundNumber];
      const actualPassage = nextPassage || nextPlanned || state.currentPassage;
      const actualSimilar = nextSimilar || (actualPassage?.similarPassageId ? state.plannedPassages?.find(p => p.id === actualPassage.similarPassageId) : undefined) || state.similarPassage;

      return {
        ...state,
        roundNumber: state.roundNumber + 1,
        currentPassage: actualPassage,
        similarPassage: actualSimilar,
        tarePlayerIds: newTareIds || state.tarePlayerIds,
        activeCluePlayerIndex: 0,
        votes: {},
        tareStealGuess: undefined,
        isTareCaught: undefined,
        isStealSuccessful: undefined,
        roundScores: {},
      };
    }

    default:
      return state;
  }
}

export function scoreTares(
  state: TaresState,
  players: Player[],
  teams: Team[]
): LeaderboardEntry[] {
  if (teams.length > 0) {
    // Team scoring: aggregate player scores
    const teamEntries: LeaderboardEntry[] = teams.map((team) => {
      const totalScore = team.playerIds.reduce((sum, id) => sum + (state.scores[id] || 0), 0);
      return {
        id: team.id,
        name: team.name,
        score: totalScore,
        rank: 1,
        teamColor: team.color,
      };
    });

    teamEntries.sort((a, b) => b.score - a.score);
    teamEntries.forEach((entry, idx) => {
      entry.rank = idx + 1;
    });
    return teamEntries;
  }

  // Individual scoring
  const entries: LeaderboardEntry[] = players.map((player) => {
    const score = state.scores[player.id] || 0;
    return {
      id: player.id,
      name: player.name,
      score,
      rank: 1,
      avatarSeed: player.avatarSeed,
    };
  });

  entries.sort((a, b) => b.score - a.score);
  entries.forEach((entry, idx) => {
    entry.rank = idx + 1;
  });

  return entries;
}
