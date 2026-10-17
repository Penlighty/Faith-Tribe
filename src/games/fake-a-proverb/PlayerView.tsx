import React, { useState } from 'react';
import { GameViewProps } from '../../engine/types';
import { FakeAProverbState } from './types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { WavyTimer } from '../../components/ui/WavyTimer';
import { Send } from 'lucide-react';
import { Icon } from '@design/icons';
import { useTheme } from '../../theme/ThemeContext';

export const FakeAProverbPlayerView: React.FC<GameViewProps<FakeAProverbState>> = ({
  state,
  playerId,
  dispatchIntent,
}) => {
  const { currentPhaseId, currentProverb, submissions, votes, shuffledEndings, roundScores } = state;
  const [fakeInput, setFakeInput] = useState('');
  const { triggerHaptic } = useTheme();

  const mySubmission = submissions[playerId];
  const myVote = votes[playerId];
  const myRoundScore = roundScores[playerId] || 0;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!fakeInput.trim() || mySubmission) return;
    triggerHaptic('medium');
    dispatchIntent('SUBMIT_ENDING', { ending: fakeInput.trim() });
  };

  const handleVote = (choiceEnding: string) => {
    if (myVote) return;
    triggerHaptic('medium');
    dispatchIntent('SUBMIT_VOTE', { choiceEnding });
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-5 px-4 pb-6">
      {/* Hero Card Prompt */}
      <Card variant="hero" padding="lg" className="text-center flex flex-col items-center gap-2">
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/10 dark:bg-white/10">
          Finish the Proverb
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold leading-snug tracking-tight">
          &ldquo;{currentProverb.firstHalf}&hellip;&rdquo;
        </h2>
        {currentPhaseId === 'reveal' && (
          <div className="mt-2 p-3 rounded-2xl bg-[var(--primary-action)] text-[var(--primary-action-text)] font-bold text-base shadow-sm">
            &ldquo;{currentProverb.realEnding}&rdquo;
            <div className="text-xs font-normal opacity-90 mt-1">{currentProverb.reference}</div>
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

      {/* Phase 1: Prompt */}
      {currentPhaseId === 'prompt' && (
        <Card variant="tonal" padding="md" className="text-center flex flex-col items-center gap-2">
          <p className="text-sm font-semibold opacity-80">
            Listen closely to the host! Get ready to write a convincing biblical ending.
          </p>
        </Card>
      )}

      {/* Phase 2: Write */}
      {currentPhaseId === 'write' && (
        <div className="flex flex-col gap-3">
          {mySubmission ? (
            <Card variant="tonal" padding="md" className="text-center flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center">
                <Icon name="check" size={24} />
              </div>
              <h3 className="font-bold text-base">Ending Submitted!</h3>
              <p className="text-sm italic opacity-85">&ldquo;&hellip;{mySubmission}&rdquo;</p>
              <span className="text-xs text-[var(--on-container-variant)]">
                Waiting for the remaining disciples to finish writing...
              </span>
            </Card>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="fake-ending-input" className="text-xs font-bold uppercase tracking-wider opacity-75">
                  Write Your Fake Ending
                </label>
                <textarea
                  id="fake-ending-input"
                  value={fakeInput}
                  onChange={(e) => setFakeInput(e.target.value)}
                  placeholder="e.g. will stumble in the dark."
                  rows={3}
                  maxLength={140}
                  className="w-full p-4 rounded-2xl bg-[var(--surface-card)] text-[var(--on-container)] border-2 border-[var(--border-tint)] focus:border-[var(--primary-action)] outline-none text-base font-medium resize-none shadow-sm"
                />
                <div className="text-right text-xs font-mono text-[var(--on-container-variant)]">
                  {140 - fakeInput.length} chars remaining
                </div>
              </div>

              {/* Action Cluster: Primary button flanked by secondary pills */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="tonal"
                  size="md"
                  pill
                  onClick={() => setFakeInput('is like clouds without rain.')}
                  className="flex-1"
                >
                  Need Idea?
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={!fakeInput.trim()}
                  rightIcon={<Send size={18} />}
                  className="flex-[2] rounded-[22px]"
                >
                  Submit Fake
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Phase 3: Vote */}
      {currentPhaseId === 'vote' && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider opacity-75">
              Which ending is Scripture?
            </span>
            {myVote && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Icon name="check" size={14} /> Vote Cast
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {shuffledEndings.map((entry, idx) => {
              const isMyOwn = entry.authorId === playerId;
              const isSelected = myVote === entry.ending;

              if (isMyOwn) {
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-[var(--surface-container)] opacity-50 border border-dashed border-[var(--border-tint)] text-sm flex items-center justify-between"
                  >
                    <span>&ldquo;&hellip;{entry.ending}&rdquo;</span>
                    <span className="text-[11px] font-bold uppercase">(Your Submission)</span>
                  </div>
                );
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={!!myVote}
                  onClick={() => handleVote(entry.ending)}
                  className={`p-4 rounded-2xl text-left text-sm sm:text-base font-semibold border-2 transition-all outline-none cursor-pointer flex items-center justify-between select-none ${
                    isSelected
                      ? 'bg-[var(--primary-action)] text-[var(--primary-action-text)] border-[var(--primary-action)] shadow-md'
                      : 'bg-[var(--surface-card)] text-[var(--on-container)] border-[var(--border-tint)] hover:border-[var(--primary-action)]/50'
                  }`}
                >
                  <span>&ldquo;&hellip;{entry.ending}&rdquo;</span>
                  {isSelected && <Icon name="check" size={18} className="shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Phase 4: Reveal */}
      {currentPhaseId === 'reveal' && (
        <Card variant="tonal" padding="md" className="flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 flex items-center justify-center">
            <Icon name="medal" size={28} />
          </div>
          <div>
            <h3 className="text-xl font-black">
              {myRoundScore > 0 ? `+${myRoundScore} Points!` : 'No Points This Round'}
            </h3>
            <p className="text-xs text-[var(--on-container-variant)] mt-1">
              {myVote === currentProverb.realEnding
                ? 'You spotted the true proverb! (+1)'
                : 'You were fooled by a fake ending.'}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
