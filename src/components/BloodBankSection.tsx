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
  MapPin,
  ShieldCheck,
} from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as const;

interface BloodBankSectionProps {
  isHomepage?: boolean;
}

/** Interactive Blood Bank & Donor Registry shared cleanly between Homepage (/) and /blood page. */
export default function BloodBankSection({ isHomepage = false }: BloodBankSectionProps) {
  const [donors, setDonors] = useState<BloodDonor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [onlyEligible, setOnlyEligible] = useState<boolean>(true);
  const [search, setSearch] = useState('');

  // Donor registration form state (used in modal or inline homepage toggle)
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regForm, setRegForm] = useState({
    nameBn: '',
    bloodGroup: 'B+',
    phone: '',
    hallBn: '',
    departmentBn: '',
    isRuStudent: false,
    studentRoll: '',
    lastDonationDate: '',
    totalDonations: 0,
    note: '',
  });
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Donation date update modal
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
      (d.studentRoll || '').toLowerCase().includes(q) ||
      d.bloodGroup.toLowerCase().includes(q);
    return groupMatch && eligMatch && searchMatch;
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (regForm.isRuStudent && !regForm.studentRoll.trim()) {
      setRegError('ভেরিফাইড রাবি শিক্ষার্থী হলে আপনার রোল / আইডি নম্বর লিখুন (নাহলে ভেরিফাইড নয় সিলেক্ট করুন)।');
      return;
    }
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
            hallBn: '',
            departmentBn: '',
            isRuStudent: false,
            studentRoll: '',
            lastDonationDate: '',
            totalDonations: 0,
            note: '',
          });
        }, 1600);
      } else {
        setRegError(data.error || 'নিবন্ধন ব্যর্থ হয়েছে');
      }
    } catch {
      setRegError('সার্ভারের সাথে সংযোগ করা যায়নি।');
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
        setUpdateMsg('✓ রক্তদানের তারিখ আপডেট হয়েছে! ৯০ দিনের কাউন্টার রিসেট হয়েছে।');
        setTimeout(() => {
          setShowUpdateModal(false);
          setUpdateMsg('');
          setUpdatePhone('');
        }, 1800);
      } else {
        setUpdateMsg(data.error || 'আপডেট করা যায়নি');
      }
    } catch {
      setUpdateMsg('সার্ভারে সমস্যা হয়েছে');
    }
  };

  const visibleDonors = isHomepage && selectedGroup === 'all' && !search.trim() ? filtered.slice(0, 6) : filtered;

  return (
    <div className={isHomepage ? 'space-y-6' : 'max-w-6xl mx-auto px-4 py-8 sm:py-10 space-y-6'}>
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-rose-700 via-red-700 to-rose-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 bg-white/15 border border-white/25 px-3 py-1 rounded-full text-xs font-black">
              <HeartPulse className="w-4 h-4 text-amber-300" />
              <span>লাইভ রাবি ব্লাড ব্যাংক • ৯০-দিন (৩ মাস) স্বয়ংক্রিয় যাচাই</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              রক্তের গ্রুপ সিলেক্ট করে এভেইলেবল দাতাকে কল দিন বা ডোনার ফর্ম পূরণ করুন
            </h2>
            <p className="text-xs sm:text-sm text-rose-100 leading-relaxed">
              নিচের গ্রুপগুলোতে ক্লিক করলেই এই মুহূর্তে রক্ত দিতে প্রস্তুত দাতাদের নাম, আবাসনের স্থান ও সরাসরি কল নম্বর দেখা যাবে। আমাদের{' '}
              <strong>AI অ্যাসিস্ট্যান্টও</strong> সরাসরি এই ডাটাবেজ থেকে উত্তর দেয়।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowRegisterModal(true)}
              className="px-4 py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-lg transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>আমি রক্ত দিতে চাই (ফর্ম পূরণ করুন)</span>
            </button>

            <button
              type="button"
              onClick={() => setShowUpdateModal(true)}
              className="px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>রক্তদানের তারিখ আপডেট</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold pt-2 border-t border-white/15">
          <span className="bg-emerald-500/25 border border-emerald-300/40 px-3 py-1.5 rounded-xl">
            ✓ এখনই রক্তদানে প্রস্তুত: {eligibleTotal} জন (৯০+ দিন পূর্ণ)
          </span>
          <span className="bg-white/10 border border-white/20 px-3 py-1.5 rounded-xl">
            মোট নিবন্ধিত ডোনার: {donors.length} জন
          </span>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event('ru_open_ai'))}
            className="bg-white text-rose-800 px-3 py-1.5 rounded-xl flex items-center gap-1.5 hover:bg-rose-50 transition cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI-কে জিজ্ঞেস করুন (৯০-দিন + নম্বর)</span>
          </button>
        </div>
      </div>

      {/* Interactive 8 Blood Group Selector Cards */}
      <div className="space-y-2">
        <p className="text-xs font-black text-slate-700 flex items-center gap-1.5">
          <span>🩸 আপনার প্রয়োজনীয় রক্তের গ্রুপ সিলেক্ট করুন:</span>
          {selectedGroup !== 'all' && (
            <span className="text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
              সিলেক্টেড: {selectedGroup} ({filtered.length} জন)
            </span>
          )}
        </p>
        <div className="grid grid-cols-4 sm:grid-cols-9 gap-2">
          <button
            type="button"
            onClick={() => setSelectedGroup('all')}
            className={`p-2.5 rounded-2xl border-2 text-center transition cursor-pointer ${
              selectedGroup === 'all'
                ? 'border-rose-600 bg-rose-50 shadow-sm'
                : 'border-slate-200 bg-white hover:border-rose-300'
            }`}
          >
            <p className="text-sm sm:text-base font-black text-slate-900">সব</p>
            <p className="text-[11px] font-extrabold text-emerald-700">{eligibleTotal} জন</p>
            <p className="text-[10px] text-slate-400">মোট {donors.length}</p>
          </button>

          {BLOOD_GROUPS.map((bg) => {
            const inGroup = enrichedDonors.filter((d) => d.bloodGroup === bg);
            const availInGroup = inGroup.filter((d) => d.eligibility.isEligible).length;
            const active = selectedGroup === bg;
            return (
              <button
                key={bg}
                type="button"
                onClick={() => setSelectedGroup(active ? 'all' : bg)}
                className={`p-2.5 rounded-2xl border-2 text-center transition cursor-pointer ${
                  active
                    ? 'border-rose-600 bg-rose-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-rose-300'
                }`}
              >
                <p className="text-base sm:text-lg font-black text-rose-700">{bg}</p>
                <p className="text-[11px] font-extrabold text-emerald-700">{availInGroup} প্রস্তুত</p>
                <p className="text-[10px] text-slate-400">মোট {inGroup.length}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters Row */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="নাম, আবাসনের স্থান (হল/এলাকা), রোল বা বিভাগ দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 text-slate-900 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-rose-500"
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
        <div className="py-10 text-center text-xs font-bold text-slate-500 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>রক্তদাতাদের তালিকা লোড হচ্ছে...</span>
        </div>
      ) : visibleDonors.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-2">
          <p className="text-sm font-black text-slate-800">এই গ্রুপ বা ফিল্টারে এখনো এভেইলেবল রক্তদাতা পাওয়া যায়নি</p>
          <p className="text-xs text-slate-500">
            উপরের "শুধু ৯০+ দিন এভেইলেবল" টিক তুলে সব দাতা দেখতে পারেন অথবা নতুন রক্তদাতা নিবন্ধন করতে পারেন।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleDonors.map((donor) => (
            <div
              key={donor.id}
              className={`bg-white rounded-3xl p-5 border-2 shadow-xs flex flex-col justify-between space-y-4 ${
                donor.eligibility.isEligible ? 'border-emerald-200' : 'border-amber-200 bg-amber-50/20'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="text-base font-black text-slate-900">{donor.nameBn}</h3>
                      {donor.isVerified && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          <ShieldCheck className="w-3 h-3" />
                          <span>ভেরিফাইড{donor.studentRoll ? ` (${donor.studentRoll})` : ''}</span>
                        </span>
                      )}
                    </div>
                    {donor.hallBn && (
                      <p className="text-xs text-rose-700 font-bold flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>আবাসন: {donor.hallBn}</span>
                      </p>
                    )}
                    {donor.departmentBn && (
                      <p className="text-[11px] text-slate-600 font-semibold mt-0.5">{donor.departmentBn}</p>
                    )}
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
                    <span>সরাসরি কল দিন ({donor.phone})</span>
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
              <div>
                <h3 className="text-base font-black text-slate-900">🩸 আমি রক্ত দিতে চাই — নিবন্ধন ফর্ম</h3>
                <p className="text-[11px] text-slate-500">তথ্য সরাসরি ডাটাবেজে সেভ হবে ও AI চ্যাট থেকেও পাওয়া যাবে</p>
              </div>
              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {regSuccess ? (
              <div className="p-6 text-center space-y-2 bg-emerald-50 rounded-2xl border border-emerald-200">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <p className="text-sm font-black text-emerald-900">ধন্যবাদ! আপনার নাম আমাদের ব্লাড ব্যাংক ডাটাবেজে যুক্ত হয়েছে।</p>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3 text-xs">
                {regError && (
                  <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 font-bold">
                    {regError}
                  </div>
                )}

                <input
                  type="text"
                  required
                  placeholder="আপনার পূর্ণ নাম *"
                  value={regForm.nameBn}
                  onChange={(e) => setRegForm({ ...regForm, nameBn: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl font-bold text-slate-900 bg-white"
                />

                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={regForm.bloodGroup}
                    onChange={(e) => setRegForm({ ...regForm, bloodGroup: e.target.value })}
                    className="p-3 border border-slate-200 rounded-xl font-black text-rose-700 bg-white"
                  >
                    {BLOOD_GROUPS.map((g) => (
                      <option key={g} value={g}>
                        গ্রুপ: {g}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    required
                    placeholder="মোবাইল নম্বর *"
                    value={regForm.phone}
                    onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                    className="p-3 border border-slate-200 rounded-xl font-bold text-slate-900 bg-white"
                  />
                </div>

                <input
                  type="text"
                  required
                  placeholder="আবাসনের স্থান * (যেমন: শহীদ জিয়াউর রহমান হল / বিনোদপুর / কাজলা)"
                  value={regForm.hallBn}
                  onChange={(e) => setRegForm({ ...regForm, hallBn: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl font-bold text-slate-900 bg-white"
                />

                <input
                  type="text"
                  placeholder="বিভাগ বা পেশা (ঐচ্ছিক, যেমন: CSE / বাংলা বিভাগ)"
                  value={regForm.departmentBn}
                  onChange={(e) => setRegForm({ ...regForm, departmentBn: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl font-semibold text-slate-900 bg-white"
                />

                {/* Verification / Roll ID Conditional Section */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <p className="font-black text-slate-800">আপনার রাবি ভেরিফিকেশন / রোল আইডি স্ট্যাটাস:</p>
                  <div className="grid grid-cols-1 gap-1.5">
                    <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 cursor-pointer">
                      <input
                        type="radio"
                        name="ruVerifiedMode"
                        checked={!regForm.isRuStudent}
                        onChange={() => setRegForm({ ...regForm, isRuStudent: false, studentRoll: '' })}
                      />
                      <span className="font-bold text-slate-800">ভেরিফাই করা নেই / সাধারণ ডোনার (রোল লাগবে না)</span>
                    </label>
                    <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 cursor-pointer">
                      <input
                        type="radio"
                        name="ruVerifiedMode"
                        checked={regForm.isRuStudent}
                        onChange={() => setRegForm({ ...regForm, isRuStudent: true })}
                      />
                      <span className="font-bold text-blue-800">ভেরিফাইড রাবি শিক্ষার্থী (রোল আইডি দেব)</span>
                    </label>
                  </div>

                  {regForm.isRuStudent && (
                    <input
                      type="text"
                      required
                      placeholder="আপনার রাবি রোল / স্টুডেন্ট আইডি নম্বর *"
                      value={regForm.studentRoll}
                      onChange={(e) => setRegForm({ ...regForm, studentRoll: e.target.value })}
                      className="w-full p-2.5 border border-blue-300 rounded-xl font-mono font-bold text-slate-900 bg-white"
                    />
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    সর্বশেষ রক্তদানের তারিখ (না দিলে এখনই রক্ত দিতে প্রস্তুত ধরা হবে):
                  </label>
                  <input
                    type="date"
                    value={regForm.lastDonationDate}
                    onChange={(e) => setRegForm({ ...regForm, lastDonationDate: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl font-bold text-slate-900 bg-white"
                  />
                </div>

                <input
                  type="text"
                  placeholder="বিশেষ নোট (ঐচ্ছিক)"
                  value={regForm.note}
                  onChange={(e) => setRegForm({ ...regForm, note: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 bg-white"
                />

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm shadow transition cursor-pointer"
                >
                  {submitting ? 'ডাটাবেজে সেভ হচ্ছে...' : 'রক্তদাতা হিসেবে যুক্ত হোন'}
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
              <button
                type="button"
                onClick={() => setShowUpdateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
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
                className="w-full p-3 border border-slate-200 rounded-xl font-bold text-slate-900 bg-white"
              />
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">সর্বশেষ রক্তদানের তারিখ:</label>
                <input
                  type="date"
                  required
                  value={updateDate}
                  onChange={(e) => setUpdateDate(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl font-bold text-slate-900 bg-white"
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
