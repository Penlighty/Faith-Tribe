export interface WordScoreResult {
  basePoints: number;
  lengthBonus: number;
  speedBonus: number;
  streakBonus: number;
  totalPoints: number;
}

/**
 * Calculates points for a discovered word based on:
 * - Base points + length multiplier
 * - Speed bonus (faster find = higher points)
 * - Combo streak multiplier
 */
export function calculateWordSearchPoints(
  word: string,
  timeToFindSec?: number,
  currentStreak: number = 0
): WordScoreResult {
  const basePoints = 50;
  // Longer words earn more points per character
  const lengthBonus = word.length * 20;

  // Speed bonus: up to +50 points if found quickly (< 10s)
  let speedBonus = 0;
  if (typeof timeToFindSec === 'number') {
    if (timeToFindSec <= 5) {
      speedBonus = 60;
    } else if (timeToFindSec <= 10) {
      speedBonus = 40;
    } else if (timeToFindSec <= 20) {
      speedBonus = 20;
    }
  }

  // Streak bonus: +15 points per active streak count
  const streakBonus = Math.min(currentStreak * 15, 75);

  const totalPoints = basePoints + lengthBonus + speedBonus + streakBonus;

  return {
    basePoints,
    lengthBonus,
    speedBonus,
    streakBonus,
    totalPoints,
  };
}

/**
 * Bonus points awarded when all words in a level grid are found
 */
export const LEVEL_CLEARED_BONUS = 150;

/**
 * Bonus points awarded for locking in ranking early in competition
 */
export const EARLY_RANK_BONUS = 100;
