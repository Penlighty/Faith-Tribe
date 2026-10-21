import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Icon } from '../../design/icons';
import { useTheme } from '../../theme/ThemeContext';
import { ConnectionMode, HotspotInfo } from '../../engine/types';
import { openMobileHotspotSettings } from '../../engine/services/mobileNetwork';

export interface HostSessionModalProps {
  isOpen: boolean;
  gameName: string;
  onConfirm: (mode: ConnectionMode, hotspotInfo?: HotspotInfo) => void;
  onCancel: () => void;
}

export const HostSessionModal: React.FC<HostSessionModalProps> = ({
  isOpen,
  gameName,
  onConfirm,
  onCancel,
}) => {
  const { triggerHaptic } = useTheme();
  const [mode, setMode] = useState<ConnectionMode>('online');
  const [ssid, setSsid] = useState('FaithTribe-Hotspot');
  const [password, setPassword] = useState('');
  const [hotspotTriggered, setHotspotTriggered] = useState(false);

  if (!isOpen) return null;

  const handleLaunch = () => {
    triggerHaptic('heavy');
    if (mode === 'onsite') {
      onConfirm('onsite', {
        ssid: ssid.trim() || 'FaithTribe-Hotspot',
        password: password.trim() || undefined,
        security: password.trim() ? 'WPA' : 'nopass',
      });
    } else {
      onConfirm('online');
    }
  };

  const handleOpenHotspotSettings = () => {
    triggerHaptic('medium');
    setHotspotTriggered(true);
    openMobileHotspotSettings();
  };

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
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--primary-action)]">
            Host Game Session
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--on-container)]">
            Choose Connection Architecture
          </h2>
          <p className="text-xs text-[var(--on-container-variant)]">
            Select how disciples will connect to your room for <span className="font-bold text-[var(--on-container)]">{gameName}</span>.
          </p>
        </div>

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
              <div className="text-sm font-extrabold text-[var(--on-container)]">Onsite Mode</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mt-0.5">
                Local Hotspot (Offline P2P)
              </div>
            </div>
            <p className="text-[11px] text-[var(--on-container-variant)] leading-snug">
              Ideal for church retreats, youth halls, or weak cell reception. Zero internet data required.
            </p>
          </button>
        </div>

        {/* Onsite Mode Setup Controls */}
        {mode === 'onsite' && (
          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-500/30 flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <Icon name="bolt" size={14} /> Hotspot Network Setup
              </span>
              <button
                type="button"
                onClick={handleOpenHotspotSettings}
                className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 underline hover:opacity-80 flex items-center gap-1 cursor-pointer"
              >
                📱 Open Hotspot Settings
              </button>
            </div>

            <p className="text-[11px] text-emerald-900/80 dark:text-emerald-200/80 leading-relaxed">
              Disciples will connect their Wi-Fi to your phone&apos;s Personal Hotspot or the local venue router.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-[var(--on-container-variant)]">
                  Hotspot Name (SSID)
                </label>
                <input
                  type="text"
                  value={ssid}
                  onChange={(e) => setSsid(e.target.value)}
                  placeholder="e.g. FaithTribe-Hotspot"
                  className="h-10 px-3 rounded-xl bg-[var(--surface-card)] text-sm font-bold border border-[var(--border-tint)] focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-[var(--on-container-variant)]">
                  Password (Optional)
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave empty if open"
                  className="h-10 px-3 rounded-xl bg-[var(--surface-card)] text-sm font-bold border border-[var(--border-tint)] focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            {hotspotTriggered && (
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-[11px] font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Mobile Hotspot permissions triggered. Verify your Personal Hotspot is ON in Settings.</span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-1">
          <Button
            variant="tonal"
            size="lg"
            className="w-full order-2 sm:order-1 font-bold"
            onClick={() => {
              triggerHaptic('light');
              onCancel();
            }}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            size="lg"
            className="w-full order-1 sm:order-2 font-black shadow-md flex items-center justify-center gap-2"
            onClick={handleLaunch}
          >
            <span>Launch {mode === 'onsite' ? 'Onsite Hotspot' : 'Online'} Lobby</span>
            <Icon name="arrow-right" size={16} />
          </Button>
        </div>
      </Card>
    </div>
  );
};
