import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GamifiedProgressBar } from './GamifiedProgressBar';
import { GamifiedMascot, BiblicalCharacterId, BIBLICAL_CHARACTERS } from './GamifiedMascot';
import { GamifiedFeedbackSheet } from './GamifiedFeedbackSheet';
import { GamifiedButton } from './GamifiedButton';
import { GamifiedStatCards, GamifiedWeekStreak } from './GamifiedStatCards';
import { soundManager } from '../../engine/services/audio';
import { useTheme } from '../../theme/ThemeContext';
import { fireConfettiBurst } from '../ui/StreakCelebration';
import { BookOpen, Ban, Shuffle, RotateCcw, Delete } from 'lucide-react';

// Content imports from our rich pools
import proverbsData from '../../games/fake-a-proverb/content.json';
import { allWhoSaidItems, allTestamentSortItems, allFourSignsPuzzles, allScribesTilesWords } from '../../engine/content/loader';
import { FourSignClueCard } from '../../games/four-signs/icons';
import { PathNodeData } from './GamifiedPathNode';
import { getChronicleDay, ChronicleDay, ChronicleQuestionType } from '../../engine/journey/chronicleCurriculum';

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
  questionType?: ChronicleQuestionType;
  fourSignsClues?: string[];
  wordLength?: number;
}

export interface ScribeTileItem {
  id: string;
  letter: string;
}

