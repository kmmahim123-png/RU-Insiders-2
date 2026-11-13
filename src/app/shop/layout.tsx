import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'রাবিয়ান শপ — রাবি হুডি, ড্রপ শোল্ডার ও খাঁটি খেজুরের গুড় | Rabian Shop',
  description: 'রাজশাহী বিশ্ববিদ্যালয় অফিসিয়াল মার্চেন্ডাইজ স্টোর — প্রিমিয়াম উইন্টার হুডি, ড্রপ শোল্ডার, টি-শার্ট, রাজশাহীর খাঁটি খেজুরের গুড় ও নাড়ু। মতিহার ক্যাম্পাসে ফ্রি হোম ডেলিভারি।',
  keywords: [
    'রাবি হুডি',
    'ru hoodie',
    'রাজশাহী খেজুরের গুড়',
    'rabian shop',
    'রাবি মার্চেন্ডাইজ',
    'মতিহার হুডি',
    'রাজশাহী সিল্ক ও গুড়',
  ],
  alternates: {
    canonical: 'https://rabian.site/shop',
  },
  openGraph: {
    title: 'রাবিয়ান শপ — রাবি হুডি ও রাজশাহীর খাঁটি খেজুরের গুড় | রাবিয়ান',
    description: 'রাবি প্রিমিয়াম হুডি ও রাজশাহীর খাঁটি খেজুরের গুড় — মতিহার ক্যাম্পাসে ফ্রি হোম ডেলিভারি।',
    url: 'https://rabian.site/shop',
    images: ['/og-image.png'],
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
