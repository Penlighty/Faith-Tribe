import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { useTheme } from '../../theme/ThemeContext';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'success' | 'final' | 'amber' | 'warning' | 'tonal' | 'outlined' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'hero' | 'icon';
  pill?: boolean;
  shapeMorph?: boolean;
  lip?: boolean | 'green' | 'blue' | 'red' | 'yellow';
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
      shapeMorph = false,
      lip = true, // Default to 3D tactile bevel button style
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

    // Base sizing with tactile vertical rhythm
    const sizeClasses = {
      sm: 'h-10 px-4 text-xs font-black tracking-wider gap-1.5',
      md: 'h-12 px-6 text-sm font-black tracking-wider gap-2',
      lg: 'h-14 px-8 text-base font-black tracking-wider gap-2.5',
      hero: 'h-16 px-10 text-lg font-black tracking-wide gap-3',
      icon: 'w-11 h-11 p-0 flex items-center justify-center',
    }[size];

    // Tactile 3D button styling with solid bottom bevel & pressed downward push
    const isFinalOrSuccess = variant === 'success' || variant === 'final';
    const isAmberOrWarning = variant === 'amber' || variant === 'warning';

    let variantClasses = '';
    if (isFinalOrSuccess) {
      // Final steps / gameplay final step: Vibrant Emerald Green with darker green 3D lip
      variantClasses =
        'bg-[#58CC02] hover:bg-[#4EBA02] text-white shadow-[0_4px_0_#58A700] active:shadow-none active:translate-y-[4px] border-t border-white/20';
    } else if (variant === 'primary') {
      // Standard / preliminary steps: Vibrant Brand Sky Blue / Cyan (Image 3)
      variantClasses =
        'bg-[#1CB0F6] hover:bg-[#1899D6] text-white shadow-[0_4px_0_#1899D6] active:shadow-none active:translate-y-[4px] border-t border-white/25';
    } else if (isAmberOrWarning) {
      // Rewards, coins, milestones: Warm Gold / Amber
      variantClasses =
        'bg-[#FF9600] hover:bg-[#E08500] text-white shadow-[0_4px_0_#CE7C00] active:shadow-none active:translate-y-[4px] border-t border-white/25';
    } else if (variant === 'danger') {
      // Destructive / danger actions: Vibrant Crimson
      variantClasses =
        'bg-[#FF4B4B] hover:bg-[#E53939] text-white shadow-[0_4px_0_#EA2B2B] active:shadow-none active:translate-y-[4px] border-t border-white/20';
    } else if (variant === 'tonal') {
      // Preliminary steps "Back" / "Previous" / Secondary: Tonal with subtle 3D bevel
      variantClasses =
        'bg-[var(--surface-container-high)] text-[var(--on-container)] hover:bg-[var(--surface-container)] shadow-[0_4px_0_var(--border-tint)] active:shadow-none active:translate-y-[4px] border border-[var(--border-tint)]/60';
    } else if (variant === 'outlined') {
      variantClasses =
        'border-2 border-[var(--border-tint)] text-[var(--on-container)] bg-transparent hover:bg-[var(--surface-container)]/50 active:translate-y-[2px]';
    } else if (variant === 'ghost') {
      variantClasses =
        'text-[var(--on-container)] bg-transparent hover:bg-[var(--surface-container)]/60 active:translate-y-[1px]';
    }

    const borderRadius = pill ? '9999px' : '16px';

    return (
      <motion.button
        ref={ref}
        disabled={disabled}
        onClick={handleClick}
        style={{ borderRadius }}
        whileHover={reducedMotion || disabled ? undefined : { filter: 'brightness(1.04)' }}
        whileTap={
          reducedMotion || disabled
            ? undefined
            : {
                y: 4,
                transition: { duration: 0.05, ease: 'easeOut' },
              }
        }
        className={`inline-flex items-center justify-center uppercase select-none cursor-pointer transition-all outline-none disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0 ${sizeClasses} ${variantClasses} ${className}`}
        {...motionProps}
      >
        {leftIcon && <span className="inline-flex shrink-0 items-center mr-1">{leftIcon}</span>}
        {children && <span className="inline-flex items-center justify-center gap-1.5">{children}</span>}
        {rightIcon && <span className="inline-flex shrink-0 items-center ml-1">{rightIcon}</span>}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
