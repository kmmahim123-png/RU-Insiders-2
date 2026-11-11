import type { Metadata } from 'next';
import { readDb } from '@/lib/db';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  try {
    const { id } = await params;
    const db = await readDb();
    const product = db.products.find((p) => p.id === id);

    if (!product) {
      return {
        title: 'পণ্য বিস্তারিত | Rabian শপ',
      };
    }

    const title = `${product.nameBn} — মাত্র ৳${product.price} | Rabian`;
    const description =
      product.shortSummary ||
      `${product.nameBn} — রাজশাহী বিশ্ববিদ্যালয় অফিসিয়াল শপে অর্ডার করুন (১০০% ক্যাশ অন ডেলিভারি)।`;
    const imageUrl = product.images?.[0] || '/mockups/hoodie-front.jpg';

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        images: [{ url: imageUrl, alt: product.nameBn }],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch {
    return {
      title: 'পণ্য বিস্তারিত | Rabian শপ',
    };
  }
}

export default function ProductDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
