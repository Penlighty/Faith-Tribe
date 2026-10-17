import React, { useState, useEffect, useMemo } from 'react';
import { Icon } from '@design/icons';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LeaveConfirmationModal } from '../components/ui/LeaveConfirmationModal';
import { useTheme } from '../theme/ThemeContext';
import { gameRegistry } from '../engine/registry';
import { soundManager } from '../engine/services/audio';

// Content sources for all games
import proverbsData from '../games/fake-a-proverb/content.json';
import taresData from '../games/tares-among-the-wheat/content.json';
import hotCoalData from '../games/hot-coal/content.json';
import { allWhoSaidItems, allTestamentSortItems } from '../engine/content/loader';
import { calculateWhoSaidScore, calculateWhoSaidTimeLimit } from '../games/who-said/scoring';
import { calculateTestamentSortScore, getTestamentSortTimeLimit } from '../games/testament-sort/scoring';
import { TestamentChoice } from '../games/testament-sort/types';
import { getPassageDifficulty } from '../games/tares-among-the-wheat/reducer';

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export interface SoloPracticeScreenProps {
  gameId: string;
  onBack: () => void;
}

export const SoloPracticeScreen: React.FC<SoloPracticeScreenProps> = ({ gameId, onBack }) => {
  const game = gameRegistry.get(gameId) || gameRegistry.get('fake-a-proverb');
  const meta = game?.meta;
  const { setPaletteKey } = useTheme();

  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  // Set theme palette matching the practice game
  useEffect(() => {
    if (meta?.accentSeedColor) {
      setPaletteKey(meta.accentSeedColor);
    }
  }, [meta, setPaletteKey]);

  // Trap browser/hardware back button while in solo practice
  useEffect(() => {
    window.history.pushState({ inSoloPractice: true }, '');
    const handlePopState = () => {
      setShowLeaveConfirm(true);
      window.history.pushState({ inSoloPractice: true }, '');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleRequestExit = () => {
    setShowLeaveConfirm(true);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 pb-28 pt-2 sm:pt-6 flex flex-col gap-6 select-none animate-fadeIn">
      {gameId === 'who-said' && <WhoSaidSoloPractice onBack={handleRequestExit} onDirectExit={onBack} />}
      {gameId === 'testament-sort' && <TestamentSortSoloPractice onBack={handleRequestExit} onDirectExit={onBack} />}
      {gameId === 'tares-among-the-wheat' && <TaresSoloPractice onBack={handleRequestExit} onDirectExit={onBack} />}
      {gameId === 'hot-coal' && <HotCoalSoloPractice onBack={handleRequestExit} onDirectExit={onBack} />}
      {gameId === 'fake-a-proverb' && <FakeAProverbSoloPractice onBack={handleRequestExit} onDirectExit={onBack} />}
      {!['who-said', 'testament-sort', 'tares-among-the-wheat', 'hot-coal', 'fake-a-proverb'].includes(gameId) && (
        <FakeAProverbSoloPractice onBack={handleRequestExit} onDirectExit={onBack} />
      )}

      {/* Confirmation Modal on Back / Leave */}
      <LeaveConfirmationModal
        isOpen={showLeaveConfirm}
        isMultiplayer={false}
        onConfirm={() => {
          setShowLeaveConfirm(false);
          onBack();
        }}
        onCancel={() => setShowLeaveConfirm(false)}
      />
    </div>
  );
};

// ==========================================
// 1. WHO SAID THAT? SOLO PRACTICE
// ==========================================
const WhoSaidSoloPractice: React.FC<{ onBack: () => void; onDirectExit: () => void }> = ({ onBack, onDirectExit }) => {
  const { triggerHaptic } = useTheme();

  const buildPool = () => {
    const t1 = shuffle(allWhoSaidItems.filter((i) => i.tier === 1));
    const t2 = shuffle(allWhoSaidItems.filter((i) => i.tier === 2));
    const t3 = shuffle(allWhoSaidItems.filter((i) => i.tier === 3));
    const t4 = shuffle(allWhoSaidItems.filter((i) => i.tier === 4));
    return [...t1, ...t2, ...t3, ...t4];
  };

  const [pool, setPool] = useState(buildPool);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedSpeaker, setSelectedSpeaker] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [timer, setTimer] = useState(15);
  const [maxTimer, setMaxTimer] = useState(15);
  const [isGameOver, setIsGameOver] = useState(false);

  const currentItem = pool[currentIndex % pool.length];

  const options = useMemo(() => {
    return shuffle([...currentItem.options]);
  }, [currentItem]);

  // Clock countdown
  useEffect(() => {
    if (selectedSpeaker || isGameOver) return;
    const limit = calculateWhoSaidTimeLimit(currentItem.quote);
    setMaxTimer(limit);
    setTimer(limit);

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeOut();
          return 0;
        }
        if (prev <= 4) {
          soundManager.playTick();
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentIndex, selectedSpeaker, isGameOver, currentItem]);

  const handleTimeOut = () => {
    if (selectedSpeaker) return;
    setSelectedSpeaker('__timeout__');
    soundManager.playBuzzer();
    triggerHaptic('heavy');
    const newStrikes = strikes + 1;
    setStrikes(newStrikes);
    setStreak(0);
    if (newStrikes >= 3) setIsGameOver(true);
  };

  const handleSelect = (speaker: string) => {
    if (selectedSpeaker || isGameOver) return;
    setSelectedSpeaker(speaker);

    const isCorrect = speaker === currentItem.answer;
    if (isCorrect) {
      soundManager.playChime();
      triggerHaptic('medium');
      const earned = calculateWhoSaidScore({
        tier: currentItem.tier,
        quote: currentItem.quote,
        elapsedSeconds: Math.max(1, maxTimer - timer),
        isCorrect: true,
        streakCount: streak,
      }).points;

      setScore((prev) => prev + earned);
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > bestStreak) setBestStreak(nextStreak);
    } else {
      soundManager.playBuzzer();
      triggerHaptic('heavy');
      const newStrikes = strikes + 1;
      setStrikes(newStrikes);
      setStreak(0);
      if (newStrikes >= 3) {
        setIsGameOver(true);
      }
    }
  };

  const handleNext = () => {
    setSelectedSpeaker(null);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleRestart = () => {
    setSelectedSpeaker(null);
    setPool(buildPool());
    setCurrentIndex(0);
    setScore(0);
    setStrikes(0);
    setStreak(0);
    setIsGameOver(false);
  };

  if (isGameOver) {
    return (
      <GameOverCard
        title="Who Said That? Practice Complete!"
        score={score}
        bestStreak={bestStreak}
        onRestart={handleRestart}
        onBack={onDirectExit}
      />
    );
  }

  return (
    <>
      <HeaderBar
        onBack={onBack}
        streak={streak}
        bestStreak={bestStreak}
        score={score}
        strikes={strikes}
      />

      <Card variant="hero" padding="lg" className="text-center flex flex-col items-center gap-3 shadow-md relative overflow-hidden">
        <CountdownProgressBar durationSeconds={maxTimer} isStopped={!!selectedSpeaker} roundKey={currentIndex} />

        <div className="flex items-center justify-between w-full">
          <span className="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300">
            Tier {currentItem.tier} • Difficulty Escalation
          </span>
          <span className={`font-mono text-xs font-bold flex items-center gap-1 ${timer <= 4 ? 'text-rose-500 animate-pulse' : 'text-[var(--primary-action)]'}`}>
            <Icon name="timer" size={13} /> {timer}s
          </span>
        </div>

        <blockquote className="text-xl sm:text-2xl font-serif font-bold text-[var(--on-container)] leading-snug my-2">
          &ldquo;{currentItem.quote}&rdquo;
        </blockquote>

        {selectedSpeaker && (
          <div className="p-3 bg-[var(--surface-container)] rounded-2xl w-full text-center animate-fadeIn">
            <div className="text-xs font-bold text-[var(--primary-action)] flex items-center justify-center gap-1">
              <Icon name="book-open" size={14} /> {currentItem.ref}
            </div>
            <p className="text-xs text-[var(--on-container-variant)] mt-1 italic">&ldquo;{currentItem.note}&rdquo;</p>
          </div>
        )}
      </Card>

      <div className="flex flex-col gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--on-container-variant)] px-1">
          Identify the Speaker:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {options.map((speaker, idx) => {
            const isSelected = selectedSpeaker === speaker;
            const isCorrect = speaker === currentItem.answer;
            let btnClass = 'bg-[var(--surface-card)] text-[var(--on-container)] border-[var(--border-tint)] hover:border-[var(--primary-action)]/50';

            if (selectedSpeaker) {
              if (isCorrect) {
                btnClass = 'bg-emerald-500 text-white border-emerald-600 font-bold shadow-md';
              } else if (isSelected) {
                btnClass = 'bg-rose-500 text-white border-rose-600 shadow-sm';
              } else {
                btnClass = 'opacity-40 bg-[var(--surface-container)]';
              }
            }

            return (
              <button
                key={idx}
                disabled={!!selectedSpeaker}
                onClick={() => handleSelect(speaker)}
                className={`p-4 rounded-2xl text-left text-base font-semibold border-2 transition-all flex items-center justify-between shadow-sm cursor-pointer ${btnClass}`}
              >
                <span>{speaker}</span>
                {selectedSpeaker && isCorrect && <Icon name="check" size={20} className="shrink-0 ml-2" />}
                {selectedSpeaker && isSelected && !isCorrect && <Icon name="close" size={20} className="shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      </div>

      {selectedSpeaker && (
        <Button variant="primary" size="hero" pill onClick={handleNext} className="w-full mt-2 shadow-md">
          Next Question
        </Button>
      )}
    </>
  );
};

// ==========================================
// 2. TESTAMENT SORT SOLO PRACTICE
// ==========================================
const TestamentSortSoloPractice: React.FC<{ onBack: () => void; onDirectExit: () => void }> = ({ onBack, onDirectExit }) => {
  const { triggerHaptic } = useTheme();

  const buildPool = () => {
    const t1 = shuffle(allTestamentSortItems.filter((i) => i.tier === 1));
    const t2 = shuffle(allTestamentSortItems.filter((i) => i.tier === 2));
    const t3 = shuffle(allTestamentSortItems.filter((i) => i.tier === 3));
    const t4 = shuffle(allTestamentSortItems.filter((i) => i.tier === 4));
    return [...t1, ...t2, ...t3, ...t4];
  };

  const [pool, setPool] = useState(buildPool);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<TestamentChoice | '__timeout__' | null>(null);
  const [hintUsed, setHintUsed] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [timer, setTimer] = useState(12);
  const [maxTimer, setMaxTimer] = useState(12);
  const [isGameOver, setIsGameOver] = useState(false);

  const currentItem = pool[currentIndex % pool.length];

  // Countdown timer based on tier
  useEffect(() => {
    if (selectedChoice || isGameOver) return;
    const limit = getTestamentSortTimeLimit(currentItem.tier);
    setMaxTimer(limit);
    setTimer(limit);

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeOut();
          return 0;
        }
        if (prev <= 4) {
          soundManager.playTick();
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentIndex, selectedChoice, isGameOver, currentItem]);

  const handleTimeOut = () => {
    if (selectedChoice) return;
    setSelectedChoice('__timeout__');
    soundManager.playBuzzer();
    triggerHaptic('heavy');
    const newStrikes = strikes + 1;
    setStrikes(newStrikes);
    setStreak(0);
    if (newStrikes >= 3) setIsGameOver(true);
  };

  const handleSelect = (choice: TestamentChoice) => {
    if (selectedChoice || isGameOver) return;
    setSelectedChoice(choice);

    const isCorrect = choice === currentItem.answer;
    if (isCorrect) {
      soundManager.playChime();
      triggerHaptic('medium');
      const earned = calculateTestamentSortScore({
        tier: currentItem.tier,
        elapsedSeconds: Math.max(1, maxTimer - timer),
        isCorrect: true,
        correctAnswer: currentItem.answer,
        hintUsed,
        streakCount: streak,
      }).points;

      setScore((prev) => prev + earned);
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > bestStreak) setBestStreak(nextStreak);
    } else {
      soundManager.playBuzzer();
      triggerHaptic('heavy');
      const newStrikes = strikes + 1;
      setStrikes(newStrikes);
      setStreak(0);
      if (newStrikes >= 3) setIsGameOver(true);
    }
  };

  const handleNext = () => {
    setSelectedChoice(null);
    setHintUsed(false);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleRestart = () => {
    setSelectedChoice(null);
    setHintUsed(false);
    setPool(buildPool());
    setCurrentIndex(0);
    setScore(0);
    setStrikes(0);
    setStreak(0);
    setIsGameOver(false);
  };

  if (isGameOver) {
    return (
      <GameOverCard
        title="Testament Sort Practice Finished!"
        score={score}
        bestStreak={bestStreak}
        onRestart={handleRestart}
        onBack={onDirectExit}
      />
    );
  }

  return (
    <>
      <HeaderBar
        onBack={onBack}
        streak={streak}
        bestStreak={bestStreak}
        score={score}
        strikes={strikes}
      />

      <Card variant="hero" padding="lg" className="text-center flex flex-col items-center gap-3 shadow-md relative overflow-hidden">
        <CountdownProgressBar durationSeconds={maxTimer} isStopped={!!selectedChoice} roundKey={currentIndex} />

        <div className="flex items-center justify-between w-full">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
            <Icon name={currentItem.type === 'person' ? 'person' : currentItem.type === 'place' ? 'place' : 'thing'} size={14} />
            {currentItem.type} • Tier {currentItem.tier}
          </span>
          <div className="flex items-center gap-2">
            {!hintUsed && !selectedChoice && (
              <button
                onClick={() => {
                  setHintUsed(true);
                  triggerHaptic('light');
                }}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border border-amber-300/40 px-2.5 py-1 rounded-full flex items-center gap-1 hover:bg-amber-100 transition-all cursor-pointer"
              >
                <Icon name="hint" size={12} /> Clue (-40% pts)
              </button>
            )}
            <span className={`font-mono text-xs font-bold flex items-center gap-1 ${timer <= 4 ? 'text-rose-500 animate-pulse' : 'text-[var(--primary-action)]'}`}>
              <Icon name="timer" size={13} /> {timer}s
            </span>
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-[var(--on-container)] tracking-tight my-2">
          {currentItem.name}
        </h1>

        {hintUsed && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300/40 rounded-2xl text-xs text-amber-900 dark:text-amber-200 text-left w-full animate-fadeIn">
            <span className="font-bold flex items-center gap-1 mb-0.5"><Icon name="hint" size={12} /> Clue:</span>
            {currentItem.hint}
          </div>
        )}

        {selectedChoice && (
          <div className="p-3 bg-[var(--surface-container)] rounded-2xl w-full text-center animate-fadeIn">
            <div className="text-xs font-bold text-[var(--primary-action)] flex items-center justify-center gap-1">
              <Icon name="book-open" size={14} /> Scripture Proof: {currentItem.refs}
            </div>
            {currentItem.note && (
              <p className="text-xs text-[var(--on-container-variant)] mt-1 italic">&ldquo;{currentItem.note}&rdquo;</p>
            )}
          </div>
        )}
      </Card>

      {/* Select Testament: Old on Left, Both in Middle, New on Right */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--on-container-variant)] px-1">
          Select Testament:
        </span>
        <div className="grid grid-cols-3 gap-2 sm:gap-3.5">
          {(['OT', 'BOTH', 'NT'] as TestamentChoice[]).map((choice) => {
            const isSelected = selectedChoice === choice;
            const isCorrect = choice === currentItem.answer;
            let label = 'Old';
            let sub = 'Testament';
            let iconName: 'ot' | 'both' | 'nt' = 'ot';
            if (choice === 'NT') {
              label = 'New';
              sub = 'Testament';
              iconName = 'nt';
            } else if (choice === 'BOTH') {
              label = 'Both';
              sub = 'Testaments';
              iconName = 'both';
            }

            let btnClass = 'bg-[var(--surface-card)] text-[var(--on-container)] border-[var(--border-tint)] hover:border-[var(--primary-action)]/50';
            if (selectedChoice) {
              if (isCorrect) {
                btnClass = 'bg-emerald-500 text-white border-emerald-600 font-bold shadow-md';
              } else if (isSelected) {
                btnClass = 'bg-rose-500 text-white border-rose-600 shadow-sm';
              } else {
                btnClass = 'opacity-40 bg-[var(--surface-container)]';
              }
            }

            return (
              <button
                key={choice}
                disabled={!!selectedChoice}
                onClick={() => handleSelect(choice)}
                className={`p-3 sm:p-5 rounded-2xl sm:rounded-3xl border-2 transition-all flex flex-col items-center justify-center text-center shadow-sm cursor-pointer select-none ${btnClass}`}
              >
                <Icon name={iconName} size={28} className="mb-1" />
                <span className="text-lg sm:text-2xl font-black mt-0.5">{label}</span>
                <span className="text-[11px] sm:text-xs font-semibold opacity-80">{sub}</span>
                {selectedChoice && isCorrect && <Icon name="check" size={22} className="mt-1 text-white" />}
                {selectedChoice && isSelected && !isCorrect && <Icon name="close" size={22} className="mt-1 text-white" />}
              </button>
            );
          })}
        </div>
      </div>

      {selectedChoice && (
        <Button variant="primary" size="hero" pill onClick={handleNext} className="w-full mt-2 shadow-md">
          Next Card
        </Button>
      )}
    </>
  );
};

// ==========================================
// 3. FAKE-A-PROVERB SOLO PRACTICE
// ==========================================
const FakeAProverbSoloPractice: React.FC<{ onBack: () => void; onDirectExit: () => void }> = ({ onBack, onDirectExit }) => {
  const { triggerHaptic } = useTheme();

  const buildPool = () => {
    const proverbs = proverbsData.proverbs;
    const easy = shuffle(proverbs.filter((p) => p.difficulty === 'easy'));
    const medium = shuffle(proverbs.filter((p) => p.difficulty === 'medium'));
    const hard = shuffle(proverbs.filter((p) => p.difficulty === 'hard'));
    return [...easy, ...medium, ...hard];
  };

  const [pool, setPool] = useState(buildPool);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedEnding, setSelectedEnding] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [timer, setTimer] = useState(15);
  const [isGameOver, setIsGameOver] = useState(false);

  const currentItem = pool[currentIndex % pool.length];

  const options = useMemo(() => {
    const others = pool
      .filter((p) => p.id !== currentItem.id)
      .map((p) => p.realEnding);
    const shuffledOthers = shuffle(others).slice(0, 3);
    return shuffle([currentItem.realEnding, ...shuffledOthers]);
  }, [currentItem, pool]);

  // Countdown timer
  useEffect(() => {
    if (selectedEnding || isGameOver) return;
    setTimer(15);

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeOut();
          return 0;
        }
        if (prev <= 4) {
          soundManager.playTick();
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentIndex, selectedEnding, isGameOver]);

  const handleTimeOut = () => {
    if (selectedEnding) return;
    setSelectedEnding('__timeout__');
    soundManager.playBuzzer();
    triggerHaptic('heavy');
    const newStrikes = strikes + 1;
    setStrikes(newStrikes);
    setStreak(0);
    if (newStrikes >= 3) setIsGameOver(true);
  };

  const handleSelect = (ending: string) => {
    if (selectedEnding || isGameOver) return;
    setSelectedEnding(ending);

    const isCorrect = ending === currentItem.realEnding;
    if (isCorrect) {
      soundManager.playChime();
      triggerHaptic('medium');
      const pts = 100 + timer * 5 + streak * 10;
      setScore((prev) => prev + pts);
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > bestStreak) setBestStreak(nextStreak);
    } else {
      soundManager.playBuzzer();
      triggerHaptic('heavy');
      const newStrikes = strikes + 1;
      setStrikes(newStrikes);
      setStreak(0);
      if (newStrikes >= 3) setIsGameOver(true);
    }
  };

  const handleNext = () => {
    setSelectedEnding(null);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleRestart = () => {
    setSelectedEnding(null);
    setPool(buildPool());
    setCurrentIndex(0);
    setScore(0);
    setStrikes(0);
    setStreak(0);
    setIsGameOver(false);
  };

  if (isGameOver) {
    return (
      <GameOverCard
        title="Proverb Practice Completed!"
        score={score}
        bestStreak={bestStreak}
        onRestart={handleRestart}
        onBack={onDirectExit}
      />
    );
  }

  return (
    <>
      <HeaderBar onBack={onBack} streak={streak} bestStreak={bestStreak} score={score} strikes={strikes} />

      <Card variant="hero" padding="lg" className="text-center flex flex-col items-center gap-3.5 shadow-md relative overflow-hidden">
        <CountdownProgressBar durationSeconds={15} isStopped={!!selectedEnding} roundKey={currentIndex} />

        <div className="flex items-center justify-between w-full">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/10 dark:bg-white/10">
            {currentItem.difficulty.toUpperCase()} • Round {currentIndex + 1}
          </span>
          <span className={`font-mono text-xs font-bold flex items-center gap-1 ${timer <= 4 ? 'text-rose-500 animate-pulse' : 'text-[var(--primary-action)]'}`}>
            <Icon name="timer" size={13} /> {timer}s
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold leading-snug tracking-tight max-w-xl my-2">
          &ldquo;{currentItem.firstHalf}&hellip;&rdquo;
        </h2>
        {selectedEnding && (
          <div className="text-xs font-bold text-[var(--primary-action)] bg-[var(--surface-container-high)] px-3 py-1 rounded-full animate-fadeIn">
            {currentItem.reference} ({currentItem.translation})
          </div>
        )}
      </Card>

      <div className="flex flex-col gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--on-container-variant)] px-1">
          Pick the Genuine Scripture Ending:
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {options.map((ending, idx) => {
            const isSelected = selectedEnding === ending;
            const isReal = ending === currentItem.realEnding;

            let btnClass = 'bg-[var(--surface-card)] text-[var(--on-container)] border-[var(--border-tint)] hover:border-[var(--primary-action)]/50';
            if (selectedEnding) {
              if (isReal) {
                btnClass = 'bg-emerald-500 text-white border-emerald-600 shadow-md font-bold';
              } else if (isSelected) {
                btnClass = 'bg-rose-500 text-white border-rose-600 shadow-sm';
              } else {
                btnClass = 'opacity-40 bg-[var(--surface-container)]';
              }
            }

            return (
              <button
                key={idx}
                disabled={!!selectedEnding}
                onClick={() => handleSelect(ending)}
                className={`p-4 sm:p-5 rounded-2xl text-left text-sm sm:text-base font-semibold border-2 transition-all flex items-center justify-between shadow-sm cursor-pointer ${btnClass}`}
              >
                <span>&ldquo;&hellip;{ending}&rdquo;</span>
                {selectedEnding && isReal && <Icon name="check" size={20} className="shrink-0 ml-2" />}
                {selectedEnding && isSelected && !isReal && <Icon name="close" size={20} className="shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      </div>

      {selectedEnding && (
        <Button variant="primary" size="hero" pill onClick={handleNext} className="w-full mt-2 shadow-md">
          Next Proverb
        </Button>
      )}
    </>
  );
};

// ==========================================
// 4. TARES AMONG THE WHEAT SOLO PRACTICE
// ==========================================
const TaresSoloPractice: React.FC<{ onBack: () => void; onDirectExit: () => void }> = ({ onBack, onDirectExit }) => {
  const { triggerHaptic } = useTheme();

  const buildPool = () => {
    const passages = taresData.passages;
    const easy = shuffle(passages.filter((p) => getPassageDifficulty(p as any) === 'easy'));
    const medium = shuffle(passages.filter((p) => getPassageDifficulty(p as any) === 'medium'));
    const hard = shuffle(passages.filter((p) => getPassageDifficulty(p as any) === 'hard'));
    return [...easy, ...medium, ...hard];
  };

  const [pool, setPool] = useState(buildPool);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [timer, setTimer] = useState(15);
  const [isGameOver, setIsGameOver] = useState(false);

  const currentPassage = pool[currentIndex % pool.length];

  const options = useMemo(() => {
    const wrong = shuffle(currentPassage.wrongGuesses).slice(0, 3);
    return shuffle([currentPassage.title, ...wrong]);
  }, [currentPassage]);

  // Countdown timer
  useEffect(() => {
    if (selectedTitle || isGameOver) return;
    setTimer(15);

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeOut();
          return 0;
        }
        if (prev <= 4) {
          soundManager.playTick();
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentIndex, selectedTitle, isGameOver]);

  const handleTimeOut = () => {
    if (selectedTitle) return;
    setSelectedTitle('__timeout__');
    soundManager.playBuzzer();
    triggerHaptic('heavy');
    const newStrikes = strikes + 1;
    setStrikes(newStrikes);
    setStreak(0);
    if (newStrikes >= 3) setIsGameOver(true);
  };

  const handleSelect = (title: string) => {
    if (selectedTitle || isGameOver) return;
    setSelectedTitle(title);

    const isCorrect = title === currentPassage.title;
    if (isCorrect) {
      soundManager.playChime();
      triggerHaptic('medium');
      const pts = 100 + timer * 5 + streak * 10;
      setScore((prev) => prev + pts);
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > bestStreak) setBestStreak(nextStreak);
    } else {
      soundManager.playBuzzer();
      triggerHaptic('heavy');
      const newStrikes = strikes + 1;
      setStrikes(newStrikes);
      setStreak(0);
      if (newStrikes >= 3) setIsGameOver(true);
    }
  };

  const handleNext = () => {
    setSelectedTitle(null);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleRestart = () => {
    setSelectedTitle(null);
    setPool(buildPool());
    setCurrentIndex(0);
    setScore(0);
    setStrikes(0);
    setStreak(0);
    setIsGameOver(false);
  };

  if (isGameOver) {
    return (
      <GameOverCard
        title="Wheat Identification Ended!"
        score={score}
        bestStreak={bestStreak}
        onRestart={handleRestart}
        onBack={onDirectExit}
      />
    );
  }

  const difficulty = getPassageDifficulty(currentPassage as any);

  return (
    <>
      <HeaderBar onBack={onBack} streak={streak} bestStreak={bestStreak} score={score} strikes={strikes} />

      <Card variant="hero" padding="lg" className="text-center flex flex-col items-center gap-3.5 shadow-md relative overflow-hidden">
        <CountdownProgressBar durationSeconds={15} isStopped={!!selectedTitle} roundKey={currentIndex} />

        <div className="flex items-center justify-between w-full">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
            {difficulty.toUpperCase()} • Round {currentIndex + 1}
          </span>
          <span className={`font-mono text-xs font-bold flex items-center gap-1 ${timer <= 4 ? 'text-rose-500 animate-pulse' : 'text-[var(--primary-action)]'}`}>
            <Icon name="timer" size={13} /> {timer}s
          </span>
        </div>

        <div className="flex flex-wrap gap-2 justify-center my-2">
          {currentPassage.keywords.map((kw, i) => (
            <span key={i} className="px-3 py-1 rounded-full bg-[var(--surface-container)] text-[var(--on-container)] font-bold text-sm border border-[var(--border-tint)]">
              🌾 {kw}
            </span>
          ))}
        </div>
        {selectedTitle && (
          <div className="text-xs font-bold text-[var(--primary-action)] bg-[var(--surface-container-high)] px-3 py-1 rounded-full animate-fadeIn">
            {currentPassage.reference}
          </div>
        )}
      </Card>

      <div className="flex flex-col gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--on-container-variant)] px-1">
          Match the Genuine Biblical Event:
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {options.map((title, idx) => {
            const isSelected = selectedTitle === title;
            const isReal = title === currentPassage.title;

            let btnClass = 'bg-[var(--surface-card)] text-[var(--on-container)] border-[var(--border-tint)] hover:border-[var(--primary-action)]/50';
            if (selectedTitle) {
              if (isReal) {
                btnClass = 'bg-emerald-500 text-white border-emerald-600 shadow-md font-bold';
              } else if (isSelected) {
                btnClass = 'bg-rose-500 text-white border-rose-600 shadow-sm';
              } else {
                btnClass = 'opacity-40 bg-[var(--surface-container)]';
              }
            }

            return (
              <button
                key={idx}
                disabled={!!selectedTitle}
                onClick={() => handleSelect(title)}
                className={`p-4 sm:p-5 rounded-2xl text-left text-sm sm:text-base font-semibold border-2 transition-all flex items-center justify-between shadow-sm cursor-pointer ${btnClass}`}
              >
                <span>{title}</span>
                {selectedTitle && isReal && <Icon name="check" size={20} className="shrink-0 ml-2" />}
                {selectedTitle && isSelected && !isReal && <Icon name="close" size={20} className="shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      </div>

      {selectedTitle && (
        <Button variant="primary" size="hero" pill onClick={handleNext} className="w-full mt-2 shadow-md">
          Next Passage
        </Button>
      )}
    </>
  );
};

// ==========================================
// 5. HOT COAL SOLO PRACTICE
// ==========================================
const HotCoalSoloPractice: React.FC<{ onBack: () => void; onDirectExit: () => void }> = ({ onBack, onDirectExit }) => {
  const { triggerHaptic } = useTheme();

  const buildPool = () => {
    const categories = hotCoalData.categories;
    const easy = shuffle(categories.filter((c) => c.difficulty === 'easy'));
    const medium = shuffle(categories.filter((c) => c.difficulty === 'medium'));
    const hard = shuffle(categories.filter((c) => c.difficulty === 'hard'));
    return [...easy, ...medium, ...hard];
  };

  const [pool, setPool] = useState(buildPool);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [timer, setTimer] = useState(12);
  const [isGameOver, setIsGameOver] = useState(false);

  const currentCategory = pool[currentIndex % pool.length];

  const options = useMemo(() => {
    const genuine = currentCategory.items[Math.floor(Math.random() * currentCategory.items.length)].name;
    const otherCategories = pool.filter((c) => c.id !== currentCategory.id);
    const distractors: string[] = [];
    for (const cat of otherCategories) {
      if (distractors.length >= 3) break;
      const randItem = cat.items[Math.floor(Math.random() * cat.items.length)].name;
      if (!distractors.includes(randItem) && randItem !== genuine) {
        distractors.push(randItem);
      }
    }
    return shuffle([genuine, ...distractors]);
  }, [currentCategory, pool]);

  // Countdown timer
  useEffect(() => {
    if (selectedItem || isGameOver) return;
    setTimer(12);

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeOut();
          return 0;
        }
        if (prev <= 4) {
          soundManager.playTick();
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentIndex, selectedItem, isGameOver]);

  const handleTimeOut = () => {
    if (selectedItem) return;
    setSelectedItem('__timeout__');
    soundManager.playBuzzer();
    triggerHaptic('heavy');
    const newStrikes = strikes + 1;
    setStrikes(newStrikes);
    setStreak(0);
    if (newStrikes >= 3) setIsGameOver(true);
  };

  const handleSelect = (name: string) => {
    if (selectedItem || isGameOver) return;
    setSelectedItem(name);

    const isCorrect = currentCategory.items.some((it) => it.name === name);
    if (isCorrect) {
      soundManager.playChime();
      triggerHaptic('medium');
      const pts = 100 + timer * 8 + streak * 10;
      setScore((prev) => prev + pts);
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > bestStreak) setBestStreak(nextStreak);
    } else {
      soundManager.playBuzzer();
      triggerHaptic('heavy');
      const newStrikes = strikes + 1;
      setStrikes(newStrikes);
      setStreak(0);
      if (newStrikes >= 3) setIsGameOver(true);
    }
  };

  const handleNext = () => {
    setSelectedItem(null);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleRestart = () => {
    setSelectedItem(null);
    setPool(buildPool());
    setCurrentIndex(0);
    setScore(0);
    setStrikes(0);
    setStreak(0);
    setIsGameOver(false);
  };

  if (isGameOver) {
    return (
      <GameOverCard
        title="Hot Coal Run Ended!"
        score={score}
        bestStreak={bestStreak}
        onRestart={handleRestart}
        onBack={onDirectExit}
      />
    );
  }

  return (
    <>
      <HeaderBar onBack={onBack} streak={streak} bestStreak={bestStreak} score={score} strikes={strikes} />

      <Card variant="hero" padding="lg" className="text-center flex flex-col items-center gap-3.5 shadow-md relative overflow-hidden">
        <CountdownProgressBar durationSeconds={12} isStopped={!!selectedItem} roundKey={currentIndex} />

        <div className="flex items-center justify-between w-full">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 flex items-center gap-1">
            <Icon name="flame" size={12} /> {currentCategory.difficulty.toUpperCase()} • Round {currentIndex + 1}
          </span>
          <span className={`font-mono text-xs font-bold flex items-center gap-1 ${timer <= 4 ? 'text-rose-500 animate-pulse' : 'text-[var(--primary-action)]'}`}>
            <Icon name="timer" size={13} /> {timer}s
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold leading-snug tracking-tight max-w-xl my-2">
          {currentCategory.title}
        </h2>
        {selectedItem && currentCategory.references && (
          <div className="text-xs font-bold text-[var(--primary-action)] bg-[var(--surface-container-high)] px-3 py-1 rounded-full animate-fadeIn">
            {currentCategory.references.join(', ')}
          </div>
        )}
      </Card>

      <div className="flex flex-col gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--on-container-variant)] px-1">
          Pick which item belongs to this group:
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {options.map((name, idx) => {
            const isSelected = selectedItem === name;
            const isReal = currentCategory.items.some((it) => it.name === name);

            let btnClass = 'bg-[var(--surface-card)] text-[var(--on-container)] border-[var(--border-tint)] hover:border-[var(--primary-action)]/50';
            if (selectedItem) {
              if (isReal) {
                btnClass = 'bg-emerald-500 text-white border-emerald-600 shadow-md font-bold';
              } else if (isSelected) {
                btnClass = 'bg-rose-500 text-white border-rose-600 shadow-sm';
              } else {
                btnClass = 'opacity-40 bg-[var(--surface-container)]';
              }
            }

            return (
              <button
                key={idx}
                disabled={!!selectedItem}
                onClick={() => handleSelect(name)}
                className={`p-4 sm:p-5 rounded-2xl text-left text-sm sm:text-base font-semibold border-2 transition-all flex items-center justify-between shadow-sm cursor-pointer ${btnClass}`}
              >
                <span>{name}</span>
                {selectedItem && isReal && <Icon name="check" size={20} className="shrink-0 ml-2" />}
                {selectedItem && isSelected && !isReal && <Icon name="close" size={20} className="shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      </div>

      {selectedItem && (
        <Button variant="primary" size="hero" pill onClick={handleNext} className="w-full mt-2 shadow-md">
          Next Category
        </Button>
      )}
    </>
  );
};

// ==========================================
// SHARED UI HELPERS FOR SOLO PRACTICE
// ==========================================

const CountdownProgressBar: React.FC<{
  durationSeconds: number;
  isStopped?: boolean;
  roundKey: string | number;
}> = ({ durationSeconds, isStopped, roundKey }) => {
  return (
    <div className="absolute top-0 left-0 right-0 h-1.5 bg-black/5 dark:bg-white/5 overflow-hidden z-10 pointer-events-none">
      <div
        key={String(roundKey)}
        className={`h-full w-full origin-left bg-gradient-to-r from-rose-500 via-amber-500 to-[var(--primary-action)] ${
          isStopped ? 'opacity-40' : ''
        }`}
        style={{
          animation: `analogTimerDrain ${durationSeconds}s linear forwards`,
          animationPlayState: isStopped ? 'paused' : 'running',
        }}
      />
    </div>
  );
};

const HeaderBar: React.FC<{
  onBack: () => void;
  streak: number;
  bestStreak: number;
  score?: number;
  strikes?: number;
}> = ({ onBack, streak, bestStreak, score, strikes }) => (
  <div className="flex items-center justify-between">
    <button
      onClick={onBack}
      className="w-10 h-10 rounded-full bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] text-[var(--on-container)] flex items-center justify-center transition-colors cursor-pointer border border-[var(--border-tint)]/60 shadow-sm"
      aria-label="Back"
    >
      <Icon name="arrow-left" size={20} />
    </button>

    <div className="flex items-center gap-2">
      {score !== undefined && (
        <div className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-[var(--surface-container)] text-[var(--primary-action)] border border-[var(--border-tint)]/60 shadow-xs">
          {score} pts
        </div>
      )}
      {strikes !== undefined && (
        <div className="px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-300/40 shadow-xs">
          {'❌'.repeat(strikes)}{'⚪'.repeat(Math.max(0, 3 - strikes))}
        </div>
      )}
      <div className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-[var(--surface-container)] text-amber-600 dark:text-amber-400 border border-[var(--border-tint)]/60 shadow-xs">
        {streak} 🔥
      </div>
      <div className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-[var(--surface-container)] text-[var(--on-container-variant)] border border-[var(--border-tint)]/60 shadow-xs">
        Best: {bestStreak} 🏆
      </div>
    </div>
  </div>
);

const GameOverCard: React.FC<{
  title: string;
  score: number;
  bestStreak: number;
  onRestart: () => void;
  onBack: () => void;
}> = ({ title, score, bestStreak, onRestart, onBack }) => (
  <Card variant="hero" padding="lg" className="text-center py-10 flex flex-col items-center gap-4 shadow-lg animate-fadeIn">
    <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 flex items-center justify-center text-3xl font-bold">
      3❌
    </div>
    <h2 className="text-3xl font-black text-[var(--on-container)]">{title}</h2>
    <p className="text-sm text-[var(--on-container-variant)] max-w-sm">
      You reached 3 strikes or timed out. Great practice session to sharpen your biblical knowledge!
    </p>
    <div className="p-4 rounded-2xl bg-[var(--surface-container)] flex items-center gap-6 my-2 shadow-inner">
      <div>
        <div className="text-3xl font-black text-[var(--primary-action)]">{score}</div>
        <div className="text-xs text-[var(--on-container-variant)] font-semibold uppercase tracking-wider">Total Points</div>
      </div>
      <div className="w-px h-10 bg-[var(--border-tint)]" />
      <div>
        <div className="text-3xl font-black text-amber-500">{bestStreak} 🔥</div>
        <div className="text-xs text-[var(--on-container-variant)] font-semibold uppercase tracking-wider">Best Streak</div>
      </div>
    </div>
    <div className="flex gap-3 w-full max-w-xs mt-3">
      <Button variant="primary" className="w-full shadow-md" size="lg" onClick={onRestart}>Play Again</Button>
      <Button variant="tonal" className="w-full" size="lg" onClick={onBack}>Back to Library</Button>
    </div>
  </Card>
);
