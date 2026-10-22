import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Chip } from '../components/ui/Chip';
import { useSession } from '../engine/session/SessionContext';
import { gameRegistry } from '../engine/registry';
import { useTheme } from '../theme/ThemeContext';
import { Icon, GameBadge } from '../design/icons';
import { generateWifiQrString, openMobileHotspotSettings } from '../engine/services/mobileNetwork';
import { SelectGameModal } from '../components/session/SelectGameModal';

export interface LobbyScreenProps {
  onLeave: () => void;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({ onLeave }) => {
  const {
    roomCode,
    isHost,
    players,
    teams,
    config,
    updateConfig,
    autoBalanceTeams,
    startGame,
    leaveSession,
    transportName,
  } = useSession();

  const [copied, setCopied] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showGamePicker, setShowGamePicker] = useState(false);
  const [qrTab, setQrTab] = useState<'join' | 'wifi'>('join');
  const { triggerHaptic } = useTheme();

  const game = gameRegistry.get(config.selectedGameId);
  const minPlayers = game?.meta?.minPlayers || 4;
  const canStart = players.length >= 1; // Allows testing with 1+

  const isOnsite = config.connectionMode === 'onsite';
  const hotspotInfo = config.hotspotInfo;

  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const [useCloudUrl, setUseCloudUrl] = useState(isLocalhost && !isOnsite);

  const baseOrigin =
    isLocalhost && useCloudUrl
      ? 'https://faith-tribe.vercel.app'
      : typeof window !== 'undefined'
      ? window.location.origin
      : 'https://faith-tribe.vercel.app';

  const joinUrl = `${baseOrigin}?join=${roomCode}&mode=${isOnsite ? 'onsite' : 'online'}${
    hotspotInfo?.ssid ? `&ssid=${encodeURIComponent(hotspotInfo.ssid)}` : ''
  }`;

  const wifiQrString = isOnsite && hotspotInfo?.ssid
    ? generateWifiQrString({
        ssid: hotspotInfo.ssid,
        password: hotspotInfo.password,
        security: hotspotInfo.password ? 'WPA' : 'nopass',
      })
    : '';

  const handleCopyLink = () => {
    triggerHaptic('light');
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyPassword = () => {
    if (!hotspotInfo?.password) return;
    triggerHaptic('light');
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(hotspotInfo.password);
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    }
  };

