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
  'search-the-scriptures': ['search', 'scriptures', 'word search', 'grid', 'letters', 'puzzle', 'find', 'hidden', 'word', 'john 5:39', 'theme'],
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
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pb-28 pt-3 sm:pt-6 flex flex-col gap-5 sm:gap-6">
      {/* Live Tribe Game Session Banner */}
      {liveActiveSession && (
        <Card
          variant="elevated"
          padding="md"
          className="border-2 border-emerald-500 bg-emerald-500/10 flex items-center justify-between gap-3 shadow-md"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <Icon name="games" size={18} />
            </span>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-black text-[var(--on-container)] truncate">
                {liveActiveSession.session.gameName}
              </span>
              <span className="text-xs text-[var(--on-container-variant)] truncate">
                {liveActiveSession.tribe.name} • Hosted by {liveActiveSession.session.hostName}
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
            className="font-black text-xs bg-emerald-600 hover:bg-emerald-500 text-white shrink-0"
          >
            Join
          </Button>
        </Card>
      )}

      {/* Hero Action Row: Host & Join */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <button
          type="button"
          onClick={() => {
            triggerHaptic('medium');
            if (!isAuthenticated) {
              setShowAuthModal(true);
            } else {
              setShowGamePicker(true);
            }
          }}
          className="p-4 sm:p-5 rounded-2xl bg-[var(--primary-action)] text-white hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 shadow-sm font-black text-sm sm:text-base cursor-pointer"
        >
          <Icon name="host" size={20} />
          <span>Host Game</span>
        </button>

        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onQuickJoin();
          }}
          className="p-4 sm:p-5 rounded-2xl bg-[var(--surface-container-high)] text-[var(--on-container)] hover:bg-[var(--surface-container-highest)] border border-[var(--border-tint)] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 shadow-xs font-black text-sm sm:text-base cursor-pointer"
        >
          <Icon name="join" size={20} />
          <span>Join with Code</span>
        </button>
      </div>

      {/* Sleek Daily Journey Banner */}
      {onOpenJourneyPath && (
        <div
          onClick={onOpenJourneyPath}
          className="w-full px-4 py-3 sm:py-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 hover:border-amber-500/60 transition-all cursor-pointer flex items-center justify-between gap-3 select-none"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Icon name="bolt" size={16} />
            </span>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Daily Scripture Journey
              </span>
              <span className="text-xs sm:text-sm font-bold text-[var(--on-container)] truncate">
                Continue Day's Faith Milestone
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="tonal"
            size="sm"
            pill
            onClick={(e) => {
              e.stopPropagation();
              onOpenJourneyPath?.();
            }}
            className="shrink-0 font-black text-xs"
          >
            Continue
          </Button>
        </div>
      )}

      {/* Game Catalog Controls */}
      <div className="flex flex-col gap-3 pt-1">
        {/* Category Filters */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1.5">
            {(['All', 'Party', 'Team', 'Solo'] as const).map((tab) => (
              <Chip
                key={tab}
                selected={filter === tab}
                onClick={() => {
                  triggerHaptic('light');
                  setFilter(tab);
                }}
                size="sm"
              >
                {tab}
              </Chip>
            ))}
          </div>

          <Chip
            selected={false}
            onClick={handleShuffle}
            leftIcon={<Icon name="shuffle" size={14} variant="line" />}
            size="sm"
            className="shrink-0 ml-auto"
          >
            Random
          </Chip>
        </div>

        {/* Minimal Search Bar */}
        <div ref={searchContainerRef} className="relative flex items-center z-20">
          <div className="absolute left-3.5 pointer-events-none text-[var(--on-container-variant)] flex items-center justify-center">
            <Icon name="search" size={16} />
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
                onSelectGame(topMatch.id);
                setIsSearchFocused(false);
              }
            }}
            placeholder="Search games..."
            aria-label="Search games"
            autoComplete="off"
            spellCheck="false"
            className="w-full pl-9 pr-9 py-2 rounded-xl bg-[var(--surface-card)] text-[var(--on-container)] placeholder:text-[var(--on-container-variant)]/50 text-xs sm:text-sm font-medium border border-[var(--border-tint)] focus:border-[var(--primary-action)] focus:outline-hidden transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setSearchQuery('');
                searchInputRef.current?.focus();
              }}
              className="absolute right-2.5 w-5 h-5 rounded-full bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] text-[var(--on-container-variant)] flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              <Icon name="close" size={11} />
            </button>
          )}

          {/* Autocomplete Dropdown */}
          {isSearchFocused && autocompleteSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--surface-card)] border border-[var(--border-tint)] rounded-xl shadow-xl p-1 z-50 flex flex-col gap-0.5 animate-fadeIn">
              {autocompleteSuggestions.map((item) => (
                <div
                  key={item.id}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    triggerHaptic('medium');
                    onSelectGame(item.id);
                    setIsSearchFocused(false);
                  }}
                  className="p-2 rounded-lg hover:bg-[var(--surface-container-high)] flex items-center justify-between gap-2 cursor-pointer transition-colors"
                >
                  <span className="font-bold text-xs text-[var(--on-container)] truncate">
                    {item.name}
                  </span>
                  <span className="text-[10px] text-[var(--on-container-variant)] shrink-0">
                    {item.categoryTag}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Playable Game Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {filteredLaunchGames.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onClick={() => onSelectGame(game.id)}
          />
        ))}

        {/* Empty state */}
        {filteredLaunchGames.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-center gap-2 rounded-2xl border border-dashed border-[var(--border-tint)] bg-[var(--surface-card)]">
            <span className="text-sm font-bold text-[var(--on-container)]">
              No games found
            </span>
            <Button
              variant="tonal"
              size="sm"
              onClick={() => {
                triggerHaptic('light');
                setSearchQuery('');
                setFilter('All');
              }}
            >
              Reset
            </Button>
          </div>
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
