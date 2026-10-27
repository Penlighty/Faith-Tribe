import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GamifiedProgressBar } from './GamifiedProgressBar';
import { GamifiedMascot, BiblicalCharacterId, BIBLICAL_CHARACTERS } from './GamifiedMascot';
import { GamifiedFeedbackSheet } from './GamifiedFeedbackSheet';
import { GamifiedButton } from './GamifiedButton';
import { GamifiedStatCards, GamifiedWeekStreak } from './GamifiedStatCards';
import { soundManager } from '../../engine/services/audio';
import { useTheme } from '../../theme/ThemeContext';
import { fireConfettiBurst } from '../ui/StreakCelebration';

// Content imports from our rich pools
import proverbsData from '../../games/fake-a-proverb/content.json';
import { allWhoSaidItems, allTestamentSortItems, allFourSignsPuzzles, allScribesTilesWords } from '../../engine/content/loader';
import { FourSignClueCard } from '../../games/four-signs/icons';
import { PathNodeData } from './GamifiedPathNode';
import { getChronicleDay, ChronicleDay } from '../../engine/journey/chronicleCurriculum';

export interface GamifiedLessonScreenProps {
  node?: PathNodeData;
  dayNumber?: number;
  onClose: () => void;
  onFinish: (xpEarned: number, accuracy: number, dayNumber?: number) => void;
}

interface QuestionItem {
  prompt: string;
  speechText: string;
  category: string;
  characterId: BiblicalCharacterId;
  options: string[];
  answer: string;
  ref: string;
  why?: string;
  fourSignsClues?: string[];
}

