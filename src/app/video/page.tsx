import React from 'react';
import type { Metadata } from 'next';
import HomeVideoSocialHub, { VIDEO_EPISODES } from '@/components/HomeVideoSocialHub';
import Link from 'next/link';
import { Video, HeartPulse, Bus, Users, ExternalLink, ThumbsUp, Film, Sparkles, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'রাবিয়ান মিডিয়া ও ৫টি ভিডিও হাব | RU Blood Donation UGC Videos | রাবিয়ান',
  description: 'রাজশাহী বিশ্ববিদ্যালয় শিক্ষার্থীদের জন্য ৫টি ভাইরাল রক্তদান সচেতনতা ভিডিও, অবতার শর্টস ও রিলস প্লেলিস্ট।',
  alternates: {
    canonical: 'https://rabian.site/video',
  },
};

export default function VideoHubPage() {
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10 pb-24 sm:pb-16 space-y-8">
      {/* Page Title */}
      <div className="space-y-2">
        <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200 px-3.5 py-1 rounded-full text-xs font-black">
          <Video className="w-3.5 h-3.5" />
          <span>অফিসিয়াল মিডিয়া ও ৫টি ভিডিও হাব</span>
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          রাবিয়ান রক্তদান সচেতনতা ভিডিও ক্যাম্পেইন
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
          জরুরি মুহূর্তে ১ ব্যাগ রক্তের সন্ধান পাওয়ার জন্য নির্মিত ৫টি বাস্তবমুখী অবতার ভিডিও এবং ফেসবুক রিলস কালেকশন।
        </p>
      </div>

      {/* Embedded Video Player & Social Hub */}
      <HomeVideoSocialHub />

      {/* 5 UGC Videos Showcase Cards */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <Film className="w-5 h-5 text-rose-600" />
              <span>৫টি ভিডিওর পূর্ণাঙ্গ প্যাকেজ (UGC Angles)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              প্রতিটি ভিডিও আলাদা আলাদা বাস্তব সমস্যা এবং তার দ্রুত সমাধান তুলে ধরে।
            </p>
          </div>
          <span className="text-xs font-bold bg-rose-100 text-rose-800 px-3 py-1 rounded-full">
            ১০০% ওয়াটারমার্ক-মুক্ত
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {VIDEO_EPISODES.slice(0, 5).map((ep, idx) => (
            <div
              key={ep.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="relative aspect-[9/16] max-h-[360px] bg-black overflow-hidden group">
                <video
                  src={ep.src}
                  poster={ep.poster}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-rose-600 text-white text-[11px] font-black px-3 py-1 rounded-full shadow pointer-events-none">
                  {ep.badge}
                </div>
              </div>

              <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <h3 className="font-black text-sm text-slate-900 leading-snug">
                    {idx + 1}. {ep.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {ep.hook}
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-2 border-t border-slate-100">
                  <Link
                    href="/blood"
                    className="flex-1 py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black text-center transition"
                  >
                    রক্তদাতার তালিকা
                  </Link>
                  <a
                    href="https://www.facebook.com/1548164021704400"
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center gap-1.5 transition"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>পেজ</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Campus Service Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
        <Link
          href="/blood"
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-rose-400 hover:shadow-md transition space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <HeartPulse className="w-5 h-5" />
          </div>
          <h3 className="text-base font-black text-slate-900 group-hover:text-rose-600 transition">
            রাবি ব্লাড ব্যাংক
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            ৯০-দিন সম্পন্ন প্রস্তুত রক্তদাতাদের তালিকা থেকে সরাসরি কল দিন বা ডোনার হিসেবে নাম যুক্ত করুন।
          </p>
        </Link>

        <Link
          href="/bus"
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-md transition space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Bus className="w-5 h-5" />
          </div>
          <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-600 transition">
            বাস শিডিউল ও টাইমার
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            ক্যাম্পাসের সকল রুটের বাস কখন ছাড়বে তার লাইভ কাউন্টডাউন টাইমার ও পূর্ণাঙ্গ রুট ম্যাপ।
          </p>
        </Link>

        <Link
          href="/directory"
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-base font-black text-slate-900 group-hover:text-blue-600 transition">
            শিক্ষক ও কর্মকর্তা ফোনবুক
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            ৩,৮৭৭ জন শিক্ষকের ভেরিফাইড মোবাইল নম্বর ও অফিসিয়াল ইমেইল ডিরেক্টরি।
          </p>
        </Link>
      </div>
    </div>
  );
}
