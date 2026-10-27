export interface UserStats {
  gamesPlayed: number;
  victories: number;
  totalScore: number;
  highestScore: number;
  favoriteGame?: string;
  lastPlayedAt?: number;
}

export interface TribalAssessmentRecord {
  biblicalTribeId: string;
  assessedAt: number;
  traits: Record<string, number>;
  matchPercentage: number;
  secondaryTribeId?: string;
}

export interface UserProfile {
  uid: string;
  email?: string;
  username: string; // Lowercase, unique alphanumeric handle e.g. "pastordavid"
  displayName: string; // e.g. "Pastor David"
  avatarSeed: string;
  biblicalTribeId: string; // Selected biblical tribe emblem (e.g. 'judah', 'reuben')
  tribalAssessment?: TribalAssessmentRecord;
  createdAt: number;
  stats: UserStats;
}

export interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOfflineMode: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (
    email: string,
    pass: string,
    username: string,
    displayName: string,
    biblicalTribeId?: string
  ) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<UserProfile>) => Promise<boolean>;
  recordGameStats: (gameId: string, score: number, isWinner: boolean) => Promise<void>;
  searchUserByUsername: (username: string) => Promise<UserProfile | null>;
}
