import { Transport } from './types';
import { SupabaseRealtimeTransport } from './supabaseTransport';
import { MockTransport } from './mockTransport';

export * from './types';
export * from './mockTransport';
export * from './supabaseTransport';

export function createTransport(preference: 'supabase' | 'local' | 'mock' = 'supabase'): Transport {
  if (preference === 'mock') {
    return new MockTransport({ useBroadcastChannel: false });
  }
  if (preference === 'local') {
    return new MockTransport({ useBroadcastChannel: true });
  }
  return new SupabaseRealtimeTransport();
}
