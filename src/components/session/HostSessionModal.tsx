import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Icon } from '../../design/icons';
import { useTheme } from '../../theme/ThemeContext';
import { ConnectionMode, HotspotInfo } from '../../engine/types';
import { openMobileHotspotSettings } from '../../engine/services/mobileNetwork';
import { useAuth } from '../../engine/auth/AuthContext';
import { useTribes } from '../../engine/tribes/TribeContext';
import { AuthModal } from '../auth/AuthModal';

export interface HostSessionModalProps {
  isOpen: boolean;
  gameName: string;
  onConfirm: (
    mode: ConnectionMode,
    hotspotInfo?: HotspotInfo,
    tribeId?: string,
    tribeName?: string
  ) => void;
  onCancel: () => void;
}

export const HostSessionModal: React.FC<HostSessionModalProps> = ({
  isOpen,
  gameName,
  onConfirm,
  onCancel,
}) => {
  const { triggerHaptic, reducedMotion } = useTheme();
  const { isAuthenticated } = useAuth();
  const { tribes } = useTribes();

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [direction, setDirection] = useState<number>(1);

  const [mode, setMode] = useState<ConnectionMode>('online');
  const [ssid, setSsid] = useState('FaithTribe-Hotspot');
  const [password, setPassword] = useState('');
  const [hotspotTriggered, setHotspotTriggered] = useState(false);
  const [selectedTribeId, setSelectedTribeId] = useState<string>('none');
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (!isOpen) return null;

  // Dynamically calculate one-setting-per-page steps based on selected connection mode
  const steps = [
    { id: 'mode', title: 'Connection Mode', subtitle: 'Choose Cloud Relay or Local Hotspot' },
    ...(mode === 'onsite'
      ? [{ id: 'hotspot', title: 'Hotspot Network', subtitle: 'Configure SSID and security settings' }]
      : []),
    { id: 'audience', title: 'Fellowship Audience', subtitle: 'Broadcast to a Tribe or Open Room' },
    { id: 'review', title: 'Review & Launch', subtitle: 'Verify session settings and start lobby' },
  ];

  const currentStep = steps[currentStepIndex] || steps[0];
  const totalSteps = steps.length;

  const handleLaunch = () => {
    triggerHaptic('heavy');
    const tribe = tribes.find((t) => t.id === selectedTribeId);
    if (mode === 'onsite') {
      onConfirm(
        'onsite',
        {
          ssid: ssid.trim() || 'FaithTribe-Hotspot',
          password: password.trim() || undefined,
          security: password.trim() ? 'WPA' : 'nopass',
        },
        tribe?.id,
        tribe?.name
      );
    } else {
      onConfirm('online', undefined, tribe?.id, tribe?.name);
    }
  };

  const handleOpenHotspotSettings = () => {
    triggerHaptic('medium');
    setHotspotTriggered(true);
    openMobileHotspotSettings();
  };

  const goToStep = (newIndex: number) => {
    if (newIndex === currentStepIndex || newIndex < 0 || newIndex >= totalSteps) return;
    triggerHaptic('selection');
    setDirection(newIndex > currentStepIndex ? 1 : -1);
    setCurrentStepIndex(newIndex);
  };

  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      goToStep(currentStepIndex + 1);
    } else {
      handleLaunch();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      goToStep(currentStepIndex - 1);
    }
  };

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

  // If host is not authenticated, show sign-in gate
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
        <Card
          variant="elevated"
          padding="lg"
          className="w-full max-w-md bg-[var(--surface-card)] border-2 border-[var(--border-tint)] shadow-2xl rounded-3xl flex flex-col gap-5 text-center items-center relative"
        >
          <button
            onClick={() => {
              triggerHaptic('light');
              onCancel();
            }}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] text-[var(--on-container-variant)] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <Icon name="close" size={16} />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-sm">
            <Icon name="shield" size={32} />
          </div>

          <div className="flex flex-col gap-1.5">
            <h2 className="text-xl font-black text-[var(--on-container)]">
              Host Sign-In Required
            </h2>
            <p className="text-xs text-[var(--on-container-variant)] leading-relaxed">
              Hosting a fellowship game requires an authenticated Faith Tribe account to manage game rooms, ensure persistent leaderboards, and broadcast to your Tribe.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300/40 text-xs font-semibold text-amber-900 dark:text-amber-200 text-left w-full flex items-start gap-2.5">
            <div className="shrink-0 text-amber-600 dark:text-amber-400 mt-0.5">
              <Icon name="info" size={16} />
            </div>
            <span>
              <strong>Note:</strong> Participants can still join as unregistered guests without an account using your room code or QR code.
            </span>
          </div>

          <div className="flex flex-col gap-2 w-full pt-1">
            <Button
              variant="primary"
              size="lg"
              pill
              onClick={() => setShowAuthModal(true)}
              className="w-full font-black shadow-md flex items-center justify-center gap-2"
            >
              <Icon name="person" size={18} />
              <span>Sign In or Create Account</span>
            </Button>
            <Button
              variant="tonal"
              size="md"
              pill
              onClick={onCancel}
              className="w-full font-bold text-xs"
            >
              Cancel
            </Button>
          </div>

          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            requiredForHost
          />
        </Card>
      </div>
    );
  }

  const selectedTribe = tribes.find((t) => t.id === selectedTribeId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <Card
        variant="elevated"
        padding="lg"
        className="w-full max-w-lg bg-[var(--surface-card)] border-2 border-[var(--border-tint)] shadow-2xl rounded-3xl flex flex-col gap-4 relative overflow-hidden animate-scaleUp max-h-[90vh] overflow-y-auto"
      >
        {/* Top Header with step progress */}
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border-tint)]/60 pb-3">
          <div className="flex flex-col gap-1 w-full">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--primary-action)] flex items-center gap-1.5">
                <Icon name="games" size={14} /> Host Session • {gameName}
              </span>
              <span className="text-[11px] font-extrabold text-[var(--on-container-variant)]">
                Step {currentStepIndex + 1} of {totalSteps}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 mt-1">
              <h2 className="text-xl font-black text-[var(--on-container)] tracking-tight">
                {currentStep.title}
              </h2>

              <button
                onClick={() => {
                  triggerHaptic('light');
                  onCancel();
                }}
                className="w-8 h-8 rounded-full bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] text-[var(--on-container-variant)] flex items-center justify-center transition-colors cursor-pointer border border-[var(--border-tint)]/60 shrink-0"
                aria-label="Close"
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            <p className="text-xs text-[var(--on-container-variant)] font-medium leading-relaxed">
              {currentStep.subtitle}
            </p>

            {/* Step Progress Bar & Indicators */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-1.5 rounded-full bg-[var(--surface-container-high)] overflow-hidden">
                <div
                  className="h-full bg-[var(--primary-action)] rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
                />
              </div>
              <div className="flex items-center gap-1.5">
                {steps.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => goToStep(idx)}
                    aria-label={`Jump to step ${idx + 1}: ${s.title}`}
                    className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                      idx === currentStepIndex
                        ? 'w-6 bg-[var(--primary-action)] shadow-xs'
                        : idx < currentStepIndex
                        ? 'bg-[var(--primary-action)]/60'
                        : 'bg-[var(--border-tint)] hover:bg-[var(--border-tint)]/80'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Animated Multi-Step Body (strictly 1 setting per step) */}
        <div className="min-h-[260px] flex flex-col justify-between">
          <AnimatePresence mode="wait" custom={direction}>
            {/* STEP: Connection Mode */}
            {currentStep.id === 'mode' && (
              <motion.div
                key="step-mode"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col gap-3 py-1"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Online Cloud Card */}
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setMode('online');
                    }}
                    className={`p-4 rounded-2xl border-2 text-left flex flex-col gap-2.5 transition-all cursor-pointer ${
                      mode === 'online'
                        ? 'border-[var(--primary-action)] bg-[var(--primary-action)]/10 shadow-sm ring-1 ring-[var(--primary-action)]'
                        : 'border-[var(--border-tint)] bg-[var(--surface-container)] hover:border-[var(--border-tint)]/80 opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <Icon name="link" size={20} />
                      </span>
                      {mode === 'online' && (
                        <span className="w-5 h-5 rounded-full bg-[var(--primary-action)] text-white flex items-center justify-center">
                          <Icon name="check" size={12} />
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-[var(--on-container)]">Online Cloud</div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mt-0.5">
                        Relay Server
                      </div>
                    </div>
                    <p className="text-[11px] text-[var(--on-container-variant)] leading-snug">
                      Plays over cellular data or Wi-Fi. Instant QR code and 4-letter room code for players.
                    </p>
                  </button>

                  {/* Onsite Hotspot Card */}
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setMode('onsite');
                    }}
                    className={`p-4 rounded-2xl border-2 text-left flex flex-col gap-2.5 transition-all cursor-pointer ${
                      mode === 'onsite'
                        ? 'border-emerald-600 bg-emerald-500/10 shadow-sm ring-1 ring-emerald-600'
                        : 'border-[var(--border-tint)] bg-[var(--surface-container)] hover:border-[var(--border-tint)]/80 opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <Icon name="host" size={20} />
                      </span>
                      {mode === 'onsite' && (
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                          <Icon name="check" size={12} />
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-[var(--on-container)]">Onsite Hotspot</div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mt-0.5">
                        Local Offline P2P
                      </div>
                    </div>
                    <p className="text-[11px] text-[var(--on-container-variant)] leading-snug">
                      Host runs mobile hotspot or local Wi-Fi. Zero cellular data consumed by disciples.
                    </p>
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP: Hotspot Details (Dedicated single setting page when onsite) */}
            {currentStep.id === 'hotspot' && (
              <motion.div
                key="step-hotspot"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col gap-3 py-1"
              >
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-500/30 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                        Hotspot Wi-Fi Details
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenHotspotSettings}
                      className="px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    >
                      <Icon name="bolt" size={12} />
                      <span>Open Phone Settings</span>
                    </button>
                  </div>

                  {hotspotTriggered && (
                    <div className="text-[11px] font-semibold text-emerald-900 dark:text-emerald-200 bg-emerald-100/70 dark:bg-emerald-900/40 p-2.5 rounded-xl flex items-center gap-2">
                      <Icon name="check" size={14} className="text-emerald-600" />
                      <span>Settings triggered. Enter the matching SSID and Password below so disciples can scan to join.</span>
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-[var(--on-container-variant)] mb-1 block">
                        Network Name (SSID)
                      </label>
                      <input
                        type="text"
                        value={ssid}
                        onChange={(e) => setSsid(e.target.value)}
                        placeholder="e.g. FaithTribe-Hotspot"
                        className="w-full px-3.5 py-2 rounded-xl bg-[var(--surface-container)] border border-[var(--border-tint)] text-xs font-mono font-bold text-[var(--on-container)] focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-[var(--on-container-variant)] mb-1 block">
                        Password (Optional)
                      </label>
                      <input
                        type="text"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Leave blank if open"
                        className="w-full px-3.5 py-2 rounded-xl bg-[var(--surface-container)] border border-[var(--border-tint)] text-xs font-mono font-bold text-[var(--on-container)] focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP: Fellowship Audience */}
            {currentStep.id === 'audience' && (
              <motion.div
                key="step-audience"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col gap-3.5 py-1"
              >
                <div className="flex flex-col gap-2.5 p-4 rounded-2xl bg-[var(--surface-container)] border border-[var(--border-tint)]">
                  <label className="text-xs font-bold text-[var(--on-container)] flex items-center gap-2">
                    <Icon name="tribe" size={16} /> Fellowship Broadcast Target
                  </label>
                  <p className="text-xs text-[var(--on-container-variant)] leading-relaxed">
                    Decide whether this room is open for anyone with the code, or automatically broadcasted to your Tribe members.
                  </p>

                  <select
                    value={selectedTribeId}
                    onChange={(e) => {
                      triggerHaptic('selection');
                      setSelectedTribeId(e.target.value);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-tint)] text-xs font-bold text-[var(--on-container)] cursor-pointer mt-1"
                  >
                    <option value="none">General Open Game (QR & Room Code)</option>
                    {tribes.map((t) => (
                      <option key={t.id} value={t.id}>
                        Tribe: {t.name} (Instant 1-Tap Join for Members)
                      </option>
                    ))}
                  </select>

                  {selectedTribeId !== 'none' ? (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-200 font-semibold flex items-start gap-2.5 mt-1.5">
                      <div className="shrink-0 text-emerald-600 mt-0.5">
                        <Icon name="bolt" size={16} />
                      </div>
                      <div>
                        <strong>Instant Broadcast Active:</strong> Members of {selectedTribe?.name} will see a prominent banner on their Tribe screen and join with one tap.
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-[var(--surface-container-high)] text-xs text-[var(--on-container-variant)] font-medium flex items-start gap-2.5 mt-1.5">
                      <div className="shrink-0 mt-0.5">
                        <Icon name="qr" size={16} />
                      </div>
                      <div>
                        <strong>Open Room:</strong> Anyone can join by scanning the screen QR code or typing the 4-letter room code on their phone.
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP: Review & Launch */}
            {currentStep.id === 'review' && (
              <motion.div
                key="step-review"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col gap-3.5 py-1"
              >
                <div className="p-4 rounded-2xl bg-[var(--surface-container-high)] border border-[var(--border-tint)] flex flex-col gap-3">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-[var(--primary-action)] flex items-center gap-1.5">
                    <Icon name="check" size={14} /> Ready to Host Session
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="flex flex-col bg-[var(--surface-card)] p-3 rounded-xl border border-[var(--border-tint)]/60">
                      <span className="text-[10px] text-[var(--on-container-variant)] font-bold flex items-center gap-1">
                        <Icon name="games" size={11} /> GAME
                      </span>
                      <span className="font-extrabold text-[var(--on-container)] truncate mt-0.5">{gameName}</span>
                    </div>

                    <div className="flex flex-col bg-[var(--surface-card)] p-3 rounded-xl border border-[var(--border-tint)]/60">
                      <span className="text-[10px] text-[var(--on-container-variant)] font-bold flex items-center gap-1">
                        <Icon name={mode === 'onsite' ? 'host' : 'link'} size={11} /> NETWORK
                      </span>
                      <span className="font-extrabold text-[var(--on-container)] mt-0.5">
                        {mode === 'onsite' ? 'Onsite Hotspot' : 'Online Cloud'}
                      </span>
                    </div>

                    <div className="flex flex-col bg-[var(--surface-card)] p-3 rounded-xl border border-[var(--border-tint)]/60 col-span-2">
                      <span className="text-[10px] text-[var(--on-container-variant)] font-bold flex items-center gap-1">
                        <Icon name="tribe" size={11} /> AUDIENCE
                      </span>
                      <span className="font-extrabold text-[var(--on-container)] truncate mt-0.5">
                        {selectedTribeId !== 'none' && selectedTribe
                          ? `Broadcast to ${selectedTribe.name}`
                          : 'General Open Room (Room Code & QR)'}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[var(--on-container-variant)] font-medium leading-relaxed">
                    Clicking <strong>Launch Room</strong> will initialize your game lobby and display the player connection code and QR code.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stepper Navigation Footer: Previous & Next / Launch */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-[var(--border-tint)]/60 mt-3">
            <Button
              type="button"
              variant="tonal"
              size="md"
              pill
              disabled={currentStepIndex === 0}
              onClick={handlePrev}
              className={`flex items-center gap-1.5 font-bold ${
                currentStepIndex === 0 ? 'opacity-40 cursor-not-allowed' : ''
              }`}
              leftIcon={<Icon name="arrow-left" size={16} />}
            >
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {currentStepIndex < totalSteps - 1 ? (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  pill
                  onClick={handleNext}
                  className="font-black shadow-md flex items-center gap-1.5 px-5"
                  rightIcon={<Icon name="arrow-right" size={16} />}
                >
                  <span>Next: {steps[currentStepIndex + 1].title}</span>
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  pill
                  onClick={handleLaunch}
                  className="font-black shadow-expressive px-6 flex items-center gap-2"
                  leftIcon={<Icon name="play" size={18} />}
                >
                  <span>Launch Room</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

