import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { useSession } from '../engine/session/SessionContext';
import { gameRegistry } from '../engine/registry';
import { LeaderboardEntry, getParticipatingPlayers } from '../engine/types';
import { Icon, GameBadge } from '../design/icons';

export interface FinalLeaderboardScreenProps {
  onPickAnotherGame: () => void;
}

export const FinalLeaderboardScreen: React.FC<FinalLeaderboardScreenProps> = ({
  onPickAnotherGame,
}) => {
  const { snapshot, players, teams, isHost, rematch } = useSession();

  const safePlayers = Array.isArray(players) ? players : [];
  const safeTeams = Array.isArray(teams) ? teams : [];

  const game = snapshot ? gameRegistry.get(snapshot.gameId) : null;
  const participatingPlayers = getParticipatingPlayers(safePlayers, game?.meta);
  const entries: LeaderboardEntry[] =
    game && snapshot ? game.scoring(snapshot.gameState, participatingPlayers, safeTeams) : [];

  const firstPlace = entries[0];
  const secondPlace = entries[1];
  const thirdPlace = entries[2];

  // Fire celebratory confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2F5D3A', '#EDE58C', '#CFEFD2', '#F9D6DB', '#FCE3C8'],
      });
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-28 pt-4 sm:pt-8 flex flex-col gap-6 sm:gap-8 select-none">
      {/* Title & Game Badge */}
      <div className="text-center flex flex-col items-center gap-2">
        {snapshot?.gameId && (
          <GameBadge game={snapshot.gameId} size={56} variant="tonal" />
        )}
        <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--surface-container-high)] text-[var(--on-container-variant)] flex items-center gap-1.5 shadow-sm border border-[var(--border-tint)]/60">
          <Icon name="crown" variant="tonal" size={14} className="text-amber-500" /> Crown of Victory
        </span>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--on-container)]">
          Final Leaderboard
        </h1>
        <p className="text-xs sm:text-sm font-semibold opacity-75">
          {game?.meta?.name} • All {snapshot?.gameState?.totalRounds} Rounds Concluded
        </p>
      </div>

      {/* 3D-style Podium visualization */}
      {firstPlace && (
        <div className="flex items-end justify-center gap-3 sm:gap-6 pt-6 px-2 max-w-xl mx-auto w-full">
          {/* 2nd Place */}
          {secondPlace && (
            <div className="flex-1 flex flex-col items-center gap-2">
              <Avatar name={secondPlace.name} size="md" />
              <span className="text-xs sm:text-sm font-bold truncate max-w-[100px] text-center">{secondPlace.name}</span>
              <div className="w-full h-24 sm:h-36 rounded-t-3xl bg-[var(--surface-container)] flex flex-col items-center justify-center border border-[var(--border-tint)] shadow-sm">
                <span className="text-xl sm:text-2xl font-black text-gray-500">2</span>
                <span className="text-[11px] sm:text-xs font-mono font-bold">{secondPlace.score} pts</span>
              </div>
            </div>
          )}

          {/* 1st Place */}
          <div className="flex-[1.2] flex flex-col items-center gap-2 -mt-4">
            <div className="relative">
              <span className="absolute -top-6 -right-1">
                <Icon name="crown" variant="tonal" size={28} className="text-amber-500" />
              </span>
              <Avatar name={firstPlace.name} size="lg" />
            </div>
            <span className="text-sm sm:text-base font-extrabold truncate max-w-[130px] text-[var(--primary-action)] text-center">
              {firstPlace.name}
            </span>
            <div className="w-full h-36 sm:h-52 rounded-t-3xl bg-[var(--surface-container-high)] border-2 border-[var(--primary-action)] flex flex-col items-center justify-center shadow-expressive">
              <span className="text-3xl sm:text-4xl font-black text-amber-500">1</span>
              <span className="text-xs sm:text-sm font-mono font-black text-[var(--primary-action)]">
                {firstPlace.score} pts
              </span>
            </div>
          </div>

          {/* 3rd Place */}
          {thirdPlace && (
            <div className="flex-1 flex flex-col items-center gap-2">
              <Avatar name={thirdPlace.name} size="md" />
              <span className="text-xs sm:text-sm font-bold truncate max-w-[100px] text-center">{thirdPlace.name}</span>
              <div className="w-full h-18 sm:h-28 rounded-t-3xl bg-[var(--surface-container)] flex flex-col items-center justify-center border border-[var(--border-tint)] shadow-sm">
                <span className="text-lg sm:text-xl font-black text-amber-700">3</span>
                <span className="text-[11px] sm:text-xs font-mono font-bold">{thirdPlace.score} pts</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Full Leaderboard List */}
      <Card variant="tonal" padding="lg" className="flex flex-col gap-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--on-container-variant)] px-1">
          Complete Standings ({entries.length} Disciples)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="p-3.5 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-tint)] flex items-center justify-between shadow-sm hover:border-[var(--primary-action)]/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold w-6 text-center text-[var(--on-container-variant)]">
                  #{entry.rank}
                </span>
                <Avatar name={entry.name} size="sm" />
                <span className="text-sm font-bold truncate">{entry.name}</span>
              </div>
              <span className="font-mono text-sm font-black tabular-nums">
                {entry.score} pts
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Action Cluster: Rematch / Pick Another Game */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        {isHost ? (
          <Button
            variant="primary"
            size="hero"
            pill
            leftIcon={<Icon name="refresh" size={18} />}
            onClick={rematch}
            className="flex-1 shadow-md flex items-center justify-center gap-2"
          >
            Play Rematch
          </Button>
        ) : (
          <div className="p-3.5 rounded-2xl bg-[var(--surface-container)] text-center text-xs font-bold flex-1 flex items-center justify-center">
            Waiting for session host to trigger rematch or next game...
          </div>
        )}

        <Button
          variant="tonal"
          size="hero"
          pill
          leftIcon={<Icon name="home" size={18} />}
          onClick={onPickAnotherGame}
          className="flex-1 flex items-center justify-center gap-2"
        >
          Pick Another Game
        </Button>
      </div>
    </div>
  );
};
