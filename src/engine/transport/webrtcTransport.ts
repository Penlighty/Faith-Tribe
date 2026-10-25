import Peer, { DataConnection } from 'peerjs';
import { Transport, TransportMessage, PresenceUser } from './types';

// Global in-memory bus for same-process unit tests or instances
const memoryBus = new Map<string, {
  transports: Set<WebRTCTransport>;
  presence: Map<string, PresenceUser>;
}>();

export class WebRTCTransport implements Transport {
  private roomCode: string = '';
  private user: PresenceUser | null = null;
  private messageListeners = new Set<(msg: TransportMessage<any>) => void>();
  private presenceListeners = new Set<(users: PresenceUser[]) => void>();
  private disconnectListeners = new Set<() => void>();
  private connected = false;

  // WebRTC / PeerJS
  private peer: Peer | null = null;
  private hostConnection: DataConnection | null = null;
  private peerConnections = new Map<string, DataConnection>();
  private presenceUsers = new Map<string, PresenceUser>();

  // Cross-tab BroadcastChannel
  private broadcastChannel: BroadcastChannel | null = null;

  // Message deduplication
  private recentMessageKeys = new Set<string>();

  getTransportName(): string {
    return 'Faith Tribe WebRTC (Direct P2P + Cross-Tab)';
  }

