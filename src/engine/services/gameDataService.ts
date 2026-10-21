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
    await set(contentRef, content);
    gameRegistry.updateContent(gameId, content);
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

    // Find highest score
    const highestPlayerScore = Math.max(...players.map((p) => p.score || 0), 0);
    const highestTeamScore = Math.max(...teams.map((t) => t.score || 0), 0);

    const record: Omit<GameResultRecord, 'id'> = {
      gameId,
      gameName,
      roomCode,
      connectionMode,
      finishedAt: Date.now(),
      totalRounds,
      players: players.map((p) => ({
        id: p.id,
        name: p.name,
        score: p.score || 0,
        teamId: p.teamId,
        isWinner: p.score === highestPlayerScore && highestPlayerScore > 0,
      })),
      teams:
        teams.length > 0
          ? teams.map((t) => ({
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
    await set(newRecordRef, record);
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
      await set(contentRef, content);
      gameRegistry.updateContent(gameId, content);
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
