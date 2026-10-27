import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@design/icons';

export interface OptionCardProps {
  label: string;
  sublabel?: string;
  index?: number;
  isSelected?: boolean;
  isCorrect?: boolean | null; // null/undefined = not revealed yet
  isRevealed?: boolean;
  disabled?: boolean;
  onClick: () => void;
  shortcutKey?: string;
  className?: string;
  align?: 'left' | 'center';
}

export const OptionCard: React.FC<OptionCardProps> = ({
  label,
  sublabel,
  index,
  isSelected = false,
  isCorrect = null,
  isRevealed = false,
  disabled = false,
  onClick,
  shortcutKey,
  className = '',
  align = 'left',
}) => {
  // Determine color and 3D bevel state based on selection and reveal
  let stateClasses = 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200/90 dark:border-slate-700 border-b-slate-300 dark:border-b-slate-600 hover:border-slate-300 dark:hover:border-slate-500';

  if (isRevealed) {
    if (isCorrect === true) {
      stateClasses = '!bg-emerald-500 !text-white !border-emerald-600 !border-b-emerald-700 shadow-lg shadow-emerald-500/20';
    } else if (isSelected && isCorrect === false) {
      stateClasses = '!bg-rose-500 !text-white !border-rose-600 !border-b-rose-700 shadow-md shadow-rose-500/20';
    } else if (!isSelected) {
      stateClasses = 'bg-slate-100/60 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 border-b-slate-300 dark:border-b-slate-700 opacity-40';
    }
  } else if (isSelected) {
    stateClasses = 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-900 dark:text-cyan-100 border-cyan-400 border-b-cyan-600 ring-2 ring-cyan-400/30';
  }

  const defaultKey = shortcutKey || (index !== undefined ? String(index + 1) : undefined);

  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onClick}
      whileHover={!disabled && !isRevealed ? { y: -2 } : {}}
      whileTap={!disabled && !isRevealed ? { y: 2 } : {}}
      transition={{ duration: 0.12 }}
      className={`group relative w-full py-4 px-5 sm:px-6 rounded-2xl border border-b-4 font-bold text-sm sm:text-base tracking-wider uppercase transition-colors select-none flex items-center justify-between shadow-xs ${stateClasses} ${
        disabled ? 'cursor-not-allowed' : 'cursor-pointer active:border-b-2'
      } ${className}`}
    >
      <div className={`flex flex-col ${align === 'center' ? 'items-center mx-auto' : 'items-start'} leading-snug`}>
        <span className="truncate max-w-full">{label}</span>
        {sublabel && (
          <span className="text-[11px] font-normal normal-case opacity-75 mt-0.5">
            {sublabel}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-2">
        {/* Reveal Status Icons */}
        {isRevealed && isCorrect === true && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-6 h-6 rounded-full bg-white text-emerald-600 flex items-center justify-center shadow-xs"
          >
            <Icon name="check" size={16} />
          </motion.div>
        )}

        {isRevealed && isSelected && isCorrect === false && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-6 h-6 rounded-full bg-white text-rose-600 flex items-center justify-center shadow-xs"
          >
            <Icon name="close" size={16} />
          </motion.div>
        )}

        {/* Selected indicator when answering */}
        {!isRevealed && isSelected && (
          <div className="w-5 h-5 rounded-full bg-cyan-500 text-white flex items-center justify-center text-xs">
            <Icon name="check" size={13} />
          </div>
        )}

        {/* Optional keyboard shortcut hint */}
        {!isRevealed && !isSelected && defaultKey && (
          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold opacity-40 border border-current">
            {defaultKey}
          </span>
        )}
      </div>
    </motion.button>
  );
};
