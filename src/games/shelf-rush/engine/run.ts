import { RunState, RunEvent, ShelfRushConfig, ShelfRushCard, CardLogEntry } from './types';
import { calculateCardScore, calculateSchemeRunBonus, calculateAscentRunBonus } from './scoring';
import { calculateSchemeWindowMs, calculateAscentWindowMs } from './timing';
import { binOf, getScheme, campaignData } from './loader';
import { PRNG, createRNG } from './rng';
import { LIVES_BY_MODE } from './constants';

export function createInitialRunState(
  config: ShelfRushConfig,
  deck: ShelfRushCard[]
): RunState {
  const maxLives = LIVES_BY_MODE[config.mode] || 3;
  return {
    config,
    deck: [...deck],
    cursor: 0,
    lives: maxLives,
    maxLives,
    streak: 0,
    bestStreak: 0,
    score: 0,
    correctBooks: new Set<string>(),
    log: [],
    requeueCount: 0,
    step: 1,
    stepStrikes: 0,
    status: 'ready',
  };
}

export interface RunReducerOptions {
  rng?: PRNG;
}

/**
 * Pure state reducer for a player's run.
 * Does not read Date.now() or performance.now(); callers pass timestamps.
 */
export function reduceRun(
  state: RunState,
  event: RunEvent,
  options?: RunReducerOptions
): RunState {
  switch (event.type) {
    case 'START': {
      if (state.status !== 'ready') return state;
      return {
        ...state,
        status: 'showing',
      };
    }

    case 'SHOW': {
      return {
        ...state,
        shownAt: event.timestamp,
        status: 'showing',
      };
    }

    case 'SORT':
    case 'TIMEOUT': {
      if (state.status !== 'showing' || state.cursor >= state.deck.length) {
        return state;
      }

      const card = state.deck[state.cursor];
      const scheme = getScheme(card.schemeId);
      const correctBin = binOf(card.schemeId, card.bookId);
      const isTimeout = event.type === 'TIMEOUT';
      const chosenBin = isTimeout ? null : event.binId;
      const isCorrect = !isTimeout && chosenBin === correctBin;

      const numBins = scheme ? scheme.bins.length : 2;
      const shownTime = state.shownAt ?? event.timestamp;
      const elapsedMs = Math.max(0, event.timestamp - shownTime);

      // Compute windowMs
      const windowMs =
        state.config.mode === 'scheme'
          ? calculateSchemeWindowMs({
              numBins,
              deckSize: state.deck.length,
              correctCount: state.correctBooks.size,
              speed: state.config.speed,
              accessTime: state.config.accessTime,
            })
          : calculateAscentWindowMs({
              numBins,
              step: card.step || state.step,
              rampFloor: campaignData.ramp?.rampFloor,
              rampPerStep: campaignData.ramp?.rampPerStep,
              schemeChange: card.schemeChange,
              speed: state.config.speed,
              accessTime: state.config.accessTime,
            });

      const remainingMs = Math.max(0, windowMs - elapsedMs);

      // Scoring
      let pointsEarned = 0;
      let newStreak = state.streak;
      let newLives = state.lives;
      let newStrikes = state.stepStrikes;

      if (isCorrect) {
        pointsEarned = calculateCardScore(numBins, remainingMs, windowMs, state.streak);
        newStreak = state.streak + 1;

        // Forgiving mode: +1 life for every 10 consecutive correct in scheme mode
        if (
          state.config.mode === 'scheme' &&
          state.config.lifeRule === 'forgiving' &&
          newStreak > 0 &&
          newStreak % 10 === 0 &&
          newLives < state.maxLives
        ) {
          newLives++;
        }
      } else {
        newStreak = 0;
        newStrikes++;
        if (state.config.play !== 'practice') {
          newLives = Math.max(0, state.lives - 1);
        }
      }

      const bestStreak = Math.max(state.bestStreak, newStreak);
      const newScore = state.score + pointsEarned;
      const newCorrectBooks = new Set(state.correctBooks);
      if (isCorrect) {
        newCorrectBooks.add(card.bookId);
      }

      const logEntry: CardLogEntry = {
        cardIndex: card.index,
        bookId: card.bookId,
        schemeId: card.schemeId,
        binId: chosenBin,
        correct: isCorrect,
        ms: elapsedMs,
        windowMs,
        points: pointsEarned,
        livesAfter: newLives,
      };

      const newLog = [...state.log, logEntry];

      // Handle boomerang requeue in scheme mode
      let newDeck = [...state.deck];
      let requeueCount = state.requeueCount;

      if (!isCorrect && state.config.mode === 'scheme' && newLives > 0) {
        const rng = options?.rng || createRNG(`requeue_${state.cursor}_${card.bookId}`);
        const offset = rng.int(6, 10);
        const insertPos = Math.min(newDeck.length, state.cursor + offset);
        newDeck.splice(insertPos, 0, { ...card });
        requeueCount++;
      }

      // Check step advancement in Ascent
      let newStep = state.step;
      const nextCard = newDeck[state.cursor + 1];
      if (nextCard && nextCard.step && nextCard.step !== state.step) {
        newStep = nextCard.step;

        // Ascent forgiving mode: +1 life at rest stops
        if (
          state.config.mode === 'ascent' &&
          state.config.lifeRule === 'forgiving'
        ) {
          const cfg = campaignData.length[state.config.length || 'full'];
          if (cfg?.restStopsAfterStep?.includes(state.step) && newLives < state.maxLives) {
            newLives++;
          }
        }
      }

      // Check win/loss/completion
      const isOutOfLives = state.config.play !== 'practice' && newLives <= 0;
      const isLastCard = state.cursor + 1 >= newDeck.length;

      let nextStatus: RunState['status'] = 'showing';
      let finalScore = newScore;

      if (isOutOfLives) {
        nextStatus = 'lost';
      } else if (isLastCard) {
        nextStatus = 'finished';

        // Add run completion bonuses
        if (state.config.mode === 'scheme') {
          const strikesUsed = newLog.filter((l) => !l.correct).length;
          finalScore += calculateSchemeRunBonus({
            completed: true,
            livesRemaining: newLives,
            strikesUsed,
          });
        } else {
          finalScore += calculateAscentRunBonus({
            flawlessStepsCount: Math.max(0, newStep - newStrikes),
            reachedSummit: true,
            livesRemaining: newLives,
          });
        }
      } else if (state.config.play === 'practice') {
        nextStatus = 'revealing';
      }

      return {
        ...state,
        deck: newDeck,
        cursor: state.cursor + 1,
        lives: newLives,
        streak: newStreak,
        bestStreak,
        score: finalScore,
        correctBooks: newCorrectBooks,
        log: newLog,
        requeueCount,
        step: newStep,
        stepStrikes: newStrikes,
        status: nextStatus,
        shownAt: undefined,
      };
    }

    case 'REVEAL_DONE':
    case 'RESUME': {
      if (state.status !== 'revealing') return state;
      return {
        ...state,
        status: state.cursor < state.deck.length ? 'showing' : 'finished',
      };
    }

    default:
      return state;
  }
}
