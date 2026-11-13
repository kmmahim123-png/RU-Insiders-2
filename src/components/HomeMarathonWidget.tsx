'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Flame,
  Calendar,
  Clock,
  MapPin,
  Trophy,
  ArrowRight,
  Shirt,
  Sparkles,
} from 'lucide-react';
import { MarathonEvent } from '@/types';

export default function HomeMarathonWidget() {
  const [marathon, setMarathon] = useState<MarathonEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });

  useEffect(() => {
    fetch('/api/store')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.marathons) && data.marathons.length > 0) {
          setMarathon(data.marathons[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!marathon?.deadline) return;

    const deadlineTime = new Date(marathon.deadline).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = deadlineTime - now;

      if (diff <= 0 || marathon.isOpen === false) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [marathon]);

  if (!marathon) return null;

  const toBn = (n: number) => {
    const digits: Record<string, string> = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
      '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
    };
    return String(n).padStart(2, '0').split('').map((d) => digits[d] || d).join('');
  };

  return (
    <div className="w-full bg-gradient-to-r from-amber-600 via-rose-600 to-red-700 rounded-3xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left: Event Details */}
        <div className="space-y-3 max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-xs font-black">
              <Flame className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>মাসিক রাবিয়ান ম্যারাথন</span>
            </span>

            {marathon.isOpen && !timeLeft.isExpired ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[11px] font-black shadow-xs">
                ● আবেদন চলছে
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/60 text-white text-[11px] font-bold">
                আবেদন শেষ
              </span>
            )}
          </div>

          <div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {marathon.title}
            </h3>
            <p className="text-xs sm:text-sm text-amber-100/90 font-medium mt-1">
              {marathon.description}
            </p>
          </div>

          {/* Event Meta */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-amber-100">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-300" />
              {marathon.date} {marathon.time ? `(${marathon.time})` : ''}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-300" />
              {marathon.edition || 'রাবি ক্যাম্পাস'}
            </span>
            <span className="flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-300" />
              {marathon.distance} রান
            </span>
            <span className="flex items-center gap-1">
              <Shirt className="w-3.5 h-3.5 text-amber-300" />
              অফিশিয়াল টি-শার্ট ও মেডেল
            </span>
          </div>

          {/* Live Application Deadline Countdown */}
          {!timeLeft.isExpired && marathon.isOpen && (
            <div className="pt-1">
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-black/30 border border-white/20 backdrop-blur-sm">
                <Clock className="w-4 h-4 text-amber-300 animate-spin" />
                <span className="text-xs font-bold text-amber-200">
                  আবেদনের শেষ সময়:
                </span>
                <div className="flex items-center gap-1 text-xs font-black font-mono text-white">
                  <span className="bg-white/20 px-1.5 py-0.5 rounded">{toBn(timeLeft.days)} দিন</span> :
                  <span className="bg-white/20 px-1.5 py-0.5 rounded">{toBn(timeLeft.hours)} ঘণ্টা</span> :
                  <span className="bg-white/20 px-1.5 py-0.5 rounded">{toBn(timeLeft.minutes)} মিনিট</span> :
                  <span className="bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded font-black">{toBn(timeLeft.seconds)} সে</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: CTA Button */}
        <div className="shrink-0 w-full lg:w-auto">
          <Link
            href="/marathon"
            className="w-full lg:w-auto px-6 py-4 rounded-2xl bg-white hover:bg-amber-50 text-slate-950 font-black text-xs sm:text-sm shadow-2xl flex items-center justify-center gap-2 transition emil-press"
          >
            <Flame className="w-4 h-4 text-rose-600" />
            <span>ম্যারাথনে অংশগ্রহণ ও আবেদন ফর্ম →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
