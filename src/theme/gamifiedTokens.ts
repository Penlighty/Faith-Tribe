/**
 * Gamified Design System Tokens & Specs
 * Based on Playful Gamified UI System
 */

export const GAMIFIED_COLORS = {
  brand: {
    green: '#58CC02',
    greenLip: '#58A700',
    greenLight: '#D7FFB8',
    greenBorder: '#A6EB74',
    blue: '#1CB0F6',
    blueLip: '#1899D6',
    blueTint: '#DDF3FE',
    blueSoft: '#84D7FF',
    blueSoftLip: '#6AACCC',
    orange: '#FF9600',
    orangeDeep: '#CE7C00',
    yellow: '#FFC800',
    red: '#FF4B4B',
    redLip: '#EA2B2B',
    redLight: '#FFDFE0',
    purple: '#CE82FF',
    purpleDeep: '#7B4ECF',
    purpleTint: '#E0D1FC',
    pink: '#F28DC9',
  },
  neutral: {
    canvas: '#FFFFFF',
    textPrimary: '#4B4B4B',
    textSecondary: '#777777',
    textDisabled: '#AFAFAF',
    border: '#E5E5E5',
    surfaceMuted: '#F7F7F7',
    lockedFace: '#E5E5E5',
    lockedLip: '#B8B8B8',
    shadowBlob: '#E5E5E5',
  },
} as const;

export const GAMIFIED_COPY = {
  correctHeadlines: [
    'Amazing!',
    'Nice!',
    'Great job!',
    'You got it!',
    'Well done!',
    'Superb scripture knowledge!',
  ],
  incorrectHeadlines: [
    'Not quite!',
    'Almost!',
    'Keep trying!',
    'Faith through practice!',
  ],
  buttons: {
    check: 'CHECK',
    continue: 'CONTINUE',
    claimXp: 'CLAIM XP',
    openChest: 'OPEN CHEST',
    start: 'START +25 XP',
    jumpHere: 'JUMP HERE?',
    notNow: 'NOT NOW',
    maybeLater: 'MAYBE LATER',
  },
  streakAdjectives: {
    accuracy: 'AMAZING',
    speed: 'SPEEDY',
    xp: 'TOTAL XP',
  },
} as const;

export interface GamifiedStats {
  xp: number;
  gems: number;
  streak: number;
  hearts: number;
  maxHearts: number;
  completedNodeIds: string[];
  completedDays: number[];
  lastCompletedDate?: string;
}

const STORAGE_KEY = 'faith_tribe_gamified_stats';

export function getStoredGamifiedStats(): GamifiedStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        xp: parsed.xp ?? 125,
        gems: parsed.gems ?? 80,
        streak: parsed.streak ?? 3,
        hearts: parsed.hearts ?? 5,
        maxHearts: parsed.maxHearts ?? 5,
        completedNodeIds: parsed.completedNodeIds ?? ['node-1', 'node-2'],
        completedDays: parsed.completedDays ?? [1],
        lastCompletedDate: parsed.lastCompletedDate,
      };
    }
  } catch {
    // fallback
  }
  return {
    xp: 125,
    gems: 80,
    streak: 3,
    hearts: 5,
    maxHearts: 5,
    completedNodeIds: ['node-1', 'node-2'],
    completedDays: [1],
  };
}

export function saveGamifiedStats(stats: GamifiedStats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // ignore
  }
}
