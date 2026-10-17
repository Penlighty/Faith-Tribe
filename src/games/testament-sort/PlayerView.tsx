import React, { useEffect } from 'react';
import { GameViewProps } from '../../engine/types';
import { TestamentSortState, TestamentChoice } from './types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useTheme } from '../../theme/ThemeContext';
import { Icon } from '@design/icons';

const TIER_THEMES: Record<1 | 2 | 3 | 4, { label: string; badgeClass: string; bgClass: string }> = {
  1: { label: 'Tier 1: Famous Names', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300', bgClass: 'border-emerald-300/40' },
  2: { label: 'Tier 2: Well-Known', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300', bgClass: 'border-amber-300/40' },
  3: { label: 'Tier 3: Namesakes & Cross-Over', badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300', bgClass: 'border-purple-300/40' },
  4: { label: 'Tier 4: Deep Genealogies & Traps', badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300', bgClass: 'border-rose-300/40' },
};

export const TestamentSortPlayerView: React.FC<GameViewProps<TestamentSortState>> = ({
  state,
  playerId,
  dispatchIntent,
}) => {
  const { triggerHaptic } = useTheme();
  const { currentCard, currentPhaseId, playerCardStates, roundTally } = state;
  const pState = playerCardStates[playerId] || {
    playerId,
    selectedChoice: null,
    locked: false,
    lockedAtTime: 0,
    hintUsed: false,
    scoreEarned: 0,
    isCorrect: false,
    streakCount: 0,
  };

  const isCountdown = currentPhaseId === 'countdown';
  const isCard = currentPhaseId === 'card';
  const isHuddle = currentPhaseId === 'huddle';
  const isReveal = currentPhaseId === 'reveal';

  const tierInfo = TIER_THEMES[currentCard.tier];

  // Haptic on reveal
  useEffect(() => {
    if (isReveal) {
      triggerHaptic(pState.isCorrect ? 'heavy' : 'medium');
    }
  }, [isReveal, pState.isCorrect, triggerHaptic]);

  const handleSelectChoice = (choice: TestamentChoice) => {
    if (pState.locked || isReveal) return;
    triggerHaptic('selection');
    dispatchIntent('PICK', { choice });
  };

  const handleLockChoice = () => {
    if (!pState.selectedChoice || pState.locked || isReveal) return;
    triggerHaptic('medium');
    dispatchIntent('LOCK');
  };

  const handleUseHint = () => {
    if (pState.hintUsed || pState.locked || isReveal) return;
    triggerHaptic('light');
    dispatchIntent('USE_HINT');
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-5 py-2">
      {/* Top Status */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--surface-container)] text-[var(--on-container-variant)]">
            Card {state.roundNumber} / {state.totalRounds}
          </span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${tierInfo.badgeClass}`}>
            Tier {currentCard.tier}
          </span>
        </div>

        {pState.streakCount > 1 && (
          <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-300/30">
            <Icon name="flame" size={14} />
            <span>{pState.streakCount} Streak!</span>
          </div>
        )}
      </div>

      {/* Countdown View */}
      {isCountdown && (
        <Card variant="hero" className="text-center py-12 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[var(--primary-action)]/15 flex items-center justify-center text-3xl font-black text-[var(--primary-action)] animate-pulse">
            {state.phaseTimeRemaining ?? 3}
          </div>
          <h2 className="text-2xl font-bold text-[var(--on-container)]">Get Ready!</h2>
          <p className="text-sm text-[var(--on-container-variant)]">
            Next up: a <span className="font-semibold">{currentCard.type}</span> from Scripture
          </p>
        </Card>
      )}

      {/* Card & Huddle Playing View */}
      {(isCard || isHuddle) && (
        <div className="flex flex-col gap-4">
          <Card variant="hero" className={`text-center py-6 px-4 flex flex-col items-center gap-3 ${tierInfo.bgClass}`}>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--primary-action)]/15 text-[var(--primary-action)] flex items-center gap-1.5">
                <Icon name={currentCard.type === 'person' ? 'person' : currentCard.type === 'place' ? 'place' : 'thing'} size={14} />
                {currentCard.type}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-[var(--on-container)] tracking-tight">
              {currentCard.name}
            </h1>

            {/* Timer bar */}
            <div className="w-full max-w-xs mt-2">
              <div className="flex justify-between text-xs text-[var(--on-container-variant)] mb-1">
                <span>Timer</span>
                <span className="font-mono font-bold">{state.phaseTimeRemaining}s</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--surface-container)] overflow-hidden">
                <div
                  key={`${state.currentIndex}-${state.phaseDuration}`}
                  className="h-full bg-[var(--primary-action)] origin-left rounded-full"
                  style={{
                    animation: `analogTimerDrain ${state.phaseDuration ?? 12}s linear forwards`,
                    animationPlayState: pState.locked ? 'paused' : 'running',
                  }}
                />
              </div>
            </div>

            {/* Hint Box or Hint Trigger Button */}
            {pState.hintUsed ? (
              <div className="w-full p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/40 text-amber-900 dark:text-amber-200 text-xs text-left animate-fadeIn">
                <div className="flex items-center gap-1 font-bold mb-1">
                  <Icon name="hint" size={14} /> Clue
                </div>
                <p>{currentCard.hint}</p>
              </div>
            ) : (
              !pState.locked && (
                <button
                  type="button"
                  onClick={handleUseHint}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[var(--surface-container)] text-[var(--on-container-variant)] hover:bg-[var(--surface-container-high)] border border-[var(--border-tint)] transition-all"
                >
                  <Icon name="hint" size={14} className="text-amber-500" />
                  <span>Reveal Hint (-40% pts)</span>
                </button>
              )
            )}
          </Card>

          {/* Three Choice Pill Buttons: Old on Left, Both in Middle, New on Right */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3.5">
            {(['OT', 'BOTH', 'NT'] as TestamentChoice[]).map((choice) => {
              const isSelected = pState.selectedChoice === choice;
              let label = 'Old';
              let sub = 'Testament';
              let iconName: 'ot' | 'both' | 'nt' = 'ot';
              if (choice === 'NT') {
                label = 'New';
                sub = 'Testament';
                iconName = 'nt';
              } else if (choice === 'BOTH') {
                label = 'Both';
                sub = 'Testaments';
                iconName = 'both';
              }

              return (
                <button
                  key={choice}
                  type="button"
                  disabled={pState.locked}
                  onClick={() => handleSelectChoice(choice)}
                  className={`w-full p-3 sm:p-5 rounded-2xl sm:rounded-3xl border-2 flex flex-col items-center justify-center text-center transition-all ${
                    isSelected
                      ? 'border-[var(--primary-action)] bg-[var(--primary-action)]/15 shadow-md scale-[1.02] ring-2 ring-[var(--primary-action)]/30'
                      : 'border-[var(--border-tint)] bg-[var(--surface-card)] hover:bg-[var(--surface-container)]'
                  } ${pState.locked ? 'opacity-80 cursor-not-allowed' : 'active:scale-95 cursor-pointer'}`}
                >
                  <Icon name={iconName} size={28} className="mb-1" />
                  <span className="text-base sm:text-xl font-black text-[var(--on-container)]">{label}</span>
                  <span className="text-[11px] sm:text-xs text-[var(--on-container-variant)]">{sub}</span>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-[var(--primary-action)] text-[var(--primary-action-text)] flex items-center justify-center font-bold text-xs mt-1 shadow-sm">
                      <Icon name="check" size={14} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Lock Button or Locked Confirmation */}
          {pState.locked ? (
            <div className="p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-center flex items-center justify-center gap-2 text-emerald-800 dark:text-emerald-200 font-bold">
              <Icon name="lock" size={18} />
              <span>Locked in! Waiting for round reveal...</span>
            </div>
          ) : (
            <Button
              variant="primary"
              size="lg"
              disabled={!pState.selectedChoice}
              onClick={handleLockChoice}
              className="w-full gap-2 text-base font-bold"
            >
              <Icon name="lock" size={18} />
              <span>Lock In Answer</span>
            </Button>
          )}
        </div>
      )}

      {/* Reveal Phase */}
      {isReveal && (
        <Card variant="hero" className="text-center py-6 px-4 flex flex-col items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            {pState.isCorrect ? (
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
                <Icon name="check" size={36} />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 flex items-center justify-center">
                <Icon name="close" size={36} />
              </div>
            )}

            <h2 className="text-2xl font-black text-[var(--on-container)]">
              {pState.isCorrect ? 'Correct!' : 'Not Quite!'}
            </h2>

            <div className="text-sm font-semibold text-[var(--on-container-variant)]">
              {pState.isCorrect ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  +{pState.scoreEarned} points earned
                </span>
              ) : (
                <span>{pState.scoreEarned < 0 ? `${pState.scoreEarned} points (Risk Mode)` : '0 points this card'}</span>
              )}
            </div>
          </div>

          {/* Correct Answer Pill */}
          <div className="w-full p-4 rounded-3xl bg-[var(--surface-container)] flex flex-col items-center gap-1">
            <span className="text-xs uppercase font-bold text-[var(--on-container-variant)]">
              Correct Testament
            </span>
            <span className="text-2xl font-black text-[var(--primary-action)]">
              {currentCard.answer === 'OT' && 'Old Testament'}
              {currentCard.answer === 'NT' && 'New Testament'}
              {currentCard.answer === 'BOTH' && 'Both Testaments'}
            </span>
            <div className="text-xs font-semibold text-[var(--on-container)] mt-1 flex items-center gap-1">
              <Icon name="book-open" size={14} />
              <span>{currentCard.refs}</span>
            </div>
            {currentCard.note && (
              <p className="text-xs text-[var(--on-container-variant)] mt-1 italic">
                {currentCard.note}
              </p>
            )}
          </div>

          {/* Room Vote Tally */}
          <div className="w-full p-3 rounded-2xl bg-[var(--surface-container-high)] text-xs">
            <span className="font-semibold text-[var(--on-container-variant)]">Room Results: </span>
            <span className="font-bold text-[var(--on-container)]">
              OT ({roundTally.OT}) · NT ({roundTally.NT}) · Both ({roundTally.BOTH})
            </span>
          </div>
        </Card>
      )}
    </div>
  );
};
