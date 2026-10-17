import { describe, it, expect } from 'vitest';
import { calculateWhoSaidScore, calculateWhoSaidTimeLimit } from '../src/games/who-said/scoring';
import { calculateTestamentSortScore } from '../src/games/testament-sort/scoring';

describe('Step 2: Scoring Modules', () => {
  describe('Who Said That? Scoring', () => {
    it('matches the worked example from the specification: Tier 2, 15s limit, correct at 5s as first correct = 140', () => {
      // 14 words quote gives 8 + 0.5 * 14 = 15 seconds limit
      const quote = 'One two three four five six seven eight nine ten eleven twelve thirteen fourteen';
      const limit = calculateWhoSaidTimeLimit(quote);
      expect(limit).toBe(15);

      const result = calculateWhoSaidScore({
        tier: 2,
        quote,
        elapsedSeconds: 5,
        isCorrect: true,
        isFirstCorrect: true,
      });

      // timeFactor = 1 - 0.8 * (5 / 15) = 0.7333333...
      // base 150 * 0.7333333... = 110
      // first correct bonus = 20% of 150 = 30
      // total = 110 + 30 = 140
      expect(result.points).toBe(140);
      expect(result.firstCorrectBonus).toBe(30);
    });

    it('handles wrong answers with 25% base penalty', () => {
      const result = calculateWhoSaidScore({
        tier: 1, // base 100
        quote: 'Short quote',
        elapsedSeconds: 2,
        isCorrect: false,
      });
      expect(result.points).toBe(-25);
      expect(result.penalty).toBe(25);
    });

    it('cancels penalty with Shield power-up', () => {
      const result = calculateWhoSaidScore({
        tier: 1,
        quote: 'Short quote',
        elapsedSeconds: 2,
        isCorrect: false,
        powerUp: 'shield',
      });
      expect(result.points).toBe(0);
      expect(result.shieldUsed).toBe(true);
    });

    it('doubles gains and penalties with Double Down power-up', () => {
      // Gain doubled
      const gainResult = calculateWhoSaidScore({
        tier: 4, // base 300
        quote: 'Short quote',
        elapsedSeconds: 0,
        isCorrect: true,
        powerUp: 'double',
      });
      expect(gainResult.points).toBe(600); // 300 * 1.0 * 2

      // Penalty doubled
      const penaltyResult = calculateWhoSaidScore({
        tier: 4, // base 300, 25% is 75 -> doubled is 150
        quote: 'Short quote',
        elapsedSeconds: 0,
        isCorrect: false,
        powerUp: 'double',
      });
      expect(penaltyResult.points).toBe(-150);
    });

    it('halves points with Fifty-Fifty power-up', () => {
      const result = calculateWhoSaidScore({
        tier: 3, // base 200
        quote: 'Short quote',
        elapsedSeconds: 0,
        isCorrect: true,
        powerUp: 'fifty',
      });
      expect(result.points).toBe(100); // 200 * 0.5
    });

    it('awards Gentle Mode with 1.5x time limit and 0 wrong penalty', () => {
      const quote = 'Short quote';
      const normalLimit = calculateWhoSaidTimeLimit(quote);
      const gentleLimit = calculateWhoSaidTimeLimit(quote, true);
      expect(gentleLimit).toBe(normalLimit * 1.5);

      const wrongGentle = calculateWhoSaidScore({
        tier: 2,
        quote,
        elapsedSeconds: 5,
        isCorrect: false,
        gentleMode: true,
      });
      expect(wrongGentle.points).toBe(0);
      expect(wrongGentle.penalty).toBe(0);
    });

    it('awards streak bonuses at 3, 5, and 7+', () => {
      const quote = 'Short quote';
      const streak3 = calculateWhoSaidScore({
        tier: 1, // base 100
        quote,
        elapsedSeconds: 0,
        isCorrect: true,
        streakCount: 3,
      });
      expect(streak3.streakBonus).toBe(10);

      const streak5 = calculateWhoSaidScore({
        tier: 1,
        quote,
        elapsedSeconds: 0,
        isCorrect: true,
        streakCount: 5,
      });
      expect(streak5.streakBonus).toBe(20);

      const streak7 = calculateWhoSaidScore({
        tier: 1,
        quote,
        elapsedSeconds: 0,
        isCorrect: true,
        streakCount: 8,
      });
      expect(streak7.streakBonus).toBe(30);
    });
  });

  describe('Testament Sort Scoring', () => {
    it('matches the worked example from the specification: Tier 3, 12s limit, BOTH correct at 4s with a hint = 113', () => {
      // Tier 3 (base 200), 12s limit
      // timeFactor = 1 - 0.75 * (4 / 12) = 0.75
      // hintFactor = 0.6
      // bothBonus = 1.25
      // points = round(200 * 0.75 * 0.6 * 1.25) = round(112.5) = 113
      const result = calculateTestamentSortScore({
        tier: 3,
        elapsedSeconds: 4,
        isCorrect: true,
        correctAnswer: 'BOTH',
        hintUsed: true,
      });
      expect(result.timeLimit).toBe(12);
      expect(result.points).toBe(113);
    });

    it('scores 0 on wrong answer in standard mode, and -20% base in Risk Mode', () => {
      const normalWrong = calculateTestamentSortScore({
        tier: 2, // base 150
        elapsedSeconds: 5,
        isCorrect: false,
        correctAnswer: 'OT',
        hintUsed: false,
        riskMode: false,
      });
      expect(normalWrong.points).toBe(0);

      const riskWrong = calculateTestamentSortScore({
        tier: 2, // base 150, 20% is 30
        elapsedSeconds: 5,
        isCorrect: false,
        correctAnswer: 'OT',
        hintUsed: false,
        riskMode: true,
      });
      expect(riskWrong.points).toBe(-30);
      expect(riskWrong.penalty).toBe(30);
    });
  });
});
