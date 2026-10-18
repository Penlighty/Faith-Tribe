import { Transport, TransportMessage, PresenceUser } from './types';

// Global shared memory room bus for testing in-memory
const globalRooms = new Map<string, {
  transports: Set<MockTransport>;
  presence: Map<string, PresenceUser>;
}>();

export class MockTransport implements Transport {
  private roomCode: string = '';
  private user: PresenceUser | null = null;
  private messageListeners = new Set<(msg: TransportMessage<any>) => void>();
  private presenceListeners = new Set<(users: PresenceUser[]) => void>();
  private connected = false;
  private broadcastChannel: BroadcastChannel | null = null;

  constructor(private options: { useBroadcastChannel?: boolean; latencyMs?: number } = {}) {}

  getTransportName(): string {
    return this.options.useBroadcastChannel ? 'Local Browser Channel (Multi-Tab)' : 'In-Memory Test Bus';
  }

  async connect(roomCode: string, user: PresenceUser): Promise<void> {
    this.roomCode = roomCode.toUpperCase();
    this.user = user;
    this.connected = true;

    // Register with in-memory room
    if (!globalRooms.has(this.roomCode)) {
      globalRooms.set(this.roomCode, {
        transports: new Set(),
        presence: new Map(),
      });
    }

    const room = globalRooms.get(this.roomCode)!;
    room.transports.add(this);
    room.presence.set(user.id, user);

    // Also connect to BroadcastChannel for cross-tab local testing if available
    if (this.options.useBroadcastChannel !== false && typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel(`faith_tribe_room_${this.roomCode}`);
        this.broadcastChannel.onmessage = (event) => {
          const { kind, data } = event.data || {};
          if (kind === 'MESSAGE') {
            this.notifyMessage(data);
          } else if (kind === 'PRESENCE') {
            this.handleCrossTabPresence(data);
          }
        };

        // Broadcast presence
        this.broadcastChannel.postMessage({
          kind: 'PRESENCE',
          data: { action: 'JOIN', user },
        });
      } catch {
        // BroadcastChannel unavailable
      }
    }

    this.notifyPresence();
  }

  async disconnect(): Promise<void> {
    if (!this.connected) return;
    this.connected = false;

    if (this.roomCode && this.user) {
      const room = globalRooms.get(this.roomCode);
      if (room) {
        room.transports.delete(this);
        room.presence.delete(this.user.id);
        if (room.transports.size === 0) {
          globalRooms.delete(this.roomCode);
        } else {
          room.transports.forEach((t) => t.notifyPresence());
        }
      }

      if (this.broadcastChannel) {
        try {
          this.broadcastChannel.postMessage({
            kind: 'PRESENCE',
            data: { action: 'LEAVE', userId: this.user.id },
          });
          this.broadcastChannel.close();
        } catch {
          // ignore
        }
        this.broadcastChannel = null;
      }
    }

    this.messageListeners.clear();
    this.presenceListeners.clear();
  }

  async send<T = unknown>(type: string, payload: T, version?: number): Promise<void> {
    if (!this.connected || !this.user) {
      throw new Error('Transport not connected');
    }

    const msg: TransportMessage<T> = {
      type,
      senderId: this.user.id,
      payload,
      timestamp: Date.now(),
      version,
    };

    const dispatch = () => {
      // In-memory broadcast
      const room = globalRooms.get(this.roomCode);
      if (room) {
        room.transports.forEach((transport) => {
          transport.notifyMessage(msg);
        });
      }

      // Cross-tab broadcast
      if (this.broadcastChannel) {
        try {
          this.broadcastChannel.postMessage({
            kind: 'MESSAGE',
            data: msg,
          });
        } catch {
          // ignore
        }
      }
    };

    if (this.options.latencyMs && this.options.latencyMs > 0) {
      setTimeout(dispatch, this.options.latencyMs);
    } else {
      dispatch();
    }
  }

  onMessage<T = unknown>(handler: (msg: TransportMessage<T>) => void): () => void {
    this.messageListeners.add(handler as any);
    return () => {
      this.messageListeners.delete(handler as any);
    };
  }

  onPresenceSync(handler: (users: PresenceUser[]) => void): () => void {
    this.presenceListeners.add(handler);
    // Trigger immediately with current presence
    handler(this.getPresence());
    return () => {
      this.presenceListeners.delete(handler);
    };
  }

  getPresence(): PresenceUser[] {
    const room = globalRooms.get(this.roomCode);
    if (!room) return this.user ? [this.user] : [];
    return Array.from(room.presence.values());
  }

  isConnected(): boolean {
    return this.connected;
  }

  private notifyMessage(msg: TransportMessage<any>) {
    this.messageListeners.forEach((fn) => {
      try {
        fn(msg);
      } catch (err) {
        console.error('Error in message listener', err);
      }
    });
  }

  private notifyPresence() {
    const presence = this.getPresence();
    this.presenceListeners.forEach((fn) => {
      try {
        fn(presence);
      } catch (err) {
        console.error('Error in presence listener', err);
      }
    });
  }

  private handleCrossTabPresence(data: any) {
    if (!this.roomCode) return;
    const room = globalRooms.get(this.roomCode);
    if (!room) return;

    if (data.action === 'JOIN' && data.user) {
      room.presence.set(data.user.id, data.user);
      this.notifyPresence();

      // Announce our presence back to the joining tab so it knows we exist
      if (this.user && this.broadcastChannel) {
        try {
          this.broadcastChannel.postMessage({
            kind: 'PRESENCE',
            data: { action: 'ANNOUNCE', user: this.user },
          });
        } catch {
          // ignore
        }
      }
    } else if (data.action === 'ANNOUNCE' && data.user) {
      room.presence.set(data.user.id, data.user);
      this.notifyPresence();
    } else if (data.action === 'LEAVE' && data.userId) {
      room.presence.delete(data.userId);
      this.notifyPresence();
    }
  }
}
