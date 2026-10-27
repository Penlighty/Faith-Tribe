import React, { useState, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { BibleOrNotItem } from '../../engine/content/schemas';
import { BibleOrNotChoice } from './types';
import { useTheme } from '../../theme/ThemeContext';
import { soundManager } from '../../engine/services/audio';

export interface FlashcardDeckProps {
  card: BibleOrNotItem;
  nextCard?: BibleOrNotItem;
  thirdCard?: BibleOrNotItem;
  onSwipe: (choice: BibleOrNotChoice) => void;
  disabled?: boolean;
  selectedChoice?: BibleOrNotChoice | null;
  showReveal?: boolean;
  isCorrect?: boolean;
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({
  card,
  nextCard,
  thirdCard,
  onSwipe,
  disabled = false,
  selectedChoice = null,
  showReveal = false,
  isCorrect,
}) => {
  const { triggerHaptic } = useTheme();
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);

  // Framer Motion drag values
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 0, 250], [-14, 0, 14]);

  // Opacity of "IN THE BIBLE" (Right) and "NOT IN BIBLE" (Left) indicator badges during drag
  const rightBadgeDragOpacity = useTransform(x, [20, 80], [0, 1]);
  const leftBadgeDragOpacity = useTransform(x, [-20, -80], [0, 1]);

  // Reset motion value when card changes
  useEffect(() => {
    x.set(0);
    setExitDirection(null);
  }, [card.id, x]);

  const handleChoice = useCallback(
    (choice: BibleOrNotChoice) => {
      if (disabled) return;
      triggerHaptic('medium');
      soundManager.playTick();

      const targetX = choice === 'IN_BIBLE' ? 70 : -70;
      setExitDirection(choice === 'IN_BIBLE' ? 'right' : 'left');

      animate(x, targetX, {
        duration: 0.16,
        ease: 'easeOut',
        onComplete: () => {
          onSwipe(choice);
          // Spring back smoothly so the explanation is visible and centered
          animate(x, 0, { type: 'spring', damping: 20, stiffness: 280 });
        },
      });
    },
    [disabled, onSwipe, triggerHaptic, x]
  );

  // Keyboard navigation for desktop: Left Arrow / Right Arrow
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled || showReveal) return;
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        e.preventDefault();
        handleChoice('NOT_IN_BIBLE');
      } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        e.preventDefault();
        handleChoice('IN_BIBLE');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, showReveal, handleChoice]);

  // Handle drag end threshold
  const handleDragEnd = (_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    if (disabled || showReveal) return;

    const swipeThreshold = 50;
    const velocityThreshold = 250;

    if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
      handleChoice('IN_BIBLE');
    } else if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
      handleChoice('NOT_IN_BIBLE');
    } else {
      // Spring back to center
      animate(x, 0, { type: 'spring', damping: 20, stiffness: 300 });
    }
  };

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* 3D Flashcard Deck Container */}
      <div className="relative w-full max-w-md h-[340px] sm:h-[380px] flex items-center justify-center perspective-[1000px]">
        {/* Layer 3: Bottom card shadow layer */}
        {thirdCard && (
          <div
            className="absolute w-[88%] h-[300px] sm:h-[340px] rounded-3xl bg-slate-200/60 dark:bg-slate-800/60 border border-slate-300/40 dark:border-slate-700/40 shadow-sm translate-y-7 scale-[0.88] pointer-events-none transition-all duration-300"
            aria-hidden="true"
          />
        )}

        {/* Layer 2: Next card peek */}
        {nextCard && (
          <div
            className="absolute w-[94%] h-[315px] sm:h-[355px] rounded-3xl bg-white/80 dark:bg-slate-800/80 border border-slate-300/60 dark:border-slate-700/60 shadow-md translate-y-3.5 scale-[0.94] pointer-events-none transition-all duration-300 flex flex-col p-6 overflow-hidden opacity-90"
            aria-hidden="true"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400">
                {nextCard.category}
              </span>
              <span className="text-xs font-semibold text-slate-400">Tier {nextCard.tier}</span>
            </div>
            <div className="flex-1 flex items-center justify-center text-center">
              <p className="text-base sm:text-lg font-serif font-medium text-slate-400 dark:text-slate-500 line-clamp-3 blur-[0.5px]">
                "{nextCard.text}"
              </p>
            </div>
          </div>
        )}

        {/* Layer 1: Top Interactive Card */}
        <motion.div
          style={{ x, rotate }}
          drag={disabled || showReveal ? false : 'x'}
          dragConstraints={{ left: -250, right: 250 }}
          dragElastic={0.35}
          onDragEnd={handleDragEnd}
          whileTap={disabled || showReveal ? {} : { scale: 0.99, cursor: 'grabbing' }}
          className={`absolute w-full h-[325px] sm:h-[365px] rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl border cursor-grab active:cursor-grabbing backdrop-blur-md transition-colors duration-200 ${
            showReveal
              ? isCorrect
                ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 shadow-emerald-500/20'
                : 'bg-rose-50 dark:bg-rose-950/80 border-rose-500 shadow-rose-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/80'
          }`}
        >
          {/* Visual Swiping Overlay Stamps during drag */}
          {!showReveal && (
            <>
              <motion.div
                style={{ opacity: rightBadgeDragOpacity }}
                className="absolute top-6 left-6 z-20 pointer-events-none px-4 py-1.5 rounded-2xl border-2 border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm sm:text-base tracking-wider uppercase transform -rotate-12 flex items-center gap-1.5 shadow-sm"
              >
                <span>📖</span>
                <span>IN THE BIBLE</span>
              </motion.div>

              <motion.div
                style={{ opacity: leftBadgeDragOpacity }}
                className="absolute top-6 right-6 z-20 pointer-events-none px-4 py-1.5 rounded-2xl border-2 border-rose-500 bg-rose-500/15 text-rose-600 dark:text-rose-400 font-extrabold text-sm sm:text-base tracking-wider uppercase transform rotate-12 flex items-center gap-1.5 shadow-sm"
              >
                <span>❌</span>
                <span>NOT IN BIBLE</span>
              </motion.div>
            </>
          )}

          {/* Card Top Meta Header */}
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[11px] font-bold tracking-wider uppercase px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-200 border border-cyan-200/50 dark:border-cyan-800/50">
              {card.category}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Tier {card.tier}
            </span>
          </div>

          {/* Card Center: The Quote / Phrase */}
          <div className="flex-1 flex flex-col items-center justify-center text-center my-3 px-2 relative z-10">
            <p className="text-lg sm:text-2xl font-serif font-bold text-slate-800 dark:text-slate-100 leading-snug tracking-tight">
              "{card.text}"
            </p>

            {/* Revealed Answer & Explanation */}
            {showReveal && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 text-xs sm:text-sm text-left w-full shadow-inner"
              >
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  {card.answer === 'IN_BIBLE' ? (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      📖 In the Bible: {card.reference || 'Scripture'}
                    </span>
                  ) : (
                    <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      ❌ Not in the Bible
                    </span>
                  )}
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[13px]">
                  {card.explanation}
                </p>
                {card.misconception && (
                  <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-300 italic">
                    Note: {card.misconception}
                  </p>
                )}
              </motion.div>
            )}
          </div>

          {/* Card Footer: Subtle Hint & Drag Instruction */}
          <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 font-medium border-t border-slate-100 dark:border-slate-800 pt-3 relative z-10">
            <span className="flex items-center gap-1 text-[11px]">
              <span className="inline-block w-2 h-2 rounded-full bg-rose-400" />
              Swipe Left: Not in Bible
            </span>
            <span className="flex items-center gap-1 text-[11px]">
              Swipe Right: In Bible
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
            </span>
          </div>
        </motion.div>
      </div>

      {/* Swipe Direction Action Buttons with Desktop Keyboard Badges */}
      <div className="w-full max-w-md mt-6 grid grid-cols-2 gap-4 px-2">
        {/* Left Button: NOT IN BIBLE */}
        <button
          type="button"
          onClick={() => handleChoice('NOT_IN_BIBLE')}
          disabled={disabled || showReveal}
          className={`flex items-center justify-center gap-2.5 py-4 px-4 rounded-2xl font-bold text-sm sm:text-base border border-b-4 transition-all duration-150 shadow-xs uppercase tracking-wider ${
            selectedChoice === 'NOT_IN_BIBLE'
              ? 'bg-rose-600 text-white border-rose-700 border-b-rose-800 ring-2 ring-rose-400 shadow-rose-500/20'
              : 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60 border-b-rose-300 dark:border-b-rose-950 hover:bg-rose-50/50'
          } ${disabled || showReveal ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-0.5 active:translate-y-1 active:border-b-2 cursor-pointer'}`}
        >
          <span className="text-lg">❌</span>
          <div className="flex flex-col items-start leading-tight">
            <span>NOT in Bible</span>
            <span className="text-[10px] font-normal opacity-70 hidden sm:inline normal-case">Press [ ← ]</span>
          </div>
        </button>

        {/* Right Button: IN THE BIBLE */}
        <button
          type="button"
          onClick={() => handleChoice('IN_BIBLE')}
          disabled={disabled || showReveal}
          className={`flex items-center justify-center gap-2.5 py-4 px-4 rounded-2xl font-bold text-sm sm:text-base border border-b-4 transition-all duration-150 shadow-xs uppercase tracking-wider ${
            selectedChoice === 'IN_BIBLE'
              ? 'bg-emerald-600 text-white border-emerald-700 border-b-emerald-800 ring-2 ring-emerald-400 shadow-emerald-500/20'
              : 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/60 border-b-emerald-300 dark:border-b-emerald-950 hover:bg-emerald-50/50'
          } ${disabled || showReveal ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-0.5 active:translate-y-1 active:border-b-2 cursor-pointer'}`}
        >
          <span className="text-lg">📖</span>
          <div className="flex flex-col items-start leading-tight">
            <span>IN the Bible</span>
            <span className="text-[10px] font-normal opacity-70 hidden sm:inline normal-case">Press [ → ]</span>
          </div>
        </button>
      </div>
    </div>
  );
};
