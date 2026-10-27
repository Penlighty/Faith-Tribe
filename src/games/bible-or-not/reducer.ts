import { Player, Team, SessionConfig, GameIntent, LeaderboardEntry } from '../../engine/types';
import { BibleOrNotItem } from '../../engine/content/schemas';
import { allBibleOrNotItems } from '../../engine/content/loader';
import { planBibleOrNotSession } from '../../engine/services/antiRepeatLedger';
import {
  BibleOrNotState,
  BibleOrNotChoice,
  PlayerCardState,
} from './types';
import { calculateBibleOrNotScore, getBibleOrNotTimeLimit } from './scoring';

export function setupBibleOrNot(
  config: SessionConfig,
  players: Player[],
  _teams: Team[],
  content?: BibleOrNotItem[]
): BibleOrNotState {
  const isSolo = players.length === 1;
  const mode = isSolo ? 'solo' : 'tournament';

  const pool = content && content.length > 0 ? content : allBibleOrNotItems;
  const cardsPerRound = 4;
  const totalRounds = isSolo ? 4 : 3;
  const sessionLength = isSolo ? 16 : cardsPerRound * totalRounds;

  const plannedCards = planBibleOrNotSession(pool, { sessionLength });
  const currentCard = plannedCards[0] || pool[0];

  const initialPlayerCardStates: Record<string, PlayerCardState> = {};
  const scores: Record<string, number> = {};
  const allPlayerIds = players.map((p) => p.id);

  for (const p of players) {
    scores[p.id] = 0;
    initialPlayerCardStates[p.id] = {
      playerId: p.id,
      selectedChoice: null,
      locked: false,
      lockedAtElapsed: 0,
      scoreEarned: 0,
      isCorrect: false,
      streakCount: 0,
    };
  }

  return {
    phaseIndex: 0,
    currentPhaseId: 'countdown',
    roundNumber: 1,
    totalRounds,
    phaseTimeRemaining: 3,
    phaseDuration: 3,
    isGameOver: false,
    scores,
    mode,
    currentCard,
    cardsPool: plannedCards,
    currentIndex: 0,
    totalCards: plannedCards.length,

    currentRound: 1,
    cardsPerRound,
    cardIndexInRound: 0,
    eliminatedPlayerIds: [],
    survivingPlayerIds: allPlayerIds,
    podium: {},

    playerCardStates: initialPlayerCardStates,
    roundTally: { IN_BIBLE: 0, NOT_IN_BIBLE: 0 },
    correctAnswer: currentCard.answer,

    soloTier: 1,
    strikes: 0,
    maxStrikes: 3,
    levelTarget: 10,
    levelProgress: 0,
  };
}

