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
  tribeId?: string;
  tribeName?: string;
  connectionMode: 'online' | 'onsite';
  finishedAt: number;
  totalRounds: number;
  players: {
    id: string;
    name: string;
    score: number;
    teamId?: string;
    authUid?: string;
    username?: string;
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
 * Saves a completed game session result to Firebase Realtime Database and per-user registries.
 */
export async function recordGameResult(
  gameId: string,
  gameName: string,
  roomCode: string,
  connectionMode: 'online' | 'onsite',
  totalRounds: number,
  players: Player[],
  teams: Team[],
  tribeId?: string,
  tribeName?: string
): Promise<string | null> {
  try {
    const db = getDatabaseInstance();
    const safePlayers = Array.isArray(players) ? players : [];
    const safeTeams = Array.isArray(teams) ? teams : [];

    // Find highest score
    const highestPlayerScore = Math.max(...safePlayers.map((p) => p.score || 0), 0);
    const highestTeamScore = Math.max(...safeTeams.map((t) => t.score || 0), 0);

    const record: Omit<GameResultRecord, 'id'> = {
      gameId,
      gameName,
      roomCode,
      tribeId,
      tribeName,
      connectionMode,
      finishedAt: Date.now(),
      totalRounds,
      players: safePlayers.map((p) => ({
        id: p.id,
        name: p.name,
        score: p.score || 0,
        teamId: p.teamId,
        authUid: p.authUid,
        username: p.username,
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

    let resultKey: string | null = null;

    if (db) {
      try {
        const resultsRef = ref(db, 'game_results');
        const newRecordRef = push(resultsRef);
        await set(newRecordRef, deepCleanForFirebase(record));
        resultKey = newRecordRef.key;

        // Also record to each authenticated player's personal partition
        for (const p of safePlayers) {
          if (p.authUid) {
            try {
              await set(ref(db, `user_results/${p.authUid}/${resultKey}`), deepCleanForFirebase(record));
            } catch {
              // ignore partition failure
            }
          }
        }
      } catch (err) {
        console.warn('[GameDataService] Remote record save failed, saving locally:', err);
      }
    }

    // Save to local user history for each player on this device
    if (typeof window !== 'undefined') {
      try {
        for (const p of safePlayers) {
          const userKey = p.authUid || p.id;
          if (!userKey) continue;
          const storageKey = `faith_tribe_user_matches_${userKey}`;
          const raw = localStorage.getItem(storageKey);
          const history: GameResultRecord[] = raw ? JSON.parse(raw) : [];
          history.unshift({ id: resultKey || 'local_' + Date.now(), ...record });
          localStorage.setItem(storageKey, JSON.stringify(history.slice(0, 30)));
        }
      } catch {
        // ignore
      }
    }

    return resultKey;
  } catch (err) {
    console.warn('[GameDataService] Could not record game result:', err);
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

export function getEmptyFellowshipStats(): FellowshipStats {
  return {
    gamesPlayedThisMonth: 0,
    totalGamesPlayed: 0,
    winsCount: 0,
    victoryRate: 0,
    favoritePick: 'None Yet',
    weeklyActivity: [
      { day: 'M', height: 8, count: 0 },
      { day: 'T', height: 8, count: 0 },
      { day: 'W', height: 8, count: 0 },
      { day: 'T', height: 8, count: 0 },
      { day: 'F', height: 8, count: 0 },
      { day: 'S', height: 8, count: 0 },
      { day: 'S', height: 8, count: 0 },
    ],
    recentlyGathered: [],
    activeCount: 0,
    hasRealData: false,
    isLoading: false,
  };
}

export function getCachedFellowshipStats(userId?: string): FellowshipStats | null {
  if (typeof window === 'undefined') return null;
  try {
    const key = `faith_tribe_stats_${userId || 'guest'}`;
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore parse error
  }
  return null;
}

export function saveCachedFellowshipStats(stats: FellowshipStats, userId?: string) {
  if (typeof window === 'undefined') return;
  try {
    const key = `faith_tribe_stats_${userId || 'guest'}`;
    localStorage.setItem(key, JSON.stringify(stats));
  } catch {
    // Ignore storage quota
  }
}

/**
 * Calculates user-specific activity stats and gathers disciples exclusively
 * from sessions the user participated in or their own fellowship tribe.
 * No user can see or access the match stats, history, or activities of another user.
 */
export async function fetchFellowshipStats(
  currentUserId?: string,
  currentUserName?: string,
  userTribeIds: string[] = [],
  fellowTribeMembers: Array<{ id: string; name: string; avatarSeed?: string }> = []
): Promise<FellowshipStats> {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 is Sun, 1 is Mon...
  const distanceToMonday = (dayOfWeek + 6) % 7;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - distanceToMonday, 0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0).getTime();

  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];

  const db = getDatabaseInstance();
  let userMatches: GameResultRecord[] = [];
  const lowerUserName = currentUserName?.trim().toLowerCase();

  // 1. Check local storage for user's personal matches first (fast and offline-ready)
  if (typeof window !== 'undefined') {
    const userKey = currentUserId || 'guest';
    const storageKey = `faith_tribe_user_matches_${userKey}`;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        userMatches = JSON.parse(raw);
      }
    } catch {
      // ignore
    }
  }

  // 2. Fetch authenticated user's remote match records if online
  if (db && typeof window !== 'undefined' && navigator.onLine) {
    if (currentUserId) {
      try {
        const userResultsQuery = query(ref(db, `user_results/${currentUserId}`), orderByKey(), limitToLast(50));
        const snap = await get(userResultsQuery);
        if (snap.exists()) {
          const remoteRecords: GameResultRecord[] = [];
          snap.forEach((child) => {
            remoteRecords.unshift({
              id: child.key || '',
              ...child.val(),
            });
          });
          if (remoteRecords.length > 0) {
            userMatches = remoteRecords;
          }
        }
      } catch {
        // user_results query error fallback
      }
    }

    // If no direct user_results partition yet, query general game_results but STRICTLY filter for this user
    if (userMatches.length === 0) {
      try {
        const resultsQuery = query(ref(db, 'game_results'), orderByKey(), limitToLast(60));
        const snapshot = await get(resultsQuery);
        if (snapshot.exists()) {
          snapshot.forEach((child) => {
            const val = child.val() as GameResultRecord;
            if (!val || !Array.isArray(val.players)) return;

            // Strict authorization check: Only include if current user was in this game or if it was their Tribe game
            const isUserInMatch = val.players.some((p) => {
              if (currentUserId && (p.id === currentUserId || (p as any).authUid === currentUserId)) {
                return true;
              }
              if (lowerUserName && p.name && p.name.trim().toLowerCase() === lowerUserName) {
                return true;
              }
              return false;
            });

            const isUserTribeMatch = Boolean(
              val.tribeId && userTribeIds.length > 0 && userTribeIds.includes(val.tribeId)
            );

            if (isUserInMatch || isUserTribeMatch) {
              userMatches.push({
                id: child.key || '',
                ...val,
              });
            }
          });
        }
      } catch (err) {
        console.warn('[GameDataService] Error querying user match results:', err);
      }
    }
  }

  // If user has not played any games yet, return a clean empty personal state
  if (userMatches.length === 0) {
    // Only display verified fellow members from user's own Tribe in "recently gathered"
    const tribeGathered = fellowTribeMembers
      .filter((m) => !lowerUserName || m.name.trim().toLowerCase() !== lowerUserName)
      .slice(0, 10);

    const emptyStats: FellowshipStats = {
      gamesPlayedThisMonth: 0,
      totalGamesPlayed: 0,
      winsCount: 0,
      victoryRate: 0,
      favoritePick: 'None Yet',
      weeklyActivity: dayLabels.map((day) => ({ day, height: 8, count: 0 })),
      recentlyGathered: tribeGathered,
      activeCount: tribeGathered.length,
      hasRealData: tribeGathered.length > 0,
      isLoading: false,
    };

    saveCachedFellowshipStats(emptyStats, currentUserId);
    return emptyStats;
  }

  // Games this month for THIS user only
  const gamesThisMonth = userMatches.filter((r) => r.finishedAt >= startOfMonth);
  const gamesPlayedThisMonth = gamesThisMonth.length;

  // Day distribution for THIS user's games this week
  for (const record of userMatches) {
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

  // Wins and victory rate strictly for THIS user
  let winsCount = 0;
  let userGamesCount = 0;

  for (const record of userMatches) {
    if (Array.isArray(record.players)) {
      const matched = record.players.find(
        (p) =>
          (currentUserId && (p.id === currentUserId || (p as any).authUid === currentUserId)) ||
          (lowerUserName && p.name && p.name.trim().toLowerCase() === lowerUserName)
      );
      if (matched) {
        userGamesCount++;
        if (matched.isWinner) winsCount++;
      }
    }
  }

  const victoryRate = userGamesCount > 0 ? Math.round((winsCount / userGamesCount) * 100) : 0;

  // Favorite game of THIS user
  const gameFrequency: Record<string, number> = {};
  for (const record of userMatches) {
    const name = record.gameName || record.gameId;
    gameFrequency[name] = (gameFrequency[name] || 0) + 1;
  }

  let favoritePick = 'None Yet';
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

  // Recently Gathered: ONLY co-players who played in the same game with this user, plus user's tribe members
  const recentDisciplesMap = new Map<string, { id: string; name: string; avatarSeed?: string; lastSeen: number }>();

  for (const record of userMatches) {
    if (Array.isArray(record.players)) {
      for (const p of record.players) {
        if (!p || !p.name || !p.name.trim()) continue;
        const key = p.name.trim().toLowerCase();
        // Do not include the current user themselves
        if (lowerUserName && key === lowerUserName) continue;
        if (currentUserId && (p.id === currentUserId || (p as any).authUid === currentUserId)) continue;

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

  // Include fellow tribe members
  for (const m of fellowTribeMembers) {
    if (!m || !m.name) continue;
    const key = m.name.trim().toLowerCase();
    if (lowerUserName && key === lowerUserName) continue;
    if (!recentDisciplesMap.has(key)) {
      recentDisciplesMap.set(key, {
        id: m.id || m.name,
        name: m.name,
        avatarSeed: m.avatarSeed || m.name,
        lastSeen: Date.now(),
      });
    }
  }

  const recentlyGathered = Array.from(recentDisciplesMap.values())
    .sort((a, b) => b.lastSeen - a.lastSeen)
    .slice(0, 10)
    .map(({ id, name, avatarSeed }) => ({ id, name, avatarSeed }));

  const activeCount = recentlyGathered.length;

  const stats: FellowshipStats = {
    gamesPlayedThisMonth,
    totalGamesPlayed: userMatches.length,
    winsCount,
    victoryRate,
    favoritePick,
    weeklyActivity,
    recentlyGathered,
    activeCount,
    hasRealData: userMatches.length > 0 || recentlyGathered.length > 0,
    isLoading: false,
  };

  saveCachedFellowshipStats(stats, currentUserId);
  return stats;
}
