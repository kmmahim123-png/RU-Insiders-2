'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { ShoppingBag, Check, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [added, setAdded] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const cart = JSON.parse(localStorage.getItem('ru_cart_items') || '[]');
      const defaultOption =
        product.productType === 'apparel'
          ? (product.sizes?.[0] || 'L')
          : product.productType === 'food_weight'
          ? (product.weightOptions?.[0]?.label || 'Standard')
          : 'Standard';

      let defaultPrice = product.price;
      if (product.productType === 'food_weight' && product.weightOptions?.length) {
        defaultPrice = product.weightOptions[0].price;
      }

      const existingIndex = cart.findIndex(
        (i: any) => i.productId === product.id && i.selectedOption === defaultOption
      );

      if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
      } else {
        cart.push({
          productId: product.id,
          nameBn: product.nameBn,
          image: product.images[0] || '/mockups/hoodie-front.jpg',
          selectedOption: defaultOption,
          unitPrice: defaultPrice,
          quantity: 1,
        });
      }

      localStorage.setItem('ru_cart_items', JSON.stringify(cart));
      window.dispatchEvent(new Event('ru_cart_updated'));

      setAdded(true);
      setTimeout(() => setAdded(false), 1600);
    } catch {}
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group">
      {/* Product Image Container */}
      <Link href={`/shop/${product.id}`} className="relative aspect-[4/3] bg-slate-100 overflow-hidden block">
        <img
          src={product.images[0] || '/mockups/hoodie-front.jpg'}
          alt={product.nameBn}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
            {product.category}
          </span>
          {product.featured && (
            <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-sm">
              ★ স্পেশাল
            </span>
          )}
        </div>

        {!product.inStock && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
            <span className="bg-red-600 text-white font-extrabold text-xs px-3 py-1 rounded-full">
              স্টক শেষ
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <Link href={`/shop/${product.id}`} className="block">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 line-clamp-1 group-hover:text-blue-700 transition">
              {product.nameBn}
            </h3>
          </Link>
          <p className="text-xs text-slate-500 line-clamp-2 mt-1">
            {product.shortSummary}
          </p>
        </div>

        {/* Price & Action */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">মূল্য</span>
            <span className="text-base sm:text-lg font-black text-slate-900">
              ৳{product.price}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              href={`/shop/${product.id}`}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition"
              title="বিস্তারিত দেখুন"
            >
              <Eye className="w-4 h-4" />
            </Link>

            <button
              onClick={handleQuickAdd}
              disabled={!product.inStock}
              className={`py-2 px-3 sm:px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                added
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-700 hover:bg-blue-800 text-white shadow-sm'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-3.5 h-3.5" /> যোগ হয়েছে
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" /> কার্ট
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
