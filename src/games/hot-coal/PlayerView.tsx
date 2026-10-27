import React, { useEffect } from 'react';
import { GameViewProps } from '../../engine/types';
import { HotCoalState } from './types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { WavyTimer } from '../../components/ui/WavyTimer';
import { Avatar } from '../../components/ui/Avatar';
import { AlertTriangle } from 'lucide-react';
import { Icon } from '@design/icons';
import { useTheme } from '../../theme/ThemeContext';

export const HotCoalPlayerView: React.FC<GameViewProps<HotCoalState>> = ({
  state,
  playerId,
  players,
  dispatchIntent,
  openBottomSheet,
}) => {
  const { currentPhaseId, currentCategory, coalHolderId, burnCount, lastBurnedPlayerId } = state;
  const { triggerHaptic } = useTheme();

  const isHoldingCoal = coalHolderId === playerId;
  const currentHolder = players.find((p) => p.id === coalHolderId);
  const myBurns = burnCount[playerId] || 0;
  const isITheBurned = lastBurnedPlayerId === playerId;

  // Haptic feedback accelerating while holding coal
  useEffect(() => {
    if (currentPhaseId !== 'play' || !isHoldingCoal) return;

    // Pulse vibration every 800ms while holding
    const interval = setInterval(() => {
      triggerHaptic('heavy');
    }, 850);

    return () => clearInterval(interval);
  }, [currentPhaseId, isHoldingCoal, triggerHaptic]);

  const handlePass = (targetPlayerId: string) => {
    if (!isHoldingCoal) return;
    triggerHaptic('medium');
    dispatchIntent('PASS_COAL', { targetPlayerId });
  };

  const handleChallenge = () => {
    triggerHaptic('heavy');
    dispatchIntent('INITIATE_CHALLENGE');
  };

  const openVerifiedSheet = () => {
    const items = Array.isArray(currentCategory?.items)
      ? currentCategory.items
      : currentCategory?.items && typeof currentCategory.items === 'object'
      ? Object.values(currentCategory.items)
      : [];
    const references = Array.isArray(currentCategory?.references)
      ? currentCategory.references
      : [];

    openBottomSheet({
      title: `Category: ${currentCategory?.title || 'Scripture Category'}`,
      component: (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-[var(--on-container-variant)]">Verified Scripture Items:</p>
          <div className="grid grid-cols-2 gap-2">
            {items.map((item: any, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-[var(--surface-container)] text-xs font-semibold"
              >
                {item?.name}
              </div>
            ))}
          </div>
          <div className="text-xs opacity-75 mt-1 font-mono">
            {references.join(', ')}
          </div>
        </div>
      ),
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-5 px-4 pb-6">
      {/* Category Hero */}
      <Card
        variant="hero"
        padding="lg"
        className={`text-center flex flex-col items-center gap-3 transition-colors ${
          isHoldingCoal
            ? 'bg-rose-500/10 border-rose-500/40 text-rose-950 dark:text-rose-100'
            : ''
        }`}
      >
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/10 dark:bg-white/10">
          Category
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">
          {currentCategory.title}
        </h2>

        {/* Burns counter badge */}
        <div className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[var(--surface-container-high)] text-[var(--on-container)] flex items-center gap-1.5">
          <span>Your Burns: {myBurns}</span>
          <Icon name="flame" size={12} className="text-amber-500" />
        </div>
      </Card>

      {/* Countdown Timer */}
      {state.phaseDuration && state.phaseTimeRemaining !== undefined && (
        <WavyTimer
          durationSeconds={state.phaseDuration}
          remainingSeconds={state.phaseTimeRemaining}
        />
      )}

      {/* Phase 1: Category Intro */}
      {currentPhaseId === 'category' && (
        <Card variant="tonal" padding="md" className="text-center flex flex-col items-center gap-2">
          <p className="text-sm font-semibold opacity-85">
            Prepare your answers! When the coal lands on your phone, say an item aloud and pass it fast!
          </p>
        </Card>
      )}

      {/* Phase 2: Play */}
      {currentPhaseId === 'play' && (
        <div className="flex flex-col gap-4">
          {isHoldingCoal ? (
            /* ACTIVE COAL HOLDER INTERFACE */
            <Card
              variant="elevated"
              padding="lg"
              className="bg-gradient-to-br from-rose-500 to-amber-600 text-white flex flex-col items-center gap-4 text-center shadow-expressive-lg border-none animate-pulse"
            >
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <Icon name="flame" size={36} className="text-amber-200" />
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase tracking-wide">
                  You Hold The Coal!
                </h3>
                <p className="text-sm text-white/90 font-semibold mt-1">
                  Say your answer aloud, then TAP a disciple below to pass!
                </p>
              </div>

              {/* Pass Target Disciples Grid */}
              <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {players
                  .filter((p) => p.id !== playerId)
                  .map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handlePass(p.id)}
                      className="p-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-sm flex items-center gap-2 border border-white/25 active:scale-95 transition-all cursor-pointer"
                    >
                      <Avatar name={p.name} size="sm" />
                      <span className="truncate">{p.name}</span>
                    </button>
                  ))}
              </div>
            </Card>
          ) : (
            /* NON-HOLDER INTERFACE */
            <div className="flex flex-col gap-3">
              <Card variant="tonal" padding="md" className="text-center flex flex-col items-center gap-2">
                <span className="text-xs uppercase font-bold text-[var(--on-container-variant)]">
                  Current Coal Holder
                </span>
                <div className="flex items-center gap-2 text-lg font-black">
                  <Avatar name={currentHolder?.name || 'Someone'} size="md" />
                  <span>{currentHolder?.name}</span>
                </div>
                <p className="text-xs opacity-75">
                  Listen closely. If their answer is wrong or repeated, challenge them!
                </p>
              </Card>

              {/* Action Cluster: Challenge button */}
              <div className="flex items-center gap-2">
                <Button
                  variant="tonal"
                  size="md"
                  pill
                  leftIcon={<Icon name="book-open" size={16} />}
                  onClick={openVerifiedSheet}
                  className="flex-1"
                >
                  Reference
                </Button>
                <Button
                  variant="danger"
                  size="hero"
                  leftIcon={<Icon name="shield" size={20} />}
                  onClick={handleChallenge}
                  className="flex-[2] rounded-[22px]"
                >
                  Challenge!
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Phase 3: Challenge */}
      {currentPhaseId === 'challenge' && (
        <Card variant="tonal" padding="md" className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
          <h3 className="font-extrabold text-lg">Challenge Raised!</h3>
          <p className="text-xs text-[var(--on-container-variant)]">
            Host is verifying if the answer was correct in scripture.
          </p>
          <Button variant="tonal" size="sm" onClick={openVerifiedSheet}>
            View Verified List
          </Button>
        </Card>
      )}

      {/* Phase 4: Burn */}
      {currentPhaseId === 'burn' && (
        <Card
          variant="tonal"
          padding="lg"
          className={`flex flex-col items-center gap-3 text-center ${
            isITheBurned ? 'bg-red-500/10 border-red-500/30' : ''
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <Icon name="flame" size={32} />
          </div>
          <h3 className="text-2xl font-black">
            {isITheBurned ? 'Ouch! You Took a Burn!' : 'The Coal Burned Out!'}
          </h3>
          <p className="text-sm text-[var(--on-container-variant)]">
            {isITheBurned
              ? 'The fuse ended while you held the coal. (+1 Burn)'
              : 'You survived this round unscathed!'}
          </p>
        </Card>
      )}
    </div>
  );
};
