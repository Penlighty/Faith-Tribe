import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { Player, Team, SessionConfig, SessionSnapshot, BaseGameState, GameIntent, ConnectionMode, HotspotInfo, getParticipatingPlayers } from '../types';
import { Transport, PresenceUser, TransportMessage, createTransport } from '../transport';
import { gameRegistry } from '../registry';
import { balanceTeams } from '../services/teamBalancer';
import { generateRoomCode } from '../services/roomCode';
import { sanitizePlayerName } from '../services/sanitizer';
import { useTheme } from '../../theme/ThemeContext';
import { soundManager } from '../services/audio';
import { recordGameResult } from '../services/gameDataService';

export interface SessionContextType {
  roomCode: string;
  isHost: boolean;
  currentUser: Player | null;
  players: Player[];
  teams: Team[];
  config: SessionConfig;
  snapshot: SessionSnapshot | null;
  transportName: string;
  isConnected: boolean;
  createSession: (
    gameId: string,
    hostName: string,
    connectionMode?: ConnectionMode,
    hotspotInfo?: HotspotInfo
  ) => Promise<string>;
  joinSession: (
    code: string,
    playerName: string,
    connectionMode?: ConnectionMode
  ) => Promise<boolean>;
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

  const [currentTransport, setCurrentTransport] = useState<Transport>(() => createTransport('auto'));
  const transportRef = useRef<Transport>(currentTransport);
  transportRef.current = currentTransport;
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

  const initOrSwitchTransport = useCallback((preference: 'webrtc' | 'auto') => {
    if (transportRef.current) {
      transportRef.current.disconnect().catch(() => {});
    }
    const next = createTransport(preference);
    transportRef.current = next;
    setCurrentTransport(next);
    return next;
  }, []);

  // Update theme seed color when game changes
  useEffect(() => {
    if (config.selectedGameId) {
      const game = gameRegistry.get(config.selectedGameId);
      if (game?.meta?.accentSeedColor) {
        setPaletteKey(game.meta.accentSeedColor);
      }
    }
  }, [config.selectedGameId, setPaletteKey]);

