'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { InsideRuArticle } from '@/types';
import {
  Newspaper,
  PenTool,
  Search,
  Heart,
  Calendar,
  User,
  GraduationCap,
  Sparkles,
  ArrowRight,
  X,
  CheckCircle2,
} from 'lucide-react';

const CATEGORIES = [
  'ক্যাম্পাস নিউজ',
  'গল্প ও স্মৃতিচারণ',
  'সাহিত্য ও কবিতা',
  'গবেষণা ও পেপার',
  'কৃতি শিক্ষার্থী ও ট্যালেন্ট',
  'ক্যাম্পাস গান ও সুর',
] as const;

export default function InsideRuPage() {
  const [articles, setArticles] = useState<InsideRuArticle[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Submission Form State
  const [subTitle, setSubTitle] = useState('');
  const [subCat, setSubCat] = useState<string>(CATEGORIES[0]);
  const [subAuthor, setSubAuthor] = useState('');
  const [subDept, setSubDept] = useState('');
  const [subWhatsapp, setSubWhatsapp] = useState('');
  const [subImageUrl, setSubImageUrl] = useState('');
  const [subSummary, setSubSummary] = useState('');
  const [subBody, setSubBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [subSuccess, setSubSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/store')
      .then((r) => r.json())
      .then((data) => {
        if (data.articles) setArticles(data.articles);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    try {
      const savedUser = JSON.parse(localStorage.getItem('ru_user_session') || 'null');
      if (savedUser?.name) setSubAuthor(savedUser.name);
    } catch {}
  }, []);

  const filteredArticles = articles.filter((a) => {
    const matchCat = activeCategory === 'all' || a.category === activeCategory;
    const matchSearch =
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.authorName.toLowerCase().includes(search.toLowerCase()) ||
      a.department.toLowerCase().includes(search.toLowerCase()) ||
      a.summary.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleSubmitArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subTitle.trim() || !subAuthor.trim() || !subDept.trim() || !subBody.trim()) {
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: subTitle.trim(),
        category: subCat,
        authorName: subAuthor.trim(),
        department: subDept.trim(),
        whatsappNumber: subWhatsapp.trim() || undefined,
        images: subImageUrl.trim() ? [subImageUrl.trim()] : ['/campus/paris-road-rain.jpg'],
        summary: subSummary.trim() || subBody.slice(0, 150) + '...',
        detailSections: [
          {
            id: `sec-${Date.now()}`,
            title: 'মূল লেখা ও বিবরণ',
            content: subBody.trim(),
          },
        ],
      };

      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SUBMIT_ARTICLE', payload }),
      });

      const data = await res.json();
      if (data.ok) {
        setSubSuccess(true);
        setTimeout(() => {
          setSubSuccess(false);
          setShowSubmitModal(false);
          setSubTitle('');
          setSubSummary('');
          setSubBody('');
          setSubImageUrl('');
        }, 2200);
      }
    } catch {} finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <span className="bg-blue-600/60 text-blue-200 border border-blue-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
            <Newspaper className="w-3.5 h-3.5" /> Inside RU ক্যাম্পাস জার্নাল
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            নিউজ, স্মৃতিচারণ, সাহিত্য ও গবেষণার মুক্তমঞ্চ
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            মতিহারের সোনালী দিন, প্যারিস রোডের স্মৃতি, মৌলিক সাহিত্য কিংবা আন্তর্জাতিক গবেষণাপত্র — রাবিয়ানদের কলমে ক্যাম্পাসের নাড়ি-নক্ষত্র।
          </p>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs sm:text-sm shadow-md flex items-center gap-2 shrink-0 transition"
        >
          <PenTool className="w-4 h-4 text-slate-950" />
          <span>✍️ আপনার লেখা বা গবেষণা জমা দিন →</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setActiveCategory('all')}
              className={`py-2 px-4 rounded-xl text-xs font-bold shrink-0 transition ${
                activeCategory === 'all'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              সকল লেখা ({articles.length})
            </button>

            {CATEGORIES.map((cat) => {
              const count = articles.filter((a) => a.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`py-2 px-4 rounded-xl text-xs font-bold shrink-0 transition ${
                    activeCategory === cat
                      ? 'bg-blue-700 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="শিরোনাম বা লেখকের নাম..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-500">লেখাগুলো লোড হচ্ছে...</p>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <p className="text-base font-bold text-slate-700">কোনো লেখা পাওয়া যায়নি</p>
          <p className="text-xs text-slate-400">এই ক্যাটাগরিতে এখনও কোনো লেখা নেই। আপনি প্রথম লেখাটি জমা দিন!</p>
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2 rounded-xl bg-blue-700 text-white text-xs font-bold"
          >
            লেখা জমা দিন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((art) => (
            <Link
              key={art.id}
              href={`/inside-ru/${art.id}`}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group"
            >
              {/* Cover Image */}
              <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden">
                <img
                  src={art.images[0] || '/campus/paris-road-rain.jpg'}
                  alt={art.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                  {art.category}
                </span>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <h3 className="text-base font-extrabold text-slate-900 line-clamp-2 group-hover:text-blue-700 transition leading-snug">
                    {art.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                    {art.summary}
                  </p>
                </div>

                {/* Footer Meta */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                    <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="font-bold text-slate-800 truncate">{art.authorName}</span>
                  </div>

                  <span className="flex items-center gap-1 font-semibold text-rose-600">
                    <Heart className="w-3.5 h-3.5 fill-rose-600" />
                    {art.likes}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Student Article Submission Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Inside RU-তে আপনার লেখা বা গবেষণা জমা দিন
                </h3>
                <p className="text-xs text-slate-500">অ্যাডমিন রিভিউয়ের পর লেখাটি প্রকাশিত হবে</p>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {subSuccess ? (
              <div className="p-8 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-lg font-black text-emerald-900">লেখাটি সফলভাবে জমা হয়েছে!</h4>
                <p className="text-xs text-emerald-700">
                  ধন্যবাদ! আমাদের সম্পাদকীয় দল লেখাটি যাচাই করে শীঘ্রই প্রকাশ করবে।
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitArticle} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">লেখার শিরোনাম *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: বৃষ্টিভেজা প্যারিস রোড ও টুকিটাকি চত্বরের আড্ডা"
                    value={subTitle}
                    onChange={(e) => setSubTitle(e.target.value)}
                    className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-600 font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">ক্যাটাগরি *</label>
                    <select
                      value={subCat}
                      onChange={(e) => setSubCat(e.target.value)}
                      className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-600 font-bold bg-white"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">আপনার নাম *</label>
                    <input
                      type="text"
                      required
                      placeholder="আপনার পূর্ণ নাম"
                      value={subAuthor}
                      onChange={(e) => setSubAuthor(e.target.value)}
                      className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-600 font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">বিভাগ ও শিক্ষাবর্ষ *</label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: পদার্থবিজ্ঞান বিভাগ (২০২০-২১)"
                      value={subDept}
                      onChange={(e) => setSubDept(e.target.value)}
                      className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">আপনার WhatsApp নাম্বার (ঐচ্ছিক)</label>
                    <input
                      type="text"
                      placeholder="যেমন: 8801700000000"
                      value={subWhatsapp}
                      onChange={(e) => setSubWhatsapp(e.target.value)}
                      className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">ছবি লিংক / কভার ফটো (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    placeholder="যেমন: /campus/paris-road-rain.jpg বা ইমেজ ইউআরএল"
                    value={subImageUrl}
                    onChange={(e) => setSubImageUrl(e.target.value)}
                    className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">সংক্ষিপ্ত সারাংশ (১-২ লাইন)</label>
                  <input
                    type="text"
                    placeholder="লেখার মূল ভাব বা সংক্ষেপ"
                    value={subSummary}
                    onChange={(e) => setSubSummary(e.target.value)}
                    className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">মূল লেখা বা গবেষণার বিবরণ *</label>
                  <textarea
                    required
                    rows={6}
                    placeholder="আপনার সম্পূর্ণ গল্প, স্মৃতিচারণ, কবিতা বা গবেষণাপত্রের তথ্য এখানে লিখুন..."
                    value={subBody}
                    onChange={(e) => setSubBody(e.target.value)}
                    className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-600 leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs sm:text-sm shadow-md transition disabled:opacity-50"
                >
                  {submitting ? 'জমা দেওয়া হচ্ছে...' : 'লেখা রিভিউয়ের জন্য জমা দিন'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
