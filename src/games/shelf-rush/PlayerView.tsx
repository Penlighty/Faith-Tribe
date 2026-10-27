import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameViewProps } from '../../engine/types';
import { ShelfRushGameState, ShelfRushConfig, RunState, ShelfRushCard } from './engine/types';
import { createInitialRunState, reduceRun } from './engine/run';
import { getCardWindowMs } from './engine/timing';
import { getBook, getScheme } from './engine/loader';
import { generateDeckForConfig, createDefaultConfig } from './reducer';
import { Hud } from './components/Hud';
import { SortCard } from './components/SortCard';
import { BinGrid } from './components/BinGrid';
import { AscentTrack } from './components/AscentTrack';
import { ConfigSheet } from './components/ConfigSheet';
import { ResultsView } from './components/ResultsView';
import { WavyTimer } from '../../components/ui/WavyTimer';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '../../design/icons';

export interface ShelfRushPlayerViewProps extends Partial<GameViewProps<ShelfRushGameState>> {
  onExit?: () => void;
}

export const ShelfRushPlayerView: React.FC<ShelfRushPlayerViewProps> = ({
  state,
  playerId = 'disciple',
  isHost = true,
  dispatchIntent,
  onExit,
}) => {
  // Local solo / practice run state support when outside room or during local run
  const isMultiplayer = !!(state && state.currentPhaseId);
  const [localConfig, setLocalConfig] = useState<ShelfRushConfig>(() =>
    state?.config || createDefaultConfig()
  );
  const [inLocalSetup, setInLocalSetup] = useState<boolean>(!isMultiplayer || state.currentPhaseId === 'setup');

  const [countdownNum, setCountdownNum] = useState<number | null>(null);

  // Active run state
  const [runState, setRunState] = useState<RunState | null>(null);
  const [cardStatus, setCardStatus] = useState<'idle' | 'pulse' | 'correct' | 'wrong'>('idle');
  const [correctBinHighlight, setCorrectBinHighlight] = useState<string | null>(null);
  const [wrongBinHighlight, setWrongBinHighlight] = useState<string | null>(null);
  const [pointsToast, setPointsToast] = useState<number | null>(null);
  const [wrongToastMessage, setWrongToastMessage] = useState<string | null>(null);
  const [newQuestionNotice, setNewQuestionNotice] = useState<boolean>(false);
  const [stepBanner, setStepBanner] = useState<string | null>(null);

  // High-performance timer ref (animationFrame driven, no React re-render per frame)
  const timerStartRef = useRef<number>(0);
  const timerDurationRef = useRef<number>(4000);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(4);
  const animFrameRef = useRef<number | null>(null);
  const lastProgressSentRef = useRef<number>(0);
  const isTransitioningRef = useRef<boolean>(false);

  // Practice mode reveal card
  const [practiceMissedCard, setPracticeMissedCard] = useState<ShelfRushCard | null>(null);

  // Practice mode flag
  const isPracticeMode =
    runState?.config.play === 'practice' || runState?.config.playMode === 'practice';

  // Current Card & Scheme
  const currentCard = runState && runState.cursor < runState.deck.length ? runState.deck[runState.cursor] : null;
  const currentScheme = currentCard ? getScheme(currentCard.schemeId) : null;
  const currentBook = currentCard ? getBook(currentCard.bookId) : null;

  // Active display card (use practiceMissedCard when studying a missed card)
  const displayCard = (cardStatus === 'wrong' && practiceMissedCard) ? practiceMissedCard : currentCard;
  const displayBook = displayCard ? getBook(displayCard.bookId) : currentBook;

  // Initialize or start run
  const startRun = useCallback(
    (cfg: ShelfRushConfig) => {
      const deck = generateDeckForConfig(cfg);
      const initial = createInitialRunState(cfg, deck);
      isTransitioningRef.current = false;
      setPracticeMissedCard(null);
      setRunState(initial);
      setInLocalSetup(false);
      setCountdownNum(3);
    },
    []
  );

  // Countdown timer effect
  useEffect(() => {
    if (countdownNum === null) return;
    if (countdownNum > 0) {
      const timer = setTimeout(() => {
        setCountdownNum((prev) => (prev !== null && prev > 1 ? prev - 1 : null));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdownNum]);

  // When countdown completes, transition runState to 'showing'
  useEffect(() => {
    if (countdownNum === null && runState && runState.status === 'ready') {
      const now = performance.now();
      const next = reduceRun(runState, { type: 'START' });
      const showing = reduceRun(next, { type: 'SHOW', timestamp: now });
      timerStartRef.current = now;
      isTransitioningRef.current = false;
      setRunState(showing);
    }
  }, [countdownNum, runState]);

  // Listen to multiplayer room phase transitions
  useEffect(() => {
    if (!state) return;
    if (state.currentPhaseId === 'countdown' && countdownNum === null && (!runState || runState.status === 'ready')) {
      const cfg = state.config;
      const initial = createInitialRunState(cfg, state.deck);
      isTransitioningRef.current = false;
      setPracticeMissedCard(null);
      setRunState(initial);
      setCountdownNum(3);
    }
  }, [state?.currentPhaseId, state?.deck, state?.config, countdownNum, runState]);

  // Per-card timing tick using requestAnimationFrame
  useEffect(() => {
    if (!runState || runState.status !== 'showing' || !currentCard || !currentScheme) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      return;
    }

    const windowMs = getCardWindowMs({
      config: runState.config,
      card: currentCard,
      numBins: currentScheme.bins.length,
      step: runState.step,
    });
    timerDurationRef.current = windowMs;

    const tick = (now: number) => {
      if (isTransitioningRef.current) return;

      const elapsed = now - timerStartRef.current;
      const remainingMs = Math.max(0, timerDurationRef.current - elapsed);
      setRemainingSeconds(Math.ceil(remainingMs / 1000));

      // Pulse card in last 500ms
      if (remainingMs <= 500 && remainingMs > 0) {
        setCardStatus('pulse');
      }

      // Check timeout
      if (elapsed >= timerDurationRef.current) {
        if (animFrameRef.current) {
          cancelAnimationFrame(animFrameRef.current);
          animFrameRef.current = null;
        }
        handleTimeout(now);
        return;
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [runState?.cursor, runState?.status]);

  // Handle Timeout
  const handleTimeout = (now: number) => {
    if (isTransitioningRef.current) return;
    if (!runState || runState.status !== 'showing') return;
    isTransitioningRef.current = true;
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    const next = reduceRun(runState, { type: 'TIMEOUT', timestamp: now });
    handleSortFeedback(false, null, next);
  };

  // Handle Sort Pick
  const handleSelectBin = (binId: string) => {
    if (isTransitioningRef.current) return;
    if (!runState || runState.status !== 'showing' || !currentCard || !currentScheme) return;
    isTransitioningRef.current = true;
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    const now = performance.now();
    const isCorrect = currentScheme.assign[currentCard.bookId] === binId;

    const next = reduceRun(runState, {
      type: 'SORT',
      binId,
      timestamp: now,
    });

    handleSortFeedback(isCorrect, binId, next);
  };

  const handleSortFeedback = (
    isCorrect: boolean,
    chosenBinId: string | null,
    nextState: RunState
  ) => {
    if (!currentCard || !currentScheme) {
      isTransitioningRef.current = false;
      return;
    }
    const correctBinId = currentScheme.assign[currentCard.bookId];
    const correctBin = currentScheme.bins.find((b) => b.id === correctBinId);
    const isPractice =
      runState?.config.play === 'practice' || runState?.config.playMode === 'practice';

    if (isCorrect) {
      setCardStatus('correct');
      const lastLog = nextState.log[nextState.log.length - 1];
      setPointsToast(lastLog?.points || 10);

      setTimeout(() => {
        setCardStatus('idle');
        setPointsToast(null);
        advanceToNextCard(nextState);
      }, 180);
    } else {
      setCardStatus('wrong');
      setWrongBinHighlight(chosenBinId);
      setCorrectBinHighlight(correctBinId);

      // Toast: "Not quite: Habakkuk is Minor Prophets" for 1200ms
      const bookName = currentBook?.name || currentCard.bookId;
      const binLabel = correctBin?.label || correctBinId;
      setWrongToastMessage(`Not quite: ${bookName} is ${binLabel}`);

      setTimeout(() => {
        setWrongToastMessage(null);
      }, 1200);

      if (isPractice) {
        // In practice mode, pause and show study reveal for the missed card
        setPracticeMissedCard(currentCard);
        setRunState(nextState);
      } else {
        setTimeout(() => {
          setCardStatus('idle');
          setWrongBinHighlight(null);
          setCorrectBinHighlight(null);
          advanceToNextCard(nextState);
        }, 240);
      }
    }
  };

  const advanceToNextCard = (nextState: RunState) => {
    // If run finished, won, lost, or cursor out of bounds
    if (
      nextState.status === 'won' ||
      nextState.status === 'lost' ||
      nextState.status === 'finished' ||
      nextState.cursor >= nextState.deck.length
    ) {
      isTransitioningRef.current = false;
      const finalStatus =
        nextState.status === 'lost'
          ? ('lost' as const)
          : nextState.status === 'won'
          ? ('won' as const)
          : ('finished' as const);
      const finalState = {
        ...nextState,
        status: finalStatus,
      };
      setRunState(finalState);

      // Dispatch finish intent to host in multiplayer
      if (dispatchIntent) {
        dispatchIntent('FINISH', {
          log: finalState.log,
          totalTimeMs: finalState.log.reduce((acc, l) => acc + l.ms, 0),
        });
      }
      return;
    }

    // Check scheme change notice
    const nextCard = nextState.deck[nextState.cursor];
    if (nextCard && nextCard.schemeChange) {
      setNewQuestionNotice(true);
      setTimeout(() => setNewQuestionNotice(false), 1500);
    }

    // Check step banner
    if (nextState.step > (runState?.step || 1)) {
      setStepBanner(`Step ${nextState.step}`);
      setTimeout(() => setStepBanner(null), 900);
    }

    const freshNow = performance.now();
    timerStartRef.current = freshNow;
    const showing = reduceRun(nextState, { type: 'SHOW', timestamp: freshNow });
    isTransitioningRef.current = false;
    setRunState(showing);

    // Send progress heartbeat
    if (dispatchIntent && freshNow - lastProgressSentRef.current >= 1000) {
      lastProgressSentRef.current = freshNow;
      dispatchIntent('PROGRESS', {
        cardsDone: showing.cursor,
        correctCount: showing.correctBooks.size,
        score: showing.score,
        lives: showing.lives,
        streak: showing.streak,
        status: showing.status,
      });
    }
  };

  // Practice mode reveal continuation
  const handlePracticeContinue = () => {
    if (!runState) return;
    setCardStatus('idle');
    setWrongBinHighlight(null);
    setCorrectBinHighlight(null);
    setPracticeMissedCard(null);
    isTransitioningRef.current = false;
    advanceToNextCard(runState);
  };


  // Exit / Leave handler
  const handleLeave = () => {
    if (onExit && (inLocalSetup || !runState || runState.status === 'won' || runState.status === 'lost')) {
      onExit();
      return;
    }
    setRunState(null);
    setInLocalSetup(true);
  };

  // 1. SETUP / CONFIG VIEW
  if (inLocalSetup || (state && state.currentPhaseId === 'setup')) {
    return (
      <div className="w-full min-h-[80vh] flex items-center justify-center p-3">
        <ConfigSheet
          initialConfig={localConfig}
          isHost={isHost}
          isGuest={!isHost && isMultiplayer}
          onClose={onExit}
          onStart={(cfg) => {

            setLocalConfig(cfg);
            if (isMultiplayer && isHost && dispatchIntent) {
              dispatchIntent('UPDATE_CONFIG', cfg);
              dispatchIntent('START_COUNTDOWN');
            } else {
              startRun(cfg);
            }
          }}
        />
      </div>
    );
  }

  // 2. COUNTDOWN VIEW
  if (countdownNum !== null) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center text-center p-4">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400 mb-2">
          Get Ready To Sort!
        </span>
        <motion.div
          key={countdownNum}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 1 }}
          exit={{ scale: 1.8, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="text-8xl font-black font-mono text-purple-600 dark:text-purple-300 drop-shadow-md"
        >
          {countdownNum}
        </motion.div>
      </div>
    );
  }

  // 3. RESULTS VIEW
  if (
    (runState &&
      (runState.status === 'won' ||
        runState.status === 'lost' ||
        runState.status === 'finished')) ||
    (state && state.currentPhaseId === 'results')
  ) {
    return (
      <ResultsView
        score={runState?.score || 0}
        status={
          runState?.status === 'lost'
            ? 'lost'
            : runState?.status === 'won'
            ? 'won'
            : 'finished'
        }
        config={runState?.config || localConfig}
        log={runState?.log || []}
        bestStreak={runState?.bestStreak || 0}
        totalCards={runState?.deck.length || 0}
        cardsCompleted={runState?.cursor || 0}
        myPlayerId={playerId}
        onPlayAgain={() => {
          if (runState) {
            const nextSeed = Math.floor(Math.random() * 2147483647);
            startRun({ ...runState.config, seed: nextSeed });
          }
        }}
        onChangeSettings={() => {
          setRunState(null);
          setInLocalSetup(true);
        }}
        onDone={onExit || handleLeave}
      />

    );
  }

  // 4. ACTIVE PLAY SCREEN
  return (
    <div
      className="w-full max-w-lg mx-auto flex flex-col justify-between min-h-[90vh] py-2 px-3 select-none"
      data-game="shelf-rush"
    >
      {/* Top Section */}
      <div className="flex flex-col gap-2">
        {/* HUD row (56px) */}
        <Hud
          lives={runState?.lives || 0}
          maxLives={runState?.maxLives || 3}
          streak={runState?.streak || 0}
          score={runState?.score || 0}
          playMode={runState?.config.playMode || 'solo'}
          onLeave={handleLeave}
        />

        {/* Ascent Track (if in Ascent mode) */}
        {runState?.config.mode === 'ascent' && (
          <AscentTrack
            currentStep={runState.step}
            totalSteps={runState.config.length === 'short' ? 8 : 15}
          />
        )}

        {/* Context row: Scheme name & Question text */}
        <div className="flex items-center justify-between px-2 py-1 bg-[var(--surface-container)] rounded-xl border border-[var(--border-tint)] text-xs">
          <div className="flex items-center gap-2">
            <span className="font-black text-purple-700 dark:text-purple-300">
              {currentScheme?.name}
            </span>
            <span className="text-[var(--on-container-variant)] font-semibold">
              · {currentScheme?.question}
            </span>
          </div>

          {newQuestionNotice && (
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="px-2 py-0.5 rounded-md bg-purple-600 text-white font-bold text-[10px]"
            >
              New question
            </motion.span>
          )}
        </div>

        {/* Non-blocking wrong answer toast */}
        <AnimatePresence>
          {wrongToastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full text-center py-1.5 px-3 rounded-xl bg-rose-500 text-white font-bold text-xs shadow-md"
            >
              {wrongToastMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step Banner */}
        <AnimatePresence>
          {stepBanner && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full text-center py-2 px-3 rounded-2xl bg-purple-600 text-white font-black text-sm shadow-md"
            >
              <span className="flex items-center justify-center gap-1.5">
                <Icon name="mountain" size={16} />
                <span>{stepBanner}</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* WavyTimer */}
        <WavyTimer
          durationSeconds={Math.ceil(timerDurationRef.current / 1000)}
          remainingSeconds={remainingSeconds}
          showLabels={false}
          className="my-1"
        />
      </div>

      {/* Stage: SortCard */}
      {displayBook && (
        <SortCard
          bookName={displayBook.name}
          bookOrder={displayBook.order}
          practiceMode={isPracticeMode}
          status={cardStatus}
        />
      )}

      {/* Practice Mode Pause Reveal Card */}
      {isPracticeMode && cardStatus === 'wrong' && displayBook && (
        <div className="my-2 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex flex-col gap-2 text-xs">
          <span className="font-bold text-amber-900 dark:text-amber-200">
            Study Reveal: {displayBook.name}
          </span>
          <p className="italic text-[var(--on-container-variant)]">"{displayBook.blurb}"</p>
          <button
            onClick={handlePracticeContinue}
            className="w-full py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
          >
            Next Book →
          </button>
        </div>
      )}

      {/* Bins Zone */}
      <div className="w-full mt-auto pt-2 pb-4">
        {currentScheme && (
          <BinGrid
            bins={currentScheme.bins}
            correctBinId={correctBinHighlight}
            wrongBinId={wrongBinHighlight}
            pointsDelta={pointsToast}
            disabled={cardStatus !== 'idle' && cardStatus !== 'pulse'}
            onSelectBin={handleSelectBin}
          />
        )}
      </div>
    </div>
  );
};
