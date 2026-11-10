'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  MapPin,
  Trophy,
  Newspaper,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Truck,
  ShieldCheck,
  MessageCircle,
  CheckCircle2,
  Users,
  Compass,
  Bot,
  HeartPulse,
} from 'lucide-react';
import { Product, InsideRuArticle } from '@/types';
import CampusStories from '@/components/CampusStories';
import ProductCard from '@/components/ProductCard';
import SeasonalParticles from '@/components/SeasonalParticles';
import CampusAudioPlayer from '@/components/CampusAudioPlayer';
import RuAiAssistant from '@/components/RuAiAssistant';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [articles, setArticles] = useState<InsideRuArticle[]>([]);
  const [whatsappNumber, setWhatsappNumber] = useState('8801700000000');

  useEffect(() => {
    fetch('/api/store')
      .then((r) => r.json())
      .then((data) => {
        if (data.products) setProducts(data.products);
        if (data.articles) setArticles(data.articles);
        if (data.settings?.whatsappNumber) setWhatsappNumber(data.settings.whatsappNumber);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-12 sm:space-y-16 pb-12">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-emerald-950 text-white min-h-[520px] sm:min-h-[580px] flex items-center">
        {/* Background Image with Deep Emerald Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(2, 44, 34, 0.96) 0%, rgba(6, 78, 59, 0.88) 60%, rgba(2, 44, 34, 0.94) 100%), url('/campus/paris-road-rain.jpg')`,
          }}
        />

        {/* Paris Road Seasonal Ambient Particles (Leaves / Rain / Mist) */}
        <SeasonalParticles defaultMode="leaves" className="absolute inset-0" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 w-full space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-extrabold text-amber-300 shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>মতিহারের গৌরব • রাজশাহী বিশ্ববিদ্যালয় অফিসিয়াল প্ল্যাটফর্ম</span>
          </div>

          <div className="max-w-3xl space-y-3 sm:space-y-4">
            <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.2] sm:leading-[1.15]">
              রাজশাহী বিশ্ববিদ্যালয় অফিসিয়াল মার্চেন্ডাইজ স্টোর ও ক্যাম্পাস পোর্টাল
            </h1>
            <p className="text-xs sm:text-lg text-emerald-100/90 leading-relaxed max-w-2xl font-medium">
              প্রিমিয়াম উইন্টার হুডি, ড্রপ শোল্ডার, রাজশাহীর খাঁটি খেজুরের গুড় ও নাড়ু — মতিহার ক্যাম্পাসে ফ্রি হোম ডেলিভারি এবং সারা বাংলাদেশে ১০০% ক্যাশ অন ডেলিভারি।
            </p>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 pt-2">
            <Link
              href="/shop"
              className="px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 transition"
            >
              <ShoppingBag className="w-4 h-4 text-slate-950" />
              <span>শপ কালেকশন দেখুন →</span>
            </Link>

            <Link
              href="/map"
              className="px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-extrabold text-xs sm:text-sm backdrop-blur-md flex items-center justify-center gap-2 transition"
            >
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>ইন্টারঅ্যাক্টিভ ম্যাপ (ভ্রমণ সনদ)</span>
            </Link>

            <a
              href="#ru-ai-section"
              className="px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-xl border border-indigo-400/40"
            >
              <Bot className="w-4 h-4 text-amber-300" />
              <span>AI দিয়ে জানুন ও অর্ডার করুন</span>
            </a>

            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('আসসালামু আলাইকুম! আমি RU Insiders থেকে অর্ডার বা তথ্য জানতে চাই।')}`}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3 sm:py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp মেসেজ</span>
            </a>
          </div>

          {/* Feature Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/15 max-w-4xl text-xs font-bold text-emerald-200">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-400" />
              <span>ক্যাম্পাসে ফ্রি ডেলিভারি</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>১০০% ক্যাশ অন ডেলিভারি</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>৪২ স্পট ডিজিটাল ম্যাপ</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>ভ্রমণ সনদ শেয়ার কার্ড</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CAMPUS STORIES SECTION */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <CampusStories />
      </div>

      {/* 2.5 CAMPUS AMBIENCE AUDIO BAR */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <CampusAudioPlayer
          initialScene="paris_road"
          title="প্যারিস রোডের শান্ত নিসর্গ ও পাখির গান"
        />
      </div>

      {/* 2.8 HOMEPAGE RU INSIDERS AI & MCP ASSISTANT */}
      <section id="ru-ai-section" className="max-w-7xl mx-auto px-3 sm:px-6 scroll-mt-24">
        <RuAiAssistant mode="embedded" />
      </section>

      {/* 3. 3-STAGE INTERACTIVE MAP TEASER (রাবি ক্যাম্পাস ও রাজশাহী কতটুকু ঘুরলেন) */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <span className="bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" /> ৩-স্তরের ডিজিটাল মানচিত্র
              </span>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
                রাবি ক্যাম্পাস ও রাজশাহী কতটুকু ঘুরলেন?
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                প্যারিস রোড, টুকিটাকি চত্বর, পদ্মার টি-বাঁধ থেকে পাহাড়পুর বৌদ্ধ বিহার — আপনার ভ্রমণ করা স্থানগুলোতে টিক দিয়ে নিজের নাম খচিত আকর্ষণীয় ভ্রমণ সনদ ডাউনলোড করুন!
              </p>
            </div>

            <Link
              href="/map"
              className="px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg flex items-center gap-2 shrink-0 transition"
            >
              <Trophy className="w-4 h-4 text-slate-950" />
              <span>ম্যাপ এক্সপ্লোর ও সনদ অর্জন করুন →</span>
            </Link>
          </div>

          {/* 3 Map Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/map"
              className="p-5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md transition space-y-2 block"
            >
              <span className="text-xs font-bold text-amber-300">১. রাবি ক্যাম্পাস পরিক্রমা</span>
              <h3 className="text-base font-extrabold text-white">৪২টি ঐতিহাসিক চত্বর ও হল</h3>
              <p className="text-xs text-emerald-200/80">
                প্যারিস রোড, শহীদ মিনার, টুকিটাকি, সাবাশ বাংলাদেশ ও বিজ্ঞান ভবন বলয়।
              </p>
            </Link>

            <Link
              href="/map"
              className="p-5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md transition space-y-2 block"
            >
              <span className="text-xs font-bold text-amber-300">২. রাজশাহী জেলা পরিক্রমা</span>
              <h3 className="text-base font-extrabold text-white">২২টি পুলিশি অঞ্চল ও দর্শনীয় স্থান</h3>
              <p className="text-xs text-emerald-200/80">
                পদ্মার টি-বাঁধ, আই-বাঁধ, সপুরা রেশম পল্লী ও মহানগর সীমানা।
              </p>
            </Link>

            <Link
              href="/map"
              className="p-5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md transition space-y-2 block"
            >
              <span className="text-xs font-bold text-amber-300">৩. রাজশাহী বিভাগ পরিক্রমা</span>
              <h3 className="text-base font-extrabold text-white">৮টি জেলা ও পর্যটন আকর্ষণ</h3>
              <p className="text-xs text-emerald-200/80">
                মহাস্থানগড়, উত্তরা গণভবন, যমুনা সেতু, পাহাড়পুর বিহার ও হার্ডিঞ্জ ব্রিজ।
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. INSIDE RU ARTICLES HIGHLIGHTS (নিউজ, গল্প ও সাহিত্য) */}
      {articles.length > 0 && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-black text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 uppercase tracking-wider">
                Inside RU জার্নাল
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
                ক্যাম্পাস নিউজ, গল্প, সাহিত্য ও গবেষণা
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                শিক্ষার্থীদের লেখা স্মৃতিচারণ ও গবেষণাপত্র
              </p>
            </div>

            <Link
              href="/inside-ru"
              className="text-xs sm:text-sm font-extrabold text-blue-700 hover:text-blue-800 flex items-center gap-1 group"
            >
              <span>সকল লেখা পড়ুন</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.slice(0, 2).map((art) => (
              <Link
                key={art.id}
                href={`/inside-ru/${art.id}`}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row group"
              >
                <div className="sm:w-2/5 aspect-[16/10] sm:aspect-auto bg-slate-100 overflow-hidden">
                  <img
                    src={art.images[0] || '/campus/paris-road-rain.jpg'}
                    alt={art.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="sm:w-3/5 p-6 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                      {art.category}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 line-clamp-2 group-hover:text-blue-700 transition leading-snug">
                      {art.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {art.summary}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 font-semibold">
                    লেখক: {art.authorName} ({art.department})
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 5. FEATURED PRODUCTS SECTION (চলতি সিজনের হিট - বিশ্ববিদ্যালয় ওডি জার্সি, হুডি ও খাবার - ড্যাশবোর্ডের উপরে) */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 uppercase tracking-wider">
              চলতি সিজনের হিট
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
              বিশ্ববিদ্যালয় ওডি জার্সি, প্রিমিয়াম হুডি ও খাঁটি খাবার
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              ১০০% ক্যাশ অন ডেলিভারি • কোনো অগ্রিম টাকা লাগবে না
            </p>
          </div>

          <Link
            href="/shop"
            className="text-xs sm:text-sm font-extrabold text-blue-700 hover:text-blue-800 flex items-center gap-1 group"
          >
            <span>সকল পণ্য দেখুন</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. ACADEMICS, BLOOD BANK & CLUBS PROMO BAR */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </span>
              <h3 className="text-xl font-black text-slate-900">
                ৫৯টি বিভাগ, স্যার ও অ্যালামনাই ডিরেক্টরি
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                বিভাগের সম্মানিত শিক্ষকমণ্ডলীর তথ্য, বিসিএস, টেক ও আন্তর্জাতিক স্কলারশিপের ক্যারিয়ার গাইডলাইন এবং প্রাক্তন রাবিয়ানদের প্রোফাইল দেখুন।
              </p>
            </div>
            <Link
              href="/academics"
              className="text-xs sm:text-sm font-extrabold text-blue-700 hover:underline flex items-center gap-1"
            >
              <span>বিভাগ, স্যার ও অ্যালামনাই দেখুন →</span>
            </Link>
          </div>

          <div className="bg-gradient-to-br from-rose-50 via-white to-red-50 rounded-3xl border border-rose-200 p-6 sm:p-8 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                <HeartPulse className="w-5 h-5" />
              </span>
              <h3 className="text-xl font-black text-slate-900">
                রাবি ব্লাড ব্যাংক ও ৯০+ দিন এভেইলেবল ডোনার
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                শেষ রক্তদানের তারিখ থেকে স্বয়ংক্রিয়ভাবে ৯০ দিন (৩ মাস) হিসাব করে এভেইলেবল রক্তদাতার সংখ্যা ও সরাসরি ফোন নম্বর পান—AI চ্যাটেও খুঁজতে পারবেন।
              </p>
            </div>
            <Link
              href="/blood"
              className="text-xs sm:text-sm font-extrabold text-rose-700 hover:underline flex items-center gap-1"
            >
              <span>রক্তদাতা খুঁজুন বা নিবন্ধন করুন →</span>
            </Link>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Trophy className="w-5 h-5" />
              </span>
              <h3 className="text-xl font-black text-slate-900">
                ক্যাম্পাসের শীর্ষ ক্লাবসমূহে ১-ক্লিক মেম্বারশিপ
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                RUCS, RUDEU, RUSC, RUPS, বাঁধন, রোভার স্কাউট, রঙ্গভূমি ও IEEE RU-তে মেম্বারশিপের জন্য এখনই সরাসরি অনলাইনে আবেদন জমা দিন।
              </p>
            </div>
            <Link
              href="/clubs"
              className="text-xs sm:text-sm font-extrabold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <span>ক্লাব ও আবেদন ফর্ম দেখুন →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2.5">
                <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-full border border-amber-400" />
                <span className="font-black text-lg text-white">RU Insiders</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                রাজশাহী বিশ্ববিদ্যালয় অফিসিয়াল মার্চেন্ডাইজ স্টোর ও ক্যাম্পাস পোর্টাল। মতিহার ক্যাম্পাসে ফ্রি ডেলিভারি ও সারা বাংলাদেশে ক্যাশ অন ডেলিভারি।
              </p>
            </div>

            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider mb-3">দ্রুত লিংক</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/shop" className="hover:text-white transition">শপ কালেকশন</Link></li>
                <li><Link href="/map" className="hover:text-white transition">ইন্টারঅ্যাক্টিভ ম্যাপ</Link></li>
                <li><Link href="/inside-ru" className="hover:text-white transition">নিউজ ও সাহিত্য</Link></li>
                <li><Link href="/academics" className="hover:text-white transition">বিভাগ, স্যার ও ক্যারিয়ার</Link></li>
                <li><Link href="/blood" className="hover:text-rose-400 transition">🩸 রাবি ব্লাড ব্যাংক</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider mb-3">সেবা ও ট্র্যাকিং</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/track" className="hover:text-white transition">অর্ডার ট্র্যাকিং</Link></li>
                <li><Link href="/clubs" className="hover:text-white transition">ক্লাব মেম্বারশিপ</Link></li>
                <li><Link href="/cart" className="hover:text-white transition">শপিং কার্ট ও ক্যাশ মেমো</Link></li>
                <li><Link href="/admin" className="hover:text-amber-400 transition">অ্যাডমিন ও ক্লাব পোর্টাল</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">সরাসরি যোগাযোগ</h4>
              <p className="text-xs text-slate-400">
                যেকোনো বাল্ক অর্ডার, ব্যাচ হুডি বা তথ্যের জন্য WhatsApp-এ মেসেজ দিন:
              </p>
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp চ্যাট
              </a>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
            <p>© {new Date().getFullYear()} RU Insiders. সর্বস্বত্ব সংরক্ষিত।</p>
            <p>রাজশাহী বিশ্ববিদ্যালয় • মতিহার, রাজশাহী-৬২০৫</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
