import React from 'react';
import type { Metadata } from 'next';
import BusScheduleView from '@/components/BusScheduleView';

export const metadata: Metadata = {
  title: 'রাবি বাস সময়সূচী ও লাইভ টাইমার | রাবিয়ান',
  description: 'রাজশাহী বিশ্ববিদ্যালয় পরিবহন দপ্তরের সকল রুটের বাস শিডিউল, স্টপেজ-ভিত্তিক আনুমানিক সময় এবং পরবর্তী বাস ছাড়ার লাইভ কাউন্টডাউন টাইমার।',
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
