import { Transport } from './types';
import { FirebaseRealtimeTransport } from './firebaseTransport';
import { SupabaseRealtimeTransport } from './supabaseTransport';
import { MockTransport } from './mockTransport';
import { WebRTCTransport } from './webrtcTransport';

export * from './types';
export * from './mockTransport';
export * from './supabaseTransport';
export * from './webrtcTransport';
export * from './firebaseTransport';

// ---------------------------------------------------------------------------
// Transport priority (auto mode):
//
//  1. Firebase RTDB         — if VITE_FIREBASE_* env vars present
//                             → never pauses, server timestamps, reliable presence
//                             → falls back internally to WebRTC on offline/hotspot
//
//  2. Supabase Realtime     — if VITE_SUPABASE_* env vars present (legacy path)
//                             → falls back internally to BroadcastChannel
//
//  3. WebRTC (PeerJS)       — P2P, works on local hotspot, no internet required
//                             → includes BroadcastChannel for cross-tab on same device
//
//  4. Mock                  — in-memory / BroadcastChannel for dev/test
// ---------------------------------------------------------------------------

function hasFirebaseConfig(): boolean {
  return Boolean(
    import.meta.env?.VITE_FIREBASE_API_KEY &&
    import.meta.env?.VITE_FIREBASE_DATABASE_URL &&
    import.meta.env?.VITE_FIREBASE_PROJECT_ID
  );
}

function hasSupabaseConfig(): boolean {
  return Boolean(
    import.meta.env?.VITE_SUPABASE_URL &&
    import.meta.env?.VITE_SUPABASE_ANON_KEY
  );
}

export type TransportPreference = 'firebase' | 'supabase' | 'webrtc' | 'local' | 'mock' | 'auto';

export function createTransport(preference: TransportPreference = 'auto'): Transport {
  switch (preference) {
    case 'mock':
      return new MockTransport({ useBroadcastChannel: false });

    case 'local':
      return new MockTransport({ useBroadcastChannel: true });

    case 'webrtc':
      return new WebRTCTransport();

    case 'firebase':
      return new FirebaseRealtimeTransport();

    case 'supabase':
      return new SupabaseRealtimeTransport();

    case 'auto':
    default:
      // Prefer Firebase (never pauses, server timestamps, offline-safe via built-in WebRTC fallback)
      if (hasFirebaseConfig()) {
        return new FirebaseRealtimeTransport();
      }
      // Legacy: Supabase if credentials present (falls back to BroadcastChannel internally)
      if (hasSupabaseConfig()) {
        return new SupabaseRealtimeTransport();
      }
      // Offline / hotspot mode: true P2P, no internet required
      return new WebRTCTransport();
  }
}
