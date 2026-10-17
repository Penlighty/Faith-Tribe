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
  const [showQR, setShowQR] = useState(false);
  const { triggerHaptic } = useTheme();

  const game = gameRegistry.get(config.selectedGameId);
  const minPlayers = game?.meta?.minPlayers || 4;
  const canStart = players.length >= 1; // Allows testing with 1+

  const joinUrl = typeof window !== 'undefined'
    ? `${window.location.origin}?join=${roomCode}`
    : `https://faithtribe.app?join=${roomCode}`;

  const handleCopyLink = () => {
    triggerHaptic('light');
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLeave = async () => {
    await leaveSession();
    onLeave();
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-28 pt-2 sm:pt-6 flex flex-col gap-6">
      {/* Top Bar with room code, game badge, and leave */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <GameBadge game={config.selectedGameId} size={36} variant="tonal" />
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--on-container-variant)]">
              Lobby Active
            </span>
            <span className="text-sm font-extrabold text-[var(--on-container)]">
              {game?.meta?.name || 'Fellowship Game'}
            </span>
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
        {/* Left Column: Room Code, QR Code, and Host Start Button */}
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

            {/* QR Code: Always visible on desktop (md:flex), toggleable on mobile */}
            <div className={`p-4 bg-white rounded-2xl shadow-sm flex-col items-center gap-2 border border-black/5 ${showQR ? 'flex' : 'hidden md:flex'}`}>
              <QRCodeSVG value={joinUrl} size={150} level="M" />
              <span className="text-[11px] text-gray-700 font-bold flex items-center gap-1">
                <Icon name="qr" size={14} /> Scan with phone camera to join
              </span>
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

        {/* Right Column: Disciples in Room List */}
        <div className="md:col-span-7 flex flex-col gap-5">
          <Card variant="tonal" padding="lg" className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[var(--border-tint)]/60 pb-3">
              <span className="text-sm font-bold uppercase tracking-wider text-[var(--on-container)] flex items-center gap-2">
                <Icon name="team" size={16} className="text-[var(--primary-action)]" /> Disciples Gathered ({players.length})
              </span>
              <span className="text-xs font-mono font-bold text-[var(--on-container-variant)] px-2.5 py-1 rounded-full bg-[var(--surface-card)]">
                Min {minPlayers} Players
              </span>
            </div>

            {players.length === 0 ? (
              <div className="py-12 text-center text-sm font-semibold text-[var(--on-container-variant)]">
                Waiting for disciples to enter the room code...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {players.map((p) => {
                  const team = teams.find((t) => t.id === p.teamId);
                  return (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-2xl bg-[var(--surface-card)] text-[var(--on-container)] border border-[var(--border-tint)] flex items-center gap-3 shadow-sm hover:border-[var(--primary-action)]/40 transition-colors"
                    >
                      <Avatar name={p.name} isHost={p.isHost} teamColor={team?.color} size="md" />
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold truncate leading-tight">{p.name}</span>
                          {p.isHost && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[var(--primary-action)] text-[var(--primary-action-text)]">
                              Host
                            </span>
                          )}
                        </div>
                        {team && (
                          <span className="text-[11px] font-semibold text-[var(--on-container-variant)]">
                            {team.name}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Quick Host Instructions for Big Screen */}
          <Card variant="surface" padding="md" className="flex flex-col gap-2 border border-[var(--border-tint)]">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--on-container-variant)]">
              Screen Tip
            </span>
            <p className="text-xs leading-relaxed text-[var(--on-container-variant)]">
              If presenting on a TV or projector, leave this screen open. Players can scan the QR code directly with their phone camera to jump right into the lobby without typing.
            </p>
          </Card>
        </div>
      </div>

      <div className="text-center text-[11px] text-[var(--on-container-variant)] font-mono opacity-60">
        Transport: {transportName} • Room: {roomCode}
      </div>
    </div>
  );
};
