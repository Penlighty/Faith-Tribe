import React, { useEffect } from 'react';
import { GameViewProps } from '../../engine/types';
import { FakeAProverbState } from './types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { WavyTimer } from '../../components/ui/WavyTimer';
import { Avatar } from '../../components/ui/Avatar';
import { Icon } from '@design/icons';

export const FakeAProverbHostView: React.FC<GameViewProps<FakeAProverbState>> = ({
  state,
  players,
  dispatchIntent,
}) => {
  const { currentPhaseId, currentProverb, submissions, votes, shuffledEndings, roundScores } = state;

  // Auto-prepare voting when entering 'vote' phase
  useEffect(() => {
    if (currentPhaseId === 'vote' && shuffledEndings.length === 0) {
      dispatchIntent('PREPARE_VOTING');
    }
    if (currentPhaseId === 'reveal' && Object.keys(roundScores).length === 0) {
      dispatchIntent('CALCULATE_ROUND_SCORES');
    }
  }, [currentPhaseId, shuffledEndings.length, roundScores, dispatchIntent]);

  const submittedCount = Object.keys(submissions).length;
  const votedCount = Object.keys(votes).length;

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-5 px-4 pb-6">
      {/* Hero Card prompt mirroring Now Playing */}
      <Card variant="hero" padding="lg" className="text-center flex flex-col items-center gap-3">
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/10 dark:bg-white/10">
          Proverbs Wisdom • {currentProverb.reference}
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold leading-snug tracking-tight">
          &ldquo;{currentProverb.firstHalf}&hellip;&rdquo;
        </h2>
        {currentPhaseId === 'reveal' && (
          <div className="mt-2 p-3.5 rounded-2xl bg-[var(--primary-action)] text-[var(--primary-action-text)] font-bold text-lg animate-fade-in shadow-sm">
            &ldquo;{currentProverb.realEnding}&rdquo;
          </div>
        )}
      </Card>

      {/* Countdown Timer */}
      {state.phaseDuration && state.phaseTimeRemaining !== undefined && (
        <WavyTimer
          durationSeconds={state.phaseDuration}
          remainingSeconds={state.phaseTimeRemaining}
        />
      )}

      {/* Phase-specific Host Monitor & Action Cluster */}
      {currentPhaseId === 'prompt' && (
        <Card variant="tonal" padding="md" className="flex flex-col gap-3 text-center">
          <p className="text-sm font-semibold opacity-80">
            Read the opening aloud to the room. Players are preparing their minds!
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => dispatchIntent('ADVANCE_PHASE')}
            rightIcon={<Icon name="arrow-right" size={18} />}
          >
            Start Writing (45s)
          </Button>
        </Card>
      )}

      {currentPhaseId === 'write' && (
        <Card variant="tonal" padding="md" className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold">Submissions Received</span>
            <span className="font-mono text-sm font-bold bg-[var(--surface-container-high)] px-3 py-1 rounded-full">
              {submittedCount} / {players.length}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {players.map((p) => {
              const hasSubmitted = !!submissions[p.id];
              return (
                <div
                  key={p.id}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    hasSubmitted
                      ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200'
                      : 'bg-[var(--surface-container-high)] text-[var(--on-container-variant)] opacity-60'
                  }`}
                >
                  <Avatar name={p.name} size="sm" />
                  <span>{p.name}</span>
                  {hasSubmitted && <Icon name="check" size={14} />}
                </div>
              );
            })}
          </div>

          <Button
            variant="tonal"
            size="md"
            onClick={() => dispatchIntent('PREPARE_VOTING')}
            disabled={submittedCount === 0}
          >
            Advance to Voting Early
          </Button>
        </Card>
      )}

      {currentPhaseId === 'vote' && (
        <Card variant="tonal" padding="md" className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold">Votes Cast</span>
            <span className="font-mono text-sm font-bold bg-[var(--surface-container-high)] px-3 py-1 rounded-full">
              {votedCount} / {players.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {shuffledEndings.map((entry, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-[var(--surface-card)] text-sm font-semibold border border-[var(--border-tint)] flex items-center justify-between"
              >
                <span>&ldquo;&hellip;{entry.ending}&rdquo;</span>
                {entry.isReal && (
                  <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded-full">
                    Real (Host View)
                  </span>
                )}
              </div>
            ))}
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={() => dispatchIntent('CALCULATE_ROUND_SCORES')}
            disabled={votedCount === 0}
          >
            Reveal Results
          </Button>
        </Card>
      )}

      {currentPhaseId === 'reveal' && (
        <div className="flex flex-col gap-4">
          <Card variant="tonal" padding="md" className="flex flex-col gap-3">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Icon name="medal" size={18} className="text-amber-500" />
              Round Breakdown
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {shuffledEndings.map((entry, idx) => {
                const author = entry.authorId ? players.find((p) => p.id === entry.authorId) : null;
                const voters = Object.entries(votes)
                  .filter(([, choice]) => choice === entry.ending)
                  .map(([voterId]) => players.find((p) => p.id === voterId)?.name)
                  .filter(Boolean);

                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border ${
                      entry.isReal
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700'
                        : 'bg-[var(--surface-card)] border-[var(--border-tint)]'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-sm">
                      <span>&ldquo;&hellip;{entry.ending}&rdquo;</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10">
                        {entry.isReal ? 'True Scripture' : `By ${author?.name || 'Player'}`}
                      </span>
                    </div>

                    <div className="mt-2 text-xs text-[var(--on-container-variant)] flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold">Voted by:</span>
                      {voters.length > 0 ? (
                        voters.map((v, i) => (
                          <span
                            key={i}
                            className="bg-[var(--surface-container-high)] px-2 py-0.5 rounded-md font-medium"
                          >
                            {v}
                          </span>
                        ))
                      ) : (
                        <span className="italic opacity-60">No votes</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
