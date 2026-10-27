import React from 'react';
import { GameViewProps } from '../../engine/types';
import { FourSignsState } from './types';
import { FourSignClueCard } from './icons';
import { Avatar } from '../../components/ui/Avatar';
import { Sparkles, CheckCircle2, XCircle, Flame, Clock } from 'lucide-react';
import { Icon } from '../../design/icons';

export const FourSignsHostView: React.FC<GameViewProps<FourSignsState>> = ({
  state: gameState,
  players,
}) => {
  const { currentPuzzle, currentPhaseId, phaseTimeRemaining = 0, isCloseCall, playerStates } = gameState;
  const isReveal = currentPhaseId === 'reveal';

  const safePlayers = Array.isArray(players) ? players : [];
  const lockedCount = Object.values(playerStates || {}).filter((p) => p.locked).length;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 p-4 sm:p-6 animate-fadeIn select-none">
      {/* Top Banner: Category, Round, Timer */}
      <div className="flex items-center justify-between border-b border-[var(--border-tint)]/60 pb-4">
        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
            <Sparkles size={14} /> {currentPuzzle.category}
          </span>
          <span className="text-xs font-bold text-[var(--on-container-variant)]">
            Tier {currentPuzzle.tier}
          </span>
        </div>

        {/* Timer Badge */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-mono text-base font-black transition-all ${
              isCloseCall || phaseTimeRemaining <= 5
                ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30'
                : 'bg-[var(--surface-container-high)] text-[var(--on-container)]'
            }`}
          >
            <Clock size={16} />
            <span>{phaseTimeRemaining}s</span>
          </div>
        </div>
      </div>

      {/* Close Call Flash Alert */}
      {isCloseCall && !isReveal && (
        <div className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 text-white text-center font-black text-sm tracking-wider uppercase shadow-md animate-bounce flex items-center justify-center gap-2">
          <Icon name="bolt" size={16} />
          <span>CLOSE CALL! First correct answer locked — 5 seconds remaining!</span>
          <Icon name="bolt" size={16} />
        </div>
      )}

      {/* Main 4 Signs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 my-2">
        {currentPuzzle.clues.map((clue, idx) => (
          <FourSignClueCard
            key={idx}
            clue={clue}
            index={idx}
            revealed={true}
            size="lg"
            className="shadow-md"
          />
        ))}
      </div>

      {/* Clues Phase: Live Player Lock-In Progress */}
      {!isReveal && (
        <div className="flex flex-col gap-3 p-4 rounded-2xl bg-[var(--surface-container)] border border-[var(--border-tint)] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-[var(--on-container-variant)]">
              Player Submissions ({lockedCount} / {safePlayers.length})
            </span>
            <div className="h-2 w-32 bg-[var(--surface-container-high)] rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all duration-300"
                style={{
                  width: `${(lockedCount / Math.max(1, safePlayers.length)) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {safePlayers.map((p) => {
              const state = playerStates[p.id];
              const isLocked = state?.locked;
              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    isLocked
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                      : 'bg-[var(--surface-card)] border-[var(--border-tint)] text-[var(--on-container-variant)] opacity-70'
                  }`}
                >
                  <Avatar name={p.name} size="sm" />
                  <span className="truncate max-w-[100px]">{p.name}</span>
                  {isLocked && <CheckCircle2 size={13} className="text-emerald-500" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reveal Phase: Correct Answer & Biblical Scripture Context */}
      {isReveal && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* Answer Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/20 via-[var(--surface-card)] to-amber-500/10 border-2 border-amber-500/40 shadow-xl text-center flex flex-col items-center gap-3">
            <span className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
              The Answer Is
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[var(--on-container)] drop-shadow-sm">
              {currentPuzzle.answer}
            </h1>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-sm">
              <Icon name="book-open" size={14} />
              <span>{currentPuzzle.ref}</span>
            </div>
            <p className="text-sm sm:text-base font-semibold text-[var(--on-container)] opacity-90 max-w-xl mt-1 italic">
              “{currentPuzzle.why}”
            </p>
          </div>

          {/* Scores for this round */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {safePlayers.map((p) => {
              const state = playerStates[p.id];
              const isCorrect = state?.isCorrect;
              const earned = state?.scoreEarned || 0;
              const streak = state?.streakCount || 0;

              return (
                <div
                  key={p.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                    isCorrect
                      ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm'
                      : 'bg-[var(--surface-container)] border-[var(--border-tint)] opacity-75'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Avatar name={p.name} size="sm" />
                    <div className="flex flex-col truncate">
                      <span className="text-sm font-bold truncate text-[var(--on-container)]">
                        {p.name}
                      </span>
                      {state?.selectedOption ? (
                        <span className="text-xs text-[var(--on-container-variant)] truncate">
                          Chose: {state.selectedOption}
                        </span>
                      ) : (
                        <span className="text-xs text-rose-500">Timed out</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 pl-2">
                    <div className="flex items-center gap-1 font-mono font-black text-sm">
                      {isCorrect ? (
                        <>
                          <CheckCircle2 size={16} className="text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400">+{earned}</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={16} className="text-rose-500" />
                          <span className="text-[var(--on-container-variant)]">+0</span>
                        </>
                      )}
                    </div>
                    {streak >= 3 && (
                      <span className="text-[10px] font-black text-amber-500 flex items-center gap-0.5 mt-0.5">
                        <Flame size={10} /> {streak} streak
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
