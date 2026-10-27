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
    <div
      className={`w-full max-w-md bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 text-white rounded-3xl p-5 shadow-[0_8px_0_#065F46] border-2 border-emerald-300/40 relative overflow-hidden select-none animate-fadeIn ${className}`}
    >
      {/* Decorative background glow circles */}
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
      <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-emerald-400/20 blur-xl pointer-events-none" />

      {/* Header Row */}
      <div className="flex items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-white/20 backdrop-blur-xs text-white">
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
        <div className="flex flex-col items-center">
          <BiblicalCharacter character={characterId} pose="cheer" size={54} showGroundShadow={false} />
          <span className="text-[9px] font-bold text-emerald-100 bg-emerald-900/40 px-1.5 py-0.5 rounded-full mt-[-4px]">
            {characterName}
          </span>
        </div>
      </div>

      {/* Main Message */}
      <div className="mt-3 relative z-10">
        <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
          <span>Thank you! See you tomorrow!</span>
          <Sparkles size={18} className="text-amber-300 animate-pulse" />
        </h3>
        <p className="text-xs text-emerald-100/95 font-medium mt-1 leading-relaxed">
          You finished today’s journey on <span className="font-bold text-white">"{todayTitle}"</span> ({todayScripture}). Come back tomorrow for the next chapter in God’s story!
        </p>
      </div>

      {/* Countdown Box */}
      <div className="mt-4 p-3 rounded-2xl bg-black/20 backdrop-blur-xs border border-white/15 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2 text-emerald-100">
          <Clock size={16} className="text-amber-300" />
          <span className="text-xs font-semibold">Tomorrow’s Day {todayDayNumber + 1} unlocks in:</span>
        </div>
        <span className="font-mono font-black text-sm tracking-widest text-amber-300 bg-black/30 px-2.5 py-1 rounded-xl">
          {timeFormatted}
        </span>
      </div>

      {/* Missed Days Catch-Up Notice (if any) */}
      {missedDaysCount > 0 && (
        <div className="mt-3 p-3 rounded-2xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-base">⏳</span>
            <div className="text-left">
              <span className="text-xs font-black text-white block">
                {missedDaysCount} Earlier {missedDaysCount === 1 ? 'Day' : 'Days'} Missed
              </span>
              <span className="text-[11px] text-emerald-100">
                You can catch up anytime! All past days remain unlocked.
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
              className="px-2.5 py-1.5 rounded-xl bg-white text-emerald-800 text-[11px] font-black uppercase tracking-wider hover:bg-emerald-50 active:scale-95 transition-all shadow-sm flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <span>Catch Up</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      )}

      {/* Footer Button to open 365 Days Overview */}
      {onOpenOverview && (
        <div className="mt-4 relative z-10">
          <GamifiedButton
            variant="secondary"
            onClick={() => {
              triggerHaptic('light');
              onOpenOverview();
            }}
            className="w-full justify-center bg-white text-emerald-800 hover:bg-emerald-50"
          >
            <Calendar size={15} className="mr-1.5" />
            VIEW 365 DAYS CHRONICLE INDEX
          </GamifiedButton>
        </div>
      )}
    </div>
  );
};
