import React from 'react';
import { motion } from 'framer-motion';

export interface LifelineHeartsProps {
  strikes: number;
  maxLives?: number;
  size?: number;
  className?: string;
  animateOnChange?: boolean;
}

export const LifelineHearts: React.FC<LifelineHeartsProps> = ({
  strikes,
  maxLives = 3,
  size = 22,
  className = '',
  animateOnChange = true,
}) => {
  const livesLeft = Math.max(0, maxLives - strikes);

  return (
    <div
      className={`flex items-center gap-1.5 sm:gap-2 select-none ${className}`}
      role="status"
      aria-label={`${livesLeft} of ${maxLives} lives remaining`}
    >
      {Array.from({ length: maxLives }).map((_, index) => {
        const isAlive = index < livesLeft;

        return (
          <motion.div
            key={index}
            initial={false}
            animate={
              animateOnChange
                ? isAlive
                  ? { scale: [0.9, 1.1, 1], opacity: 1 }
                  : { scale: [1.1, 0.85], opacity: 0.22 }
                : {}
            }
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative flex items-center justify-center shrink-0"
            style={{ width: size, height: size }}
          >
            <svg
              viewBox="0 0 24 24"
              width={size}
              height={size}
              className={`transition-all duration-300 ${
                isAlive
                  ? 'filter drop-shadow-[0_1px_3px_rgba(239,68,68,0.45)]'
                  : 'filter grayscale opacity-25'
              }`}
            >
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                fill={isAlive ? '#FF3B30' : 'currentColor'}
                className={isAlive ? '' : 'text-slate-400 dark:text-slate-600'}
              />
            </svg>
          </motion.div>
        );
      })}
    </div>
  );
};
