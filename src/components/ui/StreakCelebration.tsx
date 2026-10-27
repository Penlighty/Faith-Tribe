import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { StreakMilestone } from '../../engine/services/streakRewards';
import { Button } from './Button';
import { Icon } from '../../design/icons';

/**
 * Trigger confetti blast using canvas-confetti
 */
export function fireConfettiBurst(intensity: 'light' | 'medium' | 'high' = 'medium') {
  try {
    if (typeof window === 'undefined') return;

    if (intensity === 'light') {
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.7 },
        colors: ['#10B981', '#34D399', '#6EE7B7', '#F59E0B'],
      });
    } else if (intensity === 'medium') {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366F1', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'],
      });
    } else {
      // High intensity (Elijah Level / Milestones)
      confetti({
        particleCount: 90,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#10B981', '#3B82F6'],
      });
      // Second staggered wave
      setTimeout(() => {
        confetti({
          particleCount: 40,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 40,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 200);
    }
  } catch {
    // Non-critical if canvas is blocked
  }
}

// -------------------------------------------------------------
// 1. Toast / Floating Banner for immediate answer feedback
// -------------------------------------------------------------
export interface AnswerFeedbackProps {
  isCorrect: boolean;
  message: string;
  pointsEarned?: number;
  streakCount?: number;
  streak?: number;
  onDismiss?: () => void;
}

export const AnswerFeedbackBanner: React.FC<AnswerFeedbackProps> = ({
  isCorrect,
  message,
  pointsEarned,
  streakCount,
  streak,
  onDismiss,
}) => {
  const count = streakCount ?? streak ?? 0;
  return (
    <div
      className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-full shadow-2xl backdrop-blur-md border animate-bounce ${
        isCorrect
          ? 'bg-emerald-600/95 text-white border-emerald-400 shadow-emerald-500/30'
          : 'bg-rose-700/95 text-white border-rose-400 shadow-rose-500/30'
      }`}
      style={{
        animation: 'bounce 0.8s ease-in-out infinite alternate',
      }}
    >
      <span className="flex items-center justify-center">
        {isCorrect ? (
          count >= 7 ? (
            <div className="flex items-center gap-0.5 text-amber-300">
              <Icon name="bolt" size={20} />
              <Icon name="flame" size={20} />
            </div>
          ) : count >= 3 ? (
            <Icon name="flame" size={20} className="text-amber-400" />
          ) : (
            <Icon name="star" size={20} className="text-yellow-300" />
          )
        ) : (
          <Icon name="heart" size={20} className="text-white/60" />
        )}
      </span>
      <div className="flex flex-col text-left">
        <span className="text-sm font-black tracking-wide leading-tight">{message}</span>
        {isCorrect && pointsEarned !== undefined && pointsEarned > 0 && (
          <span className="text-xs font-semibold text-emerald-100 font-mono">
            +{pointsEarned} Points {count >= 2 ? `• ${count} in a row!` : ''}
          </span>
        )}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="ml-2 text-white/70 hover:text-white transition-colors"
          aria-label="Dismiss feedback"
        >
          <Icon name="close" size={16} />
        </button>
      )}
    </div>
  );
};

// -------------------------------------------------------------
// 2. Tactile Gamified Streak Celebration Modal
// -------------------------------------------------------------
export interface StreakMilestoneModalProps {
  milestone: StreakMilestone;
  onDismiss?: () => void;
  onClose?: () => void;
}

export const StreakMilestoneModal: React.FC<StreakMilestoneModalProps> = ({
  milestone,
  onDismiss,
  onClose,
}) => {
  const handleDismiss = onDismiss || onClose;

  useEffect(() => {
    fireConfettiBurst('high');
  }, [milestone]);

  // Keyboard dismissal on Escape, Enter, or Space
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleDismiss?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDismiss]);

  const isElijah = milestone.count === 7;
  const isSolomon = milestone.count === 10;

  return (
    <div
      onClick={handleDismiss}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-sm rounded-3xl p-6 sm:p-8 text-center flex flex-col items-center gap-4 relative overflow-hidden shadow-2xl border-4 cursor-default ${
          isElijah
            ? 'bg-gradient-to-b from-amber-950 via-zinc-900 to-black border-amber-500 text-white shadow-amber-500/50'
            : isSolomon
            ? 'bg-gradient-to-b from-purple-950 via-zinc-900 to-black border-purple-400 text-white shadow-purple-500/50'
            : 'bg-gradient-to-b from-zinc-900 to-zinc-950 border-amber-400/80 text-white shadow-amber-400/30'
        }`}
      >
        {/* Glowing aura background circle */}
        <div
          className={`absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-40 ${
            isElijah ? 'bg-amber-500' : isSolomon ? 'bg-purple-500' : 'bg-emerald-500'
          }`}
        />

        {/* Level Tag Pill */}
        <span
          className={`px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest border ${
            isElijah
              ? 'bg-amber-500/20 text-amber-300 border-amber-400/60'
              : isSolomon
              ? 'bg-purple-500/20 text-purple-300 border-purple-400/60'
              : 'bg-white/10 text-amber-300 border-amber-300/40'
          }`}
        >
          {milestone.levelTag}
        </span>

        {/* Big Animated Icon / Badge */}
        <div className="relative my-2">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/20 text-amber-400 flex items-center justify-center animate-pulse select-none filter drop-shadow-[0_0_20px_rgba(245,158,11,0.6)] border border-amber-400/40">
            <Icon name={milestone.icon} size={44} />
          </div>
          <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-amber-500 text-zinc-950 font-black text-xs font-mono shadow-md">
            {milestone.count}x
          </div>
        </div>

        {/* Milestone Title */}
        <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
          {milestone.title}
        </h3>

        {/* Biblical / Uplifting Subtitle */}
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-xs font-medium">
          {milestone.subtitle}
        </p>

        {/* Action Button */}
        <div className="w-full mt-2">
          <Button
            variant="primary"
            size="lg"
            pill
            onClick={handleDismiss}
            className={`w-full font-black tracking-wide shadow-lg ${
              isElijah
                ? '!bg-gradient-to-r !from-amber-500 !to-rose-500 !text-black !border-none'
                : isSolomon
                ? '!bg-gradient-to-r !from-purple-500 !to-indigo-500 !text-white !border-none'
                : '!bg-amber-500 !text-black !border-none'
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <span>Keep Crushing It!</span>
              <Icon name="flame" size={18} />
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};
