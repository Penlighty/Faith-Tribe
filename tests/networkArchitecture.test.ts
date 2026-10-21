import { describe, it, expect } from 'vitest';
import { generateWifiQrString, getNetworkStatus } from '../src/engine/services/mobileNetwork';
import { createTransport } from '../src/engine/transport';

describe('Mobile Network & Hotspot Architecture', () => {
  it('generates standard Wi-Fi QR strings for camera instant connection', () => {
    const qrString = generateWifiQrString({
      ssid: 'FaithTribe-Camp',
      password: 'graceandtruth',
      security: 'WPA',
    });

    expect(qrString).toBe('WIFI:S:FaithTribe-Camp;T:WPA;P:graceandtruth;;');
  });

  it('generates open Wi-Fi QR string when password is empty', () => {
    const openQrString = generateWifiQrString({
      ssid: 'FellowshipHall',
    });

    expect(openQrString).toBe('WIFI:S:FellowshipHall;T:nopass;P:;;');
  });

  it('escapes special characters in Wi-Fi SSID and password', () => {
    const escapedQr = generateWifiQrString({
      ssid: 'My:Wifi;Net',
      password: 'pass;word:123',
    });

    expect(escapedQr).toContain('My\\:Wifi\\;Net');
    expect(escapedQr).toContain('pass\\;word\\:123');
  });

  it('reports network status structure properly', () => {
    const status = getNetworkStatus();
    expect(status).toHaveProperty('isOnline');
    expect(status).toHaveProperty('isWifi');
  });

  it('creates WebRTC transport for onsite hotspot offline mode', () => {
    const webrtc = createTransport('webrtc');
    expect(webrtc).toBeDefined();
    expect(webrtc.getTransportName()).toContain('WebRTC');
  });
});
