import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'রাবিয়ান মাসিক ক্যাম্পাস ম্যারাথন ও রেজিস্ট্রেশন | RU Marathon | রাবিয়ান',
  description: 'রাজশাহী বিশ্ববিদ্যালয় মতিহার ক্যাম্পাসে প্রতি মাসের অফিসিয়াল রানিং ম্যারাথন, রুট ম্যাপ, সনদপত্র ও অনলাইনে ফ্রি রেজিস্ট্রেশন ফর্ম।',
  keywords: [
    'রাবি ম্যারাথন',
    'ru marathon',
    'rabian marathon',
    'ক্যাম্পাস রান রাজশাহী',
    'rajshahi marathon',
    'মতিহার ম্যারাথন',
    'রাবিয়ান ক্যাম্পাস রান',
  ],
  alternates: {
    canonical: 'https://rabian.site/marathon',
  },
  openGraph: {
    title: 'রাবিয়ান মাসিক ক্যাম্পাস ম্যারাথন ও রেজিস্ট্রেশন | রাবিয়ান',
    description: 'রাজশাহী বিশ্ববিদ্যালয় ক্যাম্পাস ম্যারাথন তথ্য ও অনলাইনে সরাসরি রেজিস্ট্রেশন।',
    url: 'https://rabian.site/marathon',
    images: ['/og-image.png'],
  },
};

export default function MarathonLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
