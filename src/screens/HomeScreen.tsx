import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Chip } from '../components/ui/Chip';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { gameRegistry } from '../engine/registry';
import { GameMeta, ConnectionMode, HotspotInfo, PlayMode } from '../engine/types';
import { useTheme } from '../theme/ThemeContext';
import { Icon, GameBadge, GameShape, toVisualGameId, GAME_VISUALS, type GameId } from '../design/icons';
import { SelectGameModal } from '../components/session/SelectGameModal';
import { HostSessionModal } from '../components/session/HostSessionModal';

export interface HomeScreenProps {
  onSelectGame: (gameId: string) => void;
  onQuickJoin: () => void;
  onHostGame?: (gameId: string) => void;
  onHostSession?: (
    gameId: string,
    playMode: PlayMode,
    connectionMode?: ConnectionMode,
    hotspotInfo?: HotspotInfo
  ) => void;
}

interface PlannedGameMeta {
  id: GameId;
  name: string;
  tagline: string;
  categoryTag: 'Party' | 'Team' | 'Solo';
  estimatedMinutes: number;
  minPlayers: number;
  maxPlayers: number;
  status: 'planned';
}

const PLANNED_GAMES: PlannedGameMeta[] = [
  {
    id: 'blueprint-from-the-mountain',
    name: 'Blueprint from the Mountain',
    tagline: 'Tabernacle architecture and sacred dimensions challenge.',
    categoryTag: 'Team',
    estimatedMinutes: 15,
    minPlayers: 2,
    maxPlayers: 12,
    status: 'planned',
  },
  {
    id: 'one-accord',
    name: 'One Accord',
    tagline: 'Harmonize scripture passages in unity before the sands run out.',
    categoryTag: 'Party',
    estimatedMinutes: 10,
    minPlayers: 3,
    maxPlayers: 16,
    status: 'planned',
  },
  {
    id: 'six-degrees-of-abraham',
    name: 'Six Degrees of Abraham',
    tagline: 'Trace direct genealogical links across covenant generations.',
    categoryTag: 'Solo',
    estimatedMinutes: 12,
    minPlayers: 1,
    maxPlayers: 8,
    status: 'planned',
  },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectGame,
  onQuickJoin,
  onHostGame,
  onHostSession,
}) => {
  const [filter, setFilter] = useState<'All' | 'Party' | 'Team' | 'Solo'>('All');
  const [showGamePicker, setShowGamePicker] = useState(false);
  const [pendingHostGame, setPendingHostGame] = useState<GameMeta | null>(null);
  const [showHostModal, setShowHostModal] = useState(false);
  const { triggerHaptic } = useTheme();

  const launchGames = gameRegistry.getAllMeta();

  const filteredLaunchGames = launchGames.filter((g) => {
    if (filter === 'All') return true;
    if (filter === 'Solo') return g.supportsSoloPractice;
    return g.categoryTag === filter;
  });

  const filteredPlannedGames = PLANNED_GAMES.filter((g) => {
    if (filter === 'All') return true;
    return g.categoryTag === filter;
  });

  const handleShuffle = () => {
    triggerHaptic('medium');
    const randomGame = launchGames[Math.floor(Math.random() * launchGames.length)];
    if (randomGame) onSelectGame(randomGame.id);
  };

  // Weekly stats mock data for the rounded bar chart
  const weeklyActivity = [
    { day: 'M', height: 40 },
    { day: 'T', height: 65 },
    { day: 'W', height: 85 },
    { day: 'T', height: 30 },
    { day: 'F', height: 100 },
    { day: 'S', height: 95 },
    { day: 'S', height: 50 },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-28 pt-2 sm:pt-6 flex flex-col gap-6 sm:gap-8">
      {/* Top Section: Responsive Grid on Desktop (Stats Card + Quick Play Hub) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-stretch">
        {/* Stats card on Home: "Game night stats" */}
        <Card
          variant="surface"
          padding="lg"
          className="md:col-span-7 lg:col-span-8 flex flex-col justify-between gap-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-[var(--primary-action)]/10 text-[var(--primary-action)] flex items-center justify-center">
                <Icon name="scoreboard" size={18} />
              </span>
              <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-[var(--on-container)]">
                Fellowship Activity
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-300/30 flex items-center gap-1">
              <Icon name="bolt" size={14} /> Active
            </span>
          </div>

          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-[var(--on-container)]">
                12
              </div>
              <div className="text-xs sm:text-sm font-bold text-[var(--on-container-variant)]">Games Played This Month</div>
            </div>
            <div className="flex items-center gap-3 sm:gap-5 text-right">
              <div>
                <div className="text-sm sm:text-base font-black font-mono">8 Wins</div>
                <div className="text-[11px] sm:text-xs text-[var(--on-container-variant)]">67% Victory Rate</div>
              </div>
              <div className="w-px h-8 sm:h-10 bg-[var(--border-tint)]" />
              <div>
                <div className="text-sm sm:text-base font-black text-[var(--primary-action)]">Proverbs</div>
                <div className="text-[11px] sm:text-xs text-[var(--on-container-variant)]">Favorite Pick</div>
              </div>
            </div>
          </div>

          {/* Rounded Bar Chart of the Week */}
          <div className="pt-3 border-t border-[var(--border-tint)] flex items-end justify-between gap-2 sm:gap-4 h-20 sm:h-24">
            {weeklyActivity.map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${bar.height}%` }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className={`w-full max-w-[20px] sm:max-w-[28px] rounded-full transition-all ${
                    bar.height >= 90
                      ? 'bg-[var(--primary-action)] shadow-sm'
                      : 'bg-[var(--on-container)]/20 hover:bg-[var(--on-container)]/30'
                  }`}
                />
                <span className="text-[10px] sm:text-xs font-bold text-[var(--on-container-variant)]">{bar.day}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Play CTAs & Recently Gathered Hub on Desktop */}
        <div className="md:col-span-5 lg:col-span-4 flex flex-col justify-between gap-4">
          <Card variant="tonal" padding="md" className="flex-1 flex flex-col justify-center gap-3.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--on-container-variant)]">
                Gather Your Tribe
              </span>
            </div>

            <Button
              variant="primary"
              size="lg"
              pill
              className="w-full shadow-md text-sm sm:text-base font-bold py-3 flex items-center justify-center gap-2"
              onClick={() => {
                triggerHaptic('medium');
                setShowGamePicker(true);
              }}
            >
              <Icon name="host" size={18} />
              <span>Host a Game</span>
            </Button>

            <Button
              variant="tonal"
              size="lg"
              pill
              className="w-full text-sm sm:text-base font-bold py-3 flex items-center justify-center gap-2"
              onClick={onQuickJoin}
            >
              <Icon name="join" size={18} />
              <span>Join with Code</span>
            </Button>
          </Card>

          {/* Recently Played / Gathered */}
          <Card variant="surface" padding="md" className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold tracking-tight text-[var(--on-container)]">
                Recently Gathered
              </h2>
              <span className="text-[11px] font-mono text-[var(--on-container-variant)]">5 Active</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {['Peter', 'Mary', 'Barnabas', 'Priscilla', 'Timothy'].map((disciple, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--surface-container)] text-xs font-semibold shrink-0 border border-[var(--border-tint)] shadow-sm"
                >
                  <Avatar name={disciple} size="sm" />
                  <span>{disciple}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Section Header + Segmented Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--on-container)]">
            Game Library
          </h2>
          <p className="text-xs text-[var(--on-container-variant)] hidden sm:block">
            Choose a fellowship game to host or practice solo
          </p>
        </div>

        {/* Segmented Filter Pills + Shuffle */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {(['All', 'Party', 'Team', 'Solo'] as const).map((tab) => (
            <Chip
              key={tab}
              selected={filter === tab}
              onClick={() => setFilter(tab)}
              size="md"
            >
              {tab}
            </Chip>
          ))}
          <Chip
            selected={false}
            onClick={handleShuffle}
            leftIcon={<Icon name="shuffle" size={16} variant="line" />}
            size="md"
            className="ml-auto sm:ml-0"
          >
            Surprise Me
          </Chip>
        </div>
      </div>

      {/* Game Cards in a responsive 2-col on mobile, 3-col on desktop grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {filteredLaunchGames.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onClick={() => onSelectGame(game.id)}
          />
        ))}

        {filteredPlannedGames.map((game) => (
          <PlannedGameCard key={game.id} game={game} />
        ))}
      </div>

      {/* Game Selector Modal for Hosting */}
      <SelectGameModal
        isOpen={showGamePicker}
        title="Select Game to Host"
        subtitle="Choose which sacred challenge your fellowship will play."
        onSelectGame={(gId) => {
          const g = gameRegistry.get(gId);
          if (g) {
            setPendingHostGame(g.meta);
            setShowGamePicker(false);
            setShowHostModal(true);
          }
        }}
        onCancel={() => setShowGamePicker(false)}
      />

      {/* Host Session Architecture Modal */}
      {pendingHostGame && (
        <HostSessionModal
          isOpen={showHostModal}
          gameName={pendingHostGame.name}
          onConfirm={(connMode, hotspot) => {
            setShowHostModal(false);
            if (onHostSession) {
              onHostSession(pendingHostGame.id, 'individuals', connMode, hotspot);
            } else if (onHostGame) {
              onHostGame(pendingHostGame.id);
            }
          }}
          onCancel={() => {
            setShowHostModal(false);
            setPendingHostGame(null);
          }}
        />
      )}
    </div>
  );
};

const GameCard: React.FC<{ game: GameMeta; onClick: () => void }> = ({ game, onClick }) => {
  const visual = GAME_VISUALS[toVisualGameId(game.id)];

  return (
    <Card
      variant="tonal"
      padding="none"
      interactive
      onClick={onClick}
      style={{
        backgroundColor: visual.container,
        color: visual.ink,
      }}
      className="flex flex-col justify-between rounded-[28px] border border-black/5 dark:border-white/10 hover:-translate-y-1 hover:shadow-expressive transition-all duration-200 cursor-pointer overflow-hidden relative"
    >
      {/* Background shape silhouette watermark */}
      <div className="absolute -top-4 -right-4 pointer-events-none opacity-15 text-current">
        <GameShape game={game.id} size={110} />
      </div>

      {/* Visual illustration / badge area */}
      <div className="p-4 pb-2 flex flex-col gap-2 relative z-10">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/15">
            {game.categoryTag}
          </span>
          <span className="text-xs font-mono font-bold flex items-center gap-1 opacity-80">
            <Icon name="timer" size={14} /> {game.estimatedMinutes}m
          </span>
        </div>

        <div className="h-20 flex items-center justify-center">
          <GameBadge game={game.id} size={64} variant="tonal" />
        </div>
      </div>

      {/* Card Details Area */}
      <div className="p-4 pt-0 flex flex-col gap-1 relative z-10">
        <h3 className="font-extrabold text-base leading-tight tracking-tight">
          {game.name}
        </h3>
        <p className="text-xs opacity-75 line-clamp-2 leading-relaxed">
          {game.tagline}
        </p>

        <div className="mt-2 pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[11px] font-bold opacity-80">
          <span className="flex items-center gap-1.5">
            <Icon name="team" size={14} /> {game.minPlayers}-{game.maxPlayers} players
          </span>
          <Icon name="arrow-right" size={16} />
        </div>
      </div>
    </Card>
  );
};

const PlannedGameCard: React.FC<{ game: PlannedGameMeta }> = ({ game }) => {
  const visual = GAME_VISUALS[game.id];
  const { triggerHaptic } = useTheme();

  return (
    <Card
      variant="tonal"
      padding="none"
      onClick={() => triggerHaptic('light')}
      style={{
        backgroundColor: visual.container,
        color: visual.ink,
      }}
      className="flex flex-col justify-between rounded-[28px] border border-black/5 dark:border-white/10 opacity-80 transition-all duration-200 overflow-hidden relative cursor-default"
    >
      {/* Background shape silhouette watermark */}
      <div className="absolute -top-4 -right-4 pointer-events-none opacity-15 text-current">
        <GameShape game={game.id} size={110} />
      </div>

      {/* Visual illustration / badge area */}
      <div className="p-4 pb-2 flex flex-col gap-2 relative z-10">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/15">
            {game.categoryTag}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-black/15 text-current">
            Coming soon
          </span>
        </div>

        <div className="h-20 flex items-center justify-center">
          <GameBadge game={game.id} size={64} variant="tonal" />
        </div>
      </div>

      {/* Card Details Area */}
      <div className="p-4 pt-0 flex flex-col gap-1 relative z-10">
        <h3 className="font-extrabold text-base leading-tight tracking-tight">
          {game.name}
        </h3>
        <p className="text-xs opacity-75 line-clamp-2 leading-relaxed">
          {game.tagline}
        </p>

        <div className="mt-2 pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[11px] font-bold opacity-80">
          <span className="flex items-center gap-1.5">
            <Icon name="team" size={14} /> {game.minPlayers}-{game.maxPlayers} players
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Planned</span>
        </div>
      </div>
    </Card>
  );
};
