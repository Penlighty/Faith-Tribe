import React, { useState, useEffect } from 'react';
import { Sparkles, Moon, Sun, Monitor, Download, Radio } from 'lucide-react';
import { Icon } from '@design/icons';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { useTheme } from '../theme/ThemeContext';
import { useSession } from '../engine/session/SessionContext';
import { useAuth } from '../engine/auth/AuthContext';
import { soundManager } from '../engine/services/audio';
import { TRIBES_BY_ID, canRetakeAssessment } from '../design/tribes/tribes';
import { TribeAvatar } from '../components/tribes/TribeAvatar';
import { TribalAssessmentModal } from '../components/tribes/TribalAssessmentModal';
import { MaterialSlider } from '../components/ui/MaterialSlider';

export const SettingsScreen: React.FC = () => {
  const {
    mode,
    setMode,
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
  } = useTheme();

  const { transportName, currentUser } = useSession();
  const { user } = useAuth();
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);

  const assignedTribe = TRIBES_BY_ID[user?.biblicalTribeId || 'judah'] || TRIBES_BY_ID['judah'];
  const cooldown = canRetakeAssessment(user?.tribalAssessment?.assessedAt);

  // PWA install prompt deferred event
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
      alert('To install on iOS/Android: Tap "Share" or "..." in your browser, then "Add to Home Screen"!');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-28 pt-2 sm:pt-6 flex flex-col gap-6 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Settings &amp; Preferences</h2>
          <p className="text-xs text-[var(--on-container-variant)] hidden sm:block">
            Customize your app appearance, haptics, and game night experience
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left Column: Profile, Ancestral Tribe Calling & Appearance */}
        <div className="flex flex-col gap-5">
          {/* Profile Card */}
          <Card variant="tonal" padding="md" className="flex items-center justify-between shadow-sm">
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--on-container-variant)]">
                Active Disciple
              </span>
              <span className="text-base sm:text-lg font-extrabold">{user?.displayName || currentUser?.name || 'Disciple'}</span>
              <span className="text-[11px] font-mono text-[var(--on-container-variant)]">
                {user?.username ? `@${user.username}` : `Session ID: ${currentUser?.id}`}
              </span>
            </div>
            <TribeAvatar tribeId={assignedTribe.id} size="md" />
          </Card>

          {/* Ancestral Tribe Calling Card */}
          <Card variant="hero" padding="md" className="flex flex-col gap-3 shadow-md border-2 border-[var(--primary-action)]/30">
            <div className="flex items-center justify-between border-b border-[var(--border-tint)] pb-2.5">
              <span className="text-xs font-black uppercase tracking-wider text-[var(--primary-action)] flex items-center gap-1.5">
                <Icon name="tribe" size={14} /> Ancestral Tribe Calling
              </span>
              {user?.tribalAssessment ? (
                <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Icon name="check" size={10} />
                  <span>{user.tribalAssessment.matchPercentage}% Alignment</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded-full">
                  Unassessed
                </span>
              )}
            </div>

            <div className="flex items-center gap-3.5">
              <TribeAvatar tribeId={assignedTribe.id} size="lg" showGlow />
              <div className="flex flex-col min-w-0 flex-1">
                <h4 className="text-base sm:text-lg font-black text-[var(--on-container)] leading-tight truncate">
                  Tribe of {assignedTribe.name}
                </h4>
                <div className="text-xs font-bold text-[var(--primary-action)] truncate">
                  {assignedTribe.title}
                </div>
                <div className="text-[11px] font-serif italic text-[var(--on-container-variant)] line-clamp-2 mt-0.5">
                  “{assignedTribe.verseText}”
                </div>
              </div>
            </div>

            {/* Assessment Cooldown & Action */}
            <div className="pt-2 border-t border-[var(--border-tint)] flex items-center justify-between gap-2 flex-wrap">
              <div className="text-[11px] text-[var(--on-container-variant)] flex items-center gap-1">
                {cooldown.canRetake ? (
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1">
                    <Icon name="bolt" size={12} /> Calling Assessment Ready
                  </span>
                ) : (
                  <span className="text-amber-700 dark:text-amber-300 font-medium flex items-center gap-1">
                    <Icon name="lock" size={12} /> Locked &bull; Retake in {cooldown.daysRemaining} days
                  </span>
                )}
              </div>

              <Button
                variant={cooldown.canRetake ? 'primary' : 'tonal'}
                size="sm"
                pill
                disabled={!cooldown.canRetake}
                onClick={() => {
                  triggerHaptic('light');
                  setShowAssessmentModal(true);
                }}
                className="font-black text-xs px-3 shadow-xs"
              >
                {user?.tribalAssessment ? 'Retake Assessment' : 'Take 7-Trait Assessment'}
              </Button>
            </div>
          </Card>

          {/* Appearance / Theme */}
          <Card variant="tonal" padding="md" className="flex flex-col gap-3 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--on-container-variant)]">
              Appearance &amp; Contrast
            </span>

            <div className="grid grid-cols-3 gap-2">
              <Chip
                selected={mode === 'light'}
                onClick={() => setMode('light')}
                leftIcon={<Sun size={14} />}
                className="justify-center py-2.5 font-bold"
              >
                Light
              </Chip>
              <Chip
                selected={mode === 'dark'}
                onClick={() => setMode('dark')}
                leftIcon={<Moon size={14} />}
                className="justify-center py-2.5 font-bold"
              >
                Dark
              </Chip>
              <Chip
                selected={mode === 'system'}
                onClick={() => setMode('system')}
                leftIcon={<Monitor size={14} />}
                className="justify-center py-2.5 font-bold"
              >
                Auto
              </Chip>
            </div>
          </Card>
        </div>

        {/* Right Column: Sensory Feedback & Platform */}
        <div className="flex flex-col gap-5">
          {/* Audio Sliders Card */}
          <Card variant="tonal" padding="md" className="flex flex-col gap-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--on-container-variant)] flex items-center gap-1.5">
                <Icon name="settings" size={14} className="text-[var(--primary-action)]" /> Audio Levels &amp; Sliders
              </span>
              <button
                type="button"
                onClick={() => {
                  soundManager.playChime(soundEnabled);
                  triggerHaptic('light');
                }}
                className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[var(--surface-container-high)] hover:bg-[var(--primary-action)] hover:text-white transition-colors cursor-pointer border border-[var(--border-tint)] flex items-center gap-1"
              >
                <span>Test Chime</span>
                <Icon name="sound-on" size={13} />
              </button>
            </div>

            {/* Master Volume Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  {masterVolume === 0 ? <Icon name="sound-off" size={16} className="text-rose-500" /> : <Icon name="sound-on" size={16} className="text-[var(--primary-action)]" />}
                  Master Volume
                </span>
                <span className="font-mono text-[var(--primary-action)]">{Math.round(masterVolume * 100)}%</span>
              </div>
              <MaterialSlider
                value={Math.round(masterVolume * 100)}
                min={0}
                max={100}
                step={5}
                onChange={(val) => setMasterVolume(val / 100)}
                ariaLabel="Master Volume"
              />
            </div>

            {/* Sound Effects (SFX) Slider */}
            <div className="flex flex-col gap-1.5 pt-2 border-t border-[var(--border-tint)]">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  {sfxVolume === 0 ? <Icon name="sound-off" size={16} className="text-rose-500" /> : <Icon name="sound-on" size={16} className="text-[var(--primary-action)]" />}
                  Sound Effects (SFX)
                </span>
                <span className="font-mono text-[var(--primary-action)]">{Math.round(sfxVolume * 100)}%</span>
              </div>
              <MaterialSlider
                value={Math.round(sfxVolume * 100)}
                min={0}
                max={100}
                step={5}
                onChange={(val) => setSfxVolume(val / 100)}
                ariaLabel="Sound Effects Volume"
              />
            </div>

            {/* Ambient / Music Tone Slider */}
            <div className="flex flex-col gap-1.5 pt-2 border-t border-[var(--border-tint)]">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-500" />
                  Ambient &amp; Chime Tone
                </span>
                <span className="font-mono text-[var(--primary-action)]">{Math.round(ambientVolume * 100)}%</span>
              </div>
              <MaterialSlider
                value={Math.round(ambientVolume * 100)}
                min={0}
                max={100}
                step={5}
                onChange={(val) => setAmbientVolume(val / 100)}
                ariaLabel="Ambient Volume"
              />
            </div>
          </Card>

          {/* Gameplay sensory toggles */}
          <Card variant="tonal" padding="md" className="flex flex-col gap-3 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--on-container-variant)]">
              Sensory Feedback Toggles
            </span>

            {/* Sound Toggle */}
            <div className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2.5">
                <Icon name="sound-on" size={18} className="text-[var(--primary-action)]" />
                <div>
                  <div className="text-sm font-bold">Sound Effects</div>
                  <div className="text-[11px] text-[var(--on-container-variant)]">
                    Synthesized timer ticks and chimes
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
                  soundEnabled ? 'bg-[var(--primary-action)]' : 'bg-gray-300 dark:bg-gray-700'
                }`}
                aria-label="Toggle Sound Effects"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    soundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Haptics */}
            <div className="flex items-center justify-between py-1.5 border-t border-[var(--border-tint)]">
              <div className="flex items-center gap-2.5">
                <Icon name="vibrate" size={18} className="text-[var(--primary-action)]" />
                <div>
                  <div className="text-sm font-bold">Haptic Vibrations</div>
                  <div className="text-[11px] text-[var(--on-container-variant)]">
                    Hot coal rumble &amp; tap response
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  triggerHaptic('medium');
                  setHapticsEnabled(!hapticsEnabled);
                }}
                className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
                  hapticsEnabled ? 'bg-[var(--primary-action)]' : 'bg-gray-300 dark:bg-gray-700'
                }`}
                aria-label="Toggle Haptic Feedback"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    hapticsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Reduced Motion */}
            <div className="flex items-center justify-between py-1.5 border-t border-[var(--border-tint)]">
              <div className="flex items-center gap-2.5">
                <Sparkles size={18} className="text-[var(--primary-action)]" />
                <div>
                  <div className="text-sm font-bold">Reduce Motion</div>
                  <div className="text-[11px] text-[var(--on-container-variant)]">
                    Disable springs and heavy physics
                  </div>
                </div>
              </div>
              <button
                onClick={() => setReducedMotion(!reducedMotion)}
                className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
                  reducedMotion ? 'bg-[var(--primary-action)]' : 'bg-gray-300 dark:bg-gray-700'
                }`}
                aria-label="Toggle Reduced Motion"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    reducedMotion ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </Card>

          {/* PWA & Transport Info */}
          <Card variant="tonal" padding="md" className="flex flex-col gap-3 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--on-container-variant)]">
              Platform &amp; Connectivity
            </span>

            <div className="flex items-center justify-between text-xs font-semibold py-1">
              <span className="flex items-center gap-1.5">
                <Radio size={14} className="text-[var(--primary-action)]" /> Realtime Transport
              </span>
              <span className="font-mono bg-[var(--surface-container-high)] px-2.5 py-1 rounded-full text-[11px]">
                {transportName}
              </span>
            </div>

            <div className="pt-2 border-t border-[var(--border-tint)] flex flex-col gap-2">
              <Button
                variant="tonal"
                size="md"
                pill
                leftIcon={<Download size={16} />}
                onClick={handleInstallPWA}
                className="w-full font-bold"
              >
                {isInstalled ? 'Installed as Web App' : 'Install App to Home Screen'}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <TribalAssessmentModal
        isOpen={showAssessmentModal}
        onClose={() => setShowAssessmentModal(false)}
      />
    </div>
  );
};
