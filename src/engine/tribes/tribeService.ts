import { getApps, initializeApp, FirebaseApp } from 'firebase/app';
import { getDatabase, ref, get, set, update, remove, onValue, off, Database } from 'firebase/database';
import { Tribe, TribeMember, PendingRequest, ActiveTribeSession, InvitePolicy } from './types';
import { UserProfile } from '../auth/types';

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

function getDb(): Database | null {
  const cfg = getFirebaseConfig();
  if (!cfg.apiKey || !cfg.projectId) return null;
  let app: FirebaseApp;
  if (getApps().length === 0) {
    app = initializeApp(cfg);
  } else {
    app = getApps()[0];
  }
  try {
    return getDatabase(app);
  } catch {
    return null;
  }
}

const STORAGE_KEY_TRIBES = 'faith_tribe_tribes_cache';
const STORAGE_KEY_LOCAL_SESSION = 'faith_tribe_local_active_session';

function getCachedTribes(): Record<string, Tribe> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TRIBES);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCachedTribes(tribes: Record<string, Tribe>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_TRIBES, JSON.stringify(tribes));
  } catch {
    // ignore
  }
}

export function generateTribeInviteCode(name: string): string {
  const clean = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 6);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `TRB-${clean || 'TRIBE'}-${rand}`;
}

/**
 * Creates a new Tribe in Firebase Database and local cache
 */
export async function createTribeRecord(
  creator: UserProfile,
  name: string,
  tagline: string,
  biblicalTribeId: string = 'judah',
  invitePolicy: InvitePolicy = 'open'
): Promise<Tribe> {
  const tribeId = 'trb_' + Math.random().toString(36).substring(2, 9);
  const inviteCode = generateTribeInviteCode(name);

  const initialMember: TribeMember = {
    uid: creator.uid,
    username: creator.username,
    displayName: creator.displayName,
    avatarSeed: creator.avatarSeed,
    role: 'admin',
    joinedAt: Date.now(),
    stats: {
      gamesPlayed: creator.stats?.gamesPlayed || 0,
      victories: creator.stats?.victories || 0,
      totalScore: creator.stats?.totalScore || 0,
    },
  };

  const newTribe: Tribe = {
    id: tribeId,
    name: name.trim(),
    tagline: tagline.trim() || undefined,
    biblicalTribeId,
    creatorUid: creator.uid,
    adminUids: [creator.uid],
    inviteCode,
    invitePolicy,
    members: {
      [creator.uid]: initialMember,
    },
    pendingRequests: {},
    activeSession: null,
    createdAt: Date.now(),
  };

  // Cache locally
  const cached = getCachedTribes();
  cached[tribeId] = newTribe;
  saveCachedTribes(cached);

  // Sync to Firebase Realtime Database
  const db = getDb();
  if (db) {
    try {
      await set(ref(db, `tribes/${tribeId}`), newTribe);
      await set(ref(db, `user_tribes/${creator.uid}/${tribeId}`), true);
      await set(ref(db, `tribe_invites/${inviteCode}`), tribeId);
    } catch (err) {
      console.warn('[TribeService] Could not persist tribe remotely (working offline):', err);
    }
  }

  return newTribe;
}

/**
 * Fetches all tribes the user belongs to
 */
export async function fetchUserTribes(uid: string): Promise<Tribe[]> {
  const cached = getCachedTribes();
  const localList = Object.values(cached).filter((t) => t.members && t.members[uid]);

  const db = getDb();
  if (!db) return localList;

  try {
    const userTribesSnap = await get(ref(db, `user_tribes/${uid}`));
    if (!userTribesSnap.exists()) {
      return localList;
    }

    const tribeIds = Object.keys(userTribesSnap.val() || {});
    const fetchedTribes: Tribe[] = [];

    for (const tid of tribeIds) {
      const snap = await get(ref(db, `tribes/${tid}`));
      if (snap.exists()) {
        const trb = snap.val() as Tribe;
        fetchedTribes.push(trb);
        cached[tid] = trb;
      }
    }

    saveCachedTribes(cached);
    return fetchedTribes.length > 0 ? fetchedTribes : localList;
  } catch (err) {
    console.warn('[TribeService] fetchUserTribes failed, using cache:', err);
    return localList;
  }
}

/**
 * Add a registered member to a Tribe by their username
 */