  async connect(roomCode: string, user: PresenceUser): Promise<void> {
    this.roomCode = roomCode.toUpperCase();
    this.user = user;
    this.connected = true;

    // Track user presence locally
    this.presenceUsers.set(user.id, user);

    // 1. In-memory bus registration (for vitest/fast local sync)
    if (user.isHost) {
      memoryBus.delete(this.roomCode);
    }
    if (!memoryBus.has(this.roomCode)) {
      memoryBus.set(this.roomCode, {
        transports: new Set(),
        presence: new Map(),
      });
    }
    const memRoom = memoryBus.get(this.roomCode)!;
    memRoom.transports.add(this);
    memRoom.presence.set(user.id, user);

    // 2. Cross-tab BroadcastChannel
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel(`faith_tribe_room_${this.roomCode}`);
        this.broadcastChannel.onmessage = (event) => {
          const { kind, data } = event.data || {};
          if (kind === 'MESSAGE') {
            this.handleIncomingMessage(data);
          } else if (kind === 'PRESENCE') {
            this.handleCrossTabPresence(data);
          }
        };

        // Announce join via BroadcastChannel
        this.broadcastChannel.postMessage({
          kind: 'PRESENCE',
          data: { action: 'JOIN', user },
        });
      } catch (err) {
        console.warn('BroadcastChannel unavailable:', err);
      }
    }

    // 3. WebRTC via PeerJS (enables real cross-device phones/tablets/laptops)
    if (typeof window !== 'undefined') {
      try {
        await this.initPeerJS(user);
      } catch (err) {
        console.warn('WebRTC peer init non-fatal warning:', err);
      }
    }

    this.notifyPresence();
  }

  private initPeerJS(user: PresenceUser): Promise<void> {
    return new Promise((resolve) => {
      try {
        const hostPeerId = `faith-tribe-${this.roomCode.toLowerCase()}`;

        if (user.isHost) {
          // Host claims the known room peer ID
          this.peer = new Peer(hostPeerId, {
            debug: 0,
          });

          this.peer.on('open', () => {
            resolve();
          });

          this.peer.on('connection', (conn) => {
            this.setupHostPeerConnection(conn);
          });

          this.peer.on('error', (err: any) => {
            console.warn('Host PeerJS warning:', err?.type || err);
            // If ID already taken (e.g. page refresh), fall back to fallback peer or continue
            resolve();
          });
        } else {
          // Joining player gets a random peer ID and connects to Host
          this.peer = new Peer({
            debug: 0,
          });

          this.peer.on('open', () => {
            this.connectToHostPeer(hostPeerId, user);
            resolve();
          });

          this.peer.on('error', (err: any) => {
            console.warn('Player PeerJS warning:', err?.type || err);
            resolve();
          });
        }
      } catch (err) {
        console.warn('PeerJS init failed:', err);
        resolve();
      }
    });
  }

  private setupHostPeerConnection(conn: DataConnection) {
    conn.on('open', () => {
      this.peerConnections.set(conn.peer, conn);

      // Send host presence and all known presence to the newcomer
      conn.send({
        type: 'PRESENCE_SYNC',
        senderId: this.user?.id || 'HOST',
        payload: { users: Array.from(this.presenceUsers.values()) },
        timestamp: Date.now(),
      });
    });

    conn.on('data', (raw: any) => {
      const msg = raw as TransportMessage<any>;
      if (!msg) return;

      if (msg.type === 'PRESENCE_SYNC') {
        const users = msg.payload?.users as PresenceUser[];
        if (Array.isArray(users)) {
          users.forEach((u) => this.presenceUsers.set(u.id, u));
          this.notifyPresence();
        }
      } else {
        if (msg.type === 'PLAYER_JOIN') {
          const joiningUser = msg.payload?.player as PresenceUser;
          if (joiningUser) {
            this.presenceUsers.set(joiningUser.id, joiningUser);
            this.notifyPresence();
          }
        }
        this.handleIncomingMessage(msg);

        // Host re-broadcasts non-private messages to all other players
        if (msg.type === 'INTENT' || msg.type === 'PLAYER_JOIN') {
          this.peerConnections.forEach((otherConn, peerId) => {
            if (peerId !== conn.peer && otherConn.open) {
              try {
                otherConn.send(msg);
              } catch {
                // ignore
              }
            }
          });
        }
      }
    });

    conn.on('close', () => {
      this.peerConnections.delete(conn.peer);
      // We will let heartbeat or explicit leave manage presence, but notify
      this.notifyPresence();
    });

    conn.on('error', () => {
      this.peerConnections.delete(conn.peer);
    });
  }

  private connectToHostPeer(hostPeerId: string, user: PresenceUser) {
    if (!this.peer) return;

    try {
      const conn = this.peer.connect(hostPeerId, { reliable: true });
      this.hostConnection = conn;

      conn.on('open', () => {
        // Send our player join notification over WebRTC
        const joinMsg: TransportMessage<any> = {
          type: 'PLAYER_JOIN',
          senderId: user.id,
          payload: { player: user },
          timestamp: Date.now(),
        };
        conn.send(joinMsg);

        // Request initial snapshot from host
        const reqSnapshotMsg: TransportMessage<any> = {
          type: 'REQUEST_SNAPSHOT',
          senderId: user.id,
          payload: { playerId: user.id },
          timestamp: Date.now(),
        };
        conn.send(reqSnapshotMsg);
      });

      conn.on('data', (raw: any) => {
        const msg = raw as TransportMessage<any>;
        if (!msg) return;

        if (msg.type === 'PRESENCE_SYNC') {
          const users = msg.payload?.users as PresenceUser[];
          if (Array.isArray(users)) {
            users.forEach((u) => this.presenceUsers.set(u.id, u));
            this.notifyPresence();
          }
        } else {
          this.handleIncomingMessage(msg);
        }
      });

      conn.on('close', () => {
        this.hostConnection = null;
        // Notify session layer that we lost connection to the host
        if (this.connected) {
          this.notifyDisconnect();
        }
      });

      conn.on('error', (err) => {
        console.warn('Host connection error:', err);
      });
    } catch (err) {
      console.warn('Failed connecting to host peer:', err);
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connected) return;
    this.connected = false;

    // 1. Leave BroadcastChannel
    if (this.broadcastChannel && this.user) {
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

    // 2. Close WebRTC connections & destroy peer
    if (this.hostConnection) {
      try {
        this.hostConnection.close();
      } catch {
        // ignore
      }
      this.hostConnection = null;
    }

    this.peerConnections.forEach((conn) => {
      try {
        conn.close();
      } catch {
        // ignore
      }
    });
    this.peerConnections.clear();

    if (this.peer) {
      try {
        this.peer.destroy();
      } catch {
        // ignore
      }
      this.peer = null;
    }

    // 3. Clean in-memory bus
    if (this.roomCode && this.user) {
      const room = memoryBus.get(this.roomCode);
      if (room) {
        room.transports.delete(this);
        room.presence.delete(this.user.id);
        if (room.transports.size === 0) {
          memoryBus.delete(this.roomCode);
        } else {
          room.transports.forEach((t) => t.notifyPresence());
        }
      }
    }

    this.presenceUsers.clear();
    this.messageListeners.clear();
    this.presenceListeners.clear();
    this.recentMessageKeys.clear();
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

    // Track own message key to avoid duplicate processing
    const msgKey = `${msg.senderId}_${msg.type}_${msg.timestamp}_${version || 0}`;
    this.recentMessageKeys.add(msgKey);
    if (this.recentMessageKeys.size > 200) {
      const first = this.recentMessageKeys.values().next().value;
      if (first) this.recentMessageKeys.delete(first);
    }

    // 1. In-memory bus broadcast
    const room = memoryBus.get(this.roomCode);
    if (room) {
      room.transports.forEach((t) => {
        if (t !== this) {
          t.handleIncomingMessage(msg);
        }
      });
    }

    // 2. Cross-tab BroadcastChannel
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

    // 3. WebRTC DataChannel
    if (this.user.isHost) {
      // Host sends to all connected peers
      this.peerConnections.forEach((conn) => {
        if (conn.open) {
          try {
            conn.send(msg);
          } catch {
            // ignore
          }
        }
      });
    } else if (this.hostConnection && this.hostConnection.open) {
      // Player sends to host
      try {
        this.hostConnection.send(msg);
      } catch {
        // ignore
      }
    }
  }

  private handleIncomingMessage(msg: TransportMessage<any>) {
    if (!msg) return;

    // Deduplication check
    const msgKey = `${msg.senderId}_${msg.type}_${msg.timestamp}_${msg.version || 0}`;
    if (this.recentMessageKeys.has(msgKey)) {
      return;
    }
    this.recentMessageKeys.add(msgKey);
    if (this.recentMessageKeys.size > 200) {
      const first = this.recentMessageKeys.values().next().value;
      if (first) this.recentMessageKeys.delete(first);
    }

    this.notifyMessage(msg);
  }

  private handleCrossTabPresence(data: any) {
    if (!data) return;

    if (data.action === 'JOIN' && data.user) {
      this.presenceUsers.set(data.user.id, data.user);
      this.notifyPresence();

      // Announce our presence back to the joining tab
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
      this.presenceUsers.set(data.user.id, data.user);
      this.notifyPresence();
    } else if (data.action === 'LEAVE' && data.userId) {
      this.presenceUsers.delete(data.userId);
      this.notifyPresence();
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
    handler(this.getPresence());
    return () => {
      this.presenceListeners.delete(handler);
    };
  }

  onDisconnect(handler: () => void): () => void {
    this.disconnectListeners.add(handler);
    return () => {
      this.disconnectListeners.delete(handler);
    };
  }

  /** Attempt to reconnect a participant to the host peer after a drop. */
  async reconnect(): Promise<boolean> {
    if (!this.user || !this.roomCode || this.user.isHost) return false;
    const hostPeerId = `faith-tribe-${this.roomCode.toLowerCase()}`;
    try {
      this.connectToHostPeer(hostPeerId, this.user);
      return true;
    } catch {
      return false;
    }
  }

  getPresence(): PresenceUser[] {
    return Array.from(this.presenceUsers.values());
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

  private notifyDisconnect() {
    this.disconnectListeners.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.error('Error in disconnect listener', err);
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
}
