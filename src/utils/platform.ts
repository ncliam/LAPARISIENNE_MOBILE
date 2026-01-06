/**
 * Platform Detection Utility
 * Detects if app is running inside Zalo Miniapp or web browser
 */

/**
 * Check if app is running inside Zalo Miniapp
 */
export function isZalo(): boolean {
  // Check for Zalo Bridge
  if (typeof window !== 'undefined' && window.ZJSBridge) {
    return true;
  }

  // Check for Zalo user agent
  if (typeof navigator !== 'undefined') {
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes('zalo');
  }

  return false;
}

/**
 * Check if app is running in web browser
 */
export function isWeb(): boolean {
  return !isZalo();
}

/**
 * Get base path based on platform
 */
export function getBasePath(): string {
  if (isZalo()) {
    // Zalo Miniapp base path
    return `/zapps/${window.APP_ID || ''}`;
  }
  // Web base path
  return '/';
}

/**
 * Platform-aware console logging
 */
export function platformLog(message: string, ...args: any[]) {
  console.log(`[${isZalo() ? 'ZALO' : 'WEB'}] ${message}`, ...args);
}
