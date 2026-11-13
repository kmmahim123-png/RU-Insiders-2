import React from 'react';
import type { Metadata } from 'next';
import InteractiveThreeMaps from '@/components/InteractiveThreeMaps';

export const metadata: Metadata = {
  title: 'রাজশাহী বিশ্ববিদ্যালয় ও জেলা পর্যটন ম্যাপ (সনদপত্র সহ) | Rajshahi Map | রাবিয়ান',
  description: 'রাবি ক্যাম্পাস (৪২ স্পট), রাজশাহী জেলা (২২ ঐতিহ্যবাহী অঞ্চল) ও রাজশাহী বিভাগের (৯৫ দর্শনীয় স্থান) পূর্ণাঙ্গ ইন্টারঅ্যাক্টিভ ভেক্টর ম্যাপ ও ডাউনলোডযোগ্য ভ্রমণ সনদ।',
  keywords: [
    'রাজশাহী ম্যাপ',
    'rajshahi map',
    'রাবি ম্যাপ',
    'ru map',
    'rajshahi university map',
    'প্যারিস রোড ম্যাপ',
    'মতিহার ম্যাপ',
    'রাবি ভ্রমণ সনদ',
    'rajshahi district map',
    'rabian map',
  ],
  alternates: {
    canonical: 'https://rabian.site/map',
  },
  openGraph: {
    title: 'রাজশাহী বিশ্ববিদ্যালয় ও জেলা পর্যটন ম্যাপ | রাবিয়ান',
    description: 'রাবি ক্যাম্পাস ও রাজশাহী বিভাগের পূর্ণাঙ্গ ইন্টারঅ্যাক্টিভ ভেক্টর ম্যাপ ও ডাউনলোডযোগ্য সনদ।',
    url: 'https://rabian.site/map',
    images: ['/og-image.png'],
  },
};

export default function MapPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 font-bengali">
      <InteractiveThreeMaps />
    </div>
  );
}
