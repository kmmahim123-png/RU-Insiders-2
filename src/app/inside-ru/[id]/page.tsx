'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { InsideRuArticle } from '@/types';
import {
  ArrowLeft,
  Heart,
  Share2,
  MessageCircle,
  Calendar,
  User,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

export default function InsideRuDetailPage() {
  const params = useParams();
  const articleId = params?.id as string;

  const [article, setArticle] = useState<InsideRuArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [officialWhatsapp, setOfficialWhatsapp] = useState('8801700000000');

  useEffect(() => {
    // Check local liked state
    try {
      const likedMap = JSON.parse(localStorage.getItem('ru_liked_articles') || '{}');
      if (likedMap[articleId]) setHasLiked(true);
    } catch {}

    fetch('/api/store')
      .then((r) => r.json())
      .then((data) => {
        if (data.settings?.whatsappNumber) setOfficialWhatsapp(data.settings.whatsappNumber);
        if (data.articles) {
          const found = data.articles.find((a: InsideRuArticle) => a.id === articleId);
          if (found) {
            setArticle(found);
            setLikes(typeof found.likes === 'number' ? found.likes : 0);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [articleId]);

  const handleLike = async () => {
    const nextLiked = !hasLiked;
    setHasLiked(nextLiked);
    setLikes((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));

    // Save to localStorage
    try {
      const likedMap = JSON.parse(localStorage.getItem('ru_liked_articles') || '{}');
      if (nextLiked) {
        likedMap[articleId] = true;
      } else {
        delete likedMap[articleId];
      }
      localStorage.setItem('ru_liked_articles', JSON.stringify(likedMap));
    } catch {}

    // Persist to server
    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TOGGLE_LIKE',
          payload: { articleId, increment: nextLiked },
        }),
      });
      const data = await res.json();
      if (data.ok && typeof data.likes === 'number') {
        setLikes(data.likes);
      }
    } catch {}
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-bold text-slate-500">লেখা লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-extrabold text-slate-900">লেখাটি পাওয়া যায়নি</h2>
        <p className="text-xs text-slate-500">লেখাটি হয়তো অপ্রকাশিত বা লিংকটি পরিবর্তিত হয়েছে।</p>
        <Link
          href="/inside-ru"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700 text-white font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" /> নিউজ ও সাহিত্য পাতায় ফিরে যান
        </Link>
      </div>
    );
  }

  const targetWhatsapp = article.whatsappNumber || officialWhatsapp;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/inside-ru"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> ← ফিরে যান
        </Link>

        <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-3 py-1 rounded-full">
          {article.category}
        </span>
      </div>

      {/* Article Header */}
      <div className="space-y-4">
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-snug">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-b border-slate-200 pb-4">
          <span className="flex items-center gap-1.5 font-bold text-slate-800">
            <User className="w-4 h-4 text-blue-600" />
            {article.authorName}
          </span>
          <span className="flex items-center gap-1.5 font-medium text-slate-600">
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            {article.department}
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <Calendar className="w-4 h-4" />
            {new Date(article.createdAt).toLocaleDateString('bn-BD')}
          </span>
        </div>
      </div>

      {/* Primary Featured Image */}
      {article.images && article.images.length > 0 && (
        <div className="w-full aspect-[16/9] rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
          <img src={article.images[0]} alt={article.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Summary Box */}
      {article.summary && (
        <div className="p-5 rounded-2xl bg-amber-50/70 border-l-4 border-amber-400 text-slate-800 text-sm font-medium leading-relaxed italic">
          "{article.summary}"
        </div>
      )}

      {/* Detail Sections */}
      <div className="space-y-6">
        {article.detailSections && article.detailSections.length > 0 ? (
          article.detailSections.map((sec, idx) => (
            <div key={sec.id || idx} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-3">
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{sec.title}</span>
              </h3>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
                {sec.content}
              </p>
            </div>
          ))
        ) : null}
      </div>

      {/* Secondary Images Gallery (if more than 1 image) */}
      {article.images && article.images.length > 1 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            সংযুক্ত ছবিসমূহ:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {article.images.slice(1).map((img, idx) => (
              <div key={idx} className="aspect-[16/10] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interaction Bar & Direct WhatsApp Contact */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Like & Share */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleLike}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
              hasLiked
                ? 'bg-rose-50 border-rose-300 text-rose-600'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Heart className={`w-4 h-4 ${hasLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
            <span>{likes} ভালো লেগেছে</span>
          </button>

          <button
            onClick={handleShare}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            <Share2 className="w-4 h-4" />
            <span>{copied ? '✓ লিংক কপি হয়েছে' : 'শেয়ার'}</span>
          </button>
        </div>

        {/* Direct WhatsApp Button */}
        <a
          href={`https://wa.me/${targetWhatsapp}?text=${encodeURIComponent(`আসসালামু আলাইকুম! আমি Inside RU-তে প্রকাশিত "${article.title}" লেখাটির ব্যাপারে লেখকের/আপনাদের সাথে যোগাযোগ করতে চাই।`)}`}
          target="_blank"
          rel="noreferrer"
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition"
        >
          <MessageCircle className="w-4 h-4" />
          <span>💬 লেখকের / আমাদের সাথে WhatsApp-এ যোগাযোগ করুন</span>
        </a>
      </div>
    </div>
  );
}
