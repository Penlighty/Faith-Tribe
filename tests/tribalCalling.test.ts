import { describe, it, expect } from 'vitest';
import {
  calculateTribalCalling,
  canRetakeAssessment,
  TRAIT_DIMENSIONS,
  TRIBES,
  TRIBES_BY_ID,
} from '../src/design/tribes/tribes';

describe('Biblical Tribal Calling Engine & 7-Trait Spectrum', () => {
  it('defines 7 distinct biblical trait dimensions with scriptural citations', () => {
    expect(TRAIT_DIMENSIONS).toHaveLength(7);
    const traitIds = TRAIT_DIMENSIONS.map((d) => d.id);
    expect(traitIds).toContain('time_discernment');
    expect(traitIds).toContain('bold_initiative');
    expect(traitIds).toContain('sanctuary_devotion');
    expect(traitIds).toContain('tactical_precision');
    expect(traitIds).toContain('fruitful_stewardship');
    expect(traitIds).toContain('pioneering_reach');
    expect(traitIds).toContain('justice_vigilance');

    TRAIT_DIMENSIONS.forEach((dim) => {
      expect(dim.scriptureRef).toBeTruthy();
      expect(dim.lowLabel).toBeTruthy();
      expect(dim.highLabel).toBeTruthy();
      expect(dim.iconName).toBeTruthy();
    });
  });

  it('contains all 12 biblical tribes with 7-dimensional traits between 0 and 100', () => {
    expect(TRIBES).toHaveLength(12);
    const expectedIds = [
      'judah',
      'issachar',
      'levi',
      'benjamin',
      'zebulun',
      'joseph',
      'naphtali',
      'asher',
      'gad',
      'dan',
      'reuben',
      'simeon',
    ];

    expectedIds.forEach((id) => {
      const tribe = TRIBES_BY_ID[id];
      expect(tribe).toBeDefined();
      expect(tribe.title).toBeTruthy();
      expect(tribe.source).toBeTruthy();
      expect(tribe.strengths.length).toBeGreaterThan(0);
      expect(tribe.watchouts.length).toBeGreaterThan(0);

      TRAIT_DIMENSIONS.forEach((dim) => {
        const val = tribe.traits[dim.id];
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThanOrEqual(100);
      });
    });
  });

  it('correctly prescribes Issachar when user excels in time & season discernment (1 Chr 12:32)', () => {
    // 1 Chronicles 12:32: "men of Issachar, who had understanding of the times"
    const traits = {
      time_discernment: 98,
      bold_initiative: 35,
      sanctuary_devotion: 65,
      tactical_precision: 65,
      fruitful_stewardship: 70,
      pioneering_reach: 30,
      justice_vigilance: 60,
    };

    const result = calculateTribalCalling(traits);
    expect(result.primaryTribe.id).toBe('issachar');
    expect(result.matchPercentage).toBeGreaterThanOrEqual(80);
    const topIds = result.topAlignedTraits.map((t) => t.trait.id);
    expect(topIds).toContain('time_discernment');
    expect(result.allRanked[0].tribe.id).toBe('issachar');
  });

  it('correctly prescribes Judah when user exhibits royal, lionhearted initiative (Gen 49:8-10)', () => {
    const traits = {
      time_discernment: 72,
      bold_initiative: 98,
      sanctuary_devotion: 76,
      tactical_precision: 68,
      fruitful_stewardship: 76,
      pioneering_reach: 62,
      justice_vigilance: 84,
    };

    const result = calculateTribalCalling(traits);
    expect(result.primaryTribe.id).toBe('judah');
    expect(result.matchPercentage).toBeGreaterThanOrEqual(90);
    expect(result.allRanked[0].tribe.id).toBe('judah');
  });

  it('correctly prescribes Benjamin when user exhibits tactical archery precision (Judges 20:16)', () => {
    const traits = {
      time_discernment: 60,
      bold_initiative: 75,
      sanctuary_devotion: 50,
      tactical_precision: 98,
      fruitful_stewardship: 50,
      pioneering_reach: 58,
      justice_vigilance: 80,
    };

    const result = calculateTribalCalling(traits);
    expect(result.primaryTribe.id).toBe('benjamin');
  });

  it('correctly prescribes Levi when user exhibits holy sanctuary devotion (Deut 33:8-10)', () => {
    const traits = {
      time_discernment: 65,
      bold_initiative: 45,
      sanctuary_devotion: 98,
      tactical_precision: 70,
      fruitful_stewardship: 38,
      pioneering_reach: 32,
      justice_vigilance: 78,
    };

    const result = calculateTribalCalling(traits);
    expect(result.primaryTribe.id).toBe('levi');
  });

  it('correctly prescribes Zebulun when user exhibits maritime & pioneering trade outreach (Gen 49:13)', () => {
    const traits = {
      time_discernment: 65,
      bold_initiative: 68,
      sanctuary_devotion: 38,
      tactical_precision: 55,
      fruitful_stewardship: 68,
      pioneering_reach: 98,
      justice_vigilance: 60,
    };

    const result = calculateTribalCalling(traits);
    expect(result.primaryTribe.id).toBe('zebulun');
  });

  it('enforces a strict 14-day lock on re-taking the tribal assessment', () => {
    // No previous assessment
    const neverAssessed = canRetakeAssessment();
    expect(neverAssessed.canRetake).toBe(true);
    expect(neverAssessed.daysRemaining).toBe(0);

    const now = Date.now();

    // Assessed 2 days ago (locked!)
    const twoDaysAgo = now - 2 * 24 * 60 * 60 * 1000;
    const lockedResult = canRetakeAssessment(twoDaysAgo);
    expect(lockedResult.canRetake).toBe(false);
    expect(lockedResult.daysRemaining).toBe(12);

    // Assessed 13 days ago (still locked by 1 day)
    const thirteenDaysAgo = now - 13 * 24 * 60 * 60 * 1000;
    const almostUnlocked = canRetakeAssessment(thirteenDaysAgo);
    expect(almostUnlocked.canRetake).toBe(false);
    expect(almostUnlocked.daysRemaining).toBe(1);

    // Assessed 15 days ago (eligible to retake!)
    const fifteenDaysAgo = now - 15 * 24 * 60 * 60 * 1000;
    const unlockedResult = canRetakeAssessment(fifteenDaysAgo);
    expect(unlockedResult.canRetake).toBe(true);
    expect(unlockedResult.daysRemaining).toBe(0);
  });
});
