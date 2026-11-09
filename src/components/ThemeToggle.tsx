'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('ru_theme') as 'light' | 'dark' | null;
    if (saved === 'dark') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('ru_theme', next);

    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  if (!mounted) {
    return <div className="w-9 h-9 rounded-xl bg-slate-100" />;
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label="Toggle Theme"
      title={theme === 'light' ? 'নাইট মোড চালু করুন (প্যারিস রোড ল্যাম্পলাইট)' : 'ডে মোড চালু করুন'}
      className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-300 border cursor-pointer ${
        theme === 'dark'
          ? 'bg-slate-900 border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.25)]'
          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
      }`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {theme === 'dark' ? (
          <div className="relative animate-spin-slow">
            <Moon className="w-4 h-4 text-amber-400 fill-amber-400/30" />
            <Sparkles className="w-2.5 h-2.5 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
          </div>
        ) : (
          <Sun className="w-4 h-4 text-amber-500 hover:rotate-45 transition-transform duration-300" />
        )}
      </div>
    </button>
  );
}
