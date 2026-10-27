import React, { useState, useEffect, useMemo } from 'react';
import { GamifiedTopBar } from '../components/gamified/GamifiedTopBar';
import { GamifiedPathNode, PathNodeData, PathNodeState } from '../components/gamified/GamifiedPathNode';
import { GamifiedMascot, BiblicalCharacter } from '../components/gamified/GamifiedMascot';
import { GamifiedLessonScreen } from '../components/gamified/GamifiedLessonScreen';
import { GamifiedQuestCard, GamifiedChestModal, QuestItem } from '../components/gamified/GamifiedQuestsAndChests';
import { getStoredGamifiedStats, saveGamifiedStats, GamifiedStats } from '../theme/gamifiedTokens';
import { fireConfettiBurst } from '../components/ui/StreakCelebration';
import { soundManager } from '../engine/services/audio';
import { Icon } from '../design/icons';
import {
  getAllChronicleDays,
  getAllActs,
  getDayOfYear,
  getChronicleDay,
  getChronicleDayStatus,
  formatDayDate,
  ChronicleDay,
  ChronicleAct,
} from '../engine/journey/chronicleCurriculum';
import { DailyCompletionNotice } from '../components/gamified/DailyCompletionNotice';
import { JourneyOverviewModal } from '../components/gamified/JourneyOverviewModal';
import { Calendar, ChevronLeft, ChevronRight, Sparkles, BookOpen, Clock, ArrowRight } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';

export interface GamifiedPathScreenProps {
  onBackToLibrary?: () => void;
}

