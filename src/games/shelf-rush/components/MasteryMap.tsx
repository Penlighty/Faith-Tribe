import React, { useState } from 'react';
import { allBooks, ShelfRushBook } from '../engine/loader';
import { Icon } from '@design/icons';

export interface BookAccuracy {
  seen: number;
  misses: number;
}

export interface MasteryMapProps {
  statsByBook?: Record<string, BookAccuracy>;
  className?: string;
}

export const MasteryMap: React.FC<MasteryMapProps> = ({ statsByBook = {}, className = '' }) => {
  const [selectedBook, setSelectedBook] = useState<ShelfRushBook | null>(null);

  const getAccuracyState = (bookId: string) => {
    const stat = statsByBook[bookId];
    if (!stat || stat.seen === 0) {
      return { type: 'unseen', label: 'Unseen', pct: 0, seen: 0 };
    }
    const correct = Math.max(0, stat.seen - stat.misses);
    const pct = Math.round((correct / stat.seen) * 100);
    if (pct < 50) {
      return { type: 'low', label: '< 50%', pct, seen: stat.seen };
    }
    if (pct < 80) {
      return { type: 'medium', label: '50-80%', pct, seen: stat.seen };
    }
    return { type: 'high', label: '80%+', pct, seen: stat.seen };
  };

  return (
    <div className={`w-full flex flex-col gap-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--on-container)]">
          Mastery Map (66 Books)
        </h3>
        {/* Legend */}
        <div className="flex items-center gap-2 text-[11px] font-semibold text-[var(--on-container-variant)]">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded border border-gray-400 bg-transparent" />
            <span>New</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-rose-500/30 text-rose-600" />
            <span>&lt;50%</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-amber-500/30 text-amber-600" />
            <span>50-80%</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500/30 text-emerald-600" />
            <span>80%+</span>
          </span>
        </div>
      </div>

      {/* Grid: 6 columns x 11 rows */}
      <div
        className="grid grid-cols-6 gap-1.5 p-2 rounded-2xl bg-[var(--surface-container)] border border-[var(--border-tint)] select-none"
        role="grid"
        aria-label="66 Books Biblical Mastery Grid"
      >
        {allBooks.map((book) => {
          const acc = getAccuracyState(book.id);
          let styleClass =
            'border border-dashed border-gray-400/40 text-[var(--on-container-variant)] hover:bg-gray-100 dark:hover:bg-gray-800';
          let iconName: 'check' | 'close' | 'minus' | null = null;

          if (acc.type === 'low') {
            styleClass =
              'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-400/50 hover:bg-rose-500/30';
            iconName = 'close';
          } else if (acc.type === 'medium') {
            styleClass =
              'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-400/50 hover:bg-amber-500/30';
            iconName = 'minus';
          } else if (acc.type === 'high') {
            styleClass =
              'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-400/50 hover:bg-emerald-500/30';
            iconName = 'check';
          }

          return (
            <button
              key={book.id}
              type="button"
              onClick={() => setSelectedBook(book)}
              className={`h-11 rounded-lg flex flex-col items-center justify-center p-1 transition-all ${styleClass} focus:outline-none focus:ring-2 focus:ring-purple-400`}
              aria-label={`${book.name}: ${acc.label} accuracy`}
            >
              <span className="text-xs font-mono font-bold leading-none">{book.abbr}</span>
              <div className="flex items-center gap-0.5 mt-0.5" aria-hidden="true">
                {iconName ? (
                  <Icon name={iconName} size={10} />
                ) : (
                  <span className="text-[9px] opacity-40">·</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Screen Reader Table Fallback */}
      <table className="sr-only">
        <caption>Bible Books Mastery Details</caption>
        <thead>
          <tr>
            <th>Order</th>
            <th>Book</th>
            <th>Testament</th>
            <th>Accuracy</th>
          </tr>
        </thead>
        <tbody>
          {allBooks.map((b) => {
            const acc = getAccuracyState(b.id);
            return (
              <tr key={b.id}>
                <td>{b.order}</td>
                <td>{b.name}</td>
                <td>{b.testament}</td>
                <td>{acc.label}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Detail Popover / Modal when a book is tapped */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[var(--surface)] p-6 shadow-2xl border border-[var(--border-tint)] flex flex-col gap-4 text-[var(--on-surface)]">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold font-mono uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  {selectedBook.testament} · Book {selectedBook.order} of 66
                </span>
                <h4 className="text-2xl font-black">{selectedBook.name}</h4>
                <p className="text-xs text-[var(--on-container-variant)]">
                  {selectedBook.chapters} Chapters
                </p>
              </div>
              <button
                onClick={() => setSelectedBook(null)}
                className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-sm font-bold"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <p className="text-sm leading-relaxed text-[var(--on-container)] italic bg-[var(--surface-container)] p-3 rounded-xl border border-[var(--border-tint)]">
              "{selectedBook.blurb}"
            </p>

            {/* Accuracy stats */}
            {(() => {
              const acc = getAccuracyState(selectedBook.id);
              return (
                <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/50">
                  <span className="text-sm font-bold text-purple-900 dark:text-purple-200">
                    Mastery Accuracy
                  </span>
                  <span className="font-mono font-black text-base text-purple-700 dark:text-purple-300">
                    {acc.seen > 0 ? `${acc.pct}% (${acc.seen} seen)` : 'Not yet seen'}
                  </span>
                </div>
              );
            })()}

            <button
              onClick={() => setSelectedBook(null)}
              className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
