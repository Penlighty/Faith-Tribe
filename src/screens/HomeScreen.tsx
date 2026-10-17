import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Shuffle, Users, Clock, Sparkles, TrendingUp } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Chip } from '../components/ui/Chip';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { gameRegistry } from '../engine/registry';
import { GameMeta } from '../engine/types';
import { useTheme } from '../theme/ThemeContext';

export interface HomeScreenProps {
  onSelectGame: (gameId: string) => void;
  onQuickJoin: () => void;
  onHostGame: (gameId: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectGame,
  onQuickJoin,
  onHostGame,
}) => {
  const [filter, setFilter] = useState<'All' | 'Party' | 'Team' | 'Solo'>('All');
  const { triggerHaptic } = useTheme();

  const games = gameRegistry.getAllMeta();

  const filteredGames = games.filter((g) => {
    if (filter === 'All') return true;
    if (filter === 'Solo') return g.supportsSoloPractice;
    return g.categoryTag === filter;
  });

  const handleShuffle = () => {
    triggerHaptic('medium');
    const randomGame = games[Math.floor(Math.random() * games.length)];
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
        {/* 8. Stats card on Home: "Game night stats" */}
        <Card variant="hero" padding="lg" className="md:col-span-7 lg:col-span-8 flex flex-col justify-between gap-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2.5 rounded-full bg-[var(--surface-container)] text-[var(--primary-action)] shadow-sm">
                <TrendingUp size={20} />
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--on-container-variant)]">
                  Game Night Stats
                </span>
                <div className="text-sm font-extrabold text-[var(--on-container)] hidden sm:block">
                  Fellowship Performance
                </div>
              </div>
            </div>
            <button
              onClick={() => onSelectGame('fake-a-proverb')}
              className="w-9 h-9 rounded-full bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] flex items-center justify-center transition-colors text-[var(--on-container)] cursor-pointer"
              aria-label="View stats"
            >
              <ArrowRight size={18} />
            </button>
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
                Gather Your Group
              </span>
            </div>

            <Button
              variant="primary"
              size="lg"
              pill
              className="w-full shadow-md text-sm sm:text-base font-bold py-3"
              onClick={() => onSelectGame('fake-a-proverb')}
            >
              Host a Game
            </Button>

            <Button
              variant="tonal"
              size="lg"
              pill
              className="w-full text-sm sm:text-base font-bold py-3"
              onClick={onQuickJoin}
            >
              Join with Code
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

      {/* 5. Section Header + 6. Segmented Filter Tabs */}
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
            leftIcon={<Shuffle size={14} />}
            size="md"
            className="ml-auto sm:ml-0"
          >
            Surprise Me
          </Chip>
        </div>
      </div>

      {/* 7. Game Cards in a responsive 2-col on mobile, 3-col on desktop grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {filteredGames.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onClick={() => onSelectGame(game.id)}
          />
        ))}
      </div>
    </div>
  );
};

const GameCard: React.FC<{ game: GameMeta; onClick: () => void }> = ({ game, onClick }) => {
  // Pastel tonal container background derived from seed color
  const bgColors: Record<string, string> = {
    butter: 'bg-[#FBF6CD] dark:bg-[#2F2C17] text-[#292403] dark:text-[#FBF7D6]',
    mint: 'bg-[#DBF5DD] dark:bg-[#182C1E] text-[#0B2A13] dark:text-[#DCF9E2]',
    peach: 'bg-[#FCE3C8] dark:bg-[#342416] text-[#341B08] dark:text-[#FBE7D5]',
    blush: 'bg-[#F9D6DB] dark:bg-[#341B20] text-[#381119] dark:text-[#FCE1E6]',
    lavender: 'bg-[#EADEF7] dark:bg-[#281834] text-[#241133] dark:text-[#EFE2FA]',
  };

  const colorClass = bgColors[game.accentSeedColor] || bgColors.butter;

  return (
    <Card
      variant="tonal"
      padding="none"
      interactive
      onClick={onClick}
      className={`flex flex-col justify-between rounded-[28px] border border-black/5 dark:border-white/10 hover:-translate-y-1 hover:shadow-expressive transition-all duration-200 cursor-pointer ${colorClass}`}
    >
      {/* Visual illustration / badge area */}
      <div className="p-4 pb-2 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10">
            {game.categoryTag}
          </span>
          <span className="text-xs font-mono font-bold flex items-center gap-1 opacity-80">
            <Clock size={12} /> {game.estimatedMinutes}m
          </span>
        </div>

        <div className="h-20 flex items-center justify-center text-4xl">
          {game.iconName === 'Scroll' && '📜'}
          {game.iconName === 'Flame' && '🔥'}
          {game.iconName === 'Wheat' && '🌾'}
          {game.iconName === 'MessageSquare' && '💬'}
          {game.iconName === 'BookOpen' && '📖'}
        </div>
      </div>

      {/* Card Details Area */}
      <div className="p-4 pt-0 flex flex-col gap-1">
        <h3 className="font-extrabold text-base leading-tight tracking-tight">
          {game.name}
        </h3>
        <p className="text-xs opacity-75 line-clamp-2 leading-relaxed">
          {game.tagline}
        </p>

        <div className="mt-2 pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[11px] font-bold opacity-80">
          <span className="flex items-center gap-1">
            <Users size={12} /> {game.minPlayers}-{game.maxPlayers} players
          </span>
          <ArrowRight size={14} />
        </div>
      </div>
    </Card>
  );
};
