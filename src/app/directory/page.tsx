import React from 'react';
import type { Metadata } from 'next';
import CampusDirectoryView from '@/components/CampusDirectoryView';

export const metadata: Metadata = {
  title: 'রাবি শিক্ষক ও কর্মকর্তা ফোনবুক ডিরেক্টরি | রাবিয়ান',
  description: 'রাজশাহী বিশ্ববিদ্যালয়ের সকল অনুষদ, বিভাগ, ইনস্টিটিউট, হল ও প্রশাসনিক দপ্তরের ৩,৮৭৭ জন শিক্ষক, কর্মকর্তা ও কর্মচারীর নাম, পদবি, মোবাইল নম্বর ও অফিশিয়াল ইমেইল ডিরেক্টরি।',
};

export default function DirectoryPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <CampusDirectoryView />
    </div>
  );
}
