import React from 'react';
import { motion } from 'framer-motion';

export interface HudProps {
  lives: number;
  maxLives: number;
  streak: number;
  score: number;
  playMode: 'solo' | 'race' | 'practice';
  onLeave: () => void;
}

export const Hud: React.FC<HudProps> = ({
  lives,
  maxLives,
  streak,
  score,
  playMode,
  onLeave,
}) => {
  return (
    <div className="w-full flex items-center justify-between px-3 py-2 bg-[var(--surface-container)] rounded-2xl border border-[var(--border-tint)] shadow-sm select-none">
      {/* Leave / Back button */}
      <button
        onClick={onLeave}
        className="px-2.5 py-1 text-xs font-bold rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[var(--on-container-variant)] flex items-center gap-1 transition-colors"
        aria-label={playMode === 'race' ? 'Leave race' : 'Exit to menu'}
      >
        <span>←</span>
        <span>{playMode === 'race' ? 'Leave' : 'Exit'}</span>
      </button>

      {/* Lives / Practice indicator */}
      {playMode === 'practice' ? (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300">
          Practice Mode
        </span>
      ) : (
        <div
          className="flex items-center gap-1"
          aria-label={`${lives} of ${maxLives} lives remaining`}
        >
          {Array.from({ length: maxLives }).map((_, idx) => {
            const isFilled = idx < lives;
            return (
              <motion.span
                key={idx}
                animate={{ scale: isFilled ? 1 : 0.85 }}
                className={`text-base transition-colors ${
                  isFilled ? 'text-rose-500 drop-shadow-sm' : 'text-gray-300 dark:text-gray-600 opacity-40'
                }`}
              >
                ❤️
              </motion.span>
            );
          })}
        </div>
      )}

      {/* Streak (visible from streak 3) */}
      <div className="flex items-center gap-3">
        {streak >= 3 && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-black font-mono"
            aria-label={`Streak: ${streak}`}
          >
            <span>🔥</span>
            <span>{streak}</span>
          </motion.div>
        )}

        {/* Score */}
        <div className="font-mono text-base font-black tracking-tight text-[var(--on-container)]">
          {score.toLocaleString()}
          <span className="text-[10px] text-[var(--on-container-variant)] ml-1 font-sans font-bold">
            pts
          </span>
        </div>
      </div>
    </div>
  );
};