export async function addMemberByUsernameToTribe(
  tribeId: string,
  targetUser: UserProfile
): Promise<boolean> {
  const newMember: TribeMember = {
    uid: targetUser.uid,
    username: targetUser.username,
    displayName: targetUser.displayName,
    avatarSeed: targetUser.avatarSeed,
    role: 'member',
    joinedAt: Date.now(),
    stats: {
      gamesPlayed: targetUser.stats?.gamesPlayed || 0,
      victories: targetUser.stats?.victories || 0,
      totalScore: targetUser.stats?.totalScore || 0,
    },
  };

  // Local cache update
  const cached = getCachedTribes();
  if (cached[tribeId]) {
    if (!cached[tribeId].members) cached[tribeId].members = {};
    cached[tribeId].members[targetUser.uid] = newMember;
    saveCachedTribes(cached);
  }

  const db = getDb();
  if (db) {
    try {
      await set(ref(db, `tribes/${tribeId}/members/${targetUser.uid}`), newMember);
      await set(ref(db, `user_tribes/${targetUser.uid}/${tribeId}`), true);
      return true;
    } catch (err) {
      console.warn('[TribeService] addMemberByUsername failed remotely:', err);
    }
  }

  return true;
}

/**
 * Join Tribe by Invite Code
 */
export async function joinTribeWithInviteCode(
  code: string,
  applicant: UserProfile
): Promise<{ success: boolean; status: 'joined' | 'pending'; tribe?: Tribe; error?: string }> {
  const cleanCode = code.trim().toUpperCase();
  const db = getDb();
  const cached = getCachedTribes();

  let targetTribeId: string | null = null;
  let targetTribe: Tribe | null = null;

  // Check cache first
  for (const t of Object.values(cached)) {
    if (t.inviteCode === cleanCode) {
      targetTribeId = t.id;
      targetTribe = t;
      break;
    }
  }

  // Look up in remote database
  if (db) {
    try {
      const inviteSnap = await get(ref(db, `tribe_invites/${cleanCode}`));
      if (inviteSnap.exists()) {
        targetTribeId = inviteSnap.val();
        const trbSnap = await get(ref(db, `tribes/${targetTribeId}`));
        if (trbSnap.exists()) {
          targetTribe = trbSnap.val() as Tribe;
        }
      }
    } catch (err) {
      console.warn('[TribeService] Remote invite lookup error:', err);
    }
  }

  if (!targetTribe || !targetTribeId) {
    return { success: false, status: 'pending', error: 'Invalid or expired Tribe invite code.' };
  }

  // Check if already a member
  if (targetTribe.members && targetTribe.members[applicant.uid]) {
    return { success: true, status: 'joined', tribe: targetTribe };
  }

  // If approval required, add to pending requests
  if (targetTribe.invitePolicy === 'approval_required') {
    const pending: PendingRequest = {
      uid: applicant.uid,
      username: applicant.username,
      displayName: applicant.displayName,
      avatarSeed: applicant.avatarSeed,
      requestedAt: Date.now(),
    };

    if (cached[targetTribeId]) {
      if (!cached[targetTribeId].pendingRequests) cached[targetTribeId].pendingRequests = {};
      cached[targetTribeId].pendingRequests![applicant.uid] = pending;
      saveCachedTribes(cached);
    }

    if (db) {
      try {
        await set(ref(db, `tribes/${targetTribeId}/pendingRequests/${applicant.uid}`), pending);
      } catch (err) {
        console.warn('[TribeService] Remote pending request write failed:', err);
      }
    }

    return {
      success: true,
      status: 'pending',
      tribe: targetTribe,
    };
  }

  // Otherwise direct join (open invite policy)
  const newMember: TribeMember = {
    uid: applicant.uid,
    username: applicant.username,
    displayName: applicant.displayName,
    avatarSeed: applicant.avatarSeed,
    role: 'member',
    joinedAt: Date.now(),
    stats: {
      gamesPlayed: applicant.stats?.gamesPlayed || 0,
      victories: applicant.stats?.victories || 0,
      totalScore: applicant.stats?.totalScore || 0,
    },
  };

  if (cached[targetTribeId]) {
    if (!cached[targetTribeId].members) cached[targetTribeId].members = {};
    cached[targetTribeId].members[applicant.uid] = newMember;
    saveCachedTribes(cached);
  }

  if (db) {
    try {
      await set(ref(db, `tribes/${targetTribeId}/members/${applicant.uid}`), newMember);
      await set(ref(db, `user_tribes/${applicant.uid}/${targetTribeId}`), true);
    } catch (err) {
      console.warn('[TribeService] Remote direct join write failed:', err);
    }
  }

  return {
    success: true,
    status: 'joined',
    tribe: targetTribe,
  };
}

/**
 * Approve pending join request
 */
