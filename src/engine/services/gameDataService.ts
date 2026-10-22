/**
 * Game Data Service
 *
 * Persists and retrieves game content (questions, scriptures, proverbs, items)
 * and match results (completed sessions, leaderboards) from the Firebase Realtime Database.
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getDatabase, ref, get, set, push, query, limitToLast, orderByKey, Database } from 'firebase/database';
import { gameRegistry } from '../registry';
import { Player, Team } from '../types';
import proverbsData from '../../games/fake-a-proverb/content.json';
import taresData from '../../games/tares-among-the-wheat/content.json';
import hotCoalData from '../../games/hot-coal/content.json';
import { allWhoSaidItems, allTestamentSortItems } from '../content/loader';
import { deepCleanForFirebase } from '../transport/firebaseTransport';

export interface GameResultRecord {
  id?: string;
  gameId: string;
  gameName: string;
  roomCode: string;
  connectionMode: 'online' | 'onsite';
  finishedAt: number;
  totalRounds: number;
  players: {
    id: string;
    name: string;
    score: number;
    teamId?: string;
    isWinner: boolean;
  }[];
  teams?: {
    id: string;
    name: string;
    color: string;
    score: number;
    isWinner: boolean;
  }[];
}

function getFirebaseConfig() {
  return {
    apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || '',
    databaseURL: import.meta.env?.VITE_FIREBASE_DATABASE_URL || '',
    projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env?.VITE_FIREBASE_APP_ID || '',
  };
}

function getDatabaseInstance(): Database | null {
  const cfg = getFirebaseConfig();
  if (!cfg.apiKey || !cfg.databaseURL || !cfg.projectId) {
    return null;
  }
  let app: FirebaseApp;
  if (getApps().length === 0) {
    app = initializeApp(cfg);
  } else {
    app = getApps()[0];
  }
  return getDatabase(app);
}

/**
 * Fetches game content for a specific game from Firebase Realtime Database.
 * Updates the game in gameRegistry and caches locally in localStorage.
 */
export async function syncGameContentFromDatabase<T = any>(
  gameId: string,
  fallbackContent?: T
): Promise<T> {
  const cacheKey = `faith_tribe_content_${gameId}`;

  try {
    const db = getDatabaseInstance();
    if (db && typeof window !== 'undefined' && navigator.onLine) {
      const contentRef = ref(db, `content/${gameId}`);
      const snapshot = await get(contentRef);

      if (snapshot.exists()) {
        const dbContent = snapshot.val() as T;
        // Update game registry in memory
        gameRegistry.updateContent(gameId, dbContent);
        // Cache to localStorage
        try {
          localStorage.setItem(cacheKey, JSON.stringify(dbContent));
        } catch {
          // LocalStorage quota or unavailable, ignore
        }
        return dbContent;
      }
    }
  } catch (err) {
    console.warn(`[GameDataService] Could not sync content from database for ${gameId}:`, err);
  }

  // Fallback 1: Local cache
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as T;
        gameRegistry.updateContent(gameId, parsed);
        return parsed;
      }
    } catch {
      // Ignore parse failure
    }
  }

  // Fallback 2: Default seed from registry / plugin
  const plugin = gameRegistry.get(gameId);
  return (fallbackContent || plugin?.content) as T;
}

/**
 * Syncs all registered games' content from the database.
 */
export async function syncAllGamesContent(): Promise<void> {
  const games = gameRegistry.getAll();
  await Promise.allSettled(
    games.map((g) => syncGameContentFromDatabase(g.meta.id, g.content))
  );
}

/**
 * Saves or updates content for a game directly to Firebase Realtime Database.
 */
export async function saveGameContentToDatabase(gameId: string, content: any): Promise<boolean> {
  try {
    const db = getDatabaseInstance();
    if (!db) {
      throw new Error('Firebase Database is not configured');
    }
    const contentRef = ref(db, `content/${gameId}`);
    const cleanContent = deepCleanForFirebase(content);
    await set(contentRef, cleanContent);
    gameRegistry.updateContent(gameId, cleanContent);
    return true;
  } catch (err) {
    console.error(`[GameDataService] Failed to save content for ${gameId}:`, err);
    return false;
  }
}

/**
 * Saves a completed game session result to Firebase Realtime Database.
 */
export async function recordGameResult(
  gameId: string,
  gameName: string,
  roomCode: string,
  connectionMode: 'online' | 'onsite',
  totalRounds: number,
  players: Player[],
  teams: Team[]
): Promise<string | null> {
  try {
    const db = getDatabaseInstance();
    if (!db) return null;

    const safePlayers = Array.isArray(players) ? players : [];
    const safeTeams = Array.isArray(teams) ? teams : [];

    // Find highest score
    const highestPlayerScore = Math.max(...safePlayers.map((p) => p.score || 0), 0);
    const highestTeamScore = Math.max(...safeTeams.map((t) => t.score || 0), 0);

    const record: Omit<GameResultRecord, 'id'> = {
      gameId,
      gameName,
      roomCode,
      connectionMode,
      finishedAt: Date.now(),
      totalRounds,
      players: safePlayers.map((p) => ({
        id: p.id,
        name: p.name,
        score: p.score || 0,
        teamId: p.teamId,
        isWinner: p.score === highestPlayerScore && highestPlayerScore > 0,
      })),
      teams:
        safeTeams.length > 0
          ? safeTeams.map((t) => ({
              id: t.id,
              name: t.name,
              color: t.color,
              score: t.score || 0,
              isWinner: t.score === highestTeamScore && highestTeamScore > 0,
            }))
          : undefined,
    };

    const resultsRef = ref(db, 'game_results');
    const newRecordRef = push(resultsRef);
    await set(newRecordRef, deepCleanForFirebase(record));
    return newRecordRef.key;
  } catch (err) {
    console.warn('[GameDataService] Could not record game result to database:', err);
    return null;
  }
}

