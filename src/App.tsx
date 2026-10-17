import React, { useState, useEffect } from 'react';
import { registerLaunchGames } from './games';
import { ThemeProvider, useTheme } from './theme/ThemeContext';
import { SessionProvider, useSession } from './engine/session/SessionContext';
import { TopBar } from './components/ui/TopBar';
import { BottomNav, NavTabId } from './components/ui/BottomNav';
import { HomeScreen } from './screens/HomeScreen';
import { GameDetailScreen } from './screens/GameDetailScreen';
import { LobbyScreen } from './screens/LobbyScreen';
import { InGameScreen } from './screens/InGameScreen';
import { FinalLeaderboardScreen } from './screens/FinalLeaderboardScreen';
import { JoinScreen } from './screens/JoinScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { SoloPracticeScreen } from './screens/SoloPracticeScreen';
import { PlayMode } from './engine/types';

// Initialize launch games once
registerLaunchGames();

type AppView =
  | 'home'
  | 'games'
  | 'game_detail'
  | 'join'
  | 'lobby'
  | 'in_game'
  | 'final_leaderboard'
  | 'solo_practice'
  | 'settings';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedGameId, setSelectedGameId] = useState<string>('fake-a-proverb');
  const [activeNavTab, setActiveNavTab] = useState<NavTabId>('home');

  const { snapshot, roomCode, createSession, currentUser } = useSession();
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
    }
  }, [snapshot]);

  // Handle URL join link on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('join')) {
      setCurrentView('join');
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
    } else if (tab === 'settings') {
      setCurrentView('settings');
    }
  };

  const handleSelectGame = (gameId: string) => {
    setSelectedGameId(gameId);
    setCurrentView('game_detail');
  };

  const handleHostSession = async (gameId: string, playMode: PlayMode) => {
    const hostName = currentUser?.name || 'Host Disciple';
    await createSession(gameId, hostName);
    setCurrentView('lobby');
  };

  const handleSoloPractice = (gameId: string) => {
    setSelectedGameId(gameId);
    setCurrentView('solo_practice');
  };

  const isInActiveGame = currentView === 'in_game';

  return (
    <div className="min-h-screen bg-[var(--bg-tint)] text-[var(--on-container)] tint-transition flex flex-col items-center">
      {/* Responsive Shell: compact mobile view on mobile, generous max-w-6xl on desktop */}
      <div className="w-full max-w-6xl min-h-screen flex flex-col relative bg-[var(--bg-tint)] transition-all duration-300">
        {/* TopBar on non-gameplay screens */}
        {!isInActiveGame && currentView !== 'game_detail' && currentView !== 'solo_practice' && (
          <TopBar
            title={
              currentView === 'home'
                ? 'Agape Party'
                : currentView === 'settings'
                ? 'Settings'
                : currentView === 'join'
                ? 'Join Session'
                : 'Agape'
            }
            badge="Beta"
            activeTab={activeNavTab}
            onTabChange={handleNavTabChange}
          />
        )}

        {/* Screen Content */}
        <main className="flex-1 flex flex-col">
          {currentView === 'home' && (
            <HomeScreen
              onSelectGame={handleSelectGame}
              onQuickJoin={() => setCurrentView('join')}
              onHostGame={(id) => handleHostSession(id, 'individuals')}
            />
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
              onExitGame={() => {
                setCurrentView('home');
                setPaletteKey('lavender');
              }}
            />
          )}

          {currentView === 'final_leaderboard' && (
            <FinalLeaderboardScreen
              onPickAnotherGame={() => {
                setCurrentView('home');
                setPaletteKey('lavender');
              }}
            />
          )}

          {currentView === 'join' && (
            <JoinScreen
              onBack={() => setCurrentView('home')}
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
        </main>

        {/* Floating pill bottom nav (hidden during active in-game phase) */}
        <BottomNav
          activeTab={activeNavTab}
          onTabChange={handleNavTabChange}
          visible={!isInActiveGame && currentView !== 'lobby' && currentView !== 'solo_practice'}
        />
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <SessionProvider>
        <AppContent />
      </SessionProvider>
    </ThemeProvider>
  );
};

export default App;
