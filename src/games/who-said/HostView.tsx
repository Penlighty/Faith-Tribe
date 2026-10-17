import React from 'react';
import { GameViewProps } from '../../engine/types';
import { WhoSaidState } from './types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Icon } from '@design/icons';

const TIER_THEMES: Record<1 | 2 | 3 | 4, { label: string; badgeClass: string; borderClass: string }> = {
  1: { label: 'Tier 1: Iconic Scripture', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300', borderClass: 'border-emerald-300/40' },
  2: { label: 'Tier 2: Well-Known Passages', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300', borderClass: 'border-amber-300/40' },
  3: { label: 'Tier 3: Mid-Profile Lines', badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300', borderClass: 'border-purple-300/40' },
  4: { label: 'Tier 4: Obscure & Tricky', badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300', borderClass: 'border-rose-300/40' },
};

export const WhoSaidHostView: React.FC<GameViewProps<WhoSaidState>> = ({
  state,
  players,
  dispatchIntent,
}) => {
  const { currentQuestion, currentPhaseId, playerStates, isCloseCall, firstCorrectPlayerId } = state;
  const tierInfo = TIER_THEMES[currentQuestion.tier];

  const totalPlayers = players.length;
  const lockedCount = Object.values(playerStates).filter((p) => p.locked).length;

  const isCountdown = currentPhaseId === 'countdown';
  const isQuestion = currentPhaseId === 'question';
  const isReveal = currentPhaseId === 'reveal';

  const firstCorrectPlayer = players.find((p) => p.id === firstCorrectPlayerId);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 py-4">
      {/* Top Banner */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--surface-container)] text-[var(--on-container-variant)]">
            Question {state.roundNumber} of {state.totalQuestions}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tierInfo.badgeClass}`}>
            {tierInfo.label}
          </span>
        </div>

        {isQuestion && (
          <div className="flex items-center gap-2 text-sm font-medium text-[var(--on-container-variant)]">
            <Icon name="team" size={16} />
            <span>{lockedCount} / {totalPlayers} Answered</span>
          </div>
        )}
      </div>

      {/* Countdown Phase */}
      {isCountdown && (
        <Card variant="hero" className="text-center py-12 flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[var(--primary-action)]/15 flex items-center justify-center text-3xl font-black text-[var(--primary-action)] animate-pulse">
            {state.phaseTimeRemaining ?? 3}
          </div>
          <h2 className="text-2xl font-bold text-[var(--on-container)]">Who Said That?</h2>
          <p className="text-sm text-[var(--on-container-variant)] max-w-md">
            Identify the biblical speaker quickly! The faster you lock in, the more points you earn.
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={() => dispatchIntent('START_QUESTION')}
            className="mt-2"
          >
            Start Question
          </Button>
        </Card>
      )}

      {/* Question Phase */}
      {isQuestion && (
        <div className="flex flex-col gap-6">
          <Card variant="hero" className={`text-center py-10 px-6 flex flex-col items-center gap-4 ${tierInfo.borderClass}`}>
            <span className="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--primary-action)]/15 text-[var(--primary-action)]">
              Direct Scripture Speech
            </span>

            <blockquote className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[var(--on-container)] leading-snug max-w-2xl my-2">
              "{currentQuestion.quote}"
            </blockquote>

            {/* Wavy Timer */}
            <div className="w-full max-w-md mt-2">
              <div className="flex justify-between text-xs text-[var(--on-container-variant)] mb-1">
                <span>{isCloseCall ? '⚡ CLOSE CALL!' : 'Time Remaining'}</span>
                <span className="font-mono font-bold">{state.phaseTimeRemaining}s</span>
              </div>
              <div className="w-full h-3 rounded-full bg-[var(--surface-container)] overflow-hidden">
                <div
                  key={`${state.currentIndex}-${state.phaseDuration}-${isCloseCall}`}
                  className={`h-full origin-left rounded-full ${
                    isCloseCall ? 'bg-amber-500 animate-pulse' : 'bg-[var(--primary-action)]'
                  }`}
                  style={{
                    animation: `analogTimerDrain ${state.phaseTimeRemaining ?? state.phaseDuration ?? 15}s linear forwards`,
                  }}
                />
              </div>
            </div>

            {/* Close Call Banner */}
            {isCloseCall && firstCorrectPlayer && (
              <div className="p-3 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 animate-bounce">
                <Icon name="bolt" size={18} className="text-amber-600" />
                <span>
                  {firstCorrectPlayer.name} locked the first correct answer! 5-second scramble!
                </span>
              </div>
            )}
          </Card>

          {/* Player lock status pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {players.map((p) => {
              const pState = playerStates[p.id];
              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-3 rounded-2xl text-sm border transition-all ${
                    pState?.locked
                      ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-700 font-semibold'
                      : 'bg-[var(--surface-card)] border-[var(--border-tint)] opacity-70'
                  }`}
                >
                  <span className="truncate">{p.name}</span>
                  {pState?.locked ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200">
                      Locked
                    </span>
                  ) : (
                    <span className="text-xs text-[var(--on-container-variant)]">Thinking...</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end">
            <Button
              variant="tonal"
              size="sm"
              onClick={() => dispatchIntent('TRIGGER_REVEAL')}
            >
              Skip to Reveal
            </Button>
          </div>
        </div>
      )}

      {/* Reveal Phase */}
      {isReveal && (
        <div className="flex flex-col gap-6">
          <Card variant="hero" className="text-center py-8 px-6 flex flex-col items-center gap-4">
            <blockquote className="text-xl sm:text-2xl font-serif italic text-[var(--on-container)] max-w-xl">
              "{currentQuestion.quote}"
            </blockquote>

            {/* Answer Speaker */}
            <div className="my-2">
              <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-2xl font-black bg-[var(--primary-action)] text-[var(--primary-action-text)] shadow-lg shadow-[var(--primary-action)]/20">
                <Icon name="check" size={28} />
                Spoken by: {currentQuestion.answer}
              </span>
            </div>

            {/* Scripture Reference and Context Note */}
            <div className="p-4 rounded-2xl bg-[var(--surface-container)] max-w-lg w-full text-center">
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--primary-action)] mb-1 flex items-center justify-center gap-1">
                <Icon name="book-open" size={14} /> {currentQuestion.ref}
              </div>
              <p className="text-sm text-[var(--on-container)] font-medium">
                {currentQuestion.note}
              </p>
            </div>
          </Card>

          {/* Breakdown of player responses & speed */}
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-bold text-[var(--on-container)] px-1">
              Round Performance
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {players.map((p) => {
                const pState = playerStates[p.id];
                const isFirst = p.id === firstCorrectPlayerId;
                return (
                  <div
                    key={p.id}
                    className="p-3 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-tint)] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {pState?.isCorrect ? (
                        <Icon name="check" size={18} className="text-emerald-500" />
                      ) : (
                        <Icon name="close" size={18} className="text-rose-500" />
                      )}
                      <div>
                        <div className="text-sm font-bold text-[var(--on-container)] flex items-center gap-1">
                          <span>{p.name}</span>
                          {isFirst && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-amber-400 text-amber-950">
                              ⚡ 1st
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[var(--on-container-variant)]">
                          {pState?.selectedOption ? `Guessed: ${pState.selectedOption}` : 'No answer'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-sm font-black ${
                        (pState?.scoreEarned ?? 0) > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {(pState?.scoreEarned ?? 0) >= 0 ? `+${pState?.scoreEarned}` : pState?.scoreEarned} pts
                      </div>
                      <div className="text-[10px] text-[var(--on-container-variant)]">
                        {pState?.lockedAtTime ? `${pState.lockedAtTime.toFixed(1)}s` : '-'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              variant="primary"
              size="lg"
              className="gap-2"
              onClick={() => dispatchIntent('NEXT_QUESTION')}
            >
              <span>Next Question</span>
              <Icon name="arrow-right" size={20} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
