'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Video,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ExternalLink,
  HeartPulse,
  ThumbsUp,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Film,
} from 'lucide-react';

export const VIDEO_EPISODES = [
  {
    id: 'angle1',
    badge: '🚨 মিডনাইট ইমার্জেন্সি',
    title: 'রাত ২টায় রক্তের জন্য ফেসবুকে পোস্ট দিয়ে অপেক্ষা নয়',
    hook: 'হাসপাতালের গেটে রক্তের হাহাকার থামাতে রাবিয়ানে ১ ক্লিকেই ক্যাম্পাসের প্রস্তুত রক্তদাতার সরাসরি নম্বর।',
    src: '/videos/blood_donation_ugc_5_angles/Rabian_Blood_Angle1_Emergency.mp4',
    poster: '/videos/blood_donation_ugc_5_angles/Rabian_Blood_Angle1_Emergency_preview.jpg',
    fbUrl: 'https://www.facebook.com/1548164021704400',
  },
  {
    id: 'angle2',
    badge: '❤️ স্বস্তি ও কৃতজ্ঞতা',
    title: 'মাত্র ৫ মিনিটে রক্তের ডোনার পাওয়ার বাস্তব অভিজ্ঞতা',
    hook: 'ছোট ভাইয়ের জীবন বাঁচাতে ৫ মিনিটে ডোনার পেয়েছি—রাবিয়ান ভেরিফায়েড লিস্ট সত্যিই জীবন বাঁচায়!',
    src: '/videos/blood_donation_ugc_5_angles/Rabian_Blood_Angle2_Relief.mp4',
    poster: '/videos/blood_donation_ugc_5_angles/Rabian_Blood_Angle2_Relief_preview.jpg',
    fbUrl: 'https://www.facebook.com/1548164021704400',
  },
  {
    id: 'angle3',
    badge: '🦸‍♂️ ক্যাম্পাস রিয়েল হিরো',
    title: 'রক্ত দিয়ে আপনিও হতে পারেন মতিহারের আসল হিরো',
    hook: 'এক ব্যাগ রক্ত মানে নতুন একটি জীবন। রাবিয়ান ডোনার কমিউনিটিতে নিজের নাম যুক্ত করুন আজই।',
    src: '/videos/blood_donation_ugc_5_angles/Rabian_Blood_Angle3_CampusHero.mp4',
    poster: '/videos/blood_donation_ugc_5_angles/Rabian_Blood_Angle3_CampusHero_preview.jpg',
    fbUrl: 'https://www.facebook.com/1548164021704400',
  },
  {
    id: 'angle4',
    badge: '📱 ১ ক্লিকে সমাধান',
    title: '২০ জনকে কল দিয়ে ফোন বিজি পাওয়ার দিন শেষ',
    hook: 'গ্রুপে গ্রুপে পোস্ট দিয়ে উত্তরের অপেক্ষা না করে সরাসরি রক্তের গ্রুপ ফিল্টার করে কল দিন।',
    src: '/videos/blood_donation_ugc_5_angles/Rabian_Blood_Angle4_CallingVs1Click.mp4',
    poster: '/videos/blood_donation_ugc_5_angles/Rabian_Blood_Angle4_CallingVs1Click_preview.jpg',
    fbUrl: 'https://www.facebook.com/1548164021704400',
  },
  {
    id: 'angle5',
    badge: '🩸 রেয়ার নেগেটিভ ক্রাইসিস',
    title: 'নেগেটিভ রক্তের গ্রুপ সংকটে শেষ ভরসা রাবিয়ান',
    hook: 'ও-নেগেটিভ বা এবি-নেগেটিভ রক্তের চরম সংকটে আলাদা করে রেয়ার রক্তদাতাদের খুঁজে পান ১ সেকেন্ডে।',
    src: '/videos/blood_donation_ugc_5_angles/Rabian_Blood_Angle5_RareNegativeBlood.mp4',
    poster: '/videos/blood_donation_ugc_5_angles/Rabian_Blood_Angle5_RareNegativeBlood_preview.jpg',
    fbUrl: 'https://www.facebook.com/1548164021704400',
  },
  {
    id: 'master',
    badge: '🌟 মূল মাস্টার সংস্করণ',
    title: '১ ব্যাগ রক্তে বাঁচে ৪টি জীবন • পূর্ণাঙ্গ সচেতনতা',
    hook: 'প্লাটিলেট, প্লাজমা ও লোহিত কণিকা দিয়ে ৪ জনের জীবন রক্ষা সম্ভব—ভয় নয়, রক্ত দিন নিয়মিত।',
    src: '/videos/Blood_Donation_Master_clean.mp4',
    poster: '/videos/Blood_Donation_Master_clean_preview.jpg',
    fbUrl: 'https://www.facebook.com/1548164021704400/videos/3748722558616260',
  },
];