export async function approveTribeRequest(
  tribeId: string,
  applicant: PendingRequest
): Promise<boolean> {
  const newMember: TribeMember = {
    uid: applicant.uid,
    username: applicant.username,
    displayName: applicant.displayName,
    avatarSeed: applicant.avatarSeed,
    role: 'member',
    joinedAt: Date.now(),
  };

  const cached = getCachedTribes();
  if (cached[tribeId]) {
    if (!cached[tribeId].members) cached[tribeId].members = {};
    cached[tribeId].members[applicant.uid] = newMember;
    if (cached[tribeId].pendingRequests) {
      delete cached[tribeId].pendingRequests![applicant.uid];
    }
    saveCachedTribes(cached);
  }

  const db = getDb();
  if (db) {
    try {
      await set(ref(db, `tribes/${tribeId}/members/${applicant.uid}`), newMember);
      await set(ref(db, `user_tribes/${applicant.uid}/${tribeId}`), true);
      await remove(ref(db, `tribes/${tribeId}/pendingRequests/${applicant.uid}`));
    } catch (err) {
      console.warn('[TribeService] Remote approve failed:', err);
    }
  }

  return true;
}

/**
 * Reject pending join request
 */
export async function rejectTribeRequest(tribeId: string, applicantUid: string): Promise<boolean> {
  const cached = getCachedTribes();
  if (cached[tribeId] && cached[tribeId].pendingRequests) {
    delete cached[tribeId].pendingRequests![applicantUid];
    saveCachedTribes(cached);
  }

  const db = getDb();
  if (db) {
    try {
      await remove(ref(db, `tribes/${tribeId}/pendingRequests/${applicantUid}`));
    } catch (err) {
      console.warn('[TribeService] Remote reject failed:', err);
    }
  }

  return true;
}

/**
 * Remove member from Tribe
 */
export async function removeTribeMember(tribeId: string, targetUid: string): Promise<boolean> {
  const cached = getCachedTribes();
  if (cached[tribeId] && cached[tribeId].members) {
    delete cached[tribeId].members[targetUid];
    saveCachedTribes(cached);
  }

  const db = getDb();
  if (db) {
    try {
      await remove(ref(db, `tribes/${tribeId}/members/${targetUid}`));
      await remove(ref(db, `user_tribes/${targetUid}/${tribeId}`));
    } catch (err) {
      console.warn('[TribeService] Remote remove failed:', err);
    }
  }

  return true;
}

/**
 * Update Tribe settings (invite policy, tagline, etc.)
 */
export async function updateTribeRecord(
  tribeId: string,
  patch: Partial<Tribe>
): Promise<boolean> {
  const cached = getCachedTribes();
  if (cached[tribeId]) {
    cached[tribeId] = { ...cached[tribeId], ...patch };
    saveCachedTribes(cached);
  }

  const db = getDb();
  if (db) {
    try {
      await update(ref(db, `tribes/${tribeId}`), patch);
    } catch (err) {
      console.warn('[TribeService] Remote update failed:', err);
    }
  }

  return true;
}

/**
 * Sets an active game session for a Tribe (Online & Onsite)
 */
export async function broadcastTribeSession(
  tribeId: string,
  session: ActiveTribeSession
): Promise<void> {
  // Save local active session for offline hotspot detection
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_LOCAL_SESSION, JSON.stringify({ tribeId, session }));
    } catch {
      // ignore
    }
  }

  const cached = getCachedTribes();
  if (cached[tribeId]) {
    cached[tribeId].activeSession = session;
    saveCachedTribes(cached);
  }

  const db = getDb();
  if (db) {
    try {
      await set(ref(db, `tribes/${tribeId}/activeSession`), session);
    } catch (err) {
      console.warn('[TribeService] broadcastTribeSession remote write failed:', err);
    }
  }
}

/**
 * Clears the active session for a Tribe
 */
export async function endTribeSession(tribeId: string): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_LOCAL_SESSION);
  }

  const cached = getCachedTribes();
  if (cached[tribeId]) {
    cached[tribeId].activeSession = null;
    saveCachedTribes(cached);
  }

  const db = getDb();
  if (db) {
    try {
      await remove(ref(db, `tribes/${tribeId}/activeSession`));
    } catch (err) {
      console.warn('[TribeService] endTribeSession remote clear failed:', err);
    }
  }
}

/**
 * Detects any locally active session (for onsite hotspot mode)
 */
export function getLocalActiveSession(): { tribeId: string; session: ActiveTribeSession } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOCAL_SESSION);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Expire local sessions older than 2 hours
    if (parsed.session && Date.now() - parsed.session.startedAt < 2 * 60 * 60 * 1000) {
      return parsed;
    }
  } catch {
    // ignore
  }
  return null;
}
