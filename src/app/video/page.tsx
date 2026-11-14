import React from 'react';
import type { Metadata } from 'next';
import HomeVideoSocialHub from '@/components/HomeVideoSocialHub';
import Link from 'next/link';
import { Video, HeartPulse, Bus, Users, ExternalLink, ThumbsUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'রাবিয়ান মিডিয়া ও ফেসবুক ভিডিও হাব | RU Videos & Reels | রাবিয়ান',
  description: 'রাজশাহী বিশ্ববিদ্যালয় শিক্ষার্থীদের জন্য রক্তদান সচেতনতা, বাস শিডিউল গাইড ও ক্যাম্পাস হাইলাইটস ভিডিও হাব।',
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
          <span>অফিসিয়াল মিডিয়া ও ভিডিও পোর্টাল</span>
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          রাবিয়ান ভিডিও ও ফেসবুক ক্যাম্পেইন হাব
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
          রাজশাহী বিশ্ববিদ্যালয়ের শিক্ষার্থীদের জন্য নির্মিত সচেতনতামূলক অবতার ভিডিও, ক্যাম্পাস গাইড এবং লাইভ সোশ্যাল মিডিয়া রিলস।
        </p>
      </div>

      {/* Embedded Video Player & Social Hub */}
      <HomeVideoSocialHub />

      {/* Campus Service Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
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
