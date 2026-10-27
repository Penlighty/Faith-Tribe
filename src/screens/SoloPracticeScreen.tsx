import React, { useState, useEffect, useMemo } from 'react';
import { Icon } from '@design/icons';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LeaveConfirmationModal } from '../components/ui/LeaveConfirmationModal';
import { PracticeSummaryModal } from '../components/ui/PracticeSummaryModal';
import { useTheme } from '../theme/ThemeContext';
import { gameRegistry } from '../engine/registry';
import { soundManager } from '../engine/services/audio';

// Content sources for all games
import proverbsData from '../games/fake-a-proverb/content.json';
import taresData from '../games/tares-among-the-wheat/content.json';
import hotCoalData from '../games/hot-coal/content.json';
import { allWhoSaidItems, allTestamentSortItems, allFourSignsPuzzles, allScribesTilesWords, allBibleOrNotItems } from '../engine/content/loader';
import { calculateWhoSaidScore, calculateWhoSaidTimeLimit } from '../games/who-said/scoring';
import { calculateTestamentSortScore, getTestamentSortTimeLimit } from '../games/testament-sort/scoring';
import { calculateFourSignsScore, calculateFourSignsTimeLimit } from '../games/four-signs/scoring';
import { calculateScribesTilesScore, calculateScribesTilesTimeLimit } from '../games/scribes-tiles/scoring';
import { calculateBibleOrNotScore, getBibleOrNotTimeLimit } from '../games/bible-or-not/scoring';
import { FourSignClueCard } from '../games/four-signs/icons';
import { createPlayerRack } from '../games/scribes-tiles/reducer';
import { ScribeTile } from '../games/scribes-tiles/types';
import { TestamentChoice } from '../games/testament-sort/types';
import { BibleOrNotChoice } from '../games/bible-or-not/types';
import { WhoSaidItem, TestamentSortItem, FourSignsPuzzle, ScribesTilesWord, BibleOrNotItem } from '../engine/content/schemas';
import { FlashcardDeck } from '../games/bible-or-not/FlashcardDeck';
import { ProverbItem } from '../games/fake-a-proverb/types';
import { PassageItem } from '../games/tares-among-the-wheat/types';
import { HotCoalCategory } from '../games/hot-coal/types';
import { getPassageDifficulty } from '../games/tares-among-the-wheat/reducer';
import { ShelfRushPlayerView } from '../games/shelf-rush/PlayerView';


import { getFreshPool, getFreshBibleOrNotPool, markItemSeen, shuffle } from '../engine/services/randomizer';
import { getStreakMilestone, getRandomEncouragement, StreakMilestone } from '../engine/services/streakRewards';
import { AnswerFeedbackBanner, StreakMilestoneModal, fireConfettiBurst } from '../components/ui/StreakCelebration';
import { LifelineHearts } from '../components/ui/LifelineHearts';
import { OptionCard } from '../components/ui/OptionCard';

export interface SoloPracticeScreenProps {
  gameId: string;
  onBack: () => void;
}

export const SoloPracticeScreen: React.FC<SoloPracticeScreenProps> = ({ gameId, onBack }) => {
  const game = gameRegistry.get(gameId) || gameRegistry.get('fake-a-proverb');
  const meta = game?.meta;
  const { setPaletteKey } = useTheme();

  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [intentionalEndTrigger, setIntentionalEndTrigger] = useState(0);

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
    setIntentionalEndTrigger((prev) => prev + 1);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 pb-28 pt-2 sm:pt-6 flex flex-col gap-6 select-none animate-fadeIn">
      {gameId === 'bible-or-not' && <BibleOrNotSoloPractice onBack={handleRequestExit} onDirectExit={onBack} endTrigger={intentionalEndTrigger} />}
      {gameId === 'four-signs' && <FourSignsSoloPractice onBack={handleRequestExit} onDirectExit={onBack} endTrigger={intentionalEndTrigger} />}
      {gameId === 'scribes-tiles' && <ScribesTilesSoloPractice onBack={handleRequestExit} onDirectExit={onBack} endTrigger={intentionalEndTrigger} />}
      {gameId === 'who-said' && <WhoSaidSoloPractice onBack={handleRequestExit} onDirectExit={onBack} endTrigger={intentionalEndTrigger} />}
      {gameId === 'testament-sort' && <TestamentSortSoloPractice onBack={handleRequestExit} onDirectExit={onBack} endTrigger={intentionalEndTrigger} />}
      {gameId === 'shelf-rush' && <ShelfRushSoloPractice onDirectExit={onBack} />}
      {gameId === 'tares-among-the-wheat' && <TaresSoloPractice onBack={handleRequestExit} onDirectExit={onBack} endTrigger={intentionalEndTrigger} />}
      {gameId === 'hot-coal' && <HotCoalSoloPractice onBack={handleRequestExit} onDirectExit={onBack} endTrigger={intentionalEndTrigger} />}
      {gameId === 'fake-a-proverb' && <FakeAProverbSoloPractice onBack={handleRequestExit} onDirectExit={onBack} endTrigger={intentionalEndTrigger} />}
      {!['bible-or-not', 'four-signs', 'scribes-tiles', 'who-said', 'testament-sort', 'shelf-rush', 'tares-among-the-wheat', 'hot-coal', 'fake-a-proverb'].includes(gameId) && (
        <FakeAProverbSoloPractice onBack={handleRequestExit} onDirectExit={onBack} endTrigger={intentionalEndTrigger} />
      )}

      {/* Confirmation Modal on Hardware/Browser Back */}
      <LeaveConfirmationModal
        isOpen={showLeaveConfirm}
        isMultiplayer={false}
        onConfirm={() => {
          setShowLeaveConfirm(false);
          setIntentionalEndTrigger((prev) => prev + 1);
        }}
        onCancel={() => setShowLeaveConfirm(false)}
      />
    </div>
  );
};

