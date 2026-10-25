import React, { useState } from 'react';
import { allSchemes, campaignData } from '../engine/loader';
import { ShelfRushConfig, ShelfRushScheme } from '../engine/types';
import { SpeedSetting, LifeRule, AccessTimeSetting } from '../engine/constants';
import { Icon } from '@design/icons';

export interface ConfigSheetProps {
  initialConfig?: Partial<ShelfRushConfig>;
  isHost?: boolean;
  isGuest?: boolean;
  onStart: (config: ShelfRushConfig) => void;
  onClose?: () => void;
}

export const ConfigSheet: React.FC<ConfigSheetProps> = ({
  initialConfig,
  isHost = false,
  isGuest = false,
  onStart,
  onClose,
}) => {
  const [mode, setMode] = useState<'scheme' | 'ascent'>(initialConfig?.mode || 'scheme');
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>(
    initialConfig?.schemeId || 'testament'
  );
  const [ascentLength, setAscentLength] = useState<'full' | 'short'>(
    initialConfig?.length || 'full'
  );
  const [speed, setSpeed] = useState<SpeedSetting>(initialConfig?.speed || 'standard');
  const [lifeRule, setLifeRule] = useState<LifeRule>(initialConfig?.lifeRule || 'forgiving');
  const [accessTime, setAccessTime] = useState<AccessTimeSetting>(initialConfig?.accessTime || 1);
  const [practice, setPractice] = useState<boolean>(initialConfig?.playMode === 'practice');
  const [weakBooks, setWeakBooks] = useState<boolean>(!!initialConfig?.weakBooks);

  // Difficulty dots helper
  const getDifficultyDots = (diff: string) => {
    const count = diff === 'easy' ? 1 : diff === 'medium' ? 2 : 3;
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3].map((dot) => (
          <span
            key={dot}
            className={`w-1.5 h-1.5 rounded-full ${
              dot <= count ? 'bg-purple-600 dark:bg-purple-400' : 'bg-gray-300 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>
    );
  };

  const todayDateStr = new Date().toISOString().split('T')[0];

  const handleStartGame = (overrideSeed?: number) => {
    const seed = overrideSeed ?? Math.floor(Math.random() * 2147483647);
    const config: ShelfRushConfig = {
      mode,
      schemeId: mode === 'scheme' ? selectedSchemeId : undefined,
      length: mode === 'ascent' ? ascentLength : undefined,
      speed,
      lifeRule,
      playMode: practice ? 'practice' : isHost || isGuest ? 'race' : 'solo',
      accessTime,
      weakBooks: mode === 'scheme' ? weakBooks : false,
      seed,
    };
    onStart(config);
  };

  const handleDailyAscent = () => {
    // Generate deterministic seed based on today's date YYYYMMDD
    const numSeed = parseInt(todayDateStr.replace(/-/g, ''), 10);
    setMode('ascent');
    handleStartGame(numSeed);
  };

  const selectedScheme = allSchemes.find((s) => s.id === selectedSchemeId);

  return (
    <div className="w-full max-w-lg mx-auto bg-[var(--surface)] text-[var(--on-surface)] rounded-3xl p-5 shadow-xl border border-[var(--border-tint)] flex flex-col gap-5 select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            Shelf Rush Setup
          </span>
          <h2 className="text-2xl font-black">Choose Your Mode</h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-sm font-bold"
            aria-label="Close"
          >
            ✕
          </button>
        )}
      </div>

      {/* Mode Segmented Control */}
      {!isGuest && (
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-[var(--surface-container)] border border-[var(--border-tint)]">
          <button
            type="button"
            onClick={() => setMode('scheme')}
            className={`py-2 rounded-xl text-sm font-bold transition-all ${
              mode === 'scheme'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-[var(--on-container-variant)] hover:text-[var(--on-container)]'
            }`}
          >
            One Scheme
          </button>
          <button
            type="button"
            onClick={() => setMode('ascent')}
            className={`py-2 rounded-xl text-sm font-bold transition-all ${
              mode === 'ascent'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-[var(--on-container-variant)] hover:text-[var(--on-container)]'
            }`}
          >
            The Ascent
          </button>
        </div>
      )}

      {/* Mode 1: One Scheme View */}
      {mode === 'scheme' && (
        <div className="flex flex-col gap-3">
          <div className="text-xs font-bold text-[var(--on-container-variant)] uppercase tracking-wider">
            Select Sorting Scheme (8 available)
          </div>
          <div className="grid grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
            {allSchemes.map((scheme: ShelfRushScheme) => {
              const isSelected = selectedSchemeId === scheme.id;
              return (
                <button
                  key={scheme.id}
                  type="button"
                  onClick={() => !isGuest && setSelectedSchemeId(scheme.id)}
                  disabled={isGuest}
                  className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between gap-2 ${
                    isSelected
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 ring-2 ring-purple-400'
                      : 'border-[var(--border-tint)] bg-[var(--surface-container)] hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold opacity-60">
                      {scheme.deckSize} cards
                    </span>
                    {getDifficultyDots(scheme.difficulty)}
                  </div>
                  <div>
                    <h4 className="text-sm font-black leading-tight text-[var(--on-container)]">
                      {scheme.name}
                    </h4>
                    <p className="text-[11px] text-[var(--on-container-variant)] mt-0.5 line-clamp-1">
                      {scheme.question}
                    </p>
                  </div>
                  {/* Mini Bin Chips */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {scheme.bins.slice(0, 3).map((b) => (
                      <span
                        key={b.id}
                        className="text-[9px] px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/5 font-bold"
                      >
                        {b.label.split(' ')[0]}
                      </span>
                    ))}
                    {scheme.bins.length > 3 && (
                      <span className="text-[9px] font-bold opacity-60">
                        +{scheme.bins.length - 3}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Tradition note of selected scheme */}
          {selectedScheme && (
            <div className="p-3 rounded-xl bg-[var(--surface-container)] text-xs text-[var(--on-container-variant)] border border-[var(--border-tint)]">
              <span className="font-bold text-[var(--on-container)]">Tradition: </span>
              {selectedScheme.tradition}
            </div>
          )}
        </div>
      )}

      {/* Mode 2: The Ascent Campaign View */}
      {mode === 'ascent' && (
        <div className="flex flex-col gap-4 p-4 rounded-2xl bg-gradient-to-br from-purple-900/10 to-indigo-900/10 border border-purple-500/20">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">⛰️</span>
              <h3 className="text-lg font-black text-purple-950 dark:text-purple-200">
                {campaignData.name}
              </h3>
            </div>
            <p className="text-xs text-[var(--on-container-variant)] mt-0.5">
              "{campaignData.tagline}" — Climb through biblical eras with evolving questions and
              increasing speed!
            </p>
          </div>

          {/* Length toggle */}
          {!isGuest && (
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">Campaign Length:</span>
              <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[var(--surface-container)] text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setAscentLength('full')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    ascentLength === 'full'
                      ? 'bg-purple-600 text-white'
                      : 'text-[var(--on-container-variant)]'
                  }`}
                >
                  Full (15 steps · 75 cards)
                </button>
                <button
                  type="button"
                  onClick={() => setAscentLength('short')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    ascentLength === 'short'
                      ? 'bg-purple-600 text-white'
                      : 'text-[var(--on-container-variant)]'
                  }`}
                >
                  Short (8 steps · 40 cards)
                </button>
              </div>
            </div>
          )}

          {/* Daily Ascent Button */}
          {!isGuest && (
            <button
              type="button"
              onClick={handleDailyAscent}
              className="w-full py-2.5 px-3 rounded-xl bg-purple-100 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-800 text-purple-900 dark:text-purple-200 text-xs font-black flex items-center justify-between hover:bg-purple-200 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <span>📅</span>
                <span>Play Daily Ascent ({todayDateStr})</span>
              </span>
              <span className="text-[10px] font-mono opacity-70">Shared Daily Seed →</span>
            </button>
          )}
        </div>
      )}

      {/* Settings Rows */}
      {!isGuest && (
        <div className="flex flex-col gap-3 pt-2 border-t border-[var(--border-tint)] text-xs">
          {/* Speed */}
          <div className="flex items-center justify-between">
            <span className="font-bold">Speed:</span>
            <div className="flex items-center gap-1 bg-[var(--surface-container)] p-1 rounded-xl">
              {(['relaxed', 'standard', 'blitz'] as SpeedSetting[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSpeed(s)}
                  className={`px-2.5 py-1 rounded-lg capitalize font-bold transition-all ${
                    speed === s
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-[var(--on-container-variant)]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Lives Rule */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="font-bold">Lives:</span>
              <div className="flex items-center gap-1 bg-[var(--surface-container)] p-1 rounded-xl">
                {(['forgiving', 'strict'] as LifeRule[]).map((rule) => (
                  <button
                    key={rule}
                    type="button"
                    onClick={() => setLifeRule(rule)}
                    className={`px-2.5 py-1 rounded-lg capitalize font-bold transition-all ${
                      lifeRule === rule
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-[var(--on-container-variant)]'
                    }`}
                  >
                    {rule}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-[var(--on-container-variant)] italic">
              {lifeRule === 'forgiving'
                ? 'Forgiving: earn lives back as you go (streak & rest stops)'
                : 'Strict: no lives are ever earned back'}
            </p>
          </div>

          {/* Extra Time */}
          <div className="flex items-center justify-between">
            <span className="font-bold">Extra Time:</span>
            <div className="flex items-center gap-1 bg-[var(--surface-container)] p-1 rounded-xl">
              {([1, 1.5, 2] as AccessTimeSetting[]).map((mult) => (
                <button
                  key={mult}
                  type="button"
                  onClick={() => setAccessTime(mult)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    accessTime === mult
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-[var(--on-container-variant)]'
                  }`}
                >
                  {mult === 1 ? 'Off' : `x${mult}`}
                </button>
              ))}
            </div>
          </div>

          {/* Practice Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold">Practice Mode:</span>
              <p className="text-[10px] text-[var(--on-container-variant)]">
                Unlimited lives & reveal answers on miss
              </p>
            </div>
            <input
              type="checkbox"
              checked={practice}
              onChange={(e) => setPractice(e.target.checked)}
              className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
            />
          </div>

          {/* Weak Books (Scheme mode only) */}
          {mode === 'scheme' && (
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold">Prioritize Weak Books:</span>
                <p className="text-[10px] text-[var(--on-container-variant)]">
                  Focus on books you missed recently
                </p>
              </div>
              <input
                type="checkbox"
                checked={weakBooks}
                onChange={(e) => setWeakBooks(e.target.checked)}
                className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
              />
            </div>
          )}
        </div>
      )}

      {/* Guest Read-Only Info */}
      {isGuest && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 border border-amber-300/40 text-xs">
          Waiting for host to configure and launch Shelf Rush for everyone...
        </div>
      )}

      {/* Primary Action Button */}
      {!isGuest && (
        <button
          type="button"
          onClick={() => handleStartGame()}
          className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-base shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <span>{isHost ? 'Start for Everyone 🚀' : 'Start Rush ⚡'}</span>
        </button>
      )}
    </div>
  );
};