export const GamifiedPathScreen: React.FC<GamifiedPathScreenProps> = ({ onBackToLibrary }) => {
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

  const missedDays = useMemo(
    () => allDays.filter((d) => d.dayNumber < todayDayOfYear && !stats.completedDays.includes(d.dayNumber)),
    [allDays, todayDayOfYear, stats.completedDays]
  );

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

  // Jump to first missed day if any
  const handleJumpToMissed = () => {
    if (missedDays.length > 0) {
      const firstMissed = missedDays[0];
      setSelectedActIndex(firstMissed.actIndex);
      setActiveLessonDayNumber(firstMissed.dayNumber);
    }
  };

  // Jump to today
  const handleJumpToToday = () => {
    setSelectedActIndex(todayChronicle.actIndex);
    setActiveLessonDayNumber(todayDayOfYear);
  };

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

  // Sine-wave X-Offsets
  const xOffsets = [-44, 0, 44, 0, -44, 0, 44];

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-[var(--c-text)] flex flex-col items-center pb-28 animate-fadeIn">
      {/* Top Stat Bar */}
      <GamifiedTopBar
        streak={stats.streak}
        gems={stats.gems}
        xp={stats.xp}
        hearts={stats.hearts}
        onFlameClick={() => soundManager.playTick()}
      />

      {/* Main Content Column */}
      <div className="w-full max-w-md px-4 flex flex-col items-center">
        {/* 365 Days Chronicle Header Bar */}
        <div className="w-full mt-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-2 border-[var(--c-border)] flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400 text-amber-600 flex items-center justify-center">
              <Calendar size={18} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                365-DAY CHRONICLE
              </span>
              <span className="text-xs font-black text-[var(--c-text)]">
                {stats.completedDays.length} / 365 Days Done
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setShowOverviewModal(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-[var(--c-blue)] text-white text-xs font-black uppercase tracking-wide hover:bg-[var(--c-blue-lip)] active:scale-95 transition-all shadow-xs flex items-center gap-1 cursor-pointer"
          >
            <span>Overview</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Daily Completion Notice: "Thank you! See you tomorrow!" */}
        {isTodayCompleted ? (
          <div className="w-full mt-3">
            <DailyCompletionNotice
              todayDayNumber={todayDayOfYear}
              todayTitle={todayChronicle.storyTitle}
              todayScripture={todayChronicle.scriptureRef}
              characterId={todayChronicle.characterId}
              characterName={todayChronicle.characterName}
              missedDaysCount={missedDays.length}
              onOpenCatchUp={handleJumpToMissed}
              onOpenOverview={() => setShowOverviewModal(true)}
            />
          </div>
        ) : (
          /* Today Active Banner if not yet completed */
          <div className="w-full mt-3 p-3.5 rounded-2xl bg-amber-400/15 border-2 border-amber-400 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-white flex items-center justify-center shadow-xs">
                <Sparkles size={20} className="animate-spin-slow" />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 block">
                  TODAY’S JOURNEY • DAY {todayDayOfYear} ({formatDayDate(todayDayOfYear)})
                </span>
                <h3 className="text-xs font-black text-[var(--c-text)] line-clamp-1">
                  {todayChronicle.storyTitle}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('medium');
                handleJumpToToday();
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-wider active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
            >
              Start
            </button>
          </div>
        )}

        {/* Act Selector Navigation Controls */}
        <div className="w-full mt-4 flex items-center justify-between gap-2">
          <button
            type="button"
            disabled={selectedActIndex <= 1}
            onClick={() => {
              triggerHaptic('selection');
              setSelectedActIndex((prev) => Math.max(1, prev - 1));
            }}
            className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 disabled:opacity-30 hover:bg-zinc-200 flex items-center justify-center transition-all cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>

          <span className="text-[11px] font-black uppercase tracking-wider text-zinc-500">
            Act {activeAct.actIndex} of {allActs.length}
          </span>

          <button
            type="button"
            disabled={selectedActIndex >= allActs.length}
            onClick={() => {
              triggerHaptic('selection');
              setSelectedActIndex((prev) => Math.min(allActs.length, prev + 1));
            }}
            className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 disabled:opacity-30 hover:bg-zinc-200 flex items-center justify-center transition-all cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Sticky Section / Act Banner */}
        <div
          className="w-full mt-2 p-4 rounded-3xl text-white select-none sticky top-14 z-20 shadow-md transition-all"
          style={{
            backgroundColor: activeAct.color,
            boxShadow: `0 6px 0 ${activeAct.lipColor}`,
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-white/90 block">
              {activeAct.actTitle} • DAYS {activeAct.startDay}–{activeAct.endDay}
            </span>
            <span className="text-[10px] font-black bg-black/20 px-2 py-0.5 rounded-full">
              {activeActDays.filter((d) => stats.completedDays.includes(d.dayNumber)).length}/{activeAct.totalDays} Done
            </span>
          </div>
          <h2 className="text-xl font-black tracking-tight text-white mt-1">
            {activeAct.subtitle}
          </h2>
          <p className="text-xs text-white/80 font-medium line-clamp-1 mt-0.5">
            {activeAct.description}
          </p>
        </div>

        {/* Learning Sine-Wave Path for Active Act */}
        <div className="relative w-full py-8 flex flex-col items-center">
          {/* Subtle curved track line in background */}
          <div className="absolute top-12 bottom-12 w-2.5 bg-[var(--c-border)] rounded-full -z-0 opacity-60" />

          {activeActDays.map((day, index) => {
            const status = getChronicleDayStatus(day.dayNumber, stats.completedDays, todayDayOfYear);
            const isCompleted = status === 'completed';
            const isCurrent = status === 'today';
            const isMissed = status === 'missed';
            const state: PathNodeState = isCompleted
              ? 'complete'
              : isCurrent
              ? 'current'
              : 'locked';

            const xOffset = xOffsets[index % xOffsets.length];

            // Render biblical character milestone at the 1st day of Act and every 10 days
            const showCharacter = index === 0 || index % 10 === 0;

            const nodeData: PathNodeData = {
              id: `day-${day.dayNumber}`,
              title: `Day ${day.dayNumber}: ${day.storyTitle}`,
              subtitle: day.scriptureRef,
              glyph: day.glyph,
              xpReward: day.xpReward,
              gameId: day.gameStyle,
            };

            return (
              <div key={day.dayNumber} className="relative w-full flex flex-col items-center">
                {/* Character Milestone illustration */}
                {showCharacter && (
                  <div
                    className={`absolute ${
                      index % 2 === 0 ? '-left-4' : '-right-4'
                    } top-0 flex flex-col items-center pointer-events-none opacity-95 hidden sm:flex`}
                  >
                    <BiblicalCharacter character={day.characterId} pose="idle" size={76} showGroundShadow={false} />
                    <span
                      className="text-[9px] font-black uppercase text-white px-2 py-0.5 rounded-full shadow-xs mt-[-4px]"
                      style={{ backgroundColor: activeAct.color }}
                    >
                      {day.characterName}
                    </span>
                  </div>
                )}

                {/* Missed Day Catch-Up Pill Badge */}
                {isMissed && (
                  <div className="mb-[-14px] z-10 flex items-center gap-1 bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                    <span>⚡ Catch Up</span>
                  </div>
                )}

                <GamifiedPathNode
                  node={nodeData}
                  state={state}
                  xOffset={xOffset}
                  onClick={() => handleDayNodeClick(day)}
                  showTooltip={isCurrent || isMissed}
                  onStartClick={() => handleDayNodeClick(day)}
                />

                {/* Day label beneath node */}
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 font-mono mt-[-14px] mb-2">
                  Day {day.dayNumber} • {formatDayDate(day.dayNumber)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Daily Quests Card */}
        <div className="w-full mt-2 mb-6">
          <GamifiedQuestCard
            quest={dailyQuest}
            onClaim={() => {
              fireConfettiBurst('medium');
              setShowChestModal(true);
            }}
          />
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
