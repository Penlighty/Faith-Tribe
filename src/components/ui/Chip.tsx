import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../theme/ThemeContext';

export interface ChipProps {
  selected?: boolean;
  onClick?: () => void;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'tonal' | 'filter' | 'badge';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({
  selected = false,
  onClick,
  leftIcon,
  rightIcon,
  variant: _variant = 'tonal',
  size = 'md',
  children,
  className = '',
}) => {
  const { reducedMotion, triggerHaptic } = useTheme();

  const handleClick = () => {
    if (onClick) {
      triggerHaptic('selection');
      onClick();
    }
  };

  const sizeClasses = {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-10 px-4 text-sm gap-2',
  }[size];

  // M3 Expressive segmented filter pill: selected is a dark filled pill or prominent tonal pill
  const styleClasses = selected
    ? 'bg-[#1D1B20] text-white dark:bg-white dark:text-[#1D1B20] font-bold shadow-sm'
    : 'bg-[var(--chip-bg,var(--surface-container))] text-[var(--on-container)] font-semibold hover:bg-[var(--surface-container-high)] border border-[var(--border-tint)]';

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      whileTap={reducedMotion ? undefined : { scale: 0.95 }}
      className={`inline-flex items-center justify-center rounded-full transition-colors cursor-pointer select-none shrink-0 outline-none ${sizeClasses} ${styleClasses} ${className}`}
    >
      {leftIcon && <span className="inline-flex items-center shrink-0">{leftIcon}</span>}
      <span>{children}</span>
      {rightIcon && <span className="inline-flex items-center shrink-0">{rightIcon}</span>}
    </motion.button>
  );
};
