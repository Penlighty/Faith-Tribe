import React, { useState } from 'react';
import { allSchemes, campaignData } from '../engine/loader';
import { ShelfRushConfig, ShelfRushScheme } from '../engine/types';
import { SpeedSetting, LifeRule, AccessTimeSetting } from '../engine/constants';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Chip } from '../../../components/ui/Chip';
import { Switch } from '../../../components/ui/Switch';
import { Icon } from '../../../design/icons';
import { useTheme } from '../../../theme/ThemeContext';

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
  const { triggerHaptic } = useTheme();

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

  // Difficulty dots helper with Material 3 tokens
  const getDifficultyDots = (diff: string) => {
    const count = diff === 'easy' ? 1 : diff === 'medium' ? 2 : 3;
    return (
      <div className="flex items-center gap-1" title={`Difficulty: ${diff}`}>
        {[1, 2, 3].map((dot) => (
          <span
            key={dot}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              dot <= count
                ? 'bg-[var(--primary-action)]'
                : 'bg-[var(--border-tint)] opacity-60'
            }`}
          />
        ))}
      </div>
    );
  };

  const todayDateStr = new Date().toISOString().split('T')[0];

  const handleStartGame = (overrideSeed?: number) => {
    triggerHaptic('heavy');
    const seed = overrideSeed ?? Math.floor(Math.random() * 2147483647);
    const config: ShelfRushConfig = {
      mode,
      schemeId: mode === 'scheme' ? selectedSchemeId : undefined,
      length: mode === 'ascent' ? ascentLength : undefined,
      speed,
      lifeRule,
      play: practice ? 'practice' : isHost || isGuest ? 'race' : 'solo',
      playMode: practice ? 'practice' : isHost || isGuest ? 'race' : 'solo',
      accessTime,
      weakBooks: mode === 'scheme' ? weakBooks : false,
      seed,
    };
    onStart(config);
  };

  const handleDailyAscent = () => {
    triggerHaptic('medium');
    const numSeed = parseInt(todayDateStr.replace(/-/g, ''), 10);
    setMode('ascent');
    handleStartGame(numSeed);
  };

  const selectedScheme = allSchemes.find((s) => s.id === selectedSchemeId);

  return (
    <Card
      variant="elevated"
      padding="lg"
      className="w-full max-w-xl mx-auto bg-[var(--surface-card)] border-2 border-[var(--border-tint)] shadow-2xl rounded-[32px] flex flex-col gap-6 relative select-none animate-scaleUp"
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--primary-action)] flex items-center gap-1.5">
              <span>⚡</span> Shelf Rush Setup
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--surface-container-high)] text-[var(--on-container-variant)] border border-[var(--border-tint)]/60">
              M3 Canon Sorter
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--on-container)] tracking-tight">
            Choose Your Mode
          </h2>
          <p className="text-xs sm:text-sm text-[var(--on-container-variant)] font-medium leading-relaxed">
            Select between a focused single-scheme drill or the multi-era Ascent campaign.
          </p>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] text-[var(--on-container-variant)] flex items-center justify-center transition-colors cursor-pointer border border-[var(--border-tint)]/60 shrink-0"
            aria-label="Close"
          >
            <Icon name="close" size={18} />
          </button>
        )}
      </div>

      {/* Mode Selector Cards (Material 3 Selectable Option Cards) */}
      {!isGuest && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Mode 1: One Scheme */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              setMode('scheme');
            }}
            className={`p-4 rounded-2xl border-2 text-left flex flex-col justify-between gap-3 transition-all cursor-pointer select-none ${
              mode === 'scheme'
                ? 'border-[var(--primary-action)] bg-[var(--primary-action)]/10 shadow-sm ring-2 ring-[var(--primary-action)]/20'
                : 'border-[var(--border-tint)] bg-[var(--surface-container)] hover:border-[var(--border-tint)]/80 opacity-90'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-2xl">📚</span>
              {mode === 'scheme' ? (
                <div className="w-5 h-5 rounded-full bg-[var(--primary-action)] text-[var(--primary-action-text,#fff)] flex items-center justify-center shadow-xs">
                  <Icon name="check" size={12} strokeWidth={3} />
                </div>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--surface-container-high)] text-[var(--on-container-variant)] border border-[var(--border-tint)]">
                  8 Schemes
                </span>
              )}
            </div>
            <div>
              <div className="text-base font-black text-[var(--on-container)]">
                One Scheme
              </div>
              <p className="text-xs text-[var(--on-container-variant)] mt-1 leading-relaxed">
                Master a specific canon category (e.g., Testaments, Gospels, Pentateuch).
              </p>
            </div>
          </button>

          {/* Mode 2: The Ascent */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              setMode('ascent');
            }}
            className={`p-4 rounded-2xl border-2 text-left flex flex-col justify-between gap-3 transition-all cursor-pointer select-none ${
              mode === 'ascent'
                ? 'border-[var(--primary-action)] bg-[var(--primary-action)]/10 shadow-sm ring-2 ring-[var(--primary-action)]/20'
                : 'border-[var(--border-tint)] bg-[var(--surface-container)] hover:border-[var(--border-tint)]/80 opacity-90'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-2xl">⛰️</span>
              {mode === 'ascent' ? (
                <div className="w-5 h-5 rounded-full bg-[var(--primary-action)] text-[var(--primary-action-text,#fff)] flex items-center justify-center shadow-xs">
                  <Icon name="check" size={12} strokeWidth={3} />
                </div>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--surface-container-high)] text-[var(--on-container-variant)] border border-[var(--border-tint)]">
                  Campaign
                </span>
              )}
            </div>
            <div>
              <div className="text-base font-black text-[var(--on-container)]">
                The Ascent
              </div>
              <p className="text-xs text-[var(--on-container-variant)] mt-1 leading-relaxed">
                Climb through eras with dynamic questions, difficulty tiers, and rest-stops.
              </p>
            </div>
          </button>
        </div>
      )}

      {/* Mode 1: One Scheme Selector */}
      {mode === 'scheme' && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--on-container)] uppercase tracking-wider flex items-center gap-1.5">
              <span>🎯</span> Select Sorting Rule
            </span>
            <span className="text-[11px] font-mono text-[var(--on-container-variant)]">
              {allSchemes.length} Available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
            {allSchemes.map((scheme: ShelfRushScheme) => {
              const isSelected = selectedSchemeId === scheme.id;
              return (
                <button
                  key={scheme.id}
                  type="button"
                  onClick={() => {
                    if (!isGuest) {
                      triggerHaptic('selection');
                      setSelectedSchemeId(scheme.id);
                    }
                  }}
                  disabled={isGuest}
                  className={`p-3.5 rounded-2xl text-left border-2 transition-all flex flex-col justify-between gap-2.5 cursor-pointer select-none ${
                    isSelected
                      ? 'border-[var(--primary-action)] bg-[var(--surface-container-high)] shadow-sm ring-1 ring-[var(--primary-action)]'
                      : 'border-[var(--border-tint)] bg-[var(--surface-container)] hover:border-[var(--border-tint)]/80 hover:bg-[var(--surface-container-high)]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--surface-card)] text-[var(--on-container-variant)] border border-[var(--border-tint)]">
                      {scheme.deckSize} cards
                    </span>
                    {getDifficultyDots(scheme.difficulty)}
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-[var(--on-container)] leading-snug">
                      {scheme.name}
                    </h4>
                    <p className="text-[11px] text-[var(--on-container-variant)] mt-0.5 line-clamp-1 font-medium">
                      {scheme.question}
                    </p>
                  </div>
                  {/* Mini Bin Assist Chips */}
                  <div className="flex items-center gap-1 flex-wrap pt-0.5">
                    {scheme.bins.slice(0, 3).map((b) => (
                      <span
                        key={b.id}
                        className="text-[9px] px-2 py-0.5 rounded-md font-bold bg-[var(--surface-card)] text-[var(--on-container)] border border-[var(--border-tint)]/60"
                      >
                        {b.label.split(' ')[0]}
                      </span>
                    ))}
                    {scheme.bins.length > 3 && (
                      <span className="text-[9px] font-bold text-[var(--on-container-variant)] px-1">
                        +{scheme.bins.length - 3}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Scheme Tradition Callout */}
          {selectedScheme && (
            <div className="p-3.5 rounded-2xl bg-[var(--surface-container)] border border-[var(--border-tint)] text-xs text-[var(--on-container-variant)] flex items-start gap-2.5">
              <span className="text-base shrink-0">📜</span>
              <div>
                <span className="font-bold text-[var(--on-container)]">Tradition &amp; Rule: </span>
                <span>{selectedScheme.tradition}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: The Ascent Campaign View */}
      {mode === 'ascent' && (
        <div className="flex flex-col gap-4 p-4 sm:p-5 rounded-2xl bg-[var(--surface-container-high)] border border-[var(--border-tint)] shadow-xs">
          <div className="flex items-start gap-3">
            <span className="text-2xl p-2 rounded-xl bg-[var(--surface-card)] border border-[var(--border-tint)] shadow-2xs">
              ⛰️
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[var(--on-container)]">
                {campaignData.name}
              </h3>
              <p className="text-xs text-[var(--on-container-variant)] mt-0.5 font-medium leading-relaxed">
                "{campaignData.tagline}" — Climb through biblical eras with evolving questions and
                increasing speed!
              </p>
            </div>
          </div>

          {/* Length Toggle using M3 Chips */}
          {!isGuest && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[var(--border-tint)]">
              <span className="text-xs font-bold text-[var(--on-container)]">Campaign Length:</span>
              <div className="flex items-center gap-1.5">
                <Chip
                  size="sm"
                  selected={ascentLength === 'full'}
                  onClick={() => setAscentLength('full')}
                >
                  Full (15 steps · 75 cards)
                </Chip>
                <Chip
                  size="sm"
                  selected={ascentLength === 'short'}
                  onClick={() => setAscentLength('short')}
                >
                  Short (8 steps · 40 cards)
                </Chip>
              </div>
            </div>
          )}

          {/* Daily Ascent Button */}
          {!isGuest && (
            <button
              type="button"
              onClick={handleDailyAscent}
              className="w-full py-3 px-4 rounded-2xl bg-[var(--surface-card)] hover:bg-[var(--primary-action)]/10 border-2 border-[var(--primary-action)]/40 text-[var(--on-container)] text-xs font-extrabold flex items-center justify-between transition-all cursor-pointer shadow-xs active:scale-[0.99]"
            >
              <span className="flex items-center gap-2">
                <span className="text-base">📅</span>
                <span>Play Daily Ascent ({todayDateStr})</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--primary-action)] text-[var(--primary-action-text,#fff)]">
                Global Seed →
              </span>
            </button>
          )}
        </div>
      )}

      {/* Gameplay & Speed Tuning Section (M3 List Items) */}
      {!isGuest && (
        <div className="flex flex-col gap-3.5 pt-3 border-t border-[var(--border-tint)]">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--on-container-variant)] flex items-center gap-1.5">
            <Icon name="settings" size={14} className="text-[var(--primary-action)]" />
            Gameplay &amp; Speed Tuning
          </span>

          {/* Speed Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-[var(--surface-container)] border border-[var(--border-tint)]">
            <div>
              <div className="text-xs font-bold text-[var(--on-container)]">Game Speed</div>
              <div className="text-[11px] text-[var(--on-container-variant)]">
                Window duration per sorting card
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {(['relaxed', 'standard', 'blitz'] as SpeedSetting[]).map((s) => (
                <Chip
                  key={s}
                  size="sm"
                  selected={speed === s}
                  onClick={() => setSpeed(s)}
                  className="capitalize font-bold"
                >
                  {s}
                </Chip>
              ))}
            </div>
          </div>

          {/* Lives Rule */}
          <div className="flex flex-col gap-2 p-3 rounded-2xl bg-[var(--surface-container)] border border-[var(--border-tint)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-[var(--on-container)]">Lives Rule</div>
                <div className="text-[11px] text-[var(--on-container-variant)]">
                  {lifeRule === 'forgiving'
                    ? 'Forgiving: earn lives back on streaks & rest-stops'
                    : 'Strict: no lives can ever be earned back'}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {(['forgiving', 'strict'] as LifeRule[]).map((rule) => (
                  <Chip
                    key={rule}
                    size="sm"
                    selected={lifeRule === rule}
                    onClick={() => setLifeRule(rule)}
                    className="capitalize font-bold"
                  >
                    {rule}
                  </Chip>
                ))}
              </div>
            </div>
          </div>

          {/* Extra Time (Accessibility) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-[var(--surface-container)] border border-[var(--border-tint)]">
            <div>
              <div className="text-xs font-bold text-[var(--on-container)]">Extra Accessibility Time</div>
              <div className="text-[11px] text-[var(--on-container-variant)]">
                Extends time window for players who need more reading time
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {([1, 1.5, 2] as AccessTimeSetting[]).map((mult) => (
                <Chip
                  key={mult}
                  size="sm"
                  selected={accessTime === mult}
                  onClick={() => setAccessTime(mult)}
                  className="font-bold"
                >
                  {mult === 1 ? 'Off' : `+${Math.round((mult - 1) * 100)}%`}
                </Chip>
              ))}
            </div>
          </div>

          {/* Practice Mode Switch */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--surface-container)] border border-[var(--border-tint)]">
            <div className="flex flex-col gap-0.5">
              <div className="text-xs font-bold text-[var(--on-container)]">Practice Mode</div>
              <div className="text-[11px] text-[var(--on-container-variant)]">
                Unlimited lives &amp; reveal study blurb on missed cards
              </div>
            </div>
            <Switch
              checked={practice}
              onChange={setPractice}
              ariaLabel="Toggle Practice Mode"
            />
          </div>

          {/* Prioritize Weak Books Switch (Scheme mode only) */}
          {mode === 'scheme' && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--surface-container)] border border-[var(--border-tint)]">
              <div className="flex flex-col gap-0.5">
                <div className="text-xs font-bold text-[var(--on-container)]">Focus Weak Books</div>
                <div className="text-[11px] text-[var(--on-container-variant)]">
                  Target books you recently struggled with to build mastery
                </div>
              </div>
              <Switch
                checked={weakBooks}
                onChange={setWeakBooks}
                ariaLabel="Toggle Focus Weak Books"
              />
            </div>
          )}
        </div>
      )}

      {/* Guest Read-Only Info */}
      {isGuest && (
        <div className="p-4 rounded-2xl bg-[var(--surface-container-high)] border border-[var(--border-tint)] text-xs text-[var(--on-container-variant)] flex items-center gap-3">
          <span className="text-xl">⏳</span>
          <span className="font-medium">
            Waiting for host to configure and launch Shelf Rush for everyone...
          </span>
        </div>
      )}

      {/* Primary Action Button (Material 3 Expressive Pill Button) */}
      {!isGuest && (
        <Button
          variant="primary"
          size="hero"
          pill
          onClick={() => handleStartGame()}
          className="w-full shadow-lg"
          leftIcon={<Icon name="play" variant="tonal" size={20} />}
        >
          <span>{isHost ? 'Start for Everyone 🚀' : 'Start Rush ⚡'}</span>
        </Button>
      )}
    </Card>
  );
};
