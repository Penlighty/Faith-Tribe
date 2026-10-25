import React, { useState, useEffect } from 'react';
import { registerLaunchGames } from './games';
import { ThemeProvider, useTheme } from './theme/ThemeContext';
import { AuthProvider } from './engine/auth/AuthContext';
import { TribeProvider } from './engine/tribes/TribeContext';
import { SessionProvider, useSession } from './engine/session/SessionContext';
import { TopBar } from './components/ui/TopBar';
import { BottomNav, NavTabId } from './components/ui/BottomNav';
import { HomeScreen } from './screens/HomeScreen';
import { GameDetailScreen } from './screens/GameDetailScreen';
import { LobbyScreen } from './screens/LobbyScreen';
import { InGameScreen } from './screens/InGameScreen';
import { FinalLeaderboardScreen } from './screens/FinalLeaderboardScreen';
import { JoinScreen } from './screens/JoinScreen';
import { TribeScreen } from './screens/TribeScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { SoloPracticeScreen } from './screens/SoloPracticeScreen';
import { DevIconGalleryScreen } from './screens/DevIconGalleryScreen';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { DisconnectedOverlay } from './components/session/DisconnectedOverlay';
import { PlayMode, ConnectionMode, HotspotInfo } from './engine/types';
import { syncAllGamesContent } from './engine/services/gameDataService';

// Initialize launch games once
registerLaunchGames();

