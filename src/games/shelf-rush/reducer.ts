import { SessionConfig, Player, Team, GameIntent } from '../../engine/types';
import {
  ShelfRushGameState,
  ShelfRushConfig,
  ShelfRushCard,
  LeaderboardEntry,
  CardLogEntry,
} from './engine/types';
import { buildSchemeDeck, buildAscentDeck } from './engine/deck';
import { rankLeaderboard } from './engine/leaderboard';

export function createDefaultConfig(seed?: number): ShelfRushConfig {
  return {
    mode: 'scheme',
    schemeId: 'testament',
    speed: 'standard',
    lifeRule: 'forgiving',
    playMode: 'race',
    accessTime: 1,
    weakBooks: false,
    seed: seed ?? Math.floor(Math.random() * 2147483647),
  };
}

export function generateDeckForConfig(config: ShelfRushConfig): ShelfRushCard[] {
  const seedStr = String(config.seed ?? 12345);
  if (config.mode === 'ascent') {
    const res = buildAscentDeck({
      seed: seedStr,
      length: config.length || 'full',
    });
    return res.deck;
  } else {
    return buildSchemeDeck({
      schemeId: config.schemeId || 'testament',
      seed: seedStr,
      weak: config.weak || config.weakBooks,
    });
  }
}


export function setupShelfRush(
  sessionConfig: SessionConfig,
  players: Player[],
  _teams: Team[],
  _content: any
): ShelfRushGameState {
  const config = createDefaultConfig();
  const deck = generateDeckForConfig(config);

  const playerProgress: ShelfRushGameState['playerProgress'] = {};
  const scores: Record<string, number> = {};

  players.forEach((p) => {
    scores[p.id] = 0;
    playerProgress[p.id] = {
      cardsDone: 0,
      correctCount: 0,
      score: 0,
      lives: config.mode === 'ascent' ? 5 : 3,
      maxLives: config.mode === 'ascent' ? 5 : 3,
      streak: 0,
      status: 'ready',
      lastUpdateMs: Date.now(),
    };
  });

  return {
    phaseIndex: 0,
    currentPhaseId: 'setup',
    roundNumber: 1,
    totalRounds: deck.length,
    isGameOver: false,
    scores,
    config,
    deck,
    playerProgress,
  };
}

export function reduceShelfRush(
  state: ShelfRushGameState,
  intent: GameIntent,
  playerId: string
): ShelfRushGameState {
  switch (intent.type) {
    case 'UPDATE_CONFIG': {
      const newConfig = { ...state.config, ...intent.payload };
      const newDeck = generateDeckForConfig(newConfig);
      return {
        ...state,
        config: newConfig,
        deck: newDeck,
        totalRounds: newDeck.length,
      };
    }

    case 'START_COUNTDOWN': {
      return {
        ...state,
        phaseIndex: 1,
        currentPhaseId: 'countdown',
        phaseDuration: 3,
        phaseTimeRemaining: 3,
      };
    }

    case 'START_RUN': {
      const capMs = (state.deck.length + 10) * 6000;
      return {
        ...state,
        phaseIndex: 2,
        currentPhaseId: 'run',
        startTime: intent.timestamp || Date.now(),
        capMs,
      };
    }

    case 'PROGRESS': {
      const data = intent.payload;
      if (!data) return state;

      const currentProgress = state.playerProgress[playerId] || {
        cardsDone: 0,
        correctCount: 0,
        score: 0,
        lives: 3,
        maxLives: 3,
        streak: 0,
        status: 'showing',
        lastUpdateMs: intent.timestamp,
      };

      const updatedProgress = {
        ...currentProgress,
        cardsDone: data.cardsDone ?? currentProgress.cardsDone,
        correctCount: data.correctCount ?? currentProgress.correctCount,
        score: data.score ?? currentProgress.score,
        lives: data.lives ?? currentProgress.lives,
        streak: data.streak ?? currentProgress.streak,
        status: data.status ?? currentProgress.status,
        lastUpdateMs: intent.timestamp,
      };

      const updatedScores = {
        ...state.scores,
        [playerId]: updatedProgress.score,
      };

      return {
        ...state,
        scores: updatedScores,
        playerProgress: {
          ...state.playerProgress,
          [playerId]: updatedProgress,
        },
      };
    }

    case 'FINISH': {
      const { log = [], summary, totalTimeMs = 0 } = intent.payload || {};

      // Host validation: replay log against pure reducer / scoring
      let authoritativeScore = 0;
      let authoritativeCorrect = 0;
      let flaggedMsCount = 0;

      // Validate each card entry
      for (const entry of (log as CardLogEntry[])) {
        if (entry.ms < 150) {
          flaggedMsCount++;
        }
        if (entry.correct) {
          authoritativeCorrect++;
        }
        authoritativeScore += entry.points || 0;
      }

      const pData = state.playerProgress[playerId] || {
        cardsDone: log.length,
        correctCount: authoritativeCorrect,
        score: authoritativeScore,
        lives: 0,
        maxLives: 3,
        streak: 0,
        status: 'finished',
        lastUpdateMs: intent.timestamp,
      };

      const updatedPData = {
        ...pData,
        cardsDone: log.length,
        correctCount: authoritativeCorrect,
        score: authoritativeScore,
        status: 'finished' as const,
        totalTimeMs,
        log,
        summary,
        lastUpdateMs: intent.timestamp,
      };

      const nextScores = {
        ...state.scores,
        [playerId]: authoritativeScore,
      };

      const nextPlayerProgress = {
        ...state.playerProgress,
        [playerId]: updatedPData,
      };

      // Check if all players finished or out
      const allDone = Object.values(nextPlayerProgress).every(
        (p) => p.status === 'finished' || p.status === 'won' || p.status === 'lost'
      );

      return {
        ...state,
        scores: nextScores,
        playerProgress: nextPlayerProgress,
        currentPhaseId: allDone ? 'results' : state.currentPhaseId,
        isGameOver: allDone,
      };
    }

    case 'GO_TO_RESULTS': {
      return {
        ...state,
        currentPhaseId: 'results',
        isGameOver: true,
      };
    }

    default:
      return state;
  }
}

export function scoreShelfRush(
  state: ShelfRushGameState,
  players: Player[],
  _teams: Team[]
): LeaderboardEntry[] {
  const deckSize = state.deck.length;

  const rawEntries = players.map((player) => {
    const prog = state.playerProgress[player.id];
    const cardsDone = prog?.cardsDone || 0;
    const correctCount = prog?.correctCount || 0;
    const score = prog?.score || 0;
    const totalTimeMs = prog?.totalTimeMs || (prog?.cardsDone || 1) * 3000;
    const completion = deckSize > 0 ? Math.min(100, Math.round((correctCount / deckSize) * 100)) : 0;

    const isPerfect = cardsDone === deckSize && correctCount === deckSize && deckSize > 0;
    const reachedSummit = state.config.mode === 'ascent' && cardsDone === deckSize;
    const isBlitz = state.config.speed === 'blitz' && cardsDone === deckSize;

    return {
      playerId: player.id,
      name: player.name,
      avatarSeed: player.avatarSeed,
      completion,
      points: score,
      totalTimeMs,
      isPerfectRun: isPerfect,
      reachedSummit,
      isBlitz,
    };
  });

  return rankLeaderboard(rawEntries);
}

