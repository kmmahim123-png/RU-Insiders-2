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
  title: 'রাবিয়ান | রাজশাহী বিশ্ববিদ্যালয় স্মার্ট ক্যাম্পাস প্ল্যাটফর্ম',
  description: 'রাবিয়ান (Rabian) — রাবি বাস শিডিউল ও লাইভ টাইমার, মাসিক ক্যাম্পাস ম্যারাথন, ক্লাব, ৫৯ বিভাগ ও শিক্ষক ডিরেক্টরি, ৯০-দিন ব্লাড ব্যাংক ও ৩-ধাপের ইন্টারঅ্যাক্টিভ ম্যাপ।',
  manifest: '/manifest.json',
  alternates: {
    canonical: 'https://rabian.site',
  },
  openGraph: {
    title: 'রাবিয়ান | রাজশাহী বিশ্ববিদ্যালয় স্মার্ট ক্যাম্পাস প্ল্যাটফর্ম',
    description: 'রাবি শিক্ষার্থীদের সব ডিজিটাল সেবা এক প্ল্যাটফর্মে — বাস, ম্যারাথন, শিক্ষক ফোনবুক, রক্তদান ও ম্যাপ।',
    url: 'https://rabian.site',
    siteName: 'রাবিয়ান (Rabian)',
    images: [
      {
        url: '/campus/paris-road-rain.jpg',
        width: 1200,
        height: 630,
        alt: 'রাবিয়ান - রাজশাহী বিশ্ববিদ্যালয়',
      },
    ],
    locale: 'bn_BD',
    type: 'website',
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
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
