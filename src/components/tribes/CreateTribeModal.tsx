import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Icon } from '../../design/icons';
import { useTheme } from '../../theme/ThemeContext';
import { TRIBES, TRIBES_BY_ID } from '../../design/tribes/tribes';
import { InvitePolicy } from '../../engine/tribes/types';
import { TribeAvatar } from './TribeAvatar';
import { TribalAssessmentModal } from './TribalAssessmentModal';
import { useAuth } from '../../engine/auth/AuthContext';

export interface CreateTribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    name: string,
    tagline: string,
    biblicalTribe: string,
    invitePolicy: InvitePolicy
  ) => Promise<void>;
}

const STEPS = [
  { id: 1, title: 'Fellowship Name', subtitle: 'What is the name of your biblical fellowship group?' },
  { id: 2, title: 'Scripture Focus', subtitle: 'Choose an anchor verse or spiritual mission statement' },
  { id: 3, title: 'Ancestral Emblem', subtitle: 'Select or discover one of the 12 Biblical Tribes of Israel' },
  { id: 4, title: 'Membership Policy', subtitle: 'Choose how new members join your fellowship' },
  { id: 5, title: 'Review & Establish', subtitle: 'Verify your fellowship card and officially establish' },
] as const;

const SCRIPTURE_SUGGESTIONS = [
  'Walking in Light • 1 John 1:7',
  'Iron Sharpens Iron • Prov 27:17',
  'Faith, Hope & Love • 1 Cor 13:13',
  'One Body in Christ • Rom 12:5',
  'Rooted & Built Up • Col 2:7',
  'Salt & Light • Matt 5:13',
];