export const GamifiedLessonScreen: React.FC<GamifiedLessonScreenProps> = ({
  node,
  dayNumber,
  onClose,
  onFinish,
}) => {
  const { triggerHaptic } = useTheme();

  const chronicleDay: ChronicleDay | null = useMemo(() => {
    if (dayNumber) {
      return getChronicleDay(dayNumber);
    }
    return null;
  }, [dayNumber]);

  // Build 3 mini-questions tailored to this day or node
  const questions: QuestionItem[] = useMemo(() => {
    if (chronicleDay) {
      return chronicleDay.questions.map((q) => ({
        ...q,
        characterId: chronicleDay.characterId,
        // Ensure options are shuffled
        options: [...q.options].sort(() => 0.5 - Math.random()),
      }));
    }

    if (!node) {
      return [];
    }

    if (node.gameId === 'four-signs') {
      const puzzles = allFourSignsPuzzles.slice(0, 3);
      const cast: BiblicalCharacterId[] = ['david', 'miryam', 'ruth'];
      return puzzles.map((p, idx) => ({
        prompt: 'What do these four signs represent?',
        speechText: `Decipher the symbols!`,
        category: p.category,
        characterId: cast[idx % cast.length],
        options: [p.answer, ...p.distractors].sort(() => 0.5 - Math.random()),
        answer: p.answer,
        ref: p.ref,
        why: p.why,
        fourSignsClues: p.clues,
      }));
    } else if (node.gameId === 'who-said') {
      const items = allWhoSaidItems.slice(0, 3);
      const cast: BiblicalCharacterId[] = ['moshe', 'eliyah', 'deborah'];
      return items.map((i, idx) => ({
        prompt: 'Who spoke these words in scripture?',
        speechText: `"${i.quote}"`,
        category: 'Speaker Trivia',
        characterId: cast[idx % cast.length],
        options: i.options,
        answer: i.answer,
        ref: i.ref,
        why: i.note,
      }));
    } else if (node.gameId === 'scribes-tiles') {
      const words = allScribesTilesWords.slice(0, 3);
      const cast: BiblicalCharacterId[] = ['ruth', 'david', 'esther'];
      return words.map((w, idx) => {
        // create choices with 3 plausible distractors
        const decoys = ['TEMPLE', 'COVENANT', 'PROPHET', 'BLESSING', 'WISDOM', 'PARCHMENT', 'ALTAR'].filter(
          (d) => d !== w.answer.toUpperCase()
        );
        const opts = [w.answer.toUpperCase(), decoys[0], decoys[1], decoys[2]].sort(() => 0.5 - Math.random());
        return {
          prompt: 'Identify the sacred word from the clue:',
          speechText: `"${w.clue}"`,
          category: w.category,
          characterId: cast[idx % cast.length],
          options: opts,
          answer: w.answer.toUpperCase(),
          ref: w.ref,
          why: `Length: ${w.answer.length} letters`,
        };
      });
    } else {
      // Default: Fake-a-Proverb / Wisdom
      const proverbs = proverbsData.proverbs.slice(0, 3);
      const cast: BiblicalCharacterId[] = ['deborah', 'moshe', 'esther'];
      const distractors = [
        'leadeth only to shame and bitterness.',
        'perisheth like the morning dew.',
        'flee when no man pursueth.',
        'hasteneth to do evil in the gates.',
      ];
      return proverbs.map((p, pIdx) => {
        const opts = [
          p.realEnding,
          distractors[pIdx % distractors.length],
          distractors[(pIdx + 1) % distractors.length],
          distractors[(pIdx + 2) % distractors.length],
        ].sort(() => 0.5 - Math.random());
        return {
          prompt: 'Complete the ancient proverb with true wisdom:',
          speechText: `"${p.firstHalf}..."`,
          category: 'Book of Proverbs',
          characterId: cast[pIdx % cast.length],
          options: opts,
          answer: p.realEnding,
          ref: p.reference,
          why: 'Solomonic Wisdom',
        };
      });
    }
  }, [node]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedbackState, setFeedbackState] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [correctCount, setCorrectCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const startTimeRef = useRef(Date.now());

  const currentQ = questions[currentIdx];
  const progressRatio = currentIdx / questions.length;

  const handleSelectOption = (opt: string) => {
    if (feedbackState !== 'idle') return;
    triggerHaptic('selection');
    setSelectedOption(opt);
  };

  const handleCheckAnswer = () => {
    if (!selectedOption || feedbackState !== 'idle') return;

    const isMatch = selectedOption.trim().toUpperCase() === currentQ.answer.trim().toUpperCase();
    if (isMatch) {
      soundManager.playCorrect();
      triggerHaptic('medium');
      setFeedbackState('correct');
      setCorrectCount((prev) => prev + 1);
    } else {
      soundManager.playWrong();
      triggerHaptic('heavy');
      setFeedbackState('incorrect');
    }
  };

  const handleContinue = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setFeedbackState('idle');
    } else {
      // Finished all questions!
      soundManager.playStreakMilestone(7);
      fireConfettiBurst('high');
      setIsCompleted(true);
    }
  };

  // Completion Screen
  if (isCompleted) {
    const timeTakenSec = Math.max(8, Math.round((Date.now() - startTimeRef.current) / 1000));
    const accuracy = Math.round((correctCount / questions.length) * 100);

    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-zinc-950 flex flex-col justify-between p-6 select-none animate-fadeIn overflow-y-auto">
        <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full gap-5 text-center my-auto">
          {/* Celebrating Biblical Character */}
          <GamifiedMascot character={currentQ?.characterId || 'david'} pose="cheer" size={170} />

          {/* Yellow Headline */}
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-black text-[var(--c-yellow)] tracking-tight">
              Lesson complete!
            </h2>
            <p className="text-xs font-bold text-[var(--c-text-2)] uppercase tracking-wider">
              {BIBLICAL_CHARACTERS[currentQ?.characterId || 'david'].name} celebrates your progress!
            </p>
          </div>

          {/* 3 Stat Summary Cards */}
          <GamifiedStatCards
            xpEarned={node?.xpReward || chronicleDay?.xpReward || 30}
            accuracyPercent={accuracy}
            timeTakenSec={timeTakenSec}
          />

          {/* Week Streak Row */}
          <div className="w-full mt-1">
            <GamifiedWeekStreak />
          </div>
        </div>

        {/* Pinned Bottom CTA */}
        <div className="w-full max-w-sm mx-auto pb-4">
          <GamifiedButton
            variant="blue"
            onClick={() => onFinish(node?.xpReward || chronicleDay?.xpReward || 30, accuracy, dayNumber)}
          >
            CONTINUE
          </GamifiedButton>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-zinc-950 flex flex-col justify-between p-4 sm:p-6 select-none overflow-hidden animate-fadeIn">
      {/* Top Bar with Glossy Progress Bar & Close X */}
      <div className="w-full max-w-xl mx-auto pt-2">
        <GamifiedProgressBar
          progress={progressRatio}
          onClose={onClose}
          isPerfect={correctCount === currentIdx}
          color="orange"
        />
      </div>

      {/* Main Task Area: One job per screen */}
      <div className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full gap-5 my-auto">
        {/* Story & Scripture Header for 365 Chronicle */}
        {chronicleDay ? (
          <div className="flex flex-col items-start gap-1 pb-1 border-b border-[var(--c-border)]">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span
                  className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: chronicleDay.actColor }}
                >
                  Day {chronicleDay.dayNumber} • {chronicleDay.actTitle}
                </span>
                <span className="text-xs font-bold text-zinc-500 font-mono">
                  {chronicleDay.scriptureRef}
                </span>
              </div>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-[var(--c-orange)] font-mono border border-orange-200 dark:border-orange-900/50">
                Question {currentIdx + 1} of {questions.length}
              </span>
            </div>
            <h3 className="text-base font-black text-[var(--c-text)]">
              {chronicleDay.storyTitle}
            </h3>
          </div>
        ) : (
          <div className="flex items-center justify-end w-full pb-1 border-b border-[var(--c-border)]">
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-[var(--c-orange)] font-mono border border-orange-200 dark:border-orange-900/50">
              Question {currentIdx + 1} of {questions.length}
            </span>
          </div>
        )}

        {/* Instruction Headline */}
        <h2 className="text-xl sm:text-2xl font-black text-[var(--c-text)] tracking-tight text-left leading-snug">
          {currentQ.prompt}
        </h2>

        {/* Four Signs Pictogram Grid (if applicable) */}
        {currentQ.fourSignsClues && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-1">
            {currentQ.fourSignsClues.map((clue, idx) => (
              <FourSignClueCard key={idx} clue={clue} index={idx} revealed={true} size="sm" />
            ))}
          </div>
        )}

        {/* Biblical Character + Speech Bubble Row */}
        <div className="flex items-start gap-3 sm:gap-4 my-1">
          <div className="shrink-0">
            <GamifiedMascot
              character={currentQ.characterId}
              pose={feedbackState === 'correct' ? 'cheer' : feedbackState === 'incorrect' ? 'sad' : selectedOption ? 'thinking' : 'idle'}
              size={90}
            />
          </div>

          <div className="relative bg-white dark:bg-zinc-900 border-2 border-[var(--c-border)] p-4 rounded-2xl shadow-sm max-w-md">
            {/* Left-pointing bubble tail */}
            <div className="absolute top-6 -left-2.5 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[10px] border-r-white dark:border-r-zinc-900" />
            
            {/* Character Attribution Header */}
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-[var(--c-primary)]">
                {BIBLICAL_CHARACTERS[currentQ.characterId].name}
              </span>
              <span className="text-[11px] font-bold text-[var(--c-text-2)]">
                • {BIBLICAL_CHARACTERS[currentQ.characterId].title}
              </span>
            </div>

            <p className="font-serif italic font-bold text-base sm:text-lg text-[var(--c-text)] leading-snug">
              {currentQ.speechText}
            </p>
          </div>
        </div>

        {/* Answer Choice Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          {currentQ.options.map((opt) => {
            const isSelected = selectedOption === opt;
            let tileClass = 'p-4 rounded-2xl font-bold text-base transition-all border-2 cursor-pointer text-left ';
            if (isSelected) {
              tileClass += 'bg-[var(--c-blue-tint)] border-[var(--c-blue)] text-[var(--c-blue)] shadow-[0_4px_0_var(--c-blue-lip)] translate-y-[-2px]';
            } else {
              tileClass += 'bg-white dark:bg-zinc-900 border-[var(--c-border)] text-[var(--c-text)] shadow-[0_4px_0_var(--c-border)] hover:bg-[var(--c-surface-muted)] active:translate-y-[2px] active:shadow-none';
            }

            return (
              <button
                key={opt}
                type="button"
                onClick={() => handleSelectOption(opt)}
                disabled={feedbackState !== 'idle'}
                className={tileClass}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pinned Bottom CTA (Replaced by feedback sheet upon check) */}
      <div className="w-full max-w-xl mx-auto pb-4 pt-2">
        <GamifiedButton
          variant="green"
          disabled={!selectedOption || feedbackState !== 'idle'}
          onClick={handleCheckAnswer}
        >
          CHECK
        </GamifiedButton>
      </div>

      {/* Bottom Feedback Sheet */}
      {feedbackState !== 'idle' && (
        <GamifiedFeedbackSheet
          isCorrect={feedbackState === 'correct'}
          character={currentQ.characterId}
          correctAnswer={currentQ.answer}
          explanation={`${currentQ.ref} ${currentQ.why ? `• ${currentQ.why}` : ''}`}
          onContinue={handleContinue}
        />
      )}
    </div>
  );
};
