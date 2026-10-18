import { Transport } from './types';
import { SupabaseRealtimeTransport } from './supabaseTransport';
import { MockTransport } from './mockTransport';
import { WebRTCTransport } from './webrtcTransport';

export * from './types';
export * from './mockTransport';
export * from './supabaseTransport';
export * from './webrtcTransport';

export function createTransport(preference: 'supabase' | 'local' | 'mock' | 'webrtc' | 'auto' = 'auto'): Transport {
  if (preference === 'mock') {
    return new MockTransport({ useBroadcastChannel: false });
  }
  if (preference === 'local') {
    return new MockTransport({ useBroadcastChannel: true });
  }
  if (preference === 'webrtc') {
    return new WebRTCTransport();
  }
  // Check if Supabase keys exist
  const hasSupabase =
    typeof import.meta !== 'undefined' &&
    Boolean(import.meta.env?.VITE_SUPABASE_URL && import.meta.env?.VITE_SUPABASE_ANON_KEY);

  if (preference === 'supabase' && hasSupabase) {
    return new SupabaseRealtimeTransport();
  }

  // Auto defaults to WebRTC (P2P cross-device + cross-tab hybrid)
  return new WebRTCTransport();
}

