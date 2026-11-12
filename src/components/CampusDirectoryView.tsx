'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Phone,
  Mail,
  Building,
  GraduationCap,
  ShieldAlert,
  Briefcase,
  Copy,
  Check,
  MessageCircle,
  Filter,
  Sparkles,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import {
  RU_DIRECTORY_DATA,
  RU_DIRECTORY_DEPT_NAMES,
  RuContact,
  searchRuDirectory,
} from '@/data/ruDirectoryData';

export default function CampusDirectoryView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'teacher' | 'officer' | 'staff' | 'emergency'>('all');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const filteredContacts = useMemo(() => {
    return searchRuDirectory(searchQuery, selectedCategory, selectedDept, 120);
  }, [searchQuery, selectedCategory, selectedDept]);

  const handleCopy = (text: string, id: number) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const counts = RU_DIRECTORY_DATA.counts;

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-3 sm:px-6 py-6">
      {/* 1. HERO HEADER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 text-white p-6 sm:p-8 shadow-2xl border border-emerald-500/20">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-[11px] font-black text-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>অফিশিয়াল ফোনবুক • রাজশাহী বিশ্ববিদ্যালয় ({RU_DIRECTORY_DATA.total} জন)</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            রাবি শিক্ষক ও কর্মকর্তা ফোনবুক ডিরেক্টরি
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed font-medium">
            রাজশাহী বিশ্ববিদ্যালয়ের সকল অনুষদ, বিভাগ, ইনস্টিটিউট, হল ও প্রশাসনিক দপ্তরের ৩,৮৭৭ জন শিক্ষক, কর্মকর্তা ও কর্মচারীর নাম, পদবি, মোবাইল নম্বর ও অফিশিয়াল ইমেইল।
          </p>
        </div>
      </div>

      {/* 2. CONTROLS: CATEGORIES, DEPARTMENT SELECTOR & SEARCH */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        {/* Category Filter Tabs */}
        <div>
          <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
            বিভাগ / ক্যাটাগরি ফিল্টার
          </label>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {[
              { id: 'all', label: `সকল (${RU_DIRECTORY_DATA.total})`, icon: Users },
              { id: 'teacher', label: `👨‍🏫 শিক্ষকবৃন্দ (${counts.teacher})`, icon: GraduationCap },
              { id: 'officer', label: `👔 কর্মকর্তাবৃন্দ (${counts.officer})`, icon: Briefcase },
              { id: 'staff', label: `🏢 কর্মচারী (${counts.staff})`, icon: Building },
              { id: 'emergency', label: `🚨 জরুরি ও প্রশাসন (${counts.emergency})`, icon: ShieldAlert },
            ].map((tab) => {
              const active = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id as any)}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                    active
                      ? 'bg-emerald-700 text-white shadow-md'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & Department Selector */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-slate-100">
          {/* Live Search */}
          <div className="md:col-span-7 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="নাম, পদবি (যেমন: Professor, Dean), বিভাগ বা ফোন নম্বর লিখে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Department Dropdown */}
          <div className="md:col-span-5 relative">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 truncate"
            >
              <option value="all">সকল দপ্তর ও বিভাগ ({RU_DIRECTORY_DEPT_NAMES.length}টি)</option>
              {RU_DIRECTORY_DEPT_NAMES.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. RESULTS SUMMARY */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm sm:text-base font-black text-slate-900">
          সার্চ ফলাফল ({filteredContacts.length} জন প্রদর্শিত)
        </h2>
        {filteredContacts.length >= 120 && (
          <span className="text-[11px] text-slate-500 font-semibold">
            (শীর্ষ ১২০ জন দেখানো হচ্ছে, নির্দিষ্ট করতে সার্চ করুন)
          </span>
        )}
      </div>

      {/* 4. CONTACTS GRID */}
      {filteredContacts.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-2">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">কোনো তথ্য পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-500">
            অনুগ্রহ করে বানান যাচাই করুন অথবা অন্য কোনো কি-ওয়ার্ড দিয়ে খুঁজুন।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredContacts.map((c) => {
            let catBadge = 'bg-slate-100 text-slate-700';
            if (c.category === 'teacher') catBadge = 'bg-emerald-50 text-emerald-800 border-emerald-200';
            else if (c.category === 'officer') catBadge = 'bg-blue-50 text-blue-800 border-blue-200';
            else if (c.category === 'emergency') catBadge = 'bg-red-50 text-red-800 border-red-200';

            return (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-black text-slate-900 leading-snug line-clamp-1" title={c.name}>
                      {c.name}
                    </h3>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border shrink-0 ${catBadge}`}>
                      {c.category === 'teacher'
                        ? 'শিক্ষক'
                        : c.category === 'officer'
                        ? 'কর্মকর্তা'
                        : c.category === 'emergency'
                        ? 'জরুরি'
                        : 'কর্মচারী'}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-emerald-700 leading-tight">
                    {c.designation}
                  </p>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold pt-0.5">
                    <Building className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{c.department}</span>
                  </div>
                </div>

                {/* Contact Action Bar */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                  {c.phone ? (
                    <>
                      <a
                        href={`tel:${c.phone}`}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black flex items-center gap-1 shadow-2xs"
                        title="সরাসরি কল দিন"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{c.phone}</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => handleCopy(c.phone, c.id)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] transition cursor-pointer"
                        title="নম্বর কপি করুন"
                      >
                        {copiedId === c.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>

                      <a
                        href={`https://wa.me/88${c.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`আসসালামু আলাইকুম ${c.name} স্যার, আমি রাবিয়ান প্ল্যাটফর্ম থেকে যোগাযোগ করছি।`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
                        title="WhatsApp এ মেসেজ করুন"
                      >
                        <MessageCircle className="w-3 h-3" />
                      </a>
                    </>
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">নম্বর পাওয়া যায়নি</span>
                  )}

                  {c.email && (
                    <a
                      href={`mailto:${c.email}`}
                      className="px-2 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-bold flex items-center gap-1 truncate max-w-[140px]"
                      title={c.email}
                    >
                      <Mail className="w-3 h-3 shrink-0" />
                      <span className="truncate">{c.email.split('@')[0]}</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
