import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getApps, FirebaseApp } from 'firebase/app';
import { getDatabase, ref, onValue, off, Database } from 'firebase/database';
import { useAuth } from '../auth/AuthContext';
import {
  Tribe,
  TribeContextType,
  ActiveTribeSession,
  InvitePolicy,
  PendingRequest,
} from './types';
import {
  fetchUserTribes,
  createTribeRecord,
  joinTribeWithInviteCode,
  addMemberByUsernameToTribe,
  approveTribeRequest,
  rejectTribeRequest,
  removeTribeMember,
  updateTribeRecord,
  broadcastTribeSession,
  endTribeSession,
  getLocalActiveSession,
} from './tribeService';

const TribeContext = createContext<TribeContextType | null>(null);

function getDb(): Database | null {
  if (getApps().length === 0) return null;
  try {
    return getDatabase(getApps()[0]);
  } catch {
    return null;
  }
}

export const TribeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [tribes, setTribes] = useState<Tribe[]>([]);
  const [selectedTribeId, setSelectedTribeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Reload user tribes when user changes
  const reloadTribes = useCallback(async () => {
    if (!user) {
      setTribes([]);
      setSelectedTribeId(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const list = await fetchUserTribes(user.uid);
      setTribes(list);
      if (list.length > 0 && !selectedTribeId) {
        setSelectedTribeId(list[0].id);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, selectedTribeId]);

  useEffect(() => {
    reloadTribes();
  }, [user?.uid]);

  // Subscribe to realtime updates for user's tribes in Firebase
  useEffect(() => {
    const db = getDb();
    if (!db || tribes.length === 0) return;

    const unsubs: Array<() => void> = [];

    tribes.forEach((trb) => {
      const trbRef = ref(db, `tribes/${trb.id}`);
      const listener = onValue(trbRef, (snap) => {
        if (snap.exists()) {
          const updated = snap.val() as Tribe;
          setTribes((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        }
      });
      unsubs.push(() => off(trbRef, 'value', listener));
    });

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [tribes.map((t) => t.id).join(',')]);

  // Detect live active session across user's tribes (or onsite local session)
  const liveActiveSession = useMemo(() => {
    // Check if any joined tribe has an active session
    for (const t of tribes) {
      if (t.activeSession && t.activeSession.status !== undefined) {
        return { tribe: t, session: t.activeSession };
      }
    }

    // Check onsite / local hotspot session
    const local = getLocalActiveSession();
    if (local) {
      const matchingTribe = tribes.find((t) => t.id === local.tribeId);
      if (matchingTribe) {
        return { tribe: matchingTribe, session: local.session };
      }
    }

    return null;
  }, [tribes]);

  const activeTribe = useMemo(() => {
    return tribes.find((t) => t.id === selectedTribeId) || tribes[0] || null;
  }, [tribes, selectedTribeId]);

  const selectTribe = (tribeId: string) => {
    setSelectedTribeId(tribeId);
  };

  const createTribe = async (
    name: string,
    tagline: string,
    biblicalTribeId: string = 'judah',
    invitePolicy: InvitePolicy = 'open'
  ): Promise<Tribe | null> => {
    if (!user) return null;
    const newTribe = await createTribeRecord(user, name, tagline, biblicalTribeId, invitePolicy);
    setTribes((prev) => [...prev, newTribe]);
    setSelectedTribeId(newTribe.id);
    return newTribe;
  };

  const joinTribeByInviteCode = async (
    code: string
  ): Promise<{ success: boolean; status: 'joined' | 'pending'; tribe?: Tribe; error?: string }> => {
    if (!user) {
      return { success: false, status: 'pending', error: 'You must be signed in to join a Tribe.' };
    }
    const res = await joinTribeWithInviteCode(code, user);
    if (res.success && res.tribe) {
      await reloadTribes();
      setSelectedTribeId(res.tribe.id);
    }
    return res;
  };

  const addMemberByUsername = async (
    tribeId: string,
    username: string
  ): Promise<{ success: boolean; error?: string }> => {
    const { searchUserByUsername } = await import('../auth/AuthContext').then((m) => {
      // Direct call fallback
      return { searchUserByUsername: null };
    });
    // In React hook context, we can lookup directly from db or service
    const db = getDb();
    if (!db) {
      return { success: false, error: 'Database is currently offline' };
    }
    try {
      const clean = username.replace(/^@/, '').trim().toLowerCase();
      const { ref: dbRef, get: dbGet } = await import('firebase/database');
      const snap = await dbGet(dbRef(db, `usernames/${clean}`));
      if (!snap.exists()) {
        return { success: false, error: `No disciple found with username @${clean}` };
      }
      const record = snap.val();
      const targetUser = {
        uid: record.uid,
        username: record.username,
        displayName: record.displayName,
        avatarSeed: record.avatarSeed,
        biblicalTribeId: record.biblicalTribeId || 'judah',
        createdAt: Date.now(),
        stats: { gamesPlayed: 0, victories: 0, totalScore: 0, highestScore: 0 },
      };
      await addMemberByUsernameToTribe(tribeId, targetUser);
      await reloadTribes();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to add member' };
    }
  };

  const approveRequest = async (tribeId: string, applicantUid: string): Promise<boolean> => {
    const trb = tribes.find((t) => t.id === tribeId);
    if (!trb || !trb.pendingRequests || !trb.pendingRequests[applicantUid]) return false;
    const applicant = trb.pendingRequests[applicantUid];
    const ok = await approveTribeRequest(tribeId, applicant);
    if (ok) await reloadTribes();
    return ok;
  };

  const rejectRequest = async (tribeId: string, applicantUid: string): Promise<boolean> => {
    const ok = await rejectTribeRequest(tribeId, applicantUid);
    if (ok) await reloadTribes();
    return ok;
  };

  const removeMember = async (tribeId: string, targetUid: string): Promise<boolean> => {
    const ok = await removeTribeMember(tribeId, targetUid);
    if (ok) await reloadTribes();
    return ok;
  };

  const updateTribeSettings = async (tribeId: string, patch: Partial<Tribe>): Promise<boolean> => {
    const ok = await updateTribeRecord(tribeId, patch);
    if (ok) await reloadTribes();
    return ok;
  };

  const setTribeActiveSession = async (tribeId: string, session: ActiveTribeSession) => {
    await broadcastTribeSession(tribeId, session);
    setTribes((prev) =>
      prev.map((t) => (t.id === tribeId ? { ...t, activeSession: session } : t))
    );
  };

  const clearTribeActiveSession = async (tribeId: string) => {
    await endTribeSession(tribeId);
    setTribes((prev) =>
      prev.map((t) => (t.id === tribeId ? { ...t, activeSession: null } : t))
    );
  };

  const value: TribeContextType = {
    tribes,
    activeTribe,
    isLoading,
    selectTribe,
    createTribe,
    joinTribeByInviteCode,
    addMemberByUsername,
    approveRequest,
    rejectRequest,
    removeMember,
    updateTribeSettings,
    setTribeActiveSession,
    clearTribeActiveSession,
    liveActiveSession,
  };

  return <TribeContext.Provider value={value}>{children}</TribeContext.Provider>;
};

export const useTribes = (): TribeContextType => {
  const context = useContext(TribeContext);
  if (!context) {
    throw new Error('useTribes must be used within a TribeProvider');
  }
  return context;
};
