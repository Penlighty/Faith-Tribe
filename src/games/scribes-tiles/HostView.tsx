import React from 'react';
import { GameViewProps } from '../../engine/types';
import { ScribesTilesState } from './types';
import { Avatar } from '../../components/ui/Avatar';
import { Scroll, Clock, CheckCircle2, XCircle, Flame } from 'lucide-react';
import { Icon } from '../../design/icons';

export const ScribesTilesHostView: React.FC<GameViewProps<ScribesTilesState>> = ({
  state: gameState,
  players,
}) => {
  const { currentWord, currentPhaseId, phaseTimeRemaining = 0, isCloseCall, playerStates } = gameState;
  const isReveal = currentPhaseId === 'reveal';

  const safePlayers = Array.isArray(players) ? players : [];
  const lockedCount = Object.values(playerStates || {}).filter((p) => p.locked).length;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 p-4 sm:p-6 animate-fadeIn select-none">
      {/* Top Banner: Category, Length, Timer */}
      <div className="flex items-center justify-between border-b border-[var(--border-tint)]/60 pb-4">
        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30 flex items-center gap-1.5 shadow-sm">
            <Scroll size={14} /> {currentWord.category}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--surface-container)] text-[var(--on-container-variant)]">
            {currentWord.length} Letters
          </span>
          <span className="text-xs font-bold text-[var(--on-container-variant)]">
            Tier {currentWord.tier}
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
          <span>SCRIBE SOLVED! 5 seconds remaining to unscramble your tiles!</span>
          <Icon name="bolt" size={16} />
        </div>
      )}

      {/* Clue Scroll Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/15 via-[var(--surface-card)] to-orange-500/10 border-2 border-amber-500/30 shadow-lg text-center flex flex-col items-center gap-4">
        <span className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
          The Scribe's Clue
        </span>
        <h2 className="text-xl sm:text-3xl font-serif italic font-extrabold text-[var(--on-container)] max-w-2xl leading-relaxed">
          “{currentWord.clue}”
        </h2>

        {/* Word Tiles Preview / Reveal */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 my-2">
          {currentWord.answer.split('').map((letter, idx) => (
            <div
              key={idx}
              className={`w-12 h-14 sm:w-16 sm:h-20 rounded-2xl flex items-center justify-center font-black transition-all ${
                isReveal
                  ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-white text-2xl sm:text-4xl shadow-md border-b-4 border-amber-700 animate-bounce-subtle'
                  : 'bg-[var(--surface-container-high)] border-2 border-dashed border-[var(--border-tint)] text-[var(--on-container-variant)] opacity-70 text-lg'
              }`}
            >
              {isReveal ? letter : '?'}
            </div>
          ))}
        </div>
      </div>

      {/* Solve Phase: Real-Time Solver Progress */}
      {!isReveal && (
        <div className="flex flex-col gap-3 p-4 rounded-2xl bg-[var(--surface-container)] border border-[var(--border-tint)] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-[var(--on-container-variant)]">
              Scribes Unscrambling ({lockedCount} / {safePlayers.length})
            </span>
            <div className="h-2 w-32 bg-[var(--surface-container-high)] rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 transition-all duration-300"
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
              const placedCount = state?.placedTiles?.filter((t) => t !== null).length || 0;

              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    isLocked
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                      : 'bg-[var(--surface-card)] border-[var(--border-tint)] text-[var(--on-container-variant)]'
                  }`}
                >
                  <Avatar name={p.name} size="sm" />
                  <span className="truncate max-w-[100px]">{p.name}</span>
                  {isLocked ? (
                    <CheckCircle2 size={13} className="text-emerald-500" />
                  ) : (
                    <span className="font-mono text-[10px] text-[var(--on-container-variant)]">
                      {placedCount}/{currentWord.length}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reveal Phase: Reference and Leaderboard */}
      {isReveal && (
        <div className="flex flex-col gap-5 animate-fadeIn">
          {/* Scripture Citation Badge */}
          <div className="p-4 rounded-2xl bg-[var(--surface-container)] border border-[var(--border-tint)] text-center flex flex-col items-center gap-1.5 shadow-sm">
            <span className="text-xs font-black uppercase tracking-wider text-[var(--on-container-variant)]">
              Scripture Witness
            </span>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-extrabold text-base">
              <Icon name="book-open" size={16} />
              <span>{currentWord.ref}</span>
            </div>
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
                      <span className="text-xs text-[var(--on-container-variant)] truncate">
                        {isCorrect ? 'Word Solved!' : 'Unfinished'}
                      </span>
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
