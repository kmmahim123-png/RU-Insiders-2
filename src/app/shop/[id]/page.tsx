'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Product, ProductVariant } from '@/types';
import {
  ArrowLeft,
  ShoppingBag,
  Check,
  MessageCircle,
  Truck,
  ShieldCheck,
  Sparkles,
  Ruler,
  X,
  CreditCard,
} from 'lucide-react';
import { trackMetaEvent } from '@/lib/metaPixel';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('L');
  const [selectedWeight, setSelectedWeight] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('8801700000000');
  const [defaultPixelId, setDefaultPixelId] = useState('');

  useEffect(() => {
    fetch('/api/store')
      .then((r) => r.json())
      .then((data) => {
        if (data.settings?.whatsappNumber) {
          setWhatsappNumber(data.settings.whatsappNumber);
        }
        const sitePixel = data.settings?.defaultFacebookPixelId || '';
        if (sitePixel) setDefaultPixelId(sitePixel);

        if (data.products) {
          const found = data.products.find((p: Product) => p.id === productId);
          if (found) {
            setProduct(found);
            if (found.sizes?.length) setSelectedSize(found.sizes[0]);
            if (found.weightOptions?.length) setSelectedWeight(found.weightOptions[0]);

            // Fire Meta ViewContent event for product merchant pixel & default site pixel
            const viewPrice =
              found.productType === 'food_weight' && found.weightOptions?.length
                ? found.weightOptions[0].price
                : found.price;
            trackMetaEvent(
              'ViewContent',
              {
                content_ids: [found.id],
                content_name: found.nameBn,
                content_type: 'product',
                value: viewPrice,
                currency: 'BDT',
              },
              [found.facebookPixelId, sitePixel]
            );
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-bold text-slate-600">পণ্য লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-extrabold text-slate-800">পণ্যটি পাওয়া যায়নি</h2>
        <p className="text-sm text-slate-500">সম্ভবত পণ্যটি সরিয়ে নেওয়া হয়েছে বা লিংকটি সঠিক নয়।</p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700 text-white font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> শপে ফিরে যান
        </Link>
      </div>
    );
  }

  // Current Unit Price calculation
  const currentPrice =
    product.productType === 'food_weight' && selectedWeight
      ? selectedWeight.price
      : product.price;

  const currentOptionLabel =
    product.productType === 'apparel'
      ? selectedSize
      : product.productType === 'food_weight' && selectedWeight
      ? selectedWeight.label
      : 'Standard';

  const handleAddToCart = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('ru_cart_items') || '[]');
      const existingIdx = cart.findIndex(
        (i: any) => i.productId === product.id && i.selectedOption === currentOptionLabel
      );

      if (existingIdx > -1) {
        cart[existingIdx].quantity += quantity;
      } else {
        cart.push({
          productId: product.id,
          nameBn: product.nameBn,
          image: product.images[0] || '/mockups/hoodie-front.jpg',
          selectedOption: currentOptionLabel,
          unitPrice: currentPrice,
          quantity: quantity,
          merchantId: product.merchantId,
          merchantName: product.merchantName,
          facebookPixelId: product.facebookPixelId,
        });
      }

      localStorage.setItem('ru_cart_items', JSON.stringify(cart));
      window.dispatchEvent(new Event('ru_cart_updated'));

      trackMetaEvent(
        'AddToCart',
        {
          content_ids: [product.id],
          content_name: product.nameBn,
          content_type: 'product',
          value: currentPrice * quantity,
          currency: 'BDT',
        },
        [product.facebookPixelId, defaultPixelId]
      );

      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch {}
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/cart');
  };

  const whatsappMessage = encodeURIComponent(
    `আসসালামু আলাইকুম! আমি Rabian-এর "${product.nameBn}" সম্পর্কে জানতে চাই।\nঅপশন: ${currentOptionLabel}\nমূল্য: ৳${currentPrice}\nলিংক: ${typeof window !== 'undefined' ? window.location.href : ''}`
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Back Button */}
      <div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> ← শপে ফিরে যান
        </Link>
      </div>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Multi-Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-sm">
            <img
              src={product.images[activeImageIdx] || product.images[0] || '/mockups/hoodie-front.jpg'}
              alt={product.nameBn}
              className="w-full h-full object-cover"
            />
          </div>

          {product.images.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`aspect-square rounded-2xl overflow-hidden border-2 transition ${
                    activeImageIdx === idx
                      ? 'border-blue-600 ring-2 ring-blue-300'
                      : 'border-slate-200 opacity-75 hover:opacity-100 bg-white'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Title, Options & Order Box */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full">
                {product.category}
              </span>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full">
                ১০০% ক্যাশ অন ডেলিভারি
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {product.nameBn}
            </h1>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              {product.shortSummary}
            </p>
          </div>

          {/* Price */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-baseline justify-between">
            <div>
              <span className="text-xs text-slate-500 font-semibold block">নির্ধারিত মূল্য</span>
              <span className="text-3xl font-black text-slate-900">৳{currentPrice}</span>
            </div>
            <span className="text-xs text-emerald-600 font-extrabold bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              {product.inStock ? '✓ স্টকে আছে' : 'স্টক শেষ'}
            </span>
          </div>

          {/* 1. Apparel Product: Size Selector & Size Chart */}
          {product.productType === 'apparel' && product.sizes && product.sizes.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900">
                  সাইজ নির্বাচন করুন: <span className="text-blue-700 font-black">({selectedSize})</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowSizeChart(true)}
                  className="text-xs text-blue-700 hover:underline font-bold flex items-center gap-1"
                >
                  <Ruler className="w-3.5 h-3.5" /> সাইজ চার্ট দেখুন
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`min-w-[50px] py-2 px-3.5 rounded-xl text-xs font-black border transition ${
                      selectedSize === s
                        ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. Food / Weight Product: Pack / Weight Selector with dynamic price */}
          {product.productType === 'food_weight' && product.weightOptions && product.weightOptions.length > 0 && (
            <div className="space-y-2.5">
              <span className="text-xs font-extrabold text-slate-900 block">
                ওজন বা প্যাক নির্বাচন করুন:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.weightOptions.map((w, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedWeight(w)}
                    className={`p-3 rounded-xl text-left border transition flex items-center justify-between ${
                      selectedWeight?.label === w.label
                        ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-300'
                        : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs font-bold">{w.label}</span>
                    <span className="text-xs font-black text-slate-900">৳{w.price}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-extrabold text-slate-900">পরিমাণ:</span>
            <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center text-slate-700 font-bold hover:bg-slate-200 text-base"
              >
                -
              </button>
              <span className="w-12 text-center text-sm font-black text-slate-900">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 flex items-center justify-center text-slate-700 font-bold hover:bg-slate-200 text-base"
              >
                +
              </button>
            </div>
            <span className="text-xs text-slate-500 font-semibold">
              মোট: ৳{currentPrice * quantity}
            </span>
          </div>

          {/* Action Buttons: Add to Cart & Buy Now */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`py-3.5 px-4 rounded-2xl font-bold text-sm transition flex items-center justify-center gap-2 ${
                added
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" /> কার্টে যোগ হয়েছে!
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" /> কার্টে যোগ করুন
                </>
              )}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={!product.inStock}
              className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition"
            >
              <CreditCard className="w-4 h-4" /> এখনই অর্ডার করুন (COD)
            </button>
          </div>

          {/* Smart WhatsApp Contact Button */}
          <a
            href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3 px-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>💬 ব্যাচ/ডিপার্টমেন্ট কাস্টমাইজেশন বা বাল্ক অর্ডারের জন্য WhatsApp-এ কথা বলুন</span>
          </a>

          {/* Delivery & COD Assurances */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-[11px] text-slate-600">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>মতিহার ক্যাম্পাসে ফ্রি ডেলিভারি</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>পণ্য হাতে পেয়ে ১০০% মূল্য পরিশোধ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Multiple Title + Details Sections (Accordion / Cards) */}
      <div className="space-y-4 pt-4">
        <h2 className="text-xl font-extrabold text-slate-900">
          পণ্যের পূর্ণ বিবরণ ও স্পেসিফিকেশন
        </h2>

        {product.detailSections && product.detailSections.length > 0 ? (
          product.detailSections.map((sec, idx) => (
            <div key={sec.id || idx} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{sec.title}</span>
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {sec.content}
              </p>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <p className="text-sm text-slate-600">{product.shortSummary}</p>
          </div>
        )}
      </div>

      {/* Size Chart Modal */}
      {showSizeChart && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Ruler className="w-5 h-5 text-blue-600" /> পোশাকের অফিসিয়াল সাইজ চার্ট (ইঞ্চি)
              </h3>
              <button onClick={() => setShowSizeChart(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-extrabold">
                    <th className="p-2.5 border border-slate-200">সাইজ</th>
                    <th className="p-2.5 border border-slate-200">চেস্ট (বুক)</th>
                    <th className="p-2.5 border border-slate-200">দৈর্ঘ্য (লম্বা)</th>
                    <th className="p-2.5 border border-slate-200">হাতা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700 font-medium">
                  <tr>
                    <td className="p-2 font-bold bg-slate-50">S</td>
                    <td className="p-2">৩৮"</td>
                    <td className="p-2">২৬"</td>
                    <td className="p-2">২৩"</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold bg-slate-50">M</td>
                    <td className="p-2">৪০"</td>
                    <td className="p-2">২৭"</td>
                    <td className="p-2">২৪"</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold bg-slate-50">L</td>
                    <td className="p-2">৪২"</td>
                    <td className="p-2">২৮"</td>
                    <td className="p-2">২৫"</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold bg-slate-50">XL</td>
                    <td className="p-2">৪৪"</td>
                    <td className="p-2">২৯"</td>
                    <td className="p-2">২৬"</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold bg-slate-50">XXL</td>
                    <td className="p-2">৪৬"</td>
                    <td className="p-2">৩০"</td>
                    <td className="p-2">২৭"</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-slate-500">
              * হুডি বা ড্রপ শোল্ডারের জন্য সাইজে সামান্য (০.৫-১ ইঞ্চি) ভ্যারিয়েশন হতে পারে। সন্দেহ হলে আপনার স্বাভাবিক সাইজ থেকে এক সাইজ বড় নির্বাচন করার পরামর্শ দেওয়া হয়।
            </p>

            <button
              onClick={() => setShowSizeChart(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
