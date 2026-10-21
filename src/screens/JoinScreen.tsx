import React, { useState, useEffect } from 'react';
import { Icon } from '@design/icons';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { useSession } from '../engine/session/SessionContext';
import { useTheme } from '../theme/ThemeContext';
import { ConnectionMode } from '../engine/types';
import { openMobileWifiSettings } from '../engine/services/mobileNetwork';
import { QrScannerModal } from '../components/session/QrScannerModal';

export interface JoinScreenProps {
  onBack: () => void;
  onJoined: () => void;
  prefilledCode?: string;
}

export const JoinScreen: React.FC<JoinScreenProps> = ({
  onBack,
  onJoined,
  prefilledCode = '',
}) => {
  const { joinSession, currentUser } = useSession();
  const { triggerHaptic } = useTheme();

  const [code, setCode] = useState(prefilledCode);
  const [name, setName] = useState(currentUser?.name || '');
  const [mode, setMode] = useState<ConnectionMode>('online');
  const [ssid, setSsid] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [wifiPrompted, setWifiPrompted] = useState(false);

  // Check URL params on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlCode = params.get('join');
      const urlMode = params.get('mode') as ConnectionMode;
      const urlSsid = params.get('ssid');

      if (urlCode) setCode(urlCode.toUpperCase());
      if (urlMode === 'onsite' || urlMode === 'online') setMode(urlMode);
      if (urlSsid) setSsid(urlSsid);
    }
  }, []);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;

    setError('');
    setLoading(true);
    triggerHaptic('medium');

    try {
      const success = await joinSession(code.trim().toUpperCase(), name.trim(), mode);
      if (success) {
        onJoined();
      } else {
        setError(
          mode === 'onsite'
            ? 'Could not connect via Onsite Hotspot. Verify your Wi-Fi is connected to the host network.'
            : 'Could not join room. Please check the 4-letter code.'
        );
      }
    } catch (err: any) {
      setError(err?.message || 'Error connecting to session');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerWifi = () => {
    triggerHaptic('medium');
    setWifiPrompted(true);
    openMobileWifiSettings();
  };

  const handleScanned = (scannedCode: string, scannedMode?: ConnectionMode, scannedSsid?: string) => {
    setCode(scannedCode);
    if (scannedMode) setMode(scannedMode);
    if (scannedSsid) setSsid(scannedSsid);
    setShowScanner(false);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 sm:px-6 pb-28 pt-2 sm:pt-6 flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] flex items-center justify-center text-[var(--on-container)] transition-colors cursor-pointer border border-[var(--border-tint)]/60"
            aria-label="Back"
          >
            <Icon name="arrow-left" size={20} />
          </button>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--on-container-variant)]">
              Multiplayer
            </span>
            <h2 className="text-xl font-bold">Join Session</h2>
          </div>
        </div>

        {/* Mode Toggle Button */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setMode(mode === 'online' ? 'onsite' : 'online');
          }}
          className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
            mode === 'onsite'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-500/40'
              : 'bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200 border-blue-500/40'
          }`}
        >
          <span>{mode === 'onsite' ? '📶 Onsite Hotspot' : '🌐 Online Cloud'}</span>
          <span className="text-[10px] opacity-70 underline">Switch</span>
        </button>
      </div>

      <Card variant="hero" padding="lg" className="flex flex-col items-center gap-3 text-center shadow-md">
        <Avatar name={name || 'Disciple'} size="xl" />
        <h1 className="text-2xl font-black">Enter the Room</h1>
        <p className="text-xs font-semibold opacity-85 max-w-sm">
          {mode === 'onsite'
            ? 'Connect to host phone hotspot or local Wi-Fi, then enter the 4-letter code or scan host screen.'
            : 'Type the 4-letter room code shown on the host screen or scan the QR code with your camera.'}
        </p>

        {/* Camera QR Scanner Launch Button */}
        <Button
          variant="tonal"
          size="sm"
          pill
          leftIcon={<Icon name="qr" size={16} />}
          onClick={() => {
            triggerHaptic('light');
            setShowScanner(true);
          }}
          className="font-bold mt-1 shadow-xs"
        >
          Scan Host Screen QR Code
        </Button>
      </Card>

      {/* Onsite Hotspot & Wi-Fi Prompt Banner */}
      {mode === 'onsite' && (
        <Card
          variant="elevated"
          padding="md"
          className="bg-emerald-50/80 dark:bg-emerald-950/40 border-2 border-emerald-500/40 rounded-2xl flex flex-col gap-2.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <Icon name="bolt" size={14} /> Onsite Wi-Fi Requirement
            </span>
            <button
              type="button"
              onClick={handleTriggerWifi}
              className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300 underline hover:opacity-80 flex items-center gap-1 cursor-pointer"
            >
              📱 Open Wi-Fi Settings
            </button>
          </div>

          <p className="text-xs text-emerald-900/90 dark:text-emerald-100/90 leading-relaxed">
            Please make sure your phone&apos;s Wi-Fi is <strong>turned ON</strong> and connected to the host&apos;s Personal Hotspot or room network:
          </p>

          <div className="p-2.5 rounded-xl bg-[var(--surface-card)] border border-emerald-500/30 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase text-[var(--on-container-variant)]">
                Required Wi-Fi Network
              </span>
              <span className="text-sm font-black text-[var(--on-container)]">
                {ssid || 'Host Phone Hotspot / Church Wi-Fi'}
              </span>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              Local P2P
            </span>
          </div>

          {wifiPrompted && (
            <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
              ✓ Wi-Fi check triggered. Once connected to host network, tap Join below!
            </div>
          )}
        </Card>
      )}

      <form onSubmit={handleJoin} className="flex flex-col gap-4">
        {/* 4-Letter Code Input */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between px-1">
            <label htmlFor="room-code-input" className="text-xs font-bold uppercase tracking-wider text-[var(--on-container-variant)]">
              4-Letter Room Code
            </label>
            <span className="text-[10px] font-bold text-[var(--on-container-variant)]">
              {mode === 'onsite' ? '📶 Onsite' : '🌐 Online'}
            </span>
          </div>
          <input
            id="room-code-input"
            type="text"
            maxLength={4}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. ZION"
            className="w-full h-16 rounded-3xl bg-[var(--surface-card)] text-[var(--on-container)] border-2 border-[var(--border-tint)] focus:border-[var(--primary-action)] text-center font-mono text-3xl font-black tracking-widest uppercase outline-none shadow-sm"
            required
          />
        </div>

        {/* Display Name Input */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="display-name-input" className="text-xs font-bold uppercase tracking-wider text-[var(--on-container-variant)] px-1">
            Your Display Name
          </label>
          <input
            id="display-name-input"
            type="text"
            maxLength={18}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Priscilla"
            className="w-full h-14 rounded-2xl bg-[var(--surface-card)] text-[var(--on-container)] border-2 border-[var(--border-tint)] focus:border-[var(--primary-action)] px-4 font-bold text-base outline-none shadow-sm"
            required
          />
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200 text-xs font-bold text-center leading-relaxed border border-red-300/40">
            {error}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="hero"
          pill
          disabled={code.length < 4 || !name.trim() || loading}
          leftIcon={<Icon name="join" size={20} />}
          className="w-full mt-2 font-black shadow-md flex items-center justify-center gap-2"
        >
          {loading ? 'Entering Room...' : `Join Fellowship (${mode === 'onsite' ? 'Onsite' : 'Online'})`}
        </Button>
      </form>

      {/* QR Scanner Modal */}
      <QrScannerModal
        isOpen={showScanner}
        onScanned={handleScanned}
        onCancel={() => setShowScanner(false)}
      />
    </div>
  );
};