export default function HomeVideoSocialHub() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const currentVideo = VIDEO_EPISODES[selectedIdx];
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // When changing video, reset play state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [selectedIdx]);

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
              <span>রাবিয়ান মিডিয়া • ৫টি ভাইরাল রক্তদান UGC ভিডিও ও রিলস হাব</span>
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
              ক্যাম্পাস সচেতনতা ও লাইভ ভিডিও ক্যাম্পেইন
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              জরুরি মুহূর্তে রক্ত খোঁজার ভোগান্তি দূর করতে নির্মিত ৫টি বাস্তবমুখী অবতার ভিডিও। প্রতিটি ভিডিও দেখুন ও ক্যাম্পাসের বন্ধুদের সাথে শেয়ার করুন।
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

        {/* Video Selector Horizontal Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {VIDEO_EPISODES.map((ep, idx) => (
            <button
              key={ep.id}
              type="button"
              onClick={() => setSelectedIdx(idx)}
              className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
                selectedIdx === idx
                  ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/30'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>{ep.badge}</span>
            </button>
          ))}
        </div>

        {/* Video & Info Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Vertical/Shorts Video Player with Custom Controls (5 Cols) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[320px] aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 bg-black group">
              <video
                ref={videoRef}
                src={currentVideo.src}
                poster={currentVideo.poster}
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
                  <span>{currentVideo.badge}</span>
                </span>
                <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-lg border border-white/20">
                  ৯:১৬ রিলস
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
                  {currentVideo.title}
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
                <span>ভিডিও #{selectedIdx + 1}: {currentVideo.badge}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {currentVideo.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                {currentVideo.hook}
              </p>

              {/* Teaser Traffic Warning Box */}
              <div className="bg-amber-400/10 border border-amber-300/30 rounded-xl p-3 text-xs text-amber-200 flex items-start gap-2.5">
                <span className="text-amber-400 text-base leading-none shrink-0">💡</span>
                <p className="leading-relaxed">
                  <strong>সরাসরি ডোনার কল:</strong> ফেসবুক পেজে কারো ব্যক্তিগত গোপনীয়তা ক্ষুণ্ণ না করতে পূর্ণাঙ্গ নম্বর দেওয়া হয় না। কাঙ্ক্ষিত গ্রুপের রক্তদাতার নম্বর পেতে ও ১-ক্লিকে কল দিতে সবসময় <strong>rabian.site/blood</strong> ভিজিট করুন।
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
                href={currentVideo.fbUrl}
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm flex items-center justify-between transition-all group emil-press"
              >
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4 text-blue-400" />
                  <span>ফেসবুক পেজে রিলসটি দেখুন</span>
                </div>
                <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100" />
              </a>
            </div>

            {/* 5 Video UGC Playlist Grid */}
            <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-300 font-bold border-b border-white/10 pb-2">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>৫টি ভাইরাল ভিডিও প্লেলিস্ট (ক্লিক করে শুনুন)</span>
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
                  ৬টি ভিডিও রেডি ✓
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {VIDEO_EPISODES.map((ep, idx) => (
                  <button
                    key={ep.id}
                    type="button"
                    onClick={() => setSelectedIdx(idx)}
                    className={`text-left p-2.5 rounded-xl border transition flex items-center gap-2.5 cursor-pointer ${
                      selectedIdx === idx
                        ? 'bg-rose-950/60 border-rose-500/80 text-rose-200'
                        : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-rose-600/30 text-rose-300 flex items-center justify-center font-black text-xs shrink-0">
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-xs truncate">{ep.badge}</p>
                      <p className="text-[10px] text-slate-400 truncate">{ep.title}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
