import React from 'react';
import { useTheme } from '../../theme/ThemeContext';

export type GamifiedButtonVariant =
  | 'green'
  | 'blue'
  | 'red'
  | 'yellow'
  | 'purple'
  | 'secondary'
  | 'outline'
  | 'text';

export interface GamifiedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: GamifiedButtonVariant;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  haptic?: 'light' | 'medium' | 'heavy' | 'selection';
  optOutText?: string;
  onOptOut?: () => void;
  children: React.ReactNode;
}

/**
 * 3D Tactile Lip Button matching Playful Gamified design spec
 * - 52dp tall, 16dp radius, 4dp solid darker lip
 * - ALL-CAPS bold text with 0.05em tracking
 * - On press, translateY(4px) and lip collapses
 */
export const GamifiedButton: React.FC<GamifiedButtonProps> = ({
  variant = 'green',
  fullWidth = true,
  leftIcon,
  rightIcon,
  haptic = 'light',
  optOutText,
  onOptOut,
  children,
  disabled,
  onClick,
  className = '',
  ...rest
}) => {
  const { triggerHaptic } = useTheme();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    triggerHaptic(haptic);
    if (onClick) onClick(e);
  };

  const variantClassMap: Record<GamifiedButtonVariant, string> = {
    green: 'btn-gamified-green',
    blue: 'btn-gamified-blue',
    red: 'btn-gamified-red',
    yellow: 'btn-gamified-yellow',
    purple: 'btn-gamified-purple',
    secondary: 'btn-gamified-secondary',
    outline: 'btn-gamified-outline',
    text: '!bg-transparent !shadow-none !h-auto !p-0 !text-[var(--c-blue)] hover:underline active:scale-95',
  };

  return (
    <div className={`flex flex-col items-center gap-2 ${fullWidth ? 'w-full' : ''}`}>
      <button
        disabled={disabled}
        onClick={handleClick}
        className={`btn-gamified ${variantClassMap[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
        {...rest}
      >
        {leftIcon && <span className="inline-flex mr-2 shrink-0">{leftIcon}</span>}
        <span className="truncate">{children}</span>
        {rightIcon && <span className="inline-flex ml-2 shrink-0">{rightIcon}</span>}
      </button>

      {optOutText && (
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            if (onOptOut) onOptOut();
          }}
          className="text-xs uppercase font-extrabold tracking-wider text-[var(--c-blue)] py-1.5 px-3 hover:underline cursor-pointer transition-transform active:scale-95"
        >
          {optOutText}
        </button>
      )}
    </div>
  );
};
