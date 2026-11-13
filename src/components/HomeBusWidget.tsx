'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bus,
  Clock,
  ArrowRight,
  ArrowRightLeft,
  MapPin,
  Sparkles,
} from 'lucide-react';
import {
  RU_BUS_DATA,
  RU_BUS_TIME_SLOTS,
  RU_BUS_TIME_LABELS,
  getNextBusDeparture,
  formatBengaliSeconds,
} from '@/data/ruBusData';

export default function HomeBusWidget() {
  const [direction, setDirection] = useState<'from' | 'to'>('from');
  const [nextDeparture, setNextDeparture] = useState(() => getNextBusDeparture('from'));
  const [currentTimeStr, setCurrentTimeStr] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      setCurrentTimeStr(`${h}:${m}:${s}`);
      setNextDeparture(getNextBusDeparture(direction));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [direction]);

  const activeRoutes = RU_BUS_DATA[direction]?.[nextDeparture.slot] || [];
  const destinations = Array.from(new Set(activeRoutes.map((r) => r.dest))).slice(0, 5);

  return (
    <div className="w-full bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 rounded-3xl p-5 sm:p-7 text-white shadow-xl border border-emerald-500/25 relative overflow-hidden">
      {/* Background radial accent */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        {/* Left: Next Bus Info & Countdown */}
        <div className="space-y-3 max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 text-xs font-black">
              <Bus className="w-3.5 h-3.5" />
              <span>রাবি বাস লাইভ ট্র্যাকার</span>
            </span>

            {/* Direction Toggle Pill */}
            <button
              type="button"
              onClick={() => setDirection((d) => (d === 'from' ? 'to' : 'from'))}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition cursor-pointer"
            >
              <ArrowRightLeft className="w-3 h-3 text-amber-300" />
              <span>
                {direction === 'from' ? 'মতিহার ক্যাম্পাস → শহর' : 'শহর → মতিহার ক্যাম্পাস'}
              </span>
            </button>
          </div>

          <div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>পরবর্তী বাস:</span>
              <span className="text-amber-300 font-extrabold">{nextDeparture.label}</span>
            </h3>

            <p className="text-xs sm:text-sm text-emerald-100/90 font-bold mt-1 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                ছাড়তে বাকি:{' '}
                <span className="text-amber-300 font-extrabold font-mono">
                  {formatBengaliSeconds(nextDeparture.secondsRemaining)}
                </span>
                {nextDeparture.isTomorrow ? ' (আগামীকাল সূচি)' : ''}
              </span>
            </p>
          </div>

          {/* Destinations Preview */}
          {destinations.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-emerald-300/80 font-bold">গন্তব্য:</span>
              {destinations.map((dest) => (
                <span
                  key={dest}
                  className="px-2 py-0.5 rounded-lg bg-white/10 text-[11px] font-bold text-white border border-white/10"
                >
                  {dest}
                </span>
              ))}
              {activeRoutes.length > destinations.length && (
                <span className="text-[10px] text-emerald-300 font-bold">
                  +{activeRoutes.length - destinations.length} টি রুট
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right: CTA Link to Full Bus Schedule */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto shrink-0">
          <Link
            href="/bus"
            className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition emil-press"
          >
            <Bus className="w-4 h-4 text-slate-950" />
            <span>সকল রুটের সময়সূচি ও স্টপ →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
