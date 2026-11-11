import type { Metadata, Viewport } from 'next';
import './globals.css';
import NavbarAndAuth from '@/components/NavbarAndAuth';
import SpotlightCommand from '@/components/SpotlightCommand';
import CartDrawer from '@/components/CartDrawer';
import PWAInstallBanner from '@/components/PWAInstallBanner';
import MetaPixelTracker from '@/components/MetaPixelTracker';
import RuAiAssistant from '@/components/RuAiAssistant';

export const metadata: Metadata = {
  title: 'Rabian Solution | রাজশাহী বিশ্ববিদ্যালয় স্মার্ট ক্যাম্পাস সলিউশন',
  description: 'Rabian Solution — রাবি ক্লাব, ৫৯ বিভাগ ও শিক্ষক ডিরেক্টরি, ৯০-দিন ব্লাড ব্যাংক, ৩-ধাপের ইন্টারঅ্যাক্টিভ ম্যাপ, নিউজ ও ক্যাম্পাস সেবা।',
  manifest: '/manifest.json',
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
