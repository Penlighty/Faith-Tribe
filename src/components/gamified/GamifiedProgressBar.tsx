import React from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../../theme/ThemeContext';

export interface GamifiedProgressBarProps {
  progress: number; // 0 to 1
  onClose?: () => void;
  isPerfect?: boolean;
  color?: 'orange' | 'blue' | 'green';
  className?: string;
}

export const GamifiedProgressBar: React.FC<GamifiedProgressBarProps> = ({
  progress,
  onClose,
  isPerfect = false,
  color = 'orange',
  className = '',
}) => {
  const { triggerHaptic } = useTheme();
  const clamped = Math.max(0, Math.min(1, progress));
  const percent = `${Math.round(clamped * 100)}%`;

  const fillColors = {
    orange: 'bg-[var(--c-orange)]',
    blue: 'bg-[var(--c-blue)]',
    green: 'bg-[var(--c-green)]',
  }[color];

  return (
    <div className={`w-full flex items-center gap-3 select-none ${className}`}>
      {onClose && (
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onClose();
          }}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--c-text-off)] hover:text-[var(--c-text)] hover:bg-[var(--c-border)]/40 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={22} strokeWidth={3} />
        </button>
      )}

      <div className="flex-1 flex flex-col gap-1 relative">
        {isPerfect && (
          <span className="text-[10px] font-black uppercase tracking-wider text-[var(--c-orange)] ml-2 self-start animate-bounce">
            PERFECT
          </span>
        )}
        <div className="progress-gamified w-full">
          <div
            className={`progress-gamified-fill ${fillColors}`}
            style={{ width: percent }}
          />
        </div>
      </div>
    </div>
  );
};
