import React from 'react';
import { GameViewProps } from '../../engine/types';
import { ShelfRushGameState } from './engine/types';
import { ConfigSheet } from './components/ConfigSheet';
import { Lanes, PlayerLaneData } from './components/Lanes';
import { ResultsView } from './components/ResultsView';
import { scoreShelfRush } from './reducer';

export const ShelfRushHostView: React.FC<GameViewProps<ShelfRushGameState>> = ({
  state,
  playerId,
  players,
  teams,
  dispatchIntent,
}) => {
  const currentPhase = state.currentPhaseId || 'setup';

  // 1. SETUP PHASE
  if (currentPhase === 'setup') {
    return (
      <div className="w-full min-h-[80vh] flex items-center justify-center p-3">
        <ConfigSheet
          initialConfig={state.config}
          isHost={true}
          isGuest={false}
          onStart={(newConfig) => {
            dispatchIntent('UPDATE_CONFIG', newConfig);
            dispatchIntent('START_COUNTDOWN');
          }}
        />
      </div>
    );
  }

  // 2. COUNTDOWN PHASE
  if (currentPhase === 'countdown') {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center text-center p-4">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400 mb-2">
          Syncing Players...
        </span>
        <div className="text-8xl font-black font-mono text-purple-600 dark:text-purple-300 animate-pulse">
          3
        </div>
      </div>
    );
  }

  // 3. RUN / COLLECT PHASE
  if (currentPhase === 'run' || currentPhase === 'collect') {
    const totalCards = state.deck.length;

    // Map players to lane data
    const laneData: PlayerLaneData[] = players.map((p) => {
      const prog = state.playerProgress[p.id];
      return {
        playerId: p.id,
        name: p.name,
        tribeId: p.tribeId,
        avatarSeed: p.avatarSeed,
        cardsDone: prog?.cardsDone || 0,
        totalCards,
        correctCount: prog?.correctCount || 0,
        score: prog?.score || 0,
        lives: prog?.lives ?? 3,
        maxLives: prog?.maxLives ?? 3,
        streak: prog?.streak || 0,
        status: prog?.status || 'showing',
      };
    });

    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 py-4 px-3 select-none">
        <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--surface-container)] border border-[var(--border-tint)]">
          <div>
            <span className="text-xs font-mono font-bold uppercase text-purple-600 dark:text-purple-400">
              Shelf Rush Race Host
            </span>
            <h2 className="text-xl font-black">Live Room Race</h2>
          </div>
          <button
            onClick={() => dispatchIntent('GO_TO_RESULTS')}
            className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors shadow-sm"
          >
            End Race & View Results
          </button>
        </div>

        {/* Live Race Lanes */}
        <Lanes lanes={laneData} totalCards={totalCards} />
      </div>
    );
  }

  // 4. RESULTS PHASE
  const leaderboard = scoreShelfRush(state, players, teams);
  return (
    <div className="w-full max-w-2xl mx-auto py-4 px-3 select-none">
      <ResultsView
        score={state.scores[playerId] || 0}
        status="finished"
        config={state.config}
        log={state.playerProgress[playerId]?.log || []}
        bestStreak={state.playerProgress[playerId]?.streak || 0}
        totalCards={state.deck.length}
        cardsCompleted={state.playerProgress[playerId]?.cardsDone || 0}
        leaderboard={leaderboard.map((l) => ({
          playerId: l.playerId,
          name: l.name,
          score: l.score,
          completionPct: l.completion,
          totalTimeMs: l.totalTimeMs,
          rank: l.rank,
          badges: l.badges,
        }))}
        myPlayerId={playerId}
        onPlayAgain={() => {
          const nextSeed = Math.floor(Math.random() * 2147483647);
          dispatchIntent('UPDATE_CONFIG', { ...state.config, seed: nextSeed });
          dispatchIntent('START_COUNTDOWN');
        }}
        onChangeSettings={() => {
          dispatchIntent('UPDATE_CONFIG', { ...state.config });
        }}
        onDone={() => {
          // Handled by room session exit
        }}
      />
    </div>
  );
};
