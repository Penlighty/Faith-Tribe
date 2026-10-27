import React from 'react';
import { GameViewProps } from '../../engine/types';
import { ScribesTilesState } from './types';
import { useTheme } from '../../theme/ThemeContext';
import { CheckCircle2, XCircle, Flame, Clock, Shuffle, RotateCcw, Delete } from 'lucide-react';
import { Icon } from '../../design/icons';

export const ScribesTilesPlayerView: React.FC<GameViewProps<ScribesTilesState>> = ({
  state: gameState,
  playerId,
  dispatchIntent,
}) => {
  const { triggerHaptic } = useTheme();
  const { currentWord, currentPhaseId, phaseTimeRemaining = 0, isCloseCall, playerStates } = gameState;
  const pState = playerStates[playerId];

  const isReveal = currentPhaseId === 'reveal';
  const isLocked = pState?.locked;
  const rack = pState?.rack || [];
  const placed = pState?.placedTiles || [];

  const handlePlaceTile = (tileId: string) => {
    if (isLocked || isReveal) return;
    triggerHaptic('selection');
    dispatchIntent('PLACE_TILE', { tileId });
  };

  const handleRemoveSlot = (slotIndex: number) => {
    if (isLocked || isReveal) return;
    triggerHaptic('light');
    dispatchIntent('REMOVE_TILE', { slotIndex });
  };

  const handleClear = () => {
    if (isLocked || isReveal) return;
    triggerHaptic('medium');
    dispatchIntent('CLEAR_TILES');
  };

  const handleShuffle = () => {
    if (isLocked || isReveal) return;
    triggerHaptic('light');
    dispatchIntent('SHUFFLE_RACK');
  };

  const handleBackspace = () => {
    if (isLocked || isReveal) return;
    // Find last filled slot
    for (let i = placed.length - 1; i >= 0; i--) {
      if (placed[i] !== null) {
        handleRemoveSlot(i);
        break;
      }
    }
  };

  const handleSubmit = () => {
    if (isLocked || isReveal) return;
    triggerHaptic('medium');
    dispatchIntent('SUBMIT_WORD');
  };

  // Solve Phase
  if (!isReveal) {
    const isAllPlaced = placed.length > 0 && placed.every((s) => s !== null);

    return (
      <div className="w-full max-w-lg mx-auto flex flex-col gap-4 p-3 sm:p-5 select-none animate-fadeIn">
        {/* Top bar: Category + Timer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/20">
              {currentWord.category}
            </span>
            <span className="text-xs font-bold text-[var(--on-container-variant)]">
              {currentWord.length} letters
            </span>
          </div>

          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-sm font-black ${
              isCloseCall || phaseTimeRemaining <= 5
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-[var(--surface-container-high)] text-[var(--on-container)]'
            }`}
          >
            <Clock size={14} />
            <span>{phaseTimeRemaining}s</span>
          </div>
        </div>

        {/* Close Call Banner */}
        {isCloseCall && (
          <div className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 text-white text-center font-black text-xs uppercase tracking-wider animate-bounce shadow-md flex items-center justify-center gap-1.5">
            <Icon name="bolt" size={14} />
            <span>5 SECONDS REMAINING! SOLVE FAST!</span>
            <Icon name="bolt" size={14} />
          </div>
        )}

        {/* Clue Card */}
        <div className="p-4 rounded-2xl bg-[var(--surface-container)] border border-[var(--border-tint)] text-center shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 block mb-1">
            Clue
          </span>
          <p className="font-serif italic text-sm sm:text-base font-bold text-[var(--on-container)]">
            “{currentWord.clue}”
          </p>
        </div>

        {/* Answer Slots Tray */}
        <div className="flex flex-col items-center gap-2 my-1">
          <div
            className={`flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 p-3 rounded-2xl bg-[var(--surface-card)] border-2 transition-all ${
              pState?.shakeError
                ? 'border-rose-500 animate-shake'
                : isLocked
                ? 'border-emerald-500/60 bg-emerald-500/10'
                : 'border-[var(--border-tint)] shadow-inner'
            }`}
          >
            {placed.map((slot, idx) => (
              <button
                key={idx}
                onClick={() => slot && handleRemoveSlot(idx)}
                disabled={isLocked || !slot}
                aria-label={slot ? `Remove letter ${slot.letter}` : `Empty slot ${idx + 1}`}
                className={`w-11 h-14 sm:w-13 sm:h-16 rounded-xl flex items-center justify-center font-black text-xl sm:text-2xl transition-all cursor-pointer ${
                  slot
                    ? 'bg-gradient-to-b from-amber-200 to-amber-400 dark:from-amber-600 dark:to-amber-800 text-amber-950 dark:text-white shadow-md border-b-3 border-amber-600 dark:border-amber-950 active:scale-95'
                    : 'bg-[var(--surface-container)] border-2 border-dashed border-[var(--border-tint)]/80 text-[var(--on-container-variant)] opacity-50'
                }`}
              >
                {slot?.letter || ''}
              </button>
            ))}
          </div>

          <span className="text-[11px] font-semibold text-[var(--on-container-variant)] opacity-70">
            {isLocked ? 'Word Locked in!' : 'Tap a placed letter to return it to rack'}
          </span>
        </div>

        {/* Action Controls (Shuffle, Clear, Backspace) */}
        {!isLocked && (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleShuffle}
              className="px-3.5 py-1.5 rounded-full bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] text-[var(--on-container)] text-xs font-bold flex items-center gap-1.5 border border-[var(--border-tint)] shadow-sm active:scale-95 cursor-pointer"
            >
              <Shuffle size={13} /> Shuffle
            </button>
            <button
              onClick={handleClear}
              className="px-3.5 py-1.5 rounded-full bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] text-[var(--on-container)] text-xs font-bold flex items-center gap-1.5 border border-[var(--border-tint)] shadow-sm active:scale-95 cursor-pointer"
            >
              <RotateCcw size={13} /> Clear
            </button>
            <button
              onClick={handleBackspace}
              className="px-3.5 py-1.5 rounded-full bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] text-[var(--on-container)] text-xs font-bold flex items-center gap-1.5 border border-[var(--border-tint)] shadow-sm active:scale-95 cursor-pointer"
            >
              <Delete size={13} /> Backspace
            </button>
          </div>
        )}

        {/* Tile Rack */}
        {!isLocked ? (
          <div className="flex flex-col gap-2 mt-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--on-container-variant)] text-center">
              Your Tile Rack
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2 p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-[var(--surface-container)] to-[var(--surface-container-high)] border border-[var(--border-tint)] shadow-sm">
              {rack.map((tile) => (
                <button
                  key={tile.id}
                  onClick={() => handlePlaceTile(tile.id)}
                  className="w-11 h-13 sm:w-12 sm:h-14 rounded-xl bg-gradient-to-b from-amber-100 to-amber-200 dark:from-amber-700 dark:to-amber-900 text-amber-950 dark:text-amber-100 font-black text-xl sm:text-2xl shadow-md border-b-3 border-amber-400 dark:border-amber-950 active:scale-95 hover:brightness-105 transition-all cursor-pointer flex items-center justify-center"
                >
                  {tile.letter}
                </button>
              ))}
            </div>

            {isAllPlaced && (
              <button
                onClick={handleSubmit}
                className="w-full mt-2 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-98 text-white font-black text-base shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 animate-bounce-subtle"
              >
                <CheckCircle2 size={18} /> Submit Word
              </button>
            )}
          </div>
        ) : (
          /* Locked Scribe View */
          <div className="p-6 rounded-3xl bg-[var(--surface-container)] border-2 border-emerald-500/40 text-center flex flex-col items-center gap-3 shadow-md animate-fadeIn mt-2">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center animate-pulse">
              <CheckCircle2 size={28} />
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-[var(--on-container-variant)]">
              Word Locked & Assembled
            </span>
            <h2 className="text-2xl font-black text-[var(--on-container)]">
              {placed.map((s) => s?.letter || '').join('')}
            </h2>
            <p className="text-xs font-semibold text-[var(--on-container-variant)] opacity-80">
              Waiting for other scribes to complete...
            </p>
          </div>
        )}
      </div>
    );
  }

  // Reveal Phase
  const isCorrect = pState?.isCorrect;
  const scoreEarned = pState?.scoreEarned || 0;
  const streak = pState?.streakCount || 0;

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-5 p-4 sm:p-6 select-none animate-fadeIn">
      {/* Result Status Card */}
      <div
        className={`p-6 rounded-3xl text-center flex flex-col items-center gap-3 shadow-lg border-2 ${
          isCorrect
            ? 'bg-gradient-to-b from-emerald-500/20 to-[var(--surface-card)] border-emerald-500/50 text-emerald-900 dark:text-emerald-100'
            : 'bg-gradient-to-b from-rose-500/20 to-[var(--surface-card)] border-rose-500/50 text-rose-900 dark:text-rose-100'
        }`}
      >
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center ${
            isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
          }`}
        >
          {isCorrect ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
        </div>

        <h1 className="text-2xl font-black tracking-tight">
          {isCorrect ? 'Word Solved!' : 'Unfinished Word!'}
        </h1>

        <div className="flex items-center gap-2 font-mono text-xl font-black">
          {isCorrect ? (
            <span className="text-emerald-600 dark:text-emerald-400">+{scoreEarned} pts</span>
          ) : (
            <span className="text-rose-600 dark:text-rose-400">+0 pts</span>
          )}
        </div>

        {streak >= 3 && isCorrect && (
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-black">
            <Flame size={14} /> {streak} streak!
          </div>
        )}
      </div>

      {/* Answer & Explanation */}
      <div className="p-4 rounded-2xl bg-[var(--surface-container)] border border-[var(--border-tint)] flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase text-[var(--on-container-variant)]">
            Biblical Answer
          </span>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <Icon name="book-open" size={12} />
            <span>{currentWord.ref}</span>
          </span>
        </div>
        <div className="text-2xl font-black text-[var(--on-container)] tracking-wider">
          {currentWord.answer}
        </div>
        <p className="text-xs font-medium text-[var(--on-container-variant)] italic">
          “{currentWord.clue}”
        </p>
      </div>

      {/* Total Score */}
      <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-tint)] font-bold text-sm">
        <span className="text-[var(--on-container-variant)]">Your Total Score</span>
        <span className="font-mono text-base font-black text-[var(--on-container)]">
          {gameState.scores[playerId] || 0} pts
        </span>
      </div>
    </div>
  );
};
