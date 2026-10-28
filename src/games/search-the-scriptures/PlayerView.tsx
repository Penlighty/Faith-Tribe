import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { GameViewProps } from '../../engine/types';
import { SearchTheScripturesState, SearchLevel, CellCoord } from './types';
import { generateWordSearchGrid, getLineBetweenCells } from './generator';
import { calculateWordSearchPoints, LEVEL_CLEARED_BONUS, EARLY_RANK_BONUS } from './scoring';
import { soundManager } from '../../engine/services/audio';
import { useTheme } from '../../theme/ThemeContext';
import { Icon } from '../../design/icons';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import rawLevels from './content.json';

export interface WordOverlayColor {
  id: string;
  name: string;
  stroke: string;        // SVG capsule stroke with transparency
  bgClass: string;       // Matching background for solved word badge
  borderClass: string;
  textClass: string;
  badgeHex: string;
}

// 10 distinct, vibrant transparent overlay colors matching the user's reference design
export const WORD_OVERLAY_COLORS: WordOverlayColor[] = [
  {
    id: 'coral',
    name: 'Coral Pink',
    stroke: 'rgba(255, 142, 158, 0.65)',
    bgClass: 'bg-[#FF8E9E]/35 text-[#9F1239] dark:text-[#FFE4E6] border-[#FF8E9E]',
    borderClass: 'border-[#FF8E9E]',
    textClass: 'text-[#9F1239] dark:text-[#FFE4E6]',
    badgeHex: '#FF8E9E',
  },
  {
    id: 'lime',
    name: 'Lime Green',
    stroke: 'rgba(163, 230, 53, 0.65)',
    bgClass: 'bg-[#A3E635]/35 text-[#3F6212] dark:text-[#ECFCCB] border-[#A3E635]',
    borderClass: 'border-[#A3E635]',
    textClass: 'text-[#3F6212] dark:text-[#ECFCCB]',
    badgeHex: '#A3E635',
  },
  {
    id: 'cyan',
    name: 'Sky Cyan',
    stroke: 'rgba(56, 189, 248, 0.65)',
    bgClass: 'bg-[#38BDF8]/35 text-[#075985] dark:text-[#E0F2FE] border-[#38BDF8]',
    borderClass: 'border-[#38BDF8]',
    textClass: 'text-[#075985] dark:text-[#E0F2FE]',
    badgeHex: '#38BDF8',
  },
  {
    id: 'lilac',
    name: 'Lilac Purple',
    stroke: 'rgba(192, 132, 252, 0.65)',
    bgClass: 'bg-[#C084FC]/35 text-[#6B21A8] dark:text-[#F3E8FF] border-[#C084FC]',
    borderClass: 'border-[#C084FC]',
    textClass: 'text-[#6B21A8] dark:text-[#F3E8FF]',
    badgeHex: '#C084FC',
  },
  {
    id: 'blue',
    name: 'Soft Blue',
    stroke: 'rgba(96, 165, 250, 0.65)',
    bgClass: 'bg-[#60A5FA]/35 text-[#1E40AF] dark:text-[#DBEAFE] border-[#60A5FA]',
    borderClass: 'border-[#60A5FA]',
    textClass: 'text-[#1E40AF] dark:text-[#DBEAFE]',
    badgeHex: '#60A5FA',
  },
  {
    id: 'peach',
    name: 'Warm Peach',
    stroke: 'rgba(253, 186, 116, 0.70)',
    bgClass: 'bg-[#FDBA74]/40 text-[#9A3412] dark:text-[#FFEDD5] border-[#FDBA74]',
    borderClass: 'border-[#FDBA74]',
    textClass: 'text-[#9A3412] dark:text-[#FFEDD5]',
    badgeHex: '#FDBA74',
  },
  {
    id: 'yellow',
    name: 'Yellow Sun',
    stroke: 'rgba(250, 204, 21, 0.65)',
    bgClass: 'bg-[#FACC15]/35 text-[#854D0E] dark:text-[#FEF9C3] border-[#FACC15]',
    borderClass: 'border-[#FACC15]',
    textClass: 'text-[#854D0E] dark:text-[#FEF9C3]',
    badgeHex: '#FACC15',
  },
  {
    id: 'mint',
    name: 'Mint Teal',
    stroke: 'rgba(52, 211, 153, 0.65)',
    bgClass: 'bg-[#34D399]/35 text-[#065F46] dark:text-[#D1FAE5] border-[#34D399]',
    borderClass: 'border-[#34D399]',
    textClass: 'text-[#065F46] dark:text-[#D1FAE5]',
    badgeHex: '#34D399',
  },
  {
    id: 'periwinkle',
    name: 'Periwinkle',
    stroke: 'rgba(129, 140, 248, 0.65)',
    bgClass: 'bg-[#818CF8]/35 text-[#3730A3] dark:text-[#E0E7FF] border-[#818CF8]',
    borderClass: 'border-[#818CF8]',
    textClass: 'text-[#3730A3] dark:text-[#E0E7FF]',
    badgeHex: '#818CF8',
  },
  {
    id: 'rose',
    name: 'Rose Magenta',
    stroke: 'rgba(244, 114, 182, 0.65)',
    bgClass: 'bg-[#F472B6]/35 text-[#9D174D] dark:text-[#FCE7F3] border-[#F472B6]',
    borderClass: 'border-[#F472B6]',
    textClass: 'text-[#9D174D] dark:text-[#FCE7F3]',
    badgeHex: '#F472B6',
  },
];