type AppView =
  | 'home'
  | 'games'
  | 'game_detail'
  | 'join'
  | 'tribe'
  | 'lobby'
  | 'in_game'
  | 'final_leaderboard'
  | 'solo_practice'
  | 'settings'
  | 'dev_icons';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedGameId, setSelectedGameId] = useState<string>('fake-a-proverb');
  const [activeNavTab, setActiveNavTab] = useState<NavTabId>('home');

  const {
    snapshot,
    roomCode,
    createSession,
    joinSession,
    currentUser,
    leaveSession,
    connectionStatus,
    disconnectReason,
    reconnect,
    isHost,
  } = useSession();
  const { setPaletteKey } = useTheme();

  // Watch snapshot status to transition in-game and leaderboard automatically
  useEffect(() => {
    if (snapshot) {
      if (snapshot.status === 'in_game') {
        setCurrentView('in_game');
      } else if (snapshot.status === 'final_leaderboard') {
        setCurrentView('final_leaderboard');
      } else if (snapshot.status === 'lobby') {
        setCurrentView('lobby');
      }
    } else {
      // When snapshot is cleared (user left session), return to home
      setCurrentView((prev) => {
        if (prev === 'in_game' || prev === 'lobby' || prev === 'final_leaderboard') {
          return 'home';
        }
        return prev;
      });
      setPaletteKey('lavender');
    }
  }, [snapshot]);

  // Handle URL join link, tribe invite, /dev/icons, and sync database content on mount
  useEffect(() => {
    // Sync latest game content from Firebase Realtime Database
    syncAllGamesContent().catch(() => {});

    if (window.location.pathname === '/dev/icons' || window.location.pathname === '/dev/icons/') {
      setCurrentView('dev_icons');
      return;
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get('join')) {
      setCurrentView('join');
      setActiveNavTab('play');
    } else if (params.get('tribeInvite')) {
      setCurrentView('tribe');
      setActiveNavTab('tribe');
    } else if (params.get('view') === 'icons') {
      setCurrentView('dev_icons');
    }
  }, []);

  const handleNavTabChange = (tab: NavTabId) => {
    setActiveNavTab(tab);
    if (tab === 'home') {
      setCurrentView('home');
      setPaletteKey('lavender');
    } else if (tab === 'play') {
      setCurrentView('join');
    } else if (tab === 'games') {
      setCurrentView('home');
    } else if (tab === 'tribe') {
      setCurrentView('tribe');
    } else if (tab === 'settings') {
      setCurrentView('settings');
    }
  };

  const handleSelectGame = (gameId: string) => {
    setSelectedGameId(gameId);
    setCurrentView('game_detail');
  };

  const handleHostSession = async (
    gameId: string,
    playMode: PlayMode,
    connectionMode: ConnectionMode = 'online',
    hotspotInfo?: HotspotInfo,
    tribeId?: string,
    tribeName?: string
  ) => {
    const hostName = currentUser?.name || 'Host Disciple';
    await createSession(gameId, hostName, connectionMode, hotspotInfo, tribeId, tribeName);
    setCurrentView('lobby');
  };

  const handleDirectJoinSession = async (code: string, mode: ConnectionMode = 'online') => {
    const playerName = currentUser?.name || 'Disciple';
    const success = await joinSession(code, playerName, mode);
    if (success) {
      setCurrentView('lobby');
    }
  };

  const handleSoloPractice = (gameId: string) => {
    setSelectedGameId(gameId);
    setCurrentView('solo_practice');
  };

  const isInActiveGame = currentView === 'in_game';
  // Show disconnected overlay for non-host participants who have been dropped
  const showDisconnectOverlay =
    !isHost && connectionStatus === 'disconnected' && disconnectReason !== null;
  const isReconnecting = connectionStatus === 'reconnecting';

  const handleReconnect = async () => {
    await reconnect();
  };

  const handleLeaveAfterDisconnect = async () => {
    await leaveSession();
    setCurrentView('home');
    setPaletteKey('lavender');
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [currentView]);

  return (
    <div className="min-h-screen bg-[var(--bg-tint)] text-[var(--on-container)] tint-transition flex flex-col items-center">
      {/* Responsive Shell: compact mobile view on mobile, generous max-w-6xl on desktop */}
      <div className="w-full max-w-6xl min-h-screen flex flex-col relative bg-[var(--bg-tint)] transition-all duration-300">
        {/* TopBar on non-gameplay screens */}
        {!isInActiveGame && currentView !== 'game_detail' && currentView !== 'solo_practice' && (
          <TopBar
            title={
              currentView === 'home'
                ? 'Faith Tribe'
                : currentView === 'settings'
                ? 'Settings'
                : currentView === 'join'
                ? 'Join Session'
                : currentView === 'tribe'
                ? 'Fellowship Tribe'
                : 'Faith Tribe'
            }
            badge="Beta"
            activeTab={activeNavTab}
            onTabChange={handleNavTabChange}
          />
        )}

        {/* Screen Content with ErrorBoundary protection */}
        <main className="flex-1 flex flex-col">
          <ErrorBoundary onReset={() => setCurrentView('home')}>
            {currentView === 'home' && (
              <HomeScreen
                onSelectGame={handleSelectGame}
                onQuickJoin={() => setCurrentView('join')}
                onHostGame={(id) => handleHostSession(id, 'individuals')}
                onHostSession={handleHostSession}
                onDirectJoinSession={handleDirectJoinSession}
              />
            )}

            {currentView === 'tribe' && (
              <TribeScreen onJoinSession={handleDirectJoinSession} />
            )}

            {currentView === 'game_detail' && (
              <GameDetailScreen
                gameId={selectedGameId}
                onBack={() => {
                  setCurrentView('home');
                  setPaletteKey('lavender');
                }}
                onHostSession={handleHostSession}
                onSoloPractice={handleSoloPractice}
              />
            )}

            {currentView === 'lobby' && (
              <LobbyScreen
                onLeave={() => {
                  setCurrentView('home');
                  setPaletteKey('lavender');
                }}
              />
            )}

            {currentView === 'in_game' && (
              <InGameScreen
                onExitGame={async () => {
                  await leaveSession();
                  setCurrentView('home');
                  setPaletteKey('lavender');
                }}
              />
            )}

            {currentView === 'final_leaderboard' && (
              <FinalLeaderboardScreen
                onPickAnotherGame={async () => {
                  await leaveSession();
                  setCurrentView('home');
                  setPaletteKey('lavender');
                }}
              />
            )}

            {currentView === 'join' && (
              <JoinScreen
                onBack={() => {
                  if (typeof window !== 'undefined' && window.location.search) {
                    window.history.replaceState({}, document.title, window.location.pathname);
                  }
                  setCurrentView('home');
                }}
                onJoined={() => setCurrentView('lobby')}
              />
            )}

            {currentView === 'solo_practice' && (
              <SoloPracticeScreen
                gameId={selectedGameId}
                onBack={() => {
                  setCurrentView('home');
                  setPaletteKey('lavender');
                }}
              />
            )}

            {currentView === 'settings' && <SettingsScreen />}

            {currentView === 'dev_icons' && (
              <DevIconGalleryScreen
                onBack={() => {
                  window.history.pushState({}, '', '/');
                  setCurrentView('home');
                  setPaletteKey('lavender');
                }}
              />
            )}
          </ErrorBoundary>
        </main>

        {/* Floating pill bottom nav (hidden during active in-game phase or dev gallery) */}
        <BottomNav
          activeTab={activeNavTab}
          onTabChange={handleNavTabChange}
          visible={!isInActiveGame && currentView !== 'lobby' && currentView !== 'solo_practice' && currentView !== 'dev_icons'}
        />

        {/* Disconnected overlay: shown when a participant loses connection */}
        {showDisconnectOverlay && (
          <DisconnectedOverlay
            reason={disconnectReason}
            playerName={currentUser?.name}
            roomCode={roomCode}
            isReconnecting={isReconnecting}
            onReconnect={handleReconnect}
            onLeave={handleLeaveAfterDisconnect}
          />
        )}
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TribeProvider>
          <SessionProvider>
            <AppContent />
          </SessionProvider>
        </TribeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
