import React from 'react';
import { Check } from 'lucide-react';
import { GamifiedXpBolt } from './GamifiedMascot';
import { Icon } from '../../design/icons';

export interface GamifiedStatCardsProps {
  xpEarned: number;
  accuracyPercent: number;
  timeTakenSec: number;
  className?: string;
}

export const GamifiedStatCards: React.FC<GamifiedStatCardsProps> = ({
  xpEarned,
  accuracyPercent,
  timeTakenSec,
  className = '',
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <div className={`grid grid-cols-3 gap-2.5 sm:gap-4 w-full select-none ${className}`}>
      {/* 1. TOTAL XP (Yellow) */}
      <div className="rounded-2xl p-1.5 pb-2.5 bg-[var(--c-yellow)] shadow-sm flex flex-col items-center">
        <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-black/80 my-1">
          TOTAL XP
        </span>
        <div className="w-full bg-white dark:bg-zinc-900 rounded-xl py-3 px-1 border-2 border-[var(--c-yellow)] flex flex-col items-center justify-center gap-1 shadow-inner">
          <GamifiedXpBolt size={26} />
          <span className="text-xl sm:text-2xl font-black text-[var(--c-yellow)]">
            +{xpEarned}
          </span>
        </div>
      </div>

      {/* 2. AMAZING / Accuracy (Green) */}
      <div className="rounded-2xl p-1.5 pb-2.5 bg-[var(--c-green)] shadow-sm flex flex-col items-center">
        <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-white my-1">
          AMAZING
        </span>
        <div className="w-full bg-white dark:bg-zinc-900 rounded-xl py-3 px-1 border-2 border-[var(--c-green)] flex flex-col items-center justify-center gap-1 shadow-inner">
          <Icon name="target" size={20} className="text-[var(--c-green)]" />
          <span className="text-xl sm:text-2xl font-black text-[var(--c-green)]">
            {accuracyPercent}%
          </span>
        </div>
      </div>

      {/* 3. SPEEDY / Time (Blue) */}
      <div className="rounded-2xl p-1.5 pb-2.5 bg-[var(--c-blue)] shadow-sm flex flex-col items-center">
        <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-white my-1">
          SPEEDY
        </span>
        <div className="w-full bg-white dark:bg-zinc-900 rounded-xl py-3 px-1 border-2 border-[var(--c-blue)] flex flex-col items-center justify-center gap-1 shadow-inner">
          <Icon name="timer" size={20} className="text-[var(--c-blue)]" />
          <span className="text-xl sm:text-2xl font-black text-[var(--c-blue)]">
            {formatTime(timeTakenSec)}
          </span>
        </div>
      </div>
    </div>
  );
};

export interface GamifiedWeekStreakProps {
  currentDayIndex?: number; // 0 = Mon ... 6 = Sun
  activeDays?: boolean[]; // 7 elements
  className?: string;
}

export const GamifiedWeekStreak: React.FC<GamifiedWeekStreakProps> = ({
  currentDayIndex = 2,
  activeDays = [true, true, true, false, false, false, false],
  className = '',
}) => {
  const days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  return (
    <div className={`flex items-center justify-between w-full max-w-sm mx-auto px-2 select-none ${className}`}>
      {days.map((day, idx) => {
        const isActive = activeDays[idx] ?? false;
        const isToday = idx === currentDayIndex;

        return (
          <div key={day} className="flex flex-col items-center gap-2">
            <span
              className={`text-xs font-extrabold uppercase ${
                isActive ? 'text-[var(--c-orange)]' : 'text-[var(--c-text-off)]'
              }`}
            >
              {day}
            </span>
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
                isActive
                  ? 'bg-[var(--c-orange)] text-white shadow-md scale-105'
                  : 'bg-[var(--c-border)] text-transparent'
              } ${isToday ? 'ring-2 ring-offset-2 ring-[var(--c-orange)]' : ''}`}
            >
              {isActive && <Check size={18} strokeWidth={3.5} />}
            </div>
          </div>
        );
      })}
    </div>
  );
};
