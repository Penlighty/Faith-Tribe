import React, { useState, useMemo } from 'react';
import {
  X,
  Calendar,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import {
  getAllChronicleDays,
  getAllActs,
  getDayOfYear,
  getChronicleDayStatus,
  formatDayDate,
  ChronicleDay,
  ChronicleAct,
  ChronicleDayStatus,
} from '../../engine/journey/chronicleCurriculum';
import { BiblicalCharacter, BiblicalCharacterId, BIBLICAL_CHARACTERS } from './GamifiedMascot';
import { useTheme } from '../../theme/ThemeContext';

export interface JourneyOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  completedDays: number[];
  onSelectDay: (dayNumber: number) => void;
  todayDayOfYear?: number;
}

type FilterTab = 'all' | 'completed' | 'missed' | 'upcoming';

export const JourneyOverviewModal: React.FC<JourneyOverviewModalProps> = ({
  isOpen,
  onClose,
  completedDays,
  onSelectDay,
  todayDayOfYear = getDayOfYear(),
}) => {
  const { triggerHaptic } = useTheme();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [expandedActs, setExpandedActs] = useState<Record<number, boolean>>(() => {
    // Expand the act containing today by default
    const acts = getAllActs();
    const currentAct = acts.find(
      (a) => todayDayOfYear >= a.startDay && todayDayOfYear <= a.endDay
    );
    const initial: Record<number, boolean> = {};
    acts.forEach((a) => {
      initial[a.actIndex] = currentAct ? a.actIndex === currentAct.actIndex : a.actIndex === 1;
    });
    return initial;
  });

  const allDays = useMemo(() => getAllChronicleDays(), []);
  const allActs = useMemo(() => getAllActs(), []);

  // Compute counts
  const completedCount = completedDays.length;
  const missedDays = useMemo(() => {
    return allDays.filter((d) => d.dayNumber < todayDayOfYear && !completedDays.includes(d.dayNumber));
  }, [allDays, todayDayOfYear, completedDays]);
  const missedCount = missedDays.length;
  const completionPercentage = Math.round((completedCount / 365) * 100);

  const toggleActExpanded = (actIndex: number) => {
    triggerHaptic('selection');
    setExpandedActs((prev) => ({
      ...prev,
      [actIndex]: !prev[actIndex],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl max-h-[92vh] bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border-2 border-[var(--c-border)] flex flex-col overflow-hidden select-none">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b-2 border-[var(--c-border)] flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/60">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400/20 border-2 border-amber-400 text-amber-600 flex items-center justify-center shadow-xs">
              <Calendar size={24} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                365-DAY BIBLICAL CHRONICLE
              </span>
              <h2 className="text-lg sm:text-xl font-black text-[var(--c-text)]">
                Genesis to Revelation Index
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-200 flex items-center justify-center transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Global Progress Bar & Stats */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500/10 via-teal-500/10 to-indigo-500/10 border-b border-[var(--c-border)]">
          <div className="flex items-center justify-between text-xs font-black text-[var(--c-text)] mb-2">
            <span>Overall Scripture Journey</span>
            <span className="font-mono text-amber-600 dark:text-amber-400">
              {completedCount} / 365 Days ({completionPercentage}%)
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-3.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(2, completionPercentage)}%` }}
            />
          </div>

          {/* Quick Stats Pills */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="p-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase block">
                  Completed
                </span>
                <span className="text-sm font-black text-emerald-900 dark:text-emerald-100 font-mono">
                  {completedCount} Days
                </span>
              </div>
            </div>

            <div className="p-2 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center gap-2">
              <AlertCircle size={18} className="text-amber-500 shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase block">
                  Catch-up
                </span>
                <span className="text-sm font-black text-amber-900 dark:text-amber-100 font-mono">
                  {missedCount} Missed
                </span>
              </div>
            </div>

            <div className="p-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-center gap-2">
              <Calendar size={18} className="text-indigo-500 shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase block">
                  Today
                </span>
                <span className="text-sm font-black text-indigo-900 dark:text-indigo-100 font-mono">
                  Day {todayDayOfYear}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Segmented Control */}
        <div className="px-4 py-2.5 border-b border-[var(--c-border)] flex items-center gap-2 overflow-x-auto bg-white dark:bg-zinc-900 scrollbar-none">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              setActiveFilter('all');
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-[var(--c-blue)] text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200'
            }`}
          >
            All 365 Days
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              setActiveFilter('completed');
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeFilter === 'completed'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200'
            }`}
          >
            Completed ({completedCount})
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              setActiveFilter('missed');
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeFilter === 'missed'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200'
            }`}
          >
            Catch Up ({missedCount})
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              setActiveFilter('upcoming');
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeFilter === 'upcoming'
                ? 'bg-zinc-600 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200'
            }`}
          >
            Upcoming (Locked)
          </button>
        </div>

        {/* Scrollable Acts and Days List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {allActs.map((act) => {
            const actDays = allDays.filter((d) => d.actIndex === act.actIndex);
            const actCompletedCount = actDays.filter((d) => completedDays.includes(d.dayNumber)).length;
            const isActExpanded = expandedActs[act.actIndex];

            // Filter days inside act
            const filteredDays = actDays.filter((d) => {
              const status = getChronicleDayStatus(d.dayNumber, completedDays, todayDayOfYear);
              if (activeFilter === 'completed') return status === 'completed';
              if (activeFilter === 'missed') return status === 'missed';
              if (activeFilter === 'upcoming') return status === 'locked';
              return true;
            });

            // If filter results in 0 days for this act, hide act unless 'all'
            if (filteredDays.length === 0 && activeFilter !== 'all') {
              return null;
            }

            return (
              <div
                key={act.actIndex}
                className="rounded-3xl border-2 border-[var(--c-border)] overflow-hidden bg-white dark:bg-zinc-900 shadow-xs"
              >
                {/* Act Header (Collapsible) */}
                <button
                  type="button"
                  onClick={() => toggleActExpanded(act.actIndex)}
                  className="w-full p-4 flex items-center justify-between text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer"
                  style={{
                    borderLeft: `6px solid ${act.color}`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <BiblicalCharacter character={act.characterId} pose="idle" size={44} showGroundShadow={false} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: act.color }}
                        >
                          Days {act.startDay}–{act.endDay}
                        </span>
                        <span className="text-xs font-bold text-zinc-500">
                          {actCompletedCount}/{act.totalDays} Done
                        </span>
                      </div>
                      <h3 className="text-base font-black text-[var(--c-text)] mt-0.5">
                        {act.actTitle}
                      </h3>
                      <p className="text-xs text-zinc-500 font-medium line-clamp-1">
                        {act.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-zinc-400">
                    {isActExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </button>

                {/* Expanded Days Grid */}
                {isActExpanded && (
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950/40 border-t border-[var(--c-border)] grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {filteredDays.map((day) => {
                      const status: ChronicleDayStatus = getChronicleDayStatus(
                        day.dayNumber,
                        completedDays,
                        todayDayOfYear
                      );
                      const isPlayable = status !== 'locked';

                      return (
                        <div
                          key={day.dayNumber}
                          onClick={() => {
                            if (isPlayable) {
                              triggerHaptic('medium');
                              onSelectDay(day.dayNumber);
                              onClose();
                            } else {
                              triggerHaptic('heavy');
                            }
                          }}
                          className={`p-3 rounded-2xl border-2 transition-all flex flex-col justify-between select-none ${
                            status === 'completed'
                              ? 'bg-emerald-500/10 border-emerald-500/40 hover:border-emerald-500 cursor-pointer'
                              : status === 'today'
                              ? 'bg-amber-400/15 border-amber-400 shadow-md ring-2 ring-amber-400/30 hover:scale-[1.01] cursor-pointer'
                              : status === 'missed'
                              ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60 hover:border-amber-500 cursor-pointer'
                              : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 opacity-60 cursor-not-allowed'
                          }`}
                        >
                          <div>
                            {/* Day Badge & Status Row */}
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 font-mono">
                                Day {day.dayNumber} • {formatDayDate(day.dayNumber)}
                              </span>

                              {status === 'completed' && (
                                <span className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                                  <CheckCircle2 size={12} />
                                  <span>Completed</span>
                                </span>
                              )}

                              {status === 'today' && (
                                <span className="flex items-center gap-1 text-[10px] font-black uppercase text-amber-700 bg-amber-200 dark:bg-amber-900 px-2 py-0.5 rounded-full animate-pulse">
                                  <Sparkles size={12} />
                                  <span>Today</span>
                                </span>
                              )}

                              {status === 'missed' && (
                                <span className="flex items-center gap-1 text-[10px] font-black uppercase text-amber-600 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-full">
                                  <span>Catch Up</span>
                                </span>
                              )}

                              {status === 'locked' && (
                                <span className="flex items-center gap-1 text-[10px] font-black uppercase text-zinc-400 bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                                  <Lock size={11} />
                                  <span>Locked</span>
                                </span>
                              )}
                            </div>

                            {/* Title & Scripture */}
                            <h4 className="text-xs font-black text-[var(--c-text)] line-clamp-1">
                              {day.storyTitle}
                            </h4>
                            <span className="text-[11px] font-semibold text-zinc-500 block">
                              {day.scriptureRef}
                            </span>
                          </div>

                          {/* Footer with Character & Action Button */}
                          <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
                            <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
                              <span>Character:</span>
                              <span className="text-zinc-600 dark:text-zinc-300 font-black">
                                {day.characterName}
                              </span>
                            </span>

                            {isPlayable ? (
                              <button
                                type="button"
                                className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-white dark:bg-zinc-800 border border-[var(--c-border)] shadow-xs hover:bg-zinc-100 dark:hover:bg-zinc-700 text-[var(--c-text)] flex items-center gap-1 cursor-pointer"
                              >
                                <span>{status === 'completed' ? 'Replay' : 'Play'}</span>
                                <ArrowRight size={11} />
                              </button>
                            ) : (
                              <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
                                <Lock size={10} />
                                <span>Unlocks on {formatDayDate(day.dayNumber)}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Bottom Close Bar */}
        <div className="p-3 border-t border-[var(--c-border)] bg-zinc-50 dark:bg-zinc-800/50 flex justify-end">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="px-5 py-2 rounded-2xl bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-black uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all cursor-pointer"
          >
            Close Index
          </button>
        </div>
      </div>
    </div>
  );
};
