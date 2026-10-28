import React, { useMemo } from 'react';
import { GameViewProps } from '../../engine/types';
import { SearchTheScripturesState, SearchLevel } from './types';
import { scoreSearchTheScriptures } from './reducer';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Icon } from '../../design/icons';
import rawLevels from './content.json';

export const SearchTheScripturesHostView: React.FC<GameViewProps<SearchTheScripturesState>> = ({
  state,
  players = [],
  teams = [],
}) => {
  const levels: SearchLevel[] = useMemo(() => {
    return state?.levels && state.levels.length > 0 ? state.levels : (rawLevels as SearchLevel[]);
  }, [state?.levels]);

  const currentLevel = levels[(state?.roundNumber || 1) - 1] || levels[0];
  const leaderboard = useMemo(() => {
    return scoreSearchTheScriptures(state, players, teams);
  }, [state, players, teams]);

  const activityFeed = state?.activityFeed || [];

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 select-none animate-fadeIn pb-8">
      {/* Big Screen Header: Theme, Scripture, and Target */}
      <Card variant="tonal" padding="lg" className="flex flex-col gap-3 border border-[var(--border-tint)] shadow-md">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-[var(--primary-action)] text-[var(--primary-action-text)] font-black text-lg flex items-center justify-center shadow-sm">
              {currentLevel.level}
            </span>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary-action)]">
                {currentLevel.scripture}
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--on-container)]">
                {currentLevel.theme}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-full bg-[var(--surface-container)] border border-[var(--border-tint)] text-xs font-mono font-bold text-[var(--on-container)]">
              Target: {currentLevel.targetScore} pts
            </div>
            <div className="px-3.5 py-1.5 rounded-full bg-[var(--surface-container-high)] text-xs font-mono font-black text-[var(--primary-action)]">
              {currentLevel.words.length} Sacred Words
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[var(--on-container-variant)] italic">
          "{currentLevel.clue}"
        </p>

        {/* Word Bank Display for Room */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--border-tint)]/60">
          {currentLevel.words.map((w) => (
            <span
              key={w}
              className="px-2.5 py-1 rounded-lg bg-[var(--surface-card)] border border-[var(--border-tint)] font-mono text-xs font-bold text-[var(--on-container)]"
            >
              {w}
            </span>
          ))}
        </div>
      </Card>

      {/* Main Grid: Room Leaderboard (Left) + Live Activity Feed (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Fellowship Leaderboard Podium */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <Card variant="tonal" padding="md" className="flex flex-col gap-3 border border-[var(--border-tint)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--on-container-variant)] flex items-center gap-1.5">
                <Icon name="scoreboard" size={14} /> Room Standings
              </span>
              <span className="text-xs font-mono font-semibold text-[var(--on-container-variant)]">
                {leaderboard.length} Disciples
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {leaderboard.map((entry, idx) => {
                const prog = state?.playerProgress?.[entry.id];
                const isFinished = prog?.isFinished;
                const levelIdx = prog?.currentLevelIndex ?? 0;

                return (
                  <div
                    key={entry.id}
                    className={`p-3 rounded-2xl flex items-center justify-between border transition-all ${
                      idx === 0
                        ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                        : 'bg-[var(--surface-card)] border-[var(--border-tint)]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-sm font-black w-6 text-center text-[var(--on-container-variant)]">
                        #{entry.rank}
                      </span>
                      <Avatar name={entry.name} size="sm" teamColor={entry.teamColor} />
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-[var(--on-container)] truncate">
                            {entry.name}
                          </span>
                          {isFinished && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-emerald-500 text-white">
                              Rank Locked
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[var(--on-container-variant)] font-medium">
                          Level {levelIdx + 1} • {entry.secondaryScore || 0} words
                        </span>
                      </div>
                    </div>

                    <span className="font-mono text-base font-black tabular-nums text-[var(--primary-action)]">
                      {entry.score} pts
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right: Live Discovery Activity Feed */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <Card variant="tonal" padding="md" className="flex flex-col gap-3 border border-[var(--border-tint)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--on-container-variant)] flex items-center gap-1.5">
                <Icon name="bolt" size={14} className="text-amber-500" /> Live Feed
              </span>
              <span className="text-[10px] font-mono text-[var(--on-container-variant)]">
                Real-time
              </span>
            </div>

            {activityFeed.length === 0 ? (
              <div className="py-8 text-center text-xs font-semibold text-[var(--on-container-variant)]">
                Searching scriptures... first discoveries will appear here!
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1">
                {activityFeed.slice(0, 10).map((act) => (
                  <div
                    key={act.id}
                    className="p-2.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-tint)] flex items-center justify-between gap-2 text-xs animate-fadeIn"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="font-bold text-[var(--on-container)] truncate">{act.playerName}</span>
                      <span className="text-[var(--on-container-variant)] truncate">{act.text}</span>
                    </div>
                    <span className="font-mono text-[11px] font-black text-emerald-600 dark:text-emerald-400 shrink-0">
                      +{act.points}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
