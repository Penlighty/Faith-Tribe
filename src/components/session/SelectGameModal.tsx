import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Icon, GameBadge } from '../../design/icons';
import { gameRegistry } from '../../engine/registry';
import { useTheme } from '../../theme/ThemeContext';

export interface SelectGameModalProps {
  isOpen: boolean;
  title?: string;
  subtitle?: string;
  selectedGameId?: string;
  onSelectGame: (gameId: string) => void;
  onCancel: () => void;
}

export const SelectGameModal: React.FC<SelectGameModalProps> = ({
  isOpen,
  title = 'Select Game to Host',
  subtitle = 'Choose which biblical challenge you would like your disciples to play.',
  selectedGameId,
  onSelectGame,
  onCancel,
}) => {
  const { triggerHaptic } = useTheme();
  const games = gameRegistry.getAllMeta();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <Card
        variant="elevated"
        padding="lg"
        className="w-full max-w-2xl bg-[var(--surface-card)] border-2 border-[var(--border-tint)] shadow-2xl rounded-3xl flex flex-col gap-4 relative overflow-hidden animate-scaleUp max-h-[90vh]"
      >
        {/* Close Button */}
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

        {/* Header */}
        <div className="flex flex-col gap-1 pr-8">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--primary-action)] flex items-center gap-1.5">
            <Icon name="host" size={14} /> Sacred Fellowship
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--on-container)]">
            {title}
          </h2>
          <p className="text-xs text-[var(--on-container-variant)]">
            {subtitle}
          </p>
        </div>

        {/* Games List (Scrollable) */}
        <div className="flex flex-col gap-2.5 overflow-y-auto pr-1 py-1 max-h-[60vh]">
          {games.map((g) => {
            const isSelected = selectedGameId === g.id;

            return (
              <button
                key={g.id}
                type="button"
                onClick={() => {
                  triggerHaptic('medium');
                  onSelectGame(g.id);
                }}
                className={`p-3.5 sm:p-4 rounded-2xl border-2 text-left flex items-center justify-between gap-3.5 transition-all cursor-pointer group ${
                  isSelected
                    ? 'border-[var(--primary-action)] bg-[var(--primary-action)]/10 shadow-sm'
                    : 'border-[var(--border-tint)] bg-[var(--surface-container)] hover:border-[var(--primary-action)]/50 hover:bg-[var(--surface-container-high)]'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="shrink-0 transition-transform group-hover:scale-105">
                    <GameBadge game={g.id} size={44} variant="tonal" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm sm:text-base text-[var(--on-container)] tracking-tight">
                        {g.name}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--surface-card)] text-[var(--on-container-variant)] border border-[var(--border-tint)]">
                        {g.categoryTag}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Active Selection
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--on-container-variant)] line-clamp-1 mt-0.5">
                      {g.tagline}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-[var(--on-container-variant)]/80 mt-1 font-mono">
                      <span>👥 {g.minPlayers}–{g.maxPlayers} players</span>
                      <span>⏱️ ~{g.estimatedMinutes} mins</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  <span className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    isSelected
                      ? 'bg-[var(--primary-action)] text-white shadow-xs'
                      : 'bg-[var(--surface-card)] text-[var(--on-container)] border border-[var(--border-tint)] group-hover:border-[var(--primary-action)]'
                  }`}>
                    {isSelected ? 'Selected' : 'Choose'}
                    <Icon name="arrow-right" size={12} />
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-[var(--border-tint)] flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="font-bold text-xs"
          >
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
};
