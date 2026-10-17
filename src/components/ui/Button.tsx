import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { useTheme } from '../../theme/ThemeContext';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'tonal' | 'outlined' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'hero' | 'icon';
  pill?: boolean;
  shapeMorph?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  haptic?: 'light' | 'medium' | 'heavy' | 'selection';
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      pill = true,
      shapeMorph = true,
      leftIcon,
      rightIcon,
      haptic = 'light',
      className = '',
      children,
      disabled,
      onClick,
      ...motionProps
    },
    ref
  ) => {
    const { reducedMotion, triggerHaptic } = useTheme();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;
      triggerHaptic(haptic);
      if (onClick) onClick(e);
    };

    // Base sizing
    const sizeClasses = {
      sm: 'h-9 px-4 text-xs font-semibold gap-1.5',
      md: 'h-12 px-6 text-sm font-bold gap-2',
      lg: 'h-14 px-8 text-base font-bold gap-2.5',
      hero: 'h-16 px-9 text-lg font-extrabold gap-3 shadow-expressive',
      icon: 'w-11 h-11 p-0 flex items-center justify-center',
    }[size];

    // Variants with high contrast WCAG AA
    const variantClasses = {
      primary:
        'bg-[var(--primary-action)] text-[var(--primary-action-text)] hover:opacity-95 shadow-md active:shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--primary-action)]',
      tonal:
        'bg-[var(--surface-container-high)] text-[var(--on-container)] hover:brightness-95 active:brightness-90',
      outlined:
        'border-2 border-[var(--on-container)]/20 text-[var(--on-container)] bg-transparent hover:bg-[var(--surface-container)]/50',
      ghost:
        'text-[var(--on-container)] bg-transparent hover:bg-[var(--surface-container)]/60',
      danger:
        'bg-red-600 text-white hover:bg-red-700 shadow-md',
    }[variant];

    const initialRadius = pill ? '9999px' : '22px';
    const pressedRadius = shapeMorph ? '20px' : initialRadius;

    return (
      <motion.button
        ref={ref}
        disabled={disabled}
        onClick={handleClick}
        style={{ borderRadius: initialRadius }}
        whileHover={reducedMotion || disabled ? undefined : { scale: 1.02 }}
        whileTap={
          reducedMotion || disabled
            ? undefined
            : {
                scale: 0.96,
                borderRadius: pressedRadius,
                transition: { duration: 0.12, ease: 'easeOut' },
              }
        }
        className={`inline-flex items-center justify-center select-none cursor-pointer transition-colors outline-none disabled:opacity-40 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
        {...motionProps}
      >
        {leftIcon && <span className="inline-flex shrink-0 items-center">{leftIcon}</span>}
        {children && <span className="inline-flex items-center justify-center gap-2">{children}</span>}
        {rightIcon && <span className="inline-flex shrink-0 items-center">{rightIcon}</span>}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
