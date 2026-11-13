import type { Metadata, Viewport } from 'next';
import './globals.css';
import NavbarAndAuth from '@/components/NavbarAndAuth';
import SpotlightCommand from '@/components/SpotlightCommand';
import CartDrawer from '@/components/CartDrawer';
import PWAInstallBanner from '@/components/PWAInstallBanner';
import MetaPixelTracker from '@/components/MetaPixelTracker';
import RuAiAssistant from '@/components/RuAiAssistant';

export const metadata: Metadata = {
  metadataBase: new URL('https://rabian.site'),
  title: {
    default: 'রাবিয়ান | রাজশাহী বিশ্ববিদ্যালয় স্মার্ট ক্যাম্পাস প্ল্যাটফর্ম',
    template: '%s | রাবিয়ান',
  },
  description: 'রাবিয়ান (Rabian) — রাজশাহী বিশ্ববিদ্যালয়ের সব ডিজিটাল সেবা এক প্ল্যাটফর্মে। রাবি বাস শিডিউল ও লাইভ টাইমার, মাসিক ক্যাম্পাস ম্যারাথন, ৩,৮৭৭ শিক্ষক ও কর্মকর্তা ডিরেক্টরি, ৯০-দিন ব্লাড ব্যাংক ও ৩-ধাপের ওয়াটার ম্যাপ।',
  applicationName: 'রাবিয়ান (Rabian)',
  keywords: [
    'রাবিয়ান',
    'Rabian',
    'rabian site',
    'rabian.site',
    'রাজশাহী বিশ্ববিদ্যালয়',
    'Rajshahi University',
    'রাবি বাস শিডিউল',
    'RU bus schedule',
    'রাবি শিক্ষক ফোনবুক',
    'RU teacher contact',
    'রাবি ডিরেক্টরি',
    'রাবি ব্লাড ব্যাংক',
    'RU blood donor',
    'রাবি ম্যারাথন',
    'Rabian marathon',
    'মতিহার ক্যাম্পাস',
    'প্যারিস রোড',
    'রাবি হুডি',
    'রাবি ক্লাব মেম্বারশিপ',
    'RU Insiders',
  ],
  authors: [{ name: 'রাবিয়ান প্ল্যাটফর্ম', url: 'https://rabian.site' }],
  creator: 'রাবিয়ান টিম',
  publisher: 'রাবিয়ান রাজশাহী বিশ্ববিদ্যালয়',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: 'https://rabian.site',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'রাবিয়ান | রাজশাহী বিশ্ববিদ্যালয় স্মার্ট ক্যাম্পাস প্ল্যাটফর্ম',
    description: 'রাবি শিক্ষার্থীদের সব ডিজিটাল সেবা এক প্ল্যাটফর্মে — বাস শিডিউল, ম্যারাথন, শিক্ষক ফোনবুক, রক্তদান ও ম্যাপ।',
    url: 'https://rabian.site',
    siteName: 'রাবিয়ান (Rabian)',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'রাবিয়ান - রাজশাহী বিশ্ববিদ্যালয় স্মার্ট ক্যাম্পাস প্ল্যাটফর্ম',
      },
    ],
    locale: 'bn_BD',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'রাবিয়ান | রাজশাহী বিশ্ববিদ্যালয় স্মার্ট ক্যাম্পাস প্ল্যাটফর্ম',
    description: 'রাবি বাস শিডিউল, ম্যারাথন, ৩,৮৭৭ শিক্ষক ফোনবুক ও রক্তদান এক প্ল্যাটফর্মে।',
    images: ['/og-image.png'],
  },
  verification: {
    google: '2FsLnx8Q7XZ3aUJmF3whq8sVLTvkpkVvXGQ6SqzOW4A',
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon-96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icon-144.png', sizes: '144x144', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0c2419',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="48x48" href="/icon-48.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/icon-96.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="google-site-verification" content="2FsLnx8Q7XZ3aUJmF3whq8sVLTvkpkVvXGQ6SqzOW4A" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'WebSite',
                  '@id': 'https://rabian.site/#website',
                  url: 'https://rabian.site',
                  name: 'রাবিয়ান | Rabian',
                  alternateName: [
                    'Rabian',
                    'রাবিয়ান',
                    'rabian.site',
                    'Rabian RU',
                    'Rajshahi University Rabian',
                    'রাবিয়ান রাজশাহী বিশ্ববিদ্যালয়',
                    'RU Insiders',
                  ],
                  description:
                    'রাজশাহী বিশ্ববিদ্যালয়ের সব ডিজিটাল সেবা এক প্ল্যাটফর্মে — বাস শিডিউল, ম্যারাথন, ৩,৮৭৭ শিক্ষক ডিরেক্টরি, রক্তদান ও ম্যাপ।',
                  inLanguage: 'bn-BD',
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: 'https://rabian.site/directory?q={search_term_string}',
                    'query-input': 'required name=search_term_string',
                  },
                },
                {
                  '@type': 'Organization',
                  '@id': 'https://rabian.site/#organization',
                  name: 'রাবিয়ান (Rabian)',
                  url: 'https://rabian.site',
                  logo: {
                    '@type': 'ImageObject',
                    url: 'https://rabian.site/logo-full.png',
                    width: 1024,
                    height: 1024,
                  },
                  sameAs: ['https://wa.me/8801325661777'],
                },
                {
                  '@type': 'ItemList',
                  '@id': 'https://rabian.site/#sitelinks',
                  name: 'Rabian Site Navigation Links',
                  itemListElement: [
                    {
                      '@type': 'SiteNavigationElement',
                      position: 1,
                      name: 'রাবি বাস সময়সূচী ও লাইভ টাইমার',
                      description: 'সকল রুটের বাস শিডিউল ও পরবর্তী বাস ছাড়ার লাইভ কাউন্টডাউন টাইমার',
                      url: 'https://rabian.site/bus',
                    },
                    {
                      '@type': 'SiteNavigationElement',
                      position: 2,
                      name: 'শিক্ষক ও কর্মকর্তা ফোনবুক ডিরেক্টরি',
                      description: '৩,৮৭৭ জন শিক্ষক, ডিন, প্রক্টর ও কর্মকর্তার মোবাইল নম্বর ও ইমেইল',
                      url: 'https://rabian.site/directory',
                    },
                    {
                      '@type': 'SiteNavigationElement',
                      position: 3,
                      name: 'রাবি ব্লাড ব্যাংক ও জরুরি রক্তদাতা',
                      description: '৯০+ দিন সম্পন্ন উপযুক্ত রক্তদাতাদের তালিকা ও তাৎক্ষণিক কল',
                      url: 'https://rabian.site/blood',
                    },
                    {
                      '@type': 'SiteNavigationElement',
                      position: 4,
                      name: '৩-ধাপের ইন্টারঅ্যাক্টিভ ম্যাপ ও সনদ',
                      description: 'রাবি ক্যাম্পাস, রাজশাহী জেলা ও রাজশাহী বিভাগের পূর্ণাঙ্গ ম্যাপ ও সনদপত্র',
                      url: 'https://rabian.site/map',
                    },
                    {
                      '@type': 'SiteNavigationElement',
                      position: 5,
                      name: 'মাসিক ক্যাম্পাস ম্যারাথন রেজিস্ট্রেশন',
                      description: 'রাবিয়ান ক্যাম্পাস ম্যারাথন তথ্য ও অনলাইনে ফ্রি রেজিস্ট্রেশন ফর্ম',
                      url: 'https://rabian.site/marathon',
                    },
                    {
                      '@type': 'SiteNavigationElement',
                      position: 6,
                      name: 'অনুষদ, ৫৯টি বিভাগ ও ক্যারিয়ার',
                      description: '১২টি অনুষদ ও ৫৯টি বিভাগের ভবন, আসন সংখ্যা ও অ্যালামনাই নেটওয়ার্ক',
                      url: 'https://rabian.site/academics',
                    },
                    {
                      '@type': 'SiteNavigationElement',
                      position: 7,
                      name: 'রাবিয়ান শপ ও কালেকশন',
                      description: 'উইন্টার হুডি, টি-শার্ট, রাজশাহীর খাঁটি খেজুরের গুড় ও নাড়ু',
                      url: 'https://rabian.site/shop',
                    },
                  ],
                },
              ],
            }),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                document.documentElement.classList.remove('dark');
                localStorage.removeItem('ru_theme');
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 pb-28 lg:pb-0 max-w-full overflow-x-hidden">
        <NavbarAndAuth />
        <main className="flex-1">{children}</main>
        <SpotlightCommand />
        <CartDrawer />
        <PWAInstallBanner />
        <MetaPixelTracker />
        <RuAiAssistant mode="floating" />
      </body>
    </html>
  );
}
