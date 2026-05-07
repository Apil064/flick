const STALE_RELOAD_KEY = 'flick_stale_reload_attempted';

async function unregisterStaleServiceWorkers(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    if (registrations.length > 0) {
      console.warn(`[CacheGuardian] Found \${registrations.length} Service Worker(s). Unregistering.`);
      await Promise.all(registrations.map(r => r.unregister()));
    }
  } catch (e) {
    console.error('[CacheGuardian] Failed to unregister Service Workers:', e);
  }
}

async function clearStaleCaches(): Promise<void> {
  if (!('caches' in window)) return;
  try {
    const cacheNames = await caches.keys();
    if (cacheNames.length > 0) {
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.info(`[CacheGuardian] Cleared \${cacheNames.length} cache(s).`);
    }
  } catch (e) {
    console.error('[CacheGuardian] Failed to clear caches:', e);
  }
}

async function detectAndFixStaleBundles(): Promise<void> {
  if (import.meta.env.DEV) return;
  if (sessionStorage.getItem(STALE_RELOAD_KEY)) return;

  try {
    const response = await fetch('/?_cache_check=' + Date.now(), {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!response.ok) return;

    const freshHtml = await response.text();
    const parser = new DOMParser();
    const freshDoc = parser.parseFromString(freshHtml, 'text/html');
    const freshScript = freshDoc.querySelector('script[type="module"][src]') as HTMLScriptElement | null;
    if (!freshScript?.src) return;

    const currentScript = document.querySelector('script[type="module"][src]') as HTMLScriptElement | null;
    if (currentScript && currentScript.src !== freshScript.src) {
      console.warn('[CacheGuardian] Stale bundle detected! Forcing reload...');
      sessionStorage.setItem(STALE_RELOAD_KEY, '1');
      window.location.reload();
    }
  } catch (e) {
    console.warn('[CacheGuardian] Could not check for stale bundles:', e);
  }
}

export async function initCacheGuardian(): Promise<void> {
  await unregisterStaleServiceWorkers();

  if (!import.meta.env.DEV) {
    await clearStaleCaches();
    await detectAndFixStaleBundles();
  }

  sessionStorage.removeItem(STALE_RELOAD_KEY);
}