  const isAdvancingPhaseRef = useRef<boolean>(false);
  const pendingBroadcastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Host state broadcast: immediate for phase/round transitions; debounced (60ms) for rapid multi-player intents
  const broadcastSnapshot = useCallback((newSnapshot: SessionSnapshot, immediate = true) => {
    snapshotRef.current = newSnapshot;
    setSnapshot(newSnapshot);

    const flush = () => {
      if (pendingBroadcastTimerRef.current) {
        clearTimeout(pendingBroadcastTimerRef.current);
        pendingBroadcastTimerRef.current = null;
      }
      if (transportRef.current && transportRef.current.isConnected()) {
        const latest = snapshotRef.current;
        if (latest) {
          transportRef.current.send('SNAPSHOT', latest, latest.version);
        }
      }
    };

    if (immediate) {
      flush();
    } else {
      if (!pendingBroadcastTimerRef.current) {
        pendingBroadcastTimerRef.current = setTimeout(flush, 60);
      }
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
      if (!current || current.status !== 'in_game' || !isHostRef.current) return;
      if (isAdvancingPhaseRef.current) return;

      const currentPhase = game.phases[current.gameState.phaseIndex];
      if (!currentPhase || !currentPhase.hasTimer) return;

      const endTs = current.gameState.phaseEndTimestamp;
      const remaining = typeof endTs === 'number'
        ? Math.max(0, Math.ceil((endTs - Date.now()) / 1000))
        : (current.gameState.phaseTimeRemaining ?? 1) - 1;

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

        // Always update host local state immediately so host UI ticks smoothly
        snapshotRef.current = nextSnapshot;
        setSnapshot(nextSnapshot);

        // Network sync: send snapshot over network periodically (every 5s, or final 3s)
        // to prevent WebSocket queue congestion while keeping participant clocks synchronized.
        const shouldSyncNetwork = remaining % 5 === 0 || remaining <= 3;
        if (shouldSyncNetwork && transportRef.current && transportRef.current.isConnected()) {
          transportRef.current.send('SNAPSHOT', nextSnapshot, nextSnapshot.version);
        }
      }
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [
    isHost,
    snapshot?.status,
    snapshot?.gameId,
    snapshot?.gameState?.phaseIndex,
    snapshot?.gameState?.roundNumber,
    soundEnabled,
  ]);

  // Participant local timer ticker: smoothly counts down remaining seconds between network pulses
  useEffect(() => {
    if (isHost || !snapshot || snapshot.status !== 'in_game') return;

    const game = gameRegistry.get(snapshot.gameId);
    if (!game) return;

    const currentPhase = game.phases[snapshot.gameState?.phaseIndex ?? 0];
    if (!currentPhase || !currentPhase.hasTimer) return;

    const participantTicker = setInterval(() => {
      setSnapshot((prev) => {
        if (!prev || prev.status !== 'in_game') return prev;
        const endTs = prev.gameState?.phaseEndTimestamp;
        const currentSec = prev.gameState?.phaseTimeRemaining;

        const remaining = typeof endTs === 'number'
          ? Math.max(0, Math.ceil((endTs - Date.now()) / 1000))
          : typeof currentSec === 'number'
          ? Math.max(0, currentSec - 1)
          : 0;

        if (typeof currentSec === 'number' && currentSec === remaining) return prev;

        const updated = {
          ...prev,
          gameState: {
            ...prev.gameState,
            phaseTimeRemaining: remaining,
          },
        };
        snapshotRef.current = updated;
        return updated;
      });
    }, 1000);

    return () => clearInterval(participantTicker);
  }, [
    isHost,
    snapshot?.status,
    snapshot?.gameId,
    snapshot?.gameState?.phaseIndex,
    snapshot?.gameState?.roundNumber,
  ]);

  // Advance host phase
  const advanceHostPhase = useCallback(() => {
    if (isAdvancingPhaseRef.current) return;
    const current = snapshotRef.current;
    if (!current || !isHostRef.current || current.status !== 'in_game') return;

    const game = gameRegistry.get(current.gameId);
    if (!game) return;

    isAdvancingPhaseRef.current = true;

    // Reset ticker interval so the new phase gets a fresh 1-second cadence
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    try {
      const nextPhaseIndex = current.gameState.phaseIndex + 1;

      if (nextPhaseIndex < game.phases.length) {
        const nextPhase = game.phases[nextPhaseIndex];
        const durationSec = nextPhase.durationSeconds;
        const endTimestamp = nextPhase.hasTimer && durationSec ? Date.now() + durationSec * 1000 : undefined;
        let nextGameState = {
          ...current.gameState,
          phaseIndex: nextPhaseIndex,
          currentPhaseId: nextPhase.id,
          phaseTimeRemaining: durationSec,
          phaseDuration: durationSec,
          phaseEndTimestamp: endTimestamp,
        };

        // Synchronously execute phase hooks so participants receive fully populated phase state immediately
        if (current.gameId === 'fake-a-proverb') {
          if (nextPhase.id === 'vote') {
            nextGameState = game.reduce(
              nextGameState,
              {
                type: 'PREPARE_VOTING',
                playerId: 'HOST',
                timestamp: Date.now(),
              },
              'HOST'
            );
          } else if (nextPhase.id === 'reveal') {
            nextGameState = game.reduce(
              nextGameState,
              {
                type: 'CALCULATE_ROUND_SCORES',
                playerId: 'HOST',
                timestamp: Date.now(),
              },
              'HOST'
            );
          }
        } else if (current.gameId === 'who-said') {
          if (nextPhase.id === 'question') {
            nextGameState = game.reduce(
              nextGameState,
              {
                type: 'START_QUESTION',
                playerId: 'HOST',
                timestamp: Date.now(),
              },
              'HOST'
            );
          } else if (nextPhase.id === 'reveal') {
            nextGameState = game.reduce(
              nextGameState,
              {
                type: 'TRIGGER_REVEAL',
                playerId: 'HOST',
                timestamp: Date.now(),
              },
              'HOST'
            );
          }
        } else if (current.gameId === 'testament-sort') {
          if (nextPhase.id === 'card') {
            nextGameState = game.reduce(
              nextGameState,
              {
                type: 'START_CARD',
                playerId: 'HOST',
                timestamp: Date.now(),
              },
              'HOST'
            );
          } else if (nextPhase.id === 'reveal') {
            nextGameState = game.reduce(
              nextGameState,
              {
                type: 'TRIGGER_REVEAL',
                playerId: 'HOST',
                timestamp: Date.now(),
              },
              'HOST'
            );
          }
        }

        // Re-verify phaseIndex and duration alignment
        nextGameState.phaseIndex = nextPhaseIndex;
        nextGameState.currentPhaseId = nextPhase.id;
        nextGameState.phaseDuration = nextGameState.phaseDuration || durationSec;
        nextGameState.phaseTimeRemaining = nextGameState.phaseTimeRemaining ?? durationSec;
        nextGameState.phaseEndTimestamp = endTimestamp;

        const nextSnapshot: SessionSnapshot = {
          ...current,
          version: current.version + 1,
          gameState: nextGameState,
        };
        broadcastSnapshot(nextSnapshot, true);
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

          // Record completed session to database
          const participating = getParticipatingPlayers(current.players, game?.meta);
          recordGameResult(
            current.gameId,
            game?.meta?.name || 'Fellowship Game',
            current.roomCode,
            current.config.connectionMode || 'online',
            totalRounds,
            participating,
            current.teams
          );
        } else {
          // Next round
          const firstPhase = game.phases[0];
          const durationSec = firstPhase.durationSeconds;
          const endTimestamp = firstPhase.hasTimer && durationSec ? Date.now() + durationSec * 1000 : undefined;
          let nextRoundState = game.reduce(
            {
              ...current.gameState,
              roundNumber: nextRound,
              phaseIndex: 0,
              currentPhaseId: firstPhase.id,
              phaseTimeRemaining: durationSec,
              phaseDuration: durationSec,
              phaseEndTimestamp: endTimestamp,
            },
            {
              type: 'START_ROUND',
              playerId: 'HOST',
              payload: { roundNumber: nextRound },
              timestamp: Date.now(),
            },
            'HOST'
          );

          if (current.gameId === 'who-said') {
            nextRoundState = game.reduce(
              nextRoundState,
              {
                type: 'NEXT_QUESTION',
                playerId: 'HOST',
                timestamp: Date.now(),
              },
              'HOST'
            );
          } else if (current.gameId === 'testament-sort') {
            nextRoundState = game.reduce(
              nextRoundState,
              {
                type: 'NEXT_CARD',
                playerId: 'HOST',
                timestamp: Date.now(),
              },
              'HOST'
            );
          }

          nextRoundState.phaseIndex = 0;
          nextRoundState.currentPhaseId = firstPhase.id;
          nextRoundState.phaseDuration = durationSec;
          nextRoundState.phaseTimeRemaining = durationSec;
          nextRoundState.phaseEndTimestamp = endTimestamp;

          const nextSnapshot: SessionSnapshot = {
            ...current,
            version: current.version + 1,
            status: 'in_game',
            gameState: nextRoundState,
          };
          broadcastSnapshot(nextSnapshot, true);
        }
      }
    } finally {
      setTimeout(() => {
        isAdvancingPhaseRef.current = false;
      }, 500);
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
        let nextState = game.reduce(current.gameState, intent, intent.playerId);

        // Keep phaseIndex in sync with currentPhaseId if the reducer changed phases
        if (nextState.currentPhaseId && nextState.currentPhaseId !== game.phases[nextState.phaseIndex]?.id) {
          const matchedIdx = game.phases.findIndex((p) => p.id === nextState.currentPhaseId);
          if (matchedIdx !== -1) {
            nextState = {
              ...nextState,
              phaseIndex: matchedIdx,
            };
          }
        }

        // Active participating players (non-host if game doesn't allow host to play, or all players if hostCanPlay/solo)
        const currentPlayers = getParticipatingPlayers(current.players, game.meta);
        const activeCount = Math.max(1, currentPlayers.length);

        // Instant auto-advance checks when all active players completed the phase goal
        if (current.gameId === 'fake-a-proverb') {
          if (nextState.currentPhaseId === 'write') {
            const submittedCount = Object.keys(nextState.submissions || {}).length;
            if (submittedCount > 0 && submittedCount >= activeCount) {
              const updatedSnapshot: SessionSnapshot = {
                ...current,
                version: current.version + 1,
                gameState: nextState,
              };
              snapshotRef.current = updatedSnapshot;
              setSnapshot(updatedSnapshot);
              advanceHostPhase();
              return;
            }
          } else if (nextState.currentPhaseId === 'vote') {
            const votedCount = Object.keys(nextState.votes || {}).length;
            if (votedCount > 0 && votedCount >= activeCount) {
              const updatedSnapshot: SessionSnapshot = {
                ...current,
                version: current.version + 1,
                gameState: nextState,
              };
              snapshotRef.current = updatedSnapshot;
              setSnapshot(updatedSnapshot);
              advanceHostPhase();
              return;
            }
          }
        } else if (current.gameId === 'who-said') {
          if (nextState.currentPhaseId === 'question') {
            const playerStatesList = Object.values(nextState.playerStates || {});
            const allLocked = playerStatesList.length > 0 && playerStatesList.every((p: any) => p.locked);
            if (allLocked && playerStatesList.length >= activeCount) {
              const updatedSnapshot: SessionSnapshot = {
                ...current,
                version: current.version + 1,
                gameState: nextState,
              };
              snapshotRef.current = updatedSnapshot;
              setSnapshot(updatedSnapshot);
              advanceHostPhase();
              return;
            }
          }
        } else if (current.gameId === 'testament-sort') {
          if (nextState.currentPhaseId === 'card') {
            const cardStatesList = Object.values(nextState.playerCardStates || {});
            const allLocked = cardStatesList.length > 0 && cardStatesList.every((p: any) => p.locked);
            if (allLocked && cardStatesList.length >= activeCount) {
              const updatedSnapshot: SessionSnapshot = {
                ...current,
                version: current.version + 1,
                gameState: nextState,
              };
              snapshotRef.current = updatedSnapshot;
              setSnapshot(updatedSnapshot);
              advanceHostPhase();
              return;
            }
          }
        }

        const nextSnapshot: SessionSnapshot = {
          ...current,
          version: current.version + 1,
          gameState: nextState,
        };

        // Intermediate intent: coalesce with micro-debounce (60ms) so rapid multiple locks
        // update the host UI instantly without flooding the network with full snapshots
        broadcastSnapshot(nextSnapshot, false);
      } catch (err) {
        console.error('Error reducing intent', err);
      }
    },
    [broadcastSnapshot, advanceHostPhase]
  );

