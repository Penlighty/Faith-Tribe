import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Icon } from '../../design/icons';
import { DisconnectReason } from '../../engine/session/SessionContext';

export interface DisconnectedOverlayProps {
  reason: DisconnectReason;
  playerName?: string;
  roomCode?: string;
  isReconnecting: boolean;
  onReconnect: () => void;
  onLeave: () => void;
}

export const DisconnectedOverlay: React.FC<DisconnectedOverlayProps> = ({
  reason,
  playerName,
  roomCode,
  isReconnecting,
  onReconnect,
  onLeave,
}) => {
  const [hasTriedReconnect, setHasTriedReconnect] = useState(false);

  const isGameStarted = reason === 'game_started';

  const handleReconnect = () => {
    setHasTriedReconnect(true);
    onReconnect();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-fadeIn">
      <Card
        variant="elevated"
        padding="lg"
        className="w-full max-w-sm bg-[var(--surface-card)] border-2 border-[var(--border-tint)] shadow-2xl rounded-3xl flex flex-col items-center text-center gap-5 relative overflow-hidden animate-scaleUp"
      >
        {/* Status Icon */}
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${
            isGameStarted
              ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
              : isReconnecting
              ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 animate-pulse'
              : 'bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400'
          }`}
        >
          {isReconnecting ? (
            <Icon name="bolt" size={32} />
          ) : isGameStarted ? (
            <span>🎮</span>
          ) : (
            <Icon name="close" size={32} />
          )}
        </div>

        {/* Title & Description */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-black text-[var(--on-container)]">
            {isReconnecting
              ? 'Reconnecting\u2026'
              : isGameStarted
              ? 'Game Already Started'
              : 'Connection Lost'}
          </h2>

          {isReconnecting ? (
            <p className="text-sm text-[var(--on-container-variant)] leading-relaxed">
              Trying to reconnect you to{' '}
              {roomCode ? (
                <span className="font-mono font-black text-[var(--primary-action)]">{roomCode}</span>
              ) : (
                'the room'
              )}
              \u2026
            </p>
          ) : isGameStarted ? (
            <p className="text-sm text-[var(--on-container-variant)] leading-relaxed">
              Hi <strong className="text-[var(--on-container)]">{playerName || 'Disciple'}</strong>, it
              looks like the game in room{' '}
              <span className="font-mono font-black text-[var(--primary-action)]">{roomCode}</span> has
              already started. You can contact the host to join a future session.
            </p>
          ) : (
            <p className="text-sm text-[var(--on-container-variant)] leading-relaxed">
              You were disconnected from room{' '}
              {roomCode ? (
                <span className="font-mono font-black text-[var(--primary-action)]">{roomCode}</span>
              ) : (
                'the session'
              )}
              . The host may still be waiting for players to join.
            </p>
          )}
        </div>

        {/* Reconnect status hint if failed before */}
        {hasTriedReconnect && !isReconnecting && !isGameStarted && (
          <div className="w-full p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-400/30 text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <span>&#9888;&#65039;</span>
            <span>Could not reach the host. Make sure you are on the same network and try again.</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full">
          {!isGameStarted && (
            <Button
              variant="primary"
              size="lg"
              pill
              disabled={isReconnecting}
              onClick={handleReconnect}
              className="w-full font-black flex items-center justify-center gap-2 shadow-md"
            >
              {isReconnecting ? (
                <>
                  <Icon name="bolt" size={18} />
                  Reconnecting\u2026
                </>
              ) : (
                <>
                  <Icon name="refresh" size={18} />
                  Try Reconnecting
                </>
              )}
            </Button>
          )}

          <Button
            variant="tonal"
            size="md"
            pill
            onClick={onLeave}
            disabled={isReconnecting}
            className="w-full font-bold text-[var(--on-container-variant)]"
          >
            {isGameStarted ? 'Return Home' : 'Leave Session'}
          </Button>
        </div>

        {/* Footer note */}
        <p className="text-[10px] text-[var(--on-container-variant)] opacity-60 leading-tight">
          {isGameStarted
            ? 'Ask your host to start a new game session and share the new room code with you.'
            : 'Tip: Stay on this screen and tap "Try Reconnecting" once your Wi-Fi or connection is stable.'}
        </p>
      </Card>
    </div>
  );
};
