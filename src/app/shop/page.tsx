'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/types';
import StoryHighlights from '@/components/StoryHighlights';
import ProductCard from '@/components/ProductCard';
import { Search, MessageCircle, Sparkles, Filter } from 'lucide-react';

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [whatsappNumber, setWhatsappNumber] = useState<string>('8801700000000');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/store')
      .then((r) => r.json())
      .then((data) => {
        if (data.products) setProducts(data.products);
        if (data.settings?.categories) setCategories(data.settings.categories);
        if (data.settings?.whatsappNumber) setWhatsappNumber(data.settings.whatsappNumber);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory;
    const matchSearch =
      !search ||
      p.nameBn.toLowerCase().includes(search.toLowerCase()) ||
      p.shortSummary.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 pb-24 sm:pb-12 space-y-8">
      {/* 1. Collection Story Highlights at Top */}
      <StoryHighlights products={products} />

      {/* 2. Smart WhatsApp Customizer & Assignment Printing Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <span className="bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> কাস্টম মার্চেন্ডাইজ & প্রিন্টিং
          </span>
          <h2 className="text-xl sm:text-2xl font-black">
            ব্যাচ হুডি, ডিপার্টমেন্ট জার্সি বা জরুরি অ্যাসাইনমেন্ট প্রিন্টিং?
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            কোনো জটিল ক্যানভাস ছাড়াই সরাসরি আমাদের WhatsApp-এ আপনার ডিজাইন, লোগো বা পিডিএফ ফাইল পাঠিয়ে দিন। ক্যাম্পাস রেটে সেরা কোয়ালিটিতে ডেলিভারি পেয়ে যাবেন!
          </p>
        </div>

        <a
          href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('আসসালামু আলাইকুম! আমি ব্যাচ হুডি/জার্সি কাস্টমাইজেশন অথবা অ্যাসাইনমেন্ট প্রিন্টিং নিয়ে কথা বলতে চাই।')}`}
          target="_blank"
          rel="noreferrer"
          className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-lg flex items-center gap-2 shrink-0 transition"
        >
          <MessageCircle className="w-5 h-5 text-slate-950" />
          <span>WhatsApp-এ সরাসরি অর্ডার দিন →</span>
        </a>
      </div>

      {/* 3. Filters & Search */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              সকল পণ্য ও ঐতিহ্যবাহী খাবার
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              ১০০% ক্যাশ অন ডেলিভারি • মতিহার ক্যাম্পাসে ফ্রি হোম ডেলিভারি
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="পণ্য বা খাবারের নাম খুঁজুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 shadow-sm"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveCategory('all')}
            className={`py-2 px-4 rounded-xl text-xs font-bold shrink-0 transition ${
              activeCategory === 'all'
                ? 'bg-blue-700 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            সব পণ্য ({products.length})
          </button>

          {categories.map((cat) => {
            const count = products.filter((p) => p.category === cat).length;
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
      </div>

      {/* 4. Products Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-600">পণ্য তালিকা লোড হচ্ছে...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <p className="text-lg font-bold text-slate-700">কোনো পণ্য পাওয়া যায়নি</p>
          <p className="text-xs text-slate-400">অনুগ্রহ করে অন্য কোনো কি-ওয়ার্ড দিয়ে খুঁজুন বা ফিল্টার পরিবর্তন করুন।</p>
          <button
            onClick={() => {
              setActiveCategory('all');
              setSearch('');
            }}
            className="px-4 py-2 rounded-xl bg-blue-700 text-white text-xs font-bold"
          >
            ফিল্টার রিসেট করুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