export interface SolvedWordOverlay {
  word: string;
  start: CellCoord;
  end: CellCoord;
  colorIndex: number;
}

export interface SearchTheScripturesPlayerViewProps extends Partial<GameViewProps<SearchTheScripturesState>> {
  onScoreAwarded?: (score: number) => void;
  onExit?: () => void;
}

export const SearchTheScripturesPlayerView: React.FC<SearchTheScripturesPlayerViewProps> = ({
  state,
  playerId = 'solo_disciple',
  player,
  dispatchIntent,
  onScoreAwarded,
  onExit,
}) => {
  const { triggerHaptic } = useTheme();

  // Levels list from state or content
  const levels: SearchLevel[] = useMemo(() => {
    return state?.levels && state.levels.length > 0 ? state.levels : (rawLevels as SearchLevel[]);
  }, [state?.levels]);

  // Current player progress
  const serverProg = state?.playerProgress?.[playerId];
  const [localLevelIndex, setLocalLevelIndex] = useState<number>(0);
  const [localScore, setLocalScore] = useState<number>(0);
  const [localFoundWords, setLocalFoundWords] = useState<string[]>([]);
  const [localStreak, setLocalStreak] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const activeLevelIndex = serverProg?.currentLevelIndex ?? localLevelIndex;
  const currentLevel = levels[activeLevelIndex % levels.length] || levels[0];
  const currentScore = serverProg?.score ?? localScore;
  const foundWords = serverProg?.foundWordsByLevel?.[activeLevelIndex] ?? localFoundWords;

  // Active grid generation for current level
  const generatedGrid = useMemo(() => {
    return generateWordSearchGrid(currentLevel.words, currentLevel.gridSize);
  }, [currentLevel]);

  // Solved word overlays (start, end, colorIndex)
  const [solvedOverlays, setSolvedOverlays] = useState<SolvedWordOverlay[]>([]);

  // Selection & dragging state
  const [startCell, setStartCell] = useState<CellCoord | null>(null);
  const [hoverCell, setHoverCell] = useState<CellCoord | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [shakeError, setShakeError] = useState<boolean>(false);
  const [feedbackToast, setFeedbackToast] = useState<{ text: string; points?: number; type: 'success' | 'error' } | null>(null);

  const lastFoundTimeRef = useRef<number>(Date.now());
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // Sync solved overlays when level or foundWords change
  useEffect(() => {
    setSolvedOverlays((prev) => {
      const next = [...prev];
      foundWords.forEach((fw, idx) => {
        if (!next.some((o) => o.word === fw)) {
          const placed = generatedGrid.placedWords.find((pw) => pw.word === fw);
          if (placed) {
            next.push({
              word: fw,
              start: placed.start,
              end: placed.end,
              colorIndex: idx % WORD_OVERLAY_COLORS.length,
            });
          }
        }
      });
      return next;
    });
  }, [foundWords, generatedGrid.placedWords]);

  // Clear solved overlays on level change
  useEffect(() => {
    setSolvedOverlays([]);
  }, [activeLevelIndex]);

  // Compute currently selected line of cells during drag
  const selectedCells = useMemo<CellCoord[]>(() => {
    if (!startCell) return [];
    if (!hoverCell) return [startCell];
    return getLineBetweenCells(startCell, hoverCell) || [startCell];
  }, [startCell, hoverCell]);

  // Read word from current selection
  const selectedWordString = useMemo(() => {
    if (selectedCells.length === 0) return '';
    return selectedCells.map(([r, c]) => generatedGrid.grid[r]?.[c] || '').join('');
  }, [selectedCells, generatedGrid.grid]);

  // Target score status
  const targetScore = currentLevel.targetScore;
  const isTargetReached = currentScore >= targetScore || foundWords.length >= currentLevel.words.length;
  const allWordsFound = foundWords.length >= currentLevel.words.length;

  // Clear toast feedback after delay
  useEffect(() => {
    if (feedbackToast) {
      const t = setTimeout(() => setFeedbackToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [feedbackToast]);

  // Map pointer client coordinates directly to grid cell [row, col]
  const getCellFromPointer = useCallback((clientX: number, clientY: number): CellCoord | null => {
    if (!gridContainerRef.current) return null;
    const rect = gridContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (x < 0 || x > rect.width || y < 0 || y > rect.height) return null;

    const size = generatedGrid.size;
    const col = Math.floor((x / rect.width) * size);
    const row = Math.floor((y / rect.height) * size);

    if (row < 0 || row >= size || col < 0 || col >= size) return null;
    return [row, col];
  }, [generatedGrid.size]);

  // Evaluate candidate selection upon drag completion
  const evaluateSelection = useCallback((cells: CellCoord[], fromCell: CellCoord, toCell: CellCoord) => {
    if (cells.length < 2) {
      setStartCell(null);
      setHoverCell(null);
      return;
    }

    const candidateForward = cells.map(([r, c]) => generatedGrid.grid[r]?.[c] || '').join('');
    const candidateBackward = [...cells].reverse().map(([r, c]) => generatedGrid.grid[r]?.[c] || '').join('');

    // Check if matches any placed word in this level
    let matchedWord: string | null = null;
    let actualStart = fromCell;
    let actualEnd = toCell;

    for (const w of currentLevel.words) {
      const upper = w.toUpperCase();
      if (upper === candidateForward) {
        matchedWord = upper;
        actualStart = fromCell;
        actualEnd = toCell;
        break;
      } else if (upper === candidateBackward) {
        matchedWord = upper;
        actualStart = toCell;
        actualEnd = fromCell;
        break;
      }
    }

    if (matchedWord) {
      if (foundWords.includes(matchedWord)) {
        triggerHaptic('selection');
        setFeedbackToast({ text: `Already uncovered: ${matchedWord}`, type: 'error' });
      } else {
        // Discovered a new word!
        const now = Date.now();
        const timeToFindSec = Math.round((now - lastFoundTimeRef.current) / 1000);
        lastFoundTimeRef.current = now;

        const nextStreak = localStreak + 1;
        setLocalStreak(nextStreak);
        const pts = calculateWordSearchPoints(matchedWord, timeToFindSec, nextStreak);
        const earned = pts.totalPoints;

        soundManager.playCorrect();
        triggerHaptic('medium');

        const newFound = [...foundWords, matchedWord];
        setLocalFoundWords(newFound);
        const nextScore = currentScore + earned;
        setLocalScore(nextScore);

        // Add colored capsule overlay for this word
        const nextColorIndex = solvedOverlays.length % WORD_OVERLAY_COLORS.length;
        setSolvedOverlays((prev) => [
          ...prev,
          {
            word: matchedWord!,
            start: actualStart,
            end: actualEnd,
            colorIndex: nextColorIndex,
          },
        ]);

        setFeedbackToast({
          text: `Found: ${matchedWord}!`,
          points: earned,
          type: 'success',
        });

        if (dispatchIntent) {
          dispatchIntent('WORD_FOUND', {
            word: matchedWord,
            levelIndex: activeLevelIndex,
            timeToFindSec,
            playerName: player?.name || 'Disciple',
          });
        }

        if (onScoreAwarded) {
          onScoreAwarded(earned);
        }

        // Level completed bonus check
        if (newFound.length >= currentLevel.words.length) {
          soundManager.playStreakMilestone(5);
          const bonus = LEVEL_CLEARED_BONUS;
          setLocalScore((s) => s + bonus);
          if (onScoreAwarded) onScoreAwarded(bonus);
        }
      }
    } else {
      // Wrong word attempt
      soundManager.playWrong();
      triggerHaptic('heavy');
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
      setFeedbackToast({ text: 'Not in Scripture list', type: 'error' });
    }

    setStartCell(null);
    setHoverCell(null);
  }, [
    generatedGrid.grid,
    currentLevel.words,
    foundWords,
    localStreak,
    currentScore,
    solvedOverlays.length,
    dispatchIntent,
    activeLevelIndex,
    player?.name,
    onScoreAwarded,
    triggerHaptic,
  ]);

  // Pointer drag event handlers on the grid surface
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const cell = getCellFromPointer(e.clientX, e.clientY);
    if (!cell) return;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // fallback
    }

    setStartCell(cell);
    setHoverCell(cell);
    setIsDragging(true);
    triggerHaptic('light');
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !startCell) return;
    const cell = getCellFromPointer(e.clientX, e.clientY);
    if (!cell) return;

    const [r1, c1] = startCell;
    const [r2, c2] = cell;
    const dr = r2 - r1;
    const dc = c2 - c1;

    // Only update if in a valid straight direction (horizontal, vertical, or 45-degree diagonal)
    if (dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc)) {
      if (!hoverCell || hoverCell[0] !== r2 || hoverCell[1] !== c2) {
        setHoverCell([r2, c2]);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // fallback
    }
    setIsDragging(false);

    if (startCell && hoverCell) {
      const line = getLineBetweenCells(startCell, hoverCell);
      if (line && line.length >= 2) {
        evaluateSelection(line, startCell, hoverCell);
      }
    }

    setStartCell(null);
    setHoverCell(null);
  };

  const handlePointerCancel = () => {
    setIsDragging(false);
    setStartCell(null);
    setHoverCell(null);
  };

  // Next level navigation
  const handleAdvanceLevel = () => {
    triggerHaptic('selection');
    soundManager.playChime();
    const nextIdx = activeLevelIndex + 1;
    if (nextIdx < levels.length) {
      setLocalLevelIndex(nextIdx);
      setLocalFoundWords([]);
      setSolvedOverlays([]);
      setStartCell(null);
      setHoverCell(null);
      lastFoundTimeRef.current = Date.now();

      if (dispatchIntent) {
        dispatchIntent('ADVANCE_LEVEL', { targetLevelIndex: nextIdx });
      }
    } else {
      setIsFinished(true);
    }
  };

  // Claim rank early in competitive match
  const handleClaimRank = () => {
    triggerHaptic('selection');
    soundManager.playStreakMilestone(5);
    setIsFinished(true);
    const bonus = EARLY_RANK_BONUS;
    setLocalScore((s) => s + bonus);
    if (onScoreAwarded) onScoreAwarded(bonus);

    if (dispatchIntent) {
      dispatchIntent('CLAIM_RANK', { playerName: player?.name || 'Disciple' });
    }
  };

  const gridSize = generatedGrid.size;

  return (
    <div className="w-full flex flex-col items-center gap-4 select-none touch-none pb-6 animate-fadeIn">
      {/* Top Header Card: Level Theme, Scripture, and Score Target */}
      <Card variant="tonal" padding="md" className="w-full flex flex-col gap-2.5 border border-[var(--border-tint)]">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[var(--primary-action)] text-[var(--primary-action-text)] font-black text-xs flex items-center justify-center">
              {currentLevel.level}
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-[var(--on-container)]">
                {currentLevel.theme}
              </h2>
              <p className="text-xs font-semibold text-[var(--primary-action)]">
                {currentLevel.scripture}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--on-container-variant)]">
                Target Score
              </span>
              <span className="font-mono text-sm sm:text-base font-black text-[var(--on-container)]">
                {currentScore} / {targetScore} pts
              </span>
            </div>
            {localStreak > 1 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-xs font-black flex items-center gap-1">
                <Icon name="bolt" size={12} /> {localStreak}x
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar towards level target */}
        <div className="w-full h-2 rounded-full bg-[var(--surface-container-high)] overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              isTargetReached ? 'bg-emerald-500' : 'bg-[var(--primary-action)]'
            }`}
            style={{ width: `${Math.min(100, Math.round((currentScore / targetScore) * 100))}%` }}
          />
        </div>

        <p className="text-xs text-[var(--on-container-variant)] italic leading-tight">
          "{currentLevel.clue}"
        </p>
      </Card>

      {/* Target Reached Action Banner */}
      {isTargetReached && (
        <div className="w-full p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-between gap-3 animate-scaleUp">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <Icon name="check" size={18} />
            </span>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-black text-emerald-950 dark:text-emerald-100 truncate">
                Target Reached ({currentScore} pts)!
              </span>
              <span className="text-[10px] text-emerald-800 dark:text-emerald-300 truncate">
                {allWordsFound
                  ? 'All sacred words found in this level!'
                  : 'You may advance or keep finding words for bonus points.'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeLevelIndex < levels.length - 1 && (
              <Button
                variant="success"
                size="sm"
                pill
                onClick={handleAdvanceLevel}
                rightIcon={<Icon name="arrow-right" size={14} />}
                className="font-bold text-xs"
              >
                Next Level
              </Button>
            )}

            <Button
              variant="tonal"
              size="sm"
              pill
              onClick={handleClaimRank}
              leftIcon={<Icon name="crown" size={14} />}
              className="font-bold text-xs"
            >
              Lock In Rank
            </Button>
          </div>
        </div>
      )}

      {/* Floating feedback toast */}
      {feedbackToast && (
        <div
          className={`px-4 py-2 rounded-full text-xs font-black shadow-lg flex items-center gap-1.5 animate-bounce ${
            feedbackToast.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-rose-600 text-white'
          }`}
        >
          <Icon name={feedbackToast.type === 'success' ? 'check' : 'close'} size={14} />
          <span>{feedbackToast.text}</span>
          {feedbackToast.points && <span>(+{feedbackToast.points} pts)</span>}
        </div>
      )}

      {/* Interactive Word Search Grid Container with SVG Transparent Capsule Overlays */}
      <div
        ref={gridContainerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        className={`relative p-2.5 sm:p-4 rounded-3xl bg-[var(--surface-card)] border-2 border-[var(--border-tint)] shadow-lg transition-transform select-none touch-none cursor-crosshair ${
          shakeError ? 'animate-shake' : ''
        }`}
      >
        {/* SVG Capsule Layer: Draws beautiful rounded pills connecting words */}
        <svg
          className="absolute inset-2.5 sm:inset-4 pointer-events-none z-0"
          style={{ width: 'calc(100% - 20px)', height: 'calc(100% - 20px)' }}
          viewBox={`0 0 ${gridSize * 100} ${gridSize * 100}`}
        >
          {/* Solved words transparent capsule lines */}
          {solvedOverlays.map((item) => {
            const color = WORD_OVERLAY_COLORS[item.colorIndex % WORD_OVERLAY_COLORS.length];
            const x1 = item.start[1] * 100 + 50;
            const y1 = item.start[0] * 100 + 50;
            const x2 = item.end[1] * 100 + 50;
            const y2 = item.end[0] * 100 + 50;

            return (
              <line
                key={`${item.word}_${x1}_${y1}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={color.stroke}
                strokeWidth={76}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })}

          {/* Active live drag capsule line following user gesture */}
          {isDragging && startCell && hoverCell && (
            <line
              x1={startCell[1] * 100 + 50}
              y1={startCell[0] * 100 + 50}
              x2={hoverCell[1] * 100 + 50}
              y2={hoverCell[0] * 100 + 50}
              stroke="rgba(99, 102, 241, 0.55)"
              strokeWidth={76}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-pulse"
            />
          )}
        </svg>

        {/* Crisp Letters Grid: Sits cleanly on top of the colorful transparent capsule overlays */}
        <div
          className="grid gap-1 sm:gap-1.5 relative z-10 pointer-events-none"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          }}
        >
          {generatedGrid.grid.map((row, r) =>
            row.map((char, c) => {
              const cellKey = `${r},${c}`;
              return (
                <div
                  key={cellKey}
                  className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center font-mono text-xs sm:text-base md:text-lg font-black text-slate-900 dark:text-slate-100 transition-colors select-none"
                >
                  {char}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Selected word preview bubble */}
      {selectedWordString && (
        <div className="px-4 py-1.5 rounded-full bg-[var(--surface-container-high)] border border-[var(--primary-action)]/50 text-[var(--primary-action)] font-mono text-sm font-black tracking-widest uppercase animate-scaleUp">
          {selectedWordString}
        </div>
      )}

      {/* Sacred Words Checklist: Overlayed with the exact same color it was solved with */}
      <Card variant="tonal" padding="md" className="w-full flex flex-col gap-2.5 border border-[var(--border-tint)]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--on-container-variant)] flex items-center gap-1.5">
            <Icon name="search" size={14} /> Sacred Words ({foundWords.length}/{currentLevel.words.length})
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {currentLevel.words.map((w) => {
            const upper = w.toUpperCase();
            const isFound = foundWords.includes(upper);
            const solvedItem = solvedOverlays.find((o) => o.word === upper);
            const overlayColor = solvedItem
              ? WORD_OVERLAY_COLORS[solvedItem.colorIndex % WORD_OVERLAY_COLORS.length]
              : null;

            if (isFound && overlayColor) {
              return (
                <span
                  key={w}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-black transition-all flex items-center gap-1.5 border shadow-sm ${overlayColor.bgClass}`}
                >
                  <Icon name="check" size={12} className="no-underline shrink-0" />
                  <span>{w}</span>
                </span>
              );
            }

            return (
              <span
                key={w}
                className="px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-1.5 bg-[var(--surface-container)] text-[var(--on-container)] border border-[var(--border-tint)] hover:border-[var(--primary-action)]/50"
              >
                <span>{w}</span>
              </span>
            );
          })}
        </div>
      </Card>

      {/* Completion Modal / Banner if player finished all levels or locked in rank */}
      {isFinished && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <Card className="max-w-sm w-full p-6 text-center shadow-2xl rounded-3xl border border-[var(--border-tint)] bg-[var(--surface-card)] animate-scaleUp flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center">
              <Icon name="crown" size={36} />
            </div>
            <div>
              <h3 className="text-xl font-black text-[var(--on-container)]">Scriptures Searched!</h3>
              <p className="text-xs text-[var(--on-container-variant)] mt-1">
                "They are they which testify of me." — John 5:39
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--surface-container)] w-full flex flex-col gap-1.5 border border-[var(--border-tint)]">
              <span className="text-xs font-bold text-[var(--on-container-variant)]">Total Score Earned</span>
              <span className="font-mono text-2xl font-black text-[var(--primary-action)]">
                {currentScore} pts
              </span>
              <span className="text-[11px] font-semibold text-[var(--on-container-variant)]">
                {foundWords.length} sacred words uncovered
              </span>
            </div>

            <Button
              variant="primary"
              size="lg"
              pill
              onClick={() => {
                if (onExit) onExit();
              }}
              className="w-full font-bold"
            >
              Continue to Fellowship
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};
