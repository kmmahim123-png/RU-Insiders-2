'use client';

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
    __ruInitPixels?: Set<string>;
    __ruPixelScriptLoaded?: boolean;
  }
}

export function normalizeValidPixelIds(ids: (string | undefined | null)[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of ids) {
    const clean = (raw || '').trim();
    // Standard Meta Pixel IDs are 10-20 digit numeric IDs (ignore empty or obvious placeholder)
    if (/^\d{10,20}$/.test(clean) && !seen.has(clean)) {
      seen.add(clean);
      out.push(clean);
    }
  }
  return out;
}

function ensureFbqStub() {
  if (typeof window === 'undefined') return;
  if (!window.__ruInitPixels) {
    window.__ruInitPixels = new Set<string>();
  }
  if (window.fbq) return;

  const n: any = function (...args: any[]) {
    if (n.callMethod) {
      n.callMethod.apply(n, args);
    } else {
      n.queue.push(args);
    }
  };
  if (!window._fbq) window._fbq = n;
  n.push = n;
  n.loaded = true;
  n.version = '2.0';
  n.queue = [];
  window.fbq = n;

  if (!window.__ruPixelScriptLoaded) {
    window.__ruPixelScriptLoaded = true;
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }
  }
}

export function initMetaPixels(pixelIds: (string | undefined | null)[], firePageView = true) {
  if (typeof window === 'undefined') return;
  const validIds = normalizeValidPixelIds(pixelIds);
  if (validIds.length === 0) return;

  ensureFbqStub();
  const initSet = window.__ruInitPixels!;

  for (const id of validIds) {
    if (!initSet.has(id)) {
      initSet.add(id);
      window.fbq('init', id);
      if (firePageView) {
        window.fbq('trackSingle', id, 'PageView');
      }
    } else if (firePageView) {
      window.fbq('trackSingle', id, 'PageView');
    }
  }
}

export function trackMetaEvent(
  eventName: 'ViewContent' | 'AddToCart' | 'InitiateCheckout' | 'Purchase' | 'PageView',
  params: Record<string, any> = {},
  targetPixelIds: (string | undefined | null)[] = []
) {
  if (typeof window === 'undefined') return;
  const validIds = normalizeValidPixelIds(targetPixelIds);
  if (validIds.length === 0) return;

  ensureFbqStub();
  const initSet = window.__ruInitPixels!;

  for (const id of validIds) {
    if (!initSet.has(id)) {
      initSet.add(id);
      window.fbq('init', id);
    }
    window.fbq('trackSingle', id, eventName, params);
  }
}
