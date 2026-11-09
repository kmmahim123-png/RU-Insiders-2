'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  Compass,
  ShoppingBag,
  GraduationCap,
  Trophy,
  Newspaper,
  ArrowRight,
  Sparkles,
  Command,
} from 'lucide-react';
import { RU_DEPARTMENTS } from '@/lib/ruAcademicData';
import { RU_CLUBS } from '@/lib/ruClubsData';
import { DIVISION_SPOTS } from '@/lib/divisionSpotsData';
import { RU_CAMPUS_PLACES } from '@/lib/ruCampusSvg';

interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'academic' | 'club' | 'product' | 'spot' | 'news';
  categoryLabel: string;
  href: string;
  badge?: string;
}

export default function SpotlightCommand() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'all' | 'academic' | 'club' | 'spot' | 'product'>('all');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Listen to keyboard shortcuts (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => setIsOpen(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('ru_open_spotlight', handleCustomOpen);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('ru_open_spotlight', handleCustomOpen);
    };
  }, [isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Compile searchable database
  const allItems: SearchItem[] = useMemo(() => {
    const items: SearchItem[] = [];

    // 1. Departments & Faculties
    RU_DEPARTMENTS.forEach((dept) => {
      items.push({
        id: `dept-${dept.id}`,
        title: dept.nameBn,
        subtitle: `${dept.nameEn} • ${dept.facultyBn}`,
        category: 'academic',
        categoryLabel: 'বিভাগ ও অনুষদ',
        href: `/academics?dept=${dept.id}`,
        badge: dept.code,
      });
    });

    // 2. Clubs
    RU_CLUBS.forEach((club) => {
      items.push({
        id: `club-${club.id}`,
        title: club.nameBn,
        subtitle: `${club.categoryBn} • ${club.roomLocationBn}`,
        category: 'club',
        categoryLabel: 'ক্লাব ও সংগঠন',
        href: `/clubs?club=${club.id}`,
        badge: club.shortName,
      });
    });

    // 3. Spots (Division & Campus)
    RU_CAMPUS_PLACES.forEach((place) => {
      items.push({
        id: `campus-${place.id}`,
        title: place.nameBn,
        subtitle: `রাবি ক্যাম্পাস • ${place.cat || 'ল্যান্ডমার্ক'}`,
        category: 'spot',
        categoryLabel: 'ক্যাম্পাস স্থান',
        href: `/map?spot=${place.id}&stage=ru_campus`,
        badge: 'রাবি ক্যাম্পাস',
      });
    });

    DIVISION_SPOTS.slice(0, 30).forEach((spot) => {
      items.push({
        id: `div-${spot.id}`,
        title: spot.nameBn,
        subtitle: `${spot.locationBn}`,
        category: 'spot',
        categoryLabel: 'দর্শনীয় স্থান',
        href: `/map?spot=${spot.id}&stage=division`,
        badge: spot.districtId,
      });
    });

    // 4. Products & Shop
    const standardProducts = [
      { id: 'hoodie', title: 'রাবি অফিশিয়াল প্রিমিয়াম উইন্টার হুডি', sub: '৩২০ জিএসএম ফ্লিস কটন • মতিহার কালেকশন', price: '৳৬৫০' },
      { id: 'dropshoulder', title: 'প্যারিস রোড লিমিটেড ড্রপ শোল্ডার টি-শার্ট', sub: '২৪০ জিএসএম ভারী কটন • রিল্যাক্সড ফিট', price: '৳৪৫০' },
      { id: 'gur', title: 'রাজশাহীর শতভাগ নির্ভেজাল দানাদার খেজুরের গুড়', sub: 'চারঘাটের খাঁটি গাছি গুড় • ১ কেজি জার', price: '৳৩৮০' },
      { id: 'naru', title: 'ঐতিহ্যবাহী রাজশাহীর খাঁটি তিলের ও নারিকেলের নাড়ু', sub: 'ঘরোয়া স্বাদে তৈরি মিষ্টি নাড়ু • ৫০০ গ্রাম', price: '৳২৫০' },
      { id: 'polo', title: 'রাবি ৫০+ এলামনাই প্রিমিয়াম পোলো শার্ট', sub: 'পিকু কটন ফেব্রিক • অফিশিয়াল লোগো এমব্রয়ডারি', price: '৳৫৫০' },
    ];

    standardProducts.forEach((p) => {
      items.push({
        id: `prod-${p.id}`,
        title: p.title,
        subtitle: `${p.sub} • ${p.price}`,
        category: 'product',
        categoryLabel: 'মার্চেন্ডাইজ শপ',
        href: `/shop`,
        badge: p.price,
      });
    });

    // 5. Portals & Quick Nav
    items.push({
      id: 'quick-map',
      title: '৩-ধাপের ভেক্টর ওয়াটার ম্যাপ ও ভ্রমণ সনদ',
      subtitle: 'বিভাগ, রাজশাহী জেলা ও রাবি ক্যাম্পাসের লাইভ ভ্রমণ ট্র্যাকার',
      category: 'spot',
      categoryLabel: 'ম্যাপ এক্সপ্লোরার',
      href: '/map',
      badge: 'ম্যাপ',
    });
    items.push({
      id: 'quick-news',
      title: 'Inside RU ক্যাম্পাস জার্নাল ও মুক্তমঞ্চ',
      subtitle: 'নিউজ, স্মৃতিচারণ, মৌলিক সাহিত্য ও আন্তর্জাতিক গবেষণাপত্র',
      category: 'news',
      categoryLabel: 'নিউজ ও সাহিত্য',
      href: '/inside-ru',
      badge: 'জার্নাল',
    });

    return items;
  }, []);

  // Filter items
  const filteredItems = useMemo(() => {
    let list = allItems;
    if (activeTab !== 'all') {
      list = list.filter((i) => i.category === activeTab);
    }
    if (!query.trim()) {
      return list.slice(0, 10);
    }

    const q = query.trim().toLowerCase();
    return list
      .filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.subtitle.toLowerCase().includes(q) ||
          i.categoryLabel.toLowerCase().includes(q) ||
          (i.badge && i.badge.toLowerCase().includes(q))
      )
      .slice(0, 12);
  }, [allItems, activeTab, query]);

  // Handle keyboard arrow navigation
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    }
  };

  const handleSelect = (item: SearchItem) => {
    setIsOpen(false);
    router.push(item.href);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-md flex items-start justify-center p-3 sm:p-6 pt-14 sm:pt-20 animate-fadeIn"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[82vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-emerald-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="বিভাগ, ক্লাব, হুডি, প্যারিস রোড বা দর্শনীয় স্থান খুঁজুন..."
            className="flex-1 bg-transparent text-sm sm:text-base font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold text-slate-500 bg-slate-200 rounded-md border border-slate-300">
            ESC
          </kbd>
        </div>

        {/* Quick Filter Category Pills */}
        <div className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100/60 border-b border-slate-200 overflow-x-auto scrollbar-none text-xs font-bold text-slate-600">
          {[
            { id: 'all', label: 'সবকিছু' },
            { id: 'academic', label: '🎓 অনুষদ ও বিভাগ' },
            { id: 'club', label: '🏆 ক্লাবসমূহ' },
            { id: 'spot', label: '🗺️ ক্যাম্পাস ও দর্শনীয় স্থান' },
            { id: 'product', label: '🛍️ মার্চেন্ডাইজ শপ' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSelectedIndex(0);
              }}
              className={`px-3 py-1 rounded-xl whitespace-nowrap transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'hover:bg-slate-200/70 text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Sparkles className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-sm font-semibold">কোনো ফলাফল পাওয়া যায়নি</p>
              <p className="text-xs">বানান ঠিক রেখে অন্য কোনো শব্দ লিখে অনুসন্ধান করুন</p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-2xl flex items-center justify-between gap-3 transition cursor-pointer ${
                    isSelected ? 'bg-emerald-50 border border-emerald-300/80' : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        item.category === 'academic'
                          ? 'bg-blue-100 text-blue-700'
                          : item.category === 'club'
                          ? 'bg-purple-100 text-purple-700'
                          : item.category === 'product'
                          ? 'bg-amber-100 text-amber-700'
                          : item.category === 'spot'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {item.category === 'academic' && <GraduationCap className="w-4 h-4" />}
                      {item.category === 'club' && <Trophy className="w-4 h-4" />}
                      {item.category === 'product' && <ShoppingBag className="w-4 h-4" />}
                      {item.category === 'spot' && <Compass className="w-4 h-4" />}
                      {item.category === 'news' && <Newspaper className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                          {item.title}
                        </h4>
                        {item.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-bold text-slate-400 hidden sm:inline">
                      {item.categoryLabel}
                    </span>
                    <ArrowRight
                      className={`w-4 h-4 transition ${
                        isSelected ? 'text-emerald-600 translate-x-0.5' : 'text-slate-300'
                      }`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-2.5 sm:p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-semibold px-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border rounded">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white border rounded">↓</kbd> নেভিগেশন
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border rounded">Enter</kbd> নির্বাচন
            </span>
          </div>
          <span>Ctrl + K চেপে যেকোনো সময় খুলুন</span>
        </div>
      </div>
    </div>
  );
}
