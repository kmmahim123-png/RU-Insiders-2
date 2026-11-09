'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShoppingBag,
  Compass,
  Heart,
  Share2,
} from 'lucide-react';

interface Story {
  id: string;
  title: string;
  tag: string;
  image: string;
  description: string;
  actionText: string;
  actionHref: string;
  dateStr: string;
  gradient: string;
}

const CAMPUS_STORIES: Story[] = [
  {
    id: 'paris-morning',
    title: 'প্যারিস রোডে বৃষ্টির সকাল',
    tag: 'ক্যাম্পাস স্মৃতি',
    image: '/campus/paris-road-rain.jpg',
    description:
      'মতিহারের প্যারিস রোড — দুপাশে আকাশছোঁয়া গগনশিরীষের ছায়াতলে সাইকেল চালিয়ে ক্লাসে যাওয়া প্রতিটি রাবিয়ানের হৃদস্পন্দন।',
    actionText: 'ম্যাপে প্যারিস রোড দেখুন',
    actionHref: '/map?spot=paris_road&stage=ru_campus',
    dateStr: 'আজ সকাল ৭:৩০',
    gradient: 'from-amber-400 via-rose-500 to-emerald-500',
  },
  {
    id: 'winter-hoodie',
    title: 'নতুন অফিশিয়াল উইন্টার হুডি ২০২৬',
    tag: 'অফিশিয়াল শপ',
    image: '/mockups/hoodie-front.jpg',
    description:
      '৩২০ জিএসএম প্রিমিয়াম ফ্লিস কটন দিয়ে তৈরি অফিশিয়াল উইন্টার হুডি। মতিহার ক্যাম্পাসে ফ্রি হোম ডেলিভারি শুরু হয়েছে!',
    actionText: 'হুডি অর্ডার করুন',
    actionHref: '/shop',
    dateStr: 'হট ড্রপ',
    gradient: 'from-emerald-400 via-teal-500 to-amber-500',
  },
  {
    id: 'shaheed-minar',
    title: 'শহীদ মিনার ও মুক্তমঞ্চের সন্ধ্যা',
    tag: 'ঐতিহ্য ও চেতনা',
    image: '/campus/shaheed-minar-night.jpg',
    description:
      'পশ্চিমের রক্তিম সূর্যাস্তে ক্যাম্পাসের শহীদ মিনার প্রাঙ্গণে বন্ধুদের আড্ডা আর লাল মাটির সোঁদা ঘ্রাণ।',
    actionText: 'ম্যাপে শহীদ মিনার দেখুন',
    actionHref: '/map?spot=shaheed_minar&stage=ru_campus',
    dateStr: 'গতকাল বিকেল',
    gradient: 'from-rose-500 via-purple-500 to-amber-400',
  },
  {
    id: 'khejur-gur',
    title: 'চারঘাটের খাঁটি দানাদার খেজুরের গুড়',
    tag: 'রাজশাহীর ঐতিহ্য',
    image: '/mockups/gur-jar.jpg',
    description:
      'কোনো ক্ষতিকর রাসায়নিক বা চিনি ছাড়া চারঘাটের শতবর্ষী গাছিদের সংগৃহীত শতভাগ খাঁটি ও সুগন্ধযুক্ত খেজুরের গুড়।',
    actionText: 'গুড় অর্ডার করুন',
    actionHref: '/shop',
    dateStr: 'নতুন ব্যাচ',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
  },
  {
    id: 'shabash-bangladesh',
    title: 'সাবাশ বাংলাদেশ চত্বর',
    tag: 'বীরত্বের স্মারক',
    image: '/campus/shabash-bangladesh.jpg',
    description:
      'শিল্পী নিতুন কুণ্ডুর অমর সৃষ্টি — মুক্তিযুদ্ধের রক্তিম ইতিহাস ও তারুণ্যের অদম্য প্রতীক সাবাশ বাংলাদেশ চত্বর।',
    actionText: '৩-ধাপের ম্যাপে দেখুন',
    actionHref: '/map?spot=shabash_bangladesh&stage=ru_campus',
    dateStr: 'ঐতিহাসিক স্থান',
    gradient: 'from-emerald-500 via-green-600 to-amber-400',
  },
];

