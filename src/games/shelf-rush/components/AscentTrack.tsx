import React from 'react';
import { motion } from 'framer-motion';

export interface AscentTrackProps {
  currentStep: number;
  totalSteps: number;
  restStops?: number[];
}

export const AscentTrack: React.FC<AscentTrackProps> = ({
  currentStep,
  totalSteps,
  restStops = totalSteps === 15 ? [5, 10] : [4],
}) => {
  return (
    <div
      className="w-full flex flex-col gap-1.5 px-2 select-none"
      role="region"
      aria-label={`Ascent progress: Step ${currentStep} of ${totalSteps}`}
    >
      <div className="flex items-center justify-between text-xs font-bold text-[var(--on-container-variant)]">
        <span className="flex items-center gap-1.5">
          <span className="text-purple-600 dark:text-purple-400">⛰️</span>
          <span>The Ascent</span>
        </span>
        <span className="font-mono">
          Step <strong className="text-[var(--on-container)]">{currentStep}</strong> / {totalSteps}
        </span>
      </div>

      {/* Pips track */}
      <div className="flex items-center gap-1 w-full justify-between">
        {Array.from({ length: totalSteps }).map((_, idx) => {
          const stepNum = idx + 1;
          const isCleared = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;
          const isRest = restStops.includes(stepNum);

          return (
            <motion.div
              key={stepNum}
              animate={{
                scale: isCurrent ? 1.25 : 1,
              }}
              transition={{ duration: 0.2 }}
              className={`relative flex-1 h-2 rounded-full transition-colors ${
                isCurrent
                  ? 'bg-purple-600 dark:bg-purple-400 ring-2 ring-purple-300 shadow-sm'
                  : isCleared
                  ? 'bg-emerald-500'
                  : 'bg-[var(--on-container)]/15'
              }`}
            >
              {isRest && (
                <span
                  title="Rest stop"
                  className={`absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] leading-none ${
                    isCleared ? 'opacity-40' : 'opacity-100'
                  }`}
                >
                  ❤️
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
