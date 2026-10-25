import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SortCardProps {
  bookName: string;
  bookOrder?: number;
  practiceMode?: boolean;
  status: 'idle' | 'pulse' | 'correct' | 'wrong';
  chosenBinIndex?: number;
  isReducedMotion?: boolean;
}

export const SortCard: React.FC<SortCardProps> = ({
  bookName,
  bookOrder,
  practiceMode = false,
  status,
  isReducedMotion = false,
}) => {
  // Compute dynamic font size based on name length to ensure it never truncates
  const nameLen = bookName.length;
  const fontSizeClass =
    nameLen <= 8
      ? 'text-3xl sm:text-4xl'
      : nameLen <= 14
      ? 'text-2xl sm:text-3xl'
      : 'text-xl sm:text-2xl';

  // Animation variants
  const shakeVariants: import('framer-motion').Variants = {
    idle: { x: 0, opacity: 1, scale: 1 },
    pulse: { scale: [1, 1.04, 1], transition: { duration: 0.5, repeat: Infinity } },
    wrong: isReducedMotion
      ? { opacity: [1, 0.5, 1], transition: { duration: 0.24 } }
      : {
          x: [-8, 8, -6, 6, -3, 3, 0],
          transition: { duration: 0.24, ease: 'easeInOut' },
        },
    correct: isReducedMotion
      ? { opacity: 0, transition: { duration: 0.18 } }
      : {
          scale: [1, 0.9, 0.4],
          opacity: [1, 0.8, 0],
          transition: { duration: 0.18, ease: 'easeIn' },
        },
  };


  return (
    <div className="relative w-full flex items-center justify-center my-auto py-2">
      {/* Looping decorative conveyer belt track behind card (aria-hidden) */}
      {!isReducedMotion && (
        <div
          aria-hidden="true"
          className="absolute -top-1 w-full max-w-[340px] h-36 rounded-2xl overflow-hidden opacity-25 pointer-events-none"
        >
          <div className="w-full h-full bg-[radial-gradient(#5E2F66_1px,transparent_1px)] [background-size:16px_16px] animate-[pulse_4s_infinite]" />
        </div>
      )}

      {/* Main Sort Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={bookName}
          initial={isReducedMotion ? { opacity: 0 } : { x: 80, opacity: 0 }}
          animate={status !== 'idle' ? status : { x: 0, opacity: 1, scale: 1 }}
          exit={isReducedMotion ? { opacity: 0 } : { scale: 0.85, opacity: 0 }}
          variants={shakeVariants}
          transition={{ duration: 0.16, ease: 'easeOut' }}
          className="relative z-10 w-[min(86%,320px)] h-[140px] rounded-3xl bg-[#E8D2E8] text-[#5E2F66] shadow-lg border border-[#5E2F66]/15 flex flex-col items-center justify-center p-4 text-center select-none"
          role="region"
          aria-label={bookName}
        >
          {/* Book Title */}
          <h2
            className={`font-black font-sans tracking-tight leading-snug drop-shadow-sm ${fontSizeClass}`}
          >
            {bookName}
          </h2>

          {/* Book order caption ONLY in practice mode */}
          {practiceMode && bookOrder !== undefined && (
            <p className="mt-2 text-xs font-bold tracking-wider uppercase opacity-75">
              Book {bookOrder} of 66
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
