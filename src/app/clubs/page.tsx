'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { RU_CLUBS, RuClub } from '@/lib/ruClubsData';
import {
  Trophy,
  Users,
  CheckCircle2,
  Sparkles,
  MapPin,
  Mail,
  Phone,
  Send,
  X,
  ShieldCheck,
  Check,
} from 'lucide-react';

export default function ClubsPage() {
  const [selectedClub, setSelectedClub] = useState<RuClub | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Application form fields
  const [studentName, setStudentName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [session, setSession] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('A+');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  useEffect(() => {
    try {
      const savedUser = JSON.parse(localStorage.getItem('ru_user_session') || 'null');
      if (savedUser?.name) setStudentName(savedUser.name);
      if (savedUser?.email) setEmail(savedUser.email);
    } catch {}
  }, []);

  const openApplicationFor = (club: RuClub) => {
    setSelectedClub(club);
    setShowApplyModal(true);
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClub || !studentName.trim() || !phone.trim() || !department.trim()) {
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        clubId: selectedClub.id,
        clubName: selectedClub.nameBn,
        studentName: studentName.trim(),
        email: email.trim(),
        department: department.trim(),
        session: session.trim() || '২০২৪-২৫',
        rollNumber: rollNumber.trim() || 'N/A',
        phone: phone.trim(),
        bloodGroup,
        reason: reason.trim() || 'ক্লাবের কার্যক্রমে সক্রিয়ভাবে অংশ নিতে আগ্রহী।',
      };

      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'APPLY_CLUB', payload }),
      });

      const data = await res.json();
      if (data.ok) {
        setApplySuccess(true);
        setTimeout(() => {
          setApplySuccess(false);
          setShowApplyModal(false);
          setDepartment('');
          setSession('');
          setRollNumber('');
          setPhone('');
          setReason('');
        }, 2500);
      }
    } catch {} finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <span className="bg-emerald-600/60 text-emerald-200 border border-emerald-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5" /> রাবি ক্লাব ও সাংস্কৃতিক সংগঠন
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            ক্যাম্পাস এক্টিভিজম, নেতৃত্ব ও ১-ক্লিক মেম্বারশিপ পোর্টাল
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            ক্যারিয়ার স্কিল, বিতর্ক, রক্তদান, ফটোগ্রাফি ও বিজ্ঞান গবেষণার শীর্ষ ক্লাবসমূহে যুক্ত হয়ে নিজের সক্ষমতা বৃদ্ধি করুন।
          </p>
        </div>

        <Link
          href="/admin"
          className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shrink-0 transition backdrop-blur-sm"
        >
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>ক্লাব প্রতিনিধি / অ্যাডমিন লগইন →</span>
        </Link>
      </div>

      {/* Clubs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {RU_CLUBS.map((club) => (
          <div
            key={club.id}
            className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 space-y-5 flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Head Meta */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-700 to-emerald-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                    {club.shortName}
                  </div>
                  <div>
                    <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                      {club.categoryBn}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-1">
                      {club.nameBn}
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold">{club.mottoBn}</p>
                  </div>
                </div>

                <span className="text-[11px] text-slate-400 font-bold shrink-0">
                  প্রতিষ্ঠা: {club.establishedYear}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {club.descriptionBn}
              </p>

              {/* What They Do */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> নিয়মিত কার্যক্রম ও উৎসব:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {club.whatTheyDo.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location & Contact Meta */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-rose-600" />
                  {club.roomLocationBn}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  {club.contactEmail}
                </span>
              </div>
            </div>

            {/* Apply Button */}
            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => openApplicationFor(club)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-extrabold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition"
              >
                <Users className="w-4 h-4" />
                <span>মেম্বারশিপের জন্য আবেদন করুন (১-ক্লিক ফর্ম)</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 1-Click Membership Application Modal */}
      {showApplyModal && selectedClub && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  মেম্বারশিপ আবেদন
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  {selectedClub.nameBn}
                </h3>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {applySuccess ? (
              <div className="p-8 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-lg font-black text-emerald-900">আবেদন সফলভাবে গ্রহণ করা হয়েছে!</h4>
                <p className="text-xs text-emerald-700">
                  {selectedClub.shortName}-এর নির্বাহী কমিটি আপনার আবেদনটি যাচাই করে অনুমোদনের পর যোগাযোগ করবে।
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitApplication} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">আপনার পূর্ণ নাম *</label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: মাহিম আহমেদ"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-600 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">ইমেইল ঠিকানা *</label>
                    <input
                      type="email"
                      required
                      placeholder="student@ru.ac.bd"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-600 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">বিভাগ (Department) *</label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: CSE, Physics, Economics"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-600 font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">শিক্ষাবর্ষ (Session) *</label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: ২০২০-২১"
                      value={session}
                      onChange={(e) => setSession(e.target.value)}
                      className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">ক্লাস রোল / আইডি</label>
                    <input
                      type="text"
                      placeholder="যেমন: ২১১০..."
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">মোবাইল নাম্বার *</label>
                    <input
                      type="tel"
                      required
                      placeholder="01700000000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">রক্তের গ্রুপ</label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-600 bg-white font-bold"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    কেন এই ক্লাবে যুক্ত হতে চান? (১-২ লাইন)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="আপনার আগ্রহ বা দক্ষতা সম্পর্কে সংক্ষেপে লিখুন..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-600 leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    'আবেদন প্রক্রিয়াকরণ হচ্ছে...'
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> আবেদন জমা দিন
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
