import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import { getSecondsUntilMidnight, formatDayDate } from '../../engine/journey/chronicleCurriculum';
import { GamifiedButton } from './GamifiedButton';
import { BiblicalCharacter, BiblicalCharacterId } from './GamifiedMascot';
import { useTheme } from '../../theme/ThemeContext';

export interface DailyCompletionNoticeProps {
  todayDayNumber: number;
  todayTitle: string;
  todayScripture: string;
  characterId: BiblicalCharacterId;
  characterName: string;
  missedDaysCount: number;
  onOpenCatchUp?: () => void;
  onOpenOverview?: () => void;
  className?: string;
}

export const DailyCompletionNotice: React.FC<DailyCompletionNoticeProps> = ({
  todayDayNumber,
  todayTitle,
  todayScripture,
  characterId,
  characterName,
  missedDaysCount,
  onOpenCatchUp,
  onOpenOverview,
  className = '',
}) => {
  const { triggerHaptic } = useTheme();
  const [secondsLeft, setSecondsLeft] = useState<number>(getSecondsUntilMidnight);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft(getSecondsUntilMidnight());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className={`w-full max-w-md flex flex-col gap-3 select-none animate-fadeIn ${className}`}>
      {/* 1. Main Celebration Card */}
      <div className="w-full bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 text-white rounded-3xl p-5 shadow-[0_6px_0_#065F46] border-2 border-emerald-300/40 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10 blur-xl pointer-events-none" />

        <div className="flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-xl bg-white/20 backdrop-blur-xs text-white shrink-0">
              <CheckCircle2 size={20} className="text-white" />
            </span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-100 block">
                TODAY’S MILESTONE COMPLETED
              </span>
              <span className="text-xs font-bold text-white/90">
                Day {todayDayNumber} of 365 • {formatDayDate(todayDayNumber)}
              </span>
            </div>
          </div>

          {/* Mascot Avatar */}
          <div className="flex flex-col items-center shrink-0">
            <BiblicalCharacter character={characterId} pose="cheer" size={50} showGroundShadow={false} />
            <span className="text-[9px] font-bold text-emerald-100 bg-emerald-900/40 px-1.5 py-0.5 rounded-full mt-[-4px]">
              {characterName}
            </span>
          </div>
        </div>

        <div className="mt-3 relative z-10">
          <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
            <span>Thank you! See you tomorrow!</span>
            <Sparkles size={18} className="text-amber-300 animate-pulse" />
          </h3>
          <p className="text-xs text-emerald-100/95 font-medium mt-1 leading-relaxed">
            Completed: <span className="font-bold text-white">"{todayTitle}"</span> ({todayScripture}).
          </p>
        </div>
      </div>

      {/* 2. Micro-Card Duo: Tomorrow's Countdown & Missed Catch-Up (Clean, separate cards) */}
      <div className="w-full flex flex-col gap-2.5">
        {/* Countdown Card */}
        <div className="w-full p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-2 border-[var(--c-border)] flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5 text-[var(--c-text)]">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock size={16} />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-zinc-500 block">
                Next Chapter
              </span>
              <span className="text-xs font-bold text-[var(--c-text)]">
                Tomorrow’s Day {todayDayNumber + 1} unlocks in
              </span>
            </div>
          </div>
          <span className="font-mono font-black text-sm tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-300/60 dark:border-amber-700/60 px-2.5 py-1 rounded-xl">
            {timeFormatted}
          </span>
        </div>

        {/* Missed Days Catch-Up Card (if any missed) */}
        {missedDaysCount > 0 && (
          <div className="w-full p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300/80 dark:border-amber-700/60 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5 text-left">
              <span className="text-xl">⏳</span>
              <div>
                <span className="text-xs font-black text-amber-950 dark:text-amber-200 block">
                  {missedDaysCount} Earlier {missedDaysCount === 1 ? 'Day' : 'Days'} Missed
                </span>
                <span className="text-[11px] text-amber-800/80 dark:text-amber-300/70 font-medium">
                  Catch up anytime at your own pace!
                </span>
              </div>
            </div>
            {onOpenCatchUp && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('medium');
                  onOpenCatchUp();
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-black uppercase tracking-wider active:scale-95 transition-all shadow-xs flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <span>Catch Up</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* 3. Subtle Clean 365 Overview Button */}
      {onOpenOverview && (
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onOpenOverview();
          }}
          className="w-full py-2.5 px-4 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-800 border-2 border-[var(--c-border)] text-[var(--c-text)] text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98"
        >
          <Calendar size={15} className="text-amber-500" />
          <span>View 365 Days Chronicle Index</span>
        </button>
      )}
    </div>
  );
};
