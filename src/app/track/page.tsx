'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Clock,
  CheckCircle2,
  Truck,
  Package,
  XCircle,
  MessageCircle,
  MapPin,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Order } from '@/types';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('query') || '';

  const [query, setQuery] = useState(initialQuery);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('8801700000000');

  useEffect(() => {
    fetch('/api/store')
      .then((r) => r.json())
      .then((data) => {
        if (data.settings?.whatsappNumber) setWhatsappNumber(data.settings.whatsappNumber);
      })
      .catch(() => {});

    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = async (searchTerm: string) => {
    const q = (searchTerm || query).trim();
    if (!q) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TRACK_ORDER',
          payload: { query: q },
        }),
      });
      const data = await res.json();
      if (data.ok && data.orders) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status: Order['status']) => {
    switch (status) {
      case 'Pending':
        return 0;
      case 'Confirmed':
        return 1;
      case 'Out for Delivery':
        return 2;
      case 'Delivered':
        return 3;
      default:
        return 0;
    }
  };

  const steps = [
    { title: 'অর্ডার গৃহিত', desc: 'অর্ডার সফলভাবে সিস্টেমে যুক্ত হয়েছে' },
    { title: 'কনফার্মড', desc: 'প্রস্তুতি চলছে ও প্যাকেজিং সম্পন্ন' },
    { title: 'ডেলিভারিতে আছে', desc: 'ডেলিভারিম্যান ক্যাম্পাসে বা কুরিয়ারে' },
    { title: 'ডেলিভারি সম্পন্ন', desc: 'পণ্য গ্রাহকের হাতে বুঝিয়ে দেওয়া হয়েছে' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          লাইভ ডেলিভারি ট্র্যাকিং
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          আপনার অর্ডার ট্র্যাক করুন
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          আপনার অর্ডার আইডি (যেমন: RUI-102456) অথবা অর্ডার করার সময় ব্যবহৃত মোবাইল নাম্বার লিখুন।
        </p>
      </div>

      {/* Search Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch(query);
        }}
        className="max-w-xl mx-auto flex gap-2"
      >
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            required
            placeholder="অর্ডার আইডি (RUI-XXXXXX) বা মোবাইল নাম্বার"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold focus:outline-none focus:border-blue-600 shadow-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md transition disabled:opacity-50"
        >
          {loading ? 'খোঁজা হচ্ছে...' : 'ট্র্যাক করুন'}
        </button>
      </form>

      {/* Results */}
      {searched && !loading && (
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
              <h3 className="text-base font-extrabold text-slate-900">কোনো অর্ডার পাওয়া যায়নি</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                দয়া করে আপনার অর্ডার আইডি বা সঠিক ১১ ডিজিটের মোবাইল নম্বরটি চেক করে পুনরায় চেষ্টা করুন।
              </p>
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`আসসালামু আলাইকুম! আমি আমার অর্ডার ট্র্যাক করতে পারছি না। কি-ওয়ার্ড: ${query}`)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:underline pt-1"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" /> সরাসরি WhatsApp হেল্পলাইনে কথা বলুন
              </a>
            </div>
          ) : (
            orders.map((order) => {
              const currentStep = getStepIndex(order.status);
              const isCancelled = order.status === 'Cancelled';

              return (
                <div
                  key={order.orderId}
                  className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-sm space-y-6"
                >
                  {/* Order Head Meta */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base sm:text-lg font-black text-slate-900 font-mono">
                          {order.orderId}
                        </span>
                        <span
                          className={`text-xs font-black px-3 py-0.5 rounded-full ${
                            order.status === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.status === 'Cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <Calendar className="w-3.5 h-3.5" />
                        অর্ডারের তারিখ: {new Date(order.createdAt).toLocaleDateString('bn-BD')}
                      </p>
                    </div>

                    <a
                      href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`আসসালামু আলাইকুম! আমার অর্ডার আইডি ${order.orderId} সম্পর্কে আপডেট জানতে চাই।`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 border border-emerald-200"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600" /> WhatsApp সাপোর্ট
                    </a>
                  </div>

                  {/* Status Timeline */}
                  {!isCancelled ? (
                    <div className="py-2">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative">
                        {steps.map((st, sIdx) => {
                          const isDone = sIdx <= currentStep;
                          const isCurrent = sIdx === currentStep;
                          return (
                            <div
                              key={sIdx}
                              className={`p-3.5 rounded-2xl border text-center relative transition ${
                                isCurrent
                                  ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-2 ring-blue-200'
                                  : isDone
                                  ? 'border-emerald-300 bg-emerald-50/50'
                                  : 'border-slate-200 bg-slate-50/50 opacity-60'
                              }`}
                            >
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold ${
                                  isDone
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-300 text-slate-700'
                                }`}
                              >
                                {isDone ? '✓' : sIdx + 1}
                              </div>
                              <h4 className="text-xs font-extrabold text-slate-900">{st.title}</h4>
                              <p className="text-[10px] text-slate-500 mt-0.5">{st.desc}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-red-50 text-red-800 rounded-2xl text-xs font-bold flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                      <span>এই অর্ডারটি বাতিল করা হয়েছে। বিস্তারিত জানতে সাপোর্টে মেসেজ দিন।</span>
                    </div>
                  )}

                  {/* Customer & Address Details */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block font-semibold">গ্রাহকের নাম:</span>
                      <span className="font-bold text-slate-800">{order.customerName}</span>
                      <span className="text-slate-400 block font-semibold mt-1.5">ফোন:</span>
                      <span className="font-bold text-slate-800">{order.phone}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">ডেলিভারি ঠিকানা:</span>
                      <span className="font-medium text-slate-800">{order.addressDetails}</span>
                      <span className="text-slate-400 block font-semibold mt-1.5">ডেলিভারি এলাকা:</span>
                      <span className="font-bold text-slate-800">
                        {order.deliveryZone === 'campus'
                          ? 'রাবি ক্যাম্পাস (ফ্রি)'
                          : order.deliveryZone === 'city'
                          ? 'রাজশাহী সিটি'
                          : 'সারা বাংলাদেশ কুরিয়ার'}
                      </span>
                    </div>
                  </div>

                  {/* Itemized List */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-extrabold text-slate-700">অর্ডারের আইটেমসমূহ:</h5>
                    <div className="divide-y divide-slate-100">
                      {order.items.map((item, iIdx) => (
                        <div key={iIdx} className="py-2.5 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={item.image}
                              alt=""
                              className="w-10 h-10 rounded-xl object-cover border"
                            />
                            <div>
                              <span className="font-bold text-slate-900 block">{item.nameBn}</span>
                              <span className="text-slate-500 text-[11px]">
                                {item.selectedOption} x {item.quantity}
                              </span>
                            </div>
                          </div>
                          <span className="font-extrabold text-slate-900">
                            ৳{item.unitPrice * item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total & Payment Method */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm font-black text-slate-900">
                    <span className="text-emerald-700">১০০% ক্যাশ অন ডেলিভারি (COD):</span>
                    <span className="text-base text-slate-900">মোট বকেয়া: ৳{order.totalAmount}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-bold">ট্র্যাকিং লোড হচ্ছে...</p>
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
