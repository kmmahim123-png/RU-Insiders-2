import React from 'react';
import type { Metadata } from 'next';
import BusScheduleView from '@/components/BusScheduleView';

export const metadata: Metadata = {
  title: 'রাবি বাস সময়সূচী ও লাইভ টাইমার | RU Bus Schedule | রাবিয়ান',
  description: 'রাজশাহী বিশ্ববিদ্যালয় পরিবহন দপ্তরের সকল রুটের বাস শিডিউল, স্টপেজ-ভিত্তিক সময় এবং পরবর্তী বাস ছাড়ার লাইভ কাউন্টডাউন টাইমার।',
  keywords: [
    'রাবি বাস শিডিউল',
    'rabi bus schedule',
    'rabi bus time',
    'ru bus schedule',
    'ru bus time',
    'rajshahi university bus schedule',
    'রাবি বাস সময়সূচী',
    'বাস টাইম রাজশাহী',
    'রাবি পরিবহন',
    'motihar bus schedule',
    'rabian bus',
  ],
  alternates: {
    canonical: 'https://rabian.site/bus',
  },
  openGraph: {
    title: 'রাবি বাস সময়সূচী ও লাইভ কাউন্টডাউন টাইমার | রাবিয়ান',
    description: 'রাজশাহী বিশ্ববিদ্যালয়ের সকল রুটের বাস ছাড়ার সঠিক সময়সূচী ও লাইভ টাইমার।',
    url: 'https://rabian.site/bus',
    images: ['/og-image.png'],
  },
};

export default async function BusPage({
  searchParams,
}: {
  searchParams: Promise<{ widget?: string; mode?: string }>;
}) {
  const resolvedParams = await searchParams;
  const isWidget = resolvedParams?.widget === '1' || resolvedParams?.mode === 'widget';

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <BusScheduleView initialWidgetMode={isWidget} />
    </div>
  );
}
