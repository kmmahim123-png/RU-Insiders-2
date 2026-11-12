'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingBag,
  Bell,
  Menu,
  X,
  Home,
  MapPin,
  Newspaper,
  LogOut,
  CheckCircle2,
  Flame,
  MessageCircle,
  ShieldCheck,
  ArrowRight,
  Lock,
  Search,
  Store,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { BreakingNewsItem } from '@/types';
import { supabaseBrowser, SUPABASE_PUBLIC_URL, SUPABASE_PUBLIC_ANON_KEY } from '@/lib/supabaseBrowser';

export interface UserSession {
  uid?: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'student' | 'visitor';
}

export default function NavbarAndAuth() {
  const pathname = usePathname();
  const [showSplash, setShowSplash] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);
  const [showGoogleSetupModal, setShowGoogleSetupModal] = useState(false);
  const [googleAuthLoading, setGoogleAuthLoading] = useState(false);
  const [googleAuthError, setGoogleAuthError] = useState('');
  const [copiedCallback, setCopiedCallback] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [breakingNews, setBreakingNews] = useState<string[]>([
    '🔥 রাবি অফিশিয়াল উইন্টার হুডি ও রাজশাহীর খাঁটি খেজুরের গুড়ের প্রি-অর্ডার চলছে! মতিহার ক্যাম্পাসে ফ্রি ডেলিভারি।',
    '🎓 রাবির ৪২টি স্পট ও রাজশাহী জেলার ২২টি অঞ্চল কতটুকু ঘুরলেন? এখনই ম্যাপে টিক দিয়ে নিজের ভ্রমণ সনদ ডাউনলোড করুন!',
    '✍️ Inside RU পোর্টালে আপনার গল্প, কবিতা বা গবেষণাপত্র জমা দিন এবং জিতে নিন আকর্ষণীয় গিফট হ্যাম্পার।',
  ]);
  const [breakingItems, setBreakingItems] = useState<BreakingNewsItem[]>([
    {
      id: 'bn-init-1',
      title: 'রাবি অফিশিয়াল উইন্টার হুডি ও রাজশাহীর খাঁটি খেজুরের গুড়ের প্রি-অর্ডার চলছে! মতিহার ক্যাম্পাসে ফ্রি ডেলিভারি',
      imageUrl: '/mockups/hoodie-front.jpg',
      link: '/shop',
    },
    {
      id: 'bn-init-2',
      title: 'ঐতিহাসিক প্যারিস রোড ও রাবি ক্যাম্পাসের ৪২টি স্থাপত্য স্পট এক্সপ্লোর করুন ও নিজের ভ্রমণ সনদ ডাউনলোড করুন',
      imageUrl: '/campus/paris-road-rain.jpg',
      link: '/map',
    },
    {
      id: 'bn-init-3',
      title: 'Inside RU সাহিত্য ও নিউজ পোর্টাল — ক্যাম্পাসের তাজা খবর ও গবেষণাপত্র পড়ুন',
      imageUrl: '/campus/ru-spot.jpg',
      link: '/inside-ru',
    },
  ]);
  const [tickerIdx, setTickerIdx] = useState(0);
  const [whatsappNumber, setWhatsappNumber] = useState('8801700000000');
  const [subContact, setSubContact] = useState('');
  const [subSuccess, setSubSuccess] = useState(false);
  const [pushPerm, setPushPerm] = useState<string>('default');

  // 1. Paris Road Splash Screen (once per browser session)
  useEffect(() => {
    try {
      const shown = sessionStorage.getItem('ru_splash_shown');
      if (!shown) {
        setShowSplash(true);
        sessionStorage.setItem('ru_splash_shown', '1');
        const timer = setTimeout(() => setShowSplash(false), 1600);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  // 2. Load Local State (Auth, Cart, Notifications)
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushPerm(Notification.permission);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      }
    }

    const loadLocalState = () => {
      try {
        const savedUser = localStorage.getItem('ru_user_session');
        if (savedUser) setUser(JSON.parse(savedUser));

        const savedCart = JSON.parse(localStorage.getItem('ru_cart_items') || '[]');
        const totalQty = savedCart.reduce((sum: number, i: any) => sum + Number(i.quantity || 1), 0);
        setCartCount(totalQty);
      } catch {}
    };

    loadLocalState();
    window.addEventListener('ru_auth_changed', loadLocalState);
    window.addEventListener('ru_cart_updated', loadLocalState);

    // Sync real Supabase Google OAuth Session
    const syncSupabaseUser = (session: any, triggerPush = false) => {
      if (!session?.user) return;
      const meta = session.user.user_metadata || {};
      const realUser: UserSession = {
        uid: session.user.id,
        name: meta.full_name || meta.name || (session.user.email || '').split('@')[0] || 'User',
        email: session.user.email || '',
        avatar: meta.avatar_url || meta.picture || '/logo.png',
        role: 'visitor',
      };
      localStorage.setItem('ru_user_session', JSON.stringify(realUser));
      setUser(realUser);
      setShowGoogleSetupModal(false);
      window.dispatchEvent(new Event('ru_auth_changed'));
      if (triggerPush) {
        requestChromeNotification();
      }
      // Clean OAuth code params from URL if present
      if (typeof window !== 'undefined' && (window.location.search.includes('code=') || window.location.hash.includes('access_token='))) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    supabaseBrowser.auth.getSession().then(({ data }) => {
      if (data?.session?.user) {
        syncSupabaseUser(data.session, false);
      }
    }).catch(() => {});

    const { data: authSub } = supabaseBrowser.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        syncSupabaseUser(session, true);
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('ru_user_session');
        setUser(null);
        window.dispatchEvent(new Event('ru_auth_changed'));
      }
    });

    // Fetch store metadata (breaking news, whatsapp, notifications)
    const fetchStoreMeta = async () => {
      try {
        const res = await fetch('/api/store');
        const data = await res.json();
        if (data.settings?.breakingNewsItems?.length) {
          setBreakingItems(data.settings.breakingNewsItems);
        }
        if (data.settings?.breakingNews?.length) {
          setBreakingNews(data.settings.breakingNews);
        }
        if (data.settings?.whatsappNumber) setWhatsappNumber(data.settings.whatsappNumber);
        if (data.notifications?.length) {
          setNotifications(data.notifications);
          const latest = data.notifications[0];
          const lastSeenId = localStorage.getItem('ru_last_pushed_id');
          if (
            latest &&
            latest.sendChromePush &&
            latest.id !== lastSeenId &&
            typeof window !== 'undefined' &&
            'Notification' in window &&
            Notification.permission === 'granted'
          ) {
            localStorage.setItem('ru_last_pushed_id', latest.id);
            new Notification(latest.title, {
              body: latest.message,
              icon: '/logo.png',
            });
          }
        }
      } catch {}
    };

    fetchStoreMeta();

    // Auto-refresh breaking news on custom event or periodic interval
    const intervalStore = setInterval(fetchStoreMeta, 25000);
    window.addEventListener('ru_breaking_updated', fetchStoreMeta);

    return () => {
      authSub?.subscription?.unsubscribe();
      clearInterval(intervalStore);
      window.removeEventListener('ru_breaking_updated', fetchStoreMeta);
      window.removeEventListener('ru_auth_changed', loadLocalState);
      window.removeEventListener('ru_cart_updated', loadLocalState);
    };
  }, []);

  // Breaking news ticker cycling every 4.5 seconds
  useEffect(() => {
    const listLen = breakingItems.length > 0 ? breakingItems.length : breakingNews.length;
    if (listLen <= 1) return;
    const interval = setInterval(() => {
      setTickerIdx((prev) => (prev + 1) % listLen);
    }, 4500);
    return () => clearInterval(interval);
  }, [breakingItems, breakingNews]);

  // Request Chrome Notification Permission
  const requestChromeNotification = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      setPushPerm('granted');
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      setPushPerm(perm);
      if (perm === 'granted') {
        new Notification('Rabian নোটিফিকেশন চালু হয়েছে!', {
          body: 'নতুন অফার, খেজুরের গুড়, হুডি ও ক্যাম্পাস নিউজ সবার আগে Chrome-এ পাবেন।',
          icon: '/logo.png',
        });
      }
    } catch {}
  };

  // Authentic Google OAuth Sign-In (shows real phone/browser Gmail account picker via accounts.google.com)
  const handleGoogleSignIn = async () => {
    setGoogleAuthError('');
    setGoogleAuthLoading(true);
    try {
      // Check if Google OAuth is enabled in Supabase project settings
      const settingsRes = await fetch(`${SUPABASE_PUBLIC_URL}/auth/v1/settings`, {
        headers: { apikey: SUPABASE_PUBLIC_ANON_KEY },
      });
      const settingsData = settingsRes.ok ? await settingsRes.json() : null;

      if (settingsData?.external && settingsData.external.google === false) {
        setShowGoogleSetupModal(true);
        return;
      }

      const redirectUrl =
        typeof window !== 'undefined' ? window.location.origin : undefined;

      const { error } = await supabaseBrowser.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        if (error.message.toLowerCase().includes('provider') || error.message.toLowerCase().includes('not enabled')) {
          setShowGoogleSetupModal(true);
        } else {
          setGoogleAuthError(error.message);
          setShowGoogleSetupModal(true);
        }
      }
    } catch (err: any) {
      setGoogleAuthError(err?.message || 'Google লগইন চালু করা যায়নি।');
      setShowGoogleSetupModal(true);
    } finally {
      setGoogleAuthLoading(false);
    }
  };

  useEffect(() => {
    const triggerGoogle = () => {
      handleGoogleSignIn();
    };
    window.addEventListener('ru_open_google_signin', triggerGoogle);
    return () => window.removeEventListener('ru_open_google_signin', triggerGoogle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    try {
      await supabaseBrowser.auth.signOut();
    } catch {}
    localStorage.removeItem('ru_user_session');
    setUser(null);
    window.dispatchEvent(new Event('ru_auth_changed'));
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subContact.trim()) return;
    try {
      await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SUBSCRIBE_NOTIFICATION', payload: { contact: subContact } }),
      });
      setSubSuccess(true);
      setSubContact('');
      await requestChromeNotification();
    } catch {}
  };

  return (
    <>
      {/* 1. Entrance Splash Screen */}
      {showSplash && (
        <div
          onClick={() => setShowSplash(false)}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-emerald-950/95 text-white cursor-pointer transition-opacity duration-250 ease-[cubic-bezier(0.23,1,0.32,1)]"
          style={{
            backgroundImage: `linear-gradient(rgba(6, 78, 59, 0.88), rgba(2, 44, 34, 0.96)), url('/campus/paris-road-rain.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="relative flex items-center justify-center w-36 h-36 rounded-full border-4 border-amber-400 shadow-[0_0_50px_rgba(250,204,21,0.6)] bg-white/10 backdrop-blur-md p-3 overflow-hidden">
            <img src="/logo-center.png" alt="Rabian" className="absolute inset-0 w-full h-full object-contain p-2" />
            <img src="/logo-hands.png" alt="Rotating Hands" className="absolute inset-0 w-full h-full object-contain animate-[spin_12s_linear_infinite]" />
          </div>
          <h1 className="mt-6 text-3xl sm:text-5xl font-black tracking-tight drop-shadow-lg">
            রাবিয়ান
          </h1>
          <p className="mt-2 text-sm sm:text-base text-amber-300 font-bold text-center px-4">
            রাজশাহী বিশ্ববিদ্যালয় স্মার্ট ক্যাম্পাস প্ল্যাটফর্ম ও ডিজিটাল হাব
          </p>
          <p className="mt-6 text-xs text-emerald-200/80 bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-sm">
            প্রবেশ করতে যেকোনো স্থানে স্পর্শ করুন
          </p>
        </div>
      )}

      {/* 2. Main Header (Top Bar removed as requested) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
          {/* Logo & Brand with Animated Rotating Hands */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative w-11 h-11 rounded-full border-2 border-amber-400 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
              <img
                src="/logo-center.png"
                alt="RU Emblem"
                className="absolute inset-0 w-full h-full object-contain p-1"
              />
              <img
                src="/logo-hands.png"
                alt="Rotating Hands"
                className="absolute inset-0 w-full h-full object-contain animate-[spin_12s_linear_infinite]"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg sm:text-2xl text-slate-900 tracking-tight group-hover:text-emerald-700 transition whitespace-nowrap">
                  রাবিয়ান
                </span>
                <span className="hidden xs:inline-block bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0">
                  Rabian
                </span>
              </div>
              <p className="hidden sm:inline-block text-[11px] text-slate-500 font-medium">
                রাজশাহী বিশ্ববিদ্যালয় স্মার্ট ক্যাম্পাস প্ল্যাটফর্ম
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {[
              { href: '/shop', label: 'শপ' },
              { href: '/bus', label: '🚌 বাস' },
              { href: '/marathon', label: '🏃‍♂️ ম্যারাথন' },
              { href: '/inside-ru', label: 'নিউজ ও সাহিত্য' },
              { href: '/academics', label: 'বিভাগ ও স্যার' },
              { href: '/blood', label: '🩸 রক্তদান' },
              { href: '/clubs', label: 'ক্লাবসমূহ' },
              { href: '/map', label: 'ম্যাপ' },
              { href: '/track', label: 'অর্ডার' },
            ].map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3.5 py-2 rounded-xl text-sm font-bold transition ${
                    active
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Notification Bell (Desktop & Tablet) */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 relative transition"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </button>

              {notifOpen && (
                <>
                  {/* Backdrop for outside click dismissal on all screen sizes */}
                  <div
                    className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 transition-opacity"
                    onClick={() => setNotifOpen(false)}
                  />

                  {/* Mobile-Optimized Dropdown / Drawer Modal */}
                  <div className="fixed inset-x-3 top-20 sm:top-16 sm:inset-x-auto sm:right-6 sm:w-96 max-h-[85vh] flex flex-col bg-white rounded-3xl sm:rounded-2xl border border-slate-200 shadow-2xl p-4 sm:p-5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                          <Bell className="w-4 h-4" />
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm">ক্যাম্পাস ও অফার নোটিফিকেশন</h4>
                      </div>
                      <button
                        onClick={() => setNotifOpen(false)}
                        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
                        aria-label="Close"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Push Permission Toggle Button */}
                    <div className="pt-2.5 pb-2 shrink-0">
                      <button
                        onClick={requestChromeNotification}
                        className={`w-full text-xs py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 shadow-xs ${
                          pushPerm === 'granted'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                        }`}
                      >
                        {pushPerm === 'granted' ? '✓ Chrome Push চালু আছে' : '🔔 ব্রাউজার নোটিফিকেশন চালু করুন'}
                      </button>
                    </div>

                    {/* Notification items scroll area */}
                    <div className="flex-1 overflow-y-auto divide-y divide-slate-100 my-1 pr-1 overscroll-contain max-h-56">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-6">বর্তমানে কোনো নতুন নোটিফিকেশন নেই</p>
                      ) : (
                        notifications.map((n) => (
                          <Link
                            key={n.id}
                            href={n.link || '/'}
                            onClick={() => setNotifOpen(false)}
                            className="block py-2.5 hover:bg-slate-50 px-2.5 rounded-xl transition group"
                          >
                            <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600">{n.title}</p>
                            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                          </Link>
                        ))
                      )}
                    </div>

                    {/* WhatsApp / Email Form */}
                    <form onSubmit={handleSubscribe} className="pt-3 border-t border-slate-100 space-y-2 shrink-0">
                      <p className="text-[11px] text-slate-500 font-medium">
                        WhatsApp বা ইমেইলে সবার আগে আপডেট পেতে যুক্ত হোন:
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={subContact}
                          onChange={(e) => setSubContact(e.target.value)}
                          placeholder="আপনার WhatsApp নাম্বার বা ইমেইল"
                          className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
                        />
                        <button
                          type="submit"
                          className="bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-blue-800 shrink-0 transition"
                        >
                          যুক্ত হোন
                        </button>
                      </div>
                      {subSuccess && (
                        <p className="text-[11px] text-emerald-600 font-bold">
                          ✓ আপনার নাম্বার/ইমেইল সফলভাবে যুক্ত হয়েছে!
                        </p>
                      )}
                    </form>
                  </div>
                </>
              )}
            </div>

            {/* Google Sign-In (Desktop & Tablet) */}
            <div className="hidden sm:flex">
              {user ? (
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                  <div className="relative">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = '/logo.png';
                      }}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <Link
                    href="/track"
                    className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-extrabold shrink-0 transition"
                    title="আমার অর্ডার ও কেনার হিস্ট্রি"
                  >
                    আমার অর্ডার
                  </Link>
                  <button
                    onClick={handleLogout}
                    title="লগআউট"
                    className="text-slate-500 hover:text-red-600 p-1"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGoogleSignIn}
                  disabled={googleAuthLoading}
                  className="h-11 px-3 sm:px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800 shadow-sm cursor-pointer disabled:opacity-60 transition"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z" />
                    <path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z" />
                  </svg>
                  <span>{googleAuthLoading ? 'অ্যাকাউন্ট খুলছে...' : 'Google দিয়ে লগইন'}</span>
                </button>
              )}
            </div>

            {/* WhatsApp Direct Chat Button (Desktop & Tablet) */}
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('আসসালামু আলাইকুম! আমি Rabian থেকে সরাসরি যোগাযোগ করছি।')}`}
              target="_blank"
              rel="noreferrer"
              className="hidden md:flex h-11 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white items-center gap-1.5 text-xs font-bold shadow-sm transition shrink-0"
              title="WhatsApp সরাসরি চ্যাট"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>WhatsApp</span>
            </a>

            {/* Spotlight Search Shortcut (Visible on All Devices) */}
            <button
              onClick={() => window.dispatchEvent(new Event('ru_open_spotlight'))}
              className="w-10 h-10 sm:w-auto sm:h-11 px-2.5 sm:px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center sm:justify-start gap-2 text-xs font-bold transition shrink-0 cursor-pointer shadow-xs"
              title="স্পটলাইট সার্চ (Ctrl + K)"
            >
              <Search className="w-4 h-4 text-emerald-600" />
              <span className="hidden md:inline text-slate-500 font-medium">অনুসন্ধান...</span>
              <kbd className="hidden lg:inline px-1.5 py-0.5 text-[10px] bg-slate-100 border border-slate-200 rounded text-slate-500 font-bold">
                ⌘K
              </kbd>
            </button>

            {/* Day / Night Theme Toggle (Desktop & Tablet) */}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            {/* Admin Portal Shortcut (Desktop & Tablet) */}
            <Link
              href="/admin"
              className="hidden sm:flex w-10 h-10 sm:w-auto sm:h-11 px-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-amber-600 hover:bg-slate-50 items-center justify-center transition shrink-0"
              title="অ্যাডমিন ও ক্লাব পোর্টাল"
            >
              <ShieldCheck className="w-4 h-4" />
            </Link>

            {/* Shopping Bag Button with Slide-Over Drawer */}
            <button
              id="ru-cart-icon-badge"
              onClick={() => window.dispatchEvent(new Event('ru_open_cart'))}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl border border-slate-200 flex items-center justify-center text-slate-800 hover:bg-slate-100 relative shrink-0 transition-transform cursor-pointer shadow-xs"
              aria-label="Shopping Cart Drawer"
              title="শপিং কার্ট ড্রয়ার"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-10 h-10 sm:w-11 sm:h-11 rounded-xl border border-slate-200 flex items-center justify-center text-slate-800 shrink-0"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* 4. Breaking News Ticker (Clickable with Rich Image Thumbnail) */}
        {(() => {
          const activeItem = breakingItems[tickerIdx % (breakingItems.length || 1)] || null;
          const fallbackText = breakingNews[tickerIdx % (breakingNews.length || 1)] || 'রাবি ক্যাম্পাসের তাজা খবর ও সাহিত্য পড়তে ক্লিক করুন';
          const title = activeItem?.title || fallbackText;
          const imageUrl = activeItem?.imageUrl;
          const linkUrl = activeItem?.link || '/inside-ru?category=ব্রেকিং নিউজ';

          return (
            <Link
              href={linkUrl}
              className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm block hover:opacity-95 transition group shadow-md cursor-pointer border-y border-red-500/40 relative z-20"
              title="Inside RU নিউজ পোর্টালে সম্পূর্ণ সংবাদ পড়ুন"
            >
              <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4 overflow-hidden">
                <div className="flex items-center gap-3 sm:gap-4 overflow-hidden flex-1 min-w-0">
                  <span className="bg-white text-red-700 font-black px-2.5 sm:px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shrink-0 shadow text-[11px] sm:text-xs">
                    <Flame className="w-4 h-4 fill-red-600 text-red-600" />
                    <span>ব্রেকিং নিউজ</span>
                  </span>

                  <div className="w-14 h-10 sm:w-20 sm:h-12 rounded-xl overflow-hidden shrink-0 border-2 border-white/50 shadow-md bg-black/20">
                    <img
                      src={imageUrl || '/campus/paris-road-rain.jpg'}
                      alt="নিউজ ছবি"
                      className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-250 ease-[cubic-bezier(0.23,1,0.32,1)]"
                      onError={(e) => {
                        e.currentTarget.src = '/campus/paris-road-rain.jpg';
                      }}
                    />
                  </div>

                  <p className="line-clamp-2 sm:truncate font-bold text-white group-hover:underline text-xs sm:text-sm tracking-wide leading-snug">
                    {title.replace(/^[🔥🚨\s]+/, '')}
                  </p>
                </div>

                <div className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-bold text-amber-200 group-hover:text-white shrink-0 bg-black/25 group-hover:bg-black/35 px-2.5 sm:px-3.5 py-2 rounded-xl border border-white/15 transition">
                  <span className="hidden xs:inline">বিস্তারিত</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </div>
            </Link>
          );
        })()}

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-2 animate-in slide-in-from-top-2 duration-150">
            {/* Mobile User Profile or Login */}
            <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
              {user ? (
                <div className="flex items-center gap-2">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = '/logo.png';
                    }}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">{user.name}</p>
                    <p className="text-[10px] text-slate-500">{user.email}</p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleGoogleSignIn();
                  }}
                  disabled={googleAuthLoading}
                  className="w-full py-2.5 px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 font-bold text-xs flex items-center justify-center gap-2 shadow-xs"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z" />
                    <path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z" />
                  </svg>
                  <span>Sign in with Google (Gmail নির্বাচন করুন)</span>
                </button>
              )}

              {user && (
                <div className="flex items-center gap-2">
                  <Link
                    href="/track"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs bg-blue-50 border border-blue-200 text-blue-700 font-extrabold px-2.5 py-1 rounded-lg"
                  >
                    আমার অর্ডার
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-red-600 font-bold px-2 py-1 rounded-lg hover:bg-red-50"
                  >
                    লগআউট
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions (Theme & WhatsApp) */}
            <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700">
                <span>থিম পরিবর্তন</span>
                <ThemeToggle />
              </div>

              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('আসসালামু আলাইকুম! আমি Rabian থেকে সাহায্য চাই।')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            </div>

            {/* Nav Links */}
            <div className="space-y-1">
              {[
                { href: '/', label: '🏠 হোমপেজ' },
                { href: '/bus', label: '🚌 রাবি বাস শিডিউল ও টাইমার' },
                { href: '/marathon', label: '🏃‍♂️ মাসিক ক্যাম্পাস ম্যারাথন' },
                { href: '/shop', label: '🛍️ শপ (হুডি, খেজুরের গুড়, নাড়ু)' },
                { href: '/map', label: '🗺️ ৩-ধাপের ওয়াটার ম্যাপ ও সনদ' },
                { href: '/inside-ru', label: '📰 নিউজ, সাহিত্য ও গবেষণা' },
                { href: '/merchant', label: '🏪 মার্চেন্ট পোর্টাল (পণ্য বিক্রি করুন)' },
                { href: '/academics', label: '🎓 বিভাগ, স্যার ও অ্যালামনাই ডিরেক্টরি' },
                { href: '/blood', label: '🩸 রাবি ব্লাড ব্যাংক (৯০+ দিন এভেইলেবল)' },
                { href: '/clubs', label: '🏆 ক্লাবসমূহ ও মেম্বারশিপ' },
                { href: '/track', label: '📦 অর্ডার ট্র্যাকিং' },
                { href: '/admin', label: '🔐 অ্যাডমিন ও মার্চেন্ট লগইন' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 px-3 rounded-xl text-xs sm:text-sm font-bold text-slate-800 hover:bg-slate-100"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* 5. Google OAuth Setup Helper (Shown only if Supabase Google Provider is not yet enabled in Dashboard) */}
      {showGoogleSetupModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto overscroll-contain animate-scaleUp">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <svg className="w-7 h-7 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z" />
                  <path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z" />
                </svg>
                <div>
                  <h3 className="font-black text-slate-900 text-base">আসল Google Sign-In অ্যাক্টিভেশন বাকি</h3>
                  <p className="text-[11px] text-slate-500">আপনার Supabase প্রোজেক্টে Google Provider এখন অফ আছে</p>
                </div>
              </div>
              <button
                onClick={() => setShowGoogleSetupModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {googleAuthError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                ত্রুটি: {googleAuthError}
              </div>
            )}

            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2.5 text-xs text-slate-800 leading-relaxed">
              <p className="font-black text-blue-950">
                আসল Google অ্যাকাউন্ট পিকার (ফোনের সব Gmail লিস্ট) চালু করতে মাত্র ২ মিনিটের এই ২টি ধাপ সম্পন্ন করুন:
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-[11px] sm:text-xs">
                <li>
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-blue-700 underline inline-flex items-center gap-1"
                  >
                    Google Cloud Console → Credentials <ExternalLink className="w-3 h-3" />
                  </a>
                  -এ গিয়ে <strong>OAuth 2.0 Client ID (Web application)</strong> তৈরি করুন এবং নিচের Callback URL-টি{" "}
                  <strong>Authorized redirect URIs</strong>-এ পেস্ট করুন:
                </li>
              </ol>

              <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-blue-200">
                <code className="text-[11px] font-mono text-slate-800 flex-1 truncate">
                  {`${SUPABASE_PUBLIC_URL}/auth/v1/callback`}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`${SUPABASE_PUBLIC_URL}/auth/v1/callback`);
                    setCopiedCallback(true);
                    setTimeout(() => setCopiedCallback(false), 2000);
                  }}
                  className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  {copiedCallback ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCallback ? 'কপি হয়েছে' : 'কপি'}</span>
                </button>
              </div>

              <ol start={2} className="list-decimal list-inside space-y-1.5 text-[11px] sm:text-xs">
                <li>
                  পাওয়া <strong>Client ID</strong> এবং <strong>Client Secret</strong>-টি{" "}
                  <a
                    href="https://supabase.com/dashboard/project/skqtcsoovtnxxbhtracp/auth/providers"
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-emerald-700 underline inline-flex items-center gap-1"
                  >
                    Supabase Dashboard → Auth → Google <ExternalLink className="w-3 h-3" />
                  </a>
                  -এ বসিয়ে <strong>Enable Google</strong> অন করে Save দিন (এবং Site URL-এ{" "}
                  <code className="bg-white px-1 rounded">https://ruinsider-2.vercel.app</code> যুক্ত করুন)।
                </li>
              </ol>
              <p className="text-[11px] text-emerald-800 font-bold pt-1">
                ✓ Save দেওয়ার সাথে সাথেই আর কোনো কোড বদলাতে হবে না — প্রতিবার এই বাটনে চাপলেই ইউজারের ফোনে থাকা সব আসল Gmail অ্যাকাউন্ট দেখাবে!
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition cursor-pointer"
              >
                সেটআপ শেষ? পুনরায় চেষ্টা করুন
              </button>
              <Link
                href="/admin"
                onClick={() => setShowGoogleSetupModal(false)}
                className="py-2.5 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>অ্যাডমিন / মার্চেন্ট পোর্টাল</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 6. Sticky Mobile Bottom Navigation (One UI 6.1 thumb ergonomics) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-[0_-4px_20px_rgba(15,23,42,0.06)]">
        {[
          { href: '/', label: 'হোম', icon: Home },
          { href: '/shop', label: 'শপ', icon: ShoppingBag },
          { href: '/inside-ru', label: 'নিউজ', icon: Newspaper },
          { href: '/map', label: 'ম্যাপ', icon: MapPin },
          { href: '/cart', label: 'কার্ট', icon: ShoppingBag, badge: cartCount },
        ].map((item) => {
          const Icon = item.icon;
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`min-w-[56px] min-h-[44px] flex flex-col items-center justify-center rounded-xl px-2 relative ${
                active ? 'text-blue-700 font-extrabold' : 'text-slate-600 font-medium'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[11px] mt-0.5">{item.label}</span>
              {item.badge ? (
                <span className="absolute top-0.5 right-2 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
