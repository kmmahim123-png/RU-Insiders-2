'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Printer,
  MessageCircle,
  FileText,
  Clock,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { Order, OrderItem } from '@/types';
import { trackMetaEvent } from '@/lib/metaPixel';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

export default function CartAndCheckoutPage() {
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [deliveryZone, setDeliveryZone] = useState<'campus' | 'city' | 'nationwide'>('campus');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressDetails, setAddressDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const [deliveryCharges, setDeliveryCharges] = useState({
    campus: 0,
    city: 40,
    nationwide: 100,
  });
  const [whatsappNumber, setWhatsappNumber] = useState('8801700000000');
  const [defaultPixelId, setDefaultPixelId] = useState('');
  const [loggedUser, setLoggedUser] = useState<{ name?: string; email?: string } | null>(null);

  useEffect(() => {
    let loadedItems: OrderItem[] = [];
    const syncUser = () => {
      try {
        const savedUser = JSON.parse(localStorage.getItem('ru_user_session') || 'null');
        if (savedUser?.email || savedUser?.name) {
          setLoggedUser(savedUser);
          setCustomerName((prev) => prev || savedUser.name || '');
        } else {
          setLoggedUser(null);
        }
      } catch {}
    };

    try {
      const saved = JSON.parse(localStorage.getItem('ru_cart_items') || '[]');
      loadedItems = saved;
      setCartItems(saved);
      syncUser();
    } catch {}

    window.addEventListener('ru_auth_changed', syncUser);

    fetch('/api/store')
      .then((r) => r.json())
      .then((data) => {
        if (data.settings?.deliveryCharges) setDeliveryCharges(data.settings.deliveryCharges);
        if (data.settings?.whatsappNumber) setWhatsappNumber(data.settings.whatsappNumber);
        const sitePixel = data.settings?.defaultFacebookPixelId || '';
        if (sitePixel) setDefaultPixelId(sitePixel);

        if (loadedItems.length > 0) {
          const itemPixels = loadedItems.map((i) => i.facebookPixelId).filter(Boolean);
          const cartSubtotal = loadedItems.reduce((sum, i) => sum + (i.unitPrice || 0) * (i.quantity || 1), 0);
          trackMetaEvent(
            'InitiateCheckout',
            {
              content_ids: loadedItems.map((i) => i.productId),
              num_items: loadedItems.reduce((sum, i) => sum + (i.quantity || 1), 0),
              value: cartSubtotal,
              currency: 'BDT',
            },
            [...itemPixels, sitePixel]
          );
        }
      })
      .catch(() => {});
    return () => window.removeEventListener('ru_auth_changed', syncUser);
  }, []);

  const updateQuantity = (idx: number, delta: number) => {
    const updated = [...cartItems];
    const newQty = (updated[idx].quantity || 1) + delta;
    if (newQty <= 0) {
      updated.splice(idx, 1);
    } else {
      updated[idx].quantity = newQty;
    }
    setCartItems(updated);
    localStorage.setItem('ru_cart_items', JSON.stringify(updated));
    window.dispatchEvent(new Event('ru_cart_updated'));
  };

  const removeItem = (idx: number) => {
    const updated = cartItems.filter((_, i) => i !== idx);
    setCartItems(updated);
    localStorage.setItem('ru_cart_items', JSON.stringify(updated));
    window.dispatchEvent(new Event('ru_cart_updated'));
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.unitPrice || 0) * (item.quantity || 1),
    0
  );

  const currentDeliveryCharge =
    deliveryZone === 'campus'
      ? deliveryCharges.campus
      : deliveryZone === 'city'
      ? deliveryCharges.city
      : deliveryCharges.nationwide;

  const totalAmount = subtotal + currentDeliveryCharge;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim() || !phone.trim() || !addressDetails.trim()) {
      setErrorMessage('অনুগ্রহ করে আপনার নাম, মোবাইল নাম্বার ও বিস্তারিত ঠিকানা পূরণ করুন।');
      return;
    }

    if (cartItems.length === 0) {
      setErrorMessage('আপনার কার্ট খালি। অনুগ্রহ করে পণ্য নির্বাচন করুন।');
      return;
    }

    setSubmitting(true);
    try {
      const { data: sessionData } = await supabaseBrowser.auth.getSession().catch(() => ({ data: { session: null } }));
      const accessToken = sessionData?.session?.access_token || '';

      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_ORDER',
          payload: {
            customerName,
            phone,
            deliveryZone,
            addressDetails,
            items: cartItems,
            accessToken,
            customerEmail: loggedUser?.email || sessionData?.session?.user?.email || '',
          },
        }),
      });

      const data = await res.json();
      if (data.ok && data.order) {
        // Fire Meta Pixel Purchase Conversion per merchant pixel & central site pixel
        const purchasePixels = cartItems.map((i) => i.facebookPixelId).filter(Boolean);
        trackMetaEvent(
          'Purchase',
          {
            content_ids: cartItems.map((i) => i.productId),
            content_type: 'product',
            num_items: cartItems.reduce((s, i) => s + (i.quantity || 1), 0),
            value: data.order.totalAmount,
            currency: 'BDT',
          },
          [...purchasePixels, defaultPixelId]
        );

        setPlacedOrder(data.order);
        // Clear Cart
        localStorage.removeItem('ru_cart_items');
        setCartItems([]);
        window.dispatchEvent(new Event('ru_cart_updated'));
      } else {
        setErrorMessage(data.error || 'অর্ডার সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'সার্ভার এরর');
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================================
  // SUCCESS VIEW: OFFICIAL DIGITAL CASH MEMO & 1-CLICK WHATSAPP CONFIRM
  // ============================================================================
  if (placedOrder) {
    const zoneNameBn =
      placedOrder.deliveryZone === 'campus'
        ? 'রাবি ক্যাম্পাস / হল (ফ্রি)'
        : placedOrder.deliveryZone === 'city'
        ? 'রাজশাহী সিটি'
        : 'সারা বাংলাদেশ কুরিয়ার';

    const orderSummaryText = encodeURIComponent(
      `আসসালামু আলাইকুম Rabian!\nআমি একটি নতুন অর্ডার প্লেস করেছি।\n\nঅর্ডার আইডি: ${placedOrder.orderId}\nগ্রাহক: ${placedOrder.customerName}\nমোবাইল: ${placedOrder.phone}\nডেলিভারি এলাকা: ${zoneNameBn}\nঠিকানা: ${placedOrder.addressDetails}\n\nপণ্য তালিকা:\n${placedOrder.items
        .map((i) => `• ${i.nameBn} (${i.selectedOption}) x${i.quantity} = ৳${i.unitPrice * i.quantity}`)
        .join('\n')}\n\nসাবটোটাল: ৳${placedOrder.subtotal}\nডেলিভারি চার্জ: ৳${placedOrder.deliveryCharge}\nসর্বমোট বকেয়া (COD): ৳${placedOrder.totalAmount}\n\nদয়া করে অর্ডারটি কনফার্ম করুন। ধন্যবাদ!`
    );

    return (
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-6">
        {/* Top Success Banner */}
        <div className="bg-emerald-600 text-white rounded-3xl p-6 text-center space-y-2 shadow-lg">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            আলহামদুলিল্লাহ! আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100">
            অফিশিয়াল ডিজিটাল ক্যাশ মেমো তৈরি হয়েছে। পণ্য হাতে পেয়ে মূল্য পরিশোধ (১০০% COD) করবেন।
          </p>
        </div>

        {/* 1-Click WhatsApp Instant Confirm Button */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 text-center space-y-3">
          <h3 className="text-base font-extrabold text-slate-900">
            অর্ডারটি দ্রুততম সময়ে কনফার্ম করতে চান?
          </h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            নিচের বাটনে ক্লিক করলেই ক্যাশ মেমোর পূর্ণ বিবরণ আমাদের অফিসিয়াল WhatsApp-এ চলে যাবে এবং সাথে সাথে কনফার্মেশন পাবেন।
          </p>
          <a
            href={`https://wa.me/${whatsappNumber}?text=${orderSummaryText}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition"
          >
            <MessageCircle className="w-5 h-5" />
            <span>⚡ অর্ডারটি দ্রুত কনফার্ম করতে ১-ক্লিকে WhatsApp-এ পাঠান</span>
          </a>
        </div>

        {/* Official Digital Cash Memo / Invoice Card */}
        <div
          id="cash-memo-printable"
          className="bg-white rounded-3xl border-2 border-slate-300 p-6 sm:p-10 shadow-xl space-y-6 print:m-0 print:border-none print:shadow-none"
        >
          {/* Cash Memo Header */}
          <div className="flex flex-wrap items-center justify-between pb-6 border-b-2 border-slate-200 gap-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Rabian Logo" className="w-12 h-12 rounded-full border border-amber-400" />
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">রাবিয়ান (Rabian)</h2>
                <p className="text-xs text-slate-500 font-semibold">
                  রাজশাহী বিশ্ববিদ্যালয় স্মার্ট ক্যাম্পাস প্ল্যাটফর্ম
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="bg-slate-900 text-amber-400 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Digital Cash Memo
              </span>
              <p className="text-sm font-extrabold text-slate-900 mt-1">
                Order ID: <span className="font-mono text-blue-700">{placedOrder.orderId}</span>
              </p>
              <p className="text-[11px] text-slate-500">
                তারিখ: {new Date(placedOrder.createdAt).toLocaleDateString('bn-BD')}
              </p>
            </div>
          </div>

          {/* Customer & Delivery Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block">গ্রাহকের নাম:</span>
              <span className="font-extrabold text-slate-900 text-sm">{placedOrder.customerName}</span>
              <span className="text-slate-400 font-semibold block mt-2">মোবাইল নাম্বার:</span>
              <span className="font-bold text-slate-800">{placedOrder.phone}</span>
            </div>

            <div>
              <span className="text-slate-400 font-semibold block">ডেলিভারি জোন:</span>
              <span className="font-extrabold text-slate-900">{zoneNameBn}</span>
              <span className="text-slate-400 font-semibold block mt-2">ঠিকানা / হল ও রুম নম্বর:</span>
              <span className="font-medium text-slate-800">{placedOrder.addressDetails}</span>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-extrabold border-b border-slate-200">
                  <th className="p-3">পণ্য বিবরণ</th>
                  <th className="p-3 text-center">অপশন / সাইজ</th>
                  <th className="p-3 text-center">পরিমাণ</th>
                  <th className="p-3 text-right">একক মূল্য</th>
                  <th className="p-3 text-right">মোট টাকা</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {placedOrder.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                      <img src={item.image} alt="" className="w-8 h-8 rounded-lg object-cover border" />
                      <span>{item.nameBn}</span>
                    </td>
                    <td className="p-3 text-center font-bold text-slate-600">{item.selectedOption}</td>
                    <td className="p-3 text-center font-bold">{item.quantity}</td>
                    <td className="p-3 text-right">৳{item.unitPrice}</td>
                    <td className="p-3 text-right font-bold text-slate-900">
                      ৳{item.unitPrice * item.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown */}
          <div className="pt-4 border-t-2 border-slate-200 flex justify-end">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>পণ্য উপমোট (Subtotal):</span>
                <span>৳{placedOrder.subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span>ডেলিভারি চার্জ:</span>
                <span>৳{placedOrder.deliveryCharge}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-base font-black text-slate-900">
                <span>সর্বমোট বকেয়া (COD):</span>
                <span className="text-emerald-700">৳{placedOrder.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Payment Method & Terms */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 font-medium space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="font-extrabold block">পরিশোধের মাধ্যম: ১০০% ক্যাশ অন ডেলিভারি (COD)</span>
                <span>পণ্য হাতে পেয়ে চেক করে ডেলিভারিম্যানকে টাকা বুঝিয়ে দিন।</span>
              </div>
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full uppercase shrink-0">
                1. Intake
              </span>
            </div>
            <p className="text-[11px] text-amber-900 pt-1.5 border-t border-amber-200/70">
              📌 <strong>বাতিল নীতি:</strong> অর্ডার করার পর কাস্টমার নিজে সরাসরি ক্যান্সেল করতে পারবেন না; বাতিল বা পরিবর্তন করতে চাইলে আগে আমাদের WhatsApp-এ মেসেজ করে জানাতে হবে।
            </p>
          </div>

          {/* Print Button */}
          <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 print:hidden">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2"
            >
              <Printer className="w-4 h-4" /> ক্যাশ মেমো প্রিন্ট / PDF সংরক্ষণ
            </button>

            <Link
              href={`/track?query=${placedOrder.orderId}`}
              className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <Clock className="w-4 h-4" /> অর্ডার ট্র্যাক করুন
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // EMPTY CART VIEW
  // ============================================================================
  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">আপনার কার্ট বর্তমানে খালি</h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          রাবি অফিসিয়াল উইন্টার হুডি, টি-শার্ট, খাঁটি খেজুরের গুড় ও সুস্বাদু নাড়ু দেখতে শপে ঘুরে আসুন।
        </p>
        <div className="pt-2">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold shadow-md transition"
          >
            <span>কেনাকাটা শুরু করুন</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // ============================================================================
  // CART & CHECKOUT FORM (100% Cash On Delivery)
  // ============================================================================
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          শপিং কার্ট ও ক্যাশ অন ডেলিভারি চেকআউট
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          কোনো অগ্রিম পেমেন্ট নেই • পণ্য হাতে পেয়ে ১০০% মূল্য পরিশোধ
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>নির্বাচিত পণ্যসমূহ ({cartItems.length}টি)</span>
              <button
                onClick={() => {
                  setCartItems([]);
                  localStorage.removeItem('ru_cart_items');
                  window.dispatchEvent(new Event('ru_cart_updated'));
                }}
                className="text-xs text-rose-600 hover:underline font-bold"
              >
                সব মুছুন
              </button>
            </h2>

            <div className="divide-y divide-slate-100">
              {cartItems.map((item, idx) => (
                <div key={idx} className="py-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.image || '/mockups/hoodie-front.jpg'}
                      alt={item.nameBn}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0 bg-slate-50"
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-extrabold text-slate-900 truncate">
                        {item.nameBn}
                      </h4>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">
                        ভ্যারিয়েন্ট: <span className="text-blue-700">{item.selectedOption}</span>
                      </p>
                      <p className="text-xs font-black text-slate-900 mt-1">
                        ৳{item.unitPrice}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                      <button
                        type="button"
                        onClick={() => updateQuantity(idx, -1)}
                        className="w-8 h-8 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-200"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-black text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(idx, 1)}
                        className="w-8 h-8 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-200"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center gap-3 text-xs text-emerald-900">
            <Truck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-extrabold block">মতিহার ক্যাম্পাসে ফ্রি হোম ডেলিভারি!</span>
              <span>রাবির যেকোনো আবাসিক হল বা ক্যাম্পাসের ভেতরে ডেলিভারি চার্জ সম্পূর্ণ ফ্রি (৳০)।</span>
            </div>
          </div>
        </div>

        {/* Right Column: 100% Cash On Delivery Checkout Form */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              ১০০% ক্যাশ অন ডেলিভারি
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-2">
              ডেলিভারি ঠিকানা ও অর্ডার তথ্য
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              পণ্য পৌঁছানোর পর ডেলিভারিম্যানকে টাকা বুঝিয়ে দিন
            </p>
          </div>

          {loggedUser?.email ? (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>{loggedUser.email}</strong> দিয়ে লগইন আছেন — এই অর্ডার আপনার Google অ্যাকাউন্টের কেনার হিস্ট্রিতে স্থায়ীভাবে সেভ থাকবে।
              </span>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-[11px] font-bold text-blue-900 flex flex-wrap items-center justify-between gap-2">
              <span>Google দিয়ে লগইন করলে আপনার সব অর্ডারের হিস্ট্রি স্থায়ীভাবে অ্যাকাউন্টে থাকবে।</span>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event('ru_open_google_signin'))}
                className="px-2.5 py-1 rounded-lg bg-white border border-blue-300 text-blue-700 font-black hover:bg-blue-50 cursor-pointer"
              >
                Google লগইন
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmitOrder} className="space-y-4">
            {/* Customer Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">আপনার পূর্ণ নাম *</label>
              <input
                type="text"
                required
                placeholder="যেমন: মাহিম আহমেদ"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">সচল মোবাইল নাম্বার *</label>
              <input
                type="tel"
                required
                placeholder="যেমন: 01700000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Delivery Zone Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">ডেলিভারি এলাকা নির্বাচন করুন *</label>
              <div className="space-y-2">
                {[
                  {
                    id: 'campus' as const,
                    label: 'রাবি ক্যাম্পাস / আবাসিক হল',
                    charge: deliveryCharges.campus,
                    badge: 'ফ্রি হোম ডেলিভারি',
                  },
                  {
                    id: 'city' as const,
                    label: 'রাজশাহী সিটি কর্পোরেশন এলাকা',
                    charge: deliveryCharges.city,
                    badge: `৳${deliveryCharges.city}`,
                  },
                  {
                    id: 'nationwide' as const,
                    label: 'সারা বাংলাদেশ কুরিয়ার সার্ভিস',
                    charge: deliveryCharges.nationwide,
                    badge: `৳${deliveryCharges.nationwide}`,
                  },
                ].map((zone) => (
                  <label
                    key={zone.id}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                      deliveryZone === zone.id
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-300'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="deliveryZone"
                        checked={deliveryZone === zone.id}
                        onChange={() => setDeliveryZone(zone.id)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs font-bold text-slate-800">{zone.label}</span>
                    </div>
                    <span className="text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                      {zone.charge === 0 ? 'ফ্রি' : `৳${zone.charge}`}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Address Details */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                বিস্তারিত ঠিকানা (হল, রুম নম্বর বা বাড়ি/রোড নম্বর) *
              </label>
              <textarea
                required
                rows={2}
                placeholder="যেমন: শহীদ জিয়াউর রহমান হল, রুম ৪১২, রাজশাহী বিশ্ববিদ্যালয়"
                value={addressDetails}
                onChange={(e) => setAddressDetails(e.target.value)}
                className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Financial Summary */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>পণ্য উপমোট:</span>
                <span className="font-bold">৳{subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>ডেলিভারি চার্জ:</span>
                <span className="font-bold text-emerald-600">
                  {currentDeliveryCharge === 0 ? 'ফ্রি (৳০)' : `৳${currentDeliveryCharge}`}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-base font-black text-slate-900">
                <span>সর্বমোট বকেয়া (COD):</span>
                <span className="text-emerald-700">৳{totalAmount}</span>
              </div>
            </div>

            {/* Submit Order Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>অর্ডার তৈরি হচ্ছে...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>১০০% ক্যাশ অন ডেলিভারিতে অর্ডার নিশ্চিত করুন</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
