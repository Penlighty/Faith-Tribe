import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { Player, Team, SessionConfig, SessionSnapshot, BaseGameState, GameIntent } from '../types';
import { Transport, PresenceUser, TransportMessage, createTransport } from '../transport';
import { gameRegistry } from '../registry';
import { balanceTeams } from '../services/teamBalancer';
import { generateRoomCode } from '../services/roomCode';
import { sanitizePlayerName } from '../services/sanitizer';
import { useTheme } from '../../theme/ThemeContext';
import { soundManager } from '../services/audio';

interface SessionContextType {
  roomCode: string;
  isHost: boolean;
  currentUser: Player | null;
  players: Player[];
  teams: Team[];
  config: SessionConfig;
  snapshot: SessionSnapshot | null;
  transportName: string;
  isConnected: boolean;
  createSession: (gameId: string, hostName: string) => Promise<string>;
  joinSession: (code: string, playerName: string) => Promise<boolean>;
  leaveSession: () => Promise<void>;
  updateConfig: (patch: Partial<SessionConfig>) => void;
  setPlayerTeam: (playerId: string, teamId?: string) => void;
  autoBalanceTeams: () => void;
  startGame: () => void;
  dispatchIntent: (type: string, payload?: any) => void;
  hostNextPhase: () => void;
  hostEndGame: () => void;
  rematch: () => void;
}

const SessionContext = createContext<SessionContextType | null>(null);

