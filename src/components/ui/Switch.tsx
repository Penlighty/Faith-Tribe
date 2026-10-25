import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../theme/ThemeContext';
import { Icon } from '../../design/icons';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  id?: string;
  ariaLabel?: string;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  label,
  id,
  ariaLabel,
  className = '',
}) => {
  const { reducedMotion, triggerHaptic } = useTheme();

  const handleToggle = () => {
    if (disabled) return;
    triggerHaptic('selection');
    onChange(!checked);
  };

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel || label}
      disabled={disabled}
      onClick={handleToggle}
      className={`relative inline-flex h-8 w-13 shrink-0 cursor-pointer items-center rounded-full p-1 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-action)] focus-visible:ring-offset-2 ${
        checked
          ? 'bg-[var(--primary-action)]'
          : 'bg-[var(--surface-container-high)] border-2 border-[var(--on-container)]/25'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : ''} ${className}`}
    >
      <motion.div
        layout
        transition={
          reducedMotion
            ? { duration: 0.1 }
            : { type: 'spring', stiffness: 500, damping: 30 }
        }
        className={`flex h-6 w-6 items-center justify-center rounded-full shadow-sm transition-all ${
          checked
            ? 'translate-x-5 bg-[var(--primary-action-text,#fff)] text-[var(--primary-action)]'
            : 'translate-x-0 bg-[var(--on-container-variant)]/80 text-transparent'
        }`}
      >
        {checked && (
          <Icon name="check" size={14} className="stroke-[3]" />
        )}
      </motion.div>
    </button>
  );
};
