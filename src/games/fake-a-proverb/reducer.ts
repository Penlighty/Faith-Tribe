import { FakeAProverbState, FakeAProverbContent, ProverbItem } from './types';
import { GameIntent, Player, Team, SessionConfig, LeaderboardEntry } from '../../engine/types';
import { sanitizeInput } from '../../engine/services/sanitizer';
import { getFreshPool, shuffle } from '../../engine/services/randomizer';

export function planProverbsSession(proverbs: ProverbItem[], totalRounds: number = 6): ProverbItem[] {
  if (proverbs.length === 0) return [];
  const easy = getFreshPool(proverbs.filter((p) => p.difficulty === 'easy'), 'fake-a-proverb-easy');
  const medium = getFreshPool(proverbs.filter((p) => p.difficulty === 'medium'), 'fake-a-proverb-medium');
  const hard = getFreshPool(proverbs.filter((p) => p.difficulty === 'hard'), 'fake-a-proverb-hard');

  const planned: ProverbItem[] = [];
  const easyCount = Math.max(1, Math.round(totalRounds * 0.35));
  const mediumCount = Math.max(1, Math.round(totalRounds * 0.35));
  const hardCount = Math.max(1, totalRounds - easyCount - mediumCount);

  planned.push(...easy.slice(0, easyCount));
  planned.push(...medium.slice(0, mediumCount));
  planned.push(...hard.slice(0, hardCount));

  if (planned.length < totalRounds) {
    const usedIds = new Set(planned.map((p) => p.id));
    const remaining = shuffle(proverbs.filter((p) => !usedIds.has(p.id)));
    planned.push(...remaining.slice(0, totalRounds - planned.length));
  }

  return planned;
}

export function setupFakeAProverb(
  config: SessionConfig,
  players: Player[],
  _teams: Team[],
  content: FakeAProverbContent
): FakeAProverbState {
  const proverbs = content.proverbs || [];
  const totalRounds = config.roundsCount || 6;
  const plannedProverbs = planProverbsSession(proverbs, totalRounds);
  const initialProverb = plannedProverbs[0] || proverbs[Math.floor(Math.random() * proverbs.length)];

  const initialScores: Record<string, number> = {};
  players.forEach((p) => {
    initialScores[p.id] = 0;
  });

  return {
    phaseIndex: 0,
    currentPhaseId: 'prompt',
    roundNumber: 1,
    totalRounds,
    isGameOver: false,
    scores: initialScores,
    currentProverb: initialProverb,
    plannedProverbs,
    submissions: {},
    votes: {},
    shuffledEndings: [],
    roundScores: {},
  };
}

export function reduceFakeAProverb(
  state: FakeAProverbState,
  intent: GameIntent,
  _playerId: string
): FakeAProverbState {
  switch (intent.type) {
    case 'SUBMIT_ENDING': {
      const { ending } = intent.payload || {};
      const cleanEnding = sanitizeInput(ending, 160);
      if (!cleanEnding) return state;

      const updatedSubmissions = {
        ...state.submissions,
        [intent.playerId]: cleanEnding,
      };

      return {
        ...state,
        submissions: updatedSubmissions,
      };
    }

    case 'SUBMIT_VOTE': {
      const { choiceEnding } = intent.payload || {};
      if (!choiceEnding) return state;

      // Ensure user doesn't vote for their own submission
      const userOwnSubmission = state.submissions[intent.playerId];
      if (userOwnSubmission && userOwnSubmission === choiceEnding) {
        return state;
      }

      const updatedVotes = {
        ...state.votes,
        [intent.playerId]: choiceEnding,
      };

      return {
        ...state,
        votes: updatedVotes,
      };
    }

    case 'PREPARE_VOTING': {
      // Shuffled endings including the real ending and submitted fake endings
      const entries: { ending: string; isReal: boolean; authorId?: string }[] = [
        { ending: state.currentProverb.realEnding, isReal: true },
      ];

      Object.entries(state.submissions).forEach(([authorId, ending]) => {
        // avoid exact duplicates of real ending
        if (ending.trim().toLowerCase() !== state.currentProverb.realEnding.trim().toLowerCase()) {
          entries.push({ ending, isReal: false, authorId });
        }
      });

      // Fisher-Yates shuffle
      const shuffled = [...entries];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      return {
        ...state,
        shuffledEndings: shuffled,
      };
    }

    case 'CALCULATE_ROUND_SCORES': {
      const totalPlayers = Object.keys(state.scores).length || 1;
      const roundScores: Record<string, number> = {};
      const newTotalScores = { ...state.scores };

      Object.keys(state.scores).forEach((pId) => {
        roundScores[pId] = 0;
      });

      // 1. Point for voting the real ending
      Object.entries(state.votes).forEach(([voterId, chosenEnding]) => {
        if (chosenEnding === state.currentProverb.realEnding) {
          roundScores[voterId] = (roundScores[voterId] || 0) + 1;
        }
      });

      // 2. Points for fooling others with your fake ending
      // Count votes per author
      const votesPerAuthor: Record<string, number> = {};
      Object.entries(state.votes).forEach(([_voterId, chosenEnding]) => {
        const matchedItem = state.shuffledEndings.find((item) => item.ending === chosenEnding);
        if (matchedItem && !matchedItem.isReal && matchedItem.authorId) {
          votesPerAuthor[matchedItem.authorId] = (votesPerAuthor[matchedItem.authorId] || 0) + 1;
        }
      });

      Object.entries(votesPerAuthor).forEach(([authorId, voteCount]) => {
        let points = voteCount; // +1 per vote
        // +2 bonus if over half the room picked your fake
        if (voteCount > totalPlayers / 2) {
          points += 2;
        }
        roundScores[authorId] = (roundScores[authorId] || 0) + points;
      });

      // Apply to cumulative scores
      Object.entries(roundScores).forEach(([pId, pts]) => {
        newTotalScores[pId] = (newTotalScores[pId] || 0) + pts;
      });

      return {
        ...state,
        roundScores,
        scores: newTotalScores,
      };
    }

    case 'START_ROUND': {
      const { nextProverb, roundNumber } = intent.payload || {};
      const targetRound = typeof roundNumber === 'number' ? roundNumber : state.roundNumber + 1;
      const nextPlanned = state.plannedProverbs && state.plannedProverbs[targetRound - 1];
      return {
        ...state,
        roundNumber: targetRound,
        submissions: {},
        votes: {},
        shuffledEndings: [],
        roundScores: {},
        currentProverb: nextProverb || nextPlanned || state.currentProverb,
      };
    }

    default:
      return state;
  }
}

export function scoreFakeAProverb(
  state: FakeAProverbState,
  players: Player[],
  _teams: Team[]
): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = players.map((player) => {
    const score = state.scores[player.id] || 0;
    return {
      id: player.id,
      name: player.name,
      score,
      rank: 1,
      avatarSeed: player.avatarSeed,
      teamColor: player.teamId ? '#CFEFD2' : undefined,
    };
  });

  // Sort descending by score
  entries.sort((a, b) => b.score - a.score);

  // Assign ranks
  entries.forEach((entry, idx) => {
    entry.rank = idx + 1;
  });

  return entries;
}
