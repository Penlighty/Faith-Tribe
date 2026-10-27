import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '../../../design/icons';

export interface PlayerLaneData {
  playerId: string;
  name: string;
  tribeId?: string;
  avatarSeed?: string;
  cardsDone: number;
  totalCards: number;
  correctCount: number;
  score: number;
  lives: number;
  maxLives: number;
  streak: number;
  status: 'ready' | 'showing' | 'revealing' | 'won' | 'lost' | 'finished';
  rank?: number;
}

export interface LanesProps {
  lanes: PlayerLaneData[];
  totalCards: number;
}

export const Lanes: React.FC<LanesProps> = ({ lanes, totalCards }) => {
  // Sort lanes live: Finished/won first, then highest completion %, then score
  const sorted = [...lanes].sort((a, b) => {
    const aPct = totalCards > 0 ? a.correctCount / totalCards : 0;
    const bPct = totalCards > 0 ? b.correctCount / totalCards : 0;
    if (aPct !== bPct) return bPct - aPct;
    return b.score - a.score;
  });

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-2.5 p-2 select-none">
      <div className="flex items-center justify-between text-xs font-bold text-[var(--on-container-variant)] px-2">
        <span>Race Progress ({lanes.length} Players)</span>
        <span>Goal: {totalCards} Cards</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
        {sorted.map((lane, index) => {
          const pct = Math.min(
            100,
            Math.round((lane.correctCount / Math.max(1, totalCards)) * 100)
          );
          const isOut = lane.status === 'lost' || lane.lives <= 0;
          const isFinished = lane.status === 'won' || lane.status === 'finished';

          return (
            <div
              key={lane.playerId}
              className={`p-3 rounded-2xl border transition-all flex flex-col gap-2 ${
                isFinished
                  ? 'bg-emerald-500/10 border-emerald-500/40'
                  : isOut
                  ? 'bg-rose-500/10 border-rose-500/30 opacity-75'
                  : 'bg-[var(--surface-container)] border-[var(--border-tint)]'
              }`}
            >
              {/* Top row: Name, status, streak, hearts */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold w-4 text-[var(--on-container-variant)]">
                    #{index + 1}
                  </span>
                  <span className="text-sm font-black text-[var(--on-container)] line-clamp-1">
                    {lane.name}
                  </span>
                  {isFinished && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white shadow-sm">
                      Finished
                    </span>
                  )}
                  {isOut && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-sm">
                      Out
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {lane.streak >= 3 && (
                    <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                      <Icon name="flame" size={12} />
                      <span>{lane.streak}</span>
                    </span>
                  )}
                  {/* Hearts */}
                  <div className="flex items-center gap-0.5 text-xs">
                    {Array.from({ length: lane.maxLives }).map((_, idx) => (
                      <span
                        key={idx}
                        className={idx < lane.lives ? 'text-rose-500' : 'text-gray-400 opacity-30'}
                      >
                        <Icon name="heart" size={12} />
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative w-full h-3 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    isFinished
                      ? 'bg-emerald-500'
                      : isOut
                      ? 'bg-rose-500'
                      : 'bg-purple-600'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </div>

              {/* Bottom stats row */}
              <div className="flex items-center justify-between text-[11px] font-mono text-[var(--on-container-variant)]">
                <span>
                  {lane.correctCount} / {totalCards} cards ({pct}%)
                </span>
                <span className="font-bold text-[var(--on-container)]">
                  {lane.score.toLocaleString()} pts
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
