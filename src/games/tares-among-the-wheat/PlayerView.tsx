import React from 'react';
import { GameViewProps } from '../../engine/types';
import { TaresState } from './types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { WavyTimer } from '../../components/ui/WavyTimer';
import { Avatar } from '../../components/ui/Avatar';
import { UserX, AlertCircle, Sparkles } from 'lucide-react';
import { Icon } from '@design/icons';
import { useTheme } from '../../theme/ThemeContext';

export const TaresPlayerView: React.FC<GameViewProps<TaresState>> = ({
  state,
  playerId,
  players,
  dispatchIntent,
}) => {
  const {
    currentPhaseId,
    currentPassage,
    similarPassage,
    twinStoriesMode,
    tarePlayerIds,
    activeCluePlayerIndex,
    cluePlayerOrder,
    votes,
    isTareCaught,
    isStealSuccessful,
    tareStealGuess,
  } = state;
  const { triggerHaptic } = useTheme();

  const safeTarePlayerIds: string[] = Array.isArray(tarePlayerIds)
    ? tarePlayerIds
    : tarePlayerIds && typeof tarePlayerIds === 'object'
    ? Object.values(tarePlayerIds)
    : [];
  const safeCluePlayerOrder: string[] = Array.isArray(cluePlayerOrder)
    ? cluePlayerOrder
    : cluePlayerOrder && typeof cluePlayerOrder === 'object'
    ? Object.values(cluePlayerOrder)
    : [];

  const isTare = safeTarePlayerIds.includes(playerId);
  const activeCluePlayerId = safeCluePlayerOrder[activeCluePlayerIndex] || '';
  const isMyClueTurn = activeCluePlayerId === playerId;
  const myVote = (votes && typeof votes === 'object' ? votes[playerId] : undefined);

  // 6 options for the caught tare to pick from
  const stealOptions = React.useMemo(() => {
    const list = [currentPassage.title, ...(currentPassage.wrongGuesses || []).slice(0, 5)];
    return list.sort(() => 0.5 - Math.random());
  }, [currentPassage]);

  const handleVote = (accusedPlayerId: string) => {
    if (myVote) return;
    triggerHaptic('medium');
    dispatchIntent('CAST_VOTE', { accusedPlayerId });
  };

  const handleClueDone = () => {
    triggerHaptic('light');
    dispatchIntent('CLUE_DONE');
  };

  const handleStealGuess = (guessedTitle: string) => {
    if (tareStealGuess) return;
    triggerHaptic('heavy');
    dispatchIntent('TARE_STEAL', { guessedTitle });
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-5 px-4 pb-6">
      {/* Secret Role Card */}
      <Card
        variant="hero"
        padding="lg"
        className={`text-center flex flex-col items-center gap-3 border-2 ${
          isTare
            ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/40'
            : 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
        }`}
      >
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
            isTare
              ? 'bg-rose-200 text-rose-950 dark:bg-rose-900 dark:text-rose-100'
              : 'bg-emerald-200 text-emerald-950 dark:bg-emerald-900 dark:text-emerald-100'
          }`}
        >
          {isTare ? <UserX size={14} /> : <Icon name="wheat" size={14} />}
          {isTare ? 'Secret Role: Tare' : 'Secret Role: Wheat'}
        </span>

        {isTare ? (
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl sm:text-3xl font-black text-rose-900 dark:text-rose-100">
              {twinStoriesMode && similarPassage
                ? `Twin Story: ${similarPassage.title}`
                : 'You Are The Tare!'}
            </h2>
            <p className="text-xs text-[var(--on-container-variant)] font-semibold">
              {twinStoriesMode && similarPassage
                ? `Your story is slightly different from the wheat. Pay attention!`
                : 'You do not know the passage. Listen to the clues, blend in, and survive the vote!'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl sm:text-3xl font-black">{currentPassage.title}</h2>
            <span className="text-xs font-semibold opacity-75">{currentPassage.reference}</span>
            <div className="mt-1 flex flex-wrap gap-1.5 justify-center">
              {currentPassage.keywords.slice(0, 4).map((kw, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-black/5 dark:bg-white/10"
                >
                  {kw}
                </span>
              ))}
            </div>
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

      {/* Phase 1: Deal */}
      {currentPhaseId === 'deal' && (
        <Card variant="tonal" padding="md" className="text-center">
          <p className="text-sm font-semibold opacity-85">
            Memorize your card! Spoken clues will begin shortly.
          </p>
        </Card>
      )}

      {/* Phase 2: Clues */}
      {currentPhaseId === 'clues' && (
        <Card
          variant="tonal"
          padding="lg"
          className={`flex flex-col items-center gap-4 text-center ${
            isMyClueTurn ? 'bg-[var(--surface-container-high)] ring-2 ring-[var(--primary-action)]' : ''
          }`}
        >
          {isMyClueTurn ? (
            <>
              <div className="flex items-center gap-2 text-[var(--primary-action)] font-black text-lg">
                <Sparkles size={20} />
                <span>It&apos;s Your Turn to Speak!</span>
              </div>
              <p className="text-xs text-[var(--on-container-variant)]">
                Say a 1-word or short clue aloud to the room. When done, tap below.
              </p>
              <Button
                variant="primary"
                size="lg"
                className="w-full mt-2"
                rightIcon={<Icon name="check" size={18} />}
                onClick={handleClueDone}
              >
                I Spoke My Clue
              </Button>
            </>
          ) : (
            <>
              <span className="text-xs font-bold uppercase tracking-wider opacity-75">
                Listening to Clue
              </span>
              <div className="flex items-center gap-2 text-base font-bold">
                <Avatar
                  name={players.find((p) => p.id === activeCluePlayerId)?.name || 'Disciple'}
                  size="md"
                />
                <span>{players.find((p) => p.id === activeCluePlayerId)?.name} is speaking...</span>
              </div>
            </>
          )}
        </Card>
      )}

      {/* Phase 3: Debate */}
      {currentPhaseId === 'debate' && (
        <Card variant="tonal" padding="md" className="text-center">
          <h3 className="font-bold text-base">Open Room Debate!</h3>
          <p className="text-xs text-[var(--on-container-variant)] mt-1">
            Question fellow disciples on their clues. Look for hesitation or vague answers!
          </p>
        </Card>
      )}

      {/* Phase 4: Vote */}
      {currentPhaseId === 'vote' && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider opacity-75">
              Vote for the Tare:
            </span>
            {myVote && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Icon name="check" size={14} /> Accusation Cast
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {players
              .filter((p) => p.id !== playerId)
              .map((p) => {
                const isSelected = myVote === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={!!myVote}
                    onClick={() => handleVote(p.id)}
                    className={`p-3 rounded-2xl border text-sm font-bold flex items-center gap-2 transition-all outline-none cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--primary-action)] text-[var(--primary-action-text)] border-[var(--primary-action)] shadow-sm'
                        : 'bg-[var(--surface-card)] text-[var(--on-container)] border-[var(--border-tint)] hover:border-[var(--primary-action)]/40'
                    }`}
                  >
                    <Avatar name={p.name} size="sm" />
                    <span className="truncate">{p.name}</span>
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {/* Phase 5: Reveal */}
      {currentPhaseId === 'reveal' && (
        <div className="flex flex-col gap-3">
          {isTare && isTareCaught && !tareStealGuess ? (
            /* CAUGHT TARE STEAL CHANCE */
            <Card variant="hero" padding="lg" className="flex flex-col gap-3 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                You Were Caught! Steal Chance (+1)
              </span>
              <h3 className="text-lg font-black">Guess the Genuine Passage:</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-1">
                {stealOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleStealGuess(opt)}
                    className="p-3.5 rounded-2xl bg-[var(--surface-card)] hover:bg-[var(--surface-container-high)] text-[var(--on-container)] font-semibold text-xs text-left border border-[var(--border-tint)] transition-all cursor-pointer"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </Card>
          ) : (
            <Card variant="tonal" padding="md" className="flex flex-col items-center gap-2 text-center">
              <h3 className="text-xl font-black">
                {isTareCaught ? 'The Tare Was Unmasked!' : 'The Tare Remained Hidden!'}
              </h3>
              <p className="text-xs text-[var(--on-container-variant)]">
                {isTare
                  ? isTareCaught
                    ? 'You were discovered by the disciples.'
                    : 'Great deception! You survived (+2 points).'
                  : isTareCaught
                  ? 'Righteous discernment! Wheat scores +1 point.'
                  : 'The tare fooled the flock.'}
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
