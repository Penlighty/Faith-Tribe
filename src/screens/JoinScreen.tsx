import React, { useState, useEffect, useCallback } from 'react';
import { Icon } from '@design/icons';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { useSession } from '../engine/session/SessionContext';
import { useTheme } from '../theme/ThemeContext';
import { ConnectionMode } from '../engine/types';
import { openMobileWifiSettings, getNetworkStatus } from '../engine/services/mobileNetwork';
import { QrScannerModal } from '../components/session/QrScannerModal';

export interface JoinScreenProps {
  onBack: () => void;
  onJoined: () => void;
  prefilledCode?: string;
}

/** Onsite Wi-Fi guided flow step */
type WifiFlowStep = 'idle' | 'wifi_prompt' | 'wifi_checking' | 'wifi_ok' | 'wifi_failed';

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

  // Guided Wi-Fi flow state (onsite mode)
  const [wifiStep, setWifiStep] = useState<WifiFlowStep>('idle');
  const [wifiCheckCount, setWifiCheckCount] = useState(0);

  // Check URL params on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlCode = params.get('join');
      const urlMode = params.get('mode') as ConnectionMode;
      const urlSsid = params.get('ssid');

      if (urlCode) setCode(urlCode.toUpperCase());
      if (urlMode === 'onsite' || urlMode === 'online') setMode(urlMode);
      if (urlSsid) {
        setSsid(urlSsid);
        // Auto-trigger wifi prompt when ssid is known from URL
        setWifiStep('wifi_prompt');
      }
    }
  }, []);

  // When mode changes to online, reset wifi flow
  useEffect(() => {
    if (mode === 'online') {
      setWifiStep('idle');
    }
  }, [mode]);

  const checkWifiConnectivity = useCallback(() => {
    setWifiStep('wifi_checking');
    setWifiCheckCount((c) => c + 1);

    // Give 2 seconds for network state to update after user connects
    setTimeout(() => {
      const status = getNetworkStatus();
      if (status.isOnline) {
        setWifiStep('wifi_ok');
        triggerHaptic('medium');
      } else {
        setWifiStep('wifi_failed');
      }
    }, 2000);
  }, [triggerHaptic]);

  const handleTriggerWifi = () => {
    triggerHaptic('medium');
    setWifiStep('wifi_prompt');
    openMobileWifiSettings();
  };

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
            ? 'Could not connect. Check host Wi-Fi and code.'
            : 'Could not join room. Check the code and retry.'
        );
      }
    } catch (err: any) {
      setError(err?.message || 'Error connecting to room.');
    } finally {
      setLoading(false);
    }
  };

  /** Called by QR scanner — handles both Wi-Fi QR and Game Join QR codes */
  const handleScanned = (scannedCode: string, scannedMode?: ConnectionMode, scannedSsid?: string) => {
    // Detect Wi-Fi QR string (WIFI:S:...;;)
    if (scannedCode.startsWith('WIFI:')) {
      // Parse SSID from Wi-Fi QR string
      const ssidMatch = scannedCode.match(/S:([^;]+)/);
      const parsedSsid = ssidMatch ? ssidMatch[1].replace(/\\(.)/g, '$1') : '';
      if (parsedSsid) {
        setSsid(parsedSsid);
        setMode('onsite');
        setShowScanner(false);
        setWifiStep('wifi_prompt');
        // Try to open Wi-Fi settings after a brief delay
        setTimeout(() => openMobileWifiSettings(), 300);
      }
      return;
    }

    setCode(scannedCode);
    if (scannedMode) setMode(scannedMode);
    if (scannedSsid) {
      setSsid(scannedSsid);
      setMode('onsite');
    }
    setShowScanner(false);
  };

  const isOnsiteMode = mode === 'onsite';
  const wifiConnected = wifiStep === 'wifi_ok';
  const wifiFailed = wifiStep === 'wifi_failed';
  const wifiChecking = wifiStep === 'wifi_checking';

  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-6 pb-28 pt-2 sm:pt-4 flex flex-col gap-5">
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
            isOnsiteMode
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-500/30'
              : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-500/30'
          }`}
        >
          <Icon name={isOnsiteMode ? 'host' : 'link'} size={12} />
          <span>{isOnsiteMode ? 'Onsite' : 'Online'}</span>
        </button>
      </div>

      {/* Hero Card */}
      <Card variant="hero" padding="lg" className="flex flex-col items-center gap-2.5 text-center shadow-sm">
        <Avatar name={name || 'Disciple'} size="xl" />
        <h1 className="text-2xl font-black">Enter the Room</h1>
        <p className="text-xs text-[var(--on-container-variant)] max-w-xs">
          {isOnsiteMode
            ? 'Connect to host Wi-Fi and enter the 4-letter code.'
            : 'Enter the 4-letter code or scan QR.'}
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
          className="font-bold mt-1"
        >
          Scan QR Code
        </Button>
      </Card>

      {/* ─── Onsite Hotspot Wi-Fi Info ─── */}
      {isOnsiteMode && (
        <div className="p-3.5 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-tint)] flex flex-col gap-2 shadow-xs">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  wifiConnected
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-[var(--surface-container)] text-[var(--on-container-variant)]'
                }`}
              >
                <Icon name={wifiConnected ? 'check' : 'host'} size={16} />
              </div>
              <div className="min-w-0 flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--on-container-variant)]">
                  Host Wi-Fi
                </span>
                <span className="text-xs font-bold truncate text-[var(--on-container)]">
                  {ssid || 'Host Hotspot'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {wifiConnected ? (
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Icon name="check" size={12} /> Connected
                </span>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleTriggerWifi}
                    className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] text-[var(--on-container)] border border-[var(--border-tint)] cursor-pointer"
                  >
                    Wi-Fi Settings
                  </button>
                  <button
                    type="button"
                    onClick={checkWifiConnectivity}
                    disabled={wifiChecking}
                    className="text-xs font-bold px-3 py-1 rounded-full bg-[var(--primary-action)] text-[var(--primary-action-text)] hover:opacity-90 cursor-pointer disabled:opacity-50"
                  >
                    {wifiChecking ? 'Checking…' : 'Check'}
                  </button>
                </>
              )}
            </div>
          </div>

          {wifiFailed && (
            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-tint)]/60 text-xs text-red-600 dark:text-red-400">
              <span>Wi-Fi not detected. Connect to host network.</span>
              <button
                type="button"
                onClick={checkWifiConnectivity}
                className="font-bold underline cursor-pointer ml-2"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleJoin} className="flex flex-col gap-4">
        {/* 4-Letter Code Input */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between px-1">
            <label htmlFor="room-code-input" className="text-xs font-bold uppercase tracking-wider text-[var(--on-container-variant)]">
              Room Code
            </label>
            <span className="text-[10px] font-bold text-[var(--on-container-variant)] flex items-center gap-1">
              <Icon name={isOnsiteMode ? 'host' : 'link'} size={12} />
              {isOnsiteMode ? 'Onsite' : 'Online'}
            </span>
          </div>
          <input
            id="room-code-input"
            type="text"
            maxLength={4}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ZION"
            className="w-full h-16 rounded-3xl bg-[var(--surface-card)] text-[var(--on-container)] border-2 border-[var(--border-tint)] focus:border-[var(--primary-action)] text-center font-mono text-3xl font-black tracking-widest uppercase outline-none shadow-xs"
            required
          />
        </div>

        {/* Display Name Input */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="display-name-input" className="text-xs font-bold uppercase tracking-wider text-[var(--on-container-variant)] px-1">
            Your Name
          </label>
          <input
            id="display-name-input"
            type="text"
            maxLength={18}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Priscilla"
            className="w-full h-14 rounded-2xl bg-[var(--surface-card)] text-[var(--on-container)] border-2 border-[var(--border-tint)] focus:border-[var(--primary-action)] px-4 font-bold text-base outline-none shadow-xs"
            required
          />
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 text-xs font-bold text-center border border-red-200 dark:border-red-900/50 flex flex-col gap-1 items-center">
            <span>{error}</span>
            {isOnsiteMode && (
              <button
                type="button"
                onClick={handleTriggerWifi}
                className="underline hover:opacity-80 cursor-pointer text-xs"
              >
                Open Wi-Fi Settings
              </button>
            )}
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
          {loading ? 'Joining…' : 'Join Room'}
        </Button>
      </form>

      {/* QR Scanner Modal — handles both Wi-Fi QR and Game Join QR */}
      <QrScannerModal
        isOpen={showScanner}
        onScanned={handleScanned}
        onCancel={() => setShowScanner(false)}
      />
    </div>
  );
};
