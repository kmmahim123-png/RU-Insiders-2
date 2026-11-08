import React from 'react';
import type { Metadata } from 'next';
import InteractiveThreeMaps from '@/components/InteractiveThreeMaps';

export const metadata: Metadata = {
  title: 'ইন্টারঅ্যাক্টিভ ম্যাপ এক্সপ্লোরার | RU Insiders',
  description: 'রাবি ক্যাম্পাস (৪২ স্পট), রাজশাহী জেলা (২২ অঞ্চল) ও রাজশাহী বিভাগ (৮ জেলা) ইন্টারঅ্যাক্টিভ ভেক্টর ম্যাপ।',
};

export default function MapPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 font-bengali">
      <InteractiveThreeMaps />
    </div>
  );
}