  // Setup transport message listeners
  useEffect(() => {
    const transport = transportRef.current;
    if (!transport) return;

    const unsubMsg = transport.onMessage((msg: TransportMessage<any>) => {
      if (msg.type === 'SNAPSHOT') {
        const remoteSnap = msg.payload as SessionSnapshot;
        if (remoteSnap && !isHostRef.current) {
          // Normalize and defensively unpack remote snapshot to handle Firebase RTDB serialization
          const safePlayers: Player[] = Array.isArray(remoteSnap.players)
            ? remoteSnap.players
            : remoteSnap.players && typeof remoteSnap.players === 'object'
            ? Object.values(remoteSnap.players)
            : [];
          const safeTeams: Team[] = Array.isArray(remoteSnap.teams)
            ? remoteSnap.teams
            : remoteSnap.teams && typeof remoteSnap.teams === 'object'
            ? Object.values(remoteSnap.teams)
            : [];
          const safeConfig: SessionConfig = remoteSnap.config
            ? { ...configRef.current, ...remoteSnap.config }
            : configRef.current;

          const sanitizedSnap: SessionSnapshot = {
            ...remoteSnap,
            players: safePlayers,
            teams: safeTeams,
            config: safeConfig,
          };

          // Player accepts latest version (or fresh status / round transition)
          setSnapshot((prev) => {
            const isNewer =
              !prev ||
              (remoteSnap.version ?? 0) >= (prev.version ?? 0) ||
              remoteSnap.status !== prev.status ||
              remoteSnap.gameState?.roundNumber !== prev.gameState?.roundNumber;

            if (isNewer) {
              // Sync players and config from snapshot
              setPlayers(safePlayers);
              setTeams(safeTeams);
              setConfig(safeConfig);
              return sanitizedSnap;
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
              const safePrev = Array.isArray(prev) ? prev : [];
              const exists = safePrev.some((p) => p.id === joiningPlayer.id);
              const next = exists
                ? safePrev.map((p) => (p.id === joiningPlayer.id ? { ...p, ...joiningPlayer } : p))
                : [...safePrev, joiningPlayer];

              if (snapshotRef.current) {
                const nextSnapshot: SessionSnapshot = {
                  ...snapshotRef.current,
                  version: snapshotRef.current.version + 1,
                  players: next,
                  teams: Array.isArray(snapshotRef.current.teams) ? snapshotRef.current.teams : [],
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
      // Safely normalize presences
      const safePresences: PresenceUser[] = Array.isArray(presences)
        ? presences
        : presences && typeof presences === 'object'
        ? Object.values(presences)
        : [];

      // Map presences to players
      const mappedPlayers: Player[] = safePresences.map((p) => ({
        id: p.id,
        name: p.name,
        isHost: p.isHost,
        avatarSeed: p.avatarSeed || p.id,
        teamId: p.teamId,
        score: 0,
        isReady: p.isReady,
        connectionMode: (p.connectionMode as ConnectionMode) || (configRef.current?.connectionMode ?? 'online'),
      }));

      setPlayers((currentPlayers) => {
        const safeCurrent = Array.isArray(currentPlayers) ? currentPlayers : [];
        // Retain existing scores if present
        const merged = mappedPlayers.map((p) => {
          const existing = safeCurrent.find((cp) => cp.id === p.id);
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
            teams: Array.isArray(snapshotRef.current.teams) ? snapshotRef.current.teams : [],
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
  }, [currentTransport, handleHostIntent]);

  // Host creates session
  const createSession = async (
    gameId: string,
    hostName: string,
    connectionMode: ConnectionMode = 'online',
    hotspotInfo?: HotspotInfo
  ): Promise<string> => {
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
      connectionMode,
    };

    setCurrentUser(hostUser);
    setRoomCode(code);
    setIsHost(true);
    isHostRef.current = true;
    setPlayers([hostUser]);
    playersRef.current = [hostUser];

    const initialConfig: SessionConfig = {
      roomCode: code,
      selectedGameId: gameId,
      playMode: 'individuals',
      roundsCount: 4,
      timerMultiplier: 1.0,
      soundEffects: true,
      connectionMode,
      hotspotInfo,
    };
    setConfig(initialConfig);
    configRef.current = initialConfig;

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
    snapshotRef.current = initialSnapshot;

    const transport = initOrSwitchTransport(connectionMode === 'onsite' ? 'webrtc' : 'auto');
    await transport.connect(code, {
      id: hostUser.id,
      name: hostUser.name,
      isHost: true,
      avatarSeed: hostUser.avatarSeed,
      joinedAt: Date.now(),
      connectionMode,
    });

    // Authoritatively write initial lobby snapshot to transport so remote DB and connecting clients see clean lobby
    await transport.send('SNAPSHOT', initialSnapshot, initialSnapshot.version);

    setIsConnected(true);
    return code;
  };

  // Player joins session
  const joinSession = async (
    code: string,
    playerName: string,
    connectionMode: ConnectionMode = 'online'
  ): Promise<boolean> => {
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
      connectionMode,
    };

    setCurrentUser(playerUser);
    setRoomCode(cleanCode);
    setIsHost(false);
    isHostRef.current = false;
    setSnapshot(null);
    snapshotRef.current = null;
    setPlayers([playerUser]);
    playersRef.current = [playerUser];
    setTeams([]);
    teamsRef.current = [];

    const transport = initOrSwitchTransport(connectionMode === 'onsite' ? 'webrtc' : 'auto');
    await transport.connect(cleanCode, {
      id: playerUser.id,
      name: playerUser.name,
      isHost: false,
      avatarSeed: playerUser.avatarSeed,
      joinedAt: Date.now(),
      connectionMode,
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
    // 1. Clear host phase ticker timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    // 2. Disconnect transport cleanly
    if (transportRef.current) {
      try {
        await transportRef.current.disconnect();
      } catch (err) {
        console.warn('[SessionContext] Error disconnecting transport during leave:', err);
      }
    }

    // 3. Clear all session and player states
    setRoomCode('');
    setIsHost(false);
    setSnapshot(null);
    setIsConnected(false);
    setPlayers([]);
    setTeams([]);
    snapshotRef.current = null;
    isHostRef.current = false;
    playersRef.current = [];
    teamsRef.current = [];

    // 4. Remove join / mode query parameters from URL so refreshes don't auto-rejoin
    if (typeof window !== 'undefined' && window.location.search) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // 5. Fresh transport instance for future sessions
    initOrSwitchTransport('auto');
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

    const participating = getParticipatingPlayers(players, game.meta);
    const initialGameState = game.setup(config, participating, teams, game.content);
    const firstPhase = game.phases[0];
    const durationSec = firstPhase.durationSeconds;
    const endTimestamp = firstPhase.hasTimer && durationSec ? Date.now() + durationSec * 1000 : undefined;

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
        phaseTimeRemaining: durationSec,
        phaseDuration: durationSec,
        phaseEndTimestamp: endTimestamp,
        roundNumber: 1,
        totalRounds: config.roundsCount || 4,
        isGameOver: false,
      },
    };

    soundManager.playChime(soundEnabled);
    broadcastSnapshot(newSnapshot, true);
  };

  const hostEndGame = () => {
    if (!isHost || !snapshot) return;
    const game = gameRegistry.get(snapshot.gameId);
    broadcastSnapshot({
      ...snapshot,
      version: snapshot.version + 1,
      status: 'final_leaderboard',
      gameState: {
        ...snapshot.gameState,
        isGameOver: true,
      },
    });

    const participating = getParticipatingPlayers(snapshot.players, game?.meta);
    recordGameResult(
      snapshot.gameId,
      game?.meta?.name || 'Fellowship Game',
      snapshot.roomCode,
      snapshot.config.connectionMode || 'online',
      snapshot.gameState.totalRounds || snapshot.config.roundsCount || 4,
      participating,
      snapshot.teams
    );
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
