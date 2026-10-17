import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { useTheme } from '../../theme/ThemeContext';

export interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  variant?: 'elevated' | 'tonal' | 'outlined' | 'hero' | 'surface';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'tonal',
  padding = 'md',
  interactive = false,
  className = '',
  children,
  onClick,
  ...motionProps
}) => {
  const { reducedMotion, triggerHaptic } = useTheme();

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3.5',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  }[padding];

  const variantClasses = {
    tonal:
      'bg-[var(--surface-container)] text-[var(--on-container)] border border-[var(--border-tint)] shadow-sm',
    elevated:
      'bg-[var(--surface-card)] text-[var(--on-container)] shadow-expressive border border-black/5 dark:border-white/5',
    outlined:
      'bg-transparent text-[var(--on-container)] border-2 border-[var(--on-container)]/15',
    hero:
      'bg-[var(--surface-container-high)] text-[var(--on-container)] shadow-expressive border border-[var(--border-tint)]',
    surface:
      'bg-[var(--surface-card)] text-[var(--on-container)] border border-[var(--border-tint)] shadow-sm',
  }[variant];

  const isHero = variant === 'hero';
  const borderRadius = isHero ? '32px' : '28px';

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (interactive) triggerHaptic('selection');
    if (onClick) onClick(e);
  };

  return (
    <motion.div
      onClick={handleClick}
      style={{ borderRadius }}
      whileHover={
        interactive && !reducedMotion
          ? { y: -3, scale: 1.01, transition: { duration: 0.18 } }
          : undefined
      }
      whileTap={
        interactive && !reducedMotion
          ? { scale: 0.98, transition: { duration: 0.12 } }
          : undefined
      }
      className={`relative overflow-hidden transition-colors ${interactive ? 'cursor-pointer select-none' : ''} ${paddingClasses} ${variantClasses} ${className}`}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
};
