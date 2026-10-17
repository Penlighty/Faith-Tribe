import React, { createContext, useContext, useEffect, useState } from 'react';
import { PALETTE_PRESETS, TonalPalette } from './tokens';

import { soundManager } from '../engine/services/audio';

export type PaletteKey = 'lavender' | 'butter' | 'mint' | 'peach' | 'blush';
export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  paletteKey: PaletteKey;
  setPaletteKey: (key: PaletteKey) => void;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  isDark: boolean;
  palette: TonalPalette;
  reducedMotion: boolean;
  setReducedMotion: (val: boolean) => void;
  hapticsEnabled: boolean;
  setHapticsEnabled: (val: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  masterVolume: number;
  setMasterVolume: (val: number) => void;
  sfxVolume: number;
  setSfxVolume: (val: number) => void;
  ambientVolume: number;
  setAmbientVolume: (val: number) => void;
  triggerHaptic: (type?: 'light' | 'medium' | 'heavy' | 'selection') => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [paletteKey, setPaletteKey] = useState<PaletteKey>('lavender');
  const [mode, setMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem('agape_theme_mode') as ThemeMode) || 'system';
  });
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    const saved = localStorage.getItem('agape_reduced_motion');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('agape_haptics') !== 'false';
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('agape_sound') !== 'false';
  });
  const [masterVolume, setMasterVolumeState] = useState<number>(() => {
    return soundManager.getMasterVolume();
  });
  const [sfxVolume, setSfxVolumeState] = useState<number>(() => {
    return soundManager.getSfxVolume();
  });
  const [ambientVolume, setAmbientVolumeState] = useState<number>(() => {
    return soundManager.getAmbientVolume();
  });

  const setMasterVolume = (val: number) => {
    setMasterVolumeState(val);
    soundManager.setMasterVolume(val);
  };

  const setSfxVolume = (val: number) => {
    setSfxVolumeState(val);
    soundManager.setSfxVolume(val);
  };

  const setAmbientVolume = (val: number) => {
    setAmbientVolumeState(val);
    soundManager.setAmbientVolume(val);
  };

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  const isDark = mode === 'dark' || (mode === 'system' && systemIsDark);

  // Apply dark class to documentElement
  useEffect(() => {
    localStorage.setItem('agape_theme_mode', mode);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark, mode]);

  useEffect(() => {
    localStorage.setItem('agape_reduced_motion', String(reducedMotion));
  }, [reducedMotion]);

  useEffect(() => {
    localStorage.setItem('agape_haptics', String(hapticsEnabled));
  }, [hapticsEnabled]);

  useEffect(() => {
    localStorage.setItem('agape_sound', String(soundEnabled));
  }, [soundEnabled]);

  const activePreset = PALETTE_PRESETS[paletteKey] || PALETTE_PRESETS.lavender;
  const palette = isDark ? activePreset.dark : activePreset.light;

  // Dynamically inject CSS variables into document root for seamless transitions
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--seed-color', palette.seed);
    root.style.setProperty('--bg-tint', palette.bgTint);
    root.style.setProperty('--surface-container', palette.surfaceContainer);
    root.style.setProperty('--surface-container-high', palette.surfaceContainerHigh);
    root.style.setProperty('--surface-card', palette.surfaceCard);
    root.style.setProperty('--primary-action', palette.primaryAction);
    root.style.setProperty('--primary-action-hover', palette.primaryActionHover);
    root.style.setProperty('--primary-action-text', palette.primaryActionText);
    root.style.setProperty('--on-container', palette.onContainer);
    root.style.setProperty('--on-container-variant', palette.onContainerVariant);
    root.style.setProperty('--accent-secondary', palette.accentSecondary);
    root.style.setProperty('--border-tint', palette.borderTint);
  }, [palette]);

  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'selection' = 'light') => {
    if (!hapticsEnabled || typeof window === 'undefined' || !('vibrate' in navigator)) return;
    try {
      switch (type) {
        case 'light':
        case 'selection':
          navigator.vibrate(12);
          break;
        case 'medium':
          navigator.vibrate(30);
          break;
        case 'heavy':
          navigator.vibrate([40, 30, 40]);
          break;
      }
    } catch {
      // Ignore vibration errors if blocked by browser policy
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        paletteKey,
        setPaletteKey,
        mode,
        setMode,
        isDark,
        palette,
        reducedMotion,
        setReducedMotion,
        hapticsEnabled,
        setHapticsEnabled,
        soundEnabled,
        setSoundEnabled,
        masterVolume,
        setMasterVolume,
        sfxVolume,
        setSfxVolume,
        ambientVolume,
        setAmbientVolume,
        triggerHaptic,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
