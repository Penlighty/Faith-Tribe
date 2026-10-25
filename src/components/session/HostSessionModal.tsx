import React, { useState } from 'react';
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
  const { triggerHaptic } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const { tribes } = useTribes();

  const [mode, setMode] = useState<ConnectionMode>('online');
  const [ssid, setSsid] = useState('FaithTribe-Hotspot');
  const [password, setPassword] = useState('');
  const [hotspotTriggered, setHotspotTriggered] = useState(false);
  const [selectedTribeId, setSelectedTribeId] = useState<string>('none');
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (!isOpen) return null;

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

          <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-3xl shadow-sm">
            🛡️
          </div>

          <div className="flex flex-col gap-1.5">
            <h2 className="text-xl font-black text-[var(--on-container)]">
              Host Sign-In Required
            </h2>
            <p className="text-xs text-[var(--on-container-variant)] leading-relaxed">
              Hosting a fellowship game requires an authenticated Faith Tribe account to manage game rooms, ensure persistent leaderboards, and broadcast to your Tribe.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300/40 text-xs font-semibold text-amber-900 dark:text-amber-200 text-left w-full flex items-start gap-2">
            <span className="text-base shrink-0">💡</span>
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <Card
        variant="elevated"
        padding="lg"
        className="w-full max-w-lg bg-[var(--surface-card)] border-2 border-[var(--border-tint)] shadow-2xl rounded-3xl flex flex-col gap-5 relative overflow-hidden animate-scaleUp max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
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

        {/* Title Header */}
        <div className="flex flex-col gap-1 pr-8">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--primary-action)]">
              Host Game Session
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
              Verified Host: @{user?.username}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--on-container)]">
            Configure {gameName}
          </h2>
          <p className="text-xs text-[var(--on-container-variant)]">
            Select connection mode and decide whether to broadcast to a specific Fellowship Tribe.
          </p>
        </div>

        {/* Tribe Fellowship Selector */}
        {tribes.length > 0 && (
          <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-[var(--surface-container)] border border-[var(--border-tint)]">
            <label className="text-xs font-bold text-[var(--on-container)] flex items-center gap-1.5">
              <span>🤝</span> Fellowship / Tribe Broadcast
            </label>
            <select
              value={selectedTribeId}
              onChange={(e) => {
                triggerHaptic('selection');
                setSelectedTribeId(e.target.value);
              }}
              className="w-full px-3 py-2 rounded-xl bg-[var(--surface-card)] border border-[var(--border-tint)] text-xs font-bold text-[var(--on-container)] cursor-pointer"
            >
              <option value="none">🌐 General Open Game (QR Code & Room Code)</option>
              {tribes.map((t) => (
                <option key={t.id} value={t.id}>
                  ⭐ {t.name} (1-Click Instant Join for Members)
                </option>
              ))}
            </select>
            {selectedTribeId !== 'none' && (
              <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold leading-tight mt-0.5">
                ✨ Zero-friction enabled: Members of this Tribe will see an active banner on their Tribe page and can join instantly without typing codes!
              </span>
            )}
          </div>
        )}

        {/* Mode Selector Cards */}
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
                ? 'border-[var(--primary-action)] bg-[var(--primary-action)]/10 shadow-sm'
                : 'border-[var(--border-tint)] bg-[var(--surface-container)] hover:border-[var(--border-tint)]/80 opacity-80'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl">
                🌐
              </span>
              {mode === 'online' && (
                <span className="w-5 h-5 rounded-full bg-[var(--primary-action)] text-white flex items-center justify-center text-xs">
                  ✓
                </span>
              )}
            </div>
            <div>
              <div className="text-sm font-extrabold text-[var(--on-container)]">Online Mode</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mt-0.5">
                Cloud Relay
              </div>
            </div>
            <p className="text-[11px] text-[var(--on-container-variant)] leading-snug">
              Plays anywhere over cellular data or Wi-Fi with internet. Instant QR code & 4-letter code.
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
                ? 'border-emerald-600 bg-emerald-500/10 shadow-sm'
                : 'border-[var(--border-tint)] bg-[var(--surface-container)] hover:border-[var(--border-tint)]/80 opacity-80'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl">
                📶
              </span>
              {mode === 'onsite' && (
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                  ✓
                </span>
              )}
            </div>
            <div>
              <div className="text-sm font-extrabold text-[var(--on-container)]">Onsite Hotspot</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mt-0.5">
                Local P2P (No Internet)
              </div>
            </div>
            <p className="text-[11px] text-[var(--on-container-variant)] leading-snug">
              Host runs mobile hotspot or connects to local church Wi-Fi. Zero cellular data required.
            </p>
          </button>
        </div>

        {/* Onsite Hotspot Settings Panel */}
        {mode === 'onsite' && (
          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-500/30 flex flex-col gap-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  Host Mobile Hotspot Setup
                </span>
              </div>

              <button
                type="button"
                onClick={handleOpenHotspotSettings}
                className="px-2.5 py-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
              >
                <Icon name="bolt" size={12} />
                <span>Open Settings</span>
              </button>
            </div>

            {hotspotTriggered && (
              <p className="text-[11px] font-semibold text-emerald-900 dark:text-emerald-200 bg-emerald-100/60 dark:bg-emerald-900/40 p-2 rounded-xl">
                ✓ Check your mobile settings to turn on Personal Hotspot. Enter the matching SSID and Password below so a QR code is generated for disciples.
              </p>
            )}

            <div className="flex flex-col gap-2">
              <div>
                <label className="text-[11px] font-bold text-[var(--on-container-variant)] mb-1 block">
                  Hotspot Network Name (SSID)
                </label>
                <input
                  type="text"
                  value={ssid}
                  onChange={(e) => setSsid(e.target.value)}
                  placeholder="e.g. FaithTribe-Hotspot or MyPhone"
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--surface-container)] border border-[var(--border-tint)] text-xs font-mono font-bold text-[var(--on-container)] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[var(--on-container-variant)] mb-1 block">
                  Hotspot Password (Optional / Leave blank if open)
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="e.g. fellowship2026"
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--surface-container)] border border-[var(--border-tint)] text-xs font-mono font-bold text-[var(--on-container)] focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <p className="text-[10px] text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
              When created, the lobby will render a Wi-Fi QR code. Disciples can scan it directly with their camera or from the join screen to automatically connect to this network.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            variant="tonal"
            size="lg"
            pill
            onClick={() => {
              triggerHaptic('light');
              onCancel();
            }}
            className="flex-1 font-bold"
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            size="lg"
            pill
            leftIcon={<Icon name="play" size={18} />}
            onClick={handleLaunch}
            className="flex-1 font-black shadow-expressive"
          >
            Launch Room
          </Button>
        </div>
      </Card>
    </div>
  );
};
