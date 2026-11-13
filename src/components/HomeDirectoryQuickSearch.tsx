'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Phone,
  MessageCircle,
  GraduationCap,
  ArrowRight,
  Sparkles,
  Users,
  Building,
} from 'lucide-react';
import {
  RU_DIRECTORY_DATA,
  searchRuDirectory,
  RuContact,
} from '@/data/ruDirectoryData';

export default function HomeDirectoryQuickSearch() {
  const [query, setQuery] = useState('');
  const [activeChip, setActiveChip] = useState<'all' | 'teacher' | 'officer'>('all');

  const matches = useMemo(() => {
    if (!query.trim()) return [];
    return searchRuDirectory(query, activeChip, 'all', 4);
  }, [query, activeChip]);

  return (
    <div className="w-full bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-black">
            <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
            <span>রাবি অফিশিয়াল ফোনবুক • ৩,৮৭৭ জন শিক্ষক ও কর্মকর্তা</span>
          </div>
          <h3 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
            শিক্ষক বা কর্মকর্তার ফোন নম্বর খুঁজুন
          </h3>
          <p className="text-xs text-slate-500">
            নাম, বিভাগ (যেমন: CSE, বাংলা, হিসাববিজ্ঞান) বা পদবি লিখে সরাসরি ১-ট্যাপে কল ও WhatsApp করুন।
          </p>
        </div>

        <Link
          href="/directory"
          className="text-xs sm:text-sm font-extrabold text-blue-700 hover:text-blue-800 flex items-center gap-1 shrink-0 group self-start sm:self-auto"
        >
          <span>সম্পূর্ণ ফোনবুক ({RU_DIRECTORY_DATA.total} জন)</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
        </Link>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="শিক্ষক/কর্মকর্তার নাম বা বিভাগ লিখুন (যেমন: CSE, পদার্থ, প্রক্টর)..."
          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
        />
      </div>

      {/* Quick Search Tags / Shortcuts */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] text-slate-400 font-bold mr-1">জনপ্রিয় সার্চ:</span>
        {['CSE', 'আইসিটি', 'পদার্থবিজ্ঞান', 'প্রক্টর অফিস', 'চিকিৎসা কেন্দ্র', 'লাইব্রেরি'].map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setQuery(tag)}
            className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 text-xs font-bold transition cursor-pointer"
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Live Instant Search Results */}
      {query.trim() && (
        <div className="space-y-2 pt-2 border-t border-slate-100">
          {matches.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {matches.map((contact) => (
                  <div
                    key={contact.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 hover:border-blue-300 transition"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100/70 text-blue-800">
                          {contact.category === 'teacher' ? 'শিক্ষক' : contact.category === 'officer' ? 'কর্মকর্তা' : 'স্টাফ'}
                        </span>
                        <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                          {contact.name}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                        {contact.designation} • {contact.department}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {contact.phone && (
                        <a
                          href={`tel:${contact.phone}`}
                          className="w-8 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-xs transition"
                          title="সরাসরি কল দিন"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {contact.phone && (
                        <a
                          href={`https://wa.me/88${contact.phone.replace(/^0/, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-8 h-8 rounded-xl bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center shadow-xs transition"
                          title="WhatsApp মেসেজ"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center pt-1">
                <Link
                  href={`/directory?q=${encodeURIComponent(query)}`}
                  className="text-xs font-black text-blue-700 hover:underline"
                >
                  ‘{query}’ সম্পর্কিত আরও ফলাফল দেখতে ডিরেক্টরি পেজে যান →
                </Link>
              </div>
            </>
          ) : (
            <div className="py-4 text-center text-xs text-slate-400 font-medium">
              ‘{query}’ দিয়ে কোনো কন্টাক্ট পাওয়া যায়নি। বানান চেক করুন অথবা সম্পূর্ণ ফোনবুকে ব্রাউজ করুন।
            </div>
          )}
        </div>
      )}
    </div>
  );
}
