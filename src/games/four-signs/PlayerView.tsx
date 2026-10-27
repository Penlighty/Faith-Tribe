import React from 'react';
import { GameViewProps } from '../../engine/types';
import { FourSignsState, FourSignsPowerUp } from './types';
import { FourSignClueCard } from './icons';
import { useTheme } from '../../theme/ThemeContext';
import { CheckCircle2, XCircle, Flame, Clock, Sparkles } from 'lucide-react';
import { Icon } from '../../design/icons';

export const FourSignsPlayerView: React.FC<GameViewProps<FourSignsState>> = ({
  state: gameState,
  playerId,
  dispatchIntent,
}) => {
  const { triggerHaptic } = useTheme();
  const { currentPuzzle, currentPhaseId, phaseTimeRemaining = 0, isCloseCall, playerStates } = gameState;
  const pState = playerStates[playerId];

  const isReveal = currentPhaseId === 'reveal';
  const isLocked = pState?.locked;
  const selectedOption = pState?.selectedOption;
  const options = pState?.shuffledOptions || [currentPuzzle.answer, ...currentPuzzle.distractors];
  const hiddenOptions = new Set(pState?.hiddenOptions || []);

  const handleSelectOption = (opt: string) => {
    if (isLocked || isReveal) return;
    triggerHaptic('selection');
    dispatchIntent('ANSWER', { option: opt });
  };

  const handleUsePowerUp = (type: FourSignsPowerUp) => {
    if (isLocked || isReveal || pState?.powerUpsUsed?.[type]) return;
    triggerHaptic('medium');
    dispatchIntent('USE_POWERUP', { type });
  };

  // Clues phase
  if (!isReveal) {
    return (
      <div className="w-full max-w-lg mx-auto flex flex-col gap-4 p-3 sm:p-5 select-none animate-fadeIn">
        {/* Top bar: Category + Timer */}
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            {currentPuzzle.category}
          </span>
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-sm font-black ${
              isCloseCall || phaseTimeRemaining <= 5
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-[var(--surface-container-high)] text-[var(--on-container)]'
            }`}
          >
            <Clock size={14} />
            <span>{phaseTimeRemaining}s</span>
          </div>
        </div>

        {/* Close Call Banner */}
        {isCloseCall && (
          <div className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 text-white text-center font-black text-xs uppercase tracking-wider animate-bounce shadow-md flex items-center justify-center gap-1.5">
            <Icon name="bolt" size={14} />
            <span>5 SECONDS LEFT — LOCK IN!</span>
            <Icon name="bolt" size={14} />
          </div>
        )}

        {/* 4 Signs Mobile Clue Cards */}
        <div className="grid grid-cols-2 gap-2 my-1">
          {currentPuzzle.clues.map((clue, idx) => (
            <FourSignClueCard
              key={idx}
              clue={clue}
              index={idx}
              revealed={true}
              size="sm"
            />
          ))}
        </div>

        {/* Powerups Cluster (e.g. 50/50) */}
        {!isLocked && (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => handleUsePowerUp('fifty')}
              disabled={pState?.powerUpsUsed?.fifty}
              className={`px-3 py-1 rounded-full text-xs font-black transition-all flex items-center gap-1 border ${
                pState?.powerUpsUsed?.fifty
                  ? 'opacity-40 bg-[var(--surface-container)] border-transparent cursor-not-allowed'
                  : 'bg-amber-500/20 border-amber-500/40 text-amber-700 dark:text-amber-300 active:scale-95 cursor-pointer shadow-sm'
              }`}
            >
              <Sparkles size={12} /> 50:50
            </button>
          </div>
        )}

        {/* Options Buttons */}
        {!isLocked ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-1">
            {options.map((opt) => {
              const isHidden = hiddenOptions.has(opt);
              if (isHidden) {
                return (
                  <div
                    key={opt}
                    className="p-3.5 rounded-2xl border border-dashed border-[var(--border-tint)]/40 bg-[var(--surface-container)]/40 opacity-30 text-center font-bold text-sm text-[var(--on-container-variant)]"
                  >
                    —
                  </div>
                );
              }
              return (
                <button
                  key={opt}
                  onClick={() => handleSelectOption(opt)}
                  className="w-full p-4 rounded-2xl bg-[var(--surface-card)] hover:bg-[var(--surface-container-high)] active:scale-98 border-2 border-[var(--border-tint)] hover:border-amber-500/60 font-extrabold text-base sm:text-lg text-[var(--on-container)] text-center transition-all shadow-sm cursor-pointer"
                >
                  {opt}
                </button>
              );
            })}
          </div>
        ) : (
          /* Locked State View */
          <div className="p-6 rounded-3xl bg-[var(--surface-container)] border-2 border-amber-500/40 text-center flex flex-col items-center gap-3 shadow-md animate-fadeIn mt-2">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center animate-pulse">
              <CheckCircle2 size={28} />
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-[var(--on-container-variant)]">
              Locked In
            </span>
            <h2 className="text-2xl font-black text-[var(--on-container)]">
              {selectedOption}
            </h2>
            <p className="text-xs font-semibold text-[var(--on-container-variant)] opacity-80">
              Waiting for other players to submit...
            </p>
          </div>
        )}
      </div>
    );
  }

  // Reveal Phase
  const isCorrect = pState?.isCorrect;
  const scoreEarned = pState?.scoreEarned || 0;
  const streak = pState?.streakCount || 0;

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-5 p-4 sm:p-6 select-none animate-fadeIn">
      {/* Result Status Card */}
      <div
        className={`p-6 rounded-3xl text-center flex flex-col items-center gap-3 shadow-lg border-2 ${
          isCorrect
            ? 'bg-gradient-to-b from-emerald-500/20 to-[var(--surface-card)] border-emerald-500/50 text-emerald-900 dark:text-emerald-100'
            : 'bg-gradient-to-b from-rose-500/20 to-[var(--surface-card)] border-rose-500/50 text-rose-900 dark:text-rose-100'
        }`}
      >
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center ${
            isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
          }`}
        >
          {isCorrect ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
        </div>

        <h1 className="text-2xl font-black tracking-tight">
          {isCorrect ? 'Correct!' : 'Not Quite!'}
        </h1>

        <div className="flex items-center gap-2 font-mono text-xl font-black">
          {isCorrect ? (
            <span className="text-emerald-600 dark:text-emerald-400">+{scoreEarned} pts</span>
          ) : (
            <span className="text-rose-600 dark:text-rose-400">+0 pts</span>
          )}
        </div>

        {streak >= 3 && isCorrect && (
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-black">
            <Flame size={14} /> {streak} streak!
          </div>
        )}
      </div>

      {/* Answer & Explanation */}
      <div className="p-4 rounded-2xl bg-[var(--surface-container)] border border-[var(--border-tint)] flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase text-[var(--on-container-variant)]">
            Correct Answer
          </span>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <Icon name="book-open" size={12} />
            <span>{currentPuzzle.ref}</span>
          </span>
        </div>
        <div className="text-lg font-black text-[var(--on-container)]">
          {currentPuzzle.answer}
        </div>
        <p className="text-xs font-medium text-[var(--on-container-variant)] italic">
          “{currentPuzzle.why}”
        </p>
      </div>

      {/* Total Score */}
      <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-tint)] font-bold text-sm">
        <span className="text-[var(--on-container-variant)]">Your Total Score</span>
        <span className="font-mono text-base font-black text-[var(--on-container)]">
          {gameState.scores[playerId] || 0} pts
        </span>
      </div>
    </div>
  );
};
