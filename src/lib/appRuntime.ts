'use client';

import { useState, useEffect } from 'react';

/**
 * Returns true only when running inside an installed app shell
 * (PWA standalone/fullscreen/minimal-ui, iOS standalone, Android TWA, or WebView/APK),
 * keeping normal browser website sessions strictly separate.
 */
export function detectInstalledApp(): boolean {
  if (typeof window === 'undefined') return false;

  const isStandaloneMedia =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches;

  const isIosStandalone = Boolean((window.navigator as { standalone?: boolean }).standalone);
  const isAndroidTwa = document.referrer.startsWith('android-app://');
  const isNativeShell =
    Boolean((window as { Capacitor?: unknown }).Capacitor) ||
    Boolean((window as { ReactNativeWebView?: unknown }).ReactNativeWebView) ||
    /; wv\b/i.test(navigator.userAgent) ||
    /RabianApp/i.test(navigator.userAgent);

  // Persist app-shell marker only when verified standalone/TWA/WebView opens start_url (?source=app)
  const isGenuineShell = isStandaloneMedia || isIosStandalone || isAndroidTwa || isNativeShell;
  try {
    if (isGenuineShell) {
      sessionStorage.setItem('rabian_app_session', '1');
      return true;
    }
    return sessionStorage.getItem('rabian_app_session') === '1';
  } catch {
    return isGenuineShell;
  }
}

/** Reactive client hook reporting whether the user is inside the installed Rabian App. */
export function useIsInstalledApp(): boolean {
  const [isApp, setIsApp] = useState(false);

  useEffect(() => {
    const sync = () => setIsApp(detectInstalledApp());
    sync();

    const mq = window.matchMedia('(display-mode: standalone)');
    mq.addEventListener?.('change', sync);
    return () => mq.removeEventListener?.('change', sync);
  }, []);

  return isApp;
}