export default function CampusStories() {
  const [activeStoryIdx, setActiveStoryIdx] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  const duration = 5000; // 5 seconds per story
  const intervalRef = useRef<any>(null);

  // Auto-advance story timer
  useEffect(() => {
    if (activeStoryIdx === null) {
      setProgress(0);
      return;
    }

    if (isPaused) return;

    const tick = 50;
    const increment = (tick / duration) * 100;

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Go to next story or close
          if (activeStoryIdx < CAMPUS_STORIES.length - 1) {
            setActiveStoryIdx((curr) => (curr !== null ? curr + 1 : null));
            return 0;
          } else {
            setActiveStoryIdx(null);
            return 0;
          }
        }
        return prev + increment;
      });
    }, tick);

    return () => clearInterval(intervalRef.current);
  }, [activeStoryIdx, isPaused]);

  const handleOpenStory = (idx: number) => {
    setActiveStoryIdx(idx);
    setProgress(0);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (activeStoryIdx !== null && activeStoryIdx < CAMPUS_STORIES.length - 1) {
      setActiveStoryIdx((prev) => (prev !== null ? prev + 1 : null));
      setProgress(0);
    } else {
      setActiveStoryIdx(null);
    }
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (activeStoryIdx !== null && activeStoryIdx > 0) {
      setActiveStoryIdx((prev) => (prev !== null ? prev - 1 : null));
      setProgress(0);
    }
  };

  const currentStory = activeStoryIdx !== null ? CAMPUS_STORIES[activeStoryIdx] : null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-rose-500 text-white flex items-center justify-center font-bold shadow-sm">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              ক্যাম্পাস স্টোরিজ ও হাইলাইটস
              <span className="text-[10px] font-extrabold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full animate-pulse">
                লাইভ
              </span>
            </h2>
            <p className="text-xs text-slate-500">মতিহার ক্যাম্পাসের স্মৃতি, নতুন ড্রপ ও তাজা মুহূর্ত</p>
          </div>
        </div>

        <span className="text-xs font-bold text-slate-400 hidden sm:inline">
          বৃত্তে ক্লিক করে স্টোরি দেখুন
        </span>
      </div>

      {/* Horizontal Scrollable Stories Carousel */}
      <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-2 pt-1 scrollbar-none">
        {CAMPUS_STORIES.map((story, idx) => (
          <button
            key={story.id}
            onClick={() => handleOpenStory(idx)}
            className="flex flex-col items-center shrink-0 group focus:outline-none cursor-pointer"
          >
            {/* Rotating Conic Ring */}
            <div
              className={`p-[3px] rounded-full bg-gradient-to-tr ${story.gradient} shadow-md transition-transform duration-300 group-hover:scale-105 group-active:scale-95`}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-white bg-slate-100 relative">
                <img
                  src={story.image}
                  alt={story.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
            </div>

            <span className="text-[11px] font-extrabold text-slate-800 mt-2 max-w-[85px] truncate text-center group-hover:text-emerald-700 transition">
              {story.title}
            </span>
            <span className="text-[10px] font-semibold text-slate-400">
              {story.dateStr}
            </span>
          </button>
        ))}
      </div>

      {/* Fullscreen Story Viewer Modal */}
      {currentStory && (
        <div
          className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 select-none animate-fadeIn"
          onClick={() => setActiveStoryIdx(null)}
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <div
            className="relative w-full max-w-sm sm:max-w-md h-[100dvh] sm:h-[84vh] sm:rounded-3xl overflow-hidden bg-slate-900 shadow-2xl flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background Story Image */}
            <div className="absolute inset-0">
              <img
                src={currentStory.image}
                alt={currentStory.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/85" />
            </div>

            {/* Top Progress Bars */}
            <div className="relative z-20 p-3 pt-4 sm:pt-4 space-y-2.5">
              <div className="flex items-center gap-1.5 w-full">
                {CAMPUS_STORIES.map((_, i) => (
                  <div key={i} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-75 ease-linear rounded-full"
                      style={{
                        width:
                          i < (activeStoryIdx || 0)
                            ? '100%'
                            : i === activeStoryIdx
                            ? `${progress}%`
                            : '0%',
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Author / Title Header */}
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full border border-white/50 overflow-hidden bg-white/20">
                    <img
                      src={currentStory.image}
                      alt={currentStory.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-black flex items-center gap-1.5">
                      {currentStory.title}
                      <span className="text-[10px] font-bold text-amber-300 bg-amber-400/20 px-1.5 py-0.2 rounded">
                        {currentStory.tag}
                      </span>
                    </h4>
                    <p className="text-[10px] text-white/70">{currentStory.dateStr}</p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveStoryIdx(null)}
                  className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tap Left / Right Overlay Touch Areas */}
            <div className="absolute inset-y-20 inset-x-0 z-10 flex">
              <div
                className="w-1/3 h-full cursor-pointer"
                onClick={handlePrev}
                title="পূর্ববর্তী স্লাইড"
              />
              <div
                className="w-2/3 h-full cursor-pointer"
                onClick={handleNext}
                title="পরবর্তী স্লাইড"
              />
            </div>

            {/* Bottom Caption & Action Button */}
            <div className="relative z-20 p-4 sm:p-5 space-y-3.5 text-white">
              <p className="text-xs sm:text-sm font-medium leading-relaxed drop-shadow">
                {currentStory.description}
              </p>

              <div className="flex items-center gap-2">
                <Link
                  href={currentStory.actionHref}
                  onClick={() => setActiveStoryIdx(null)}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg transition"
                >
                  <span>{currentStory.actionText}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>

                <button
                  onClick={() =>
                    setLiked((prev) => ({
                      ...prev,
                      [currentStory.id]: !prev[currentStory.id],
                    }))
                  }
                  className={`w-11 h-11 rounded-xl flex items-center justify-center backdrop-blur-md transition ${
                    liked[currentStory.id]
                      ? 'bg-rose-600 text-white'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${liked[currentStory.id] ? 'fill-current' : ''}`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
