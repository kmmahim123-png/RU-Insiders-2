'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Video,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ExternalLink,
  HeartPulse,
  Share2,
  MessageCircle,
  ThumbsUp,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';

export default function HomeVideoSocialHub() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <section className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 rounded-3xl p-5 sm:p-8 md:p-10 text-white shadow-2xl border border-emerald-900/40 relative overflow-hidden">
      {/* Glow Orbs */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6 sm:space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 bg-rose-500/20 border border-rose-400/30 text-rose-300 px-3.5 py-1 rounded-full text-xs font-black tracking-wide">
              <Video className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>রাবিয়ান মিডিয়া • অফিসিয়াল ফেসবুক ভিডিও ও রিলস হাব</span>
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
              ক্যাম্পাস সচেতনতা ও লাইভ ভিডিও আপডেট
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              রাবিয়ান ফেসবুক পেজে প্রকাশিত রক্তদান ক্যাম্পেইনের বিশেষ উপস্থাপনা। ভিডিওটি দেখুন এবং রাজশাহী বিশ্ববিদ্যালয়ের জরুরি প্রয়োজনে পাশে থাকুন।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <a
              href="https://www.facebook.com/1548164021704400"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-2xl bg-[#1877F2] hover:bg-blue-600 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:shadow-blue-500/30 transition-all emil-press cursor-pointer"
            >
              <ThumbsUp className="w-4 h-4 fill-white" />
              <span>পেজ ফলো করুন</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>

            <Link
              href="/blood"
              className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all emil-press cursor-pointer"
            >
              <HeartPulse className="w-4 h-4" />
              <span>রক্তদাতা তালিকা</span>
            </Link>
          </div>
        </div>

        {/* Video & Info Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Vertical/Shorts Video Player with Custom Controls (5 Cols) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[320px] aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 bg-black group">
              <video
                ref={videoRef}
                src="/videos/Blood_Donation_Master_clean.mp4"
                poster="/videos/Blood_Donation_Master_clean_preview.jpg"
                playsInline
                loop
                muted={isMuted}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="w-full h-full object-cover cursor-pointer"
                onClick={togglePlay}
              />

              {/* Video Overlay Top Badge */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                <span className="bg-rose-600/90 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  <span>লাইভ ক্যাম্পেইন</span>
                </span>
                <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-lg border border-white/20">
                  ৩০ সেকেন্ড
                </span>
              </div>

              {/* Center Play Button Overlay when paused */}
              {!isPlaying && (
                <button
                  type="button"
                  onClick={togglePlay}
                  className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer backdrop-blur-sm border-2 border-white/30"
                  title="ভিডিও প্লে করুন"
                >
                  <Play className="w-7 h-7 fill-white ml-1" />
                </button>
              )}

              {/* Bottom Player Controls */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 flex items-center justify-between text-xs font-bold text-white">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                </button>

                <p className="text-[11px] font-bold text-slate-200 line-clamp-1 px-2">
                  ১ ব্যাগ রক্তে বাঁচে ৪টি জীবন
                </p>

                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition cursor-pointer"
                  title={isMuted ? 'সাউন্ড অন করুন' : 'মিউট করুন'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Campaign Details & Action Hub (7 Cols) */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5">
            {/* Active Episode Badge */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-black">
                <HeartPulse className="w-4 h-4" />
                <span>রক্তদান সচেতনতা ক্যাম্পেইন • ১ম সংস্করণ</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                হাসপাতালে ১ ব্যাগ রক্তের জন্য হাহাকার আপনি দেখেছেন?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                আপনার দেওয়া মাত্র এক ব্যাগ রক্ত প্রক্রিয়াজাত করে প্লাটিলেট, প্লাজমা ও লোহিত কণিকা দিয়ে ৪ জন মানুষের জীবন বাঁচানো সম্ভব। রক্তদানে ভয় নয়, নিয়মিত রক্ত দিন—নিজে সুস্থ থাকুন ও অন্যকে বাঁচান।
              </p>

              {/* Teaser Traffic Warning Box */}
              <div className="bg-amber-400/10 border border-amber-300/30 rounded-xl p-3 text-xs text-amber-200 flex items-start gap-2.5">
                <span className="text-amber-400 text-base leading-none shrink-0">💡</span>
                <p className="leading-relaxed">
                  <strong>বিশেষ দ্রষ্টব্য:</strong> ফেসবুক পেজে রক্তদাতাদের পূর্ণাঙ্গ ফোন নম্বর বা তালিকা প্রকাশ করা হয় না। রক্তদাতার রক্তের গ্রুপ নির্বাচন করে সরাসরি কল দিতে সবসময় <strong>rabian.site/blood</strong> ভিজিট করুন।
                </p>
              </div>
            </div>

            {/* Quick Action Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Link
                href="/blood"
                className="p-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm flex items-center justify-between shadow-lg transition-all group emil-press"
              >
                <div className="flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-white" />
                  <span>জরুরি রক্তের তালিকা ও ডোনার কল</span>
                </div>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href="https://www.facebook.com/1548164021704400/videos/3748722558616260"
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm flex items-center justify-between transition-all group emil-press"
              >
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4 text-blue-400" />
                  <span>ফেসবুকে ভিডিওটি দেখুন ও শেয়ার করুন</span>
                </div>
                <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100" />
              </a>
            </div>

            {/* Daily 3 Video Pipeline Schedule */}
            <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-300 font-bold border-b border-white/10 pb-2">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>দৈনিক ৩টি ক্যাম্পেইন ভিডিও সময়সূচী</span>
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
                  নিয়মিত আপডেট
                </span>
              </div>

              <div className="space-y-1.5 text-slate-300">
                <div className="flex items-center justify-between py-1 bg-white/5 px-2.5 rounded-xl border border-white/5">
                  <span className="font-extrabold text-white">🌅 সকাল ০৮:৩০:</span>
                  <span className="text-slate-300 truncate max-w-[200px] sm:max-w-xs">১ ব্যাগ রক্তে বাঁচে ৪টি জীবন</span>
                  <span className="text-emerald-400 font-black text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded">লাইভ ✓</span>
                </div>
                <div className="flex items-center justify-between py-1 px-2.5 rounded-xl text-slate-400">
                  <span className="font-extrabold">☀️ দুপুর ০১:৩০:</span>
                  <span className="truncate max-w-[200px] sm:max-w-xs">রক্তের ৯০ দিনের বৈজ্ঞানিক নিয়ম</span>
                  <span className="text-amber-300 text-[10px]">শিডিউল ⏳</span>
                </div>
                <div className="flex items-center justify-between py-1 px-2.5 rounded-xl text-slate-400">
                  <span className="font-extrabold">🌙 সন্ধ্যা ০৭:৩০:</span>
                  <span className="truncate max-w-[200px] sm:max-w-xs">১ ক্লিকে ক্যাম্পাসে রক্তের সন্ধান</span>
                  <span className="text-amber-300 text-[10px]">শিডিউল ⏳</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
