import React from 'react';
import { CheckCircle2, XCircle, Share2, Flag } from 'lucide-react';
import { GamifiedButton } from './GamifiedButton';
import { GamifiedMascot, BiblicalCharacterId } from './GamifiedMascot';
import { Icon } from '../../design/icons';

export interface GamifiedFeedbackSheetProps {
  isCorrect: boolean;
  character?: BiblicalCharacterId;
  title?: string;
  correctAnswer?: string;
  explanation?: string;
  onContinue: () => void;
  onExplain?: () => void;
}

export const GamifiedFeedbackSheet: React.FC<GamifiedFeedbackSheetProps> = ({
  isCorrect,
  character = 'david',
  title,
  correctAnswer,
  explanation,
  onContinue,
  onExplain,
}) => {
  const defaultTitle = isCorrect ? 'Amazing!' : 'Almost!';

  return (
    <div
      className={`fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 pb-8 border-t-2 animate-sheet-up shadow-2xl ${
        isCorrect
          ? 'bg-[var(--c-green-tint)] border-[var(--c-green-border)] text-[var(--c-green-lip)]'
          : 'bg-[var(--c-red-tint)] border-[var(--c-red)] text-[var(--c-red-lip)]'
      }`}
    >
      <div className="max-w-xl mx-auto flex flex-col gap-4">
        {/* Top Row: Icon + Title + Mascot + Action Icons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isCorrect ? (
              <CheckCircle2 size={36} strokeWidth={3} className="text-[var(--c-green-lip)]" />
            ) : (
              <XCircle size={36} strokeWidth={3} className="text-[var(--c-red-lip)]" />
            )}
            <div className="flex flex-col">
              <h3 className="text-2xl font-black tracking-tight leading-tight">
                {title || defaultTitle}
              </h3>
              {!isCorrect && correctAnswer && (
                <p className="text-sm font-bold text-[var(--c-text)] mt-0.5">
                  Correct solution: <span className="underline">{correctAnswer}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <GamifiedMascot character={character} pose={isCorrect ? 'cheer' : 'sad'} size={60} showGroundShadow={false} />
            </div>
            <button
              type="button"
              className="p-2 rounded-full hover:bg-black/5 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
              aria-label="Share"
            >
              <Share2 size={20} />
            </button>
            <button
              type="button"
              className="p-2 rounded-full hover:bg-black/5 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
              aria-label="Report"
            >
              <Flag size={20} />
            </button>
          </div>
        </div>

        {/* Optional scripture explanation note */}
        {explanation && (
          <div className="text-xs font-semibold text-[var(--c-text-2)] italic bg-white/70 dark:bg-black/20 p-2.5 rounded-xl border border-[var(--c-border)] flex items-center gap-2">
            <Icon name="book-open" size={14} className="shrink-0 text-[var(--c-primary)]" />
            <span>{explanation}</span>
          </div>
        )}

        {/* Bottom CTA Row */}
        <div className="flex items-center gap-3 w-full mt-1">
          {onExplain && isCorrect && (
            <GamifiedButton
              variant="outline"
              fullWidth={false}
              onClick={onExplain}
              className="hidden sm:inline-flex shrink-0 !h-12 !px-4 !text-sm"
            >
              EXPLAIN
            </GamifiedButton>
          )}
          <GamifiedButton
            variant={isCorrect ? 'green' : 'red'}
            fullWidth={true}
            onClick={onContinue}
            autoFocus
          >
            CONTINUE
          </GamifiedButton>
        </div>
      </div>
    </div>
  );
};
