'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  X,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Truck,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export interface CartItem {
  productId: string;
  nameBn: string;
  image: string;
  selectedOption: string;
  unitPrice: number;
  quantity: number;
}

// Global helper to trigger flying thumbnail animation
export function triggerFlyToCart(imgSrc: string, startX: number, startY: number) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const cartIcon = document.getElementById('ru-cart-icon-badge');
  const targetX = cartIcon ? cartIcon.getBoundingClientRect().left + 15 : window.innerWidth - 60;
  const targetY = cartIcon ? cartIcon.getBoundingClientRect().top + 15 : 30;

  const flyImg = document.createElement('img');
  flyImg.src = imgSrc || '/mockups/hoodie-front.jpg';
  flyImg.style.position = 'fixed';
  flyImg.style.left = `${startX}px`;
  flyImg.style.top = `${startY}px`;
  flyImg.style.width = '55px';
  flyImg.style.height = '55px';
  flyImg.style.objectFit = 'cover';
  flyImg.style.borderRadius = '16px';
  flyImg.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.4)';
  flyImg.style.border = '2px solid #fbbf24';
  flyImg.style.zIndex = '99999';
  flyImg.style.pointerEvents = 'none';
  flyImg.style.transition = 'all 0.75s cubic-bezier(0.19, 1, 0.22, 1)';
  document.body.appendChild(flyImg);

  requestAnimationFrame(() => {
    flyImg.style.transform = `translate3d(${targetX - startX}px, ${targetY - startY}px, 0) scale(0.2)`;
    flyImg.style.opacity = '0.2';
  });

  setTimeout(() => {
    if (flyImg && flyImg.parentNode) {
      flyImg.parentNode.removeChild(flyImg);
    }
    // Bounce badge
    if (cartIcon) {
      cartIcon.classList.add('scale-125');
      setTimeout(() => cartIcon.classList.remove('scale-125'), 250);
    }
  }, 750);
}

export default function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const loadCart = () => {
    try {
      const items = JSON.parse(localStorage.getItem('ru_cart_items') || '[]');
      setCartItems(Array.isArray(items) ? items : []);
    } catch {
      setCartItems([]);
    }
  };

  useEffect(() => {
    loadCart();

    const handleUpdate = () => loadCart();
    const handleOpen = () => {
      loadCart();
      setIsOpen(true);
    };

    window.addEventListener('ru_cart_updated', handleUpdate);
    window.addEventListener('ru_open_cart', handleOpen);

    return () => {
      window.removeEventListener('ru_cart_updated', handleUpdate);
      window.removeEventListener('ru_open_cart', handleOpen);
    };
  }, []);

  const updateQuantity = (index: number, delta: number) => {
    const updated = [...cartItems];
    updated[index].quantity += delta;
    if (updated[index].quantity <= 0) {
      updated.splice(index, 1);
    }
    setCartItems(updated);
    localStorage.setItem('ru_cart_items', JSON.stringify(updated));
    window.dispatchEvent(new Event('ru_cart_updated'));
  };

  const removeItem = (index: number) => {
    const updated = cartItems.filter((_, i) => i !== index);
    setCartItems(updated);
    localStorage.setItem('ru_cart_items', JSON.stringify(updated));
    window.dispatchEvent(new Event('ru_cart_updated'));
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-sm flex justify-end animate-fadeIn"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-out animate-slideLeft"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-emerald-950 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold flex items-center gap-2">
                শপিং কার্ট
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full text-amber-300">
                  {totalCount} টি আইটেম
                </span>
              </h3>
              <p className="text-[11px] text-emerald-200">ক্যাম্পাসে ক্যাশ অন ডেলিভারি</p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Free Delivery Banner */}
        <div className="bg-emerald-50 border-b border-emerald-100 p-3 px-4 flex items-center gap-2 text-xs font-bold text-emerald-800">
          <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>মতিহারের সকল আবাসিক হলে সম্পূর্ণ ফ্রি হোম ডেলিভারি!</span>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800">আপনার কার্ট বর্তমানে খালি</h4>
                <p className="text-xs text-slate-500 mt-1">
                  রাবি অফিশিয়াল হুডি বা খেজুরের গুড় অর্ডার করতে শপ ভিজিট করুন
                </p>
              </div>
              <Link
                href="/shop"
                onClick={() => setIsOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition"
              >
                শপ কালেকশন দেখুন
              </Link>
            </div>
          ) : (
            cartItems.map((item, idx) => (
              <div
                key={`${item.productId}-${item.selectedOption}-${idx}`}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3 relative group"
              >
                <img
                  src={item.image || '/mockups/hoodie-front.jpg'}
                  alt={item.nameBn}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-black text-slate-900 truncate">{item.nameBn}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded">
                      {item.selectedOption}
                    </span>
                    <span className="text-xs font-black text-emerald-700">৳{item.unitPrice}</span>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden shadow-xs">
                      <button
                        onClick={() => updateQuantity(idx, -1)}
                        className="px-2 py-1 text-slate-600 hover:bg-slate-100 transition"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2.5 text-xs font-extrabold text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(idx, 1)}
                        className="px-2 py-1 text-slate-600 hover:bg-slate-100 transition"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(idx)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-slate-900">
                    ৳{item.unitPrice * item.quantity}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer / Checkout CTA */}
        {cartItems.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>মোট আইটেম মূল্য:</span>
                <span className="font-bold text-slate-900">৳{totalAmount}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>ক্যাম্পাস ডেলিভারি:</span>
                <span>ফ্রি (৳০)</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>সর্বমোট প্রদেয়:</span>
                <span className="text-emerald-700 text-base">৳{totalAmount}</span>
              </div>
            </div>

            <Link
              href="/cart"
              onClick={() => setIsOpen(false)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg transition"
            >
              <span>অর্ডারে এগিয়ে যান (১-ক্লিক চেকআউট)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