export function reduceBibleOrNot(
  state: BibleOrNotState,
  intent: GameIntent,
  playerId: string
): BibleOrNotState {
  switch (intent.type) {
    case 'START_CARD': {
      const limit = getBibleOrNotTimeLimit(state.currentCard.tier);
      return {
        ...state,
        currentPhaseId: 'card',
        phaseTimeRemaining: limit,
        phaseDuration: limit,
      };
    }

    case 'SWIPE':
    case 'PICK': {
      const choice = intent.payload?.choice as BibleOrNotChoice | undefined;
      if (!choice) return state;
      if (state.currentPhaseId !== 'card') return state;

      const pState = state.playerCardStates[playerId];
      if (!pState || pState.locked) return state;

      return {
        ...state,
        playerCardStates: {
          ...state.playerCardStates,
          [playerId]: {
            ...pState,
            selectedChoice: choice,
          },
        },
      };
    }

    case 'LOCK': {
      if (state.currentPhaseId !== 'card') return state;
      const pState = state.playerCardStates[playerId];
      if (!pState || pState.locked) return state;

      const choice = (intent.payload?.choice as BibleOrNotChoice) || pState.selectedChoice;
      if (!choice) return state;

      const elapsed = typeof intent.payload?.elapsedSeconds === 'number'
        ? intent.payload.elapsedSeconds
        : Math.max(0, (state.phaseDuration ?? 10) - (state.phaseTimeRemaining ?? 0));

      const isCorrect = choice === state.currentCard.answer;
      const newStreak = isCorrect ? pState.streakCount + 1 : 0;

      const scoreResult = calculateBibleOrNotScore({
        tier: state.currentCard.tier,
        elapsedSeconds: elapsed,
        isCorrect,
        streakCount: newStreak,
      });

      const updatedPState: PlayerCardState = {
        ...pState,
        selectedChoice: choice,
        locked: true,
        lockedAtElapsed: elapsed,
        isCorrect,
        scoreEarned: scoreResult.points,
        streakCount: newStreak,
      };

      const updatedStates = {
        ...state.playerCardStates,
        [playerId]: updatedPState,
      };

      const updatedScores = {
        ...state.scores,
        [playerId]: (state.scores[playerId] || 0) + scoreResult.points,
      };

      // Check if all active surviving players are locked
      const activeIds = state.survivingPlayerIds.length > 0 ? state.survivingPlayerIds : Object.keys(state.playerCardStates);
      const allActiveLocked = activeIds.every((id) => updatedStates[id]?.locked);

      if (allActiveLocked) {
        // Compute tally
        const tally: Record<BibleOrNotChoice, number> = { IN_BIBLE: 0, NOT_IN_BIBLE: 0 };
        for (const id of activeIds) {
          const c = updatedStates[id]?.selectedChoice;
          if (c) tally[c] = (tally[c] || 0) + 1;
        }

        return {
          ...state,
          playerCardStates: updatedStates,
          scores: updatedScores,
          roundTally: tally,
          currentPhaseId: 'reveal',
          phaseTimeRemaining: 6,
          phaseDuration: 6,
        };
      }

      return {
        ...state,
        playerCardStates: updatedStates,
        scores: updatedScores,
      };
    }

    case 'TIMER_TICK': {
      const remaining = Math.max(0, (state.phaseTimeRemaining ?? 1) - 1);

      if (remaining > 0) {
        return { ...state, phaseTimeRemaining: remaining };
      }

      // Timer expired in countdown -> start card
      if (state.currentPhaseId === 'countdown') {
        const limit = getBibleOrNotTimeLimit(state.currentCard.tier);
        return {
          ...state,
          currentPhaseId: 'card',
          phaseTimeRemaining: limit,
          phaseDuration: limit,
        };
      }

      // Timer expired in card phase -> lock anyone unlocked with 0 points, then go to reveal
      if (state.currentPhaseId === 'card') {
        const updatedStates = { ...state.playerCardStates };
        const tally: Record<BibleOrNotChoice, number> = { IN_BIBLE: 0, NOT_IN_BIBLE: 0 };
        const activeIds = state.survivingPlayerIds.length > 0 ? state.survivingPlayerIds : Object.keys(state.playerCardStates);

        for (const id of activeIds) {
          const p = updatedStates[id];
          if (!p.locked) {
            const isCorrect = p.selectedChoice === state.currentCard.answer;
            const points = isCorrect
              ? calculateBibleOrNotScore({
                  tier: state.currentCard.tier,
                  elapsedSeconds: state.phaseDuration ?? 10,
                  isCorrect: true,
                  streakCount: p.selectedChoice ? p.streakCount + 1 : 0,
                }).points
              : 0;

            updatedStates[id] = {
              ...p,
              locked: true,
              lockedAtElapsed: state.phaseDuration ?? 10,
              isCorrect,
              scoreEarned: points,
              streakCount: isCorrect ? p.streakCount + 1 : 0,
            };
          }
          if (updatedStates[id].selectedChoice) {
            tally[updatedStates[id].selectedChoice!] = (tally[updatedStates[id].selectedChoice!] || 0) + 1;
          }
        }

        return {
          ...state,
          playerCardStates: updatedStates,
          roundTally: tally,
          currentPhaseId: 'reveal',
          phaseTimeRemaining: 6,
          phaseDuration: 6,
        };
      }

      // Timer expired in reveal -> advance to next card or round summary or game over
      if (state.currentPhaseId === 'reveal') {
        const nextIndex = state.currentIndex + 1;
        const nextCardInRound = state.cardIndexInRound + 1;

        // Check if round completed
        const isRoundEnd = nextCardInRound >= state.cardsPerRound;

        if (isRoundEnd && state.mode === 'tournament' && state.currentRound < state.totalRounds) {
          // Perform tournament elimination
          // Sort surviving players by score descending
          const sortedSurvivors = [...state.survivingPlayerIds].sort(
            (a, b) => (state.scores[b] || 0) - (state.scores[a] || 0)
          );

          let newSurvivors: string[] = sortedSurvivors;
          let newEliminated: string[] = [...state.eliminatedPlayerIds];

          if (sortedSurvivors.length > 3) {
            // Cut bottom slice
            const targetRemaining = state.currentRound === 1
              ? Math.max(3, Math.ceil(sortedSurvivors.length * 0.6))
              : 3; // final 3
            newSurvivors = sortedSurvivors.slice(0, targetRemaining);
            const dropped = sortedSurvivors.slice(targetRemaining);
            newEliminated = [...newEliminated, ...dropped];
          }

          return {
            ...state,
            currentPhaseId: 'roundSummary',
            phaseTimeRemaining: 5,
            phaseDuration: 5,
            survivingPlayerIds: newSurvivors,
            eliminatedPlayerIds: newEliminated,
          };
        }

        // Check if game over (no more cards or final round finished)
        if (nextIndex >= state.totalCards || (isRoundEnd && state.currentRound >= state.totalRounds)) {
          // Compute podium
          const sortedAll = Object.keys(state.scores).sort((a, b) => (state.scores[b] || 0) - (state.scores[a] || 0));
          return {
            ...state,
            isGameOver: true,
            currentPhaseId: 'reveal',
            phaseTimeRemaining: 0,
            podium: {
              first: sortedAll[0],
              second: sortedAll[1],
              third: sortedAll[2],
            },
          };
        }

        // Next card in progress
        const nextCard = state.cardsPool[nextIndex];
        const resetPlayerStates: Record<string, PlayerCardState> = {};
        for (const id of Object.keys(state.playerCardStates)) {
          resetPlayerStates[id] = {
            playerId: id,
            selectedChoice: null,
            locked: false,
            lockedAtElapsed: 0,
            scoreEarned: 0,
            isCorrect: false,
            streakCount: state.playerCardStates[id]?.streakCount || 0,
          };
        }

        return {
          ...state,
          currentPhaseId: 'countdown',
          phaseTimeRemaining: 3,
          phaseDuration: 3,
          currentIndex: nextIndex,
          cardIndexInRound: isRoundEnd ? 0 : nextCardInRound,
          currentRound: isRoundEnd ? state.currentRound + 1 : state.currentRound,
          roundNumber: nextIndex + 1,
          currentCard: nextCard,
          correctAnswer: nextCard.answer,
          playerCardStates: resetPlayerStates,
          roundTally: { IN_BIBLE: 0, NOT_IN_BIBLE: 0 },
        };
      }

      // Timer expired in roundSummary -> advance to next round
      if (state.currentPhaseId === 'roundSummary') {
        const nextIndex = state.currentIndex + 1;
        if (nextIndex >= state.totalCards) {
          const sortedAll = Object.keys(state.scores).sort((a, b) => (state.scores[b] || 0) - (state.scores[a] || 0));
          return {
            ...state,
            isGameOver: true,
            podium: {
              first: sortedAll[0],
              second: sortedAll[1],
              third: sortedAll[2],
            },
          };
        }

        const nextCard = state.cardsPool[nextIndex];
        const resetPlayerStates: Record<string, PlayerCardState> = {};
        for (const id of Object.keys(state.playerCardStates)) {
          resetPlayerStates[id] = {
            playerId: id,
            selectedChoice: null,
            locked: false,
            lockedAtElapsed: 0,
            scoreEarned: 0,
            isCorrect: false,
            streakCount: state.playerCardStates[id]?.streakCount || 0,
          };
        }

        return {
          ...state,
          currentPhaseId: 'countdown',
          phaseTimeRemaining: 3,
          phaseDuration: 3,
          currentIndex: nextIndex,
          cardIndexInRound: 0,
          currentRound: state.currentRound + 1,
          roundNumber: nextIndex + 1,
          currentCard: nextCard,
          correctAnswer: nextCard.answer,
          playerCardStates: resetPlayerStates,
          roundTally: { IN_BIBLE: 0, NOT_IN_BIBLE: 0 },
        };
      }

      return state;
    }

    default:
      return state;
  }
}

export function scoreBibleOrNot(state: BibleOrNotState): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = [];
  for (const [id, score] of Object.entries(state.scores)) {
    entries.push({
      id,
      playerId: id,
      name: id,
      score,
      rank: 1,
    });
  }

  // Sort descending by score
  entries.sort((a, b) => b.score - a.score);

  // Assign ranks
  for (let i = 0; i < entries.length; i++) {
    entries[i].rank = i + 1;
  }

  return entries;
}