  const handleLeave = async () => {
    await leaveSession();
    onLeave();
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-28 pt-2 sm:pt-6 flex flex-col gap-6">
      {/* Top Bar with room code, connection badge, game badge, and leave */}
      <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-2.5">
          <GameBadge game={config.selectedGameId} size={36} variant="tonal" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--on-container-variant)]">
                Lobby Active
              </span>
              <span
                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  isOnsite
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-500/30'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200 border border-blue-500/30'
                }`}
              >
                <span>{isOnsite ? '📶 Onsite Hotspot P2P' : '🌐 Online Cloud'}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-[var(--on-container)]">
                {game?.meta?.name || 'Fellowship Game'}
              </span>
              {isHost && (
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setShowGamePicker(true);
                  }}
                  className="px-2.5 py-0.5 rounded-full bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] text-[10px] font-bold text-[var(--primary-action)] border border-[var(--border-tint)] flex items-center gap-1 transition-colors cursor-pointer"
                  title="Switch to another game"
                >
                  <Icon name="refresh" size={11} />
                  <span>Change Game</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleLeave}
          className="px-4 py-2 rounded-full bg-[var(--surface-container)] text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-1.5 transition-colors cursor-pointer border border-[var(--border-tint)]/60"
        >
          <Icon name="close" size={14} />
          <span>Leave Session</span>
        </button>
      </div>

      {/* Responsive Grid: 2-column on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Room Code, QR Code, Hotspot Details, and Host Start Button */}
        <div className="md:col-span-5 flex flex-col gap-5">
          {/* Room Code & QR Hero Card */}
          <Card variant="hero" padding="lg" className="flex flex-col items-center gap-4 text-center shadow-md">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--on-container-variant)] flex items-center gap-1.5">
              <Icon name="code" size={14} /> Join with Room Code
            </span>

            {/* Room Code in huge bold tabular style */}
            <div className="text-5xl sm:text-6xl font-black font-mono tracking-widest text-[var(--primary-action)] bg-[var(--surface-card)] px-7 py-3.5 rounded-3xl shadow-sm border border-[var(--border-tint)]">
              {roomCode}
            </div>

            {/* Onsite Mode Tabs: Join Game vs Connect Wi-Fi */}
            {isOnsite && hotspotInfo?.ssid && (
              <div className="flex rounded-xl bg-[var(--surface-container)] p-1 gap-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setQrTab('join')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    qrTab === 'join' ? 'bg-[var(--surface-card)] text-[var(--on-container)] shadow-xs' : 'opacity-70'
                  }`}
                >
                  📱 Game QR
                </button>
                <button
                  type="button"
                  onClick={() => setQrTab('wifi')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    qrTab === 'wifi' ? 'bg-[var(--surface-card)] text-[var(--on-container)] shadow-xs' : 'opacity-70'
                  }`}
                >
                  📶 Wi-Fi QR
                </button>
              </div>
            )}

            {/* QR Code */}
            <div className={`p-4 bg-white rounded-2xl shadow-sm flex-col items-center gap-2 border border-black/5 ${showQR ? 'flex' : 'hidden md:flex'}`}>
              <QRCodeSVG
                value={qrTab === 'wifi' && wifiQrString ? wifiQrString : joinUrl}
                size={150}
                level="M"
              />
              <span className="text-[11px] text-gray-700 font-bold flex items-center gap-1">
                <Icon name="qr" size={14} />
                {qrTab === 'wifi' ? 'Scan to Connect to Host Wi-Fi' : 'Scan with camera to Join Room'}
              </span>

              {/* Localhost helper toggle: Phone Camera (Cloud) vs Localhost */}
              {isLocalhost && !isOnsite && (
                <div className="mt-1 flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-[10px] font-bold text-gray-600">
                  <button
                    type="button"
                    onClick={() => setUseCloudUrl(true)}
                    className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                      useCloudUrl ? 'bg-white text-gray-900 shadow-xs' : 'hover:text-gray-900'
                    }`}
                  >
                    📱 Phone (Cloud URL)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseCloudUrl(false)}
                    className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                      !useCloudUrl ? 'bg-white text-gray-900 shadow-xs' : 'hover:text-gray-900'
                    }`}
                  >
                    💻 Localhost
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-2 w-full">
              <Button
                variant="tonal"
                size="md"
                pill
                className="flex-1 md:hidden flex items-center justify-center gap-1.5"
                onClick={() => setShowQR(!showQR)}
              >
                <Icon name="qr" size={16} />
                <span>{showQR ? 'Hide QR' : 'Show QR'}</span>
              </Button>

              <Button
                variant="tonal"
                size="md"
                pill
                leftIcon={<Icon name={copied ? 'check' : 'copy'} size={16} />}
                onClick={handleCopyLink}
                className="flex-1 font-bold flex items-center justify-center gap-1.5"
              >
                {copied ? 'Link Copied!' : 'Copy Join Link'}
              </Button>
            </div>
          </Card>

          {/* Onsite Mode: Host Hotspot Credentials Card */}
          {isOnsite && (
            <Card variant="tonal" padding="md" className="flex flex-col gap-2.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <Icon name="bolt" size={14} /> Host Hotspot Network
                </span>
                {isHost && (
                  <button
                    type="button"
                    onClick={openMobileHotspotSettings}
                    className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 underline hover:opacity-80 cursor-pointer"
                  >
                    Hotspot Settings
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--on-container-variant)]">Network (SSID):</span>
                <span className="font-mono font-bold text-[var(--on-container)]">
                  {hotspotInfo?.ssid || 'FaithTribe-Hotspot'}
                </span>
              </div>

              {hotspotInfo?.password && (
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[var(--on-container-variant)]">Password:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-[var(--on-container)]">
                      {hotspotInfo.password}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyPassword}
                      className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 underline cursor-pointer"
                    >
                      {copiedPass ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}

              <p className="text-[10px] text-emerald-800/80 dark:text-emerald-300/80 leading-tight">
                Disciples must connect to this Wi-Fi before entering the 4-letter room code.
              </p>
            </Card>
          )}

          {/* Play Mode & Teams Controls (Host only) */}
          {isHost && (
            <Card variant="tonal" padding="md" className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--on-container-variant)]">
                  Play Mode
                </span>
                {config.playMode !== 'individuals' && (
                  <button
                    onClick={autoBalanceTeams}
                    className="text-xs font-bold text-[var(--primary-action)] flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Icon name="refresh" size={14} /> Auto-Balance
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(['individuals', 'pairs', 'teams'] as const).map((mode) => (
                  <Chip
                    key={mode}
                    selected={config.playMode === mode}
                    onClick={() => updateConfig({ playMode: mode })}
                    className="justify-center capitalize py-2 font-bold"
                  >
                    {mode}
                  </Chip>
                ))}
              </div>
            </Card>
          )}

          {/* Start Button / Waiting Banner */}
          <div>
            {isHost ? (
              <Button
                variant="primary"
                size="hero"
                pill
                disabled={!canStart}
                leftIcon={<Icon name="play" variant="tonal" size={20} />}
                onClick={startGame}
                className="w-full shadow-expressive text-base font-bold py-3.5 flex items-center justify-center gap-2"
              >
                Start {game?.meta?.name || 'Game'}
              </Button>
            ) : (
              <div className="p-4 rounded-2xl bg-[var(--surface-container)] text-center text-sm font-bold flex items-center justify-center gap-2 border border-[var(--border-tint)]">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                Waiting for host to start the round...
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Disciples in Room List (Realtime Live Updates) */}
        <div className="md:col-span-7 flex flex-col gap-5">
          <Card variant="tonal" padding="lg" className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[var(--border-tint)]/60 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-sm font-bold uppercase tracking-wider text-[var(--on-container)] flex items-center gap-1.5">
                  <Icon name="team" size={16} className="text-[var(--primary-action)]" /> Disciples Gathered ({players.length})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[var(--surface-card)] text-[var(--on-container-variant)]">
                  {isOnsite ? '📶 Local P2P Active' : '🌐 Cloud Active'}
                </span>
                <span className="text-xs font-mono font-bold text-[var(--on-container-variant)] px-2.5 py-1 rounded-full bg-[var(--surface-card)]">
                  Min {minPlayers} Players
                </span>
              </div>
            </div>

            {players.length === 0 ? (
              <div className="py-12 text-center text-sm font-semibold text-[var(--on-container-variant)]">
                Waiting for disciples to enter the room code...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {players.map((p) => {
                  const team = teams.find((t) => t.id === p.teamId);
                  const isPlayerOnsite = p.connectionMode === 'onsite' || (isOnsite && !p.connectionMode);

                  return (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-2xl bg-[var(--surface-card)] text-[var(--on-container)] border border-[var(--border-tint)] flex items-center gap-3 shadow-sm hover:border-[var(--primary-action)]/40 transition-all animate-scaleUp"
                    >
                      <Avatar name={p.name} isHost={p.isHost} teamColor={team?.color} size="md" />
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold truncate leading-tight">{p.name}</span>
                          {p.isHost && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[var(--primary-action)] text-[var(--primary-action-text)]">
                              Host
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {team && (
                            <span className="text-[11px] font-semibold text-[var(--on-container-variant)] truncate">
                              {team.name}
                            </span>
                          )}
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                              isPlayerOnsite
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            }`}
                          >
                            {isPlayerOnsite ? '📶 Hotspot' : '🌐 Online'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Quick Host Instructions for Big Screen */}
          <Card variant="surface" padding="md" className="flex flex-col gap-2 border border-[var(--border-tint)]">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--on-container-variant)] flex items-center gap-1.5">
              <Icon name="info" size={14} /> Screen Tip for Gatherings
            </span>
            <p className="text-xs leading-relaxed text-[var(--on-container-variant)]">
              {isOnsite
                ? 'Host is acting as the local network anchor. Disciples connected to the host hotspot will appear in the Disciples Gathered list in realtime without needing internet data.'
                : 'If presenting on a TV or projector, leave this screen open. Players can scan the QR code directly with their phone camera to jump right into the lobby without typing.'}
            </p>
          </Card>
        </div>
      </div>

      <div className="text-center text-[11px] text-[var(--on-container-variant)] font-mono opacity-60">
        Transport: {transportName} • Mode: {isOnsite ? 'Onsite Hotspot' : 'Online'} • Room: {roomCode}
      </div>

      {/* Switch Game Modal (Host Only) */}
      {isHost && (
        <SelectGameModal
          isOpen={showGamePicker}
          title="Switch Lobby Game"
          subtitle="Change the game for all connected disciples before starting the round."
          selectedGameId={config.selectedGameId}
          onSelectGame={(newGameId) => {
            updateConfig({ selectedGameId: newGameId });
            setShowGamePicker(false);
          }}
          onCancel={() => setShowGamePicker(false)}
        />
      )}
    </div>
  );
};
