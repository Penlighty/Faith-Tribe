import React from 'react';
import { Star, Scroll, BookOpen, Trophy } from 'lucide-react';
import { GamifiedChest } from './GamifiedMascot';
import { useTheme } from '../../theme/ThemeContext';

export type PathNodeState = 'complete' | 'current' | 'locked';
export type PathNodeGlyph = 'star' | 'book' | 'scroll' | 'trophy' | 'chest';

export interface PathNodeData {
  id: string;
  title: string;
  subtitle: string;
  glyph: PathNodeGlyph;
  xpReward: number;
  gameId: string;
}

export interface GamifiedPathNodeProps {
  node: PathNodeData;
  state: PathNodeState;
  xOffset: number; // in pixels, e.g. -45, 0, 45
  onClick?: () => void;
  showTooltip?: boolean;
  onStartClick?: () => void;
}

export const GamifiedPathNode: React.FC<GamifiedPathNodeProps> = ({
  node,
  state,
  xOffset,
  onClick,
  showTooltip = false,
  onStartClick,
}) => {
  const { triggerHaptic } = useTheme();

  const isChest = node.glyph === 'chest';

  const renderIcon = () => {
    const iconColor = state === 'locked' ? '#AFAFAF' : '#FFFFFF';
    switch (node.glyph) {
      case 'star':
        return <Star size={32} fill={iconColor} stroke="none" />;
      case 'scroll':
        return <Scroll size={30} color={iconColor} strokeWidth={2.8} />;
      case 'book':
        return <BookOpen size={30} color={iconColor} strokeWidth={2.8} />;
      case 'trophy':
        return <Trophy size={30} fill={iconColor} stroke="none" />;
      case 'chest':
        return <GamifiedChest rarity="common" size={48} />;
    }
  };

  const handleClick = () => {
    if (state === 'locked') {
      triggerHaptic('heavy');
      return;
    }
    triggerHaptic('selection');
    if (onClick) onClick();
  };

  const puckClass = {
    current: 'path-node-current',
    complete: 'path-node-complete',
    locked: 'path-node-locked',
  }[state];

  return (
    <div
      className="relative flex flex-col items-center my-6 select-none"
      style={{ transform: `translateX(${xOffset}px)` }}
    >
      {/* Floating Tooltip above current node */}
      {state === 'current' && showTooltip && (
        <div className="absolute -top-24 z-20 flex flex-col items-center animate-bounce">
          <div className="bg-white dark:bg-zinc-800 border-2 border-[var(--c-border)] rounded-2xl p-3 shadow-xl flex flex-col items-center gap-1.5 min-w-[170px] text-center">
            <span className="text-xs font-black text-[var(--c-text)]">
              {node.title}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic('medium');
                if (onStartClick) onStartClick();
              }}
              className="px-4 py-1.5 rounded-xl bg-white border-2 border-[var(--c-blue)] text-[var(--c-blue)] text-xs font-black tracking-wide uppercase hover:bg-[var(--c-blue-tint)] shadow-sm active:scale-95 cursor-pointer"
            >
              START +{node.xpReward} XP
            </button>
          </div>
          {/* Tooltip triangle tail pointing down */}
          <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white -mt-0.5" />
        </div>
      )}

      {/* Pulsing Outer Halo for Current Node */}
      {state === 'current' && (
        <div className="absolute -inset-2.5 rounded-2xl bg-[var(--c-blue-soft)]/40 node-halo pointer-events-none" />
      )}

      {/* 72dp Coin / Puck Node */}
      <div
        onClick={handleClick}
        className={`path-node-puck ${puckClass}`}
        role="button"
        tabIndex={0}
      >
        {renderIcon()}
      </div>
    </div>
  );
};
