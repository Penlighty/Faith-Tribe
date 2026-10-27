// Tribal Calling Assessment Modal
// 7 Biblical Trait Dimensions Spectrum with Euclidean Distance Matching & 14-day Cooldown
// Strictly ONE trait / setting per step, zero emojis, full system icon set.

import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { MaterialSlider } from '../ui/MaterialSlider';
import { Icon } from '../../design/icons/Icon';
import { TribeAvatar } from './TribeAvatar';
import {
  TRAIT_DIMENSIONS,
  calculateTribalCalling,
  canRetakeAssessment,
  TribalMatchResult,
  TRIBAL_ASSESSMENT_COOLDOWN_DAYS,
} from '../../design/tribes/tribes';
import { useAuth } from '../../engine/auth/AuthContext';
import { useTheme } from '../../theme/ThemeContext';
import { soundManager } from '../../engine/services/audio';

interface TribalAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssigned?: (tribeId: string) => void;
}

const stepVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 30 : -30,
    opacity: 0,
    filter: 'blur(4px)',
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.25, ease: 'easeOut' as const },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 30 : -30,
    opacity: 0,
    filter: 'blur(4px)',
    transition: { duration: 0.18, ease: 'easeIn' as const },
  }),
};

export const TribalAssessmentModal: React.FC<TribalAssessmentModalProps> = ({
  isOpen,
  onClose,
  onAssigned,
}) => {
  const { user, updateProfile } = useAuth();
  const { triggerHaptic } = useTheme();

  // Trait sliders state (0 to 100, default 50)
  const [traits, setTraits] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    TRAIT_DIMENSIONS.forEach((d) => {
      initial[d.id] = user?.tribalAssessment?.traits?.[d.id] ?? 50;
    });
    return initial;
  });

  // Step 0: Welcome / Status
  // Steps 1 to 7: Trait Dimensions
  // Step 8: Calculated Reveal
  const [step, setStep] = useState<number>(0);
  const [direction, setDirection] = useState<number>(1);
  const [matchResult, setMatchResult] = useState<TribalMatchResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const cooldownStatus = canRetakeAssessment(user?.tribalAssessment?.assessedAt);

  if (!isOpen) return null;

  const currentTrait = step >= 1 && step <= 7 ? TRAIT_DIMENSIONS[step - 1] : null;

  const handleNext = () => {
    triggerHaptic('light');
    soundManager.playTick(true);
    if (step < 7) {
      setDirection(1);
      setStep((s) => s + 1);
    } else if (step === 7) {
      // Calculate match
      const result = calculateTribalCalling(traits);
      setMatchResult(result);
      setDirection(1);
      setStep(8);
      soundManager.playChime(true);
      triggerHaptic('heavy');
    }
  };

  const handleBack = () => {
    triggerHaptic('light');
    if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  };

  const handleSliderChange = (traitId: string, value: number) => {
    setTraits((prev) => ({ ...prev, [traitId]: value }));
  };

  const handleClaimTribe = async () => {
    if (!matchResult) return;
    setIsSaving(true);
    try {
      triggerHaptic('medium');
      await updateProfile({
        biblicalTribeId: matchResult.primaryTribe.id,
        tribalAssessment: {
          biblicalTribeId: matchResult.primaryTribe.id,
          assessedAt: Date.now(),
          traits,
          matchPercentage: matchResult.matchPercentage,
          secondaryTribeId: matchResult.secondaryTribe.id,
        },
      });
      if (onAssigned) {
        onAssigned(matchResult.primaryTribe.id);
      }
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  // Helper for live trait disposition text
  const getTraitLiveLabel = (val: number, trait: typeof TRAIT_DIMENSIONS[0]) => {
    if (val <= 25) return { text: trait.lowLabel, desc: trait.lowDescription, tier: 'low' };
    if (val <= 50) return { text: `Moderately ${trait.lowLabel}`, desc: `Leans toward ${trait.lowLabel.toLowerCase()}, with adaptable balance.`, tier: 'mid-low' };
    if (val <= 75) return { text: `Moderately ${trait.highLabel}`, desc: `Leans toward ${trait.highLabel.toLowerCase()}, active in most settings.`, tier: 'mid-high' };
    return { text: trait.highLabel, desc: trait.highDescription, tier: 'high' };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <Card
        variant="elevated"
        padding="none"
        className="w-full max-w-lg bg-[var(--surface-card)] border-2 border-[var(--border-tint)] shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-[var(--border-tint)] flex items-center justify-between bg-[var(--surface-container)] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--primary-action)]/15 text-[var(--primary-action)] flex items-center justify-center">
              <Icon name="tribe" size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[var(--on-container)] leading-tight">
                Ancestral Tribe Calling
              </h2>
              <p className="text-[11px] font-semibold text-[var(--on-container-variant)]">
                {step === 0
                  ? '7-Trait Biblical Personality Spectrum'
                  : step <= 7
                  ? `Trait Dimension ${step} of 7`
                  : 'Tribal Calling Revealed'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--surface-card)] hover:bg-[var(--surface-container-high)] text-[var(--on-container-variant)] flex items-center justify-center border border-[var(--border-tint)] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        {/* Multi-Step Progress Track (Active during steps 1 to 7) */}
        {step >= 1 && step <= 7 && (
          <div className="w-full bg-[var(--surface-container-high)] h-1.5 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[var(--primary-action)] to-amber-500"
              initial={{ width: `${((step - 1) / 7) * 100}%` }}
              animate={{ width: `${(step / 7) * 100}%` }}
              transition={{ duration: 0.25 }}
            />
          </div>
        )}

        {/* Step Body (Scrollable container) */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 flex flex-col justify-center">
          <AnimatePresence custom={direction} mode="wait">
            {/* ── STEP 0: Orientation & Cooldown Check ── */}
            {step === 0 && (
              <motion.div
                key="step-0"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col gap-5 text-center items-center py-2"
              >
                <div className="w-20 h-20 rounded-3xl bg-[var(--primary-action)]/10 text-[var(--primary-action)] flex items-center justify-center border-2 border-[var(--primary-action)]/30 shadow-md">
                  <Icon name="tribe" size={44} />
                </div>

                <div className="flex flex-col gap-2 max-w-sm">
                  <h3 className="text-xl sm:text-2xl font-black text-[var(--on-container)]">
                    Discover Your Ancestral Tribe
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--on-container-variant)] leading-relaxed">
                    In the scriptures, each tribe carries distinct characteristics, callings, and spiritual dispositions
                    (Gen 49, 1 Chr 12). By rating your natural traits across 7 biblical spectrums, your ancestral tribe archetype is calculated.
                  </p>
                </div>

                {/* Cooldown Status Badge */}
                {!cooldownStatus.canRetake ? (
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/50 flex flex-col gap-2 max-w-sm text-left">
                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
                      <Icon name="lock" size={14} />
                      <span>Ancestral Calling Consecrated</span>
                    </div>
                    <p className="text-xs text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
                      Your current tribe calling is locked to preserve spiritual commitment. You can retake the calling assessment in{' '}
                      <strong>{cooldownStatus.daysRemaining} days</strong>.
                    </p>
                    {user?.biblicalTribeId && (
                      <div className="mt-1 pt-2 border-t border-amber-200 dark:border-amber-800/60 flex items-center gap-3">
                        <TribeAvatar tribeId={user.biblicalTribeId} size="sm" />
                        <span className="text-xs font-black text-amber-950 dark:text-amber-100">
                          Current Tribe: Tribe of {user.biblicalTribeId.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-[var(--surface-container)] border border-[var(--border-tint)] flex flex-col gap-1.5 max-w-sm text-left">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[var(--primary-action)] flex items-center gap-1.5">
                      <Icon name="info" size={14} /> One Setting Per Step
                    </span>
                    <p className="text-xs text-[var(--on-container-variant)] leading-relaxed">
                      You will rate yourself on 7 intuitive sliders. Once discovered, your tribe remains your calling badge across all fellowship games for {TRIBAL_ASSESSMENT_COOLDOWN_DAYS} days.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── STEPS 1 TO 7: Single Trait Slider Dimension ── */}
            {currentTrait && (
              <motion.div
                key={`step-${step}`}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col gap-6"
              >
                {/* Dimension Header */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[var(--primary-action)] flex items-center gap-1.5">
                      <Icon name={currentTrait.iconName} size={14} />
                      <span>Dimension {step} of 7</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-[var(--surface-container)] px-2 py-0.5 rounded-full border border-[var(--border-tint)] text-[var(--on-container-variant)]">
                      {currentTrait.scriptureRef}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-[var(--on-container)]">
                    {currentTrait.name}
                  </h3>
                  <p className="text-xs text-[var(--on-container-variant)] font-medium">
                    {currentTrait.subtitle}
                  </p>
                </div>

                {/* Biblical Anchor Quote */}
                <div className="p-3 rounded-2xl bg-[var(--surface-container)] border border-[var(--border-tint)] text-xs font-serif italic text-[var(--on-container)] leading-relaxed text-center">
                  “{currentTrait.biblicalAnchor}”
                </div>

                {/* Big Interactive Material 3 Slider */}
                <div className="flex flex-col gap-2 py-1">
                  <div className="flex items-center justify-between text-xs font-bold text-[var(--on-container-variant)]">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Icon name="minus" size={12} /> {currentTrait.lowLabel}
                    </span>
                    <span className="text-base font-black font-mono text-[var(--primary-action)]">
                      {traits[currentTrait.id]}%
                    </span>
                    <span className="flex items-center gap-1 text-[11px]">
                      {currentTrait.highLabel} <Icon name="plus" size={12} />
                    </span>
                  </div>

                  <MaterialSlider
                    value={traits[currentTrait.id]}
                    min={0}
                    max={100}
                    step={1}
                    onChange={(val) => handleSliderChange(currentTrait.id, val)}
                    ariaLabel={currentTrait.name}
                    showValueBadge
                  />
                </div>

                {/* Live Dynamic Disposition Card */}
                {(() => {
                  const live = getTraitLiveLabel(traits[currentTrait.id], currentTrait);
                  return (
                    <div className="p-4 rounded-2xl bg-[var(--surface-container)] border border-[var(--border-tint)] flex flex-col gap-1 shadow-inner text-center">
                      <span className="text-xs font-black text-[var(--primary-action)] uppercase tracking-wide">
                        Your Disposition: {live.text}
                      </span>
                      <p className="text-xs text-[var(--on-container-variant)] leading-relaxed">
                        {live.desc}
                      </p>
                    </div>
                  );
                })()}
              </motion.div>
            )}

            {/* ── STEP 8: The Tribal Reveal ── */}
            {step === 8 && matchResult && (
              <motion.div
                key="step-8"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col gap-5 text-center items-center py-1"
              >
                <div className="relative">
                  <TribeAvatar tribeId={matchResult.primaryTribe.id} size="hero" showGlow />
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-black uppercase tracking-wider text-[var(--primary-action)] flex items-center justify-center gap-1.5">
                    <Icon name="crown" size={14} />
                    <span>Your Prescribed Ancestral Tribe</span>
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-[var(--on-container)]">
                    Tribe of {matchResult.primaryTribe.name}
                  </h3>
                  <p className="text-xs font-bold text-[var(--on-container-variant)]">
                    {matchResult.primaryTribe.title} &bull; {matchResult.matchPercentage}% Calling Match
                  </p>
                </div>

                {/* Scripture Prophecy */}
                <div className="p-3.5 rounded-2xl bg-[var(--surface-container)] border border-[var(--border-tint)] text-xs text-[var(--on-container)] font-serif italic max-w-sm leading-relaxed">
                  “{matchResult.primaryTribe.verseText}”
                  <div className="text-[10px] font-sans font-bold not-italic text-[var(--primary-action)] mt-1">
                    — {matchResult.primaryTribe.source}
                  </div>
                </div>

                {/* Top Aligned Dimensions */}
                <div className="w-full flex flex-col gap-2 text-left">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[var(--on-container-variant)]">
                    Top Aligned Dispositions:
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {matchResult.topAlignedTraits.map(({ trait, userScore }) => (
                      <div
                        key={trait.id}
                        className="p-2.5 rounded-xl bg-[var(--surface-container)] border border-[var(--border-tint)] flex items-center justify-between text-xs"
                      >
                        <span className="font-bold text-[var(--on-container)] flex items-center gap-1.5">
                          <Icon name={trait.iconName} size={14} className="text-[var(--primary-action)]" />
                          <span>{trait.name}</span>
                        </span>
                        <span className="font-mono font-black text-[var(--primary-action)]">
                          {userScore}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Secondary Affinity */}
                <div className="text-[11px] text-[var(--on-container-variant)]">
                  Secondary Ancestral Affinity: <strong>Tribe of {matchResult.secondaryTribe.name}</strong> ({matchResult.secondaryMatchPercentage}%)
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Navigation Bar */}
        <div className="p-4 sm:p-5 border-t border-[var(--border-tint)] bg-[var(--surface-container)] flex items-center justify-between shrink-0 gap-3">
          {step === 0 ? (
            <>
              <Button variant="tonal" size="md" pill onClick={onClose} className="font-bold">
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                pill
                disabled={!cooldownStatus.canRetake}
                onClick={handleNext}
                className="font-black px-6 shadow-md flex items-center gap-1.5"
              >
                <span>Begin Assessment</span>
                <Icon name="arrow-right" size={14} />
              </Button>
            </>
          ) : step <= 7 ? (
            <>
              <Button variant="tonal" size="md" pill onClick={handleBack} className="font-bold flex items-center gap-1">
                <Icon name="arrow-left" size={14} />
                <span>{step === 1 ? 'Back to Intro' : 'Previous Trait'}</span>
              </Button>
              <Button
                variant="primary"
                size="md"
                pill
                onClick={handleNext}
                className="font-black px-6 shadow-md flex items-center gap-1.5"
              >
                <span>{step === 7 ? 'Reveal My Tribe' : 'Next Trait'}</span>
                <Icon name="arrow-right" size={14} />
              </Button>
            </>
          ) : (
            <>
              <Button variant="tonal" size="md" pill onClick={handleBack} className="font-bold flex items-center gap-1">
                <Icon name="arrow-left" size={14} />
                <span>Adjust Ratings</span>
              </Button>
              <Button
                variant="success"
                size="md"
                pill
                disabled={isSaving}
                onClick={handleClaimTribe}
                className="font-black px-6 shadow-md flex items-center gap-1.5"
              >
                <Icon name="check" size={16} />
                <span>{isSaving ? 'Claiming Calling…' : 'Claim My Ancestral Tribe'}</span>
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};
