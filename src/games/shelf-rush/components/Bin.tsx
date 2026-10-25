import React from 'react';
import { motion } from 'framer-motion';
import { BinColor } from '../engine/constants';
import { Icon, IconName, ICONS } from '@design/icons';

export interface BinProps {
  id: string;
  label: string;
  icon?: string | null;
  position: number;
  color: BinColor;
  isCorrectHighlight?: boolean;
  isWrongSelected?: boolean;
  isPulse?: boolean;
  disabled?: boolean;
  minHeightClass?: string;
  onSelect: (binId: string) => void;
}

export const Bin: React.FC<BinProps> = ({
  id,
  label,
  icon,
  position,
  color,
  isCorrectHighlight = false,
  isWrongSelected = false,
  isPulse = false,
  disabled = false,
  minHeightClass = 'min-h-[76px]',
  onSelect,
}) => {
  const hasValidIcon = icon && icon in ICONS;

  return (
    <motion.button
      type="button"
      onClick={() => !disabled && onSelect(id)}
      disabled={disabled}
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      animate={
        isPulse
          ? { scale: [1, 1.05, 1], transition: { duration: 0.25 } }
          : isWrongSelected
          ? { x: [-4, 4, -4, 4, 0], transition: { duration: 0.25 } }
          : { scale: 1, x: 0 }
      }
      style={{
        backgroundColor: color.container,
        color: color.ink,
        borderColor: isCorrectHighlight ? '#10B981' : isWrongSelected ? '#EF4444' : color.border,
      }}
      className={`relative w-full ${minHeightClass} rounded-2xl p-2.5 flex flex-col items-center justify-center text-center shadow-sm select-none transition-all duration-150 focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-400 border-2 ${
        isCorrectHighlight
          ? 'ring-4 ring-emerald-400 ring-offset-2'
          : isWrongSelected
          ? 'ring-4 ring-rose-400 ring-offset-2'
          : 'hover:brightness-95 active:brightness-90'
      }`}
      aria-label={`${position}. ${label}`}
    >
      {/* Position index badge */}
      <span
        className="absolute top-1.5 left-2 text-[11px] font-mono font-black opacity-60 leading-none"
        aria-hidden="true"
      >
        {position}
      </span>

      {/* State Feedback overlay icons in top right corner */}
      {isCorrectHighlight && (
        <span
          className="absolute top-1.5 right-2 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow"
          aria-hidden="true"
        >
          <Icon name="check" size={14} />
        </span>
      )}
      {isWrongSelected && (
        <span
          className="absolute top-1.5 right-2 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold shadow"
          aria-hidden="true"
        >
          <Icon name="close" size={14} />
        </span>
      )}

      {/* Center Icon */}
      {hasValidIcon && (
        <div className="mb-1 pointer-events-none opacity-90" aria-hidden="true">
          <Icon name={icon as IconName} size={24} />
        </div>
      )}

      {/* Label (up to 2 lines, never truncated) */}
      <span className="text-[13px] sm:text-[14px] leading-snug font-bold line-clamp-2 px-1">
        {label}
      </span>
    </motion.button>
  );
};