export const CreateTribeModal: React.FC<CreateTribeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { triggerHaptic, reducedMotion } = useTheme();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [direction, setDirection] = useState<number>(1);

  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [biblicalTribe, setBiblicalTribe] = useState<string>(user?.biblicalTribeId || 'judah');
  const [invitePolicy, setInvitePolicy] = useState<InvitePolicy>('open');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);

  if (!isOpen) return null;

  const goToStep = (stepNumber: number) => {
    if (stepNumber === currentStep) return;
    if (stepNumber > 1 && !name.trim()) {
      setNameError(true);
      triggerHaptic('heavy');
      setCurrentStep(1);
      return;
    }
    setNameError(false);
    triggerHaptic('selection');
    setDirection(stepNumber > currentStep ? 1 : -1);
    setCurrentStep(stepNumber);
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!name.trim()) {
        setNameError(true);
        triggerHaptic('heavy');
        return;
      }
      setNameError(false);
      goToStep(2);
    } else if (currentStep < 5) {
      goToStep(currentStep + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  };

  const handleFinalSubmit = async () => {
    if (!name.trim() || isSubmitting) return;
    setIsSubmitting(true);
    triggerHaptic('medium');
    try {
      await onSubmit(name.trim(), tagline.trim(), biblicalTribe, invitePolicy);
      setName('');
      setTagline('');
      setCurrentStep(1);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTribeDef = TRIBES_BY_ID[biblicalTribe] || TRIBES[3]; // Judah default

  const stepVariants: Variants = {
    enter: (dir: number) => ({
      x: reducedMotion ? 0 : dir > 0 ? 18 : -18,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.2, ease: 'easeOut' as const },
    },
    exit: (dir: number) => ({
      x: reducedMotion ? 0 : dir > 0 ? -18 : 18,
      opacity: 0,
      transition: { duration: 0.16, ease: 'easeIn' as const },
    }),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <Card
        variant="elevated"
        padding="lg"
        className="w-full max-w-lg bg-[var(--surface-card)] border-2 border-[var(--border-tint)] shadow-2xl rounded-3xl flex flex-col gap-4 max-h-[92vh] overflow-y-auto relative animate-scaleUp select-none"
      >
        {/* Top Header with Stepper Progress */}
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border-tint)]/60 pb-3">
          <div className="flex flex-col gap-1 w-full">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--primary-action)] flex items-center gap-1.5">
                <Icon name="tribe" size={14} /> Create Fellowship Tribe
              </span>
              <span className="text-[11px] font-extrabold text-[var(--on-container-variant)]">
                Step {currentStep} of {STEPS.length}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 mt-1">
              <h2 className="text-xl font-black text-[var(--on-container)] tracking-tight">
                {STEPS[currentStep - 1].title}
              </h2>

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
            </div>

            <p className="text-xs text-[var(--on-container-variant)] font-medium leading-relaxed">
              {STEPS[currentStep - 1].subtitle}
            </p>

            {/* Step Progress Bar & Indicators */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-1.5 rounded-full bg-[var(--surface-container-high)] overflow-hidden">
                <div
                  className="h-full bg-[var(--primary-action)] rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
                />
              </div>
              <div className="flex items-center gap-1.5">
                {STEPS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => goToStep(s.id)}
                    aria-label={`Jump to step ${s.id}: ${s.title}`}
                    className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                      s.id === currentStep
                        ? 'w-6 bg-[var(--primary-action)] shadow-xs'
                        : s.id < currentStep
                        ? 'bg-[var(--primary-action)]/60'
                        : 'bg-[var(--border-tint)] hover:bg-[var(--border-tint)]/80'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Step Body (strictly 1 setting per step) */}
        <div className="min-h-[270px] flex flex-col justify-between">
          <AnimatePresence mode="wait" custom={direction}>
            {/* STEP 1: Fellowship Name */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col gap-3 py-1"
              >
                <div className="p-4 rounded-2xl bg-[var(--surface-container)] border border-[var(--border-tint)] flex flex-col gap-2.5">
                  <label className="text-xs font-bold text-[var(--on-container)] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Icon name="tribe" size={14} /> Fellowship Name
                    </span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">Required</span>
                  </label>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (nameError && e.target.value.trim()) setNameError(false);
                    }}
                    placeholder="e.g. Grace Fellowship Youth, Bethel Young Adults"
                    required
                    autoFocus
                    className={`w-full px-4 py-3 rounded-2xl bg-[var(--surface-card)] border text-sm font-bold text-[var(--on-container)] focus:outline-none transition-colors ${
                      nameError
                        ? 'border-red-500 ring-2 ring-red-500/20'
                        : 'border-[var(--border-tint)] focus:border-[var(--primary-action)]'
                    }`}
                  />

                  {nameError ? (
                    <span className="text-[11px] text-red-600 dark:text-red-400 font-bold">
                      Please enter a fellowship name before proceeding.
                    </span>
                  ) : (
                    <p className="text-[11px] text-[var(--on-container-variant)] leading-relaxed">
                      Choose a recognizable name for your church group, bible study, youth ministry, or family circle.
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 2: Scripture Focus */}
            {currentStep === 2 && (
              <motion.div
                key="step-2"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col gap-3 py-1"
              >
                <div className="p-4 rounded-2xl bg-[var(--surface-container)] border border-[var(--border-tint)] flex flex-col gap-3">
                  <label className="text-xs font-bold text-[var(--on-container)] flex items-center gap-1.5">
                    <Icon name="scroll" size={14} /> Tagline or Scripture Verse (Optional)
                  </label>

                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Walking in Light • 1 John 1:7"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-tint)] text-sm font-medium text-[var(--on-container)] focus:outline-none focus:border-[var(--primary-action)]"
                  />

                  {/* Suggestion Chips */}
                  <div className="flex flex-col gap-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--on-container-variant)] flex items-center gap-1">
                      <Icon name="hint" size={12} /> Suggested Scripture Themes:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {SCRIPTURE_SUGGESTIONS.map((scrip) => (
                        <button
                          key={scrip}
                          type="button"
                          onClick={() => {
                            triggerHaptic('light');
                            setTagline(scrip);
                          }}
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl transition-colors cursor-pointer border flex items-center gap-1 ${
                            tagline === scrip
                              ? 'bg-[var(--primary-action)] text-white border-[var(--primary-action)]'
                              : 'bg-[var(--surface-card)] hover:bg-[var(--surface-container-high)] text-[var(--on-container)] border-[var(--border-tint)]'
                          }`}
                        >
                          <Icon name="scroll" size={10} />
                          <span>{scrip}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Biblical Emblem */}
            {currentStep === 3 && (
              <motion.div
                key="step-3"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col gap-2.5 py-1"
              >
                {/* Selected Banner Live Preview */}
                <div
                  className="p-3 rounded-2xl border flex items-center justify-between gap-3 shadow-xs transition-all"
                  style={{
                    backgroundColor: selectedTribeDef.container,
                    color: selectedTribeDef.ink,
                    borderColor: `${selectedTribeDef.ink}33`,
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <TribeAvatar tribeId={selectedTribeDef.id} size="md" showGlow />
                    <div className="min-w-0">
                      <div className="text-sm font-black leading-tight truncate">
                        Tribe of {selectedTribeDef.name}
                      </div>
                      <div className="text-[11px] font-semibold opacity-90 truncate">
                        {selectedTribeDef.title} • {selectedTribeDef.source}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/10 shrink-0 flex items-center gap-1">
                    <Icon name="check" size={10} /> Selected
                  </span>
                </div>

                {/* Personal Calling Match Notice & Assessment Trigger */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface-container)] border border-[var(--border-tint)] text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon name="tribe" size={14} className="text-[var(--primary-action)] shrink-0" />
                    <span className="text-[11px] text-[var(--on-container-variant)] truncate">
                      {user?.tribalAssessment
                        ? `Your calling: Tribe of ${TRIBES_BY_ID[user.biblicalTribeId]?.name || 'Judah'} (${user.tribalAssessment.matchPercentage}%)`
                        : 'Discover your personal biblical tribe calling'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAssessmentModal(true)}
                    className="text-[11px] font-bold text-[var(--primary-action)] underline hover:opacity-80 shrink-0 cursor-pointer ml-2"
                  >
                    {user?.tribalAssessment ? 'Retake' : 'Assess'}
                  </button>
                </div>

                {/* 12 Tribes Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1.5 rounded-2xl bg-[var(--surface-container)] border border-[var(--border-tint)]">
                  {TRIBES.map((trb) => {
                    const isSelected = biblicalTribe === trb.id;
                    const isUserHeritage = user?.biblicalTribeId === trb.id;
                    return (
                      <button
                        key={trb.id}
                        type="button"
                        onClick={() => {
                          triggerHaptic('selection');
                          setBiblicalTribe(trb.id);
                        }}
                        className={`p-2 rounded-xl flex flex-col items-center gap-1 text-xs font-bold cursor-pointer border transition-all ${
                          isSelected
                            ? 'border-[var(--primary-action)] bg-[var(--surface-card)] shadow-xs ring-1 ring-[var(--primary-action)]'
                            : 'border-transparent hover:bg-[var(--surface-container-high)] opacity-85'
                        }`}
                      >
                        <TribeAvatar tribeId={trb.id} size="xs" showBorder={false} />
                        <span className="truncate w-full text-center text-[11px] text-[var(--on-container)] flex items-center justify-center gap-0.5">
                          <span>{trb.name}</span>
                          {isUserHeritage && <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-action)]" title="Your calling" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 4: Membership Policy */}
            {currentStep === 4 && (
              <motion.div
                key="step-4"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col gap-3 py-1"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection');
                      setInvitePolicy('open');
                    }}
                    className={`p-4 rounded-2xl border-2 text-left flex flex-col gap-2 transition-all cursor-pointer ${
                      invitePolicy === 'open'
                        ? 'border-[var(--primary-action)] bg-[var(--primary-action)]/10 shadow-sm ring-1 ring-[var(--primary-action)]'
                        : 'border-[var(--border-tint)] bg-[var(--surface-container)] hover:border-[var(--border-tint)]/80 opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <Icon name="unlock" size={18} />
                      </span>
                      {invitePolicy === 'open' && (
                        <span className="w-5 h-5 rounded-full bg-[var(--primary-action)] text-white flex items-center justify-center">
                          <Icon name="check" size={12} />
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-[var(--on-container)]">Open to All</div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mt-0.5">
                        Instant Access
                      </div>
                    </div>
                    <p className="text-[11px] text-[var(--on-container-variant)] leading-snug">
                      Anyone with your invite code or link can join immediately.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection');
                      setInvitePolicy('approval_required');
                    }}
                    className={`p-4 rounded-2xl border-2 text-left flex flex-col gap-2 transition-all cursor-pointer ${
                      invitePolicy === 'approval_required'
                        ? 'border-[var(--primary-action)] bg-[var(--primary-action)]/10 shadow-sm ring-1 ring-[var(--primary-action)]'
                        : 'border-[var(--border-tint)] bg-[var(--surface-container)] hover:border-[var(--border-tint)]/80 opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <Icon name="shield" size={18} />
                      </span>
                      {invitePolicy === 'approval_required' && (
                        <span className="w-5 h-5 rounded-full bg-[var(--primary-action)] text-white flex items-center justify-center">
                          <Icon name="check" size={12} />
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-[var(--on-container)]">Approval Required</div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mt-0.5">
                        Admin Vetting
                      </div>
                    </div>
                    <p className="text-[11px] text-[var(--on-container-variant)] leading-snug">
                      Prospective disciples submit join requests for tribe admins to approve.
                    </p>
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 5: Review & Establish */}
            {currentStep === 5 && (
              <motion.div
                key="step-5"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col gap-3 py-1"
              >
                <div className="p-4 rounded-2xl bg-[var(--surface-container-high)] border border-[var(--border-tint)] flex flex-col gap-3">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-[var(--primary-action)] flex items-center gap-1.5">
                    <Icon name="check" size={14} /> Fellowship Card Preview
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-tint)] flex items-center gap-3">
                    <TribeAvatar tribeId={selectedTribeDef.id} size="lg" />
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="text-base font-black text-[var(--on-container)] truncate">
                        {name || 'Fellowship Tribe'}
                      </div>
                      <div className="text-xs text-[var(--on-container-variant)] truncate mt-0.5">
                        {tagline || `Tribe of ${selectedTribeDef.name} • 1 Member (You)`}
                      </div>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[var(--surface-container)] text-[var(--on-container-variant)] border border-[var(--border-tint)] shrink-0 flex items-center gap-1">
                      <Icon name={invitePolicy === 'open' ? 'unlock' : 'shield'} size={12} />
                      <span>{invitePolicy === 'open' ? 'Open' : 'Vetted'}</span>
                    </span>
                  </div>

                  <p className="text-[11px] text-[var(--on-container-variant)] font-medium leading-relaxed">
                    Once established, you will receive an invite code and QR code to welcome members into your fellowship.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stepper Navigation Footer: Previous & Next / Create */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-[var(--border-tint)]/60 mt-3">
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
              {currentStep < 5 ? (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  pill
                  onClick={handleNext}
                  className="font-black shadow-md flex items-center gap-1.5 px-5"
                  rightIcon={<Icon name="arrow-right" size={16} />}
                >
                  <span>Next: {STEPS[currentStep].title}</span>
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="success"
                  size="lg"
                  pill
                  disabled={isSubmitting || !name.trim()}
                  onClick={handleFinalSubmit}
                  className="font-black shadow-expressive px-6 flex items-center gap-2"
                  leftIcon={<Icon name="tribe" size={18} />}
                >
                  <span>{isSubmitting ? 'Establishing…' : 'Establish Fellowship Tribe'}</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Tribal Assessment Modal */}
      <TribalAssessmentModal
        isOpen={showAssessmentModal}
        onClose={() => setShowAssessmentModal(false)}
        onAssigned={(assignedTribeId) => setBiblicalTribe(assignedTribeId)}
      />
    </div>
  );
};

