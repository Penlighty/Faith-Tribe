import { describe, it, expect } from 'vitest';
import {
  getAllChronicleDays,
  getAllActs,
  getChronicleDay,
  getDayOfYear,
  getChronicleDayStatus,
  formatDayDate,
  getSecondsUntilMidnight,
} from '../src/engine/journey/chronicleCurriculum';
import { BIBLICAL_CHARACTERS } from '../src/components/gamified/GamifiedMascot';

describe('365-Day Biblical Chronicle Curriculum Engine', () => {
  const allDays = getAllChronicleDays();
  const allActs = getAllActs();

  it('contains exactly 365 days with sequential numbering from 1 to 365', () => {
    expect(allDays.length).toBe(365);
    allDays.forEach((day, index) => {
      expect(day.dayNumber).toBe(index + 1);
    });
  });

  it('spans 12 distinct sequential biblical acts from Genesis to Revelation without gaps', () => {
    expect(allActs.length).toBe(12);

    expect(allActs[0].startDay).toBe(1);
    expect(allActs[allActs.length - 1].endDay).toBe(365);

    let expectedDay = 1;
    allActs.forEach((act, actIdx) => {
      expect(act.actIndex).toBe(actIdx + 1);
      expect(act.startDay).toBe(expectedDay);
      expect(act.endDay - act.startDay + 1).toBe(act.totalDays);
      expectedDay = act.endDay + 1;
    });
    expect(expectedDay).toBe(366);
  });

  it('starts Day 1 in Genesis Creation and ends Day 365 in Revelation New Jerusalem', () => {
    const day1 = getChronicleDay(1);
    expect(day1.actIndex).toBe(1);
    expect(day1.scriptureRef).toContain('Genesis');
    expect(day1.storyTitle.toLowerCase()).toContain('beginning');

    const day365 = getChronicleDay(365);
    expect(day365.actIndex).toBe(12);
    expect(day365.actTitle.toLowerCase()).toContain('revelation');
    expect(day365.scriptureRef).toContain('Revelation');
    expect(day365.storyTitle.toLowerCase()).toContain('new jerusalem');
  });

  it('guarantees every day has a valid matching biblical character from BIBLICAL_CHARACTERS', () => {
    allDays.forEach((day) => {
      expect(day.characterId).toBeDefined();
      expect(BIBLICAL_CHARACTERS[day.characterId]).toBeDefined();
      expect(day.characterName).toBeTruthy();
    });
  });

  it('guarantees every day has at least 10 contextual questions with valid options and correct answer included', () => {
    allDays.forEach((day) => {
      expect(day.questions.length).toBeGreaterThanOrEqual(10);
      day.questions.forEach((q) => {
        expect(q.prompt).toBeTruthy();
        expect(q.speechText).toBeTruthy();
        expect(q.options.length).toBeGreaterThanOrEqual(2);
        expect(q.options).toContain(q.answer);
        expect(q.ref).toBeTruthy();
      });
    });
  });

  it('correctly calculates day of year between 1 and 365', () => {
    const today = getDayOfYear();
    expect(today).toBeGreaterThanOrEqual(1);
    expect(today).toBeLessThanOrEqual(365);

    const jan1 = new Date(2026, 0, 1);
    expect(getDayOfYear(jan1)).toBe(1);

    const dec31 = new Date(2026, 11, 31);
    expect(getDayOfYear(dec31)).toBe(365);
  });

  it('correctly classifies day statuses for daily progression and catch-up mechanics', () => {
    const completedDays = [1, 2, 5];
    const today = 10;

    // Day 1 & 2: completed
    expect(getChronicleDayStatus(1, completedDays, today)).toBe('completed');
    expect(getChronicleDayStatus(2, completedDays, today)).toBe('completed');

    // Day 3, 4, 6..9: missed (< today and not in completedDays) -> catch-up unlocked!
    expect(getChronicleDayStatus(3, completedDays, today)).toBe('missed');
    expect(getChronicleDayStatus(4, completedDays, today)).toBe('missed');
    expect(getChronicleDayStatus(9, completedDays, today)).toBe('missed');

    // Day 10: today (active daily milestone)
    expect(getChronicleDayStatus(10, completedDays, today)).toBe('today');

    // Day 11+: locked (> today)
    expect(getChronicleDayStatus(11, completedDays, today)).toBe('locked');
    expect(getChronicleDayStatus(365, completedDays, today)).toBe('locked');
  });

  it('formats calendar dates accurately', () => {
    const formatted = formatDayDate(1, 2026);
    expect(formatted).toContain('Jan');

    const formattedMid = formatDayDate(180, 2026);
    expect(formattedMid).toBeTruthy();
  });

  it('returns positive seconds until midnight countdown', () => {
    const secs = getSecondsUntilMidnight();
    expect(secs).toBeGreaterThan(0);
    expect(secs).toBeLessThanOrEqual(86400);
  });
});
