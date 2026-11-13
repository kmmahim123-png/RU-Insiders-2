import React from 'react';
import type { Metadata } from 'next';
import CampusDirectoryView from '@/components/CampusDirectoryView';

export const metadata: Metadata = {
  title: 'রাবি শিক্ষক ও কর্মকর্তা ফোনবুক ডিরেক্টরি (৩,৮৭৭ জন) | RU Teacher Contact | রাবিয়ান',
  description: 'রাজশাহী বিশ্ববিদ্যালয়ের সকল অনুষদ ও বিভাগের ৩,৮৭৭ জন শিক্ষক, ডিন, চেয়ারম্যান, প্রক্টর ও কর্মকর্তার ভেরিফাইড মোবাইল নম্বর ও অফিসিয়াল ইমেইল ডিরেক্টরি।',
  keywords: [
    'রাবি শিক্ষক ফোনবুক',
    'ru teacher phonebook',
    'rajshahi university faculty contact',
    'রাবি ডিরেক্টরি',
    'ru directory',
    'রাবি প্রক্টর নম্বর',
    'রাবি রেজিস্ট্রারের নম্বর',
    'রাবি সিএসই শিক্ষক',
    'rabian directory',
  ],
  alternates: {
    canonical: 'https://rabian.site/directory',
  },
  openGraph: {
    title: 'রাবি শিক্ষক ও কর্মকর্তা ফোনবুক ডিরেক্টরি (৩,৮৭৭ জন) | রাবিয়ান',
    description: 'রাজশাহী বিশ্ববিদ্যালয়ের সম্মানিত শিক্ষক ও কর্মকর্তাদের মোবাইল নম্বর ও অফিসিয়াল ইমেইল।',
    url: 'https://rabian.site/directory',
    images: ['/og-image.png'],
  },
};

export default function DirectoryPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <CampusDirectoryView />
    </div>
  );
}
