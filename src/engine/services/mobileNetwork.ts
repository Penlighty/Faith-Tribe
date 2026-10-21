/**
 * Mobile Network & Hotspot Architecture Utility
 *
 * Handles detection of online/onsite connectivity, Wi-Fi status,
 * triggering native mobile settings (Capacitor/Android/iOS intents),
 * and generating Wi-Fi configuration barcodes for offline fellowship play.
 */

export interface NetworkStatus {
  isOnline: boolean;
  isWifi: boolean;
  effectiveType?: string;
  details?: string;
}

export interface HotspotConfig {
  ssid: string;
  password?: string;
  security?: 'WPA' | 'WEP' | 'nopass';
}

/**
 * Checks the current network environment (Web Network Information API with mobile fallbacks)
 */
export function getNetworkStatus(): NetworkStatus {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { isOnline: true, isWifi: true };
  }

  const isOnline = navigator.onLine ?? true;
  const nav = navigator as any;
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

  let isWifi = false;
  let effectiveType = connection?.effectiveType;

  if (connection) {
    // If type is wifi or ethernet or type is unknown but fast
    if (connection.type === 'wifi' || connection.type === 'ethernet') {
      isWifi = true;
    } else if (!connection.type && isOnline) {
      // Browsers often report wifi as unspecified type
      isWifi = true;
    }
  } else {
    isWifi = isOnline;
  }

  return {
    isOnline,
    isWifi,
    effectiveType,
  };
}

/**
 * Generates a standard Wi-Fi QR Code string that native phone cameras
 * understand to prompt "Join Wi-Fi Network" with 1 click.
 * Spec: WIFI:S:<SSID>;T:<WPA|WEP|nopass>;P:<PASSWORD>;;
 */
export function generateWifiQrString(config: HotspotConfig): string {
  const security = config.password ? config.security || 'WPA' : 'nopass';
  const escapedSsid = escapeWifiString(config.ssid);
  const escapedPass = config.password ? escapeWifiString(config.password) : '';

  return `WIFI:S:${escapedSsid};T:${security};P:${escapedPass};;`;
}

function escapeWifiString(str: string): string {
  return str.replace(/([\\;,:"])/g, '\\$1');
}

/**
 * Triggers mobile device Wi-Fi or Hotspot settings.
 * On Capacitor/Cordova or Android WebView, attempts native URL schemes / intents.
 * On browser, provides actionable instructions.
 */
export function openMobileWifiSettings(): boolean {
  if (typeof window === 'undefined') return false;

  const userAgent = navigator.userAgent || '';
  const isAndroid = /android/i.test(userAgent);
  const isIOS = /iphone|ipad|ipod/i.test(userAgent);

  // Check if Capacitor is available globally
  const cap = (window as any).Capacitor;
  if (cap && cap.isNativePlatform && cap.isNativePlatform()) {
    try {
      // If native plugin exists for opening settings
      if (cap.Plugins?.AppLauncher) {
        if (isAndroid) {
          cap.Plugins.AppLauncher.openUrl({ url: 'package:com.android.settings' });
          return true;
        } else if (isIOS) {
          cap.Plugins.AppLauncher.openUrl({ url: 'App-Prefs:root=WIFI' });
          return true;
        }
      }
    } catch {
      // Fall through
    }
  }

  // Attempt intent on Android browsers
  if (isAndroid) {
    try {
      // Android intent for wireless settings
      window.location.href = 'intent:#Intent;action=android.settings.WIFI_SETTINGS;end';
      return true;
    } catch {
      return false;
    }
  }

  // iOS App-Prefs scheme (may be blocked by modern Safari, graceful fallback)
  if (isIOS) {
    try {
      window.location.href = 'App-Prefs:root=WIFI';
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Triggers mobile device Tethering / Hotspot settings for host.
 */
export function openMobileHotspotSettings(): boolean {
  if (typeof window === 'undefined') return false;

  const userAgent = navigator.userAgent || '';
  const isAndroid = /android/i.test(userAgent);

  const cap = (window as any).Capacitor;
  if (cap && cap.isNativePlatform && cap.isNativePlatform()) {
    try {
      if (cap.Plugins?.AppLauncher && isAndroid) {
        cap.Plugins.AppLauncher.openUrl({ url: 'intent:#Intent;action=android.settings.TETHER_SETTINGS;end' });
        return true;
      }
    } catch {
      // Fall through
    }
  }

  if (isAndroid) {
    try {
      window.location.href = 'intent:#Intent;action=android.settings.TETHER_SETTINGS;end';
      return true;
    } catch {
      return false;
    }
  }

  return false;
}
