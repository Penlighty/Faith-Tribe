import React from 'react';
import { motion } from 'framer-motion';

export interface WavyTimerProps {
  durationSeconds: number;
  remainingSeconds: number;
  showLabels?: boolean;
  className?: string;
}

export const WavyTimer: React.FC<WavyTimerProps> = ({
  durationSeconds,
  remainingSeconds,
  showLabels = true,
  className = '',
}) => {
  const safeDuration = Math.max(1, durationSeconds);
  const clampedRemaining = Math.max(0, Math.min(remainingSeconds, safeDuration));
  const elapsed = safeDuration - clampedRemaining;
  const progressPercent = Math.min(100, Math.max(0, (clampedRemaining / safeDuration) * 100));

  const isUrgent = clampedRemaining <= 10 && clampedRemaining > 0;

  // Format as mm:ss or 0:ss
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = Math.floor(totalSec % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate a multi-wavelength sine path across 320 units
  // Using cubic beziers for ultra-smooth wavy aesthetics
  const wavePath =
    'M 0 12 Q 20 2, 40 12 T 80 12 T 120 12 T 160 12 T 200 12 T 240 12 T 280 12 T 320 12';

  return (
    <div className={`w-full flex flex-col gap-1.5 select-none ${className}`}>
      {/* SVG Wavy track & animated active line */}
      <div className="relative w-full h-8 flex items-center overflow-hidden">
        <svg
          viewBox="0 0 320 24"
          preserveAspectRatio="none"
          className="w-full h-6"
          aria-hidden="true"
        >
          {/* Inactive track */}
          <path
            d={wavePath}
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            className="text-[var(--on-container)]/15"
          />

          {/* Active wavy line masked by progress */}
          <clipPath id="timer-progress-clip">
            <rect
              x="0"
              y="0"
              width={`${progressPercent}%`}
              height="24"
              style={{ transition: 'width 1s linear' }}
            />
          </clipPath>

          <g clipPath="url(#timer-progress-clip)">
            <path
              d={wavePath}
              fill="none"
              stroke={isUrgent ? '#E53E3E' : 'var(--primary-action)'}
              strokeWidth="4.5"
              strokeLinecap="round"
              className={isUrgent ? 'animate-pulse' : 'animate-wavy'}
              strokeDasharray="8 4"
            />
          </g>
        </svg>

        {/* Pulse indicator node at current head */}
        <motion.div
          animate={{ scale: isUrgent ? [1, 1.4, 1] : 1 }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          style={{
            left: `calc(${progressPercent}% - 6px)`,
            transition: 'left 1s linear',
          }}
          className={`absolute w-3 h-3 rounded-full shadow-md ${
            isUrgent ? 'bg-red-500 ring-4 ring-red-200' : 'bg-[var(--primary-action)]'
          }`}
        />
      </div>

      {/* Elapsed vs Remaining timer labels */}
      {showLabels && (
        <div className="flex items-center justify-between text-xs font-mono tabular-nums text-[var(--on-container-variant)] px-1">
          <span className="font-semibold">{formatTime(elapsed)}</span>
          <span
            className={`font-bold transition-colors ${
              isUrgent ? 'text-red-500 font-extrabold text-sm' : ''
            }`}
          >
            {formatTime(clampedRemaining)}
          </span>
        </div>
      )}
    </div>
  );
};
