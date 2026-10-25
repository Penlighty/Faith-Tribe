import React from 'react';
import { MasteryMap, BookAccuracy } from './MasteryMap';
import { ShelfRushRunLog, ShelfRushConfig } from '../engine/types';
import { getBook, getScheme } from '../engine/loader';

export interface LeaderboardEntry {
  playerId: string;
  name: string;
  score: number;
  completionPct: number;
  totalTimeMs: number;
  rank: number;
  badges: string[];
}

export interface ResultsViewProps {
  score: number;
  status: 'won' | 'lost' | 'finished';
  config: ShelfRushConfig;
  log: ShelfRushRunLog[];
  bestStreak: number;
  totalCards: number;
  cardsCompleted: number;
  leaderboard?: LeaderboardEntry[];
  myPlayerId?: string;
  onPlayAgain: () => void;
  onChangeSettings: () => void;
  onDone: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  score,
  status,
  config,
  log,
  bestStreak,
  totalCards,
  cardsCompleted,
  leaderboard,
  myPlayerId,
  onPlayAgain,
  onChangeSettings,
  onDone,
}) => {
  const isAscent = config.mode === 'ascent';
  const isWin = status === 'won' || status === 'finished';
  const headline = isAscent && isWin
    ? 'Summit reached'
    : isWin
    ? 'Deck complete'
    : 'Run over';

  const completionPct =
    totalCards > 0 ? Math.min(100, Math.round((cardsCompleted / totalCards) * 100)) : 0;

  // Compute total time
  const totalTimeMs = log.reduce((sum, item) => sum + item.ms, 0);
  const totalSeconds = Math.round(totalTimeMs / 1000);
  const formattedTime = `${Math.floor(totalSeconds / 60)}m ${totalSeconds % 60}s`;

  // Badges
  const badges: string[] = [];
  const totalMisses = log.filter((l) => !l.correct).length;
  if (totalMisses === 0 && cardsCompleted === totalCards && totalCards > 0) {
    badges.push('Perfect');
  }
  if (isAscent && isWin) {
    badges.push('Summit');
  }
  if (config.speed === 'blitz' && isWin) {
    badges.push('Blitz');
  }

  // Aggregate stats per book for MasteryMap
  const statsByBook: Record<string, BookAccuracy> = {};
  const missFrequency: Record<string, { count: number; bookId: string; schemeId: string }> = {};

  for (const item of log) {
    if (!statsByBook[item.bookId]) {
      statsByBook[item.bookId] = { seen: 0, misses: 0 };
    }
    statsByBook[item.bookId].seen += 1;
    if (!item.correct) {
      statsByBook[item.bookId].misses += 1;
      const key = `${item.bookId}|${item.schemeId}`;
      if (!missFrequency[key]) {
        missFrequency[key] = { count: 0, bookId: item.bookId, schemeId: item.schemeId };
      }
      missFrequency[key].count += 1;
    }
  }

  // Top 5 most missed pairs
  const mostMissed = Object.values(missFrequency)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((m) => {
      const book = getBook(m.bookId);
      const scheme = getScheme(m.schemeId);
      const correctBinId = scheme?.assign[m.bookId];
      const correctBin = scheme?.bins.find((b) => b.id === correctBinId);
      return {
        bookName: book?.name || m.bookId,
        schemeName: scheme?.name || m.schemeId,
        correctBinLabel: correctBin?.label || correctBinId || 'Unknown',
        count: m.count,
      };
    });

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-6 py-4 px-2 select-none animate-in fade-in">
      {/* Hero Headline */}
      <div className="text-center flex flex-col items-center gap-1.5 bg-gradient-to-b from-purple-500/10 to-transparent p-6 rounded-3xl border border-purple-500/20">
        <span className="text-4xl">{isWin ? '🏆' : '🏁'}</span>
        <h1 className="text-3xl font-black text-[var(--on-surface)] tracking-tight">
          {headline}
        </h1>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-6xl font-black font-mono text-purple-600 dark:text-purple-400">
            {completionPct}%
          </span>
          <span className="text-sm font-bold text-[var(--on-container-variant)]">completed</span>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="flex items-center gap-2 mt-3">
            {badges.map((b) => (
              <span
                key={b}
                className="px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-amber-950 shadow-sm"
              >
                ★ {b}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-2xl bg-[var(--surface-container)] border border-[var(--border-tint)] text-center">
          <span className="text-[11px] font-bold text-[var(--on-container-variant)] uppercase">
            Total Points
          </span>
          <div className="text-xl font-mono font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
            {score.toLocaleString()}
          </div>
        </div>
        <div className="p-3 rounded-2xl bg-[var(--surface-container)] border border-[var(--border-tint)] text-center">
          <span className="text-[11px] font-bold text-[var(--on-container-variant)] uppercase">
            Time Taken
          </span>
          <div className="text-xl font-mono font-black text-[var(--on-container)] mt-0.5">
            {formattedTime}
          </div>
        </div>
        <div className="p-3 rounded-2xl bg-[var(--surface-container)] border border-[var(--border-tint)] text-center">
          <span className="text-[11px] font-bold text-[var(--on-container-variant)] uppercase">
            Best Streak
          </span>
          <div className="text-xl font-mono font-black text-amber-500 mt-0.5">
            {bestStreak} 🔥
          </div>
        </div>
        <div className="p-3 rounded-2xl bg-[var(--surface-container)] border border-[var(--border-tint)] text-center">
          <span className="text-[11px] font-bold text-[var(--on-container-variant)] uppercase">
            Misses
          </span>
          <div className="text-xl font-mono font-black text-rose-500 mt-0.5">
            {totalMisses}
          </div>
        </div>
      </div>

      {/* Multiplayer Leaderboard if in Race mode */}
      {leaderboard && leaderboard.length > 0 && (
        <div className="flex flex-col gap-2 p-4 rounded-3xl bg-[var(--surface-container)] border border-[var(--border-tint)]">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--on-container)]">
            Race Standings
          </h3>
          <div className="flex flex-col gap-1.5 mt-1">
            {leaderboard.map((entry) => {
              const isMe = entry.playerId === myPlayerId;
              return (
                <div
                  key={entry.playerId}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                    isMe
                      ? 'bg-purple-100 dark:bg-purple-950/50 border-purple-400 font-bold'
                      : 'bg-[var(--surface)] border-[var(--border-tint)]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black w-5 text-center">
                      {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                    </span>
                    <span>{entry.name} {isMe ? '(You)' : ''}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span>{entry.completionPct}%</span>
                    <span className="font-black text-purple-600 dark:text-purple-400">
                      {entry.score} pts
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Most Missed Pairs */}
      {mostMissed.length > 0 && (
        <div className="flex flex-col gap-2 p-4 rounded-3xl bg-[var(--surface-container)] border border-[var(--border-tint)]">
          <h3 className="text-sm font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Most Missed This Run
          </h3>
          <div className="flex flex-col gap-1.5">
            {mostMissed.map((m, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-xl bg-[var(--surface)] border border-[var(--border-tint)] text-xs"
              >
                <div>
                  <strong className="text-[var(--on-container)]">{m.bookName}</strong>
                  <span className="text-[var(--on-container-variant)] ml-1">
                    ({m.schemeName})
                  </span>
                </div>
                <div className="font-bold text-emerald-600 dark:text-emerald-400">
                  → {m.correctBinLabel}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mastery Map */}
      <MasteryMap statsByBook={statsByBook} />

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={onPlayAgain}
          className="flex-1 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-sm shadow-lg transition-all active:scale-[0.98]"
        >
          Play Again ⚡
        </button>
        <button
          onClick={onChangeSettings}
          className="flex-1 py-3.5 rounded-2xl bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] text-[var(--on-container)] font-bold text-sm border border-[var(--border-tint)] transition-all"
        >
          Change Settings
        </button>
        <button
          onClick={onDone}
          className="py-3.5 px-6 rounded-2xl bg-gray-200 dark:bg-gray-800 text-[var(--on-surface)] font-bold text-sm transition-all"
        >
          Done
        </button>
      </div>
    </div>
  );
};
