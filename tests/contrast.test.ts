import { describe, it, expect } from 'vitest';
import { getContrastRatio, getRelativeLuminance, parseHex } from '../src/design/tokens/contrast';
import { runAllContrastChecks } from '../scripts/check-contrast';

describe('WCAG 2.x Contrast Calculation Unit Tests', () => {
  it('parses 3-digit and 6-digit hex values correctly', () => {
    expect(parseHex('#FFF')).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseHex('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    expect(parseHex('#2F5D3A')).toEqual({ r: 47, g: 93, b: 58 });
  });

  it('calculates relative luminance correctly for extremes', () => {
    expect(getRelativeLuminance('#000000')).toBe(0);
    expect(getRelativeLuminance('#FFFFFF')).toBe(1);
  });

  it('calculates known contrast pairs: black on white = 21:1', () => {
    const ratio = getContrastRatio('#000000', '#FFFFFF');
    expect(ratio).toBe(21);
  });

  it('calculates known contrast pairs: identical colors = 1:1', () => {
    expect(getContrastRatio('#FFFFFF', '#FFFFFF')).toBe(1);
    expect(getContrastRatio('#000000', '#000000')).toBe(1);
    expect(getContrastRatio('#2F5D3A', '#2F5D3A')).toBe(1);
  });

  it('is commutative (order of arguments does not matter)', () => {
    expect(getContrastRatio('#2F5D3A', '#FFFFFF')).toBe(getContrastRatio('#FFFFFF', '#2F5D3A'));
    expect(getContrastRatio('#0F4A66', '#CFE6F3')).toBe(getContrastRatio('#CFE6F3', '#0F4A66'));
  });

  it('passes all 66 design token scope contrast checks (WCAG AA)', () => {
    const { passed, failures, results } = runAllContrastChecks();
    expect(failures).toHaveLength(0);
    expect(passed).toBe(true);
    expect(results.length).toBeGreaterThanOrEqual(66);
  });
});
