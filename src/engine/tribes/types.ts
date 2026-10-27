import { HotspotInfo } from '../types';

export type InvitePolicy = 'open' | 'approval_required';

export interface TribeMember {
  uid: string;
  username: string;
  displayName: string;
  avatarSeed: string;
  role: 'admin' | 'member';
  joinedAt: number;
  biblicalTribeId?: string;
  stats?: {
    gamesPlayed: number;
    victories: number;
    totalScore: number;
  };
}

export interface PendingRequest {
  uid: string;
  username: string;
  displayName: string;
  avatarSeed: string;
  requestedAt: number;
}

export interface ActiveTribeSession {
  roomCode: string;
  gameId: string;
  gameName: string;
  hostName: string;
  hostUid: string;
  connectionMode: 'online' | 'onsite';
  hotspotInfo?: HotspotInfo;
  startedAt: number;
  status: 'lobby' | 'in_game';
  participantsCount: number;
  participants?: Array<{ id: string; name: string }>;
}

export interface Tribe {
  id: string; // e.g. "TRB-9842" or custom slug
  name: string; // e.g. "Berean Fellowship"
  tagline?: string;
  biblicalTribeId: string; // e.g. 'judah', 'reuben'
  creatorUid: string;
  adminUids: string[];
  inviteCode: string; // e.g. "TRB-BEREAN"
  invitePolicy: InvitePolicy;
  members: Record<string, TribeMember>; // keyed by uid
  pendingRequests?: Record<string, PendingRequest>; // keyed by uid
  activeSession?: ActiveTribeSession | null;
  createdAt: number;
}

export interface TribeContextType {
  tribes: Tribe[];
  activeTribe: Tribe | null;
  isLoading: boolean;
  selectTribe: (tribeId: string) => void;
  createTribe: (
    name: string,
    tagline: string,
    biblicalTribeId: string,
    invitePolicy?: InvitePolicy
  ) => Promise<Tribe | null>;
  joinTribeByInviteCode: (
    code: string
  ) => Promise<{ success: boolean; status: 'joined' | 'pending'; tribe?: Tribe; error?: string }>;
  addMemberByUsername: (
    tribeId: string,
    username: string
  ) => Promise<{ success: boolean; error?: string }>;
  approveRequest: (tribeId: string, applicantUid: string) => Promise<boolean>;
  rejectRequest: (tribeId: string, applicantUid: string) => Promise<boolean>;
  removeMember: (tribeId: string, targetUid: string) => Promise<boolean>;
  updateTribeSettings: (tribeId: string, patch: Partial<Tribe>) => Promise<boolean>;
  setTribeActiveSession: (tribeId: string, session: ActiveTribeSession) => Promise<void>;
  clearTribeActiveSession: (tribeId: string) => Promise<void>;
  liveActiveSession: { tribe: Tribe; session: ActiveTribeSession } | null;
}
