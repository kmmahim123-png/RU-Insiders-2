'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Bus,
  Clock,
  MapPin,
  ArrowRight,
  ArrowRightLeft,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Sparkles,
  Download,
  Share2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Maximize2,
  Minimize2,
  Printer,
  Smartphone,
} from 'lucide-react';
import {
  RU_BUS_DATA,
  RU_BUS_TIME_SLOTS,
  RU_BUS_TIME_LABELS,
  RuBusRoute,
  addMins24,
  toBengali12Hour,
  getNextBusDeparture,
  formatBengaliSeconds,
} from '@/data/ruBusData';

interface BusScheduleViewProps {
  initialWidgetMode?: boolean;
}

export default function BusScheduleView({ initialWidgetMode = false }: BusScheduleViewProps) {
  const [direction, setDirection] = useState<'from' | 'to'>('from');
  const [selectedTime, setSelectedTime] = useState<string>('08:15');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [isWidgetMode, setIsWidgetMode] = useState<boolean>(initialWidgetMode);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');
  const [nextDeparture, setNextDeparture] = useState(() => getNextBusDeparture('from'));
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [installSuccess, setInstallSuccess] = useState<boolean>(false);

  // Capture PWA install prompt
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Update live clock & next bus countdown every second
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

  // Adjust selectedTime when direction changes if the slot is not in the list
  useEffect(() => {
    const validSlots = RU_BUS_TIME_SLOTS[direction];
    if (!validSlots.includes(selectedTime)) {
      setSelectedTime(validSlots[0] || '08:15');
    }
  }, [direction, selectedTime]);

  // Filter routes based on direction, time slot, passenger type, and search query
  const filteredRoutes = useMemo(() => {
    const routesForTime: RuBusRoute[] = RU_BUS_DATA[direction]?.[selectedTime] || [];

    return routesForTime.filter((bus) => {
      // 1. Type Filter
      if (selectedType !== 'all') {
        if (!bus.type.includes(selectedType)) return false;
      }

      // 2. Search Query (destinations and stop names)
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const destMatch = bus.dest.toLowerCase().includes(q);
        const labelMatch = bus.label.toLowerCase().includes(q);
        const stopMatch = bus.stops.some((st) => st.toLowerCase().includes(q));
        if (!destMatch && !labelMatch && !stopMatch) return false;
      }

      return true;
    });
  }, [direction, selectedTime, selectedType, searchQuery]);

  const toggleExpand = (busId: string) => {
    setExpandedCards((prev) => ({ ...prev, [busId]: !prev[busId] }));
  };

  const handleInstallClick = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallSuccess(true);
      }
      setInstallPrompt(null);
    } else {
      // Fallback instruction
      alert('আপনার ব্রাউজার মেন্যু (৩টি ডট) থেকে "Add to Home Screen" বা "Install App" চাপুন।');
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className={`space-y-6 ${isWidgetMode ? 'max-w-xl mx-auto p-3' : 'max-w-6xl mx-auto px-3 sm:px-6 py-6'}`}>
      {/* 1. HERO HEADER / WIDGET TOP BAR */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 text-white p-5 sm:p-8 shadow-2xl border border-emerald-500/20">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-[11px] font-extrabold text-amber-300">
              <Bus className="w-3.5 h-3.5 text-amber-400" />
              <span>পরিবহন দপ্তর • রাজশাহী বিশ্ববিদ্যালয় (২১২ নং বিজ্ঞপ্তি)</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>রাবি বাস শিডিউল ও লাইভ টাইমার</span>
              {isWidgetMode && (
                <span className="text-xs bg-amber-400 text-slate-950 px-2 py-0.5 rounded-lg font-bold">
                  উইজেট মোড
                </span>
              )}
            </h1>

            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl leading-relaxed font-medium">
              ০৭-০৪-২০২৫ হতে কার্যকর ১৮টি রুট, স্টপেজ-ভিত্তিক পৌঁছানোর সময় এবং পরবর্তী বাস ছাড়ার নির্ভুল লাইভ কাউন্টডাউন।
            </p>
          </div>

          {/* Live Clock & Next Departure Badge */}
          <div className="w-full md:w-auto bg-black/40 border border-white/15 backdrop-blur-md rounded-2xl p-4 flex flex-col sm:flex-row md:flex-col items-center justify-between gap-3 text-center shrink-0">
            <div>
              <span className="text-[10px] text-emerald-300 font-bold block uppercase tracking-wider">
                বর্তমান সময়
              </span>
              <span className="text-2xl font-mono font-black tracking-widest text-white tabular-nums">
                {currentTimeStr || '--:--:--'}
              </span>
            </div>

            <div className="w-full h-px bg-white/10 hidden md:block" />

            <div className="space-y-0.5">
              <span className="text-[10px] text-amber-300 font-bold block">
                {direction === 'from' ? 'পরবর্তী বাস ক্যাম্পাস হতে' : 'পরবর্তী বাস ক্যাম্পাসে আসা'}
              </span>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 font-black text-xs">
                <Clock className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>{nextDeparture.label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Countdown Banner (পরবর্তী বাস ছাড়তে বাকি) */}
        <div className="mt-5 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-teal-500/20 border border-amber-300/30 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-md">
              <Clock className="w-5 h-5" />
            </span>
            <div>
              <p className="text-[11px] text-emerald-200 font-bold">পরবর্তী বাস ছাড়তে বাকি:</p>
              <p className="text-base sm:text-xl font-black text-amber-300 tracking-tight font-mono">
                {formatBengaliSeconds(nextDeparture.secondsRemaining)}
              </p>
            </div>
          </div>

          {/* Action Buttons: Add to Home Widget & Toggle Widget View */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsWidgetMode(!isWidgetMode)}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 border border-white/20 transition cursor-pointer"
              title={isWidgetMode ? 'পূর্ণ পেজ মোডে দেখুন' : 'কমপ্যাক্ট টাইমার উইজেট মোড'}
            >
              {isWidgetMode ? (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>পূর্ণ ভিউ</span>
                </>
              ) : (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>উইজেট মোড</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleInstallClick}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-lg emil-press cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5 text-slate-950" />
              <span>{installSuccess ? '✓ অ্যাপ যুক্ত হয়েছে' : 'হোম স্ক্রিনে যুক্ত করুন'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. CONTROLS: DIRECTION & TIME & PASSENGER FILTER */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        {/* Direction Switcher */}
        <div>
          <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
            দিক নির্বাচন করুন
          </label>
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setDirection('from')}
              className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                direction === 'from'
                  ? 'bg-emerald-700 text-white shadow-md border border-emerald-800'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowRight className="w-4 h-4 text-amber-300" />
              <span>ক্যাম্পাস হতে যাওয়া (Outbound)</span>
            </button>

            <button
              type="button"
              onClick={() => setDirection('to')}
              className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                direction === 'to'
                  ? 'bg-emerald-700 text-white shadow-md border border-emerald-800'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowRight className="w-4 h-4 rotate-180 text-amber-300" />
              <span>ক্যাম্পাসে আসা (Inbound)</span>
            </button>
          </div>
        </div>

        {/* Departure Time Slots */}
        <div>
          <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
            ছাড়ার সময় নির্বাচন করুন
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar">
            {RU_BUS_TIME_SLOTS[direction].map((slot) => {
              const active = selectedTime === slot;
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedTime(slot)}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                    active
                      ? 'bg-amber-400 text-slate-950 shadow-md border-2 border-amber-500 scale-102'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-slate-700" />
                  <span>{RU_BUS_TIME_LABELS[slot] || slot}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Passenger Filter & Live Search */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-slate-100 items-center">
          {/* Passenger Types */}
          <div className="md:col-span-7 flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'সকল যাত্রী' },
              { id: 'boys', label: 'ছাত্র' },
              { id: 'girls', label: 'ছাত্রী' },
              { id: 'teacher', label: 'শিক্ষক/অফিসার' },
            ].map((t) => {
              const active = selectedType === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedType(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                    active
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Live Search Box */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="গন্তব্য বা স্টপেজের নাম দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* 3. SCHEDULE RESULTS HEADER */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-black text-slate-900">
            রুট ও সময়সূচী ({filteredRoutes.length}টি বাস)
          </h2>
          <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full">
            {RU_BUS_TIME_LABELS[selectedTime]}
          </span>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="text-xs font-bold text-slate-600 hover:text-emerald-700 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>প্রিন্ট শিডিউল</span>
        </button>
      </div>

      {/* 4. BUS ROUTE CARDS */}
      {filteredRoutes.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-3">
          <Bus className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            কোনো বাস রুট পাওয়া যায়নি
          </h3>
          <p className="text-xs text-slate-500">
            অন্য কোনো সময় বা ধরন নির্বাচন করে দেখুন অথবা সার্চ শব্দ পরিবর্তন করুন।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRoutes.map((bus) => {
            const isExpanded = Boolean(expandedCards[bus.id]);
            const isTeacher = bus.type.includes('teacher');
            const isGirls = bus.type.includes('girls') && !bus.type.includes('boys');
            const isBoys = bus.type.includes('boys') && !bus.type.includes('girls');

            let badgeColor = 'bg-slate-100 text-slate-800 border-slate-200';
            if (isTeacher && !isBoys && !isGirls) badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
            else if (isGirls) badgeColor = 'bg-rose-50 text-rose-800 border-rose-200';
            else if (isBoys) badgeColor = 'bg-blue-50 text-blue-800 border-blue-200';

            return (
              <div
                key={bus.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition space-y-4"
              >
                {/* Header: Destination & Type */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                        <Bus className="w-4 h-4" />
                      </span>
                      <h3 className="text-lg font-black text-slate-900 truncate">
                        {bus.dest}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 font-semibold pl-9">
                      {bus.label} • {bus.stops.length}টি স্টপেজ
                    </p>
                  </div>

                  <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-xl border shrink-0 ${badgeColor}`}>
                    {bus.label}
                  </span>
                </div>

                {/* Route Flow Preview (First and Last Stop) */}
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{bus.stops[0] || 'শুরু'}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mx-2" />
                  <div className="flex items-center gap-1.5 min-w-0 text-right">
                    <span className="truncate text-emerald-800 font-black">
                      {bus.stops[bus.stops.length - 1] || 'গন্তব্য'}
                    </span>
                  </div>
                </div>

                {/* Stops Timeline Accordion */}
                <div>
                  <button
                    type="button"
                    onClick={() => toggleExpand(bus.id)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-between transition cursor-pointer"
                  >
                    <span>{isExpanded ? 'স্টপেজ তালিকা লুকান' : 'সকল স্টপেজ ও আনুমানিক সময় দেখুন'}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-3 space-y-2 pt-2 border-t border-slate-100 animate-in fade-in duration-150">
                      {bus.stops.map((stop, idx) => {
                        const delayMins = bus.delays[idx] ?? 0;
                        const stopTime24 = addMins24(selectedTime, delayMins);
                        const stopTimeBn = toBengali12Hour(stopTime24);

                        return (
                          <div
                            key={`${bus.id}-stop-${idx}`}
                            className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg hover:bg-slate-50 transition"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <span className="font-bold text-slate-800 truncate">{stop}</span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {delayMins > 0 && (
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                  +{delayMins} মি.
                                </span>
                              )}
                              <span className="font-mono font-bold text-emerald-800">
                                {stopTimeBn}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. OFFICIAL NOTICES & RULES (২১২ নং বিজ্ঞপ্তি থেকে) */}
      {!isWidgetMode && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 text-emerald-800">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              পরিবহন দপ্তর — বিশেষ নির্দেশনাবলী (২১২ নং বিজ্ঞপ্তি)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600 leading-relaxed font-medium">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="font-bold text-slate-900 block">১. পরিচয়পত্র প্রদর্শন বাধ্যতামূলক:</span>
              <p>বাসে ভ্রমণের সময় শিক্ষক, কর্মকর্তা, কর্মচারী ও শিক্ষার্থীদের পরিচয়পত্র সাথে রাখা আবশ্যক।</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="font-bold text-slate-900 block">২. নির্দিষ্ট স্টপেজে ওঠা-নামা:</span>
              <p>নির্ধারিত স্টপেজ ব্যতীত রাস্তায় বাস থামানো নিষেধ। কাজলা গেট ও অক্টোয়মোড়ে নির্দিষ্ট স্থানে অপেক্ষা করুন।</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="font-bold text-slate-900 block">৩. ফেরত ট্রিপের নিয়ম:</span>
              <p>ক্যাম্পাস হতে ছেড়ে যাওয়া বাসসমূহ পুনরায় ক্যাম্পাসে ফেরার পথে হাদীর মোড় ও ভদ্রা স্টপেজ দিয়ে ক্যাম্পাসে প্রবেশ করবে।</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="font-bold text-slate-900 block">৪. কেন্দ্রীয় লাইব্রেরি ট্রিপ:</span>
              <p>রাত ৮:১০ ও ১০:১০ মিনিটের লাইব্রেরি ট্রিপটি কোর্ট ও সিএন্ডবি রুটের শিক্ষার্থীদের জন্য বিশেষভাবে পরিচালিত হয়।</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
