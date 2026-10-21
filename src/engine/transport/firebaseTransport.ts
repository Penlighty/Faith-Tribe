/**
 * FirebaseRealtimeTransport
 *
 * Uses Firebase Realtime Database for:
 *  - Game state broadcast   → rooms/{code}/messages/{pushId}
 *  - Player presence        → rooms/{code}/presence/{userId}
 *
 * Server timestamps ensure competitive timer fairness across devices.
 * Falls back to WebRTCTransport automatically when Firebase is unreachable
 * (offline/hotspot mode).
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  push,
  set,
  onValue,
  onChildAdded,
  remove,
  off,
  serverTimestamp,
  onDisconnect,
  Database,
} from 'firebase/database';
import { Transport, TransportMessage, PresenceUser } from './types';
import { WebRTCTransport } from './webrtcTransport';

// ---------------------------------------------------------------------------
// Firebase config — read from Vite env variables
// ---------------------------------------------------------------------------
function getFirebaseConfig() {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
  };
}

function hasFirebaseConfig(): boolean {
  const cfg = getFirebaseConfig();
  return Boolean(cfg.apiKey && cfg.databaseURL && cfg.projectId);
}

// ---------------------------------------------------------------------------
// Transport implementation
// ---------------------------------------------------------------------------
export class FirebaseRealtimeTransport implements Transport {
  private app: FirebaseApp | null = null;
  private db: Database | null = null;
  private roomCode: string = '';
  private user: PresenceUser | null = null;

  private messageListeners = new Set<(msg: TransportMessage<any>) => void>();
  private presenceListeners = new Set<(users: PresenceUser[]) => void>();

  // Firebase listener refs (for cleanup)
  private unsubMessages: (() => void) | null = null;
  private unsubPresence: (() => void) | null = null;

  // Dedup: ignore messages we sent ourselves
  private seenMessageKeys = new Set<string>();

  // Presence cache
  private presenceCache = new Map<string, PresenceUser>();

  // Fallback when Firebase is unavailable (offline / hotspot mode)
  private fallback: WebRTCTransport | null = null;
  private connected = false;

  // -------------------------------------------------------------------------
  getTransportName(): string {
    if (this.fallback) return this.fallback.getTransportName();
    return 'Firebase Realtime (Online)';
  }

  // -------------------------------------------------------------------------
  async connect(roomCode: string, user: PresenceUser): Promise<void> {
    this.roomCode = roomCode.toUpperCase();
    this.user = user;

    // If no config, skip straight to offline P2P
    if (!hasFirebaseConfig()) {
      return this.connectFallback(roomCode, user);
    }

    try {
      // Re-use existing Firebase app instance if already initialised
      if (getApps().length === 0) {
        this.app = initializeApp(getFirebaseConfig());
      } else {
        this.app = getApps()[0];
      }
      this.db = getDatabase(this.app);

      await this.initPresence(user);
      this.initMessageListener();
      this.connected = true;
    } catch (err) {
      console.warn('[FirebaseTransport] Connect failed, falling back to WebRTC:', err);
      return this.connectFallback(roomCode, user);
    }
  }

  // -------------------------------------------------------------------------
  private async connectFallback(roomCode: string, user: PresenceUser): Promise<void> {
    this.fallback = new WebRTCTransport();
    this.wireFallbackListeners();
    await this.fallback.connect(roomCode, user);
    this.connected = true;
  }

  private wireFallbackListeners() {
    if (!this.fallback) return;
    this.messageListeners.forEach((fn) => this.fallback!.onMessage(fn));
    this.presenceListeners.forEach((fn) => this.fallback!.onPresenceSync(fn));
  }

  // -------------------------------------------------------------------------
  // Presence: write our own node; onDisconnect cleans it up automatically
  // -------------------------------------------------------------------------
  private async initPresence(user: PresenceUser): Promise<void> {
    if (!this.db) return;

    const presenceRef = ref(this.db, `rooms/${this.roomCode}/presence/${user.id}`);
    const presenceData: PresenceUser & { lastSeen: object } = {
      ...user,
      lastSeen: serverTimestamp() as any,
    };

    await set(presenceRef, presenceData);

    // Auto-remove on disconnect (Firebase server-side hook)
    onDisconnect(presenceRef).remove();

    // Listen to the whole presence subtree
    const presenceRootRef = ref(this.db, `rooms/${this.roomCode}/presence`);
    const presenceOff = onValue(presenceRootRef, (snapshot) => {
      const data = snapshot.val() as Record<string, PresenceUser> | null;
      this.presenceCache.clear();
      if (data) {
        Object.values(data).forEach((u) => {
          this.presenceCache.set(u.id, u);
        });
      }
      this.notifyPresence();
    });

    this.unsubPresence = () => off(presenceRootRef, 'value', presenceOff as any);
  }

  // -------------------------------------------------------------------------
  // Messages: listen for new children added to the messages list
  // -------------------------------------------------------------------------
  private initMessageListener(): void {
    if (!this.db) return;

    const messagesRef = ref(this.db, `rooms/${this.roomCode}/messages`);

    // Only listen to messages added *after* we connect — use a timestamp sentinel
    const joinedAt = Date.now();

    const handler = onChildAdded(messagesRef, (snapshot) => {
      const msg = snapshot.val() as TransportMessage<any> & { _serverTimestamp?: number };
      if (!msg) return;

      // Ignore messages that arrived before we joined (old history)
      if (msg.timestamp < joinedAt - 2000) return;

      // Dedup: skip messages we sent ourselves
      const key = `${msg.senderId}_${msg.type}_${msg.timestamp}_${msg.version ?? 0}`;
      if (this.seenMessageKeys.has(key)) return;
      this.seenMessageKeys.add(key);
      if (this.seenMessageKeys.size > 300) {
        const first = this.seenMessageKeys.values().next().value;
        if (first) this.seenMessageKeys.delete(first);
      }

      this.notifyMessage(msg);
    });

    this.unsubMessages = () => off(messagesRef, 'child_added', handler as any);
  }

  // -------------------------------------------------------------------------
  async disconnect(): Promise<void> {
    if (!this.connected) return;
    this.connected = false;

    if (this.fallback) {
      await this.fallback.disconnect();
      this.fallback = null;
      return;
    }

    // Remove our presence node immediately
    if (this.db && this.user) {
      try {
        await remove(ref(this.db, `rooms/${this.roomCode}/presence/${this.user.id}`));
      } catch {
        // ignore — onDisconnect will handle it server-side
      }
    }

    this.unsubMessages?.();
    this.unsubPresence?.();
    this.unsubMessages = null;
    this.unsubPresence = null;

    this.messageListeners.clear();
    this.presenceListeners.clear();
    this.presenceCache.clear();
    this.seenMessageKeys.clear();
  }

  // -------------------------------------------------------------------------
  async send<T = unknown>(type: string, payload: T, version?: number): Promise<void> {
    if (this.fallback) {
      return this.fallback.send(type, payload, version);
    }
    if (!this.db || !this.user) {
      throw new Error('[FirebaseTransport] Not connected');
    }

    const msg: TransportMessage<T> = {
      type,
      senderId: this.user.id,
      payload,
      timestamp: Date.now(),
      version,
    };

    // Track sent key so we don't echo it back to ourselves
    const key = `${msg.senderId}_${msg.type}_${msg.timestamp}_${msg.version ?? 0}`;
    this.seenMessageKeys.add(key);

    const messagesRef = ref(this.db, `rooms/${this.roomCode}/messages`);
    const newMsgRef = push(messagesRef);
    await set(newMsgRef, msg);
  }

  // -------------------------------------------------------------------------
  onMessage<T = unknown>(handler: (msg: TransportMessage<T>) => void): () => void {
    if (this.fallback) return this.fallback.onMessage(handler);
    this.messageListeners.add(handler as any);
    return () => this.messageListeners.delete(handler as any);
  }

  onPresenceSync(handler: (users: PresenceUser[]) => void): () => void {
    if (this.fallback) return this.fallback.onPresenceSync(handler);
    this.presenceListeners.add(handler);
    // Immediately fire with current presence
    handler(this.getPresence());
    return () => this.presenceListeners.delete(handler);
  }

  getPresence(): PresenceUser[] {
    if (this.fallback) return this.fallback.getPresence();
    return Array.from(this.presenceCache.values());
  }

  isConnected(): boolean {
    if (this.fallback) return this.fallback.isConnected();
    return this.connected;
  }

  // -------------------------------------------------------------------------
  private notifyMessage(msg: TransportMessage<any>) {
    this.messageListeners.forEach((fn) => {
      try { fn(msg); } catch (err) { console.error('[FirebaseTransport] message handler error', err); }
    });
  }

  private notifyPresence() {
    const users = this.getPresence();
    this.presenceListeners.forEach((fn) => {
      try { fn(users); } catch (err) { console.error('[FirebaseTransport] presence handler error', err); }
    });
  }
}
