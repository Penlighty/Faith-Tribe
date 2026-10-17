import { getContrastRatio } from '../src/design/tokens/contrast';
import { GAME_VISUALS } from '../src/design/icons/games';
import { TRIBES } from '../src/design/tribes/tribes';
import { interpolate, formatHex } from 'culori';

interface ContrastCheck {
  scope: string;
  element: string;
  foreground: string;
  background: string;
  minRatio: number;
  actualRatio?: number;
  passed?: boolean;
}

const LIGHT_SURFACE = '#F4F1E6';
const DARK_SURFACE = '#121A15';

function mix(c1: string, c2: string, ratio: number): string {
  const mixer = interpolate([c1, c2], 'rgb');
  return formatHex(mixer(ratio)) || c1;
}

export function runAllContrastChecks(): { passed: boolean; results: ContrastCheck[]; failures: ContrastCheck[] } {
  const checks: ContrastCheck[] = [];

  // 1. Brand Light
  checks.push(
    { scope: 'brand-light', element: 'on-surface on surface', foreground: '#1B2A21', background: '#F4F1E6', minRatio: 4.5 },
    { scope: 'brand-light', element: 'on-surface-variant on surface', foreground: '#4A5A4F', background: '#F4F1E6', minRatio: 4.5 },
    { scope: 'brand-light', element: 'on-primary on primary', foreground: '#FFFFFF', background: '#2F5D3A', minRatio: 4.5 },
    { scope: 'brand-light', element: 'on-primary-container on primary-container', foreground: '#0F2C18', background: '#CFEFD2', minRatio: 4.5 },
    { scope: 'brand-light', element: 'outline on surface', foreground: '#7A8479', background: '#F4F1E6', minRatio: 3.0 },
    { scope: 'brand-light', element: 'error on surface', foreground: '#B3261E', background: '#F4F1E6', minRatio: 4.5 },
    { scope: 'brand-light', element: 'success on surface', foreground: '#1E7B3A', background: '#F4F1E6', minRatio: 4.5 }
  );

  // 2. Brand Dark
  checks.push(
    { scope: 'brand-dark', element: 'on-surface on surface', foreground: '#E6EBE3', background: '#121A15', minRatio: 4.5 },
    { scope: 'brand-dark', element: 'on-surface-variant on surface', foreground: '#B7C2B8', background: '#121A15', minRatio: 4.5 },
    { scope: 'brand-dark', element: 'on-primary on primary', foreground: '#0F2C18', background: '#9ED4A8', minRatio: 4.5 },
    { scope: 'brand-dark', element: 'on-primary-container on primary-container', foreground: '#CFEFD2', background: '#2F5D3A', minRatio: 4.5 },
    { scope: 'brand-dark', element: 'outline on surface', foreground: '#8A9488', background: '#121A15', minRatio: 3.0 },
    { scope: 'brand-dark', element: 'error on surface', foreground: '#F2B8B5', background: '#121A15', minRatio: 4.5 },
    { scope: 'brand-dark', element: 'success on surface', foreground: '#7FD39A', background: '#121A15', minRatio: 4.5 }
  );

  // 3. Game Scopes (8 games light & dark)
  const gameIds = Object.keys(GAME_VISUALS) as (keyof typeof GAME_VISUALS)[];
  for (const gameId of gameIds) {
    const visual = GAME_VISUALS[gameId];
    const lightSurface = mix(LIGHT_SURFACE, visual.container, 0.35);
    const darkSurface = mix(DARK_SURFACE, visual.ink, 0.30);

    // Light: ink on container, on-surface on surface
    checks.push(
      { scope: `game-light:${gameId}`, element: 'game-ink on game-container', foreground: visual.ink, background: visual.container, minRatio: 4.5 },
      { scope: `game-light:${gameId}`, element: 'game-on-surface on game-surface', foreground: visual.ink, background: lightSurface, minRatio: 4.5 }
    );

    // Dark: ink (container) on container (ink), on-surface on surface
    checks.push(
      { scope: `game-dark:${gameId}`, element: 'game-ink (container) on game-container (ink)', foreground: visual.container, background: visual.ink, minRatio: 4.5 },
      { scope: `game-dark:${gameId}`, element: 'game-on-surface on game-surface', foreground: visual.container, background: darkSurface, minRatio: 4.5 }
    );
  }

  // 4. Tier Scopes (4 tiers light & dark)
  const lightTiers: Record<string, string> = {
    t1: '#E4F5E6',
    t2: '#F7F2C4',
    t3: '#ECE8F8',
    t4: '#FBE4E8',
  };
  const darkTiers: Record<string, string> = {
    t1: '#17261B',
    t2: '#2A2812',
    t3: '#221F33',
    t4: '#33191F',
  };

  for (const [tier, tint] of Object.entries(lightTiers)) {
    checks.push({
      scope: `tier-light:${tier}`,
      element: `on-surface on tint (${tier})`,
      foreground: '#1B2A21',
      background: tint,
      minRatio: 4.5,
    });
  }

  for (const [tier, tint] of Object.entries(darkTiers)) {
    checks.push({
      scope: `tier-dark:${tier}`,
      element: `on-surface on tint (${tier})`,
      foreground: '#E6EBE3',
      background: tint,
      minRatio: 4.5,
    });
  }

  // 5. Tribe Scope (12 tribes)
  for (const tribe of TRIBES) {
    checks.push({
      scope: `tribe:${tribe.id}`,
      element: `tribe-ink on tribe-container (${tribe.name})`,
      foreground: tribe.ink,
      background: tribe.container,
      minRatio: 4.5,
    });
  }

  const failures: ContrastCheck[] = [];
  for (const check of checks) {
    const ratio = getContrastRatio(check.foreground, check.background);
    check.actualRatio = ratio;
    check.passed = ratio >= check.minRatio;
    if (!check.passed) {
      failures.push(check);
    }
  }

  return {
    passed: failures.length === 0,
    results: checks,
    failures,
  };
}

if (process.argv[1].endsWith('check-contrast.ts')) {
  console.log('Running WCAG 2.x Contrast Ratio Verification...');
  const { passed, results, failures } = runAllContrastChecks();

  console.log(`Total pairs checked: ${results.length}`);
  if (passed) {
    console.log(`✓ All ${results.length} contrast checks PASSED (all >= min ratios).`);
    process.exit(0);
  } else {
    console.error(`✗ ${failures.length} contrast checks FAILED:`);
    for (const f of failures) {
      console.error(
        `  [${f.scope}] ${f.element}: foreground ${f.foreground} on background ${f.background} = ${f.actualRatio}:1 (required: ${f.minRatio}:1)`
      );
    }
    process.exit(1);
  }
}
