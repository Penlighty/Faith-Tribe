import { createClient, RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import { Transport, TransportMessage, PresenceUser } from './types';
import { MockTransport } from './mockTransport';

export class SupabaseRealtimeTransport implements Transport {
  private client: SupabaseClient | null = null;
  private channel: RealtimeChannel | null = null;
  private roomCode: string = '';
  private user: PresenceUser | null = null;
  private messageListeners = new Set<(msg: TransportMessage<any>) => void>();
  private presenceListeners = new Set<(users: PresenceUser[]) => void>();
  private fallbackTransport: MockTransport | null = null;
  private isConnecting = false;

  constructor(
    private supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL || '',
    private supabaseKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  ) {}

  getTransportName(): string {
    if (this.fallbackTransport) {
      return this.fallbackTransport.getTransportName();
    }
    return 'Supabase Realtime (Broadcast + Presence)';
  }

  async connect(roomCode: string, user: PresenceUser): Promise<void> {
    this.roomCode = roomCode.toUpperCase();
    this.user = user;
    this.isConnecting = true;

    // If no credentials supplied, seamlessly fall back to cross-tab BroadcastChannel / Mock
    if (!this.supabaseUrl || !this.supabaseKey) {
      this.fallbackTransport = new MockTransport({ useBroadcastChannel: true });
      this.wireFallback();
      return this.fallbackTransport.connect(roomCode, user);
    }

    try {
      this.client = createClient(this.supabaseUrl, this.supabaseKey, {
        realtime: {
          params: {
            eventsPerSecond: 15,
          },
        },
      });

      const channelName = `faith_tribe_room_${this.roomCode}`;
      this.channel = this.client.channel(channelName, {
        config: {
          broadcast: { ack: false, self: true },
          presence: { key: user.id },
        },
      });

      // Presence synchronization
      this.channel.on('presence', { event: 'sync' }, () => {
        const state = this.channel?.presenceState() || {};
        const presenceList: PresenceUser[] = [];
        Object.values(state).forEach((presences: any) => {
          presences.forEach((p: any) => {
            if (p.user) presenceList.push(p.user);
          });
        });
        this.notifyPresence(presenceList);
      });

      // Broadcast message receiver
      this.channel.on('broadcast', { event: '*' }, (payload: any) => {
        if (payload?.payload) {
          this.notifyMessage(payload.payload as TransportMessage<any>);
        }
      });

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Supabase Realtime connection timeout'));
        }, 8000);

        this.channel?.subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            clearTimeout(timeout);
            await this.channel?.track({ user });
            resolve();
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            clearTimeout(timeout);
            reject(new Error(`Supabase channel error: ${status}`));
          }
        });
      });
    } catch (err) {
      console.warn('Falling back to local multi-tab transport:', err);
      this.fallbackTransport = new MockTransport({ useBroadcastChannel: true });
      this.wireFallback();
      await this.fallbackTransport.connect(roomCode, user);
    } finally {
      this.isConnecting = false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.fallbackTransport) {
      return this.fallbackTransport.disconnect();
    }
    if (this.channel) {
      await this.channel.untrack();
      await this.channel.unsubscribe();
      this.channel = null;
    }
    this.messageListeners.clear();
    this.presenceListeners.clear();
  }

  async send<T = unknown>(type: string, payload: T, version?: number): Promise<void> {
    if (this.fallbackTransport) {
      return this.fallbackTransport.send(type, payload, version);
    }
    if (!this.channel || !this.user) {
      throw new Error('Supabase channel not connected');
    }

    const message: TransportMessage<T> = {
      type,
      senderId: this.user.id,
      payload,
      timestamp: Date.now(),
      version,
    };

    await this.channel.send({
      type: 'broadcast',
      event: type,
      payload: message,
    });
  }

  onMessage<T = unknown>(handler: (msg: TransportMessage<T>) => void): () => void {
    if (this.fallbackTransport) {
      return this.fallbackTransport.onMessage(handler);
    }
    this.messageListeners.add(handler as any);
    return () => {
      this.messageListeners.delete(handler as any);
    };
  }

  onPresenceSync(handler: (users: PresenceUser[]) => void): () => void {
    if (this.fallbackTransport) {
      return this.fallbackTransport.onPresenceSync(handler);
    }
    this.presenceListeners.add(handler);
    return () => {
      this.presenceListeners.delete(handler);
    };
  }

  getPresence(): PresenceUser[] {
    if (this.fallbackTransport) {
      return this.fallbackTransport.getPresence();
    }
    if (!this.channel) return this.user ? [this.user] : [];
    const state = this.channel.presenceState() || {};
    const presenceList: PresenceUser[] = [];
    Object.values(state).forEach((presences: any) => {
      presences.forEach((p: any) => {
        if (p.user) presenceList.push(p.user);
      });
    });
    return presenceList;
  }

  isConnected(): boolean {
    if (this.fallbackTransport) {
      return this.fallbackTransport.isConnected();
    }
    return !!this.channel && !this.isConnecting;
  }

  private wireFallback() {
    if (!this.fallbackTransport) return;
    this.messageListeners.forEach((fn) => this.fallbackTransport?.onMessage(fn));
    this.presenceListeners.forEach((fn) => this.fallbackTransport?.onPresenceSync(fn));
  }

  private notifyMessage(msg: TransportMessage<any>) {
    this.messageListeners.forEach((fn) => {
      try {
        fn(msg);
      } catch (err) {
        console.error('Error handling message', err);
      }
    });
  }

  private notifyPresence(users: PresenceUser[]) {
    this.presenceListeners.forEach((fn) => {
      try {
        fn(users);
      } catch (err) {
        console.error('Error handling presence', err);
      }
    });
  }
}
