import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Chip } from '../components/ui/Chip';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { gameRegistry } from '../engine/registry';
import { GameMeta, ConnectionMode, HotspotInfo, PlayMode } from '../engine/types';
import { useTheme } from '../theme/ThemeContext';
import { Icon, GameBadge, GameShape, toVisualGameId, GAME_VISUALS, type GameId, type IconName } from '../design/icons';
import { SelectGameModal } from '../components/session/SelectGameModal';
import { HostSessionModal } from '../components/session/HostSessionModal';
import { AuthModal } from '../components/auth/AuthModal';
import { fetchFellowshipStats, getCachedFellowshipStats, getEmptyFellowshipStats, FellowshipStats } from '../engine/services/gameDataService';
import { useAuth } from '../engine/auth/AuthContext';
import { useTribes } from '../engine/tribes/TribeContext';
import { GamifiedMascot } from '../components/gamified/GamifiedMascot';

export interface HomeScreenProps {
  onSelectGame: (gameId: string) => void;
  onQuickJoin: () => void;
  onOpenJourneyPath?: () => void;
  onHostGame?: (gameId: string) => void;
  onHostSession?: (
    gameId: string,
    playMode: PlayMode,
    connectionMode?: ConnectionMode,
    hotspotInfo?: HotspotInfo,
    tribeId?: string,
    tribeName?: string
  ) => void;
  onDirectJoinSession?: (roomCode: string, mode?: 'online' | 'onsite') => void;
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

export const GAME_SEARCH_KEYWORDS: Record<string, string[]> = {
  'fake-a-proverb': ['proverb', 'proverbs', 'solomon', 'bluff', 'bluffing', 'wisdom', 'vote', 'scripture', 'lie', 'truth', 'proverbial'],
  'hot-coal': ['coal', 'hot coal', 'isaiah', 'speed', 'reflex', 'fast', 'hot potato', 'timer', 'burn', 'action', 'quick', 'hot'],
  'tares-among-wheat': ['tare', 'tares', 'wheat', 'impostor', 'traitor', 'deduction', 'parable', 'harvest', 'social', 'secret', 'suspect'],
  'who-said-it': ['who said', 'quote', 'quotes', 'prophet', 'apostle', 'trivia', 'knowledge', 'king', 'disciple', 'speaker', 'said', 'said it'],
  'testament-sort': ['testament', 'sort', 'old', 'new', 'canon', 'books', 'speed', 'order', 'bible books', 'timeline', 'sorting'],
  'shelf-rush': ['shelf', 'shelf rush', 'rush', 'ascent', 'books', 'sort', 'sorting', 'canon', 'bible books', 'speed', 'order', 'scheme', 'hebrew canon', 'testament'],
  'four-signs': ['four signs', 'four', 'signs', 'clue', 'pictogram', 'icon', 'symbols', 'puzzle', 'riddle', 'guess'],
  'scribes-tiles': ['scribe', 'scribes', 'tiles', 'letters', 'anagram', 'word', 'spelling', 'unscramble', 'crossword', 'parchment'],
  'bible-or-not': ['bible or not', 'bible', 'scripture', 'flashcard', 'swipe', 'myth', 'proverb', 'saying', 'in the bible', 'not in the bible', 'cards', 'quote'],
  'blueprint-from-the-mountain': ['blueprint', 'mountain', 'tabernacle', 'architecture', 'dimensions', 'exodus', 'ark'],
  'one-accord': ['accord', 'unity', 'harmony', 'acts', 'scripture', 'co-op', 'team'],
  'six-degrees-of-abraham': ['abraham', 'genealogy', 'degrees', 'covenant', 'generations', 'lineage', 'family tree'],
};

export const AUTO_POPULATE_PILLS: Array<{ label: string; query: string; icon: IconName }> = [
  { label: 'Bible or Not', query: 'Bible or Not', icon: 'book-open' },
  { label: 'Four Signs', query: 'Four Signs', icon: 'star' },
  { label: "Scribe's Tiles", query: 'Tiles', icon: 'scroll' },
  { label: 'Shelf Rush', query: 'Shelf Rush', icon: 'book-open' },
  { label: 'Proverb', query: 'Proverb', icon: 'scroll' },
  { label: 'Hot Coal', query: 'Hot Coal', icon: 'flame' },
  { label: 'Wheat & Tares', query: 'Wheat & Tares', icon: 'wheat' },
  { label: 'Who Said It', query: 'Who Said', icon: 'person' },
  { label: 'Testament', query: 'Testament', icon: 'bible' },
  { label: 'Reflex & Speed', query: 'Speed', icon: 'bolt' },
  { label: 'Bluffing', query: 'Bluff', icon: 'eye' },
  { label: 'Trivia', query: 'Trivia', icon: 'book-open' },
];

export function matchesGameSearch(
  game: { id: string; name: string; tagline: string; description?: string; categoryTag: string },
  query: string
): boolean {
  if (!query || !query.trim()) return true;
  const q = query.toLowerCase().trim();
  if (game.name.toLowerCase().includes(q)) return true;
  if (game.tagline.toLowerCase().includes(q)) return true;
  if (game.description && game.description.toLowerCase().includes(q)) return true;
  if (game.categoryTag.toLowerCase().includes(q)) return true;
  const keywords = GAME_SEARCH_KEYWORDS[game.id] || [];
  if (keywords.some((k) => k.toLowerCase().includes(q) || q.includes(k.toLowerCase()))) return true;
  return false;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectGame,
  onQuickJoin,
  onOpenJourneyPath,
  onHostGame,
  onHostSession,
  onDirectJoinSession,
}) => {
  const [filter, setFilter] = useState<'All' | 'Party' | 'Team' | 'Solo'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [showGamePicker, setShowGamePicker] = useState(false);
  const [pendingHostGame, setPendingHostGame] = useState<GameMeta | null>(null);
  const [showHostModal, setShowHostModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { triggerHaptic } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const { liveActiveSession, tribes } = useTribes();

  // Close search suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // User's active tribe IDs
  const userTribeIds = useMemo(() => tribes.map((t) => t.id), [tribes]);

  // Fellow tribe members across user's tribes
  const fellowTribeMembers = useMemo(() => {
    const map = new Map<string, { id: string; name: string; avatarSeed?: string }>();
    tribes.forEach((t) => {
      if (t.members) {
        Object.values(t.members).forEach((m) => {
          if (m && m.displayName) {
            map.set(m.uid || m.displayName, {
              id: m.uid,
              name: m.displayName,
              avatarSeed: m.avatarSeed || m.uid,
            });
          }
        });
      }
    });
    return Array.from(map.values());
  }, [tribes]);

  // Current user identifiers
  const currentUserId = user?.uid || (typeof window !== 'undefined' ? sessionStorage.getItem('faith_tribe_player_id') || undefined : undefined);
  const currentUserName = user?.displayName || user?.username || (typeof window !== 'undefined'
    ? localStorage.getItem('faith_tribe_player_name') ||
      localStorage.getItem('agape_player_name') ||
      undefined
    : undefined);

  // User-isolated fellowship stats
  const [stats, setStats] = useState<FellowshipStats>(() => {
    return getCachedFellowshipStats(user?.uid) || getEmptyFellowshipStats();
  });

  useEffect(() => {
    let isMounted = true;
    fetchFellowshipStats(currentUserId, currentUserName, userTribeIds, fellowTribeMembers).then((liveStats) => {
      if (isMounted) {
        setStats(liveStats);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [currentUserId, currentUserName, userTribeIds.join(','), fellowTribeMembers.length]);

  const launchGames = gameRegistry.getAllMeta();

  const filteredLaunchGames = useMemo(() => {
    return launchGames.filter((g) => {
      const matchesCategory =
        filter === 'All' ? true : filter === 'Solo' ? g.supportsSoloPractice : g.categoryTag === filter;
      return matchesCategory && matchesGameSearch(g, searchQuery);
    });
  }, [launchGames, filter, searchQuery]);

  const filteredPlannedGames = useMemo(() => {
    return PLANNED_GAMES.filter((g) => {
      const matchesCategory = filter === 'All' ? true : g.categoryTag === filter;
      return matchesCategory && matchesGameSearch(g, searchQuery);
    });
  }, [filter, searchQuery]);

  // Direct autocomplete suggestions dropdown items
  const autocompleteSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const allGames = [...launchGames, ...PLANNED_GAMES];
    return allGames.filter((g) => matchesGameSearch(g, searchQuery)).slice(0, 5);
  }, [launchGames, searchQuery]);

  const handleShuffle = () => {
    triggerHaptic('medium');
    const randomGame = launchGames[Math.floor(Math.random() * launchGames.length)];
    if (randomGame) onSelectGame(randomGame.id);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-28 pt-2 sm:pt-6 flex flex-col gap-6 sm:gap-8">
      {/* 🟢 Live Tribe Game Session Banner (Zero-Friction 1-Click Join) */}
      {liveActiveSession && (
        <Card
          variant="elevated"
          padding="md"
          className="border-2 border-emerald-500 bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-transparent flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md animate-pulse"
        >
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Icon name="games" size={20} />
            </span>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  {liveActiveSession.tribe.name} • Active Session
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 flex items-center gap-1">
                  <Icon name={liveActiveSession.session.connectionMode === 'onsite' ? 'host' : 'link'} size={11} />
                  <span>{liveActiveSession.session.connectionMode === 'onsite' ? 'Onsite Hotspot' : 'Online Cloud'}</span>
                </span>
              </div>
              <span className="text-sm font-black text-[var(--on-container)]">
                {liveActiveSession.session.gameName}
              </span>
              <span className="text-[11px] text-[var(--on-container-variant)]">
                Hosted by {liveActiveSession.session.hostName}
              </span>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            pill
            onClick={() => {
              triggerHaptic('heavy');
              if (onDirectJoinSession) {
                onDirectJoinSession(
                  liveActiveSession.session.roomCode,
                  liveActiveSession.session.connectionMode
                );
              } else {
                onQuickJoin();
              }
            }}
            className="font-black text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shrink-0"
          >
            Join Fellowship Game
          </Button>
        </Card>
      )}

      {/* 🌟 Playful Gamified Faith Journey Path Banner */}
      {onOpenJourneyPath && (
        <div
          onClick={onOpenJourneyPath}
          className="w-full p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-blue-500/10 via-amber-500/10 to-emerald-500/10 border-2 border-[var(--c-blue)]/30 hover:border-[var(--c-blue)] shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-4 select-none animate-fadeIn"
        >
          <div className="flex items-center gap-4">
            <GamifiedMascot character="david" pose="cheer" size={80} showGroundShadow={false} />
            <div className="flex flex-col text-left">
              <span className="text-xs font-black uppercase tracking-wider text-[var(--c-blue)]">
                Daily Scripture Journey • Dāvīd's Faith Path
              </span>
              <h3 className="text-lg sm:text-xl font-black text-[var(--c-text)] leading-snug">
                Step onto the Faith Path
              </h3>
              <p className="text-xs font-bold text-[var(--c-text-2)]">
                Join Dāvīd, Debōrāh, and Mōshē: complete quests, earn gems, and build your holy streak!
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="primary"
            size="md"
            pill
            onClick={(e) => {
              e.stopPropagation();
              onOpenJourneyPath?.();
            }}
            className="shrink-0 w-full sm:w-auto font-black px-6"
            rightIcon={<Icon name="bolt" size={16} />}
          >
            START JOURNEY
          </Button>
        </div>
      )}

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
                {user ? `${user.displayName}'s Activity` : 'Fellowship Activity'}
              </h2>
            </div>
            <span
              className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                stats.activeCount > 0
                  ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300/30'
                  : 'text-[var(--on-container-variant)] bg-[var(--surface-container)] border-[var(--border-tint)]'
              }`}
            >
              <Icon name="bolt" size={14} /> {stats.activeCount > 0 ? `${stats.activeCount} in Fellowship` : 'Ready'}
            </span>
          </div>

          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-[var(--on-container)]">
                {stats.gamesPlayedThisMonth}
              </div>
              <div className="text-xs sm:text-sm font-bold text-[var(--on-container-variant)]">
                Games Played This Month
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-5 text-right">
              <div>
                <div className="text-sm sm:text-base font-black font-mono">
                  {stats.winsCount} {stats.winsCount === 1 ? 'Win' : 'Wins'}
                </div>
                <div className="text-[11px] sm:text-xs text-[var(--on-container-variant)]">
                  {stats.victoryRate}% Victory Rate
                </div>
              </div>
              <div className="w-px h-8 sm:h-10 bg-[var(--border-tint)]" />
              <div>
                <div className="text-sm sm:text-base font-black text-[var(--primary-action)]">
                  {stats.favoritePick}
                </div>
                <div className="text-[11px] sm:text-xs text-[var(--on-container-variant)]">
                  Favorite Pick
                </div>
              </div>
            </div>
          </div>

          {/* Rounded Bar Chart of the Week */}
          <div className="pt-3 border-t border-[var(--border-tint)] flex items-end justify-between gap-2 sm:gap-4 h-20 sm:h-24">
            {stats.weeklyActivity.map((bar, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-2 h-full justify-end"
                title={`${bar.count} ${bar.count === 1 ? 'game' : 'games'} on this day`}
              >
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${bar.height}%` }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className={`w-full max-w-[20px] sm:max-w-[28px] rounded-full transition-all ${
                    bar.count > 0
                      ? 'bg-[var(--primary-action)] shadow-sm'
                      : 'bg-[var(--on-container)]/15 hover:bg-[var(--on-container)]/25'
                  }`}
                />
                <span className="text-[10px] sm:text-xs font-bold text-[var(--on-container-variant)]">
                  {bar.day}
                </span>
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
                if (!isAuthenticated) {
                  setShowAuthModal(true);
                } else {
                  setShowGamePicker(true);
                }
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
              <span className="text-[11px] font-mono text-[var(--on-container-variant)]">
                {stats.recentlyGathered.length} {stats.recentlyGathered.length === 1 ? 'Disciple' : 'Disciples'}
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {stats.recentlyGathered.length > 0 ? (
                stats.recentlyGathered.map((disciple, i) => (
                  <div
                    key={disciple.id || i}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--surface-container)] text-xs font-semibold shrink-0 border border-[var(--border-tint)] shadow-sm"
                  >
                    <Avatar name={disciple.name} size="sm" />
                    <span>{disciple.name}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-[var(--on-container-variant)] py-1 italic">
                  Host or join a game to gather your disciples!
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Section Header + Segmented Filter Tabs */}
      <div className="flex flex-col gap-3.5 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--on-container)]">
                Game Library
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--surface-container)] text-[var(--on-container-variant)] border border-[var(--border-tint)]">
                {filteredLaunchGames.length + filteredPlannedGames.length} {filteredLaunchGames.length + filteredPlannedGames.length === 1 ? 'game' : 'games'}
              </span>
            </div>
            <p className="text-xs text-[var(--on-container-variant)] mt-0.5">
              Choose a fellowship game to host or practice solo
            </p>
          </div>

          {/* Segmented Filter Pills + Shuffle */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {(['All', 'Party', 'Team', 'Solo'] as const).map((tab) => (
              <Chip
                key={tab}
                selected={filter === tab}
                onClick={() => {
                  triggerHaptic('light');
                  setFilter(tab);
                }}
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

        {/* Auto-Populate Search Bar & Suggestions Container */}
        <div ref={searchContainerRef} className="relative flex flex-col gap-2 z-20">
          <div className="relative flex items-center">
            {/* Search Input Box */}
            <div className="relative w-full flex items-center">
              <div className="absolute left-3.5 pointer-events-none text-[var(--on-container-variant)] flex items-center justify-center">
                <Icon name="search" size={18} />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setSearchQuery('');
                    setIsSearchFocused(false);
                    searchInputRef.current?.blur();
                  } else if (e.key === 'Enter' && autocompleteSuggestions.length > 0) {
                    const topMatch = autocompleteSuggestions[0];
                    if ('status' in topMatch && topMatch.status === 'planned') {
                      setSearchQuery(topMatch.name);
                    } else {
                      onSelectGame(topMatch.id);
                    }
                    setIsSearchFocused(false);
                  }
                }}
                placeholder="Search games by title, quotes, bluff, speed, trivia..."
                aria-label="Search games"
                autoComplete="off"
                spellCheck="false"
                className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-2xl bg-[var(--surface-card)] text-[var(--on-container)] placeholder:text-[var(--on-container-variant)]/60 text-sm font-medium border-2 border-[var(--border-tint)] focus:border-[var(--primary-action)] focus:outline-hidden focus:shadow-md transition-all"
              />
              {/* Clear button */}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setSearchQuery('');
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-3 w-6 h-6 rounded-full bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] text-[var(--on-container-variant)] flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Clear search"
                >
                  <Icon name="close" size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Live Autocomplete Dropdown */}
          {isSearchFocused && autocompleteSuggestions.length > 0 && (
            <div className="absolute top-[calc(100%-8px)] left-0 right-0 mt-2 bg-[var(--surface-card)] border-2 border-[var(--border-tint)] rounded-2xl shadow-2xl p-2 z-50 flex flex-col gap-1 backdrop-blur-md animate-fadeIn">
              <div className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--on-container-variant)] flex items-center justify-between border-b border-[var(--border-tint)] pb-1.5">
                <span>Matching Games ({autocompleteSuggestions.length})</span>
                <span className="text-[10px] lowercase opacity-70">press enter or tap to select</span>
              </div>
              {autocompleteSuggestions.map((item) => (
                <div
                  key={item.id}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    triggerHaptic('medium');
                    if ('status' in item && item.status === 'planned') {
                      setSearchQuery(item.name);
                    } else {
                      onSelectGame(item.id);
                    }
                    setIsSearchFocused(false);
                  }}
                  className="p-2 sm:p-2.5 rounded-xl hover:bg-[var(--surface-container-high)] flex items-center justify-between gap-3 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="shrink-0 group-hover:scale-105 transition-transform">
                      <GameBadge game={item.id} size={36} variant="tonal" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-extrabold text-sm text-[var(--on-container)] group-hover:text-[var(--primary-action)] transition-colors truncate">
                          {item.name}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[var(--surface-container)] text-[var(--on-container-variant)] border border-[var(--border-tint)]">
                          {item.categoryTag}
                        </span>
                      </div>
                      <span className="text-xs text-[var(--on-container-variant)] truncate">
                        {item.tagline}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-1">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[var(--primary-action)]/10 text-[var(--primary-action)] group-hover:bg-[var(--primary-action)] group-hover:text-white transition-colors flex items-center gap-1">
                      {'status' in item && item.status === 'planned' ? 'Planned' : 'Play'}
                      <Icon name="arrow-right" size={12} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Auto-Populate Search Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--on-container-variant)] shrink-0 flex items-center gap-1 mr-0.5">
              <Icon name="target" size={12} /> Quick Find:
            </span>
            {AUTO_POPULATE_PILLS.map((pill) => {
              const isSelected = searchQuery.toLowerCase() === pill.query.toLowerCase();
              return (
                <button
                  key={pill.label}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    if (isSelected) {
                      setSearchQuery('');
                    } else {
                      setSearchQuery(pill.query);
                      searchInputRef.current?.focus();
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer border flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[var(--primary-action)] text-white border-[var(--primary-action)] shadow-xs scale-105'
                      : 'bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] text-[var(--on-container)] border-[var(--border-tint)] hover:border-[var(--primary-action)]/50'
                  }`}
                >
                  <Icon name={pill.icon} size={12} />
                  <span>{pill.label}</span>
                  {isSelected && <Icon name="close" size={10} />}
                </button>
              );
            })}
          </div>

          {/* Active Search / Filter Status Banner */}
          {(searchQuery || filter !== 'All') && (
            <div className="flex items-center justify-between text-xs text-[var(--on-container-variant)] px-1">
              <div className="flex items-center gap-1.5">
                <span>
                  Filtering by {searchQuery ? <strong>"{searchQuery}"</strong> : ''}{' '}
                  {filter !== 'All' ? <span className="font-semibold">({filter} category)</span> : ''}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setSearchQuery('');
                  setFilter('All');
                }}
                className="text-[var(--primary-action)] hover:underline font-bold cursor-pointer flex items-center gap-1"
              >
                <Icon name="refresh" size={12} />
                <span>Reset all</span>
              </button>
            </div>
          )}
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

        {/* Empty state when no games match search query */}
        {filteredLaunchGames.length === 0 && filteredPlannedGames.length === 0 && (
          <Card
            variant="surface"
            padding="lg"
            className="col-span-full py-12 px-4 flex flex-col items-center justify-center text-center gap-3.5 rounded-3xl border-2 border-dashed border-[var(--border-tint)] bg-[var(--surface-card)]"
          >
            <div className="w-14 h-14 rounded-full bg-[var(--surface-container-high)] text-[var(--primary-action)] flex items-center justify-center shadow-xs">
              <Icon name="search" size={26} />
            </div>
            <div className="flex flex-col gap-1 max-w-sm">
              <h3 className="text-base sm:text-lg font-black text-[var(--on-container)]">
                No fellowship games found
              </h3>
              <p className="text-xs text-[var(--on-container-variant)] leading-relaxed">
                We couldn't find any games matching <strong className="text-[var(--on-container)]">"{searchQuery}"</strong>. Try tapping one of the quick find pills above or reset your filters.
              </p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  triggerHaptic('medium');
                  setSearchQuery('');
                  setFilter('All');
                }}
                leftIcon={<Icon name="refresh" size={14} />}
              >
                Reset Search & Filters
              </Button>
            </div>
          </Card>
        )}
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
          onConfirm={(connMode, hotspot, tribeId, tribeName) => {
            setShowHostModal(false);
            if (onHostSession) {
              onHostSession(pendingHostGame.id, 'individuals', connMode, hotspot, tribeId, tribeName);
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

      {/* Auth Modal for Host Gate */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        requiredForHost
        onSuccess={() => {
          setShowGamePicker(true);
        }}
      />
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