const STORAGE_KEY_USER_ID = 'faith_tribe_player_id';
const STORAGE_KEY_USER_NAME = 'faith_tribe_player_name';

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setPaletteKey, soundEnabled } = useTheme();

  // Persistent user identity per tab
  const [currentUser, setCurrentUser] = useState<Player | null>(() => {
    const savedTabId = typeof window !== 'undefined' ? sessionStorage.getItem(STORAGE_KEY_USER_ID) : null;
    const savedName =
      (typeof window !== 'undefined'
        ? localStorage.getItem(STORAGE_KEY_USER_NAME) || localStorage.getItem('agape_player_name')
        : null) || 'Player';

    const userId = savedTabId || 'p_' + Math.random().toString(36).substring(2, 9);
    if (typeof window !== 'undefined' && !savedTabId) {
      sessionStorage.setItem(STORAGE_KEY_USER_ID, userId);
    }

    return {
      id: userId,
      name: savedName,
      isHost: false,
      avatarSeed: userId,
      score: 0,
    };
  });

  const [roomCode, setRoomCode] = useState<string>('');
  const [isHost, setIsHost] = useState<boolean>(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [config, setConfig] = useState<SessionConfig>({
    roomCode: '',
    selectedGameId: 'fake-a-proverb',
    playMode: 'individuals',
    roundsCount: 4,
    timerMultiplier: 1.0,
    soundEffects: true,
  });
  const [snapshot, setSnapshot] = useState<SessionSnapshot | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const transportRef = useRef<Transport | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const snapshotRef = useRef<SessionSnapshot | null>(null);
  snapshotRef.current = snapshot;
  const isHostRef = useRef<boolean>(isHost);
  isHostRef.current = isHost;
  const playersRef = useRef<Player[]>(players);
  playersRef.current = players;
  const teamsRef = useRef<Team[]>(teams);
  teamsRef.current = teams;
  const configRef = useRef<SessionConfig>(config);
  configRef.current = config;

  // Initialize transport
  if (!transportRef.current) {
    transportRef.current = createTransport('auto');
  }

  // Update theme seed color when game changes
  useEffect(() => {
    if (config.selectedGameId) {
      const game = gameRegistry.get(config.selectedGameId);
      if (game?.meta?.accentSeedColor) {
        setPaletteKey(game.meta.accentSeedColor);
      }
    }
  }, [config.selectedGameId, setPaletteKey]);

  // Host state broadcast
  const broadcastSnapshot = useCallback((newSnapshot: SessionSnapshot) => {
    setSnapshot(newSnapshot);
    if (transportRef.current && transportRef.current.isConnected()) {
      transportRef.current.send('SNAPSHOT', newSnapshot, newSnapshot.version);
    }
  }, []);

  // Host ticker for game phase timers
  useEffect(() => {
    if (!isHost || !snapshot || snapshot.status !== 'in_game') {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    const game = gameRegistry.get(snapshot.gameId);
    if (!game) return;

    timerIntervalRef.current = setInterval(() => {
      const current = snapshotRef.current;
      if (!current || current.status !== 'in_game') return;

      const currentPhase = game.phases[current.gameState.phaseIndex];
      if (!currentPhase || !currentPhase.hasTimer) return;

      const remaining = (current.gameState.phaseTimeRemaining ?? 1) - 1;

      if (remaining <= 0) {
        // Timer expired -> advance phase or trigger end-of-round
        advanceHostPhase();
      } else {
        // Tick sound at 5s, 4s, 3s, 2s, 1s
        if (remaining <= 5) {
          soundManager.playTick(soundEnabled);
        }

        const nextSnapshot: SessionSnapshot = {
          ...current,
          version: current.version + 1,
          gameState: {
            ...current.gameState,
            phaseTimeRemaining: remaining,
          },
        };
        broadcastSnapshot(nextSnapshot);
      }
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [isHost, snapshot?.status, snapshot?.gameId, soundEnabled]);

  // Advance host phase
  const advanceHostPhase = useCallback(() => {
    const current = snapshotRef.current;
    if (!current || !isHostRef.current) return;

    const game = gameRegistry.get(current.gameId);
    if (!game) return;

    const nextPhaseIndex = current.gameState.phaseIndex + 1;

    if (nextPhaseIndex < game.phases.length) {
      const nextPhase = game.phases[nextPhaseIndex];
      const nextSnapshot: SessionSnapshot = {
        ...current,
        version: current.version + 1,
        gameState: {
          ...current.gameState,
          phaseIndex: nextPhaseIndex,
          currentPhaseId: nextPhase.id,
          phaseTimeRemaining: nextPhase.durationSeconds,
          phaseDuration: nextPhase.durationSeconds,
        },
      };
      broadcastSnapshot(nextSnapshot);
    } else {
      // End of round: check if game over
      const nextRound = current.gameState.roundNumber + 1;
      const totalRounds = current.gameState.totalRounds || current.config.roundsCount || 4;

      if (nextRound > totalRounds) {
        // Game Over!
        soundManager.playChime(soundEnabled);
        const finalSnapshot: SessionSnapshot = {
          ...current,
          status: 'final_leaderboard',
          version: current.version + 1,
          gameState: {
            ...current.gameState,
            isGameOver: true,
          },
        };
        broadcastSnapshot(finalSnapshot);
      } else {
        // Next round
        const firstPhase = game.phases[0];
        const nextRoundState = game.reduce(
          {
            ...current.gameState,
            roundNumber: nextRound,
            phaseIndex: 0,
            currentPhaseId: firstPhase.id,
            phaseTimeRemaining: firstPhase.durationSeconds,
            phaseDuration: firstPhase.durationSeconds,
          },
          {
            type: 'START_ROUND',
            playerId: 'HOST',
            payload: { roundNumber: nextRound },
            timestamp: Date.now(),
          },
          'HOST'
        );

        const nextSnapshot: SessionSnapshot = {
          ...current,
          version: current.version + 1,
          status: 'in_game',
          gameState: nextRoundState,
        };
        broadcastSnapshot(nextSnapshot);
      }
    }
  }, [broadcastSnapshot, soundEnabled]);

  // Process player intent on host
  const handleHostIntent = useCallback(
    (intent: GameIntent) => {
      const current = snapshotRef.current;
      if (!current || !isHostRef.current) return;

      const game = gameRegistry.get(current.gameId);
      if (!game) return;

      try {
        const nextState = game.reduce(current.gameState, intent, intent.playerId);

        // Check if all players have submitted, which might trigger immediate phase advance
        const nextSnapshot: SessionSnapshot = {
          ...current,
          version: current.version + 1,
          gameState: nextState,
        };

        broadcastSnapshot(nextSnapshot);
      } catch (err) {
        console.error('Error reducing intent', err);
      }
    },
    [broadcastSnapshot]
  );

  // Setup transport message listeners
  useEffect(() => {
    const transport = transportRef.current;
    if (!transport) return;

    const unsubMsg = transport.onMessage((msg: TransportMessage<any>) => {
      if (msg.type === 'SNAPSHOT') {
        const remoteSnap = msg.payload as SessionSnapshot;
        if (!isHostRef.current) {
          // Player accepts latest version
          setSnapshot((prev) => {
            if (!prev || remoteSnap.version >= prev.version) {
              // Sync players and config from snapshot
              setPlayers(remoteSnap.players);
              setTeams(remoteSnap.teams);
              setConfig(remoteSnap.config);
              return remoteSnap;
            }
            return prev;
          });
        }
      } else if (msg.type === 'INTENT') {
        if (isHostRef.current) {
          handleHostIntent(msg.payload as GameIntent);
        }
      } else if (msg.type === 'PLAYER_JOIN') {
        if (isHostRef.current) {
          const joiningPlayer = msg.payload?.player as Player;
          if (joiningPlayer) {
            setPlayers((prev) => {
              const exists = prev.some((p) => p.id === joiningPlayer.id);
              const next = exists
                ? prev.map((p) => (p.id === joiningPlayer.id ? { ...p, ...joiningPlayer } : p))
                : [...prev, joiningPlayer];

              if (snapshotRef.current) {
                const nextSnapshot: SessionSnapshot = {
                  ...snapshotRef.current,
                  version: snapshotRef.current.version + 1,
                  players: next,
                };
                setSnapshot(nextSnapshot);
                transport.send('SNAPSHOT', nextSnapshot, nextSnapshot.version);
              }
              return next;
            });
          }
        }
      } else if (msg.type === 'REQUEST_SNAPSHOT') {
        // Late joiner or reconnect requested snapshot
        if (isHostRef.current && snapshotRef.current) {
          transport.send('SNAPSHOT', snapshotRef.current, snapshotRef.current.version);
        }
      }
    });

    const unsubPresence = transport.onPresenceSync((presences: PresenceUser[]) => {
      // Map presences to players
      const mappedPlayers: Player[] = presences.map((p) => ({
        id: p.id,
        name: p.name,
        isHost: p.isHost,
        avatarSeed: p.avatarSeed || p.id,
        teamId: p.teamId,
        score: 0,
        isReady: p.isReady,
      }));

      setPlayers((currentPlayers) => {
        // Retain existing scores if present
        const merged = mappedPlayers.map((p) => {
          const existing = currentPlayers.find((cp) => cp.id === p.id);
          return existing ? { ...p, score: existing.score } : p;
        });

        // Ensure host is always in the list
        if (currentUser && currentUser.isHost && !merged.some((p) => p.id === currentUser.id)) {
          merged.unshift(currentUser);
        }

        // If host, update snapshot with full live player list and broadcast to all disciples
        if (isHostRef.current && snapshotRef.current) {
          const updatedSnapshot: SessionSnapshot = {
            ...snapshotRef.current,
            version: snapshotRef.current.version + 1,
            players: merged,
          };
          setSnapshot(updatedSnapshot);
          transport.send('SNAPSHOT', updatedSnapshot, updatedSnapshot.version);
        }

        return merged;
      });
    });

    return () => {
      unsubMsg();
      unsubPresence();
    };
  }, [handleHostIntent]);

  // Host creates session
  const createSession = async (gameId: string, hostName: string): Promise<string> => {
    const code = generateRoomCode();
    const cleanName = sanitizePlayerName(hostName);
    localStorage.setItem(STORAGE_KEY_USER_NAME, cleanName);

    let hostId = typeof window !== 'undefined' ? sessionStorage.getItem(STORAGE_KEY_USER_ID) : null;
    if (!hostId) {
      hostId = 'p_' + Math.random().toString(36).substring(2, 9);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(STORAGE_KEY_USER_ID, hostId);
      }
    }

    const hostUser: Player = {
      id: hostId,
      name: cleanName,
      avatarSeed: hostId,
      score: 0,
      isHost: true,
    };

    setCurrentUser(hostUser);
    setRoomCode(code);
    setIsHost(true);
    setPlayers([hostUser]);

    const initialConfig: SessionConfig = {
      roomCode: code,
      selectedGameId: gameId,
      playMode: 'individuals',
      roundsCount: 4,
      timerMultiplier: 1.0,
      soundEffects: true,
    };
    setConfig(initialConfig);

    const initialSnapshot: SessionSnapshot = {
      version: 1,
      gameId,
      roomCode: code,
      gameState: {
        phaseIndex: 0,
        currentPhaseId: 'lobby',
        roundNumber: 1,
        totalRounds: 4,
        isGameOver: false,
        scores: {},
      },
      players: [hostUser],
      teams: [],
      config: initialConfig,
      status: 'lobby',
    };
    setSnapshot(initialSnapshot);

    const transport = transportRef.current!;
    await transport.connect(code, {
      id: hostUser.id,
      name: hostUser.name,
      isHost: true,
      avatarSeed: hostUser.avatarSeed,
      joinedAt: Date.now(),
    });

    setIsConnected(true);
    return code;
  };

  // Player joins session
  const joinSession = async (code: string, playerName: string): Promise<boolean> => {
    const cleanCode = code.trim().toUpperCase();
    const cleanName = sanitizePlayerName(playerName);
    localStorage.setItem(STORAGE_KEY_USER_NAME, cleanName);

    let playerId = typeof window !== 'undefined' ? sessionStorage.getItem(STORAGE_KEY_USER_ID) : null;
    if (!playerId) {
      playerId = 'p_' + Math.random().toString(36).substring(2, 9);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(STORAGE_KEY_USER_ID, playerId);
      }
    }

    const playerUser: Player = {
      id: playerId,
      name: cleanName,
      avatarSeed: playerId,
      score: 0,
      isHost: false,
    };

    setCurrentUser(playerUser);
    setRoomCode(cleanCode);
    setIsHost(false);

    const transport = transportRef.current!;
    await transport.connect(cleanCode, {
      id: playerUser.id,
      name: playerUser.name,
      isHost: false,
      avatarSeed: playerUser.avatarSeed,
      joinedAt: Date.now(),
    });

    setIsConnected(true);

    // Explicitly notify host of player join
    await transport.send('PLAYER_JOIN', { player: playerUser });

    // Request snapshot from host
    await transport.send('REQUEST_SNAPSHOT', { playerId: playerUser.id });
    return true;
  };

  // Leave session
  const leaveSession = async () => {
    if (transportRef.current) {
      await transportRef.current.disconnect();
    }
    setRoomCode('');
    setIsHost(false);
    setSnapshot(null);
    setIsConnected(false);
  };

  // Dispatch player intent
  const dispatchIntent = (type: string, payload?: any) => {
    if (!currentUser || !transportRef.current) return;

    const intent: GameIntent = {
      type,
      playerId: currentUser.id,
      payload,
      timestamp: Date.now(),
    };

    if (isHost) {
      handleHostIntent(intent);
    } else {
      transportRef.current.send('INTENT', intent);
    }
  };

  // Update lobby config
  const updateConfig = (patch: Partial<SessionConfig>) => {
    if (!isHost) return;
    const nextConfig = { ...config, ...patch };
    setConfig(nextConfig);

    if (snapshot) {
      const nextSnapshot = {
        ...snapshot,
        version: snapshot.version + 1,
        config: nextConfig,
        gameId: nextConfig.selectedGameId,
      };
      broadcastSnapshot(nextSnapshot);
    }
  };

  // Team management
  const setPlayerTeam = (playerId: string, teamId?: string) => {
    if (!isHost) return;
    const updatedPlayers = players.map((p) => (p.id === playerId ? { ...p, teamId } : p));
    setPlayers(updatedPlayers);
    if (snapshot) {
      broadcastSnapshot({
        ...snapshot,
        version: snapshot.version + 1,
        players: updatedPlayers,
      });
    }
  };

  const autoBalanceTeams = () => {
    if (!isHost) return;
    const { players: balancedPlayers, teams: balancedTeams } = balanceTeams(players, config.playMode);
    setPlayers(balancedPlayers);
    setTeams(balancedTeams);

    if (snapshot) {
      broadcastSnapshot({
        ...snapshot,
        version: snapshot.version + 1,
        players: balancedPlayers,
        teams: balancedTeams,
      });
    }
  };

  // Start game from lobby
  const startGame = () => {
    if (!isHost) return;
    const game = gameRegistry.get(config.selectedGameId);
    if (!game) {
      console.error('Selected game not found in registry', config.selectedGameId);
      return;
    }

    const initialGameState = game.setup(config, players, teams, game.content);
    const firstPhase = game.phases[0];

    const newSnapshot: SessionSnapshot = {
      version: (snapshot?.version || 1) + 1,
      gameId: config.selectedGameId,
      roomCode,
      status: 'in_game',
      config,
      players,
      teams,
      gameState: {
        ...initialGameState,
        phaseIndex: 0,
        currentPhaseId: firstPhase.id,
        phaseTimeRemaining: firstPhase.durationSeconds,
        phaseDuration: firstPhase.durationSeconds,
        roundNumber: 1,
        totalRounds: config.roundsCount || 4,
        isGameOver: false,
      },
    };

    soundManager.playChime(soundEnabled);
    broadcastSnapshot(newSnapshot);
  };

  const hostEndGame = () => {
    if (!isHost || !snapshot) return;
    broadcastSnapshot({
      ...snapshot,
      version: snapshot.version + 1,
      status: 'final_leaderboard',
      gameState: {
        ...snapshot.gameState,
        isGameOver: true,
      },
    });
  };

  const rematch = () => {
    if (!isHost || !snapshot) return;
    startGame();
  };

  return (
    <SessionContext.Provider
      value={{
        roomCode,
        isHost,
        currentUser,
        players,
        teams,
        config,
        snapshot,
        transportName: transportRef.current?.getTransportName() || 'Unknown',
        isConnected,
        createSession,
        joinSession,
        leaveSession,
        updateConfig,
        setPlayerTeam,
        autoBalanceTeams,
        startGame,
        dispatchIntent,
        hostNextPhase: advanceHostPhase,
        hostEndGame,
        rematch,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
};
