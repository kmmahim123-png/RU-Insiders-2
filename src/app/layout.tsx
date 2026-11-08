import type { Metadata, Viewport } from 'next';
import './globals.css';
import NavbarAndAuth from '@/components/NavbarAndAuth';

export const metadata: Metadata = {
  title: 'RU Insiders | রাজশাহী বিশ্ববিদ্যালয় অফিসিয়াল মার্চেন্ডাইজ স্টোর ও ক্যাম্পাস পোর্টাল',
  description: 'রাবি অফিসিয়াল উইন্টার হুডি, টি-শার্ট, খাঁটি খেজুরের গুড়, ৩-ধাপের ইন্টারঅ্যাক্টিভ ম্যাপ, নিউজ ও ক্যাম্পাস পোর্টাল।',
  icons: {
    icon: '/logo.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <body className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 pb-16 lg:pb-0">
        <NavbarAndAuth />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
