import React, { useState, useEffect } from 'react';
import { BottomSheet } from '../components/ui/BottomSheet';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { LeaveConfirmationModal } from '../components/ui/LeaveConfirmationModal';
import { useSession } from '../engine/session/SessionContext';
import { gameRegistry } from '../engine/registry';
import { useTheme } from '../theme/ThemeContext';
import { LeaderboardEntry } from '../engine/types';
import { Icon, GameBadge } from '../design/icons';

export interface InGameScreenProps {
  onExitGame: () => void;
}

export const InGameScreen: React.FC<InGameScreenProps> = ({ onExitGame }) => {
  const {
    snapshot,
    isHost,
    currentUser,
    players,
    teams,
    dispatchIntent,
    hostNextPhase,
    hostEndGame,
  } = useSession();

  const { soundEnabled, setSoundEnabled, triggerHaptic } = useTheme();

  // BottomSheet states
  const [activeSheet, setActiveSheet] = useState<{
    title: string;
    content: React.ReactNode;
  } | null>(null);

  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const isMultiplayer = players.length > 1;

  // Intercept hardware/browser back button while game is in progress
  useEffect(() => {
    window.history.pushState({ inGame: true }, '');
    const handlePopState = () => {
      setShowLeaveConfirm(true);
      window.history.pushState({ inGame: true }, '');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (!snapshot || !currentUser) {
    return (
      <div className="p-8 text-center flex flex-col gap-4">
        <p>Connecting to game session...</p>
        <Button onClick={onExitGame}>Exit to Menu</Button>
      </div>
    );
  }

  const game = gameRegistry.get(snapshot.gameId);
  if (!game) {
    return (
      <div className="p-8 text-center flex flex-col gap-4">
        <p>Game plugin not found: {snapshot.gameId}</p>
        <Button onClick={onExitGame}>Exit</Button>
      </div>
    );
  }

  const currentPhase = game.phases[snapshot.gameState.phaseIndex] || {
    id: 'unknown',
    name: 'Game in Progress',
  };

  const openRulesSheet = () => {
    triggerHaptic('selection');
    setActiveSheet({
      title: `Rules: ${game.meta.name}`,
      content: (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 p-3 bg-[var(--surface-container)] rounded-2xl">
            <GameBadge game={snapshot.gameId} size={48} variant="tonal" />
            <div>
              <h3 className="font-bold text-sm text-[var(--on-container)]">{game.meta.name}</h3>
              <p className="text-xs text-[var(--on-container-variant)]">{game.meta.tagline}</p>
            </div>
          </div>
          <p className="text-sm font-semibold opacity-85">{game.meta.description}</p>
          <div className="flex flex-col gap-2.5">
            {game.meta.rulesSteps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[var(--surface-container-high)] text-[var(--primary-action)] font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-xs sm:text-sm font-medium">{step}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    });
  };

  const openScoreboardSheet = () => {
    triggerHaptic('selection');
    const leaderboard: LeaderboardEntry[] = game.scoring(snapshot.gameState, players, teams);

    setActiveSheet({
      title: `Scoreboard • Round ${snapshot.gameState.roundNumber}/${snapshot.gameState.totalRounds}`,
      content: (
        <div className="flex flex-col gap-3">
          {leaderboard.map((entry) => (
            <div
              key={entry.id}
              className={`p-3.5 rounded-2xl flex items-center justify-between border ${
                entry.id === currentUser.id
                  ? 'bg-[var(--surface-container-high)] border-[var(--primary-action)]'
                  : 'bg-[var(--surface-container)] border-[var(--border-tint)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-black w-5 text-center">
                  #{entry.rank}
                </span>
                <Avatar name={entry.name} size="sm" />
                <span className="font-bold text-sm truncate">{entry.name}</span>
              </div>
              <span className="font-mono text-base font-black tabular-nums">
                {entry.score} pts
              </span>
            </div>
          ))}
        </div>
      ),
    });
  };

  const openCustomBottomSheet = (config: { title: string; component: React.ReactNode }) => {
    setActiveSheet({
      title: config.title,
      content: config.component,
    });
  };

  const ActiveComponent = isHost ? game.HostView : game.PlayerView;

  return (
    <div className="w-full min-h-screen flex flex-col justify-between select-none">
      {/* Top bar with round back button, game badge, centered phase title, tonal action buttons */}
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-2 flex items-center justify-between border-b border-[var(--border-tint)]/40 bg-[var(--bg-tint)]/80 backdrop-blur-md sticky top-0 z-20">
        <button
          onClick={() => {
            triggerHaptic('light');
            setShowLeaveConfirm(true);
          }}
          className="w-10 h-10 rounded-full bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] text-[var(--on-container)] flex items-center justify-center transition-colors cursor-pointer border border-[var(--border-tint)]/60"
          aria-label="Exit Game"
        >
          <Icon name="arrow-left" size={18} />
        </button>

        {/* Centered Phase Title & Round Badge with GameBadge */}
        <div className="flex items-center gap-2.5">
          <GameBadge game={snapshot.gameId} size={36} variant="tonal" />
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--on-container-variant)]">
              Round {snapshot.gameState.roundNumber} of {snapshot.gameState.totalRounds}
            </span>
            <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-[var(--on-container)]">
              {currentPhase.name}
            </h2>
          </div>
        </div>

        {/* Round tonal action buttons (Rules, Scoreboard) */}
        <div className="flex items-center gap-2">
          <button
            onClick={openRulesSheet}
            className="w-10 h-10 rounded-full bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] text-[var(--on-container)] flex items-center justify-center transition-colors cursor-pointer border border-[var(--border-tint)]/60"
            aria-label="Rules"
            title="Game Rules"
          >
            <Icon name="book-open" size={18} />
          </button>

          <button
            onClick={openScoreboardSheet}
            className="w-10 h-10 rounded-full bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] text-[var(--on-container)] flex items-center justify-center transition-colors cursor-pointer border border-[var(--border-tint)]/60"
            aria-label="Scoreboard"
            title="Live Scoreboard"
          >
            <Icon name="scoreboard" size={18} />
          </button>
        </div>
      </div>

      {/* Main Game Phase Surface */}
      <main className="flex-1 w-full max-w-4xl mx-auto flex flex-col justify-center px-4 sm:px-6 py-4 sm:py-8">
        <ActiveComponent
          state={snapshot.gameState}
          playerId={currentUser.id}
          isHost={isHost}
          player={currentUser}
          players={players}
          teams={teams}
          dispatchIntent={dispatchIntent}
          openBottomSheet={openCustomBottomSheet}
        />
      </main>

      {/* Secondary Actions Row (Hint, Skip, Mute) */}
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 pt-2 flex items-center justify-center gap-2.5">
        <button
          onClick={openRulesSheet}
          className="h-9 px-4 rounded-full bg-[var(--surface-container)] text-xs font-semibold text-[var(--on-container-variant)] hover:bg-[var(--surface-container-high)] flex items-center gap-1.5 transition-colors cursor-pointer border border-[var(--border-tint)]/60"
        >
          <Icon name="help" size={14} />
          <span>Rules</span>
        </button>

        {isHost && (
          <button
            onClick={hostNextPhase}
            className="h-9 px-4 rounded-full bg-[var(--surface-container)] text-xs font-semibold text-[var(--on-container-variant)] hover:bg-[var(--surface-container-high)] flex items-center gap-1.5 transition-colors cursor-pointer border border-[var(--border-tint)]/60"
          >
            <Icon name="skip" size={14} />
            <span>Skip Phase</span>
          </button>
        )}

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="h-9 px-4 rounded-full bg-[var(--surface-container)] text-xs font-semibold text-[var(--on-container-variant)] hover:bg-[var(--surface-container-high)] flex items-center gap-1.5 transition-colors cursor-pointer border border-[var(--border-tint)]/60"
          aria-label={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
        >
          <Icon name={soundEnabled ? 'sound-on' : 'sound-off'} variant={soundEnabled ? 'tonal' : 'line'} size={14} />
          <span>{soundEnabled ? 'Sound' : 'Muted'}</span>
        </button>
      </div>

      {/* BottomSheet for Rules, Scoreboard or Custom Dialogs */}
      <BottomSheet
        isOpen={activeSheet !== null}
        onClose={() => setActiveSheet(null)}
        title={activeSheet?.title}
      >
        {activeSheet?.content}
      </BottomSheet>

      {/* Confirmation modal on exit/back */}
      <LeaveConfirmationModal
        isOpen={showLeaveConfirm}
        isMultiplayer={isMultiplayer}
        onConfirm={() => {
          setShowLeaveConfirm(false);
          onExitGame();
        }}
        onCancel={() => setShowLeaveConfirm(false)}
      />
    </div>
  );
};
