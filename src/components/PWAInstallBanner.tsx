'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Download, WifiOff, X, Sparkles } from 'lucide-react';

export default function PWAInstallBanner() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const isMerchantOrAdminRoute = pathname?.startsWith('/merchant') || pathname?.startsWith('/admin');

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => {})
        .catch(() => {});
    }

    // 2. Listen to beforeinstallprompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Check if user previously dismissed
      const dismissed = localStorage.getItem('ru_pwa_banner_dismissed');
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 3. Online/Offline status listeners
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('ru_pwa_banner_dismissed', 'true');
  };

  return (
    <>
      {/* Offline Toast */}
      {isOffline && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-[9999] bg-amber-500 text-slate-950 font-black px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 text-xs border-2 border-white animate-bounce">
          <WifiOff className="w-4 h-4" />
          <span>অফলাইন মোড সক্রিয় — ক্যাশড ম্যাপ ও তথ্য দেখতে পাবেন</span>
        </div>
      )}

      {/* Install Floating Pill (Hidden on Merchant/Admin portals so they keep dedicated apps) */}
      {showBanner && deferredPrompt && !isMerchantOrAdminRoute && (
        <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-md text-white p-2.5 sm:p-3 pr-4 rounded-2xl shadow-2xl border border-amber-400/30 flex items-center gap-3 animate-slideUp max-w-[92vw]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-sm">
            <Download className="w-5 h-5" />
          </div>

          <div className="text-left min-w-0">
            <h5 className="text-xs font-black truncate">RU Insiders অ্যাপ ইনস্টল করুন</h5>
            <p className="text-[10px] text-slate-400 truncate">
              দ্রুত ব্রাউজিং ও ইন্টারনেট ছাড়াই ম্যাপ দেখার সুবিধা
            </p>
          </div>

          <button
            onClick={handleInstallClick}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shrink-0 shadow-sm transition"
          >
            ইনস্টল
          </button>

          <button
            onClick={handleDismiss}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}
