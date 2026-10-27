import React from 'react';
import { GamifiedFlame, GamifiedGem, GamifiedXpBolt, GamifiedHeart } from './GamifiedMascot';
import { useTheme } from '../../theme/ThemeContext';

export interface GamifiedTopBarProps {
  streak: number;
  gems: number;
  xp: number;
  hearts?: number;
  onFlameClick?: () => void;
  onGemsClick?: () => void;
  onXpClick?: () => void;
  onHeartsClick?: () => void;
  hasChestNotice?: boolean;
  className?: string;
}

export const GamifiedTopBar: React.FC<GamifiedTopBarProps> = ({
  streak,
  gems,
  xp,
  hearts = 5,
  onFlameClick,
  onGemsClick,
  onXpClick,
  onHeartsClick,
  hasChestNotice = false,
  className = '',
}) => {
  const { triggerHaptic } = useTheme();

  return (
    <div
      className={`w-full max-w-xl mx-auto h-12 px-4 flex items-center justify-between bg-white dark:bg-zinc-900 border-b-2 border-[var(--c-border)] select-none sticky top-0 z-30 ${className}`}
    >
      {/* 1. Streak (Flame + count in orange) */}
      <button
        type="button"
        onClick={() => {
          triggerHaptic('light');
          if (onFlameClick) onFlameClick();
        }}
        className="flex items-center gap-1.5 py-1 px-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer relative"
      >
        <GamifiedFlame size={24} />
        <span className="font-black text-sm font-mono text-[var(--c-orange)]">
          {streak}
        </span>
      </button>

      {/* 2. Gems (Hexagon crystal + count in blue) */}
      <button
        type="button"
        onClick={() => {
          triggerHaptic('light');
          if (onGemsClick) onGemsClick();
        }}
        className="flex items-center gap-1.5 py-1 px-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer relative"
      >
        <GamifiedGem size={22} />
        <span className="font-black text-sm font-mono text-[var(--c-blue)]">
          {gems}
        </span>
        {hasChestNotice && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--c-red)] ring-2 ring-white" />
        )}
      </button>

      {/* 3. XP (Lightning + count in yellow) */}
      <button
        type="button"
        onClick={() => {
          triggerHaptic('light');
          if (onXpClick) onXpClick();
        }}
        className="flex items-center gap-1.5 py-1 px-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
      >
        <GamifiedXpBolt size={22} />
        <span className="font-black text-sm font-mono text-[var(--c-yellow)]">
          {xp}
        </span>
      </button>

      {/* 4. Hearts allowance (Red Heart + count) */}
      <button
        type="button"
        onClick={() => {
          triggerHaptic('light');
          if (onHeartsClick) onHeartsClick();
        }}
        className="flex items-center gap-1.5 py-1 px-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
      >
        <GamifiedHeart size={22} />
        <span className="font-black text-sm font-mono text-[var(--c-red)]">
          {hearts}
        </span>
      </button>
    </div>
  );
};
