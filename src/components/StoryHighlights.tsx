'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { ArrowRight, Sparkles } from 'lucide-react';

interface StoryHighlightsProps {
  products: Product[];
}

export default function StoryHighlights({ products }: StoryHighlightsProps) {
  if (!products || products.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
              কালেকশন স্টোরি ও স্পেশাল হাইলাইটস
            </h2>
            <p className="text-xs text-slate-500">চলতি মৌসুমের জনপ্রিয় রাবি মার্চেন্ডাইজ ও খাবার</p>
          </div>
        </div>

        <Link
          href="/shop"
          className="text-xs sm:text-sm font-extrabold text-blue-700 hover:text-blue-800 flex items-center gap-1 transition"
        >
          <span>সবগুলো পণ্য একসাথে দেখুন</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Horizontal Scrollable Stories */}
      <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-2 pt-1 scrollbar-none">
        {products.slice(0, 8).map((prod) => (
          <Link
            key={prod.id}
            href={`/shop/${prod.id}`}
            className="flex flex-col items-center shrink-0 group focus:outline-none"
          >
            {/* Story Ring */}
            <div className="relative p-1 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-emerald-500 shadow-md transition-transform duration-300 group-hover:scale-105">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-white bg-slate-100">
                <img
                  src={prod.images[0] || '/mockups/hoodie-front.jpg'}
                  alt={prod.nameBn}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <span className="absolute -bottom-1.5 inset-x-0 mx-auto w-max max-w-[80px] bg-slate-900 text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm truncate text-center">
                ৳{prod.price}
              </span>
            </div>

            <span className="mt-2 text-xs font-bold text-slate-800 text-center max-w-[95px] line-clamp-1 group-hover:text-blue-700 transition">
              {prod.nameBn}
            </span>
          </Link>
        ))}

        {/* Final Circle: Shop More */}
        <Link
          href="/shop"
          className="flex flex-col items-center shrink-0 group focus:outline-none"
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-dashed border-blue-500 bg-blue-50/70 flex flex-col items-center justify-center text-blue-700 shadow-sm transition-transform duration-300 group-hover:scale-105">
            <ArrowRight className="w-6 h-6 group-hover:translate-x-0.5 transition" />
            <span className="text-[10px] font-black mt-1">সব পণ্য</span>
          </div>
          <span className="mt-2 text-xs font-extrabold text-blue-700 text-center">
            Shop More →
          </span>
        </Link>
      </div>
    </div>
  );
}
