export interface PresenceUser {
  id: string;
  name: string;
  isHost: boolean;
  teamId?: string;
  joinedAt: number;
  avatarSeed?: string;
  isReady?: boolean;
  connectionMode?: 'online' | 'onsite';
}

export interface TransportMessage<T = unknown> {
  type: string;
  senderId: string;
  payload: T;
  timestamp: number;
  version?: number;
}

export interface Transport {
  connect(roomCode: string, user: PresenceUser): Promise<void>;
  disconnect(): Promise<void>;
  send<T = unknown>(type: string, payload: T, version?: number): Promise<void>;
  onMessage<T = unknown>(handler: (msg: TransportMessage<T>) => void): () => void;
  onPresenceSync(handler: (users: PresenceUser[]) => void): () => void;
  /** Optional: callback fired when the participant loses connection to the host. */
  onDisconnect?(handler: () => void): () => void;
  getPresence(): PresenceUser[];
  isConnected(): boolean;
  getTransportName(): string;
}
