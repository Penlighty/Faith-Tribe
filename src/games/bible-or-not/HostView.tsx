import React from 'react';
import { GameViewProps } from '../../engine/types';
import { BibleOrNotState } from './types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { motion } from 'framer-motion';

export const BibleOrNotHostView: React.FC<GameViewProps<BibleOrNotState>> = ({
  state,
  players,
  dispatchIntent,
}) => {
  const {
    currentCard,
    currentPhaseId,
    playerCardStates,
    roundTally,
    currentIndex,
    cardsPool,
    currentRound,
    totalRounds,
    cardIndexInRound,
    cardsPerRound,
    survivingPlayerIds,
    eliminatedPlayerIds,
    podium,
    isGameOver,
  } = state;

  const nextCard = cardsPool[currentIndex + 1];
  const thirdCard = cardsPool[currentIndex + 2];

  const activePlayers = players.filter((p) => survivingPlayerIds.includes(p.id));
  const lockedCount = activePlayers.filter((p) => playerCardStates[p.id]?.locked).length;

  const isCountdown = currentPhaseId === 'countdown';
  const isCard = currentPhaseId === 'card';
  const isReveal = currentPhaseId === 'reveal';
  const isRoundSummary = currentPhaseId === 'roundSummary';

  // Game Over Podium Screen
  if (isGameOver) {
    const getPlayer = (id?: string) => players.find((p) => p.id === id);
    const p1 = getPlayer(podium.first);
    const p2 = getPlayer(podium.second);
    const p3 = getPlayer(podium.third);

    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center py-8 text-center animate-fadeIn">
        <h1 className="text-3xl sm:text-5xl font-black text-slate-800 dark:text-slate-100 tracking-tight mb-2">
          🏆 Bible or Not Champions!
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mb-8">
          The masters of scripture truth who survived every round!
        </p>

        {/* 3-Step Podium */}
        <div className="flex items-end justify-center gap-3 sm:gap-6 w-full max-w-2xl px-4 mb-10">
          {/* 2nd Place */}
          {p2 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-1 flex flex-col items-center"
            >
              <div className="text-3xl mb-1">🥈</div>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-sm sm:text-base truncate max-w-[120px]">
                {p2.name}
              </span>
              <span className="text-xs text-slate-500 font-mono mb-2">
                {state.scores[p2.id] || 0} pts
              </span>
              <div className="w-full h-28 sm:h-36 rounded-t-2xl bg-gradient-to-t from-slate-400 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center font-black text-white text-2xl shadow-lg">
                2
              </div>
            </motion.div>
          )}

          {/* 1st Place */}
          {p1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="flex-1 flex flex-col items-center -translate-y-4"
            >
              <div className="text-4xl mb-1 animate-bounce">👑</div>
              <span className="font-extrabold text-amber-600 dark:text-amber-400 text-base sm:text-lg truncate max-w-[140px]">
                {p1.name}
              </span>
              <span className="text-xs text-amber-700 dark:text-amber-300 font-mono font-bold mb-2">
                {state.scores[p1.id] || 0} pts
              </span>
              <div className="w-full h-36 sm:h-48 rounded-t-2xl bg-gradient-to-t from-amber-500 to-amber-300 dark:from-amber-600 dark:to-amber-400 flex items-center justify-center font-black text-white text-3xl shadow-xl">
                1
              </div>
            </motion.div>
          )}

          {/* 3rd Place */}
          {p3 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex-1 flex flex-col items-center"
            >
              <div className="text-3xl mb-1">🥉</div>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-sm sm:text-base truncate max-w-[120px]">
                {p3.name}
              </span>
              <span className="text-xs text-slate-500 font-mono mb-2">
                {state.scores[p3.id] || 0} pts
              </span>
              <div className="w-full h-20 sm:h-28 rounded-t-2xl bg-gradient-to-t from-amber-700 to-amber-600 dark:from-amber-900 dark:to-amber-800 flex items-center justify-center font-black text-white text-xl shadow-lg">
                3
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // Round Summary / Elimination Dramatic Transition
  if (isRoundSummary) {
    return (
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center py-6 text-center animate-fadeIn">
        <div className="px-4 py-1.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-200 font-bold text-xs uppercase tracking-wider mb-2">
          Round {currentRound} Complete
        </div>
        <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-6">
          Survivors Moving to Round {currentRound + 1}!
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          {/* Survivors */}
          <Card className="p-5 text-left border-emerald-300/60 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/30">
            <h3 className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 mb-3">
              <span>🛡️</span>
              <span>Advancing ({survivingPlayerIds.length})</span>
            </h3>
            <div className="flex flex-col gap-2">
              {survivingPlayerIds.map((id) => {
                const p = players.find((pl) => pl.id === id);
                return (
                  <div key={id} className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-white/80 dark:bg-slate-800/80 shadow-sm">
                    <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">{p?.name || 'Player'}</span>
                    <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">{state.scores[id] || 0} pts</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Eliminated Spectators */}
          <Card className="p-5 text-left border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
            <h3 className="font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2 mb-3">
              <span>📣</span>
              <span>Cheer Bench ({eliminatedPlayerIds.length})</span>
            </h3>
            {eliminatedPlayerIds.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No players eliminated yet!</p>
            ) : (
              <div className="flex flex-col gap-2">
                {eliminatedPlayerIds.map((id) => {
                  const p = players.find((pl) => pl.id === id);
                  return (
                    <div key={id} className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-white/60 dark:bg-slate-800/60 opacity-80">
                      <span className="font-medium text-sm text-slate-700 dark:text-slate-300">{p?.name || 'Player'}</span>
                      <span className="font-mono text-xs text-slate-500">{state.scores[id] || 0} pts</span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 py-4">
      {/* Top Banner: Round and Status */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-200">
            Round {currentRound} of {totalRounds} • Card {cardIndexInRound + 1}/{cardsPerRound}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {currentCard.category}
          </span>
        </div>

        {isCard && (
          <div className="flex items-center gap-2 text-sm font-semibold text-cyan-700 dark:text-cyan-300">
            <span>{lockedCount} / {activePlayers.length} Swiped</span>
          </div>
        )}
      </div>

      {/* Countdown Phase */}
      {isCountdown && (
        <Card variant="hero" className="text-center py-12 flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-cyan-500/15 flex items-center justify-center text-3xl font-black text-cyan-600 dark:text-cyan-400 animate-pulse">
            {state.phaseTimeRemaining ?? 3}
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Next Flashcard Coming Up!
          </h2>
          <p className="text-sm text-slate-500">Decide: Is it in the Bible or Not?</p>
        </Card>
      )}

      {/* Active Card Phase / Reveal Phase */}
      {(isCard || isReveal) && (
        <div className="flex flex-col items-center gap-6">
          {/* Host 3D Flashcard Deck Preview */}
          <div className="relative w-full max-w-md h-[300px] flex items-center justify-center">
            {thirdCard && (
              <div className="absolute w-[88%] h-[260px] rounded-3xl bg-slate-200/60 dark:bg-slate-800/60 border border-slate-300/40 shadow-sm translate-y-6 scale-[0.88]" />
            )}
            {nextCard && (
              <div className="absolute w-[94%] h-[275px] rounded-3xl bg-white/80 dark:bg-slate-800/80 border border-slate-300/60 shadow-md translate-y-3 scale-[0.94]" />
            )}

            <motion.div
              animate={
                isReveal
                  ? currentCard.answer === 'IN_BIBLE'
                    ? { x: 30, rotate: 4 }
                    : { x: -30, rotate: -4 }
                  : { x: 0, rotate: 0 }
              }
              className={`absolute w-full h-[285px] rounded-3xl p-6 flex flex-col justify-between shadow-xl border backdrop-blur-md ${
                isReveal
                  ? currentCard.answer === 'IN_BIBLE'
                    ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 shadow-emerald-500/20'
                    : 'bg-rose-50 dark:bg-rose-950/80 border-rose-500 shadow-rose-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span>{currentCard.category}</span>
                <span>Tier {currentCard.tier}</span>
              </div>

              <div className="text-center my-auto px-4">
                <p className="text-xl sm:text-2xl font-serif font-bold text-slate-800 dark:text-slate-100 leading-snug">
                  "{currentCard.text}"
                </p>
              </div>

              {/* Reveal Pill on Card */}
              {isReveal ? (
                <div className="p-3 rounded-2xl bg-white/90 dark:bg-slate-800/90 border text-xs text-left shadow-sm">
                  <div className="font-extrabold mb-1">
                    {currentCard.answer === 'IN_BIBLE' ? (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        📖 Found in: {currentCard.reference || 'Scripture'}
                      </span>
                    ) : (
                      <span className="text-rose-600 dark:text-rose-400">
                        ❌ Not in the Bible
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[12px] leading-relaxed">
                    {currentCard.explanation}
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs text-slate-400 font-medium pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>← Swipe Left: Not in Bible</span>
                  <span>Swipe Right: In Bible →</span>
                </div>
              )}
            </motion.div>
          </div>

          {/* Reveal Vote Tallies */}
          {isReveal && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-rose-700 dark:text-rose-300 font-bold text-sm">
                <span>❌ Not in Bible:</span>
                <span>{roundTally.NOT_IN_BIBLE || 0}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                <span>📖 In the Bible:</span>
                <span>{roundTally.IN_BIBLE || 0}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
