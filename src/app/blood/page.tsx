'use client';

import React, { useState, useEffect } from 'react';
import { BloodDonor } from '@/types';
import { calculateDonorEligibility } from '@/lib/bloodUtils';
import {
  HeartPulse,
  Phone,
  MessageCircle,
  Search,
  PlusCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  X,
  Bot,
  Calendar,
} from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as const;

export default function BloodDonationPage() {
  const [donors, setDonors] = useState<BloodDonor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [onlyEligible, setOnlyEligible] = useState<boolean>(true);
  const [search, setSearch] = useState('');

  // Registration modal
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regForm, setRegForm] = useState({
    nameBn: '',
    bloodGroup: 'B+',
    phone: '',
    departmentBn: '',
    hallBn: '',
    lastDonationDate: '',
    totalDonations: 0,
    note: '',
  });
  const [regSuccess, setRegSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Update donation date modal
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updatePhone, setUpdatePhone] = useState('');
  const [updateDate, setUpdateDate] = useState(new Date().toISOString().slice(0, 10));
  const [updateMsg, setUpdateMsg] = useState('');

  const loadDonors = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/store');
      const data = await res.json();
      if (data.bloodDonors) setDonors(data.bloodDonors);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDonors();
  }, []);

  const enrichedDonors = donors.map((d) => ({
    ...d,
    eligibility: calculateDonorEligibility(d),
  }));

  const eligibleTotal = enrichedDonors.filter((d) => d.eligibility.isEligible).length;

  const filtered = enrichedDonors.filter((d) => {
    const groupMatch = selectedGroup === 'all' || d.bloodGroup === selectedGroup;
    const eligMatch = !onlyEligible || d.eligibility.isEligible;
    const q = search.trim().toLowerCase();
    const searchMatch =
      !q ||
      d.nameBn.toLowerCase().includes(q) ||
      d.departmentBn.toLowerCase().includes(q) ||
      (d.hallBn || '').toLowerCase().includes(q) ||
      d.bloodGroup.toLowerCase().includes(q);
    return groupMatch && eligMatch && searchMatch;
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REGISTER_BLOOD_DONOR', payload: regForm }),
      });
      const data = await res.json();
      if (data.ok && data.bloodDonors) {
        setDonors(data.bloodDonors);
        setRegSuccess(true);
        setTimeout(() => {
          setRegSuccess(false);
          setShowRegisterModal(false);
          setRegForm({
            nameBn: '',
            bloodGroup: 'B+',
            phone: '',
            departmentBn: '',
            hallBn: '',
            lastDonationDate: '',
            totalDonations: 0,
            note: '',
          });
        }, 1600);
      } else {
        alert(data.error || 'নিবন্ধন করা যায়নি');
      }
    } catch {
      alert('সার্ভার সমস্যা');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateDonationDate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateMsg('');
    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_BLOOD_DONATION',
          payload: { phone: updatePhone, lastDonationDate: updateDate },
        }),
      });
      const data = await res.json();
      if (data.ok && data.bloodDonors) {
        setDonors(data.bloodDonors);
        setUpdateMsg('✅ রক্তদানের সর্বশেষ তারিখ সফলভাবে আপডেট হয়েছে!');
        setTimeout(() => {
          setShowUpdateModal(false);
          setUpdateMsg('');
        }, 1500);
      } else {
        setUpdateMsg(data.error || 'আপডেট করা যায়নি');
      }
    } catch {
      setUpdateMsg('সার্ভার সমস্যা');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Top Hero */}
      <div className="bg-gradient-to-br from-rose-900 via-red-900 to-slate-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2.5 max-w-2xl">
          <span className="bg-rose-500/30 text-rose-200 border border-rose-400/40 text-xs font-black px-3 py-1 rounded-full inline-flex items-center gap-1.5">
            <HeartPulse className="w-3.5 h-3.5 text-rose-300 animate-pulse" />
            <span>রাবি ব্লাড ব্যাংক ও ৯০-দিন অটো এলিজিবিলিটি ট্র্যাকার</span>
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            জরুরি রক্তদাতা ডিরেক্টরি (৩ মাস / ৯০ দিন নিয়ম)
          </h1>
          <p className="text-xs sm:text-sm text-rose-100/90 leading-relaxed">
            সিস্টেম স্বয়ংক্রিয়ভাবে হিসাব করে যাদের শেষ রক্তদানের পর <strong>৯০ দিন (৩ মাস)</strong> অতিক্রান্ত হয়েছে শুধুমাত্র তারাই এখন <strong>এভেইলেবল</strong> হিসেবে দেখায়। বর্তমানে মোট <strong>{donors.length} জন</strong> নিবন্ধিত দাতার মধ্যে <strong>{eligibleTotal} জন</strong> এখনই রক্তদানে প্রস্তুত!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowRegisterModal(true)}
            className="px-4 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-lg cursor-pointer transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ রক্তদাতা হিসেবে যুক্ত হোন</span>
          </button>
          <button
            type="button"
            onClick={() => setShowUpdateModal(true)}
            className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition"
          >
            <Calendar className="w-4 h-4 text-rose-300" />
            <span>তারিখ আপডেট করুন</span>
          </button>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event('ru_open_ai'))}
            className="px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow cursor-pointer transition"
          >
            <Bot className="w-4 h-4" />
            <span>AI-তে জিজ্ঞেস করুন</span>
          </button>
        </div>
      </div>

      {/* Blood Group Live Counter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {BLOOD_GROUPS.map((bg) => {
          const totalInGroup = enrichedDonors.filter((d) => d.bloodGroup === bg).length;
          const availInGroup = enrichedDonors.filter((d) => d.bloodGroup === bg && d.eligibility.isEligible).length;
          const active = selectedGroup === bg;
          return (
            <button
              key={bg}
              type="button"
              onClick={() => setSelectedGroup(active ? 'all' : bg)}
              className={`p-3 rounded-2xl border-2 text-center transition cursor-pointer ${
                active
                  ? 'border-rose-600 bg-rose-50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-rose-300'
              }`}
            >
              <p className="text-lg font-black text-rose-700">{bg}</p>
              <p className="text-xs font-extrabold text-emerald-700">{availInGroup} জন প্রস্তুত</p>
              <p className="text-[10px] text-slate-400">মোট {totalInGroup} জন</p>
            </button>
          );
        })}
      </div>

      {/* Filters Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="নাম, বিভাগ বা হলের নাম দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-800 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={onlyEligible}
              onChange={(e) => setOnlyEligible(e.target.checked)}
              className="rounded text-emerald-600"
            />
            <span>শুধু ৯০+ দিন এভেইলেবল ({eligibleTotal} জন)</span>
          </label>

          {selectedGroup !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedGroup('all')}
              className="px-3 py-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200"
            >
              সব গ্রুপ দেখান
            </button>
          )}
        </div>
      </div>

      {/* Donors List */}
      {loading ? (
        <div className="py-12 text-center text-xs font-bold text-slate-500 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>রক্তদাতাদের তালিকা লোড হচ্ছে...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-2">
          <p className="text-sm font-black text-slate-800">এই ফিল্টারে কোনো রক্তদাতা পাওয়া যায়নি</p>
          <p className="text-xs text-slate-500">ফিল্টার পরিবর্তন করে দেখুন অথবা জরুরি প্রয়োজনে নতুন দাতা যুক্ত করুন।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((donor) => (
            <div
              key={donor.id}
              className={`bg-white rounded-3xl p-5 border-2 shadow-xs flex flex-col justify-between space-y-4 ${
                donor.eligibility.isEligible ? 'border-emerald-200' : 'border-amber-200 bg-amber-50/20'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-black text-slate-900">{donor.nameBn}</h3>
                    <p className="text-xs text-slate-600 font-semibold">
                      {donor.departmentBn}
                      {donor.hallBn ? ` • ${donor.hallBn}` : ''}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-rose-600 text-white font-black text-sm shadow-xs shrink-0">
                    {donor.bloodGroup}
                  </span>
                </div>

                <div
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
                    donor.eligibility.isEligible
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  {donor.eligibility.isEligible ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                  <span>{donor.eligibility.statusLabelBn}</span>
                </div>

                {donor.note && <p className="text-[11px] text-slate-500">{donor.note}</p>}
              </div>

              {donor.phone ? (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <a
                    href={`tel:${donor.phone}`}
                    className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center justify-center gap-1.5 transition"
                  >
                    <Phone className="w-3.5 h-3.5 text-amber-300" />
                    <span>{donor.phone}</span>
                  </a>
                  <a
                    href={`https://wa.me/88${donor.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                      `আসসালামু আলাইকুম ${donor.nameBn}! RU Insiders ব্লাড ব্যাংক থেকে জরুরি ${donor.bloodGroup} রক্তের জন্য যোগাযোগ করছি।`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WA</span>
                  </a>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {/* Register Donor Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md border border-slate-200 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">🩸 নতুন রক্তদাতা নিবন্ধন</h3>
              <button type="button" onClick={() => setShowRegisterModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            {regSuccess ? (
              <div className="p-6 text-center space-y-2 bg-emerald-50 rounded-2xl border border-emerald-200">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <p className="text-sm font-black text-emerald-900">ধন্যবাদ! আপনার নাম রক্তদাতা তালিকায় যুক্ত হয়েছে।</p>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3 text-xs">
                <input
                  type="text"
                  required
                  placeholder="আপনার পূর্ণ নাম *"
                  value={regForm.nameBn}
                  onChange={(e) => setRegForm({ ...regForm, nameBn: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl font-bold"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={regForm.bloodGroup}
                    onChange={(e) => setRegForm({ ...regForm, bloodGroup: e.target.value })}
                    className="p-3 border border-slate-200 rounded-xl font-black text-rose-700 bg-white"
                  >
                    {BLOOD_GROUPS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    required
                    placeholder="মোবাইল নম্বর *"
                    value={regForm.phone}
                    onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                    className="p-3 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="বিভাগ (যেমন: CSE / বাংলা) *"
                    value={regForm.departmentBn}
                    onChange={(e) => setRegForm({ ...regForm, departmentBn: e.target.value })}
                    className="p-3 border border-slate-200 rounded-xl font-semibold"
                  />
                  <input
                    type="text"
                    placeholder="হল (যেমন: জোহা হল)"
                    value={regForm.hallBn}
                    onChange={(e) => setRegForm({ ...regForm, hallBn: e.target.value })}
                    className="p-3 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">সর্বশেষ রক্তদানের তারিখ (না দিলে প্রস্তুত ধরা হবে):</label>
                  <input
                    type="date"
                    value={regForm.lastDonationDate}
                    onChange={(e) => setRegForm({ ...regForm, lastDonationDate: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <input
                  type="text"
                  placeholder="বিশেষ নোট (ঐচ্ছিক)"
                  value={regForm.note}
                  onChange={(e) => setRegForm({ ...regForm, note: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm shadow transition cursor-pointer"
                >
                  {submitting ? 'জমা হচ্ছে...' : 'রক্তদাতা হিসেবে যুক্ত হোন'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Update Last Donation Date Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">📅 রক্তদানের তারিখ আপডেট</h3>
              <button type="button" onClick={() => setShowUpdateModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateDonationDate} className="space-y-3 text-xs">
              <input
                type="tel"
                required
                placeholder="আপনার নিবন্ধিত মোবাইল নম্বর *"
                value={updatePhone}
                onChange={(e) => setUpdatePhone(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl font-bold"
              />
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">সর্বশেষ রক্তদানের তারিখ:</label>
                <input
                  type="date"
                  required
                  value={updateDate}
                  onChange={(e) => setUpdateDate(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl font-bold"
                />
              </div>
              {updateMsg && <p className="font-bold text-emerald-700">{updateMsg}</p>}
              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow transition cursor-pointer"
              >
                তারিখ আপডেট করুন
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
