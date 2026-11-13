import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Inside RU — রাবি ক্যাম্পাস নিউজ, সাহিত্য ও গবেষণা | Inside RU | রাবিয়ান',
  description: 'রাজশাহী বিশ্ববিদ্যালয়ের তাজা খবর, ব্রেকিং নিউজ, সাহিত্য, কবিতা, গল্প ও শিক্ষার্থীদের গবেষণাপত্র প্রকাশের অফিসিয়াল প্ল্যাটফর্ম।',
  keywords: [
    'রাবি নিউজ',
    'ru news',
    'inside ru',
    'রাজশাহী বিশ্ববিদ্যালয় খবর',
    'রাবি সাহিত্য',
    'মতিহার জার্নাল',
    'rabian news',
  ],
  alternates: {
    canonical: 'https://rabian.site/inside-ru',
  },
  openGraph: {
    title: 'Inside RU — রাবি ক্যাম্পাস নিউজ ও সাহিত্য পোর্টাল | রাবিয়ান',
    description: 'রাজশাহী বিশ্ববিদ্যালয়ের তাজা খবর, সাহিত্য ও গবেষণাপত্র পড়ুন ও জমা দিন।',
    url: 'https://rabian.site/inside-ru',
    images: ['/og-image.png'],
  },
};

export default function InsideRuLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
