'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Flame,
  Calendar,
  Clock,
  MapPin,
  Trophy,
  Award,
  Shirt,
  CheckCircle2,
  AlertCircle,
  Users,
  Send,
  Phone,
  ArrowRight,
  ShieldAlert,
  Printer,
  Sparkles,
  Share2,
} from 'lucide-react';
import { MarathonEvent, MarathonRegistration } from '@/types';

export default function MarathonPage() {
  const [marathons, setMarathons] = useState<MarathonEvent[]>([]);
  const [selectedMarathon, setSelectedMarathon] = useState<MarathonEvent | null>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    department: '',
    studentId: '',
    session: '',
    gender: 'male' as 'male' | 'female' | 'other',
    tShirtSize: 'L' as 'S' | 'M' | 'L' | 'XL' | 'XXL',
    bloodGroup: '',
    emergencyContact: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [confirmedReg, setConfirmedReg] = useState<MarathonRegistration | null>(null);

  // Countdown State
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
          setMarathons(data.marathons);
          setSelectedMarathon(data.marathons[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Update deadline countdown timer every second
  useEffect(() => {
    if (!selectedMarathon?.deadline) return;

    const deadlineTime = new Date(selectedMarathon.deadline).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = deadlineTime - now;

      if (diff <= 0 || selectedMarathon.isOpen === false) {
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
  }, [selectedMarathon]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMarathon) return;
    setFormError('');

    if (!form.name.trim() || !form.phone.trim() || !form.department.trim() || !form.studentId.trim() || !form.emergencyContact.trim()) {
      setFormError('অনুগ্রহ করে নাম, ফোন, বিভাগ, রোল ও জরুরি নম্বর পূরণ করুন!');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REGISTER_MARATHON',
          payload: {
            marathonId: selectedMarathon.id,
            ...form,
          },
        }),
      });
      const data = await res.json();
      if (data.ok && data.registration) {
        setConfirmedReg(data.registration);
      } else {
        setFormError(data.error || 'রেজিস্ট্রেশন সম্পন্ন করা সম্ভব হয়নি।');
      }
    } catch {
      setFormError('সার্ভারে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setSubmitting(false);
    }
  };

  const toBn = (n: number) => {
    const digits: Record<string, string> = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
      '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
    };
    return String(n).padStart(2, '0').split('').map((c) => digits[c] || c).join('');
  };

  const isRegistrationClosed = !selectedMarathon?.isOpen || timeLeft.isExpired;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24 pt-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        {/* 1. HERO BANNER */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 text-white p-6 sm:p-10 shadow-2xl border border-emerald-500/20">
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-black text-amber-300">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>রাবিয়ান মাসিক ক্যাম্পাস ম্যারাথন • রাজশাহী বিশ্ববিদ্যালয়</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                {selectedMarathon?.title || 'রাবিয়ান ক্যাম্পাস রান ২০২৬'}
              </h1>
              <p className="text-xs sm:text-base text-emerald-100/90 max-w-2xl leading-relaxed font-medium">
                {selectedMarathon?.description ||
                  'ক্যাম্পাসে স্বাস্থ্য সচেতনতা ও ভাতৃত্ববোধ তৈরিতে রাবিয়ান প্রতি মাসে আয়োজন করছে ক্যাম্পাস রান। ফিনিশারদের জন্য রয়েছে আকর্ষণীয় মেডেল, সার্টিফিকেট ও রানিং কিট!'}
              </p>
            </div>

            {/* Event Key Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/15">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-emerald-300 block font-bold">তারিখ</span>
                  <span className="text-xs sm:text-sm font-black">{selectedMarathon?.date || '২০২৬-১১-৩০'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-emerald-300 block font-bold">সময়</span>
                  <span className="text-xs sm:text-sm font-black">{selectedMarathon?.time || 'সকাল ০৬:৩০'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-emerald-300 block font-bold">দূরত্ব</span>
                  <span className="text-xs sm:text-sm font-black">{selectedMarathon?.distance || '৭.৫ কিমি'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-emerald-300 block font-bold">আসন সংখ্যা</span>
                  <span className="text-xs sm:text-sm font-black">
                    সর্বোচ্চ {selectedMarathon?.maxParticipants || 300} জন
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. REGISTRATION DEADLINE COUNTDOWN TIMER */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-4 text-center">
          <div className="flex items-center justify-center gap-2 text-slate-800">
            <Clock className="w-5 h-5 text-amber-500" />
            <h2 className="text-base sm:text-xl font-black">
              {isRegistrationClosed
                ? 'অনলাইন রেজিস্ট্রেশনের সময়সীমা শেষ হয়েছে'
                : 'অনলাইন রেজিস্ট্রেশন শেষ হতে বাকি'}
            </h2>
          </div>

          {!isRegistrationClosed ? (
            <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-lg mx-auto pt-2">
              <div className="p-3 sm:p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-2xl sm:text-4xl font-black font-mono text-emerald-900 block">
                  {toBn(timeLeft.days)}
                </span>
                <span className="text-[11px] font-bold text-emerald-700">দিন</span>
              </div>

              <div className="p-3 sm:p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-2xl sm:text-4xl font-black font-mono text-emerald-900 block">
                  {toBn(timeLeft.hours)}
                </span>
                <span className="text-[11px] font-bold text-emerald-700">ঘণ্টা</span>
              </div>

              <div className="p-3 sm:p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-2xl sm:text-4xl font-black font-mono text-emerald-900 block">
                  {toBn(timeLeft.minutes)}
                </span>
                <span className="text-[11px] font-bold text-emerald-700">মিনিট</span>
              </div>

              <div className="p-3 sm:p-4 rounded-2xl bg-amber-50 border border-amber-300">
                <span className="text-2xl sm:text-4xl font-black font-mono text-amber-900 block animate-pulse">
                  {toBn(timeLeft.seconds)}
                </span>
                <span className="text-[11px] font-bold text-amber-700">সেকেন্ড</span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-bold max-w-md mx-auto">
              ⚠️ এই মাসের ম্যারাথনের অনলাইন আবেদন বর্তমানে বন্ধ রয়েছে। পরবর্তী মাসের ম্যারাথনের ঘোষণার জন্য অপেক্ষা করুন।
            </div>
          )}
        </div>

        {/* 3. EVENT ROUTE & PERKS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-emerald-800">
              <MapPin className="w-5 h-5 text-emerald-600 shrink-0" />
              <h3 className="text-base font-black text-slate-900">রুট ও ট্র্যাক পরিক্রমা</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-semibold">
              {selectedMarathon?.route ||
                'সাবাশ বাংলাদেশ চত্বর -> প্যারিস রোড -> কাজলা গেট -> জোহা চত্বর -> কেন্দ্রীয় লাইব্রেরি -> শহীদ মিনার চত্বর।'}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-emerald-800">
              <Award className="w-5 h-5 text-amber-500 shrink-0" />
              <h3 className="text-base font-black text-slate-900">ফিনিশারদের পুরস্কার ও কিট</h3>
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5 font-bold">
              {(selectedMarathon?.rewards || [
                'অফিশিয়াল রানিং ব্যাজ ও ই-সনদ',
                'ফিনিশার মেডেল (শীর্ষ ৫০ জন)',
                'স্বাস্থ্যসম্মত নাস্তা ও পানি সরবরাহ',
              ]).map((rew, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{rew}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 4. APPLICATION FORM / CONFIRMATION MODAL */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-6">
          {confirmedReg ? (
            /* Registration Success Badge */
            <div className="text-center space-y-6 py-4 animate-scaleUp">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full font-black">
                  রেজিস্ট্রেশন নিশ্চিত হয়েছে
                </span>
                <h3 className="text-2xl font-black text-slate-900">
                  অভিনন্দন, {confirmedReg.name}!
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  আপনার ম্যারাথন রেজিস্ট্রেশন সফলভাবে গৃহীত হয়েছে।
                </p>
              </div>

              {/* Runner Bib Card */}
              <div className="max-w-md mx-auto p-6 rounded-3xl bg-gradient-to-br from-emerald-900 to-slate-950 text-white border-2 border-amber-400 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/20 pb-3">
                  <span className="text-[11px] font-bold text-emerald-300">রাবিয়ান মাসিক ক্যাম্পাস রান</span>
                  <span className="text-xs bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded">
                    সাইজ: {confirmedReg.tShirtSize}
                  </span>
                </div>

                <div className="text-center py-2">
                  <span className="text-[10px] text-amber-300 font-bold block uppercase tracking-widest">
                    অফিশিয়াল বিব নম্বর (BIB NUMBER)
                  </span>
                  <span className="text-4xl font-mono font-black text-amber-400 tracking-wider">
                    {confirmedReg.bibNumber}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-left text-xs pt-2 border-t border-white/15">
                  <div>
                    <span className="text-[10px] text-slate-400 block">বিভাগ</span>
                    <span className="font-bold">{confirmedReg.department}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">রোল/আইডি</span>
                    <span className="font-bold">{confirmedReg.studentId}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>কনফার্মেশন স্লিপ প্রিন্ট করুন</span>
                </button>
              </div>
            </div>
          ) : (
            /* Application Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-black text-slate-900">
                  অংশগ্রহণকারীর আবেদন ফরম
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  সঠিক তথ্য প্রদান করে আপনার রেজিস্ট্রেশন সম্পন্ন করুন।
                </p>
              </div>

              {formError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <fieldset disabled={isRegistrationClosed || submitting} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      পূর্ণ নাম <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="আপনার নাম লিখুন"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      মোবাইল নম্বর (WhatsApp) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="০১৭XXXXXXXX"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      বিভাগ (Department) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: CSE, ফার্মেসি, বাংলা"
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      রোল / স্টুডেন্ট আইডি <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: ২২XXXXXXX"
                      value={form.studentId}
                      onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      জরুরি যোগাযোগ নম্বর <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="অভিভাবক বা বন্ধুর নম্বর"
                      value={form.emergencyContact}
                      onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">লিঙ্গ</label>
                    <select
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="male">পুরুষ (Male)</option>
                      <option value="female">নারী (Female)</option>
                      <option value="other">অন্যান্য</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      টি-শার্ট সাইজ (T-Shirt Size) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.tShirtSize}
                      onChange={(e) => setForm({ ...form, tShirtSize: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="S">S (Small)</option>
                      <option value="M">M (Medium)</option>
                      <option value="L">L (Large)</option>
                      <option value="XL">XL (Extra Large)</option>
                      <option value="XXL">XXL (Double Extra Large)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">রক্তের গ্রুপ (ঐচ্ছিক)</label>
                    <input
                      type="text"
                      placeholder="যেমন: A+, O+, B+"
                      value={form.bloodGroup}
                      onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isRegistrationClosed || submitting}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-xl flex items-center justify-center gap-2 emil-press cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submitting ? 'আবেদন জমা হচ্ছে...' : 'ম্যারাথনে অংশগ্রহণ নিশ্চিত করুন'}</span>
                  </button>
                </div>
              </fieldset>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
