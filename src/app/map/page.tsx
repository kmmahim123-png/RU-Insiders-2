'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Home, Layers, ExternalLink, Maximize2, Minimize2, Compass } from 'lucide-react';
import TouristSpotsSection from '@/components/TouristSpotsSection';

export default function MapPage() {
  const [activeTab, setActiveTab] = useState<'gemini_ru' | 'three_stage'>('gemini_ru');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 font-bengali">
      {/* Page Header Bar */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white border-b border-emerald-800/60 py-5 sm:py-7 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Compass className="h-5 w-5 sm:h-6 sm:w-6 text-amber-300" />
              <span>রাজশাহী বিশ্ববিদ্যালয় ও রাজশাহী বিভাগ ইন্টারঅ্যাক্টিভ ম্যাপ</span>
            </h1>
          </div>

          {/* Map Switcher Tabs — আপনার ইনস্পেক্ট করা বাটন */}
          <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-emerald-600/40 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('gemini_ru')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                activeTab === 'gemini_ru'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                  : 'text-emerald-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>🎓 রাবি আনসিন ম্যাপ (জেমিনি আরগন)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('three_stage')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                activeTab === 'three_stage'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                  : 'text-emerald-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>🌊 ৩-ধাপের ওয়াটার ম্যাপ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Map Viewport */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 pt-4">
        {activeTab === 'gemini_ru' ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
            <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between gap-3 border-b border-slate-800 text-xs">
              <span className="font-bold">Unseen RU & Rajshahi • জেমিনি আরগন সংস্করণ</span>
              <div className="flex items-center gap-2">
                <a
                  href="/unseen-ru.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition"
                >
                  নতুন ট্যাবে খুলুন
                </a>
              </div>
            </div>

            {/* আনসিন ম্যাপের মূল আইফ্রেম ভিউ */}
            <div className="w-full h-[75vh] min-h-[600px] bg-[#f6f4ec]">
              <iframe
                src="/unseen-ru.html"
                title="Unseen Rajshahi University Interactive Map (Gemini Argon)"
                className="w-full h-full border-0 select-none"
                allow="clipboard-write; fullscreen; web-share"
              />
            </div>
          </div>
        ) : (
          <TouristSpotsSection />
        )}
      </main>
    </div>
  );
}
