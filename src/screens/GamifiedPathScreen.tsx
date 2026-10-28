import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GamifiedPathNode, PathNodeData, PathNodeState } from '../components/gamified/GamifiedPathNode';
import { GamifiedLessonScreen } from '../components/gamified/GamifiedLessonScreen';
import { GamifiedQuestCard, GamifiedChestModal, QuestItem } from '../components/gamified/GamifiedQuestsAndChests';
import { getStoredGamifiedStats, saveGamifiedStats, GamifiedStats } from '../theme/gamifiedTokens';
import { fireConfettiBurst } from '../components/ui/StreakCelebration';
import { soundManager } from '../engine/services/audio';
import {
  getAllChronicleDays,
  getAllActs,
  getDayOfYear,
  getChronicleDay,
  getChronicleDayStatus,
  formatDayDate,
  ChronicleDay,
} from '../engine/journey/chronicleCurriculum';
import { JourneyOverviewModal } from '../components/gamified/JourneyOverviewModal';
import { Calendar, ChevronLeft, ChevronRight, Sparkles, Star, Check, ArrowRight, Play, Compass } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';

export interface GamifiedPathScreenProps {
  onBackToLibrary?: () => void;
}

export const GamifiedPathScreen: React.FC<GamifiedPathScreenProps> = () => {
  const { triggerHaptic } = useTheme();
  const [stats, setStats] = useState<GamifiedStats>(getStoredGamifiedStats);
  const [showOverviewModal, setShowOverviewModal] = useState(false);
  const [showChestModal, setShowChestModal] = useState(false);
  const [activeLessonDayNumber, setActiveLessonDayNumber] = useState<number | null>(null);

  const todayDayOfYear = useMemo(() => getDayOfYear(), []);
  const allActs = useMemo(() => getAllActs(), []);
  const allDays = useMemo(() => getAllChronicleDays(), []);

  // Default active act to the one containing today
  const [selectedActIndex, setSelectedActIndex] = useState<number>(() => {
    const act = allActs.find((a) => todayDayOfYear >= a.startDay && todayDayOfYear <= a.endDay);
    return act ? act.actIndex : 1;
  });

  const activeAct = allActs.find((a) => a.actIndex === selectedActIndex) || allActs[0];
  const activeActDays = useMemo(
    () => allDays.filter((d) => d.actIndex === activeAct.actIndex),
    [allDays, activeAct]
  );

  const todayChronicle = useMemo(() => getChronicleDay(todayDayOfYear), [todayDayOfYear]);
  const isTodayCompleted = stats.completedDays.includes(todayDayOfYear);

  const [dailyQuest, setDailyQuest] = useState<QuestItem>({
    id: 'quest-365',
    title: 'Complete Today’s Scripture Milestone',
    current: isTodayCompleted ? 1 : 0,
    total: 1,
    rewardType: 'chest',
  });

  useEffect(() => {
    saveGamifiedStats(stats);
  }, [stats]);

  const handleDayNodeClick = (day: ChronicleDay) => {
    const status = getChronicleDayStatus(day.dayNumber, stats.completedDays, todayDayOfYear);
    if (status === 'locked') {
      soundManager.playWrong();
      triggerHaptic('heavy');
      return;
    }

    if (day.glyph === 'chest' && !stats.completedDays.includes(day.dayNumber)) {
      setShowChestModal(true);
      return;
    }

    soundManager.playTick();
    triggerHaptic('selection');
    setActiveLessonDayNumber(day.dayNumber);
  };

  const handleLessonFinish = (xpEarned: number, accuracy: number, finishedDay?: number) => {
    const dayToMark = finishedDay || activeLessonDayNumber || todayDayOfYear;
    const newCompletedDays = Array.from(new Set([...stats.completedDays, dayToMark]));
    const todayStr = new Date().toISOString().split('T')[0];

    const updated: GamifiedStats = {
      ...stats,
      xp: stats.xp + xpEarned,
      gems: stats.gems + (accuracy >= 100 ? 10 : 5),
      streak: stats.streak + 1,
      completedDays: newCompletedDays,
      lastCompletedDate: dayToMark === todayDayOfYear ? todayStr : stats.lastCompletedDate,
    };

    setStats(updated);
    setActiveLessonDayNumber(null);

    if (dayToMark === todayDayOfYear) {
      setDailyQuest((prev) => ({ ...prev, current: 1 }));
      fireConfettiBurst('high');
    }
  };

  const handleChestRewardClaim = (reward: { gems: number; xp: number }) => {
    setStats((prev) => ({
      ...prev,
      gems: prev.gems + reward.gems,
      xp: prev.xp + reward.xp,
    }));
    setShowChestModal(false);
  };

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const todayNodeRef = useRef<HTMLDivElement>(null);

  // Automatically scroll to the current day by default
  useEffect(() => {
    const timer = setTimeout(() => {
      if (todayNodeRef.current) {
        todayNodeRef.current.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        });
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [selectedActIndex]);

  const handleScrollToToday = () => {
    if (selectedActIndex !== todayChronicle.actIndex) {
      setSelectedActIndex(todayChronicle.actIndex);
    }
    setTimeout(() => {
      todayNodeRef.current?.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }, 100);
  };

  return (
    <div className="flex-1 min-h-[calc(100vh-4rem)] w-full max-w-full overflow-x-hidden bg-white dark:bg-zinc-950 text-[var(--c-text)] flex flex-col justify-between select-none animate-fadeIn relative">
      {/* Main Content Area */}
      <div className="w-full max-w-xl px-4 mx-auto flex flex-col items-center flex-1">
        {/* Sleek Chronicle Header */}
        <div className="w-full mt-3 px-3.5 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-[var(--c-border)] flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-600 dark:text-amber-400">
              <Calendar size={13} className="shrink-0" />
              <span>Day {todayDayOfYear}</span>
            </div>
            <span className="text-xs text-zinc-400">•</span>
            <span className="text-xs font-bold text-zinc-500">
              {stats.completedDays.length}/365 Done
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                handleScrollToToday();
              }}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-black uppercase tracking-wider hover:bg-emerald-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
            >
              <Compass size={12} />
              <span>Today</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setShowOverviewModal(true);
              }}
              className="px-2.5 py-1 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-[var(--c-text)] text-[11px] font-black uppercase tracking-wider hover:bg-zinc-300 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
            >
              <span>Index</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* Unified Compact Act Card */}
        <div
          className="w-full mt-3 p-3.5 rounded-2xl text-white select-none transition-all shadow-sm"
          style={{
            backgroundColor: activeAct.color,
            boxShadow: `0 3px 0 ${activeAct.lipColor}`,
          }}
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              disabled={selectedActIndex <= 1}
              onClick={() => {
                triggerHaptic('selection');
                setSelectedActIndex((prev) => Math.max(1, prev - 1));
              }}
              className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 disabled:opacity-20 flex items-center justify-center transition-all cursor-pointer shrink-0"
              aria-label="Previous Act"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="text-center px-2 flex-1 min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-white/80 block truncate">
                Act {activeAct.actIndex} of {allActs.length}
              </span>
              <h2 className="text-sm sm:text-base font-black tracking-tight text-white truncate">
                {activeAct.subtitle}
              </h2>
            </div>

            <button
              type="button"
              disabled={selectedActIndex >= allActs.length}
              onClick={() => {
                triggerHaptic('selection');
                setSelectedActIndex((prev) => Math.min(allActs.length, prev + 1));
              }}
              className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 disabled:opacity-20 flex items-center justify-center transition-all cursor-pointer shrink-0"
              aria-label="Next Act"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Expansive Horizontal Journey Viewport */}
        <div className="w-full relative flex-1 flex flex-col justify-center py-6 sm:py-10 my-auto">
          <div
            ref={scrollContainerRef}
            className="w-full overflow-x-auto overflow-y-visible py-10 px-8 flex items-center gap-12 no-scrollbar scroll-smooth relative"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {/* Horizontal Track Line */}
            <div className="absolute top-[48%] left-4 right-4 h-2.5 bg-zinc-200 dark:bg-zinc-800 -translate-y-1/2 -z-0 rounded-full" />

            {activeActDays.map((day) => {
              const status = getChronicleDayStatus(day.dayNumber, stats.completedDays, todayDayOfYear);
              const isCompleted = status === 'completed';
              const isCurrent = status === 'today';
              const isMissed = status === 'missed';
              const state: PathNodeState = isCompleted
                ? 'complete'
                : isCurrent
                ? 'current'
                : 'locked';

              const nodeData: PathNodeData = {
                id: `day-${day.dayNumber}`,
                title: `Day ${day.dayNumber}: ${day.storyTitle}`,
                subtitle: day.scriptureRef,
                glyph: day.glyph,
                xpReward: day.xpReward,
                gameId: day.gameStyle,
              };

              return (
                <div
                  key={day.dayNumber}
                  ref={isCurrent ? todayNodeRef : undefined}
                  className="relative flex flex-col items-center shrink-0 w-28 z-10 select-none"
                >
                  {/* Status Badge with fixed height and guaranteed spacing above the puck */}
                  <div className="h-7 flex items-center justify-center mb-3">
                    {isCurrent ? (
                      <div className="flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md animate-pulse">
                        <Star size={10} fill="currentColor" stroke="none" />
                        <span>TODAY</span>
                      </div>
                    ) : isMissed ? (
                      <div className="flex items-center gap-1 bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                        <Sparkles size={10} />
                        <span>CATCH UP</span>
                      </div>
                    ) : isCompleted ? (
                      <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        <Check size={11} strokeWidth={3} />
                        <span>DAY {day.dayNumber}</span>
                      </div>
                    ) : (
                      <div className="text-[10px] font-black text-zinc-400 font-mono">
                        DAY {day.dayNumber}
                      </div>
                    )}
                  </div>

                  {/* Node Puck - yOffset is 0 so it aligns cleanly on track without overlapping badge */}
                  <GamifiedPathNode
                    node={nodeData}
                    state={state}
                    yOffset={0}
                    onClick={() => handleDayNodeClick(day)}
                    showTooltip={false}
                    onStartClick={() => handleDayNodeClick(day)}
                  />

                  {/* Date & Scripture Below Node */}
                  <div className="mt-3 text-center flex flex-col items-center max-w-[110px]">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
                      {formatDayDate(day.dayNumber)}
                    </span>
                    <span className="text-[10px] font-medium text-zinc-400 truncate w-full" title={day.storyTitle}>
                      {day.scriptureRef}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Deck: Quest Card + Play FAB side-by-side cleanly elevated above bottom nav */}
      <div className="w-full max-w-xl mx-auto px-4 pb-28 md:pb-6 mt-auto">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <GamifiedQuestCard
              quest={{
                ...dailyQuest,
                title: 'Daily Milestone',
              }}
              onClaim={() => {
                fireConfettiBurst('medium');
                setShowChestModal(true);
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('heavy');
              handleDayNodeClick(todayChronicle);
            }}
            aria-label={isTodayCompleted ? 'Practice Today' : 'Play Today'}
            className="w-16 h-16 sm:w-[72px] sm:h-[72px] min-w-[64px] min-h-[64px] rounded-2xl sm:rounded-3xl bg-emerald-500 hover:bg-emerald-600 active:translate-y-1 text-white shadow-[0_5px_0_#047857] flex items-center justify-center shrink-0 transition-all cursor-pointer group"
          >
            <Play size={28} fill="currentColor" stroke="none" className="ml-1 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      {/* Lesson Screen Modal for selected Day */}
      {activeLessonDayNumber !== null && (
        <GamifiedLessonScreen
          dayNumber={activeLessonDayNumber}
          onClose={() => setActiveLessonDayNumber(null)}
          onFinish={handleLessonFinish}
        />
      )}

      {/* 365 Days Chronicle Overview Index Modal */}
      <JourneyOverviewModal
        isOpen={showOverviewModal}
        onClose={() => setShowOverviewModal(false)}
        completedDays={stats.completedDays}
        todayDayOfYear={todayDayOfYear}
        onSelectDay={(dayNum) => {
          const day = getChronicleDay(dayNum);
          setSelectedActIndex(day.actIndex);
          setActiveLessonDayNumber(dayNum);
        }}
      />

      {/* Chest Reveal Modal */}
      <GamifiedChestModal
        isOpen={showChestModal}
        onClose={handleChestRewardClaim}
      />
    </div>
  );
};
