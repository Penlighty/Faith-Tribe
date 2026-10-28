import React, { useEffect, useRef } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Icon } from '../../design/icons';
import { soundManager } from '../../engine/services/audio';
import { fireConfettiBurst } from './StreakCelebration';
import { recordSoloPracticeScore } from '../../theme/gamifiedTokens';

export interface PracticeSummaryModalProps {
  isOpen: boolean;
  title?: string;
  subtitle?: string;
  icon?: string;
  score: number;
  bestStreak: number;
  onRestart: () => void;
  onExit: () => void;
  onClose?: () => void;
}

export const PracticeSummaryModal: React.FC<PracticeSummaryModalProps> = ({
  isOpen,
  title = 'Practice Complete',
  subtitle = "You tested your discernment on God's Word!",
  icon = '📜',
  score,
  bestStreak,
  onRestart,
  onExit,
  onClose,
}) => {
  const hasAwardedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      hasAwardedRef.current = false;
      return;
    }
    soundManager.playStreakMilestone(5);
    if (score > 0 && !hasAwardedRef.current) {
      hasAwardedRef.current = true;
      fireConfettiBurst('light');
      recordSoloPracticeScore('practice', score);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, score, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn select-none">
      <Card className="max-w-sm w-full p-6 text-center shadow-2xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-scaleUp relative">
        {/* Optional close / dismiss button to resume if tapped accidentally */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Resume playing"
            title="Resume playing"
          >
            <Icon name="close" size={16} />
          </button>
        )}

        {/* Top Emoji / Icon */}
        <div className="text-5xl mb-2">{icon}</div>

        {/* Title */}
        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mb-1 tracking-tight">
          {title}
        </h3>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-5 max-w-xs mx-auto leading-relaxed">
          {subtitle}
        </p>

        {/* Stat Box (Final Score & Best Streak) */}
        <div className="bg-slate-100 dark:bg-slate-800/90 rounded-2xl p-4 mb-6 flex justify-around items-center border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
          <div className="flex-1 text-center">
            <div className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-0.5">Final Score</div>
            <div className="text-2xl sm:text-3xl font-black text-cyan-600 dark:text-cyan-400 font-mono">
              {score}
            </div>
          </div>
          <div className="w-px h-10 bg-slate-200 dark:bg-slate-700" />
          <div className="flex-1 text-center">
            <div className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-0.5">Best Streak</div>
            <div className="text-2xl sm:text-3xl font-black text-amber-500 font-mono">
              {bestStreak}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <Button
            variant="primary"
            className="w-full py-3.5 text-sm font-bold uppercase tracking-wide rounded-2xl shadow-md flex items-center justify-center gap-1.5"
            onClick={onRestart}
          >
            Play Again ↺
          </Button>
          <Button
            variant="outlined"
            className="w-full py-2.5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl"
            onClick={onExit}
          >
            Exit Practice
          </Button>
        </div>
      </Card>
    </div>
  );
};
