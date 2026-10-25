import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { getApps, initializeApp, FirebaseApp } from 'firebase/app';
import { getDatabase, ref, get, set, update, Database } from 'firebase/database';
import { UserProfile, UserStats, AuthContextType } from './types';

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY_PROFILE = 'faith_tribe_user_profile';
const STORAGE_KEY_OFFLINE_USERS = 'faith_tribe_offline_users';

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

function getApp(): FirebaseApp | null {
  const cfg = getFirebaseConfig();
  if (!cfg.apiKey || !cfg.projectId) return null;
  if (getApps().length === 0) {
    return initializeApp(cfg);
  }
  return getApps()[0];
}

function getAuthInstance() {
  const app = getApp();
  if (!app) return null;
  try {
    return getAuth(app);
  } catch {
    return null;
  }
}

function getDbInstance(): Database | null {
  const app = getApp();
  if (!app) return null;
  try {
    return getDatabase(app);
  } catch {
    return null;
  }
}

function cleanUsername(raw: string): string {
  return raw.replace(/^@/, '').trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(STORAGE_KEY_PROFILE);
        if (cached) return JSON.parse(cached);
      } catch {
        // ignore
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);

  // Sync to local storage
  const saveProfileLocally = (profile: UserProfile | null) => {
    setUser(profile);
    if (typeof window !== 'undefined') {
      if (profile) {
        localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
        localStorage.setItem('faith_tribe_player_name', profile.displayName);
        sessionStorage.setItem('faith_tribe_player_id', profile.uid);

        // Also store in offline user registry for local search
        try {
          const offlineUsersStr = localStorage.getItem(STORAGE_KEY_OFFLINE_USERS) || '{}';
          const offlineUsers = JSON.parse(offlineUsersStr);
          offlineUsers[cleanUsername(profile.username)] = profile;
          localStorage.setItem(STORAGE_KEY_OFFLINE_USERS, JSON.stringify(offlineUsers));
        } catch {
          // ignore
        }
      } else {
        localStorage.removeItem(STORAGE_KEY_PROFILE);
      }
    }
  };

  // Fetch or create profile from database
  const syncProfileFromDb = useCallback(async (fbUser: FirebaseUser): Promise<UserProfile> => {
    const db = getDbInstance();
    const fallbackUsername = cleanUsername(fbUser.email?.split('@')[0] || 'disciple_' + fbUser.uid.substring(0, 5));
    const fallbackDisplayName = fbUser.displayName || fbUser.email?.split('@')[0] || 'Disciple';

    if (!db) {
      // Local fallback profile
      const localProfile: UserProfile = {
        uid: fbUser.uid,
        email: fbUser.email || undefined,
        username: fallbackUsername,
        displayName: fallbackDisplayName,
        avatarSeed: fbUser.uid,
        biblicalTribeId: 'judah',
        createdAt: Date.now(),
        stats: {
          gamesPlayed: 0,
          victories: 0,
          totalScore: 0,
          highestScore: 0,
        },
      };
      saveProfileLocally(localProfile);
      return localProfile;
    }

    try {
      const userRef = ref(db, `users/${fbUser.uid}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const data = snapshot.val() as UserProfile;
        saveProfileLocally(data);
        return data;
      } else {
        // Create initial profile in database
        const newProfile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email || undefined,
          username: fallbackUsername,
          displayName: fallbackDisplayName,
          avatarSeed: fbUser.uid,
          biblicalTribeId: 'judah',
          createdAt: Date.now(),
          stats: {
            gamesPlayed: 0,
            victories: 0,
            totalScore: 0,
            highestScore: 0,
          },
        };

        await set(userRef, newProfile);
        // Index username
        const usernameRef = ref(db, `usernames/${fallbackUsername}`);
        await set(usernameRef, {
          uid: fbUser.uid,
          username: fallbackUsername,
          displayName: fallbackDisplayName,
          avatarSeed: fbUser.uid,
          biblicalTribeId: 'judah',
        });

        saveProfileLocally(newProfile);
        return newProfile;
      }
    } catch (err) {
      console.warn('[AuthContext] Could not fetch remote profile, using local cache:', err);
      setIsOfflineMode(true);
      const cached = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (cached) {
        return JSON.parse(cached);
      }
      const localProfile: UserProfile = {
        uid: fbUser.uid,
        email: fbUser.email || undefined,
        username: fallbackUsername,
        displayName: fallbackDisplayName,
        avatarSeed: fbUser.uid,
        biblicalTribeId: 'judah',
        createdAt: Date.now(),
        stats: {
          gamesPlayed: 0,
          victories: 0,
          totalScore: 0,
          highestScore: 0,
        },
      };
      saveProfileLocally(localProfile);
      return localProfile;
    }
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const auth = getAuthInstance();
    if (!auth) {
      setIsLoading(false);
      setIsOfflineMode(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setIsLoading(true);
      if (fbUser) {
        try {
          await syncProfileFromDb(fbUser);
        } catch {
          // Keep cached
        }
      } else {
        // Do not clear user if offline mode is explicitly kept, else clear
        if (navigator.onLine) {
          saveProfileLocally(null);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [syncProfileFromDb]);

  // Sign In with Email
  const signInWithEmail = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const auth = getAuthInstance();
      if (!auth) throw new Error('Authentication is unavailable offline');
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      await syncProfileFromDb(cred.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to sign in' };
    }
  };

  // Sign Up with Email
  const signUpWithEmail = async (
    email: string,
    pass: string,
    rawUsername: string,
    displayName: string,
    biblicalTribeId: string = 'judah'
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const cleanUser = cleanUsername(rawUsername);
      if (!cleanUser || cleanUser.length < 3) {
        return { success: false, error: 'Username must be at least 3 alphanumeric characters' };
      }

      const auth = getAuthInstance();
      const db = getDbInstance();
      if (!auth) throw new Error('Authentication service unavailable');

      // Check if username is already taken if database is available
      if (db) {
        try {
          const usernameSnap = await get(ref(db, `usernames/${cleanUser}`));
          if (usernameSnap.exists()) {
            return { success: false, error: `Username @${cleanUser} is already taken. Please choose another.` };
          }
        } catch {
          // ignore network check error and proceed
        }
      }

      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      const uid = cred.user.uid;

      const profile: UserProfile = {
        uid,
        email: email.trim(),
        username: cleanUser,
        displayName: displayName.trim() || cleanUser,
        avatarSeed: uid,
        biblicalTribeId,
        createdAt: Date.now(),
        stats: {
          gamesPlayed: 0,
          victories: 0,
          totalScore: 0,
          highestScore: 0,
        },
      };

      if (db) {
        await set(ref(db, `users/${uid}`), profile);
        await set(ref(db, `usernames/${cleanUser}`), {
          uid,
          username: cleanUser,
          displayName: profile.displayName,
          avatarSeed: uid,
          biblicalTribeId,
        });
      }

      saveProfileLocally(profile);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to create account' };
    }
  };

  // Sign In with Google
  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const auth = getAuthInstance();
      if (!auth) throw new Error('Authentication service unavailable');
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      await syncProfileFromDb(cred.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Google sign in was cancelled or failed' };
    }
  };

  // Sign Out
  const signOut = async () => {
    try {
      const auth = getAuthInstance();
      if (auth) {
        await fbSignOut(auth);
      }
    } finally {
      saveProfileLocally(null);
    }
  };

  // Update Profile
  const updateProfile = async (patch: Partial<UserProfile>): Promise<boolean> => {
    if (!user) return false;
    const updated = { ...user, ...patch };
    saveProfileLocally(updated);

    const db = getDbInstance();
    if (db) {
      try {
        await update(ref(db, `users/${user.uid}`), patch);
        if (patch.username || patch.displayName || patch.biblicalTribeId) {
          await update(ref(db, `usernames/${cleanUsername(updated.username)}`), {
            displayName: updated.displayName,
            avatarSeed: updated.avatarSeed,
            biblicalTribeId: updated.biblicalTribeId,
          });
        }
      } catch (err) {
        console.warn('[AuthContext] Remote profile update failed:', err);
      }
    }
    return true;
  };

  // Record Game Stats
  const recordGameStats = async (gameId: string, score: number, isWinner: boolean) => {
    if (!user) return;
    const currentStats: UserStats = user.stats || {
      gamesPlayed: 0,
      victories: 0,
      totalScore: 0,
      highestScore: 0,
    };

    const newStats: UserStats = {
      gamesPlayed: currentStats.gamesPlayed + 1,
      victories: currentStats.victories + (isWinner ? 1 : 0),
      totalScore: currentStats.totalScore + score,
      highestScore: Math.max(currentStats.highestScore, score),
      favoriteGame: gameId,
      lastPlayedAt: Date.now(),
    };

    await updateProfile({ stats: newStats });
  };

  // Search User by Username
  const searchUserByUsername = async (rawUsername: string): Promise<UserProfile | null> => {
    const clean = cleanUsername(rawUsername);
    if (!clean) return null;

    // Check offline / local cache first
    try {
      const offlineUsersStr = localStorage.getItem(STORAGE_KEY_OFFLINE_USERS);
      if (offlineUsersStr) {
        const offlineUsers = JSON.parse(offlineUsersStr);
        if (offlineUsers[clean]) {
          return offlineUsers[clean];
        }
      }
    } catch {
      // ignore
    }

    // Remote database search
    const db = getDbInstance();
    if (db) {
      try {
        const snap = await get(ref(db, `usernames/${clean}`));
        if (snap.exists()) {
          const indexRecord = snap.val();
          const userSnap = await get(ref(db, `users/${indexRecord.uid}`));
          if (userSnap.exists()) {
            return userSnap.val() as UserProfile;
          }
          // Return synthetic profile from index record
          return {
            uid: indexRecord.uid,
            username: indexRecord.username,
            displayName: indexRecord.displayName,
            avatarSeed: indexRecord.avatarSeed || indexRecord.uid,
            biblicalTribeId: indexRecord.biblicalTribeId || 'judah',
            createdAt: Date.now(),
            stats: { gamesPlayed: 0, victories: 0, totalScore: 0, highestScore: 0 },
          };
        }
      } catch (err) {
        console.warn('[AuthContext] Remote user search failed:', err);
      }
    }
    return null;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isOfflineMode,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    updateProfile,
    recordGameStats,
    searchUserByUsername,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
