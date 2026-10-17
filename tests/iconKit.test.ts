import { describe, it, expect } from 'vitest';
import { ICONS, GAME_IDS, GAME_VISUALS } from '../src/design/icons';
import { LEGACY_ICON_MAP, getLegacyMappedIcon } from '../src/design/icons/legacy-map';
import { toVisualGameId, getGameVisual } from '../src/design/icons/game-mapping';

describe('Faith Tribe Icon Kit Quality Gates', () => {
  it('every mapped icon in LEGACY_ICON_MAP exists in ICONS', () => {
    const iconKeys = Object.keys(ICONS);
    for (const [legacyName, targetIcon] of Object.entries(LEGACY_ICON_MAP)) {
      expect(
        iconKeys,
        `Expected target icon "${targetIcon}" mapped from legacy icon "${legacyName}" to exist in ICONS`
      ).toContain(targetIcon);
    }
  });

  it('getLegacyMappedIcon correctly resolves mapped icons and returns undefined for unmapped', () => {
    expect(getLegacyMappedIcon('Crown')).toBe('crown');
    expect(getLegacyMappedIcon('Flame')).toBe('flame');
    expect(getLegacyMappedIcon('Clock')).toBe('timer');
    expect(getLegacyMappedIcon('Wheat')).toBe('wheat');
    expect(getLegacyMappedIcon('NonExistentLegacyIcon123')).toBeUndefined();
  });

  it('all GAME_IDS have visual definitions with valid container and ink colors', () => {
    expect(GAME_IDS.length).toBeGreaterThanOrEqual(8);

    for (const gid of GAME_IDS) {
      const visual = GAME_VISUALS[gid];
      expect(visual, `Missing visual definition for game: ${gid}`).toBeDefined();
      expect(visual.id).toBe(gid);
      expect(typeof visual.name).toBe('string');
      expect(visual.name.length).toBeGreaterThan(0);
      expect(visual.container).toMatch(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
      expect(visual.ink).toMatch(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
      expect(typeof visual.shape).toBe('string');
      expect(typeof visual.shapePath).toBe('string');
    }
  });

  it('toVisualGameId and getGameVisual seamlessly bridge who-said to who-said-that', () => {
    expect(toVisualGameId('who-said')).toBe('who-said-that');
    expect(toVisualGameId('who-said-that')).toBe('who-said-that');
    expect(toVisualGameId('testament-sort')).toBe('testament-sort');

    const whoSaidVisual = getGameVisual('who-said');
    expect(whoSaidVisual).toBeDefined();
    expect(whoSaidVisual.name).toBe('Who Said That?');
    expect(whoSaidVisual.container).toBe('#F3EBA0');
    expect(whoSaidVisual.ink).toBe('#5C5410');
  });

  it('contains testament sort specific icons for name-types and testaments', () => {
    expect(ICONS).toHaveProperty('person');
    expect(ICONS).toHaveProperty('place');
    expect(ICONS).toHaveProperty('thing');
    expect(ICONS).toHaveProperty('ot');
    expect(ICONS).toHaveProperty('nt');
    expect(ICONS).toHaveProperty('both');
  });

  it('contains power-up icons for who said that', () => {
    expect(ICONS).toHaveProperty('fifty');
    expect(ICONS).toHaveProperty('double');
    expect(ICONS).toHaveProperty('shield');
    expect(ICONS).toHaveProperty('bolt');
    expect(ICONS).toHaveProperty('hint');
  });
});