/**
 * Fetches recent game results from Firebase Realtime Database.
 */
export async function fetchRecentGameResults(limit: number = 10): Promise<GameResultRecord[]> {
  try {
    const db = getDatabaseInstance();
    if (!db) return [];

    const resultsQuery = query(ref(db, 'game_results'), orderByKey(), limitToLast(limit));
    const snapshot = await get(resultsQuery);

    if (snapshot.exists()) {
      const records: GameResultRecord[] = [];
      snapshot.forEach((child) => {
        records.unshift({
          id: child.key || '',
          ...child.val(),
        });
      });
      return records;
    }
    return [];
  } catch (err) {
    console.warn('[GameDataService] Could not fetch game results:', err);
    return [];
  }
}

/**
 * Seeds all 5 games' complete question and content datasets to Firebase Realtime Database at content/{gameId}
 */
export async function seedAllGamesToDatabase(): Promise<{
  success: boolean;
  seededCount: number;
  message: string;
}> {
  try {
    const db = getDatabaseInstance();
    if (!db) {
      return {
        success: false,
        seededCount: 0,
        message: 'Firebase database instance could not be initialized. Check .env config.',
      };
    }

    const payload: Record<string, any> = {
      'who-said': allWhoSaidItems,
      'testament-sort': allTestamentSortItems,
      'fake-a-proverb': proverbsData,
      'hot-coal': hotCoalData,
      'tares-among-the-wheat': taresData,
    };

    for (const [gameId, content] of Object.entries(payload)) {
      const contentRef = ref(db, `content/${gameId}`);
      const cleanContent = deepCleanForFirebase(content);
      await set(contentRef, cleanContent);
      gameRegistry.updateContent(gameId, cleanContent);
    }

    return {
      success: true,
      seededCount: 5,
      message: 'Successfully seeded all 5 games into Firebase Realtime Database!',
    };
  } catch (err: any) {
    const errorStr = String(err?.message || err);
    const isPermission = errorStr.includes('PERMISSION_DENIED') || err?.code === 'PERMISSION_DENIED';
    const message = isPermission
      ? 'PERMISSION_DENIED: Firebase Database rules are currently locked. In Firebase Console, click the "Rules" tab next to "Data", set ".read": true, ".write": true, then click "Publish".'
      : `Failed to seed database: ${errorStr}`;
    return { success: false, seededCount: 0, message };
  }
}

export interface FellowshipStats {
  gamesPlayedThisMonth: number;
  totalGamesPlayed: number;
  winsCount: number;
  victoryRate: number;
  favoritePick: string;
  weeklyActivity: { day: string; height: number; count: number }[];
  recentlyGathered: { id: string; name: string; avatarSeed?: string }[];
  activeCount: number;
  hasRealData: boolean;
  isLoading: boolean;
}

const STATS_STORAGE_KEY = 'faith_tribe_fellowship_stats';

export function getCachedFellowshipStats(): FellowshipStats | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STATS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore parse error
  }
  return null;
}

/**
 * Calculates fellowship activity stats from real Firebase game results and active rooms presence.
 */
