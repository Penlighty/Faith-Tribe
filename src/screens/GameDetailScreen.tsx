import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { gameRegistry } from '../engine/registry';
import { PlayMode, ConnectionMode, HotspotInfo } from '../engine/types';
import { useSession } from '../engine/session/SessionContext';
import { Icon, GameBadge } from '../design/icons';
import { HostSessionModal } from '../components/session/HostSessionModal';

export interface GameDetailScreenProps {
  gameId: string;
  onBack: () => void;
  onHostSession: (
    gameId: string,
    playMode: PlayMode,
    connectionMode?: ConnectionMode,
    hotspotInfo?: HotspotInfo
  ) => void;
  onSoloPractice: (gameId: string) => void;
}

export const GameDetailScreen: React.FC<GameDetailScreenProps> = ({
  gameId,
  onBack,
  onHostSession,
  onSoloPractice,
}) => {
  const game = gameRegistry.get(gameId);
  const [selectedMode, setSelectedMode] = useState<PlayMode>('individuals');
  const [showHostModal, setShowHostModal] = useState(false);
  const { currentUser } = useSession();

  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [gameId]);

  if (!game) {
    return (
      <div className="p-6 text-center">
        <p>Game not found.</p>
        <Button onClick={onBack}>Back to Library</Button>
      </div>
    );
  }

  const { meta } = game;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-28 pt-2 sm:pt-6 flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] flex items-center justify-center text-[var(--on-container)] transition-colors cursor-pointer border border-[var(--border-tint)]/60"
          aria-label="Back to Games"
        >
          <Icon name="arrow-left" size={20} />
        </button>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--on-container-variant)]">
            Game Detail
          </span>
          <h2 className="text-xl sm:text-2xl font-bold truncate">{meta.name}</h2>
        </div>
      </div>

      {/* Main Responsive Grid: 2-column on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Hero Card & Primary Actions */}
        <div className="md:col-span-5 flex flex-col gap-4 md:sticky md:top-20">
          <Card variant="hero" padding="lg" className="flex flex-col items-center gap-3.5 text-center shadow-md">
            <div className="my-2 animate-bounce-subtle">
              <GameBadge game={meta.id} size={84} variant="tonal" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{meta.name}</h1>
            <p className="text-xs sm:text-sm font-semibold opacity-85 leading-relaxed max-w-sm">
              {meta.description}
            </p>

            {/* Badges */}
            <div className="flex items-center gap-2 mt-1">
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[var(--surface-card)] text-[var(--on-container)] flex items-center gap-1.5 shadow-sm border border-[var(--border-tint)]">
                <Icon name="team" size={14} /> {meta.minPlayers}-{meta.maxPlayers} Players
              </span>
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[var(--surface-card)] text-[var(--on-container)] flex items-center gap-1.5 shadow-sm border border-[var(--border-tint)]">
                <Icon name="timer" size={14} /> ~{meta.estimatedMinutes} Mins
              </span>
            </div>
          </Card>

          {/* Action Cluster */}
          <div className="flex flex-col gap-3">
            <Button
              variant="primary"
              size="hero"
              pill
              leftIcon={<Icon name="play" variant="tonal" size={20} />}
              className="w-full shadow-lg"
              onClick={() => setShowHostModal(true)}
            >
              Host Game Session
            </Button>

            {meta.supportsSoloPractice && (
              <Button
                variant="tonal"
                size="lg"
                pill
                leftIcon={<Icon name="star" variant="tonal" size={18} />}
                className="w-full"
                onClick={() => onSoloPractice(meta.id)}
              >
                Solo Practice Mode
              </Button>
            )}
          </div>
        </div>

        {/* Right Column: Rules, Mode Selection, and Game Notes */}
        <div className="md:col-span-7 flex flex-col gap-5">
          {/* Rules in 3 Steps */}
          <Card variant="tonal" padding="lg" className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--on-container-variant)]">
              <Icon name="book-open" size={16} />
              <span>How to Play (3 Simple Steps)</span>
            </div>

            <div className="flex flex-col gap-3">
              {meta.rulesSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3.5 p-3 rounded-2xl bg-[var(--surface-card)]/60 border border-[var(--border-tint)]/40">
                  <span className="w-7 h-7 rounded-full bg-[var(--primary-action)] text-[var(--primary-action-text)] font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    {idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm leading-relaxed font-semibold text-[var(--on-container)]">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Mode Picker (Individuals, Pairs, Teams) */}
          <Card variant="surface" padding="md" className="flex flex-col gap-3">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--on-container-variant)] px-1">
              Choose Play Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['individuals', 'pairs', 'teams'] as PlayMode[]).map((mode) => {
                const isSupported = meta.supportedPlayModes.includes(mode);
                return (
                  <Chip
                    key={mode}
                    selected={selectedMode === mode}
                    onClick={isSupported ? () => setSelectedMode(mode) : undefined}
                    className={`justify-center capitalize py-2.5 font-bold ${!isSupported ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    {mode}
                  </Chip>
                );
              })}
            </div>
            <p className="text-[11px] text-[var(--on-container-variant)] px-1">
              {selectedMode === 'individuals' && 'Each disciple plays on their own device with individual leaderboard ranking.'}
              {selectedMode === 'pairs' && 'Form pairs of two to collaborate on answers and share wisdom.'}
              {selectedMode === 'teams' && 'Compete as Team Grace vs Team Faith with auto-balanced rosters.'}
            </p>
          </Card>

          {/* Game Night Host Tips */}
          <Card variant="tonal" padding="md" className="flex flex-col gap-2 border border-[var(--border-tint)]">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--on-container-variant)]">
              Host Recommendation
            </span>
            <p className="text-xs leading-relaxed text-[var(--on-container-variant)]">
              This game is great for youth groups, family nights, or fellowship gatherings. On bigger screens, open the Lobby screen on a laptop/TV and invite participants to scan the QR code with their mobile devices.
            </p>
          </Card>
        </div>
      </div>

      {/* Host Session Architecture Modal */}
      <HostSessionModal
        isOpen={showHostModal}
        gameName={meta.name}
        onConfirm={(connMode, hotspot) => {
          setShowHostModal(false);
          onHostSession(meta.id, selectedMode, connMode, hotspot);
        }}
        onCancel={() => setShowHostModal(false)}
      />
    </div>
  );
};
