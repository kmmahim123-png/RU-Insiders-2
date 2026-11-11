import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rabian Merchant Hub | মার্চেন্ট ড্যাশবোর্ড অ্যাপ',
  description: 'Rabian মার্চেন্ট স্টোর, ৫-ধাপের অর্ডার প্রসেস, রাইডার হোয়াটসঅ্যাপ গ্রুপ, Steadfast কুরিয়ার ও Meta Pixel কন্ট্রোল ড্যাশবোর্ড।',
  manifest: '/merchant-manifest.json',
};

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