export async function fetchFellowshipStats(
  currentUserId?: string,
  currentUserName?: string
): Promise<FellowshipStats> {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 is Sun, 1 is Mon...
  const distanceToMonday = (dayOfWeek + 6) % 7;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - distanceToMonday, 0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0).getTime();

  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];

  const db = getDatabaseInstance();
  let results: GameResultRecord[] = [];
  const activeUsersMap = new Map<string, { id: string; name: string; avatarSeed?: string }>();

  if (db && typeof window !== 'undefined' && navigator.onLine) {
    try {
      // 1. Fetch real match records
      const resultsQuery = query(ref(db, 'game_results'), orderByKey(), limitToLast(60));
      const snapshot = await get(resultsQuery);
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          results.unshift({
            id: child.key || '',
            ...child.val(),
          });
        });
      }
    } catch (err) {
      console.warn('[GameDataService] Error fetching game_results for fellowship stats:', err);
    }

    try {
      // 2. Fetch live presence across active rooms
      const roomsRef = ref(db, 'rooms');
      const roomsSnap = await get(roomsRef);
      if (roomsSnap.exists()) {
        const roomsData = roomsSnap.val() as Record<string, any>;
        for (const room of Object.values(roomsData)) {
          if (room && room.presence && typeof room.presence === 'object') {
            for (const u of Object.values(room.presence) as any[]) {
              if (u && u.name) {
                const key = String(u.name).trim().toLowerCase();
                activeUsersMap.set(key, {
                  id: u.id || u.name,
                  name: String(u.name).trim(),
                  avatarSeed: u.avatarSeed || u.name,
                });
              }
            }
          }
        }
      }
    } catch {
      // Optional: ignore if rooms list restricted
    }
  }

  const hasRealData = results.length > 0 || activeUsersMap.size > 0;

  // Games this month
  const gamesThisMonth = results.filter((r) => r.finishedAt >= startOfMonth);
  const gamesPlayedThisMonth = gamesThisMonth.length;

  // Day distribution
  for (const record of results) {
    if (record.finishedAt >= monday.getTime()) {
      const gDate = new Date(record.finishedAt);
      const gDay = (gDate.getDay() + 6) % 7;
      if (gDay >= 0 && gDay < 7) {
        dayCounts[gDay] += 1;
      }
    }
  }

  const maxDayCount = Math.max(...dayCounts, 0);
  const weeklyActivity = dayLabels.map((day, idx) => {
    const count = dayCounts[idx];
    let height = 8;
    if (maxDayCount > 0 && count > 0) {
      height = Math.max(25, Math.round((count / maxDayCount) * 100));
    }
    return { day, height, count };
  });

  // Wins and victory rate
  let winsCount = 0;
  let userGamesCount = 0;
  const lowerUserName = currentUserName?.trim().toLowerCase();

  for (const record of results) {
    if (Array.isArray(record.players)) {
      const matched = record.players.find(
        (p) =>
          (currentUserId && p.id === currentUserId) ||
          (lowerUserName && p.name && p.name.trim().toLowerCase() === lowerUserName)
      );
      if (matched) {
        userGamesCount++;
        if (matched.isWinner) winsCount++;
      }
    }
  }

  let victoryRate = 0;
  if (userGamesCount > 0) {
    victoryRate = Math.round((winsCount / userGamesCount) * 100);
  } else if (results.length > 0) {
    const totalWinners = results.reduce(
      (acc, r) => acc + (r.players?.filter((p) => p.isWinner).length || 0),
      0
    );
    winsCount = totalWinners;
    victoryRate = Math.min(100, Math.round((totalWinners / results.length) * 100));
  }

  // Favorite game
  const gameFrequency: Record<string, number> = {};
  for (const record of results) {
    const name = record.gameName || record.gameId;
    gameFrequency[name] = (gameFrequency[name] || 0) + 1;
  }

  let favoritePick = 'Proverbs';
  let highestFreq = 0;
  for (const [name, freq] of Object.entries(gameFrequency)) {
    if (freq > highestFreq) {
      highestFreq = freq;
      if (name.toLowerCase().includes('proverb')) favoritePick = 'Proverbs';
      else if (name.toLowerCase().includes('said')) favoritePick = 'Who Said';
      else if (name.toLowerCase().includes('sort')) favoritePick = 'Testament';
      else if (name.toLowerCase().includes('coal')) favoritePick = 'Hot Coal';
      else if (name.toLowerCase().includes('tare')) favoritePick = 'Tares';
      else favoritePick = name;
    }
  }

  // Recently Gathered disciples
  const recentDisciplesMap = new Map<string, { id: string; name: string; avatarSeed?: string; lastSeen: number }>();

  for (const record of results) {
    if (Array.isArray(record.players)) {
      for (const p of record.players) {
        if (p && p.name && p.name.trim()) {
          const key = p.name.trim().toLowerCase();
          if (!recentDisciplesMap.has(key)) {
            recentDisciplesMap.set(key, {
              id: p.id || p.name,
              name: p.name.trim(),
              avatarSeed: p.name.trim(),
              lastSeen: record.finishedAt || 0,
            });
          }
        }
      }
    }
  }

  for (const [key, activeUser] of activeUsersMap.entries()) {
    recentDisciplesMap.set(key, {
      ...activeUser,
      lastSeen: Date.now(),
    });
  }

  if (currentUserName && currentUserName.trim() && currentUserName !== 'Player') {
    const userKey = currentUserName.trim().toLowerCase();
    if (!recentDisciplesMap.has(userKey)) {
      recentDisciplesMap.set(userKey, {
        id: currentUserId || userKey,
        name: currentUserName.trim(),
        avatarSeed: currentUserName.trim(),
        lastSeen: Date.now(),
      });
    }
  }

  const recentlyGathered = Array.from(recentDisciplesMap.values())
    .sort((a, b) => b.lastSeen - a.lastSeen)
    .slice(0, 10)
    .map(({ id, name, avatarSeed }) => ({ id, name, avatarSeed }));

  const activeCount = Math.max(activeUsersMap.size, recentlyGathered.length);

  const stats: FellowshipStats = {
    gamesPlayedThisMonth,
    totalGamesPlayed: results.length,
    winsCount,
    victoryRate,
    favoritePick,
    weeklyActivity,
    recentlyGathered,
    activeCount,
    hasRealData,
    isLoading: false,
  };

  try {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Ignore storage quota
  }

  return stats;
}
