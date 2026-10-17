import React, { useEffect } from 'react';
import { Icon } from '../../design/icons';
import { Button } from './Button';
import { Card } from './Card';
import { useTheme } from '../../theme/ThemeContext';

export interface LeaveConfirmationModalProps {
  isOpen: boolean;
  isMultiplayer: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const LeaveConfirmationModal: React.FC<LeaveConfirmationModalProps> = ({
  isOpen,
  isMultiplayer,
  onConfirm,
  onCancel,
}) => {
  const { triggerHaptic } = useTheme();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <Card
        variant="elevated"
        padding="lg"
        className="w-full max-w-md bg-[var(--surface-card)] border-2 border-[var(--border-tint)] shadow-2xl rounded-3xl flex flex-col items-center text-center gap-4 relative overflow-hidden animate-scaleUp"
      >
        {/* Close icon button */}
        <button
          onClick={() => {
            triggerHaptic('light');
            onCancel();
          }}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] text-[var(--on-container-variant)] flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close"
        >
          <Icon name="close" size={16} />
        </button>

        {/* Warning Icon Badge */}
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm ${
          isMultiplayer
            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300'
        }`}>
          <Icon name={isMultiplayer ? 'flag' : 'info'} size={32} />
        </div>

        {/* Heading */}
        <div className="flex flex-col gap-1.5 px-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--on-container-variant)]">
            {isMultiplayer ? 'Active Multiplayer Session' : 'Solo Practice In Progress'}
          </span>
          <h2 className="text-2xl font-black text-[var(--on-container)]">
            {isMultiplayer ? 'Leave Multiplayer Game?' : 'End Practice Game?'}
          </h2>
          <p className="text-sm font-medium text-[var(--on-container-variant)] leading-relaxed mt-1">
            {isMultiplayer
              ? 'Leaving now will remove you from this game. Other players in the room will continue playing without you.'
              : 'Leaving now will end your practice session and discard your current score and streak.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
          <Button
            variant="tonal"
            size="lg"
            className="w-full order-2 sm:order-1 font-bold"
            onClick={() => {
              triggerHaptic('light');
              onCancel();
            }}
          >
            {isMultiplayer ? 'Stay in Game' : 'Continue Playing'}
          </Button>

          <button
            onClick={() => {
              triggerHaptic('heavy');
              onConfirm();
            }}
            className="w-full order-1 sm:order-2 py-3 px-5 rounded-full font-black text-sm bg-rose-600 hover:bg-rose-700 text-white shadow-md active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            {isMultiplayer ? 'Leave Game' : 'End Game'}
          </button>
        </div>
      </Card>
    </div>
  );
};
