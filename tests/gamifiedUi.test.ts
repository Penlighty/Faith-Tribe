import { describe, it, expect, beforeEach } from 'vitest';

// Polyfill localStorage for node environment if needed
if (typeof localStorage === 'undefined') {
  const store = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, val: string) => store.set(key, val),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
    key: (idx: number) => Array.from(store.keys())[idx] ?? null,
    get length() {
      return store.size;
    },
  } as unknown as Storage;
}

import {
  GAMIFIED_COLORS,
  GAMIFIED_COPY,
  getStoredGamifiedStats,
  saveGamifiedStats,
  GamifiedStats,
} from '../src/theme/gamifiedTokens';

describe('Playful Gamified UI System', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('matches gamified design spec semantic color hex values', () => {
    // Primary / Green
    expect(GAMIFIED_COLORS.brand.green).toBe('#58CC02');
    expect(GAMIFIED_COLORS.brand.greenLip).toBe('#58A700');
    expect(GAMIFIED_COLORS.brand.greenLight).toBe('#D7FFB8');

    // Action / Blue
    expect(GAMIFIED_COLORS.brand.blue).toBe('#1CB0F6');
    expect(GAMIFIED_COLORS.brand.blueLip).toBe('#1899D6');
    expect(GAMIFIED_COLORS.brand.blueTint).toBe('#DDF3FE');

    // Streak / Orange
    expect(GAMIFIED_COLORS.brand.orange).toBe('#FF9600');
    expect(GAMIFIED_COLORS.brand.orangeDeep).toBe('#CE7C00');

    // XP / Yellow
    expect(GAMIFIED_COLORS.brand.yellow).toBe('#FFC800');

    // Error / Red
    expect(GAMIFIED_COLORS.brand.red).toBe('#FF4B4B');
    expect(GAMIFIED_COLORS.brand.redLip).toBe('#EA2B2B');
    expect(GAMIFIED_COLORS.brand.redLight).toBe('#FFDFE0');

    // Special / Purple
    expect(GAMIFIED_COLORS.brand.purple).toBe('#CE82FF');
    expect(GAMIFIED_COLORS.brand.purpleDeep).toBe('#7B4ECF');
    expect(GAMIFIED_COLORS.brand.purpleTint).toBe('#E0D1FC');
  });

  it('provides warm, encouraging copy bank with ALL CAPS button verbs', () => {
    expect(GAMIFIED_COPY.buttons.check).toBe('CHECK');
    expect(GAMIFIED_COPY.buttons.continue).toBe('CONTINUE');
    expect(GAMIFIED_COPY.buttons.claimXp).toBe('CLAIM XP');
    expect(GAMIFIED_COPY.buttons.openChest).toBe('OPEN CHEST');
    expect(GAMIFIED_COPY.correctHeadlines).toContain('Amazing!');
    expect(GAMIFIED_COPY.streakAdjectives.accuracy).toBe('AMAZING');
    expect(GAMIFIED_COPY.streakAdjectives.speed).toBe('SPEEDY');
    expect(GAMIFIED_COPY.streakAdjectives.xp).toBe('TOTAL XP');
  });

  it('persists and loads gamified player stats properly', () => {
    const initial = getStoredGamifiedStats();
    expect(initial.xp).toBeGreaterThan(0);
    expect(initial.hearts).toBe(5);

    const updated: GamifiedStats = {
      xp: 250,
      gems: 120,
      streak: 7,
      hearts: 5,
      maxHearts: 5,
      completedNodeIds: ['node-1', 'node-2', 'node-3'],
    };

    saveGamifiedStats(updated);
    const loaded = getStoredGamifiedStats();
    expect(loaded.xp).toBe(250);
    expect(loaded.gems).toBe(120);
    expect(loaded.streak).toBe(7);
    expect(loaded.completedNodeIds).toHaveLength(3);
  });

  it('provides an ensemble of biblical characters with special character names and titles', async () => {
    const { BIBLICAL_CHARACTERS } = await import('../src/components/gamified/GamifiedMascot');
    
    const characterKeys = Object.keys(BIBLICAL_CHARACTERS);
    expect(characterKeys).toContain('david');
    expect(characterKeys).toContain('miryam');
    expect(characterKeys).toContain('moshe');
    expect(characterKeys).toContain('deborah');
    expect(characterKeys).toContain('esther');
    expect(characterKeys).toContain('eliyah');
    expect(characterKeys).toContain('ruth');

    // Test specific diacritics and transliterated special characters
    expect(BIBLICAL_CHARACTERS.david.name).toBe('Dāvīd');
    expect(BIBLICAL_CHARACTERS.miryam.name).toBe('Mīryām');
    expect(BIBLICAL_CHARACTERS.moshe.name).toBe('Mōshē');
    expect(BIBLICAL_CHARACTERS.deborah.name).toBe('Debōrāh');
    expect(BIBLICAL_CHARACTERS.esther.name).toBe('Esthēr');
    expect(BIBLICAL_CHARACTERS.eliyah.name).toBe('Eliyāh');
    expect(BIBLICAL_CHARACTERS.ruth.name).toBe('Rūth');

    for (const [id, charDef] of Object.entries(BIBLICAL_CHARACTERS)) {
      expect(charDef.id).toBe(id);
      expect(charDef.title.length).toBeGreaterThan(0);
      expect(charDef.signatureVerse.length).toBeGreaterThan(0);
      expect(charDef.themeColor).toMatch(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
      expect(charDef.lipColor).toMatch(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
    }
  });
});
