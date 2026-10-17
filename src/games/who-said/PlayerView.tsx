import React, { useEffect } from 'react';
import { GameViewProps } from '../../engine/types';
import { WhoSaidState, WhoSaidPowerUp } from './types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useTheme } from '../../theme/ThemeContext';
import { Icon } from '@design/icons';

const TIER_THEMES: Record<1 | 2 | 3 | 4, { label: string; badgeClass: string; borderClass: string }> = {
  1: { label: 'Tier 1: Iconic Scripture', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300', borderClass: 'border-emerald-300/40' },
  2: { label: 'Tier 2: Well-Known', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300', borderClass: 'border-amber-300/40' },
  3: { label: 'Tier 3: Mid-Profile Lines', badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300', borderClass: 'border-purple-300/40' },
  4: { label: 'Tier 4: Obscure & Tricky', badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300', borderClass: 'border-rose-300/40' },
};

export const WhoSaidPlayerView: React.FC<GameViewProps<WhoSaidState>> = ({
  state,
  playerId,
  dispatchIntent,
}) => {
  const { triggerHaptic } = useTheme();
  const { currentQuestion, currentPhaseId, playerStates, isCloseCall, firstCorrectPlayerId } = state;
  const pState = playerStates[playerId] || {
    playerId,
    selectedOption: null,
    locked: false,
    lockedAtTime: 0,
    isCorrect: false,
    scoreEarned: 0,
    powerUpActive: null,
    powerUpsUsed: { fifty: false, double: false, shield: false },
    hiddenOptions: [],
    shuffledOptions: currentQuestion.options,
    streakCount: 0,
  };

  const isCountdown = currentPhaseId === 'countdown';
  const isQuestion = currentPhaseId === 'question';
  const isReveal = currentPhaseId === 'reveal';

  const tierInfo = TIER_THEMES[currentQuestion.tier];
  const isFirstCorrect = playerId === firstCorrectPlayerId;

  // Haptic on reveal
  useEffect(() => {
    if (isReveal) {
      triggerHaptic(pState.isCorrect ? 'heavy' : 'medium');
    }
  }, [isReveal, pState.isCorrect, triggerHaptic]);

  const handleSelectSpeaker = (speaker: string) => {
    if (pState.locked || isReveal) return;
    triggerHaptic('medium');
    dispatchIntent('ANSWER', {
      optionSpeaker: speaker,
      elapsedSeconds: Math.max(0, (state.phaseDuration ?? 15) - (state.phaseTimeRemaining ?? 0)),
    });
  };

  const handleUsePowerUp = (type: WhoSaidPowerUp) => {
    if (pState.locked || pState.powerUpsUsed[type] || isReveal) return;
    triggerHaptic('selection');
    dispatchIntent('USE_POWERUP', { type });
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-4 py-2">
      {/* Top Status */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--surface-container)] text-[var(--on-container-variant)]">
            Q {state.roundNumber} / {state.totalQuestions}
          </span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${tierInfo.badgeClass}`}>
            Tier {currentQuestion.tier}
          </span>
        </div>

        {pState.streakCount > 1 && (
          <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-300/30">
            <Icon name="flame" size={14} />
            <span>{pState.streakCount} Streak!</span>
          </div>
        )}
      </div>

      {/* Countdown Phase */}
      {isCountdown && (
        <Card variant="hero" className="text-center py-12 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[var(--primary-action)]/15 flex items-center justify-center text-3xl font-black text-[var(--primary-action)] animate-pulse">
            {state.phaseTimeRemaining ?? 3}
          </div>
          <h2 className="text-2xl font-bold text-[var(--on-container)]">Who Spoke It?</h2>
          <p className="text-sm text-[var(--on-container-variant)]">
            Get your fingers ready. First correct answer triggers Close Call!
          </p>
        </Card>
      )}

      {/* Question Active Phase */}
      {isQuestion && (
        <div className="flex flex-col gap-4">
          <Card variant="hero" className={`text-center py-6 px-4 flex flex-col items-center gap-3 ${tierInfo.borderClass}`}>
            <span className="px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--primary-action)]/15 text-[var(--primary-action)]">
              Who said these words?
            </span>

            <blockquote className="text-xl sm:text-2xl font-serif font-bold text-[var(--on-container)] leading-snug my-1">
              "{currentQuestion.quote}"
            </blockquote>

            {/* Timer bar */}
            <div className="w-full max-w-xs mt-1">
              <div className="flex justify-between text-xs text-[var(--on-container-variant)] mb-1">
                <span className={isCloseCall ? 'font-bold text-amber-600 animate-pulse' : ''}>
                  {isCloseCall ? '⚡ CLOSE CALL!' : 'Time Remaining'}
                </span>
                <span className="font-mono font-bold">{state.phaseTimeRemaining}s</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--surface-container)] overflow-hidden">
                <div
                  key={`${state.currentIndex}-${state.phaseDuration}-${isCloseCall}`}
                  className={`h-full origin-left rounded-full ${
                    isCloseCall ? 'bg-amber-500 animate-pulse' : 'bg-[var(--primary-action)]'
                  }`}
                  style={{
                    animation: `analogTimerDrain ${state.phaseTimeRemaining ?? state.phaseDuration ?? 15}s linear forwards`,
                    animationPlayState: pState.locked ? 'paused' : 'running',
                  }}
                />
              </div>
            </div>

            {/* Power-up Chips */}
            {!pState.locked && (
              <div className="flex items-center gap-2 mt-2">
                {/* 50:50 */}
                <button
                  type="button"
                  disabled={pState.powerUpsUsed.fifty}
                  onClick={() => handleUsePowerUp('fifty')}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-all flex items-center gap-1 ${
                    pState.powerUpActive === 'fifty'
                      ? 'bg-purple-500 text-white border-purple-500'
                      : pState.powerUpsUsed.fifty
                      ? 'opacity-30 border-[var(--border-tint)] cursor-not-allowed line-through'
                      : 'bg-[var(--surface-card)] border-[var(--border-tint)] hover:bg-[var(--surface-container)]'
                  }`}
                >
                  <Icon name="fifty" size={14} />
                  <span>50:50</span>
                </button>

                {/* Double Down */}
                <button
                  type="button"
                  disabled={pState.powerUpsUsed.double}
                  onClick={() => handleUsePowerUp('double')}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-all flex items-center gap-1 ${
                    pState.powerUpActive === 'double'
                      ? 'bg-amber-500 text-white border-amber-500'
                      : pState.powerUpsUsed.double
                      ? 'opacity-30 border-[var(--border-tint)] cursor-not-allowed line-through'
                      : 'bg-[var(--surface-card)] border-[var(--border-tint)] hover:bg-[var(--surface-container)]'
                  }`}
                >
                  <Icon name="double" size={14} />
                  <span>Double (x2)</span>
                </button>

                {/* Shield */}
                <button
                  type="button"
                  disabled={pState.powerUpsUsed.shield}
                  onClick={() => handleUsePowerUp('shield')}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-all flex items-center gap-1 ${
                    pState.powerUpActive === 'shield'
                      ? 'bg-blue-500 text-white border-blue-500'
                      : pState.powerUpsUsed.shield
                      ? 'opacity-30 border-[var(--border-tint)] cursor-not-allowed line-through'
                      : 'bg-[var(--surface-card)] border-[var(--border-tint)] hover:bg-[var(--surface-container)]'
                  }`}
                >
                  <Icon name="shield" size={14} />
                  <span>Shield</span>
                </button>
              </div>
            )}
          </Card>

          {/* 4 Speaker Answer Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {pState.shuffledOptions.map((speaker) => {
              const isHidden = pState.hiddenOptions.includes(speaker);
              const isSelected = pState.selectedOption === speaker;

              if (isHidden) {
                return (
                  <div
                    key={speaker}
                    className="p-4 rounded-3xl border border-dashed border-[var(--border-tint)] bg-[var(--surface-container)]/30 opacity-30 flex items-center justify-center text-xs italic"
                  >
                    Removed by 50:50
                  </div>
                );
              }

              return (
                <button
                  key={speaker}
                  type="button"
                  disabled={pState.locked}
                  onClick={() => handleSelectSpeaker(speaker)}
                  className={`w-full p-4 rounded-3xl border-2 flex items-center justify-between transition-all ${
                    isSelected
                      ? 'border-[var(--primary-action)] bg-[var(--primary-action)]/10 font-bold shadow-md scale-[1.01]'
                      : 'border-[var(--border-tint)] bg-[var(--surface-card)] hover:bg-[var(--surface-container)] font-semibold'
                  } ${pState.locked ? 'opacity-80 cursor-not-allowed' : 'active:scale-98'}`}
                >
                  <span className="text-base sm:text-lg text-[var(--on-container)] text-left">{speaker}</span>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-[var(--primary-action)] text-[var(--primary-action-text)] flex items-center justify-center text-xs font-bold">
                      <Icon name="check" size={12} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {pState.locked && (
            <div className="p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-center flex items-center justify-center gap-2 text-emerald-800 dark:text-emerald-200 font-bold">
              <Icon name="lock" size={18} />
              <span>Locked in! Waiting for time up...</span>
            </div>
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

            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-[var(--on-container)]">
                {pState.isCorrect ? 'Spot On!' : 'Incorrect!'}
              </h2>
              {isFirstCorrect && (
                <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-400 text-amber-950">
                  ⚡ First Correct! (+20%)
                </span>
              )}
            </div>

            <div className="text-sm font-semibold">
              {pState.scoreEarned > 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">
                  +{pState.scoreEarned} points
                </span>
              ) : pState.scoreEarned < 0 ? (
                <span className="text-rose-600 dark:text-rose-400 font-bold text-lg">
                  {pState.scoreEarned} penalty
                </span>
              ) : (
                <span className="text-[var(--on-container-variant)]">0 points this round</span>
              )}
            </div>
          </div>

          {/* Correct Speaker & Reference */}
          <div className="w-full p-4 rounded-3xl bg-[var(--surface-container)] flex flex-col items-center gap-1">
            <span className="text-xs uppercase font-bold text-[var(--on-container-variant)]">
              Biblical Speaker
            </span>
            <span className="text-2xl font-black text-[var(--primary-action)]">
              {currentQuestion.answer}
            </span>
            <div className="text-xs font-semibold text-[var(--on-container)] mt-1 flex items-center gap-1">
              <Icon name="book-open" size={14} />
              <span>{currentQuestion.ref}</span>
            </div>
            <p className="text-xs text-[var(--on-container-variant)] mt-1 italic">
              {currentQuestion.note}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
