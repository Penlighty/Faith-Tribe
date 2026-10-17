import React from 'react';
import { GameViewProps } from '../../engine/types';
import { TestamentSortState } from './types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { BookOpen, HelpCircle, CheckCircle2, XCircle, ArrowRight, Sparkles, Users } from 'lucide-react';

const TIER_THEMES: Record<1 | 2 | 3 | 4, { label: string; badgeClass: string; bgClass: string }> = {
  1: { label: 'Tier 1: Famous Names', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300', bgClass: 'border-emerald-300/40' },
  2: { label: 'Tier 2: Well-Known', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300', bgClass: 'border-amber-300/40' },
  3: { label: 'Tier 3: Namesakes & Cross-Over', badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300', bgClass: 'border-purple-300/40' },
  4: { label: 'Tier 4: Deep Genealogies & Traps', badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300', bgClass: 'border-rose-300/40' },
};

export const TestamentSortHostView: React.FC<GameViewProps<TestamentSortState>> = ({
  state,
  players,
  dispatchIntent,
}) => {
  const { currentCard, currentPhaseId, playerCardStates, roundTally } = state;
  const tierInfo = TIER_THEMES[currentCard.tier];

  // Count locks
  const totalPlayers = players.length;
  const lockedCount = Object.values(playerCardStates).filter((p) => p.locked).length;

  const isCountdown = currentPhaseId === 'countdown';
  const isCard = currentPhaseId === 'card';
  const isHuddle = currentPhaseId === 'huddle';
  const isReveal = currentPhaseId === 'reveal';

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 py-4">
      {/* Top Banner: Round and Tier */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--surface-container)] text-[var(--on-container-variant)]">
            Card {state.roundNumber} of {state.totalRounds}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tierInfo.badgeClass}`}>
            {tierInfo.label}
          </span>
        </div>

        {isCard && (
          <div className="flex items-center gap-2 text-sm font-medium text-[var(--on-container-variant)]">
            <Users size={16} />
            <span>{lockedCount} / {totalPlayers} Locked In</span>
          </div>
        )}
      </div>

      {/* Countdown Phase */}
      {isCountdown && (
        <Card variant="hero" className="text-center py-12 flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[var(--primary-action)]/15 flex items-center justify-center text-3xl font-black text-[var(--primary-action)] animate-pulse">
            {state.phaseTimeRemaining ?? 3}
          </div>
          <h2 className="text-2xl font-bold text-[var(--on-container)]">Get Ready to Sort!</h2>
          <p className="text-sm text-[var(--on-container-variant)] max-w-md">
            Determine whether the upcoming biblical name appears in the Old Testament, New Testament, or Both!
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={() => dispatchIntent('START_CARD')}
            className="mt-2"
          >
            Start Now
          </Button>
        </Card>
      )}

      {/* Card Phase & Huddle Phase */}
      {(isCard || isHuddle) && (
        <div className="flex flex-col gap-6">
          <Card variant="hero" className={`text-center py-10 flex flex-col items-center gap-4 ${tierInfo.bgClass}`}>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--primary-action)]/15 text-[var(--primary-action)]">
              {currentCard.type}
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-[var(--on-container)]">
              {currentCard.name}
            </h1>

            {/* Wavy progress timer indicator */}
            <div className="w-full max-w-md mt-4">
              <div className="flex justify-between text-xs text-[var(--on-container-variant)] mb-1">
                <span>Time Remaining</span>
                <span className="font-mono font-bold">{state.phaseTimeRemaining}s</span>
              </div>
              <div className="w-full h-3 rounded-full bg-[var(--surface-container)] overflow-hidden">
                <div
                  key={`${state.currentIndex}-${state.phaseDuration}`}
                  className="h-full bg-[var(--primary-action)] rounded-full origin-left"
                  style={{
                    animation: `analogTimerDrain ${state.phaseDuration ?? 12}s linear forwards`,
                  }}
                />
              </div>
            </div>

            {isHuddle && (
              <div className="p-3 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 rounded-2xl text-sm font-semibold flex items-center gap-2">
                <Sparkles size={18} />
                <span>Tie detected! 10-Second Team Huddle: Talk it out!</span>
              </div>
            )}
          </Card>

          {/* Player lock status pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {players.map((p) => {
              const pState = playerCardStates[p.id];
              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-3 rounded-2xl text-sm border transition-all ${
                    pState?.locked
                      ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-700 font-semibold'
                      : 'bg-[var(--surface-card)] border-[var(--border-tint)] opacity-70'
                  }`}
                >
                  <span className="truncate">{p.name}</span>
                  {pState?.locked ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200">
                      Locked
                    </span>
                  ) : (
                    <span className="text-xs text-[var(--on-container-variant)]">Sorting...</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end">
            <Button
              variant="tonal"
              size="sm"
              onClick={() => dispatchIntent('TRIGGER_REVEAL')}
            >
              Skip to Reveal
            </Button>
          </div>
        </div>
      )}

      {/* Reveal Phase */}
      {isReveal && (
        <div className="flex flex-col gap-6">
          <Card variant="hero" className="text-center py-8 flex flex-col items-center gap-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--primary-action)]/15 text-[var(--primary-action)]">
              {currentCard.type}
            </span>

            <h1 className="text-4xl sm:text-5xl font-black text-[var(--on-container)]">
              {currentCard.name}
            </h1>

            {/* Big Answer Pill */}
            <div className="my-2">
              <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-2xl font-black bg-[var(--primary-action)] text-[var(--primary-action-text)] shadow-lg shadow-[var(--primary-action)]/20">
                <CheckCircle2 size={28} />
                {currentCard.answer === 'OT' && 'Old Testament'}
                {currentCard.answer === 'NT' && 'New Testament'}
                {currentCard.answer === 'BOTH' && 'Both Testaments!'}
              </span>
            </div>

            {/* Scripture Proof Reference */}
            <div className="p-4 rounded-2xl bg-[var(--surface-container)] max-w-lg w-full text-center">
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--primary-action)] mb-1 flex items-center justify-center gap-1">
                <BookOpen size={14} /> Scripture Verification
              </div>
              <p className="text-base font-bold text-[var(--on-container)]">
                {currentCard.refs}
              </p>
              {currentCard.note && (
                <p className="text-xs text-[var(--on-container-variant)] mt-2 italic">
                  "{currentCard.note}"
                </p>
              )}
            </div>

            {/* Room Voting Distribution Bar */}
            <div className="w-full max-w-md mt-2 p-4 rounded-2xl bg-[var(--surface-container-high)]">
              <div className="text-xs font-bold text-[var(--on-container-variant)] mb-2 flex items-center justify-between">
                <span>Room Vote Breakdown</span>
                <span className="font-mono">
                  OT {roundTally.OT} · NT {roundTally.NT} · BOTH {roundTally.BOTH}
                </span>
              </div>
              <div className="w-full h-4 rounded-full overflow-hidden flex bg-gray-200 dark:bg-gray-700">
                {totalPlayers > 0 && (
                  <>
                    <div
                      style={{ width: `${(roundTally.OT / totalPlayers) * 100}%` }}
                      className="bg-amber-400 h-full"
                      title={`Old Testament: ${roundTally.OT}`}
                    />
                    <div
                      style={{ width: `${(roundTally.NT / totalPlayers) * 100}%` }}
                      className="bg-indigo-400 h-full"
                      title={`New Testament: ${roundTally.NT}`}
                    />
                    <div
                      style={{ width: `${(roundTally.BOTH / totalPlayers) * 100}%` }}
                      className="bg-emerald-400 h-full"
                      title={`Both: ${roundTally.BOTH}`}
                    />
                  </>
                )}
              </div>
              <div className="flex justify-between text-[10px] text-[var(--on-container-variant)] mt-1 font-semibold">
                <span className="text-amber-600 dark:text-amber-400">● Old ({roundTally.OT})</span>
                <span className="text-indigo-600 dark:text-indigo-400">● New ({roundTally.NT})</span>
                <span className="text-emerald-600 dark:text-emerald-400">● Both ({roundTally.BOTH})</span>
              </div>
            </div>
          </Card>

          {/* Next Card Button */}
          <div className="flex justify-end">
            <Button
              variant="primary"
              size="lg"
              className="gap-2"
              onClick={() => dispatchIntent('NEXT_CARD')}
            >
              <span>Next Card</span>
              <ArrowRight size={20} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
