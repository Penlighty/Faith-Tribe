import { describe, it, expect, beforeEach } from 'vitest';
import {
  createTribeRecord,
  joinTribeWithInviteCode,
  addMemberByUsernameToTribe,
  approveTribeRequest,
  rejectTribeRequest,
  removeTribeMember,
  broadcastTribeSession,
  endTribeSession,
  getLocalActiveSession,
  generateTribeInviteCode,
} from '../src/engine/tribes/tribeService';
import { UserProfile } from '../src/engine/auth/types';

// Mock localStorage for Node test runner
const memoryStorage: Record<string, string> = {};
const mockStorage = {
  getItem: (k: string) => memoryStorage[k] || null,
  setItem: (k: string, v: string) => {
    memoryStorage[k] = v;
  },
  removeItem: (k: string) => {
    delete memoryStorage[k];
  },
  clear: () => {
    Object.keys(memoryStorage).forEach((k) => delete memoryStorage[k]);
  },
};

(globalThis as any).localStorage = mockStorage;
(globalThis as any).sessionStorage = mockStorage;
(globalThis as any).window = {
  location: { origin: 'http://localhost:3000' },
};

describe('Tribe & Fellowship System', () => {
  beforeEach(() => {
    mockStorage.clear();
  });

  const mockAdminUser: UserProfile = {
    uid: 'user_pastor_david',
    username: 'pastordavid',
    displayName: 'Pastor David',
    avatarSeed: 'seed_david',
    biblicalTribeId: 'judah',
    createdAt: Date.now(),
    stats: { gamesPlayed: 10, victories: 7, totalScore: 1450, highestScore: 280 },
  };

  const mockMemberUser: UserProfile = {
    uid: 'user_john_d',
    username: 'johnd',
    displayName: 'John Disciple',
    avatarSeed: 'seed_john',
    biblicalTribeId: 'levi',
    createdAt: Date.now(),
    stats: { gamesPlayed: 4, victories: 2, totalScore: 520, highestScore: 190 },
  };

  it('generates well-formatted uppercase tribe invite codes', () => {
    const code = generateTribeInviteCode('Grace Fellowship');
    expect(code).toMatch(/^TRB-GRACEF-\d{4}$/);
  });

  it('creates a new tribe with creator as admin and proper initial member list', async () => {
    const tribe = await createTribeRecord(
      mockAdminUser,
      'Berean Fellowship',
      'Examining scriptures daily',
      'judah',
      'open'
    );

    expect(tribe.id).toBeDefined();
    expect(tribe.name).toBe('Berean Fellowship');
    expect(tribe.creatorUid).toBe(mockAdminUser.uid);
    expect(tribe.adminUids).toContain(mockAdminUser.uid);
    expect(tribe.members[mockAdminUser.uid]).toBeDefined();
    expect(tribe.members[mockAdminUser.uid].role).toBe('admin');
    expect(tribe.members[mockAdminUser.uid].stats?.totalScore).toBe(1450);
  });

  it('allows disciples to join directly when invite policy is open', async () => {
    const tribe = await createTribeRecord(
      mockAdminUser,
      'Antioch Believers',
      'First called Christians',
      'reuben',
      'open'
    );

    const joinRes = await joinTribeWithInviteCode(tribe.inviteCode, mockMemberUser);
    expect(joinRes.success).toBe(true);
    expect(joinRes.status).toBe('joined');
  });

  it('places applicants in pending queue when invite policy is approval_required', async () => {
    const tribe = await createTribeRecord(
      mockAdminUser,
      'Closed Study Group',
      'Youth Small Group',
      'joseph',
      'approval_required'
    );

    const joinRes = await joinTribeWithInviteCode(tribe.inviteCode, mockMemberUser);
    expect(joinRes.success).toBe(true);
    expect(joinRes.status).toBe('pending');
  });

  it('allows admin to approve pending applicant', async () => {
    const tribe = await createTribeRecord(
      mockAdminUser,
      'Berean Fellowship',
      'Examining Scriptures',
      'judah',
      'approval_required'
    );

    await joinTribeWithInviteCode(tribe.inviteCode, mockMemberUser);

    const pendingApplicant = {
      uid: mockMemberUser.uid,
      username: mockMemberUser.username,
      displayName: mockMemberUser.displayName,
      avatarSeed: mockMemberUser.avatarSeed,
      requestedAt: Date.now(),
    };

    const approved = await approveTribeRequest(tribe.id, pendingApplicant);
    expect(approved).toBe(true);
  });

  it('allows admin to reject pending applicant', async () => {
    const tribe = await createTribeRecord(
      mockAdminUser,
      'Berean Fellowship',
      'Examining Scriptures',
      'judah',
      'approval_required'
    );

    await joinTribeWithInviteCode(tribe.inviteCode, mockMemberUser);

    const rejected = await rejectTribeRequest(tribe.id, mockMemberUser.uid);
    expect(rejected).toBe(true);
  });

  it('adds member directly by @username', async () => {
    const tribe = await createTribeRecord(
      mockAdminUser,
      'Grace Tribe',
      'Walking in Grace',
      'judah',
      'open'
    );

    const added = await addMemberByUsernameToTribe(tribe.id, mockMemberUser);
    expect(added).toBe(true);
  });

  it('removes a member from the tribe', async () => {
    const tribe = await createTribeRecord(
      mockAdminUser,
      'Grace Tribe',
      'Walking in Grace',
      'judah',
      'open'
    );

    await addMemberByUsernameToTribe(tribe.id, mockMemberUser);
    const removed = await removeTribeMember(tribe.id, mockMemberUser.uid);
    expect(removed).toBe(true);
  });

  it('broadcasts and clears active game session for zero-friction member join', async () => {
    const tribe = await createTribeRecord(
      mockAdminUser,
      'Emmaus Road',
      'Heart burning within us',
      'benjamin',
      'open'
    );

    const sessionPayload = {
      roomCode: 'ZEAL',
      gameId: 'fake-a-proverb',
      gameName: 'Fake a Proverb',
      hostName: mockAdminUser.displayName,
      hostUid: mockAdminUser.uid,
      connectionMode: 'onsite' as const,
      hotspotInfo: { ssid: 'Emmaus-Hotspot' },
      startedAt: Date.now(),
      status: 'lobby' as const,
      participantsCount: 1,
    };

    await broadcastTribeSession(tribe.id, sessionPayload);

    // Verify local hotspot session detection
    const localDetected = getLocalActiveSession();
    expect(localDetected).not.toBeNull();
    expect(localDetected?.tribeId).toBe(tribe.id);
    expect(localDetected?.session.roomCode).toBe('ZEAL');

    // End session
    await endTribeSession(tribe.id);
    const localAfterEnd = getLocalActiveSession();
    expect(localAfterEnd).toBeNull();
  });
});