// ==========================================
// 0. BIBLE OR NOT? SOLO PRACTICE (WITH LEVEL GRADUATION)
// ==========================================
const LEVEL_CONFIGS: Record<1 | 2 | 3 | 4, { name: string; target: number; badgeColor: string }> = {
  1: { name: 'Level 1: Novice Disciple', target: 8, badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
  2: { name: 'Level 2: Scripture Scholar', target: 10, badgeColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300' },
  3: { name: 'Level 3: Berean Scribe', target: 12, badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' },
  4: { name: 'Level 4: Master of Truth', target: 15, badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
};

const BibleOrNotSoloPractice: React.FC<{ onBack: () => void; onDirectExit: () => void; endTrigger?: number }> = ({ onBack, onDirectExit, endTrigger }) => {
  const { triggerHaptic } = useTheme();

  const [currentLevel, setCurrentLevel] = useState<1 | 2 | 3 | 4>(1);
  const [levelProgress, setLevelProgress] = useState(0);
  const [showGraduationModal, setShowGraduationModal] = useState(false);

  const buildPoolForTier = (tier: 1 | 2 | 3 | 4): BibleOrNotItem[] => {
    return getFreshBibleOrNotPool(tier);
  };

  const [pool, setPool] = useState<BibleOrNotItem[]>(() => buildPoolForTier(1));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<BibleOrNotChoice | '__timeout__' | null>(null);
  const [showCardReveal, setShowCardReveal] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [timer, setTimer] = useState(15);
  const [maxTimer, setMaxTimer] = useState(15);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [activeMilestone, setActiveMilestone] = useState<StreakMilestone | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<{ isCorrect: boolean; message: string; pointsEarned?: number; streak: number } | null>(null);

  useEffect(() => {
    if (endTrigger && endTrigger > 0) {
      setShowSummary(true);
    }
  }, [endTrigger]);

  const currentItem = pool[currentIndex % pool.length];
  const nextItem = pool[(currentIndex + 1) % pool.length];
  const thirdItem = pool[(currentIndex + 2) % pool.length];

  const currentTarget = LEVEL_CONFIGS[currentLevel].target;

  // Countdown timer based on tier
  useEffect(() => {
    if (selectedChoice || isGameOver || showGraduationModal || activeMilestone || showSummary) return;
    const limit = getBibleOrNotTimeLimit(currentLevel);
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
  }, [currentIndex, selectedChoice, isGameOver, currentLevel, showGraduationModal, activeMilestone, showSummary]);

  const handleTimeOut = () => {
    if (selectedChoice) return;
    setSelectedChoice('__timeout__');
    setShowCardReveal(true);
    soundManager.playWrong();
    triggerHaptic('heavy');

    if (currentItem) {
      markItemSeen('bible-or-not', currentItem.id);
      markItemSeen(`bible-or-not-t${currentLevel}`, currentItem.id);
    }

    const newStrikes = strikes + 1;
    setStrikes(newStrikes);
    setStreak(0);
    setFeedbackToast({
      isCorrect: false,
      message: 'Time ran out! ' + getRandomEncouragement(false),
      streak: 0,
    });
    if (newStrikes >= 3) {
      setTimeout(() => setIsGameOver(true), 1500);
    }
  };

  const handleSwipe = (choice: BibleOrNotChoice) => {
    if (selectedChoice || isGameOver || showGraduationModal) return;
    setSelectedChoice(choice);
    setShowCardReveal(true);

    markItemSeen('bible-or-not', currentItem.id);
    markItemSeen(`bible-or-not-t${currentLevel}`, currentItem.id);

    const isCorrect = choice === currentItem.answer;
    if (isCorrect) {
      soundManager.playCorrect();
      triggerHaptic('medium');
      const earned = calculateBibleOrNotScore({
        tier: currentLevel,
        elapsedSeconds: Math.max(1, maxTimer - timer),
        isCorrect: true,
        streakCount: streak,
      }).points;

      setScore((prev) => prev + earned);
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > bestStreak) setBestStreak(nextStreak);

      const nextProg = levelProgress + 1;
      setLevelProgress(nextProg);

      const milestone = getStreakMilestone(nextStreak);
      if (milestone) {
        soundManager.playStreakMilestone(nextStreak);
        setActiveMilestone(milestone);
      } else {
        fireConfettiBurst(nextStreak >= 5 ? 'medium' : 'light');
      }

      setFeedbackToast({
        isCorrect: true,
        message: getRandomEncouragement(true),
        pointsEarned: earned,
        streak: nextStreak,
      });

      // Check level graduation!
      if (nextProg >= currentTarget) {
        setTimeout(() => {
          soundManager.playLevelUp();
          fireConfettiBurst('high');
          setShowGraduationModal(true);
        }, 1200);
      }
    } else {
      soundManager.playWrong();
      triggerHaptic('heavy');
      const newStrikes = strikes + 1;
      setStrikes(newStrikes);
      setStreak(0);
      setFeedbackToast({
        isCorrect: false,
        message: getRandomEncouragement(false),
        streak: 0,
      });
      if (newStrikes >= 3) {
        setTimeout(() => setIsGameOver(true), 1600);
      }
    }
  };

  const advanceToNextCard = () => {
    setSelectedChoice(null);
    setShowCardReveal(false);
    setFeedbackToast(null);
    setCurrentIndex((prev) => prev + 1);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showCardReveal || isGameOver || showGraduationModal || activeMilestone) return;
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
        e.preventDefault();
        advanceToNextCard();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCardReveal, isGameOver, showGraduationModal, activeMilestone]);

  const handleGraduateNextLevel = () => {
    setShowGraduationModal(false);
    setSelectedChoice(null);
    setShowCardReveal(false);
    setFeedbackToast(null);
    if (currentLevel < 4) {
      const nextLvl = (currentLevel + 1) as 1 | 2 | 3 | 4;
      setCurrentLevel(nextLvl);
      setLevelProgress(0);
      setPool(buildPoolForTier(nextLvl));
      setCurrentIndex(0);
    }
  };

  const handleRestart = () => {
    setCurrentLevel(1);
    setLevelProgress(0);
    setPool(buildPoolForTier(1));
    setCurrentIndex(0);
    setSelectedChoice(null);
    setShowCardReveal(false);
    setStreak(0);
    setScore(0);
    setStrikes(0);
    setIsGameOver(false);
    setShowGraduationModal(false);
    setShowSummary(false);
  };

  return (
    <div className="w-full flex flex-col gap-5 animate-fadeIn">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowSummary(true)}
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <span>←</span>
          <span>Practice Hub</span>
        </button>

        <div className="flex items-center gap-3">
          {/* Strikes / Lifeline Hearts */}
          <div className="px-3 py-1.5 rounded-full bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/40 shadow-xs flex items-center">
            <LifelineHearts strikes={strikes} size={18} />
          </div>

          {/* Current Score */}
          <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-200 shadow-sm">
            {score} pts
          </span>
        </div>
      </div>

      {/* Level & Progress Banner */}
      <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${LEVEL_CONFIGS[currentLevel].badgeColor}`}>
              {LEVEL_CONFIGS[currentLevel].name}
            </span>
            {streak > 1 && (
              <span className="text-xs font-bold text-amber-500 animate-pulse">
                🔥 {streak} Streak
              </span>
            )}
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {levelProgress} / {currentTarget} to Graduate
          </span>
        </div>

        {/* Level Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300 rounded-full"
            style={{ width: `${Math.min(100, (levelProgress / currentTarget) * 100)}%` }}
          />
        </div>
      </Card>

      {/* Main Flashcard Deck */}
      <div className="w-full flex flex-col items-center">
        {/* Timer Bar */}
        <div className="w-full max-w-md flex items-center justify-between text-xs text-slate-400 font-semibold mb-2 px-2">
          <span>Time Remaining</span>
          <span className={`font-mono text-sm font-bold ${timer <= 4 ? 'text-rose-500 animate-bounce' : 'text-slate-600 dark:text-slate-300'}`}>
            {timer}s
          </span>
        </div>

        <FlashcardDeck
          card={currentItem}
          nextCard={nextItem}
          thirdCard={thirdItem}
          onSwipe={handleSwipe}
          disabled={Boolean(selectedChoice) || isGameOver || showGraduationModal || Boolean(activeMilestone)}
          selectedChoice={selectedChoice === '__timeout__' ? null : selectedChoice}
          showReveal={showCardReveal}
          isCorrect={selectedChoice ? selectedChoice === currentItem.answer : undefined}
        />

        {/* Manual Advance Button if user wants to proceed immediately after viewing card */}
        {showCardReveal && !isGameOver && !showGraduationModal && (
          <div className="w-full max-w-md mt-4 animate-fadeIn">
            <Button
              variant="primary"
              className="w-full py-3.5 text-base font-bold shadow-lg"
              onClick={advanceToNextCard}
            >
              Next Flashcard →
            </Button>
          </div>
        )}
      </div>

      {/* Streak Milestone Modal */}
      {activeMilestone && (
        <StreakMilestoneModal milestone={activeMilestone} onDismiss={() => setActiveMilestone(null)} />
      )}

      {/* Answer Feedback Banner */}
      {feedbackToast && (
        <AnswerFeedbackBanner
          isCorrect={feedbackToast.isCorrect}
          message={feedbackToast.message}
          pointsEarned={feedbackToast.pointsEarned}
          streak={feedbackToast.streak}
          onDismiss={() => setFeedbackToast(null)}
        />
      )}

      {/* Level Graduation Modal */}
      {showGraduationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <Card className="max-w-md w-full p-6 text-center shadow-2xl border-cyan-400 bg-white dark:bg-slate-900">
            <div className="text-5xl mb-3 animate-bounce">🎓</div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-1">
              Level {currentLevel} Completed!
            </h3>
            <p className="text-sm text-cyan-600 dark:text-cyan-400 font-bold mb-4">
              You've proven your mastery of Scripture truth!
            </p>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              {currentLevel < 4
                ? `You have unlocked ${LEVEL_CONFIGS[(currentLevel + 1) as 1 | 2 | 3 | 4].name}. The quotes and misattributions will become even more challenging!`
                : 'Congratulations! You have completed all 4 levels and mastered the entire Bible or Not collection!'}
            </p>

            <div className="flex flex-col gap-2.5">
              {currentLevel < 4 ? (
                <Button variant="primary" className="w-full py-3.5 font-bold" onClick={handleGraduateNextLevel}>
                  Advance to Level {currentLevel + 1} ⚡
                </Button>
              ) : (
                <Button variant="primary" className="w-full py-3.5 font-bold" onClick={() => setShowSummary(true)}>
                  Return to Home as Master 👑
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Practice Summary Modal (Across Game Over & Intentional End) */}
      <PracticeSummaryModal
        isOpen={isGameOver || showSummary}
        title={currentLevel === 4 && levelProgress >= currentTarget ? "Mastery Achieved! 👑" : "Practice Complete"}
        subtitle="You tested your discernment on God's Word!"
        icon="📜"
        score={score}
        bestStreak={bestStreak}
        onRestart={handleRestart}
        onExit={onDirectExit}
        onClose={!isGameOver ? () => setShowSummary(false) : undefined}
      />
    </div>
  );
};

// ==========================================
// 1. WHO SAID THAT? SOLO PRACTICE
// ==========================================
const WhoSaidSoloPractice: React.FC<{ onBack: () => void; onDirectExit: () => void; endTrigger?: number }> = ({ onBack, onDirectExit, endTrigger }) => {
  const { triggerHaptic } = useTheme();

  const buildPool = (): WhoSaidItem[] => {
    const dbContent = gameRegistry.get('who-said')?.content as WhoSaidItem[] | undefined;
    const base: WhoSaidItem[] = dbContent && dbContent.length > 0 ? dbContent : allWhoSaidItems;
    const t1 = getFreshPool<WhoSaidItem>(base.filter((i) => i.tier === 1), 'who-said-t1');
    const t2 = getFreshPool<WhoSaidItem>(base.filter((i) => i.tier === 2), 'who-said-t2');
    const t3 = getFreshPool<WhoSaidItem>(base.filter((i) => i.tier === 3), 'who-said-t3');
    const t4 = getFreshPool<WhoSaidItem>(base.filter((i) => i.tier === 4), 'who-said-t4');
    return [...t1, ...t2, ...t3, ...t4];
  };

  const [pool, setPool] = useState<WhoSaidItem[]>(buildPool);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedSpeaker, setSelectedSpeaker] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [timer, setTimer] = useState(15);
  const [maxTimer, setMaxTimer] = useState(15);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [activeMilestone, setActiveMilestone] = useState<StreakMilestone | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<{ isCorrect: boolean; message: string; pointsEarned?: number; streak: number } | null>(null);

  useEffect(() => {
    if (endTrigger && endTrigger > 0) {
      setShowSummary(true);
    }
  }, [endTrigger]);

  const currentItem = pool[currentIndex % pool.length];

  const options = useMemo(() => {
    return shuffle([...currentItem.options]);
  }, [currentItem]);

  // Clock countdown
  useEffect(() => {
    if (selectedSpeaker || isGameOver || showSummary) return;
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
  }, [currentIndex, selectedSpeaker, isGameOver, currentItem, showSummary]);

  const handleTimeOut = () => {
    if (selectedSpeaker) return;
    setSelectedSpeaker('__timeout__');
    soundManager.playWrong();
    triggerHaptic('heavy');
    const newStrikes = strikes + 1;
    setStrikes(newStrikes);
    setStreak(0);
    setFeedbackToast({
      isCorrect: false,
      message: getRandomEncouragement(false),
      streak: 0,
    });
    if (newStrikes >= 3) setIsGameOver(true);
  };

  const handleSelect = (speaker: string) => {
    if (selectedSpeaker || isGameOver) return;
    setSelectedSpeaker(speaker);

    const isCorrect = speaker === currentItem.answer;
    if (isCorrect) {
      soundManager.playCorrect();
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

      const milestone = getStreakMilestone(nextStreak);
      if (milestone) {
        soundManager.playStreakMilestone(nextStreak);
        setActiveMilestone(milestone);
      } else {
        fireConfettiBurst(nextStreak >= 5 ? 'medium' : 'light');
      }

      setFeedbackToast({
        isCorrect: true,
        message: getRandomEncouragement(true),
        pointsEarned: earned,
        streak: nextStreak,
      });
    } else {
      soundManager.playWrong();
      triggerHaptic('heavy');
      const newStrikes = strikes + 1;
      setStrikes(newStrikes);
      setStreak(0);
      setFeedbackToast({
        isCorrect: false,
        message: getRandomEncouragement(false),
        streak: 0,
      });
      if (newStrikes >= 3) {
        setIsGameOver(true);
      }
    }
  };

  const handleNext = () => {
    markItemSeen('who-said', currentItem.id);
    setSelectedSpeaker(null);
    setFeedbackToast(null);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleRestart = () => {
    setSelectedSpeaker(null);
    setFeedbackToast(null);
    setActiveMilestone(null);
    setPool(buildPool());
    setCurrentIndex(0);
    setScore(0);
    setStrikes(0);
    setStreak(0);
    setIsGameOver(false);
    setShowSummary(false);
  };

  return (
    <>
      <HeaderBar
        onBack={() => setShowSummary(true)}
        streak={streak}
        bestStreak={bestStreak}
        score={score}
        strikes={strikes}
      />

      {feedbackToast && (
        <AnswerFeedbackBanner
          isCorrect={feedbackToast.isCorrect}
          message={feedbackToast.message}
          pointsEarned={feedbackToast.pointsEarned}
          streakCount={feedbackToast.streak}
        />
      )}

      {activeMilestone && (
        <StreakMilestoneModal
          milestone={activeMilestone}
          onDismiss={() => setActiveMilestone(null)}
        />
      )}

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

            return (
              <OptionCard
                key={speaker}
                label={speaker}
                index={idx}
                isSelected={isSelected}
                isCorrect={selectedSpeaker ? isCorrect : null}
                isRevealed={Boolean(selectedSpeaker)}
                disabled={Boolean(selectedSpeaker)}
                onClick={() => handleSelect(speaker)}
              />
            );
          })}
        </div>
      </div>

      {selectedSpeaker && (
        <Button variant="primary" size="hero" pill onClick={handleNext} className="w-full mt-2 shadow-md">
          Next Question
        </Button>
      )}

      {/* Practice Summary Modal (Across Game Over & Intentional End) */}
      <PracticeSummaryModal
        isOpen={isGameOver || showSummary}
        title="Practice Complete"
        subtitle="You recognized the voices of prophets, apostles, and kings!"
        icon="🗣️"
        score={score}
        bestStreak={bestStreak}
        onRestart={handleRestart}
        onExit={onDirectExit}
        onClose={!isGameOver ? () => setShowSummary(false) : undefined}
      />
    </>
  );
};

// ==========================================
// 2. TESTAMENT SORT SOLO PRACTICE
// ==========================================
const TestamentSortSoloPractice: React.FC<{ onBack: () => void; onDirectExit: () => void; endTrigger?: number }> = ({ onBack, onDirectExit, endTrigger }) => {
  const { triggerHaptic } = useTheme();

  const buildPool = (): TestamentSortItem[] => {
    const dbContent = gameRegistry.get('testament-sort')?.content as TestamentSortItem[] | undefined;
    const base: TestamentSortItem[] = dbContent && dbContent.length > 0 ? dbContent : allTestamentSortItems;
    const t1 = getFreshPool<TestamentSortItem>(base.filter((i) => i.tier === 1), 'testament-sort-t1');
    const t2 = getFreshPool<TestamentSortItem>(base.filter((i) => i.tier === 2), 'testament-sort-t2');
    const t3 = getFreshPool<TestamentSortItem>(base.filter((i) => i.tier === 3), 'testament-sort-t3');
    const t4 = getFreshPool<TestamentSortItem>(base.filter((i) => i.tier === 4), 'testament-sort-t4');
    return [...t1, ...t2, ...t3, ...t4];
  };

  const [pool, setPool] = useState<TestamentSortItem[]>(buildPool);
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
  const [showSummary, setShowSummary] = useState(false);
  const [activeMilestone, setActiveMilestone] = useState<StreakMilestone | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<{ isCorrect: boolean; message: string; pointsEarned?: number; streak: number } | null>(null);

  useEffect(() => {
    if (endTrigger && endTrigger > 0) {
      setShowSummary(true);
    }
  }, [endTrigger]);

  const currentItem = pool[currentIndex % pool.length];

  // Countdown timer based on tier
  useEffect(() => {
    if (selectedChoice || isGameOver || showSummary) return;
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
  }, [currentIndex, selectedChoice, isGameOver, currentItem, showSummary]);

  const handleTimeOut = () => {
    if (selectedChoice) return;
    setSelectedChoice('__timeout__');
    soundManager.playWrong();
    triggerHaptic('heavy');
    const newStrikes = strikes + 1;
    setStrikes(newStrikes);
    setStreak(0);
    setFeedbackToast({
      isCorrect: false,
      message: getRandomEncouragement(false),
      streak: 0,
    });
    if (newStrikes >= 3) setIsGameOver(true);
  };

  const handleSelect = (choice: TestamentChoice) => {
    if (selectedChoice || isGameOver) return;
    setSelectedChoice(choice);

    const isCorrect = choice === currentItem.answer;
    if (isCorrect) {
      soundManager.playCorrect();
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

      const milestone = getStreakMilestone(nextStreak);
      if (milestone) {
        soundManager.playStreakMilestone(nextStreak);
        setActiveMilestone(milestone);
      } else {
        fireConfettiBurst(nextStreak >= 5 ? 'medium' : 'light');
      }

      setFeedbackToast({
        isCorrect: true,
        message: getRandomEncouragement(true),
        pointsEarned: earned,
        streak: nextStreak,
      });
    } else {
      soundManager.playWrong();
      triggerHaptic('heavy');
      const newStrikes = strikes + 1;
      setStrikes(newStrikes);
      setStreak(0);
      setFeedbackToast({
        isCorrect: false,
        message: getRandomEncouragement(false),
        streak: 0,
      });
      if (newStrikes >= 3) setIsGameOver(true);
    }
  };

  const handleNext = () => {
    markItemSeen('testament-sort', currentItem.id);
    setSelectedChoice(null);
    setHintUsed(false);
    setFeedbackToast(null);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleRestart = () => {
    setSelectedChoice(null);
    setHintUsed(false);
    setFeedbackToast(null);
    setActiveMilestone(null);
    setPool(buildPool());
    setCurrentIndex(0);
    setScore(0);
    setStrikes(0);
    setStreak(0);
    setIsGameOver(false);
    setShowSummary(false);
  };

  return (
    <>
      <HeaderBar
        onBack={() => setShowSummary(true)}
        streak={streak}
        bestStreak={bestStreak}
        score={score}
        strikes={strikes}
      />

      {feedbackToast && (
        <AnswerFeedbackBanner
          isCorrect={feedbackToast.isCorrect}
          message={feedbackToast.message}
          pointsEarned={feedbackToast.pointsEarned}
          streakCount={feedbackToast.streak}
        />
      )}

      {activeMilestone && (
        <StreakMilestoneModal
          milestone={activeMilestone}
          onDismiss={() => setActiveMilestone(null)}
        />
      )}

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

            let stateClass = 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200/90 dark:border-slate-700 border-b-slate-300 dark:border-b-slate-600 hover:border-slate-300';
            if (selectedChoice) {
              if (isCorrect) {
                stateClass = '!bg-emerald-500 !text-white !border-emerald-600 !border-b-emerald-700 shadow-md';
              } else if (isSelected) {
                stateClass = '!bg-rose-500 !text-white !border-rose-600 !border-b-rose-700 shadow-sm';
              } else {
                stateClass = 'opacity-40 bg-slate-100/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 border-b-slate-300';
              }
            } else if (isSelected) {
              stateClass = 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-400 border-b-cyan-600 ring-2 ring-cyan-400/30';
            }

            return (
              <button
                key={choice}
                type="button"
                disabled={!!selectedChoice}
                onClick={() => handleSelect(choice)}
                className={`p-3 sm:p-5 rounded-2xl border border-b-4 transition-all duration-150 flex flex-col items-center justify-center text-center shadow-xs select-none uppercase tracking-wider ${stateClass} ${
                  selectedChoice ? 'cursor-not-allowed' : 'cursor-pointer hover:-translate-y-0.5 active:translate-y-1 active:border-b-2'
                }`}
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

      {/* Practice Summary Modal (Across Game Over & Intentional End) */}
      <PracticeSummaryModal
        isOpen={isGameOver || showSummary}
        title="Practice Complete"
        subtitle="You sorted the sacred treasures of the Old and New Testaments!"
        icon="⚖️"
        score={score}
        bestStreak={bestStreak}
        onRestart={handleRestart}
        onExit={onDirectExit}
        onClose={!isGameOver ? () => setShowSummary(false) : undefined}
      />
    </>
  );
};

// ==========================================
// 3. FAKE-A-PROVERB SOLO PRACTICE
// ==========================================
const FakeAProverbSoloPractice: React.FC<{ onBack: () => void; onDirectExit: () => void; endTrigger?: number }> = ({ onBack, onDirectExit, endTrigger }) => {
  const { triggerHaptic } = useTheme();

  const buildPool = (): ProverbItem[] => {
    const dbContent = (gameRegistry.get('fake-a-proverb')?.content as any)?.proverbs as ProverbItem[] | undefined;
    const proverbs: ProverbItem[] = dbContent && dbContent.length > 0 ? dbContent : (proverbsData.proverbs as ProverbItem[]);
    const easy = getFreshPool<ProverbItem>(proverbs.filter((p: ProverbItem) => p.difficulty === 'easy'), 'proverb-easy');
    const medium = getFreshPool<ProverbItem>(proverbs.filter((p: ProverbItem) => p.difficulty === 'medium'), 'proverb-medium');
    const hard = getFreshPool<ProverbItem>(proverbs.filter((p: ProverbItem) => p.difficulty === 'hard'), 'proverb-hard');
    return [...easy, ...medium, ...hard];
  };

  const [pool, setPool] = useState<ProverbItem[]>(buildPool);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedEnding, setSelectedEnding] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [timer, setTimer] = useState(15);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [activeMilestone, setActiveMilestone] = useState<StreakMilestone | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<{ isCorrect: boolean; message: string; pointsEarned?: number; streak: number } | null>(null);

  useEffect(() => {
    if (endTrigger && endTrigger > 0) {
      setShowSummary(true);
    }
  }, [endTrigger]);

  const currentItem = pool[currentIndex % pool.length];

  const options = useMemo(() => {
    const others = pool
      .filter((p: ProverbItem) => p.id !== currentItem.id)
      .map((p: ProverbItem) => p.realEnding);
    const shuffledOthers = shuffle(others).slice(0, 3);
    return shuffle([currentItem.realEnding, ...shuffledOthers]);
  }, [currentItem, pool]);

  // Countdown timer
  useEffect(() => {
    if (selectedEnding || isGameOver || showSummary) return;
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
  }, [currentIndex, selectedEnding, isGameOver, showSummary]);

  const handleTimeOut = () => {
    if (selectedEnding) return;
    setSelectedEnding('__timeout__');
    soundManager.playWrong();
    triggerHaptic('heavy');
    const newStrikes = strikes + 1;
    setStrikes(newStrikes);
    setStreak(0);
    setFeedbackToast({
      isCorrect: false,
      message: getRandomEncouragement(false),
      streak: 0,
    });
    if (newStrikes >= 3) setIsGameOver(true);
  };

  const handleSelect = (ending: string) => {
    if (selectedEnding || isGameOver) return;
    setSelectedEnding(ending);

    const isCorrect = ending === currentItem.realEnding;
    if (isCorrect) {
      soundManager.playCorrect();
      triggerHaptic('medium');
      const pts = 100 + timer * 5 + streak * 10;
      setScore((prev) => prev + pts);
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > bestStreak) setBestStreak(nextStreak);

      const milestone = getStreakMilestone(nextStreak);
      if (milestone) {
        soundManager.playStreakMilestone(nextStreak);
        setActiveMilestone(milestone);
      } else {
        fireConfettiBurst(nextStreak >= 5 ? 'medium' : 'light');
      }

      setFeedbackToast({
        isCorrect: true,
        message: getRandomEncouragement(true),
        pointsEarned: pts,
        streak: nextStreak,
      });
    } else {
      soundManager.playWrong();
      triggerHaptic('heavy');
      const newStrikes = strikes + 1;
      setStrikes(newStrikes);
      setStreak(0);
      setFeedbackToast({
        isCorrect: false,
        message: getRandomEncouragement(false),
        streak: 0,
      });
      if (newStrikes >= 3) setIsGameOver(true);
    }
  };

  const handleNext = () => {
    markItemSeen('fake-a-proverb', currentItem.id);
    setSelectedEnding(null);
    setFeedbackToast(null);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleRestart = () => {
    setSelectedEnding(null);
    setFeedbackToast(null);
    setActiveMilestone(null);
    setPool(buildPool());
    setCurrentIndex(0);
    setScore(0);
    setStrikes(0);
    setStreak(0);
    setIsGameOver(false);
    setShowSummary(false);
  };

  return (
    <>
      <HeaderBar onBack={() => setShowSummary(true)} streak={streak} bestStreak={bestStreak} score={score} strikes={strikes} />

      {feedbackToast && (
        <AnswerFeedbackBanner
          isCorrect={feedbackToast.isCorrect}
          message={feedbackToast.message}
          pointsEarned={feedbackToast.pointsEarned}
          streakCount={feedbackToast.streak}
        />
      )}

      {activeMilestone && (
        <StreakMilestoneModal
          milestone={activeMilestone}
          onDismiss={() => setActiveMilestone(null)}
        />
      )}

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

      {/* Practice Summary Modal (Across Game Over & Intentional End) */}
      <PracticeSummaryModal
        isOpen={isGameOver || showSummary}
        title="Practice Complete"
        subtitle="You discerned true biblical wisdom from worldly wit!"
        icon="🕊️"
        score={score}
        bestStreak={bestStreak}
        onRestart={handleRestart}
        onExit={onDirectExit}
        onClose={!isGameOver ? () => setShowSummary(false) : undefined}
      />
    </>
  );
};

// ==========================================
// 4. TARES AMONG THE WHEAT SOLO PRACTICE
// ==========================================
const TaresSoloPractice: React.FC<{ onBack: () => void; onDirectExit: () => void; endTrigger?: number }> = ({ onBack, onDirectExit, endTrigger }) => {
  const { triggerHaptic } = useTheme();

  const buildPool = (): PassageItem[] => {
    const dbContent = (gameRegistry.get('tares-among-the-wheat')?.content as any)?.passages as PassageItem[] | undefined;
    const passages: PassageItem[] = dbContent && dbContent.length > 0 ? dbContent : (taresData.passages as PassageItem[]);
    const easy = getFreshPool<PassageItem>(passages.filter((p: PassageItem) => getPassageDifficulty(p as any) === 'easy'), 'tares-easy');
    const medium = getFreshPool<PassageItem>(passages.filter((p: PassageItem) => getPassageDifficulty(p as any) === 'medium'), 'tares-medium');
    const hard = getFreshPool<PassageItem>(passages.filter((p: PassageItem) => getPassageDifficulty(p as any) === 'hard'), 'tares-hard');
    return [...easy, ...medium, ...hard];
  };

  const [pool, setPool] = useState<PassageItem[]>(buildPool);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [timer, setTimer] = useState(15);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [activeMilestone, setActiveMilestone] = useState<StreakMilestone | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<{ isCorrect: boolean; message: string; pointsEarned?: number; streak: number } | null>(null);

  useEffect(() => {
    if (endTrigger && endTrigger > 0) {
      setShowSummary(true);
    }
  }, [endTrigger]);

  const currentPassage = pool[currentIndex % pool.length];

  const options = useMemo(() => {
    const wrong = shuffle(currentPassage.wrongGuesses).slice(0, 3);
    return shuffle([currentPassage.title, ...wrong]);
  }, [currentPassage]);

  // Countdown timer
  useEffect(() => {
    if (selectedTitle || isGameOver || showSummary) return;
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
  }, [currentIndex, selectedTitle, isGameOver, showSummary]);

  const handleTimeOut = () => {
    if (selectedTitle) return;
    setSelectedTitle('__timeout__');
    soundManager.playWrong();
    triggerHaptic('heavy');
    const newStrikes = strikes + 1;
    setStrikes(newStrikes);
    setStreak(0);
    setFeedbackToast({
      isCorrect: false,
      message: getRandomEncouragement(false),
      streak: 0,
    });
    if (newStrikes >= 3) setIsGameOver(true);
  };

  const handleSelect = (title: string) => {
    if (selectedTitle || isGameOver) return;
    setSelectedTitle(title);

    const isCorrect = title === currentPassage.title;
    if (isCorrect) {
      soundManager.playCorrect();
      triggerHaptic('medium');
      const pts = 100 + timer * 5 + streak * 10;
      setScore((prev) => prev + pts);
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > bestStreak) setBestStreak(nextStreak);

      const milestone = getStreakMilestone(nextStreak);
      if (milestone) {
        soundManager.playStreakMilestone(nextStreak);
        setActiveMilestone(milestone);
      } else {
        fireConfettiBurst(nextStreak >= 5 ? 'medium' : 'light');
      }

      setFeedbackToast({
        isCorrect: true,
        message: getRandomEncouragement(true),
        pointsEarned: pts,
        streak: nextStreak,
      });
    } else {
      soundManager.playWrong();
      triggerHaptic('heavy');
      const newStrikes = strikes + 1;
      setStrikes(newStrikes);
      setStreak(0);
      setFeedbackToast({
        isCorrect: false,
        message: getRandomEncouragement(false),
        streak: 0,
      });
      if (newStrikes >= 3) setIsGameOver(true);
    }
  };

  const handleNext = () => {
    markItemSeen('tares-among-the-wheat', currentPassage.id);
    setSelectedTitle(null);
    setFeedbackToast(null);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleRestart = () => {
    setSelectedTitle(null);
    setFeedbackToast(null);
    setActiveMilestone(null);
    setPool(buildPool());
    setCurrentIndex(0);
    setScore(0);
    setStrikes(0);
    setStreak(0);
    setIsGameOver(false);
    setShowSummary(false);
  };

  const difficulty = getPassageDifficulty(currentPassage as any);

  return (
    <>
      <HeaderBar onBack={() => setShowSummary(true)} streak={streak} bestStreak={bestStreak} score={score} strikes={strikes} />

      {feedbackToast && (
        <AnswerFeedbackBanner
          isCorrect={feedbackToast.isCorrect}
          message={feedbackToast.message}
          pointsEarned={feedbackToast.pointsEarned}
          streakCount={feedbackToast.streak}
        />
      )}

      {activeMilestone && (
        <StreakMilestoneModal
          milestone={activeMilestone}
          onDismiss={() => setActiveMilestone(null)}
        />
      )}

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
          {currentPassage.keywords.map((kw: string, i: number) => (
            <span key={i} className="px-3 py-1 rounded-full bg-[var(--surface-container)] text-[var(--on-container)] font-bold text-sm border border-[var(--border-tint)] flex items-center gap-1.5">
              <Icon name="wheat" size={14} className="text-amber-600 dark:text-amber-400" />
              <span>{kw}</span>
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

            return (
              <OptionCard
                key={title}
                label={title}
                index={idx}
                isSelected={isSelected}
                isCorrect={selectedTitle ? isReal : null}
                isRevealed={Boolean(selectedTitle)}
                disabled={Boolean(selectedTitle)}
                onClick={() => handleSelect(title)}
              />
            );
          })}
        </div>
      </div>

      {selectedTitle && (
        <Button variant="primary" size="hero" pill onClick={handleNext} className="w-full mt-2 shadow-md">
          Next Passage
        </Button>
      )}

      {/* Practice Summary Modal (Across Game Over & Intentional End) */}
      <PracticeSummaryModal
        isOpen={isGameOver || showSummary}
        title="Practice Complete"
        subtitle="You guarded the wheat and rooted out the deceptive tares!"
        icon="🌾"
        score={score}
        bestStreak={bestStreak}
        onRestart={handleRestart}
        onExit={onDirectExit}
        onClose={!isGameOver ? () => setShowSummary(false) : undefined}
      />
    </>
  );
};

// ==========================================
// 5. HOT COAL SOLO PRACTICE
// ==========================================
const HotCoalSoloPractice: React.FC<{ onBack: () => void; onDirectExit: () => void; endTrigger?: number }> = ({ onBack, onDirectExit, endTrigger }) => {
  const { triggerHaptic } = useTheme();

  const buildPool = (): HotCoalCategory[] => {
    const dbContent = (gameRegistry.get('hot-coal')?.content as any)?.categories as HotCoalCategory[] | undefined;
    const categories: HotCoalCategory[] = dbContent && dbContent.length > 0 ? dbContent : (hotCoalData.categories as HotCoalCategory[]);
    const easy = getFreshPool<HotCoalCategory>(categories.filter((c: HotCoalCategory) => c.difficulty === 'easy'), 'hot-coal-easy');
    const medium = getFreshPool<HotCoalCategory>(categories.filter((c: HotCoalCategory) => c.difficulty === 'medium'), 'hot-coal-medium');
    const hard = getFreshPool<HotCoalCategory>(categories.filter((c: HotCoalCategory) => c.difficulty === 'hard'), 'hot-coal-hard');
    return [...easy, ...medium, ...hard];
  };

  const [pool, setPool] = useState<HotCoalCategory[]>(buildPool);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [timer, setTimer] = useState(12);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [activeMilestone, setActiveMilestone] = useState<StreakMilestone | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<{ isCorrect: boolean; message: string; pointsEarned?: number; streak: number } | null>(null);

  useEffect(() => {
    if (endTrigger && endTrigger > 0) {
      setShowSummary(true);
    }
  }, [endTrigger]);

  const currentCategory = pool[currentIndex % pool.length];

  const options = useMemo(() => {
    const genuine = currentCategory.items[Math.floor(Math.random() * currentCategory.items.length)].name;
    const otherCategories = pool.filter((c: HotCoalCategory) => c.id !== currentCategory.id);
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
    if (selectedItem || isGameOver || showSummary) return;
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
  }, [currentIndex, selectedItem, isGameOver, showSummary]);

  const handleTimeOut = () => {
    if (selectedItem) return;
    setSelectedItem('__timeout__');
    soundManager.playWrong();
    triggerHaptic('heavy');
    const newStrikes = strikes + 1;
    setStrikes(newStrikes);
    setStreak(0);
    setFeedbackToast({
      isCorrect: false,
      message: getRandomEncouragement(false),
      streak: 0,
    });
    if (newStrikes >= 3) setIsGameOver(true);
  };

  const handleSelect = (name: string) => {
    if (selectedItem || isGameOver) return;
    setSelectedItem(name);

    const isCorrect = currentCategory.items.some((it: { name: string }) => it.name === name);
    if (isCorrect) {
      soundManager.playCorrect();
      triggerHaptic('medium');
      const pts = 100 + timer * 8 + streak * 10;
      setScore((prev) => prev + pts);
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > bestStreak) setBestStreak(nextStreak);

      const milestone = getStreakMilestone(nextStreak);
      if (milestone) {
        soundManager.playStreakMilestone(nextStreak);
        setActiveMilestone(milestone);
      } else {
        fireConfettiBurst(nextStreak >= 5 ? 'medium' : 'light');
      }

      setFeedbackToast({
        isCorrect: true,
        message: getRandomEncouragement(true),
        pointsEarned: pts,
        streak: nextStreak,
      });
    } else {
      soundManager.playWrong();
      triggerHaptic('heavy');
      const newStrikes = strikes + 1;
      setStrikes(newStrikes);
      setStreak(0);
      setFeedbackToast({
        isCorrect: false,
        message: getRandomEncouragement(false),
        streak: 0,
      });
      if (newStrikes >= 3) setIsGameOver(true);
    }
  };

  const handleNext = () => {
    markItemSeen('hot-coal', currentCategory.id);
    setSelectedItem(null);
    setFeedbackToast(null);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleRestart = () => {
    setSelectedItem(null);
    setFeedbackToast(null);
    setActiveMilestone(null);
    setPool(buildPool());
    setCurrentIndex(0);
    setScore(0);
    setStrikes(0);
    setStreak(0);
    setIsGameOver(false);
    setShowSummary(false);
  };

  return (
    <>
      <HeaderBar onBack={() => setShowSummary(true)} streak={streak} bestStreak={bestStreak} score={score} strikes={strikes} />

      {feedbackToast && (
        <AnswerFeedbackBanner
          isCorrect={feedbackToast.isCorrect}
          message={feedbackToast.message}
          pointsEarned={feedbackToast.pointsEarned}
          streakCount={feedbackToast.streak}
        />
      )}

      {activeMilestone && (
        <StreakMilestoneModal
          milestone={activeMilestone}
          onDismiss={() => setActiveMilestone(null)}
        />
      )}

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
            const isReal = currentCategory.items.some((it: { name: string }) => it.name === name);

            return (
              <OptionCard
                key={name}
                label={name}
                index={idx}
                isSelected={isSelected}
                isCorrect={selectedItem ? isReal : null}
                isRevealed={Boolean(selectedItem)}
                disabled={Boolean(selectedItem)}
                onClick={() => handleSelect(name)}
              />
            );
          })}
        </div>
      </div>

      {selectedItem && (
        <Button variant="primary" size="hero" pill onClick={handleNext} className="w-full mt-2 shadow-md">
          Next Category
        </Button>
      )}

      {/* Practice Summary Modal (Across Game Over & Intentional End) */}
      <PracticeSummaryModal
        isOpen={isGameOver || showSummary}
        title="Practice Complete"
        subtitle="You stood firm under the altar fire of the Sanctuary!"
        icon="🔥"
        score={score}
        bestStreak={bestStreak}
        onRestart={handleRestart}
        onExit={onDirectExit}
        onClose={!isGameOver ? () => setShowSummary(false) : undefined}
      />
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
        <div className="px-3 py-1.5 rounded-full bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/40 shadow-xs flex items-center">
          <LifelineHearts strikes={strikes} size={18} />
        </div>
      )}
      <div className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-[var(--surface-container)] text-amber-600 dark:text-amber-400 border border-[var(--border-tint)]/60 shadow-xs flex items-center gap-1">
        <span>{streak}</span>
        <Icon name="flame" size={13} className="text-amber-500" />
      </div>
      <div className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-[var(--surface-container)] text-[var(--on-container-variant)] border border-[var(--border-tint)]/60 shadow-xs flex items-center gap-1">
        <span>Best: {bestStreak}</span>
        <Icon name="trophy" size={13} className="text-amber-500" />
      </div>
    </div>
  </div>
);


// ==========================================
// 6. SHELF RUSH SOLO PRACTICE
// ==========================================
const ShelfRushSoloPractice: React.FC<{ onDirectExit: () => void }> = ({ onDirectExit }) => {
  return (
    <div className="w-full">
      <ShelfRushPlayerView onExit={onDirectExit} />
    </div>
  );
};

// ==========================================
// 7. FOUR SIGNS SOLO PRACTICE
// ==========================================
const FourSignsSoloPractice: React.FC<{ onBack: () => void; onDirectExit: () => void; endTrigger?: number }> = ({ onBack, onDirectExit, endTrigger }) => {
  const { triggerHaptic } = useTheme();

  const buildPool = (): FourSignsPuzzle[] => {
    const dbContent = gameRegistry.get('four-signs')?.content as FourSignsPuzzle[] | undefined;
    const base: FourSignsPuzzle[] = dbContent && dbContent.length > 0 ? dbContent : allFourSignsPuzzles;
    const t1 = getFreshPool<FourSignsPuzzle>(base.filter((i) => i.tier === 1), 'four-signs-t1');
    const t2 = getFreshPool<FourSignsPuzzle>(base.filter((i) => i.tier === 2), 'four-signs-t2');
    const t3 = getFreshPool<FourSignsPuzzle>(base.filter((i) => i.tier === 3), 'four-signs-t3');
    const t4 = getFreshPool<FourSignsPuzzle>(base.filter((i) => i.tier === 4), 'four-signs-t4');
    return [...t1, ...t2, ...t3, ...t4];
  };

  const [pool, setPool] = useState<FourSignsPuzzle[]>(buildPool);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [timer, setTimer] = useState(18);
  const [maxTimer, setMaxTimer] = useState(18);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [activeMilestone, setActiveMilestone] = useState<StreakMilestone | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<{ isCorrect: boolean; message: string; pointsEarned?: number; streak: number } | null>(null);

  useEffect(() => {
    if (endTrigger && endTrigger > 0) {
      setShowSummary(true);
    }
  }, [endTrigger]);

  const currentItem = pool[currentIndex % pool.length];

  const options = useMemo(() => {
    return shuffle([currentItem.answer, ...currentItem.distractors]);
  }, [currentItem]);

  // Timer countdown
  useEffect(() => {
    if (selectedOption || isGameOver || showSummary) return;
    const limit = calculateFourSignsTimeLimit(currentItem.tier);
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
  }, [currentIndex, selectedOption, isGameOver, currentItem, showSummary]);

  const handleTimeOut = () => {
    if (selectedOption) return;
    setSelectedOption('__timeout__');
    soundManager.playWrong();
    triggerHaptic('heavy');
    const newStrikes = strikes + 1;
    setStrikes(newStrikes);
    setStreak(0);
    setFeedbackToast({
      isCorrect: false,
      message: getRandomEncouragement(false),
      streak: 0,
    });
    if (newStrikes >= 3) setIsGameOver(true);
  };

  const handleSelect = (opt: string) => {
    if (selectedOption || isGameOver) return;
    setSelectedOption(opt);

    const isCorrect = opt.toUpperCase() === currentItem.answer.toUpperCase();
    if (isCorrect) {
      soundManager.playCorrect();
      triggerHaptic('medium');
      const { score: earned } = calculateFourSignsScore(
        currentItem.tier,
        Math.max(1, maxTimer - timer),
        maxTimer,
        true,
        false,
        streak,
        null
      );

      setScore((prev) => prev + earned);
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > bestStreak) setBestStreak(nextStreak);

      const milestone = getStreakMilestone(nextStreak);
      if (milestone) {
        soundManager.playStreakMilestone(nextStreak);
        setActiveMilestone(milestone);
      } else {
        fireConfettiBurst(nextStreak >= 5 ? 'medium' : 'light');
      }

      setFeedbackToast({
        isCorrect: true,
        message: getRandomEncouragement(true),
        pointsEarned: earned,
        streak: nextStreak,
      });
    } else {
      soundManager.playWrong();
      triggerHaptic('heavy');
      const newStrikes = strikes + 1;
      setStrikes(newStrikes);
      setStreak(0);
      setFeedbackToast({
        isCorrect: false,
        message: getRandomEncouragement(false),
        streak: 0,
      });
      if (newStrikes >= 3) setIsGameOver(true);
    }
  };

  const handleNext = () => {
    markItemSeen(`four-signs-t${currentItem.tier}`, currentItem.id);
    setSelectedOption(null);
    setFeedbackToast(null);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleRestart = () => {
    setPool(buildPool());
    setCurrentIndex(0);
    setSelectedOption(null);
    setStreak(0);
    setScore(0);
    setStrikes(0);
    setIsGameOver(false);
    setShowSummary(false);
    setFeedbackToast(null);
  };

  const isAnswered = selectedOption !== null;

  return (
    <div className="flex flex-col gap-5 animate-fadeIn">
      <HeaderBar onBack={() => setShowSummary(true)} streak={streak} bestStreak={bestStreak} score={score} strikes={strikes} />

      <Card variant="hero" padding="lg" className="flex flex-col gap-4 text-center shadow-md">
        <div className="flex items-center justify-between border-b border-[var(--border-tint)]/60 pb-3">
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400">
            {currentItem.category} • Tier {currentItem.tier}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[var(--on-container-variant)] flex items-center gap-1">
              <Icon name="timer" size={13} />
              <span>{timer}s</span>
            </span>
          </div>
        </div>

        {/* 4 Signs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-1">
          {currentItem.clues.map((clue, idx) => (
            <FourSignClueCard key={idx} clue={clue} index={idx} revealed={true} size="sm" />
          ))}
        </div>
      </Card>

      {/* Answer feedback banner */}
      {feedbackToast && (
        <AnswerFeedbackBanner
          isCorrect={feedbackToast.isCorrect}
          message={feedbackToast.message}
          pointsEarned={feedbackToast.pointsEarned}
          streakCount={feedbackToast.streak}
        />
      )}

      {/* Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((opt) => {
          const isSelected = selectedOption === opt;
          const isCorrect = opt.toUpperCase() === currentItem.answer.toUpperCase();

          return (
            <OptionCard
              key={opt}
              label={opt}
              index={options.indexOf(opt)}
              isSelected={isSelected}
              isCorrect={isAnswered ? isCorrect : null}
              isRevealed={isAnswered}
              disabled={isAnswered}
              onClick={() => handleSelect(opt)}
            />
          );
        })}
      </div>

      {/* Post-Answer Info & Next Button */}
      {isAnswered && (
        <Card variant="surface" padding="md" className="flex flex-col gap-2.5 text-center bg-[var(--surface-container)] border border-[var(--border-tint)] animate-fadeIn">
          <div className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1.5">
            <Icon name="book-open" size={13} />
            <span>{currentItem.ref}</span>
          </div>
          <div className="text-xs text-[var(--on-container-variant)] italic">
            “{currentItem.why}”
          </div>
          <Button variant="primary" size="md" pill className="mt-2 w-full max-w-xs mx-auto shadow-md" onClick={handleNext}>
            Next Sign Puzzle →
          </Button>
        </Card>
      )}

      {activeMilestone && (
        <StreakMilestoneModal
          milestone={activeMilestone}
          onDismiss={() => setActiveMilestone(null)}
        />
      )}

      {/* Practice Summary Modal (Across Game Over & Intentional End) */}
      <PracticeSummaryModal
        isOpen={isGameOver || showSummary}
        title="Practice Complete"
        subtitle="You decoded the prophetic signs across holy scripture!"
        icon="🧩"
        score={score}
        bestStreak={bestStreak}
        onRestart={handleRestart}
        onExit={onDirectExit}
        onClose={!isGameOver ? () => setShowSummary(false) : undefined}
      />
    </div>
  );
};

// ==========================================
// 8. SCRIBE'S TILES SOLO PRACTICE
// ==========================================
const ScribesTilesSoloPractice: React.FC<{ onBack: () => void; onDirectExit: () => void; endTrigger?: number }> = ({ onBack, onDirectExit, endTrigger }) => {
  const { triggerHaptic } = useTheme();

  const buildPool = (): ScribesTilesWord[] => {
    const dbContent = gameRegistry.get('scribes-tiles')?.content as ScribesTilesWord[] | undefined;
    const base: ScribesTilesWord[] = dbContent && dbContent.length > 0 ? dbContent : allScribesTilesWords;
    const t1 = getFreshPool<ScribesTilesWord>(base.filter((i) => i.tier === 1), 'scribes-tiles-t1');
    const t2 = getFreshPool<ScribesTilesWord>(base.filter((i) => i.tier === 2), 'scribes-tiles-t2');
    const t3 = getFreshPool<ScribesTilesWord>(base.filter((i) => i.tier === 3), 'scribes-tiles-t3');
    const t4 = getFreshPool<ScribesTilesWord>(base.filter((i) => i.tier === 4), 'scribes-tiles-t4');
    return [...t1, ...t2, ...t3, ...t4];
  };

  const [pool, setPool] = useState<ScribesTilesWord[]>(buildPool);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [timer, setTimer] = useState(25);
  const [maxTimer, setMaxTimer] = useState(25);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [activeMilestone, setActiveMilestone] = useState<StreakMilestone | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<{ isCorrect: boolean; message: string; pointsEarned?: number; streak: number } | null>(null);

  useEffect(() => {
    if (endTrigger && endTrigger > 0) {
      setShowSummary(true);
    }
  }, [endTrigger]);

  const currentItem = pool[currentIndex % pool.length];

  const [rack, setRack] = useState<ScribeTile[]>(() => createPlayerRack(currentItem, 'solo'));
  const [placed, setPlaced] = useState<(ScribeTile | null)[]>(() => Array(currentItem.length).fill(null));
  const [isSolved, setIsSolved] = useState(false);
  const [shakeError, setShakeError] = useState(false);

  // Reset tiles when current word changes
  useEffect(() => {
    setRack(createPlayerRack(currentItem, 'solo'));
    setPlaced(Array(currentItem.length).fill(null));
    setIsSolved(false);
    setShakeError(false);
  }, [currentIndex, currentItem]);

  // Timer countdown
  useEffect(() => {
    if (isSolved || isGameOver || showSummary) return;
    const limit = calculateScribesTilesTimeLimit(currentItem.tier);
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
  }, [currentIndex, isSolved, isGameOver, currentItem, showSummary]);

  const handleTimeOut = () => {
    if (isSolved) return;
    setIsSolved(true);
    soundManager.playWrong();
    triggerHaptic('heavy');
    const newStrikes = strikes + 1;
    setStrikes(newStrikes);
    setStreak(0);
    setFeedbackToast({
      isCorrect: false,
      message: getRandomEncouragement(false),
      streak: 0,
    });
    if (newStrikes >= 3) setIsGameOver(true);
  };

  const handlePlaceTile = (tileId: string) => {
    if (isSolved || isGameOver) return;
    const tileIdx = rack.findIndex((t) => t.id === tileId);
    if (tileIdx === -1) return;

    const slotIdx = placed.findIndex((s) => s === null);
    if (slotIdx === -1) return;

    triggerHaptic('selection');
    const tile = rack[tileIdx];
    const newRack = [...rack];
    newRack.splice(tileIdx, 1);

    const newPlaced = [...placed];
    newPlaced[slotIdx] = tile;

    setRack(newRack);
    setPlaced(newPlaced);
    setShakeError(false);

    // Auto verify if all placed
    const isComplete = newPlaced.every((s) => s !== null);
    const spelled = newPlaced.map((s) => s?.letter || '').join('');
    if (isComplete && spelled.toUpperCase() === currentItem.answer.toUpperCase()) {
      handleSolveSuccess(newPlaced);
    }
  };

  const handleRemoveSlot = (slotIdx: number) => {
    if (isSolved || isGameOver) return;
    const tile = placed[slotIdx];
    if (!tile) return;

    triggerHaptic('light');
    const newPlaced = [...placed];
    newPlaced[slotIdx] = null;
    setPlaced(newPlaced);
    setRack([...rack, tile]);
    setShakeError(false);
  };

  const handleClear = () => {
    if (isSolved || isGameOver) return;
    triggerHaptic('medium');
    const placedOnly = placed.filter((t): t is ScribeTile => t !== null);
    setRack([...rack, ...placedOnly]);
    setPlaced(Array(currentItem.length).fill(null));
  };

  const handleShuffle = () => {
    if (isSolved || isGameOver) return;
    triggerHaptic('light');
    setRack(shuffle([...rack]));
  };

  const handleSolveSuccess = (_currentPlaced: (ScribeTile | null)[]) => {
    setIsSolved(true);
    soundManager.playCorrect();
    triggerHaptic('medium');
    const earned = calculateScribesTilesScore(
      currentItem.tier,
      currentItem.length,
      Math.max(1, maxTimer - timer),
      maxTimer,
      true,
      false,
      streak,
      0
    );

    setScore((prev) => prev + earned);
    const nextStreak = streak + 1;
    setStreak(nextStreak);
    if (nextStreak > bestStreak) setBestStreak(nextStreak);

    const milestone = getStreakMilestone(nextStreak);
    if (milestone) {
      soundManager.playStreakMilestone(nextStreak);
      setActiveMilestone(milestone);
    } else {
      fireConfettiBurst(nextStreak >= 5 ? 'medium' : 'light');
    }

    setFeedbackToast({
      isCorrect: true,
      message: getRandomEncouragement(true),
      pointsEarned: earned,
      streak: nextStreak,
    });
  };

  const handleSubmit = () => {
    if (isSolved || isGameOver) return;
    const spelled = placed.map((s) => s?.letter || '').join('');
    if (spelled.toUpperCase() === currentItem.answer.toUpperCase()) {
      handleSolveSuccess(placed);
    } else {
      soundManager.playWrong();
      triggerHaptic('heavy');
      setShakeError(true);
    }
  };

  const handleNext = () => {
    markItemSeen(`scribes-tiles-t${currentItem.tier}`, currentItem.id);
    setFeedbackToast(null);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleRestart = () => {
    setPool(buildPool());
    setCurrentIndex(0);
    setStreak(0);
    setScore(0);
    setStrikes(0);
    setIsGameOver(false);
    setShowSummary(false);
    setFeedbackToast(null);
  };

  const isAllPlaced = placed.length > 0 && placed.every((s) => s !== null);

  return (
    <div className="flex flex-col gap-5 animate-fadeIn">
      <HeaderBar onBack={() => setShowSummary(true)} streak={streak} bestStreak={bestStreak} score={score} strikes={strikes} />

      <Card variant="hero" padding="lg" className="flex flex-col gap-4 text-center shadow-md">
        <div className="flex items-center justify-between border-b border-[var(--border-tint)]/60 pb-3">
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-orange-500/15 text-orange-600 dark:text-orange-400">
            {currentItem.category} • Tier {currentItem.tier}
          </span>
          <span className="text-xs font-mono font-bold text-[var(--on-container-variant)] flex items-center gap-1">
            <Icon name="timer" size={13} />
            <span>{timer}s</span>
          </span>
        </div>

        {/* Clue Card */}
        <p className="font-serif italic text-base sm:text-lg font-bold text-[var(--on-container)]">
          “{currentItem.clue}”
        </p>

        {/* Answer Slots */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 my-1">
          {placed.map((slot, idx) => (
            <button
              key={idx}
              onClick={() => slot && handleRemoveSlot(idx)}
              disabled={isSolved || !slot}
              className={`w-11 h-14 sm:w-13 sm:h-16 rounded-xl flex items-center justify-center font-black text-xl sm:text-2xl transition-all cursor-pointer ${
                slot
                  ? 'bg-gradient-to-b from-amber-200 to-amber-400 dark:from-amber-600 dark:to-amber-800 text-amber-950 dark:text-white shadow-md border-b-3 border-amber-600 dark:border-amber-950 active:scale-95'
                  : 'bg-[var(--surface-container)] border-2 border-dashed border-[var(--border-tint)]/80 text-[var(--on-container-variant)] opacity-50'
              } ${shakeError ? 'border-rose-500 animate-shake' : ''}`}
            >
              {slot?.letter || ''}
            </button>
          ))}
        </div>
      </Card>

      {/* Answer feedback banner */}
      {feedbackToast && (
        <AnswerFeedbackBanner
          isCorrect={feedbackToast.isCorrect}
          message={feedbackToast.message}
          pointsEarned={feedbackToast.pointsEarned}
          streakCount={feedbackToast.streak}
        />
      )}

      {/* Rack & Controls */}
      {!isSolved ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleShuffle}
              className="px-3.5 py-1.5 rounded-full bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] text-[var(--on-container)] text-xs font-bold flex items-center gap-1.5 border border-[var(--border-tint)] shadow-sm active:scale-95 cursor-pointer"
            >
              Shuffle
            </button>
            <button
              onClick={handleClear}
              className="px-3.5 py-1.5 rounded-full bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] text-[var(--on-container)] text-xs font-bold flex items-center gap-1.5 border border-[var(--border-tint)] shadow-sm active:scale-95 cursor-pointer"
            >
              Clear
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 p-3 sm:p-4 rounded-2xl bg-[var(--surface-container)] border border-[var(--border-tint)] shadow-sm">
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
            <Button variant="primary" size="lg" pill className="w-full shadow-lg" onClick={handleSubmit}>
              Submit Word
            </Button>
          )}
        </div>
      ) : (
        <Card variant="surface" padding="md" className="flex flex-col gap-2.5 text-center bg-[var(--surface-container)] border border-[var(--border-tint)] animate-fadeIn">
          <div className="text-sm font-black text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1.5">
            <span>Word: {currentItem.answer}</span>
            <span>•</span>
            <Icon name="book-open" size={14} />
            <span>{currentItem.ref}</span>
          </div>
          <Button variant="primary" size="md" pill className="mt-2 w-full max-w-xs mx-auto shadow-md" onClick={handleNext}>
            Next Scribe Word →
          </Button>
        </Card>
      )}

      {activeMilestone && (
        <StreakMilestoneModal
          milestone={activeMilestone}
          onDismiss={() => setActiveMilestone(null)}
        />
      )}

      {/* Practice Summary Modal (Across Game Over & Intentional End) */}
      <PracticeSummaryModal
        isOpen={isGameOver || showSummary}
        title="Practice Complete"
        subtitle="You transcribed the sacred words of the biblical manuscripts!"
        icon="✍️"
        score={score}
        bestStreak={bestStreak}
        onRestart={handleRestart}
        onExit={onDirectExit}
        onClose={!isGameOver ? () => setShowSummary(false) : undefined}
      />
    </div>
  );
};

