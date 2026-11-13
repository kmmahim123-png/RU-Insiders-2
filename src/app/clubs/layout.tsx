import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'রাবি ক্যাম্পাসের শীর্ষ ক্লাবসমূহ ও ১-ক্লিক মেম্বারশিপ | RU Clubs | রাবিয়ান',
  description: 'RUCS, RUDEU, RUSC, RUPS, বাঁধন, রোভার স্কাউট, রঙ্গভূমি ও IEEE RU-তে মেম্বারশিপের জন্য এখনই সরাসরি অনলাইনে আবেদন জমা দিন।',
  keywords: [
    'রাবি ক্লাব',
    'ru clubs',
    'রাবি ক্যারিয়ার ক্লাব',
    'rucs',
    'rudeu',
    'rusc',
    'বাঁধন রাবি',
    'রোভার স্কাউট রাবি',
    'rabian clubs',
  ],
  alternates: {
    canonical: 'https://rabian.site/clubs',
  },
  openGraph: {
    title: 'রাবি ক্যাম্পাসের শীর্ষ ক্লাবসমূহ ও মেম্বারশিপ আবেদন | রাবিয়ান',
    description: 'রাজশাহী বিশ্ববিদ্যালয়ের শীর্ষ ক্লাবসমূহের পরিচিতি ও সরাসরি ১-ক্লিক মেম্বারশিপ আবেদন ফর্ম।',
    url: 'https://rabian.site/clubs',
    images: ['/og-image.png'],
  },
};

export default function ClubsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
