import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useTheme } from '../../theme/ThemeContext';

export interface MaterialSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  color?: string; // Optional custom accent color (defaults to primary M3 purple/brand color)
  ariaLabel?: string;
  showValueBadge?: boolean;
  className?: string;
}

/**
 * Material 3 Expressive Slider
 * Features:
 * - Thick rounded track (16px / h-4)
 * - Distinctive vertical pill thumb bar (taller than track)
 * - Material 3 Expressive gap between active track and thumb
 * - Subtle inactive track end stop dot
 * - Drag and tap interaction with pointer capture
 * - Full keyboard accessibility (Arrow keys, Home, End, PageUp, PageDown)
 * - Haptic feedback on value changes
 */
export const MaterialSlider: React.FC<MaterialSliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  color,
  ariaLabel = 'Slider',
  showValueBadge = false,
  className = '',
}) => {
  const { triggerHaptic } = useTheme();
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Clamped and stepped value
  const clampedValue = Math.max(min, Math.min(max, value));
  const percentage = Math.max(0, Math.min(100, ((clampedValue - min) / (max - min)) * 100));

  const updateFromPointer = useCallback(
    (clientX: number) => {
      if (disabled || !trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const relativeX = clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, relativeX / rect.width));
      const rawValue = min + ratio * (max - min);
      const steppedValue = Math.round(rawValue / step) * step;
      const finalValue = Math.max(min, Math.min(max, steppedValue));

      if (finalValue !== clampedValue) {
        triggerHaptic('selection');
        onChange(finalValue);
      }
    },
    [disabled, min, max, step, clampedValue, onChange, triggerHaptic]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    triggerHaptic('light');
    updateFromPointer(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || disabled) return;
    updateFromPointer(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture was already released
    }
    setIsDragging(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    let nextValue = clampedValue;
    const largeStep = (max - min) / 10 || 10;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        nextValue = Math.min(max, clampedValue + step);
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        nextValue = Math.max(min, clampedValue - step);
        break;
      case 'PageUp':
        nextValue = Math.min(max, clampedValue + largeStep);
        break;
      case 'PageDown':
        nextValue = Math.max(min, clampedValue - largeStep);
        break;
      case 'Home':
        nextValue = min;
        break;
      case 'End':
        nextValue = max;
        break;
      default:
        return;
    }

    e.preventDefault();
    if (nextValue !== clampedValue) {
      triggerHaptic('selection');
      onChange(nextValue);
    }
  };

  // Styling tokens
  // Default to M3 purple / active primary action
  const activeColor = color || 'var(--primary-action)';

  // Material 3 Gap calculation:
  // Active track width is percentage%, minus 4px gap when percentage > 0 and < 100
  const activeWidth = percentage <= 0 ? 0 : percentage >= 100 ? 100 : percentage;

  return (
    <div
      className={`relative w-full flex items-center py-2 select-none touch-none ${
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Accessible Interactive Container */}
      <div
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={ariaLabel}
        aria-valuenow={clampedValue}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-disabled={disabled}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        ref={trackRef}
        className="relative w-full h-4 rounded-full flex items-center outline-none"
      >
        {/* Inactive Track (Full Width Background with Rounded Ends) */}
        <div
          className="absolute inset-0 rounded-full bg-[#E5E2F0] dark:bg-[#3B3846] transition-colors overflow-hidden"
          style={{
            backgroundColor: color ? undefined : undefined,
          }}
        >
          {/* Subtle Inactive Stop Dot (M3 Spec characteristic) */}
          <div
            className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#655F73]/40 dark:bg-[#A69FB7]/30 pointer-events-none"
            aria-hidden="true"
          />
        </div>

        {/* Active Track (Filled portion with gap before thumb) */}
        <div
          className="absolute left-0 top-0 bottom-0 rounded-full transition-[width] duration-75 ease-out pointer-events-none"
          style={{
            width: `calc(${activeWidth}% - ${percentage > 5 && percentage < 95 ? '6px' : '0px'})`,
            backgroundColor: activeColor,
          }}
        />

        {/* Material 3 Vertical Bar Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-[left] duration-75 ease-out flex items-center justify-center pointer-events-none"
          style={{ left: `${percentage}%` }}
        >
          {/* Thumb Pill Bar (Vertical capsule taller than the 16px track) */}
          <div
            className={`w-1.5 h-7 rounded-full transition-all duration-150 shadow-sm ${
              isDragging || isFocused ? 'scale-y-110 w-2 ring-4 ring-purple-500/20' : isHovered ? 'scale-y-105' : ''
            }`}
            style={{ backgroundColor: activeColor }}
          />

          {/* Optional Value Badge Floating Above Thumb */}
          {showValueBadge && (isDragging || isHovered || isFocused) && (
            <div
              className="absolute -top-8 px-2 py-0.5 rounded-md text-[11px] font-mono font-black text-white bg-slate-900/90 shadow-md pointer-events-none animate-fadeIn whitespace-nowrap"
            >
              {clampedValue}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
