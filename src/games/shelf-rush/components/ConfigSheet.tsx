import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { allSchemes, campaignData } from '../engine/loader';
import { ShelfRushConfig, ShelfRushScheme } from '../engine/types';
import { SpeedSetting, LifeRule, AccessTimeSetting } from '../engine/constants';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Chip } from '../../../components/ui/Chip';
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
  const { triggerHaptic, reducedMotion } = useTheme();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [direction, setDirection] = useState<number>(1);

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

  const TOTAL_STEPS = 6;

  const STEPS_CONFIG = [
    { id: 1, title: 'Game Mode', subtitle: 'Choose One Scheme or The Ascent' },
    {
      id: 2,
      title: mode === 'scheme' ? 'Canon Scheme' : 'Campaign Length',
      subtitle: mode === 'scheme' ? 'Select a biblical sorting rule' : 'Choose campaign length',
    },
    { id: 3, title: 'Game Speed', subtitle: 'Window duration per card' },
    { id: 4, title: 'Lives Rule', subtitle: 'Life recovery rules on mistakes' },
    { id: 5, title: 'Accessibility Time', subtitle: 'Extra reading window for players' },
    { id: 6, title: 'Review & Launch', subtitle: 'Confirm settings and start race' },
  ];

  // Helper for difficulty dots
  const renderDifficultyDots = (diff: string) => {
    const count = diff === 'easy' ? 1 : diff === 'medium' ? 2 : 3;
    return (
      <div className="flex items-center gap-1" title={`Difficulty: ${diff}`}>
        {[1, 2, 3].map((dot) => (
          <span
            key={dot}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              dot <= count
                ? 'bg-[var(--primary-action)]'
                : 'bg-[var(--border-tint)] opacity-50'
            }`}
          />
        ))}
      </div>
    );
  };

  const selectedScheme = allSchemes.find((s) => s.id === selectedSchemeId);

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
      weakBooks: false,
      seed,
    };
    onStart(config);
  };

  const goToStep = (stepNumber: number) => {
    if (stepNumber === currentStep) return;
    triggerHaptic('selection');
    setDirection(stepNumber > currentStep ? 1 : -1);
    setCurrentStep(stepNumber);
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      goToStep(currentStep + 1);
    } else {
      handleStartGame();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  };

  const stepVariants: Variants = {
    enter: (dir: number) => ({
      x: reducedMotion ? 0 : dir > 0 ? 20 : -20,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.2, ease: 'easeOut' as const },
    },
    exit: (dir: number) => ({
      x: reducedMotion ? 0 : dir > 0 ? -20 : 20,
      opacity: 0,
      transition: { duration: 0.16, ease: 'easeIn' as const },
    }),
  };

  return (
    <Card
      variant="elevated"
      padding="lg"
      className="w-full max-w-xl mx-auto bg-[var(--surface-card)] border-2 border-[var(--border-tint)] shadow-2xl rounded-[32px] flex flex-col gap-5 relative select-none animate-scaleUp overflow-hidden"
    >
      {/* Top Header with step progress and close */}
      <div className="flex items-start justify-between gap-4 border-b border-[var(--border-tint)]/60 pb-3">
        <div className="flex flex-col gap-1 w-full">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--primary-action)] flex items-center gap-1.5">
              <Icon name="bolt" size={13} /> Shelf Rush Setup
            </span>
            <span className="text-[11px] font-extrabold text-[var(--on-container-variant)]">
              Step {currentStep} of {TOTAL_STEPS}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 mt-1">
            <h2 className="text-xl sm:text-2xl font-black text-[var(--on-container)] tracking-tight">
              {STEPS_CONFIG[currentStep - 1].title}
            </h2>

            {onClose && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  onClose();
                }}
                className="w-8 h-8 rounded-full bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] text-[var(--on-container-variant)] flex items-center justify-center transition-colors cursor-pointer border border-[var(--border-tint)]/60 shrink-0"
                aria-label="Close"
              >
                <Icon name="close" size={16} />
              </button>
            )}
          </div>

          <p className="text-xs text-[var(--on-container-variant)] font-medium leading-relaxed">
            {STEPS_CONFIG[currentStep - 1].subtitle}
          </p>

          {/* Progress Bar & Step Dots */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1.5 rounded-full bg-[var(--surface-container-high)] overflow-hidden">
              <div
                className="h-full bg-[var(--primary-action)] rounded-full transition-all duration-300 ease-out"
                style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
              />
            </div>
            <div className="flex items-center gap-1.5">
              {STEPS_CONFIG.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => goToStep(s.id)}
                  aria-label={`Jump to step ${s.id}: ${s.title}`}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    s.id === currentStep
                      ? 'w-6 bg-[var(--primary-action)] shadow-xs'
                      : s.id < currentStep
                      ? 'w-2 bg-[var(--primary-action)]/60'
                      : 'w-2 bg-[var(--border-tint)] hover:bg-[var(--border-tint)]/80'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Guest Read-Only Info */}
      {isGuest ? (
        <div className="p-8 rounded-2xl bg-[var(--surface-container-high)] border border-[var(--border-tint)] text-sm text-[var(--on-container-variant)] flex items-center gap-3">
          <Icon name="timer" size={24} className="text-[var(--primary-action)]" />
          <span className="font-medium">
            Waiting for host to configure and launch Shelf Rush for everyone...
          </span>
        </div>
      ) : (
        /* Animated Multi-Step Body (One Setting Per Screen) */
        <div className="min-h-[290px] flex flex-col justify-between">
          <AnimatePresence mode="wait" custom={direction}>
            {/* STEP 1: Game Mode (One Setting) */}
            {currentStep === 1 && (
              <motion.div
                key="step-mode"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col gap-3 py-1"
              >
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('selection');
                    setMode('scheme');
                  }}
                  className={`p-4 rounded-2xl border-2 text-left flex items-start gap-3.5 transition-all cursor-pointer select-none ${
                    mode === 'scheme'
                      ? 'border-[var(--primary-action)] bg-[var(--primary-action)]/10 shadow-sm ring-2 ring-[var(--primary-action)]/20'
                      : 'border-[var(--border-tint)] bg-[var(--surface-container)] hover:border-[var(--border-tint)]/80 opacity-90'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-[var(--surface-card)] text-[var(--primary-action)] flex items-center justify-center border border-[var(--border-tint)]/60 shrink-0">
                    <Icon name="book-open" size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-[var(--on-container)]">
                        One Scheme Drill
                      </span>
                      {mode === 'scheme' ? (
                        <span className="w-5 h-5 rounded-full bg-[var(--primary-action)] text-white flex items-center justify-center text-xs">
                          <Icon name="check" size={12} strokeWidth={3} />
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--surface-container-high)] text-[var(--on-container-variant)]">
                          8 Schemes
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--on-container-variant)] mt-1 leading-relaxed font-medium">
                      Master a focused canon division like Testaments, Gospels, Epistles, or Pentateuch.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('selection');
                    setMode('ascent');
                  }}
                  className={`p-4 rounded-2xl border-2 text-left flex items-start gap-3.5 transition-all cursor-pointer select-none ${
                    mode === 'ascent'
                      ? 'border-[var(--primary-action)] bg-[var(--primary-action)]/10 shadow-sm ring-2 ring-[var(--primary-action)]/20'
                      : 'border-[var(--border-tint)] bg-[var(--surface-container)] hover:border-[var(--border-tint)]/80 opacity-90'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-[var(--surface-card)] text-[var(--primary-action)] flex items-center justify-center border border-[var(--border-tint)]/60 shrink-0">
                    <Icon name="mountain" size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-[var(--on-container)]">
                        The Ascent Campaign
                      </span>
                      {mode === 'ascent' ? (
                        <span className="w-5 h-5 rounded-full bg-[var(--primary-action)] text-white flex items-center justify-center text-xs">
                          <Icon name="check" size={12} strokeWidth={3} />
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--surface-container-high)] text-[var(--on-container-variant)]">
                          Campaign
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--on-container-variant)] mt-1 leading-relaxed font-medium">
                      Climb through biblical eras with evolving sorting questions, tiers, and rest-stops.
                    </p>
                  </div>
                </button>
              </motion.div>
            )}

            {/* STEP 2: Scheme Choice OR Ascent Length (One Setting) */}
            {currentStep === 2 && (
              <motion.div
                key="step-canon"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col gap-3 py-1"
              >
                {mode === 'scheme' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                    {allSchemes.map((scheme: ShelfRushScheme) => {
                      const isSelected = selectedSchemeId === scheme.id;
                      return (
                        <button
                          key={scheme.id}
                          type="button"
                          onClick={() => {
                            triggerHaptic('selection');
                            setSelectedSchemeId(scheme.id);
                          }}
                          className={`p-3 rounded-2xl text-left border-2 transition-all flex flex-col justify-between gap-2 cursor-pointer select-none ${
                            isSelected
                              ? 'border-[var(--primary-action)] bg-[var(--surface-container-high)] shadow-sm ring-1 ring-[var(--primary-action)]'
                              : 'border-[var(--border-tint)] bg-[var(--surface-container)] hover:border-[var(--border-tint)]/80'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--surface-card)] text-[var(--on-container-variant)] border border-[var(--border-tint)]">
                              {scheme.deckSize} cards
                            </span>
                            {renderDifficultyDots(scheme.difficulty)}
                          </div>
                          <div>
                            <h4 className="text-xs font-extrabold text-[var(--on-container)] leading-snug">
                              {scheme.name}
                            </h4>
                            <p className="text-[11px] text-[var(--on-container-variant)] mt-0.5 line-clamp-1 font-medium">
                              {scheme.question}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('selection');
                        setAscentLength('full');
                      }}
                      className={`p-4 rounded-2xl border-2 text-left flex items-center justify-between gap-3 cursor-pointer ${
                        ascentLength === 'full'
                          ? 'border-[var(--primary-action)] bg-[var(--primary-action)]/10 shadow-sm ring-1 ring-[var(--primary-action)]'
                          : 'border-[var(--border-tint)] bg-[var(--surface-container)] opacity-85'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[var(--surface-card)] text-[var(--primary-action)] flex items-center justify-center border border-[var(--border-tint)]/60">
                          <Icon name="mountain" size={18} />
                        </div>
                        <div>
                          <div className="text-sm font-extrabold text-[var(--on-container)]">
                            Full Campaign
                          </div>
                          <div className="text-xs text-[var(--on-container-variant)]">
                            15 steps · 75 cards across all biblical eras
                          </div>
                        </div>
                      </div>
                      {ascentLength === 'full' && (
                        <span className="w-5 h-5 rounded-full bg-[var(--primary-action)] text-white flex items-center justify-center text-xs">
                          <Icon name="check" size={12} strokeWidth={3} />
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('selection');
                        setAscentLength('short');
                      }}
                      className={`p-4 rounded-2xl border-2 text-left flex items-center justify-between gap-3 cursor-pointer ${
                        ascentLength === 'short'
                          ? 'border-[var(--primary-action)] bg-[var(--primary-action)]/10 shadow-sm ring-1 ring-[var(--primary-action)]'
                          : 'border-[var(--border-tint)] bg-[var(--surface-container)] opacity-85'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[var(--surface-card)] text-[var(--primary-action)] flex items-center justify-center border border-[var(--border-tint)]/60">
                          <Icon name="flag" size={18} />
                        </div>
                        <div>
                          <div className="text-sm font-extrabold text-[var(--on-container)]">
                            Short Sprint
                          </div>
                          <div className="text-xs text-[var(--on-container-variant)]">
                            8 steps · 40 cards for quick sessions
                          </div>
                        </div>
                      </div>
                      {ascentLength === 'short' && (
                        <span className="w-5 h-5 rounded-full bg-[var(--primary-action)] text-white flex items-center justify-center text-xs">
                          <Icon name="check" size={12} strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 3: Game Speed (One Setting) */}
            {currentStep === 3 && (
              <motion.div
                key="step-speed"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col gap-2.5 py-1"
              >
                {[
                  {
                    id: 'relaxed',
                    label: 'Relaxed Speed',
                    desc: 'Generous time window per card. Ideal for relaxed fellowship and learning.',
                    icon: 'timer',
                  },
                  {
                    id: 'standard',
                    label: 'Standard Pace',
                    desc: 'Balanced competitive speed for experienced Bible readers.',
                    icon: 'bolt',
                  },
                  {
                    id: 'blitz',
                    label: 'Blitz Pace',
                    desc: 'Rapid-fire card drops with strict reaction windows.',
                    icon: 'flame',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection');
                      setSpeed(item.id as SpeedSetting);
                    }}
                    className={`p-3.5 rounded-2xl border-2 text-left flex items-start gap-3 transition-all cursor-pointer ${
                      speed === item.id
                        ? 'border-[var(--primary-action)] bg-[var(--primary-action)]/10 shadow-sm ring-1 ring-[var(--primary-action)]'
                        : 'border-[var(--border-tint)] bg-[var(--surface-container)] hover:border-[var(--border-tint)]/80 opacity-85'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-[var(--surface-card)] text-[var(--primary-action)] flex items-center justify-center border border-[var(--border-tint)]/60 shrink-0">
                      <Icon name={item.icon as any} size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-[var(--on-container)]">
                          {item.label}
                        </span>
                        {speed === item.id && (
                          <span className="w-5 h-5 rounded-full bg-[var(--primary-action)] text-white flex items-center justify-center text-xs">
                            <Icon name="check" size={12} strokeWidth={3} />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--on-container-variant)] mt-0.5 leading-relaxed font-medium">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}

            {/* STEP 4: Lives Rule (One Setting) */}
            {currentStep === 4 && (
              <motion.div
                key="step-lives"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col gap-3 py-1"
              >
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('selection');
                    setLifeRule('forgiving');
                  }}
                  className={`p-4 rounded-2xl border-2 text-left flex items-start gap-3.5 transition-all cursor-pointer ${
                    lifeRule === 'forgiving'
                      ? 'border-[var(--primary-action)] bg-[var(--primary-action)]/10 shadow-sm ring-1 ring-[var(--primary-action)]'
                      : 'border-[var(--border-tint)] bg-[var(--surface-container)] hover:border-[var(--border-tint)]/80 opacity-85'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-[var(--surface-card)] text-red-500 flex items-center justify-center border border-[var(--border-tint)]/60 shrink-0">
                    <Icon name="heart" size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-[var(--on-container)]">
                        Forgiving Lives Rule
                      </span>
                      {lifeRule === 'forgiving' && (
                        <span className="w-5 h-5 rounded-full bg-[var(--primary-action)] text-white flex items-center justify-center text-xs">
                          <Icon name="check" size={12} strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--on-container-variant)] mt-1 leading-relaxed font-medium">
                      Disciples can earn lives back through answer streaks and camp rest-stops.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('selection');
                    setLifeRule('strict');
                  }}
                  className={`p-4 rounded-2xl border-2 text-left flex items-start gap-3.5 transition-all cursor-pointer ${
                    lifeRule === 'strict'
                      ? 'border-[var(--primary-action)] bg-[var(--primary-action)]/10 shadow-sm ring-1 ring-[var(--primary-action)]'
                      : 'border-[var(--border-tint)] bg-[var(--surface-container)] hover:border-[var(--border-tint)]/80 opacity-85'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-[var(--surface-card)] text-purple-500 flex items-center justify-center border border-[var(--border-tint)]/60 shrink-0">
                    <Icon name="shield" size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-[var(--on-container)]">
                        Strict Lives Rule
                      </span>
                      {lifeRule === 'strict' && (
                        <span className="w-5 h-5 rounded-full bg-[var(--primary-action)] text-white flex items-center justify-center text-xs">
                          <Icon name="check" size={12} strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--on-container-variant)] mt-1 leading-relaxed font-medium">
                      True endurance challenge — no lives can ever be recovered once lost.
                    </p>
                  </div>
                </button>
              </motion.div>
            )}

            {/* STEP 5: Accessibility Time (One Setting) */}
            {currentStep === 5 && (
              <motion.div
                key="step-access"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col gap-2.5 py-1"
              >
                {[
                  {
                    mult: 1,
                    title: 'Standard Timing',
                    desc: 'Normal timer window without accessibility extensions.',
                    icon: 'timer',
                  },
                  {
                    mult: 1.5,
                    title: '+50% Extended Window',
                    desc: 'Provides 50% more time to read scripture labels and book names.',
                    icon: 'plus',
                  },
                  {
                    mult: 2,
                    title: '+100% Double Window',
                    desc: 'Double the reading time for beginners, youth, or group discussions.',
                    icon: 'double',
                  },
                ].map((item) => (
                  <button
                    key={item.mult}
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection');
                      setAccessTime(item.mult as AccessTimeSetting);
                    }}
                    className={`p-3.5 rounded-2xl border-2 text-left flex items-start gap-3 transition-all cursor-pointer ${
                      accessTime === item.mult
                        ? 'border-[var(--primary-action)] bg-[var(--primary-action)]/10 shadow-sm ring-1 ring-[var(--primary-action)]'
                        : 'border-[var(--border-tint)] bg-[var(--surface-container)] hover:border-[var(--border-tint)]/80 opacity-85'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-[var(--surface-card)] text-[var(--primary-action)] flex items-center justify-center border border-[var(--border-tint)]/60 shrink-0">
                      <Icon name={item.icon as any} size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-[var(--on-container)]">
                          {item.title}
                        </span>
                        {accessTime === item.mult && (
                          <span className="w-5 h-5 rounded-full bg-[var(--primary-action)] text-white flex items-center justify-center text-xs">
                            <Icon name="check" size={12} strokeWidth={3} />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--on-container-variant)] mt-0.5 leading-relaxed font-medium">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}

            {/* STEP 6: Review & Practice Mode Toggle & Launch */}
            {currentStep === 6 && (
              <motion.div
                key="step-review"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col gap-3 py-1"
              >
                {/* Practice Mode Choice */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection');
                      setPractice(false);
                    }}
                    className={`p-3 rounded-2xl border-2 text-left flex flex-col gap-1 cursor-pointer ${
                      !practice
                        ? 'border-[var(--primary-action)] bg-[var(--primary-action)]/10 shadow-sm ring-1 ring-[var(--primary-action)]'
                        : 'border-[var(--border-tint)] bg-[var(--surface-container)] opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[var(--on-container)]">
                        Ranked Race
                      </span>
                      {!practice && (
                        <span className="w-4 h-4 rounded-full bg-[var(--primary-action)] text-white flex items-center justify-center text-[10px]">
                          <Icon name="check" size={10} strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[var(--on-container-variant)] leading-snug">
                      Leaderboard scoring & achievements.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection');
                      setPractice(true);
                    }}
                    className={`p-3 rounded-2xl border-2 text-left flex flex-col gap-1 cursor-pointer ${
                      practice
                        ? 'border-[var(--primary-action)] bg-[var(--primary-action)]/10 shadow-sm ring-1 ring-[var(--primary-action)]'
                        : 'border-[var(--border-tint)] bg-[var(--surface-container)] opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[var(--on-container)]">
                        Practice Drill
                      </span>
                      {practice && (
                        <span className="w-4 h-4 rounded-full bg-[var(--primary-action)] text-white flex items-center justify-center text-[10px]">
                          <Icon name="check" size={10} strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[var(--on-container-variant)] leading-snug">
                      Unlimited lives &amp; card explanations.
                    </span>
                  </button>
                </div>

                {/* Summary Tiles */}
                <div className="p-3.5 rounded-2xl bg-[var(--surface-container-high)] border border-[var(--border-tint)] flex flex-col gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--primary-action)] flex items-center gap-1.5">
                    <Icon name="check" size={12} /> Configuration Summary
                  </span>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex flex-col bg-[var(--surface-card)] p-2 rounded-xl border border-[var(--border-tint)]/60">
                      <span className="text-[10px] text-[var(--on-container-variant)] font-bold uppercase">
                        Mode &amp; Deck
                      </span>
                      <span className="font-extrabold text-[var(--on-container)] truncate">
                        {mode === 'scheme' ? selectedScheme?.name : `The Ascent (${ascentLength})`}
                      </span>
                    </div>

                    <div className="flex flex-col bg-[var(--surface-card)] p-2 rounded-xl border border-[var(--border-tint)]/60">
                      <span className="text-[10px] text-[var(--on-container-variant)] font-bold uppercase">
                        Speed &amp; Lives
                      </span>
                      <span className="font-extrabold text-[var(--on-container)] capitalize">
                        {speed} • {lifeRule}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stepper Navigation: Previous and Next */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-[var(--border-tint)]/60 mt-3">
            <Button
              type="button"
              variant="tonal"
              size="md"
              pill
              disabled={currentStep === 1}
              onClick={handlePrev}
              className={`flex items-center gap-1.5 font-bold ${
                currentStep === 1 ? 'opacity-40 cursor-not-allowed' : ''
              }`}
              leftIcon={<Icon name="arrow-left" size={16} />}
            >
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {currentStep < TOTAL_STEPS ? (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  pill
                  onClick={handleNext}
                  className="font-black shadow-md flex items-center gap-1.5 px-5"
                  rightIcon={<Icon name="arrow-right" size={16} />}
                >
                  <span>Next: {STEPS_CONFIG[currentStep].title}</span>
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="success"
                  size="hero"
                  pill
                  onClick={() => handleStartGame()}
                  className="shadow-xl font-black px-6"
                  leftIcon={<Icon name="play" variant="tonal" size={20} />}
                >
                  <span>{isHost ? 'Start for Everyone' : 'Start Rush'}</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
