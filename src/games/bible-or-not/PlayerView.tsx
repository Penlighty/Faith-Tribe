import React, { useState, useEffect } from 'react';
import { GameViewProps } from '../../engine/types';
import { BibleOrNotState, BibleOrNotChoice } from './types';
import { FlashcardDeck } from './FlashcardDeck';
import { Card } from '../../components/ui/Card';
import { soundManager } from '../../engine/services/audio';

export const BibleOrNotPlayerView: React.FC<GameViewProps<BibleOrNotState>> = ({
  state,
  playerId,
  dispatchIntent,
}) => {
  const {
    currentCard,
    currentPhaseId,
    playerCardStates,
    cardsPool,
    currentIndex,
    survivingPlayerIds,
    eliminatedPlayerIds,
    isGameOver,
    podium,
  } = state;

  const playerState = playerCardStates[playerId];
  const isEliminated = eliminatedPlayerIds.includes(playerId);
  const isSurvivor = survivingPlayerIds.includes(playerId);

  const nextCard = cardsPool[currentIndex + 1];
  const thirdCard = cardsPool[currentIndex + 2];

  const isCountdown = currentPhaseId === 'countdown';
  const isCard = currentPhaseId === 'card';
  const isReveal = currentPhaseId === 'reveal';
  const isRoundSummary = currentPhaseId === 'roundSummary';

  const [hasSwipedThisCard, setHasSwipedThisCard] = useState(false);

  useEffect(() => {
    setHasSwipedThisCard(false);
  }, [currentCard.id]);

  const handleSwipe = (choice: BibleOrNotChoice) => {
    if (playerState?.locked || hasSwipedThisCard) return;
    setHasSwipedThisCard(true);

    const elapsed = Math.max(0, (state.phaseDuration ?? 10) - (state.phaseTimeRemaining ?? 0));

    // Dispatch PICK and LOCK
    dispatchIntent('PICK', { choice });
    dispatchIntent('LOCK', { choice, elapsedSeconds: elapsed });
  };

  // Game Over personal recap
  if (isGameOver) {
    const isWinner = podium.first === playerId;
    const isSecond = podium.second === playerId;
    const isThird = podium.third === playerId;
    const rank = isWinner ? 1 : isSecond ? 2 : isThird ? 3 : 'Runner Up';

    return (
      <div className="w-full max-w-md mx-auto flex flex-col items-center py-6 text-center animate-fadeIn">
        <div className="text-5xl mb-3">
          {isWinner ? '👑' : isSecond ? '🥈' : isThird ? '🥉' : '📜'}
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 mb-2">
          {isWinner ? 'Grand Champion!' : typeof rank === 'number' ? `Podium Finish: #${rank}` : 'Well Played!'}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Final Score: <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">{state.scores[playerId] || 0} pts</span>
        </p>

        <Card className="p-4 w-full text-center bg-cyan-50/50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-800">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Thank you for testing your knowledge of God's Word!
          </p>
        </Card>
      </div>
    );
  }

  // Round summary transition
  if (isRoundSummary) {
    return (
      <div className="w-full max-w-md mx-auto flex flex-col items-center py-8 text-center animate-fadeIn">
        <div className="text-4xl mb-3">{isSurvivor ? '🛡️' : '📣'}</div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">
          {isSurvivor ? 'You Survived Round ' + state.currentRound + '!' : 'Cheer Bench Mode'}
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          {isSurvivor
            ? 'Get ready for tougher cards in the next round!'
            : 'You are now cheering and playing along for practice!'}
        </p>
        <div className="px-4 py-2 rounded-2xl bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-200 font-bold font-mono text-sm">
          Your Score: {state.scores[playerId] || 0} pts
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-4 py-2">
      {/* Top Status & Score Bar */}
      <div className="w-full flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-200">
            Round {state.currentRound} • Card {state.cardIndexInRound + 1}/{state.cardsPerRound}
          </span>
          {isEliminated && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              Cheering
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {playerState?.streakCount > 1 && (
            <span className="text-xs font-bold text-amber-500 flex items-center gap-0.5">
              🔥 {playerState.streakCount}
            </span>
          )}
          <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
            {state.scores[playerId] || 0} pts
          </span>
        </div>
      </div>

      {/* Countdown Phase */}
      {isCountdown && (
        <Card variant="hero" className="w-full text-center py-10 flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-full bg-cyan-500/15 flex items-center justify-center text-2xl font-black text-cyan-600 dark:text-cyan-400 animate-pulse">
            {state.phaseTimeRemaining ?? 3}
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Get Ready to Swipe!</h3>
          <p className="text-xs text-slate-500">In the Bible (Right) or Not (Left)?</p>
        </Card>
      )}

      {/* Card Phase & Reveal Phase */}
      {(isCard || isReveal) && (
        <div className="w-full flex flex-col items-center">
          <FlashcardDeck
            card={currentCard}
            nextCard={nextCard}
            thirdCard={thirdCard}
            onSwipe={handleSwipe}
            disabled={isCountdown || playerState?.locked}
            selectedChoice={playerState?.selectedChoice}
            showReveal={isReveal}
            isCorrect={playerState?.isCorrect}
          />

          {/* Feedback Banner on Reveal */}
          {isReveal && playerState && (
            <div
              className={`w-full max-w-md mt-4 p-4 rounded-2xl border text-center animate-fadeIn shadow-sm ${
                playerState.isCorrect
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-400 text-emerald-900 dark:text-emerald-100'
                  : 'bg-rose-100 dark:bg-rose-950/80 border-rose-400 text-rose-900 dark:text-rose-100'
              }`}
            >
              <div className="text-2xl mb-1">{playerState.isCorrect ? '🎉 Correct!' : '❌ Not Quite!'}</div>
              <p className="font-bold text-sm">
                {playerState.isCorrect
                  ? `+${playerState.scoreEarned} Points earned!`
                  : `Correct answer: ${currentCard.answer === 'IN_BIBLE' ? 'IN THE BIBLE' : 'NOT IN BIBLE'}`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