function generateScribesTilesRack(answer: string, seed: number): ScribeTileItem[] {
  const cleanAnswer = answer.toUpperCase().replace(/[^A-Z]/g, '');
  const answerLetters = cleanAnswer.split('');
  
  // Pick 2-3 plausible decoy letters that are not in the answer or complementary
  const pool = ['A', 'E', 'I', 'O', 'U', 'R', 'S', 'T', 'L', 'N', 'D', 'M', 'P', 'B', 'H', 'Y'];
  const decoyCount = cleanAnswer.length <= 5 ? 3 : cleanAnswer.length <= 7 ? 2 : 1;
  const decoys: string[] = [];
  for (let i = 0; i < decoyCount; i++) {
    const char = pool[(seed * 7 + i * 11 + cleanAnswer.length) % pool.length];
    decoys.push(char);
  }

  const all = [...answerLetters, ...decoys].map((letter, idx) => ({
    id: `tile_${idx}_${letter}_${seed}`,
    letter,
  }));

  // Shuffle letters
  return all.sort(() => 0.5 - Math.random());
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

  // Build questions tailored to this day or node, randomized across game types
  const questions: QuestionItem[] = useMemo(() => {
    if (chronicleDay) {
      // Fisher-Yates shuffle the 10 questions so each session has a randomized order of game types!
      const shuffled = [...chronicleDay.questions].sort(() => 0.5 - Math.random());
      return shuffled.map((q) => {
        const isBibleOrNot = q.questionType === 'bible-or-not' || q.options.includes('In the Bible');
        const opts = isBibleOrNot
          ? ['In the Bible', 'Not in the Bible']
          : [...q.options].sort(() => 0.5 - Math.random());

        return {
          ...q,
          characterId: chronicleDay.characterId,
          options: opts,
        };
      });
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

  // Interactive Scribe's Tiles Rack & Placed Slots State
  const [scribesPlaced, setScribesPlaced] = useState<(ScribeTileItem | null)[]>([]);
  const [scribesRack, setScribesRack] = useState<ScribeTileItem[]>([]);

  const currentQ = questions[currentIdx];
  const progressRatio = currentIdx / questions.length;

  // Initialize or reset Scribe's Tiles state when question changes
  useEffect(() => {
    if (currentQ?.questionType === 'scribes-tiles') {
      const clean = currentQ.answer.toUpperCase().replace(/[^A-Z]/g, '');
      const rack = generateScribesTilesRack(clean, currentIdx);
      setScribesRack(rack);
      setScribesPlaced(new Array(clean.length).fill(null));
      setSelectedOption(null);
    } else {
      setScribesPlaced([]);
      setScribesRack([]);
    }
  }, [currentIdx, currentQ]);

  const handlePlaceScribesTile = (tile: ScribeTileItem) => {
    if (feedbackState !== 'idle') return;
    const emptyIdx = scribesPlaced.findIndex((s) => s === null);
    if (emptyIdx === -1) return;
    triggerHaptic('selection');
    const newPlaced = [...scribesPlaced];
    newPlaced[emptyIdx] = tile;
    setScribesPlaced(newPlaced);
    setScribesRack((prev) => prev.filter((t) => t.id !== tile.id));

    const formed = newPlaced.map((s) => s?.letter || '').join('');
    if (newPlaced.every((s) => s !== null)) {
      setSelectedOption(formed);
    } else {
      setSelectedOption(null);
    }
  };

  const handleRemoveScribesTile = (slotIdx: number) => {
    if (feedbackState !== 'idle') return;
    const tile = scribesPlaced[slotIdx];
    if (!tile) return;
    triggerHaptic('light');
    const newPlaced = [...scribesPlaced];
    newPlaced[slotIdx] = null;
    setScribesPlaced(newPlaced);
    setScribesRack((prev) => [...prev, tile]);
    setSelectedOption(null);
  };

  const handleScribesBackspace = () => {
    if (feedbackState !== 'idle') return;
    for (let i = scribesPlaced.length - 1; i >= 0; i--) {
      if (scribesPlaced[i] !== null) {
        handleRemoveScribesTile(i);
        break;
      }
    }
  };

  const handleScribesClear = () => {
    if (feedbackState !== 'idle') return;
    triggerHaptic('medium');
    const tilesToReturn = scribesPlaced.filter((s): s is ScribeTileItem => s !== null);
    setScribesRack((prev) => [...prev, ...tilesToReturn]);
    setScribesPlaced(new Array(scribesPlaced.length).fill(null));
    setSelectedOption(null);
  };

  const handleScribesShuffle = () => {
    if (feedbackState !== 'idle') return;
    triggerHaptic('light');
    setScribesRack((prev) => [...prev].sort(() => 0.5 - Math.random()));
  };

  const handleSelectOption = (opt: string) => {
    if (feedbackState !== 'idle') return;
    triggerHaptic('selection');
    setSelectedOption(opt);
  };

  const handleCheckAnswer = () => {
    if (!selectedOption || feedbackState !== 'idle') return;

    const targetAnswer =
      currentQ.questionType === 'scribes-tiles'
        ? currentQ.answer.replace(/[^A-Z]/g, '').trim().toUpperCase()
        : currentQ.answer.trim().toUpperCase();

    const isMatch = selectedOption.trim().toUpperCase() === targetAnswer;
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
    <div className="fixed inset-0 z-50 bg-white dark:bg-zinc-950 flex flex-col select-none animate-fadeIn">
      {/* Top Bar – fixed height, never scrolls */}
      <div className="w-full max-w-xl mx-auto px-4 pt-3 pb-1 shrink-0">
        <GamifiedProgressBar
          progress={progressRatio}
          onClose={onClose}
          isPerfect={correctCount === currentIdx}
          color="orange"
        />
      </div>

      {/* ── Scrollable body with options pushed down above the Check button ── */}
      <div className="flex-1 overflow-y-auto overscroll-contain flex flex-col">
        <div className="max-w-xl mx-auto px-4 py-3 flex-1 flex flex-col justify-between w-full">

          {/* Top Section: Header, Prompt, Clues, Mascot Quote with breathing space */}
          <div className="flex flex-col gap-3.5 sm:gap-4">
            {/* Minimal meta line: scripture ref + question number */}
            <div className="flex items-center justify-between text-zinc-400 text-xs font-bold pt-1">
              <span className="font-mono text-zinc-500">
                {chronicleDay ? chronicleDay.scriptureRef : currentQ.category}
              </span>
              <span className="font-mono font-black text-[var(--c-orange)] text-[11px] bg-orange-100 dark:bg-orange-950/60 px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-900/50">
                {currentIdx + 1} / {questions.length}
              </span>
            </div>

            {/* The Question Prompt - Main Focus: Bigger, Bolder & Highly Readable */}
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--c-text)] tracking-tight leading-tight sm:leading-snug py-1">
              {currentQ.prompt}
            </h2>

            {/* Four Signs Pictogram Grid */}
            {currentQ.fourSignsClues && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {currentQ.fourSignsClues.map((clue, idx) => (
                  <FourSignClueCard key={idx} clue={clue} index={idx} revealed={true} size="sm" />
                ))}
              </div>
            )}

            {/* Scribe's Tiles Answer Slots Tray (Interactive) */}
            {currentQ.questionType === 'scribes-tiles' && (
              <div className="flex flex-col items-center gap-2 pt-2">
                <div className="flex flex-wrap items-center justify-center gap-2 p-3 sm:p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border-2 border-amber-500/30 w-full shadow-inner">
                  {scribesPlaced.map((slot, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => slot && handleRemoveScribesTile(idx)}
                      disabled={feedbackState !== 'idle' || !slot}
                      aria-label={slot ? `Remove letter ${slot.letter}` : `Empty slot ${idx + 1}`}
                      className={`w-10 h-14 sm:w-12 sm:h-16 min-w-[40px] min-h-[56px] rounded-xl flex items-center justify-center font-black text-xl sm:text-2xl transition-all cursor-pointer select-none ${
                        slot
                          ? 'bg-gradient-to-b from-amber-200 to-amber-400 dark:from-amber-600 dark:to-amber-800 text-amber-950 dark:text-white shadow-md border-b-[3px] border-amber-600 dark:border-amber-950 active:scale-95'
                          : 'bg-white dark:bg-zinc-900 border-2 border-dashed border-amber-300 dark:border-amber-700 text-zinc-400 opacity-60'
                      }`}
                    >
                      {slot ? slot.letter : <span className="opacity-0 select-none">_</span>}
                    </button>
                  ))}
                </div>
                <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                  {feedbackState !== 'idle'
                    ? 'Word evaluated'
                    : 'Tap a placed letter to return it to your rack'}
                </span>
              </div>
            )}

            {/* Clue/Quote Bubble with Mascot – clean, breathing space */}
            {currentQ.speechText && (
              <div className="flex items-center gap-3 pt-1">
                <div className="shrink-0">
                  <GamifiedMascot
                    character={currentQ.characterId}
                    pose={feedbackState === 'correct' ? 'cheer' : feedbackState === 'incorrect' ? 'sad' : selectedOption ? 'thinking' : 'idle'}
                    size={56}
                  />
                </div>

                <div className="relative bg-white dark:bg-zinc-900 border-2 border-[var(--c-border)] px-3.5 py-2.5 rounded-2xl shadow-xs flex-1 min-w-0">
                  <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-white dark:border-r-zinc-900" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-[var(--c-primary)] block mb-0.5">
                    {BIBLICAL_CHARACTERS[currentQ.characterId].name}
                  </span>
                  <p className="font-serif italic font-bold text-sm sm:text-base text-[var(--c-text)] leading-snug">
                    {currentQ.speechText}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Answer Area anchored cleanly just above the Check button */}
          <div className="mt-auto pt-6 pb-2 w-full">
            {currentQ.questionType === 'scribes-tiles' ? (
              <div className="flex flex-col gap-3">
                {/* Shuffle, Clear, Backspace */}
                <div className="flex items-center justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleScribesShuffle}
                    disabled={feedbackState !== 'idle'}
                    className="px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-700 shadow-xs active:scale-95 cursor-pointer disabled:opacity-40"
                  >
                    <Shuffle size={13} />
                    <span>Shuffle</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleScribesClear}
                    disabled={feedbackState !== 'idle' || !scribesPlaced.some((s) => s !== null)}
                    className="px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-700 shadow-xs active:scale-95 cursor-pointer disabled:opacity-40"
                  >
                    <RotateCcw size={13} />
                    <span>Clear</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleScribesBackspace}
                    disabled={feedbackState !== 'idle' || !scribesPlaced.some((s) => s !== null)}
                    className="px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-700 shadow-xs active:scale-95 cursor-pointer disabled:opacity-40"
                  >
                    <Delete size={13} />
                    <span>Backspace</span>
                  </button>
                </div>

                {/* Letter Tile Rack */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 text-center">
                    Your Tile Rack
                  </span>
                  <div className="flex flex-wrap items-center justify-center gap-2 p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-amber-50/50 to-amber-100/50 dark:from-zinc-900 dark:to-zinc-900 border border-amber-200/80 dark:border-amber-900/40 shadow-xs min-h-[64px]">
                    {scribesRack.map((tile) => (
                      <button
                        key={tile.id}
                        type="button"
                        onClick={() => handlePlaceScribesTile(tile)}
                        disabled={feedbackState !== 'idle' || !scribesPlaced.some((s) => s === null)}
                        className="w-10 h-14 sm:w-12 sm:h-16 min-w-[40px] min-h-[56px] rounded-xl bg-gradient-to-b from-amber-100 to-amber-200 dark:from-amber-700 dark:to-amber-900 text-amber-950 dark:text-amber-100 font-black text-xl sm:text-2xl shadow-md border-b-[3px] border-amber-400 dark:border-amber-950 active:scale-95 hover:brightness-105 transition-all cursor-pointer flex items-center justify-center disabled:opacity-40 select-none"
                      >
                        {tile.letter}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : currentQ.questionType === 'bible-or-not' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentQ.options.map((opt) => {
                  const isSelected = selectedOption === opt;
                  const isBible = opt.toLowerCase().includes('in the bible') && !opt.toLowerCase().includes('not');
                  let tileClass = 'p-4 rounded-2xl font-black text-base transition-all border-2 cursor-pointer flex items-center justify-center gap-2 shadow-sm ';
                  if (isSelected) {
                    tileClass += isBible
                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-[0_4px_0_#047857] -translate-y-0.5'
                      : 'bg-rose-500 text-white border-rose-600 shadow-[0_4px_0_#BE123C] -translate-y-0.5';
                  } else {
                    tileClass += 'bg-white dark:bg-zinc-900 border-[var(--c-border)] text-[var(--c-text)] shadow-[0_4px_0_var(--c-border)] hover:bg-[var(--c-surface-muted)] active:translate-y-[2px] active:shadow-none';
                  }
                  return (
                    <button key={opt} type="button" onClick={() => handleSelectOption(opt)} disabled={feedbackState !== 'idle'} className={tileClass}>
                      {isBible ? <BookOpen size={20} className="shrink-0" /> : <Ban size={20} className="shrink-0" />}
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentQ.options.map((opt) => {
                  const isSelected = selectedOption === opt;
                  let tileClass = 'p-3.5 rounded-2xl font-bold text-[15px] sm:text-base leading-snug transition-all border-2 cursor-pointer text-left ';
                  if (isSelected) {
                    tileClass += 'bg-[var(--c-blue-tint)] border-[var(--c-blue)] text-[var(--c-blue)] shadow-[0_4px_0_var(--c-blue-lip)] -translate-y-0.5';
                  } else {
                    tileClass += 'bg-white dark:bg-zinc-900 border-[var(--c-border)] text-[var(--c-text)] shadow-[0_4px_0_var(--c-border)] hover:bg-[var(--c-surface-muted)] active:translate-y-[2px] active:shadow-none';
                  }
                  return (
                    <button key={opt} type="button" onClick={() => handleSelectOption(opt)} disabled={feedbackState !== 'idle'} className={tileClass}>
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Pinned bottom CTA – never scrolls */}
      <div className="w-full max-w-xl mx-auto px-4 pb-5 pt-2 shrink-0">
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
