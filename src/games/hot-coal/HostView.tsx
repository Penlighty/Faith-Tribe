import React, { useEffect } from 'react';
import { GameViewProps } from '../../engine/types';
import { HotCoalState } from './types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { WavyTimer } from '../../components/ui/WavyTimer';
import { Avatar } from '../../components/ui/Avatar';
import { UserCheck } from 'lucide-react';
import { Icon } from '@design/icons';
import { motion } from 'framer-motion';

export const HotCoalHostView: React.FC<GameViewProps<HotCoalState>> = ({
  state,
  players,
  dispatchIntent,
  openBottomSheet,
}) => {
  const { currentPhaseId, currentCategory, coalHolderId, burnCount, activeChallenge, lastBurnedPlayerId } = state;
  const currentHolder = players.find((p) => p.id === coalHolderId);
  const burnedPlayer = lastBurnedPlayerId ? players.find((p) => p.id === lastBurnedPlayerId) : null;

  // Auto-trigger burn if fuse expires in play phase
  useEffect(() => {
    if (currentPhaseId === 'play' && state.phaseTimeRemaining !== undefined && state.phaseTimeRemaining <= 0) {
      dispatchIntent('TRIGGER_BURN');
    }
  }, [currentPhaseId, state.phaseTimeRemaining, dispatchIntent]);

  const openVerifiedSheet = () => {
    openBottomSheet({
      title: `Verified: ${currentCategory.title}`,
      component: (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-[var(--on-container-variant)]">
            Official scripture reference items:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {currentCategory.items.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-[var(--surface-container)] text-xs font-semibold flex flex-col"
              >
                <span>{item.name}</span>
                {item.aliases.length > 0 && (
                  <span className="text-[10px] opacity-70">({item.aliases.join(', ')})</span>
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs font-semibold opacity-75">
            References: {currentCategory.references.join(', ')}
          </div>
        </div>
      ),
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-5 px-4 pb-6">
      {/* Hero: Glowing Coal & Category */}
      <Card variant="hero" padding="lg" className="text-center flex flex-col items-center gap-3 relative overflow-hidden">
        {/* Animated glowing coal backdrop */}
        <motion.div
          animate={{
            scale: currentPhaseId === 'play' ? [1, 1.15, 1] : 1,
            opacity: currentPhaseId === 'play' ? [0.4, 0.75, 0.4] : 0.3,
          }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-gradient-to-br from-amber-500 to-rose-600 blur-2xl -z-10"
        />

        <div className="flex items-center gap-2">
          <span className="p-2 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
            <Icon name="flame" size={20} className="text-amber-500" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider opacity-80">
            Hot Coal Category
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold leading-snug tracking-tight">
          {currentCategory.title}
        </h2>

        {/* Current Coal Holder Highlight */}
        {currentPhaseId === 'play' && currentHolder && (
          <div className="mt-2 flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-800 dark:text-rose-200 text-sm font-bold animate-pulse">
            <Icon name="flame" size={16} />
            <span>Holds the Coal: {currentHolder.name}</span>
          </div>
        )}

        {currentPhaseId === 'burn' && burnedPlayer && (
          <div className="mt-2 p-3 rounded-2xl bg-red-600 text-white font-extrabold text-base shadow-md">
            🔥 {burnedPlayer.name} Took a Burn!
          </div>
        )}
      </Card>

      {/* Fuse Wavy Countdown */}
      {state.phaseDuration && state.phaseTimeRemaining !== undefined && (
        <WavyTimer
          durationSeconds={state.phaseDuration}
          remainingSeconds={state.phaseTimeRemaining}
        />
      )}

      {/* Phase Actions */}
      {currentPhaseId === 'category' && (
        <Card variant="tonal" padding="md" className="flex flex-col gap-3 text-center">
          <p className="text-sm font-semibold opacity-85">
            Disciples: Answer aloud, then tap a player on your phone to pass the burning coal!
          </p>
          <div className="flex gap-2">
            <Button
              variant="tonal"
              size="md"
              leftIcon={<Icon name="book-open" size={16} />}
              onClick={openVerifiedSheet}
              className="flex-1"
            >
              Peek List
            </Button>
            <Button
              variant="primary"
              size="lg"
              rightIcon={<Icon name="arrow-right" size={18} />}
              onClick={() => dispatchIntent('ADVANCE_PHASE')}
              className="flex-[2]"
            >
              Light the Fuse!
            </Button>
          </div>
        </Card>
      )}

      {currentPhaseId === 'play' && (
        <div className="flex flex-col gap-3">
          <Card variant="tonal" padding="md" className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
              <span>Disciples in Circle</span>
              <button
                onClick={openVerifiedSheet}
                className="text-[var(--primary-action)] underline"
              >
                Verify Answers
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {players.map((p) => {
                const isHolding = p.id === coalHolderId;
                const burns = burnCount[p.id] || 0;

                return (
                  <div
                    key={p.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between ${
                      isHolding
                        ? 'bg-rose-100 border-rose-400 dark:bg-rose-950/60 dark:border-rose-600 shadow-sm'
                        : 'bg-[var(--surface-card)] border-[var(--border-tint)]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar name={p.name} size="sm" />
                      <span className="text-xs font-bold truncate">{p.name}</span>
                    </div>
                    {isHolding ? (
                      <Icon name="flame" size={16} className="text-rose-600 animate-bounce" />
                    ) : (
                      <span className="text-[10px] font-mono text-[var(--on-container-variant)]">
                        {burns} 🔥
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          <Button
            variant="danger"
            size="lg"
            leftIcon={<Icon name="shield" size={18} />}
            onClick={() => dispatchIntent('INITIATE_CHALLENGE')}
          >
            Host Call Challenge
          </Button>
        </div>
      )}

      {currentPhaseId === 'challenge' && activeChallenge && (
        <Card variant="tonal" padding="md" className="flex flex-col gap-4 text-center">
          <h3 className="text-lg font-black text-amber-700 dark:text-amber-300 flex items-center justify-center gap-2">
            <Icon name="shield" size={22} />
            Challenge in Progress!
          </h3>
          <p className="text-xs font-medium opacity-85">
            Check the verified list to resolve if the spoken answer was legitimate.
          </p>

          <Button variant="tonal" size="md" onClick={openVerifiedSheet}>
            Open Reference List
          </Button>

          <div className="flex gap-2">
            <Button
              variant="primary"
              size="md"
              className="flex-1 bg-emerald-600 text-white"
              onClick={() => dispatchIntent('RESOLVE_CHALLENGE', { wasValidAnswer: true })}
            >
              Valid Answer (Challenger Burns)
            </Button>
            <Button
              variant="danger"
              size="md"
              className="flex-1"
              onClick={() => dispatchIntent('RESOLVE_CHALLENGE', { wasValidAnswer: false })}
            >
              Invalid Answer (Speaker Burns)
            </Button>
          </div>
        </Card>
      )}

      {currentPhaseId === 'burn' && (
        <Card variant="tonal" padding="md" className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm font-semibold opacity-90">
            Fewest burns at the end of 5 rounds wins the crown!
          </p>
        </Card>
      )}
    </div>
  );
};
