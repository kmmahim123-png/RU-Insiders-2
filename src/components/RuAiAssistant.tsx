'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { useIsInstalledApp } from '@/lib/appRuntime';
import {
  Bot,
  Send,
  Sparkles,
  X,
  MessageSquare,
  HeartPulse,
  ShoppingBag,
  GraduationCap,
  MapPin,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

interface AiChatMsg {
  role: 'user' | 'assistant';
  content: string;
  providerLabel?: string;
  modelUsed?: string;
  usedTools?: string[];
  createdOrderId?: string | null;
  decisionRoute?: {
    model: string;
    intent: string;
    confidence: number;
    isUrgent?: boolean;
    latencyMs?: number;
  } | null;
}

const QUICK_PROMPTS = [
  { label: '🩸 B+ রক্তদাতা কয়জন?', text: 'আমার জরুরি B+ রক্ত লাগবে, ৯০ দিনের বেশি হয়েছে এমন কতজন এভেইলেবল আছেন ও নম্বর দিন?' },
  { label: '🛍️ হুডি অর্ডার করব', text: 'আপনাদের সবচেয়ে ভালো হুডি ও দাম কত? আমি একটি অর্ডার করতে চাই।' },
  { label: '👨‍🏫 CSE স্যারদের তথ্য', text: 'সিএসই (CSE) ডিপার্টমেন্ট ও শিক্ষকদের তালিকা ও নম্বর দেখাও।' },
  { label: '🗺️ ক্যাম্পাস ও ডেলিভারি', text: 'প্যারিস রোড সম্পর্কে বলো এবং মতিহার ক্যাম্পাসে ডেলিভারি চার্জ কত?' },
];

export default function RuAiAssistant({ mode = 'floating' }: { mode?: 'embedded' | 'floating' }) {
  const pathname = usePathname();
  const isInstalledApp = useIsInstalledApp();
  const [isOpen, setIsOpen] = useState(false);
  const [orbitCenterVisible, setOrbitCenterVisible] = useState(false);
  const [messages, setMessages] = useState<AiChatMsg[]>([
    {
      role: 'assistant',
      content:
        'আসসালামু আলাইকুম! আমি রাবিয়ান (Rabian) স্মার্ট AI ও MCP অ্যাসিস্ট্যান্ট 🤖\n\nআমি সরাসরি লাইভ ডেটাবেজ থেকে:\n• রাবি বাস চলাচল ও পরবর্তী বাস ছাড়ার লাইভ কাউন্টডাউন\n• মাসিক ক্যাম্পাস ম্যারাথন ও রেজিস্ট্রেশন তথ্য\n• যেকোনো গ্রুপের রক্তদাতা (৯০ দিনের হিসাব ও ফোন নম্বর)\n• ডিপার্টমেন্ট ও স্যারদের কন্টাক্ট তথ্য\n• শপের পণ্য সার্চ ও কথা বলেই সরাসরি অর্ডার প্লেস\n• ক্যাম্পাস ম্যাপ ও অর্ডার ট্র্যাকিং — সবকিছু করে দিতে পারি! কী জানতে বা করতে চান বলুন।',
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('ru_open_ai', handleOpen);
    return () => window.removeEventListener('ru_open_ai', handleOpen);
  }, []);

  // Track visibility of central orbit AI hub on homepage (auto-hide floating button when orbit or top hero is visible)
  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    let scrollHandler: (() => void) | null = null;

    const checkEl = () => {
      const el = document.getElementById('orbit-ai-center') || document.getElementById('rabian-hero-orbit');
      if (el) {
        observer = new IntersectionObserver(
          ([entry]) => {
            const isTop = pathname === '/' && typeof window !== 'undefined' && window.scrollY < 380;
            setOrbitCenterVisible(entry.isIntersecting || isTop);
          },
          { threshold: 0 }
        );
        observer.observe(el);
      } else {
        setOrbitCenterVisible(false);
      }

      if (pathname === '/') {
        scrollHandler = () => {
          const isTop = window.scrollY < 380;
          const rect = el?.getBoundingClientRect();
          const inView = rect ? rect.top < window.innerHeight && rect.bottom > 0 : false;
          setOrbitCenterVisible(isTop || inView);
        };
        window.addEventListener('scroll', scrollHandler, { passive: true });
        scrollHandler();
      }
    };

    const t = setTimeout(checkEl, 150);
    return () => {
      clearTimeout(t);
      if (observer) observer.disconnect();
      if (scrollHandler) window.removeEventListener('scroll', scrollHandler);
    };
  }, [pathname]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const sendMessage = async (textOverride?: string) => {
    const cleanText = (textOverride ?? input).trim();
    if (!cleanText || sending) return;

    const nextHistory: AiChatMsg[] = [...messages, { role: 'user', content: cleanText }];
    setMessages(nextHistory);
    if (!textOverride) setInput('');
    setSending(true);

    try {
      const { data: sessionData } = await supabaseBrowser.auth.getSession().catch(() => ({ data: { session: null } }));
      const customerAccessToken = sessionData?.session?.access_token || '';

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CHAT',
          clientMode: isInstalledApp ? 'app' : 'website',
          messages: nextHistory.map((m) => ({ role: m.role, content: m.content })),
          customerAccessToken,
        }),
      });
      const data = await res.json();
      if (data.ok && data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.reply,
            providerLabel: data.providerLabel,
            modelUsed: data.modelUsed,
            usedTools: data.usedTools,
            createdOrderId: data.createdOrderId,
            decisionRoute: data.decisionRoute || null,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `⚠️ ${data.error || 'দুঃখিত, এই মুহূর্তে উত্তর দেওয়া সম্ভব হয়নি।'}`,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ সার্ভারের সাথে সংযোগ করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const renderChatBox = (isEmbedded: boolean) => (
    <div
      className={`flex flex-col bg-white border border-slate-200 overflow-hidden ${
        isEmbedded
          ? 'rounded-3xl shadow-xl h-[540px]'
          : 'rounded-3xl shadow-2xl w-[94vw] sm:w-[420px] h-[78dvh] sm:h-[580px]'
      }`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white px-4 py-3.5 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow">
            <Bot className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-black truncate flex items-center gap-1.5">
              <span>রাবিয়ান AI অ্যাসিস্ট্যান্ট</span>
              <span className="text-[10px] bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 px-1.5 py-0.2 rounded font-bold">
                MCP
              </span>
            </h3>
            <p className="text-[10px] text-emerald-200/80 truncate">
              অর্ডার, রক্তদান (৯০-দিন হিসাব), স্যারদের নম্বর ও ক্যাম্পাস গাইড
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {!isEmbedded && (
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/10 text-white transition cursor-pointer"
              aria-label="Close AI"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
        {QUICK_PROMPTS.map((qp, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => sendMessage(qp.text)}
            disabled={sending}
            className="px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-[11px] font-bold text-slate-700 shrink-0 transition cursor-pointer disabled:opacity-50"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3 bg-slate-50/50">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div
              className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap shadow-xs ${
                m.role === 'user'
                  ? 'bg-emerald-700 text-white rounded-br-sm font-medium'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'
              }`}
            >
              {m.content}

              {m.createdOrderId && (
                <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1.5">
                  <p className="font-black text-emerald-900 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>অর্ডার কনফার্ম হয়েছে: {m.createdOrderId}</span>
                  </p>
                  <Link
                    href={`/track?query=${m.createdOrderId}`}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 underline"
                  >
                    <span>লাইভ অর্ডার ট্র্যাক করুন</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>

            {m.role === 'assistant' && m.providerLabel && (
              <div className="flex flex-wrap items-center gap-1 mt-1 px-1 text-[10px] text-slate-400 font-semibold">
                <span>{m.providerLabel}</span>
                {m.decisionRoute && (
                  <span className="bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">
                    ⚡ Jev: {m.decisionRoute.intent} ({Math.round((m.decisionRoute.confidence || 0) * 100)}%)
                  </span>
                )}
                {m.usedTools && m.usedTools.length > 0 && (
                  <span className="bg-slate-200/70 text-slate-600 px-1.5 py-0.2 rounded">
                    Tools: {Array.from(new Set(m.usedTools)).join(', ')}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}

        {sending && (
          <div className="flex items-center gap-2 text-xs text-slate-500 font-bold pl-1">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
            <span>AI ডেটাবেজ চেক করে উত্তর তৈরি করছে...</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="p-2.5 sm:p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          placeholder="রক্ত, স্যারের নম্বর, পণ্য বা অর্ডার সম্পর্কে লিখুন..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={sending}
          className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="w-10 h-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow transition cursor-pointer disabled:opacity-50 shrink-0"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );

  if (mode === 'embedded') {
    return renderChatBox(true);
  }

  // Do not duplicate floating widget on Admin / Merchant panels
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/merchant')) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-20 lg:bottom-6 right-3 sm:right-6 z-40 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
        orbitCenterVisible && !isOpen
          ? 'opacity-0 pointer-events-none translate-y-8 scale-90'
          : 'opacity-100 pointer-events-auto translate-y-0 scale-100'
      }`}
    >
      {isOpen ? (
        <div className="emil-pop-br">
          {renderChatBox(false)}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2 pl-3.5 pr-4 py-3 rounded-full bg-gradient-to-r from-emerald-800 to-teal-700 hover:from-emerald-700 hover:to-teal-600 text-white shadow-xl border-2 border-amber-400/70 transition-[transform,box-shadow,background-color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
          title="রাবিয়ান AI অ্যাসিস্ট্যান্ট"
        >
          <span className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </span>
          <span className="text-xs font-black tracking-tight">AI চ্যাট ও অর্ডার</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        </button>
      )}
    </div>
  );
}
