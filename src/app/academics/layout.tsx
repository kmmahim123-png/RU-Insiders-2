import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'রাবি অনুষদ, ৫৯টি বিভাগ ও ক্যারিয়ার গাইডলাইন | RU Departments | রাবিয়ান',
  description: 'রাজশাহী বিশ্ববিদ্যালয়ের ১২টি অনুষদ ও ৫৯টি বিভাগের শ্রেণিকক্ষ, ল্যাবরেটরির ছবি, আসন সংখ্যা, ক্যারিয়ার সম্ভাবনা ও প্রাক্তন শিক্ষার্থী (অ্যালামনাই) নেটওয়ার্ক।',
  keywords: [
    'রাবি বিভাগসমূহ',
    'ru departments',
    'rajshahi university faculties',
    'রাবি বিষয় ও আসন',
    'রাবি একাডেমিক',
    'rabian academics',
    'রাজশাহী বিশ্ববিদ্যালয় ডিপার্টমেন্ট',
  ],
  alternates: {
    canonical: 'https://rabian.site/academics',
  },
  openGraph: {
    title: 'রাবি অনুষদ ও ৫৯টি বিভাগ পরিচিতি | রাবিয়ান',
    description: 'রাজশাহী বিশ্ববিদ্যালয়ের ১২টি অনুষদ ও ৫৯টি বিভাগের তথ্য, ল্যাবরেটরির ছবি ও ক্যারিয়ার গাইডলাইন।',
    url: 'https://rabian.site/academics',
    images: ['/og-image.png'],
  },
};

export default function AcademicsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
