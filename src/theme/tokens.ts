export interface TonalPalette {
  seed: string;
  bgTint: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceCard: string;
  primaryAction: string;
  primaryActionHover: string;
  primaryActionText: string;
  onContainer: string;
  onContainerVariant: string;
  chipBg: string;
  chipText: string;
  accentSecondary: string;
  borderTint: string;
}

export interface ThemeColors {
  light: TonalPalette;
  dark: TonalPalette;
}

// Predefined core M3 Expressive pastel palettes sampled from spec
export const PALETTE_PRESETS: Record<string, { light: TonalPalette; dark: TonalPalette }> = {
  // Lavender (Home default neutral)
  lavender: {
    light: {
      seed: '#E9E5F4',
      bgTint: '#F6F4FB',
      surfaceContainer: '#ECE8F5',
      surfaceContainerHigh: '#E1DBF0',
      surfaceCard: '#FFFFFF',
      primaryAction: '#2F5D3A',
      primaryActionHover: '#23472C',
      primaryActionText: '#FFFFFF',
      onContainer: '#1F1B2A',
      onContainerVariant: '#4E485B',
      chipBg: '#E4DFEF',
      chipText: '#231E31',
      accentSecondary: '#5A5666',
      borderTint: 'rgba(54, 46, 73, 0.08)',
    },
    dark: {
      seed: '#2B2538',
      bgTint: '#131118',
      surfaceContainer: '#1E1B24',
      surfaceContainerHigh: '#292531',
      surfaceCard: '#24202B',
      primaryAction: '#86D696',
      primaryActionHover: '#98E1A6',
      primaryActionText: '#043916',
      onContainer: '#EAE5F3',
      onContainerVariant: '#CBC4D6',
      chipBg: '#342F40',
      chipText: '#E6E0F1',
      accentSecondary: '#B7AFD0',
      borderTint: 'rgba(255, 255, 255, 0.1)',
    },
  },
  // Butter Yellow (Fake-a-Proverb)
  butter: {
    light: {
      seed: '#EDE58C',
      bgTint: '#FBF9EA',
      surfaceContainer: '#F5F0B8',
      surfaceContainerHigh: '#EFE79F',
      surfaceCard: '#FFFFFF',
      primaryAction: '#2F5D3A',
      primaryActionHover: '#23472C',
      primaryActionText: '#FFFFFF',
      onContainer: '#242004',
      onContainerVariant: '#564E12',
      chipBg: '#EFE9A8',
      chipText: '#2D2802',
      accentSecondary: '#716518',
      borderTint: 'rgba(78, 69, 10, 0.1)',
    },
    dark: {
      seed: '#37320D',
      bgTint: '#14140D',
      surfaceContainer: '#222010',
      surfaceContainerHigh: '#2D2B15',
      surfaceCard: '#262413',
      primaryAction: '#86D696',
      primaryActionHover: '#98E1A6',
      primaryActionText: '#043916',
      onContainer: '#F7F3CF',
      onContainerVariant: '#D7D19B',
      chipBg: '#3B3718',
      chipText: '#F7F4D6',
      accentSecondary: '#DFD896',
      borderTint: 'rgba(255, 255, 255, 0.1)',
    },
  },
  // Mint (Tares Among the Wheat)
  mint: {
    light: {
      seed: '#CFEFD2',
      bgTint: '#F2FAF3',
      surfaceContainer: '#DCF5DF',
      surfaceContainerHigh: '#C9ECCF',
      surfaceCard: '#FFFFFF',
      primaryAction: '#2F5D3A',
      primaryActionHover: '#23472C',
      primaryActionText: '#FFFFFF',
      onContainer: '#0F2615',
      onContainerVariant: '#2D5537',
      chipBg: '#D2F2D6',
      chipText: '#12311A',
      accentSecondary: '#3C6745',
      borderTint: 'rgba(28, 64, 37, 0.08)',
    },
    dark: {
      seed: '#1B3522',
      bgTint: '#0F1611',
      surfaceContainer: '#17241A',
      surfaceContainerHigh: '#1E3023',
      surfaceCard: '#1A291E',
      primaryAction: '#86D696',
      primaryActionHover: '#98E1A6',
      primaryActionText: '#043916',
      onContainer: '#E0F8E3',
      onContainerVariant: '#B4DEC0',
      chipBg: '#243D2A',
      chipText: '#DFF6E2',
      accentSecondary: '#9BD6A9',
      borderTint: 'rgba(255, 255, 255, 0.1)',
    },
  },
  // Peach / Blush (Hot Coal)
  peach: {
    light: {
      seed: '#FCE3C8',
      bgTint: '#FCF7F2',
      surfaceContainer: '#F8E9DA',
      surfaceContainerHigh: '#F3DCB7',
      surfaceCard: '#FFFFFF',
      primaryAction: '#2F5D3A',
      primaryActionHover: '#23472C',
      primaryActionText: '#FFFFFF',
      onContainer: '#311C0C',
      onContainerVariant: '#68452B',
      chipBg: '#F5E3D2',
      chipText: '#371F0D',
      accentSecondary: '#7F5234',
      borderTint: 'rgba(84, 43, 14, 0.08)',
    },
    dark: {
      seed: '#3A2617',
      bgTint: '#16110D',
      surfaceContainer: '#241B14',
      surfaceContainerHigh: '#30241A',
      surfaceCard: '#271E17',
      primaryAction: '#86D696',
      primaryActionHover: '#98E1A6',
      primaryActionText: '#043916',
      onContainer: '#FBEAD8',
      onContainerVariant: '#E1C4A9',
      chipBg: '#3F2C1F',
      chipText: '#FCECDC',
      accentSecondary: '#E8BF9E',
      borderTint: 'rgba(255, 255, 255, 0.1)',
    },
  },
  // Blush Pink
  blush: {
    light: {
      seed: '#F9D6DB',
      bgTint: '#FDF5F6',
      surfaceContainer: '#F8E1E5',
      surfaceContainerHigh: '#F4CFD5',
      surfaceCard: '#FFFFFF',
      primaryAction: '#2F5D3A',
      primaryActionHover: '#23472C',
      primaryActionText: '#FFFFFF',
      onContainer: '#331318',
      onContainerVariant: '#6B3842',
      chipBg: '#F6DBE0',
      chipText: '#3A141A',
      accentSecondary: '#854652',
      borderTint: 'rgba(84, 25, 36, 0.08)',
    },
    dark: {
      seed: '#381C22',
      bgTint: '#160F11',
      surfaceContainer: '#241619',
      surfaceContainerHigh: '#301D22',
      surfaceCard: '#27181C',
      primaryAction: '#86D696',
      primaryActionHover: '#98E1A6',
      primaryActionText: '#043916',
      onContainer: '#FCE0E5',
      onContainerVariant: '#E0B5BD',
      chipBg: '#3E2127',
      chipText: '#FBE2E7',
      accentSecondary: '#E6A5B2',
      borderTint: 'rgba(255, 255, 255, 0.1)',
    },
  },
};

export const SHAPE_TOKENS = {
  cardRadius: '28px',
  heroRadius: '32px',
  pillRadius: '9999px',
  sheetRadius: '32px',
  buttonPill: '9999px',
  buttonMorphed: '22px',
} as const;

export const TYPOGRAPHY = {
  screenTitle: 'text-[28px] sm:text-[32px] font-extrabold tracking-tight',
  sectionTitle: 'text-[20px] font-bold tracking-tight',
  heroPrompt: 'text-[22px] sm:text-[24px] font-bold leading-snug',
  cardTitle: 'text-[17px] font-bold leading-tight',
  cardSubtitle: 'text-[13px] font-medium opacity-80',
  bodyText: 'text-[15px] leading-relaxed',
  labelCaps: 'text-[11px] font-bold uppercase tracking-wider',
  tabularNumber: 'font-mono tabular-nums font-bold tracking-tight',
} as const;

export const SPRING_TRANSITION = {
  type: 'spring',
  damping: 26,
  stiffness: 320,
} as const;

export const GENTLE_SPRING = {
  type: 'spring',
  damping: 30,
  stiffness: 240,
} as const;
