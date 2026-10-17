import React, { useEffect } from 'react';
import { GameViewProps } from '../../engine/types';
import { TaresState } from './types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { WavyTimer } from '../../components/ui/WavyTimer';
import { Avatar } from '../../components/ui/Avatar';
import { UserX, MessageSquare } from 'lucide-react';
import { Icon } from '@design/icons';

export const TaresHostView: React.FC<GameViewProps<TaresState>> = ({
  state,
  players,
  dispatchIntent,
}) => {
  const {
    currentPhaseId,
    currentPassage,
    tarePlayerIds,
    activeCluePlayerIndex,
    cluePlayerOrder,
    votes,
    isTareCaught,
    isStealSuccessful,
    roundScores,
  } = state;

  const activeCluePlayerId = cluePlayerOrder[activeCluePlayerIndex];
  const activeCluePlayer = players.find((p) => p.id === activeCluePlayerId);
  const votedCount = Object.keys(votes).length;

  // Auto-resolve votes when entering reveal phase
  useEffect(() => {
    if (currentPhaseId === 'reveal' && isTareCaught === undefined) {
      dispatchIntent('RESOLVE_VOTES');
    }
  }, [currentPhaseId, isTareCaught, dispatchIntent]);

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-5 px-4 pb-6">
      {/* Hero Card: Passage Title for Host Monitor */}
      <Card variant="hero" padding="lg" className="text-center flex flex-col items-center gap-3">
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/10 dark:bg-white/10 flex items-center gap-1.5">
          <Icon name="wheat" size={14} /> Passage (Host Monitor)
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold leading-snug tracking-tight">
          {currentPassage.title}
        </h2>
        <span className="text-xs font-semibold text-[var(--on-container-variant)]">
          {currentPassage.reference}
        </span>
      </Card>

      {/* Countdown Timer */}
      {state.phaseDuration && state.phaseTimeRemaining !== undefined && (
        <WavyTimer
          durationSeconds={state.phaseDuration}
          remainingSeconds={state.phaseTimeRemaining}
        />
      )}

      {/* Phase 1: Deal */}
      {currentPhaseId === 'deal' && (
        <Card variant="tonal" padding="md" className="flex flex-col gap-3 text-center">
          <p className="text-sm font-semibold opacity-85">
            Secret role cards dealt to all phones! Disciples are reading their passage.
          </p>
          <Button
            variant="primary"
            size="lg"
            rightIcon={<Icon name="arrow-right" size={18} />}
            onClick={() => dispatchIntent('ADVANCE_PHASE')}
          >
            Start Spoken Clues
          </Button>
        </Card>
      )}

      {/* Phase 2: Clues */}
      {currentPhaseId === 'clues' && (
        <Card variant="tonal" padding="md" className="flex flex-col items-center gap-4 text-center">
          <span className="text-xs font-bold uppercase tracking-wider opacity-75">
            Turn to Speak a 1-Word or Short Clue:
          </span>

          {activeCluePlayer ? (
            <div className="flex flex-col items-center gap-2">
              <Avatar name={activeCluePlayer.name} size="lg" />
              <h3 className="text-xl font-black">{activeCluePlayer.name}</h3>
              <p className="text-xs text-[var(--on-container-variant)]">
                Clue {activeCluePlayerIndex + 1} of {cluePlayerOrder.length}
              </p>
            </div>
          ) : (
            <div className="p-3 text-sm font-bold text-emerald-600 dark:text-emerald-400">
              All disciples have spoken their clues!
            </div>
          )}

          <div className="w-full flex gap-2">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              rightIcon={<Icon name="arrow-right" size={18} />}
              onClick={() => {
                if (activeCluePlayerIndex + 1 < cluePlayerOrder.length) {
                  dispatchIntent('CLUE_DONE');
                } else {
                  dispatchIntent('ADVANCE_PHASE');
                }
              }}
            >
              {activeCluePlayerIndex + 1 < cluePlayerOrder.length ? 'Next Clue' : 'Proceed to Debate'}
            </Button>
          </div>
        </Card>
      )}

      {/* Phase 3: Debate */}
      {currentPhaseId === 'debate' && (
        <Card variant="tonal" padding="md" className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 flex items-center justify-center">
            <MessageSquare size={24} />
          </div>
          <h3 className="text-xl font-black">Room Debate!</h3>
          <p className="text-sm font-medium opacity-85">
            Who sounded suspicious? Who gave a generic clue because they didn&apos;t know the story?
          </p>
          <Button
            variant="primary"
            size="lg"
            className="w-full mt-2"
            onClick={() => dispatchIntent('ADVANCE_PHASE')}
          >
            Start Voting Early
          </Button>
        </Card>
      )}

      {/* Phase 4: Vote */}
      {currentPhaseId === 'vote' && (
        <Card variant="tonal" padding="md" className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-sm font-bold">
            <span>Votes Cast</span>
            <span className="font-mono bg-[var(--surface-container-high)] px-3 py-1 rounded-full">
              {votedCount} / {players.length}
            </span>
          </div>

          <Button
            variant="primary"
            size="lg"
            disabled={votedCount === 0}
            onClick={() => dispatchIntent('RESOLVE_VOTES')}
          >
            Reveal Tare &amp; Results
          </Button>
        </Card>
      )}

      {/* Phase 5: Reveal */}
      {currentPhaseId === 'reveal' && (
        <div className="flex flex-col gap-4">
          <Card
            variant="tonal"
            padding="lg"
            className={`flex flex-col items-center gap-3 text-center border-2 ${
              isTareCaught
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-rose-500 bg-rose-500/10'
            }`}
          >
            <div className="w-14 h-14 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center">
              <UserX size={30} />
            </div>

            <h3 className="text-2xl font-black">
              {isTareCaught ? 'The Tare Was Caught!' : 'The Tare Escaped Detection!'}
            </h3>

            <div className="flex items-center gap-2 text-sm font-bold">
              <span>The Tare(s):</span>
              {tarePlayerIds.map((id) => (
                <span key={id} className="underline">
                  {players.find((p) => p.id === id)?.name}
                </span>
              ))}
            </div>

            {isTareCaught && isStealSuccessful !== undefined && (
              <div className="mt-2 p-2.5 rounded-xl bg-[var(--surface-card)] text-xs font-bold">
                {isStealSuccessful ? '🎯 Tare successfully stole the passage (+1)!' : '❌ Tare failed the steal guess.'}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
