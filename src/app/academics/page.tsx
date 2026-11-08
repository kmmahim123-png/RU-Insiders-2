'use client';

import React, { useState, useEffect } from 'react';
import { RU_FACULTIES, RU_DEPARTMENTS, RuDepartment } from '@/lib/ruAcademicData';
import { AlumniProfile } from '@/types';
import {
  GraduationCap,
  Users,
  Briefcase,
  Search,
  Building,
  Award,
  Globe,
  PlusCircle,
  X,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';

export default function AcademicsPage() {
  const [activeTab, setActiveTab] = useState<'departments' | 'alumni'>('departments');
  const [search, setSearch] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState<string>('all');
  const [alumniList, setAlumniList] = useState<AlumniProfile[]>([]);
  const [loadingAlumni, setLoadingAlumni] = useState(true);

  // Alumni Registration Modal State
  const [showAlumniModal, setShowAlumniModal] = useState(false);
  const [alumName, setAlumName] = useState('');
  const [alumFaculty, setAlumFaculty] = useState('প্রকৌশল অনুষদ');
  const [alumDept, setAlumDept] = useState('');
  const [alumBatch, setAlumBatch] = useState('');
  const [alumRole, setAlumRole] = useState('');
  const [alumOrg, setAlumOrg] = useState('');
  const [alumCountry, setAlumCountry] = useState('বাংলাদেশ');
  const [alumWhatsapp, setAlumWhatsapp] = useState('');
  const [alumEmail, setAlumEmail] = useState('');
  const [alumLinkedin, setAlumLinkedin] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [subSuccess, setSubSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/store')
      .then((r) => r.json())
      .then((data) => {
        if (data.alumni) setAlumniList(data.alumni);
      })
      .catch(() => {})
      .finally(() => setLoadingAlumni(false));

    try {
      const savedUser = JSON.parse(localStorage.getItem('ru_user_session') || 'null');
      if (savedUser?.name) setAlumName(savedUser.name);
      if (savedUser?.email) setAlumEmail(savedUser.email);
    } catch {}
  }, []);

  const filteredDepts = RU_DEPARTMENTS.filter((d) => {
    const matchFac = selectedFaculty === 'all' || d.facultyId === selectedFaculty;
    const matchSearch =
      !search ||
      d.nameBn.toLowerCase().includes(search.toLowerCase()) ||
      d.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      d.facultyBn.toLowerCase().includes(search.toLowerCase());
    return matchFac && matchSearch;
  });

  const filteredAlumni = alumniList.filter((al) => {
    return (
      !search ||
      al.name.toLowerCase().includes(search.toLowerCase()) ||
      al.department.toLowerCase().includes(search.toLowerCase()) ||
      al.organization.toLowerCase().includes(search.toLowerCase()) ||
      al.currentRole.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleRegisterAlumni = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alumName.trim() || !alumDept.trim() || !alumRole.trim() || !alumOrg.trim()) {
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: alumName.trim(),
        faculty: alumFaculty,
        department: alumDept.trim(),
        batch: alumBatch.trim() || 'অ্যালামনাই',
        currentRole: alumRole.trim(),
        organization: alumOrg.trim(),
        country: alumCountry.trim(),
        whatsapp: alumWhatsapp.trim() || undefined,
        email: alumEmail.trim() || undefined,
        linkedin: alumLinkedin.trim() || undefined,
      };

      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REGISTER_ALUMNI', payload }),
      });

      const data = await res.json();
      if (data.ok) {
        setSubSuccess(true);
        setTimeout(() => {
          setSubSuccess(false);
          setShowAlumniModal(false);
          setAlumDept('');
          setAlumBatch('');
          setAlumRole('');
          setAlumOrg('');
        }, 2200);
      }
    } catch {} finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <span className="bg-blue-600/60 text-blue-200 border border-blue-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5" /> রাবি একাডেমিক পোর্টাল
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            বিভাগ, ক্যারিয়ার গাইডলাইন ও ভেরিফাইড অ্যালামনাই ডিরেক্টরি
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            ১২টি অনুষদ, ৫৯টি বিভাগের আসন সংখ্যা, ক্যারিয়ার সম্ভাবনা (BCS, Software, Research, Scholarship) ও বিশ্বজুড়ে প্রতিষ্ঠিত প্রাক্তন শিক্ষার্থীদের নেটওয়ার্ক।
          </p>
        </div>

        <button
          onClick={() => setShowAlumniModal(true)}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs sm:text-sm shadow-md flex items-center gap-2 shrink-0 transition"
        >
          <PlusCircle className="w-4 h-4 text-slate-950" />
          <span>🎓 অ্যালামনাই হিসেবে যুক্ত হোন →</span>
        </button>
      </div>

      {/* Main Mode Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('departments')}
          className={`py-2.5 px-5 rounded-2xl text-xs sm:text-sm font-extrabold transition flex items-center gap-2 ${
            activeTab === 'departments'
              ? 'bg-blue-700 text-white shadow-md'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>অনুষদ ও বিভাগসমূহ ({RU_DEPARTMENTS.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('alumni')}
          className={`py-2.5 px-5 rounded-2xl text-xs sm:text-sm font-extrabold transition flex items-center gap-2 ${
            activeTab === 'alumni'
              ? 'bg-blue-700 text-white shadow-md'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>ভেরিফাইড অ্যালামনাই ডিরেক্টরি ({alumniList.length})</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder={
              activeTab === 'departments'
                ? 'বিভাগ বা অনুষদের নাম খুঁজুন...'
                : 'অ্যালামনাইর নাম, বিভাগ বা প্রতিষ্ঠান খুঁজুন...'
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-600 shadow-sm"
          />
        </div>
      </div>

      {/* ============================================================================ */}
      {/* 1. DEPARTMENTS TAB */}
      {/* ============================================================================ */}
      {activeTab === 'departments' && (
        <div className="space-y-6">
          {/* Faculty filter pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedFaculty('all')}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold shrink-0 transition ${
                selectedFaculty === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              সকল অনুষদ
            </button>
            {RU_FACULTIES.map((fac) => (
              <button
                key={fac.id}
                onClick={() => setSelectedFaculty(fac.id)}
                className={`py-2 px-3.5 rounded-xl text-xs font-bold shrink-0 transition ${
                  selectedFaculty === fac.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {fac.nameBn}
              </button>
            ))}
          </div>

          {/* Department Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDepts.map((dept) => (
              <div
                key={dept.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-blue-200">
                      {dept.facultyBn}
                    </span>
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-200">
                      আসন: {dept.seatCount}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                      {dept.nameBn}
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold">{dept.nameEn}</p>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {dept.overviewBn}
                  </p>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5">
                    <p className="text-slate-500 font-medium flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">{dept.locationBuildingBn}</span>
                    </p>
                    <p className="text-slate-500 font-medium flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="truncate">{dept.degreeOfferedBn}</span>
                    </p>
                  </div>
                </div>

                {/* Career Prospects */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 block flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-emerald-600" /> ক্যারিয়ার সম্ভাবনা:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {dept.careerInBangladesh.sectors.slice(0, 3).map((sec, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-md"
                      >
                        {sec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* 2. ALUMNI DIRECTORY TAB */}
      {/* ============================================================================ */}
      {activeTab === 'alumni' && (
        <div className="space-y-6">
          {loadingAlumni ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-bold text-slate-500">অ্যালামনাই লোড হচ্ছে...</p>
            </div>
          ) : filteredAlumni.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <Users className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-700">কোনো অ্যালামনাই প্রোফাইল মেলেনি</h3>
              <p className="text-xs text-slate-400">
                আপনি রাজশাহী বিশ্ববিদ্যালয়ের প্রাক্তন শিক্ষার্থী হলে প্রথম প্রোফাইলটি যুক্ত করুন!
              </p>
              <button
                onClick={() => setShowAlumniModal(true)}
                className="px-5 py-2.5 rounded-xl bg-blue-700 text-white font-bold text-xs"
              >
                যুক্ত হোন
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAlumni.map((alum) => (
                <div
                  key={alum.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white flex items-center justify-center font-black text-xl shadow-sm">
                        {alum.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-base font-extrabold text-slate-900 truncate">
                            {alum.name}
                          </h3>
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-200">
                            Verified
                          </span>
                        </div>
                        <p className="text-xs text-blue-700 font-bold truncate">{alum.currentRole}</p>
                        <p className="text-xs text-slate-500 font-medium truncate">{alum.organization}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5">
                      <p className="text-slate-600 font-medium">
                        🎓 {alum.department} • <span className="font-bold">{alum.batch}</span>
                      </p>
                      <p className="text-slate-600 font-medium">
                        📍 অবস্থান: <span className="font-bold text-slate-800">{alum.country}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions & WhatsApp Contact */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    {alum.whatsapp ? (
                      <a
                        href={`https://wa.me/${alum.whatsapp}?text=${encodeURIComponent(`আসসালামু আলাইকুম ${alum.name}! আমি RU Insiders পোর্টাল থেকে আপনার প্রোফাইল দেখে যোগাযোগ করছি।`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 border border-emerald-200"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-400">ক্যাম্পাস ভেরিফাইড</span>
                    )}

                    {alum.linkedin && (
                      <a
                        href={alum.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1"
                      >
                        LinkedIn <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Alumni Registration Modal */}
      {showAlumniModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  অ্যালামনাই ডিরেক্টরিতে আপনার তথ্য দিন
                </h3>
                <p className="text-xs text-slate-500">ভেরিফিকেশনের পর প্রোফাইলটি সার্বজনীন তালিকায় যুক্ত হবে</p>
              </div>
              <button
                onClick={() => setShowAlumniModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {subSuccess ? (
              <div className="p-8 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-lg font-black text-emerald-900">রেজিস্ট্রেশন সফল হয়েছে!</h4>
                <p className="text-xs text-emerald-700">
                  ধন্যবাদ! সুপার অ্যাডমিন অনুমোদনের পর আপনার প্রোফাইলটি ডিরেক্টরিতে প্রদর্শিত হবে।
                </p>
              </div>
            ) : (
              <form onSubmit={handleRegisterAlumni} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">আপনার পূর্ণ নাম *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: ড. তানভীর হাসান"
                    value={alumName}
                    onChange={(e) => setAlumName(e.target.value)}
                    className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-600 font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">অনুষদ</label>
                    <select
                      value={alumFaculty}
                      onChange={(e) => setAlumFaculty(e.target.value)}
                      className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-600 font-bold bg-white"
                    >
                      {RU_FACULTIES.map((f) => (
                        <option key={f.id} value={f.nameBn}>
                          {f.nameBn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">বিভাগের নাম *</label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: CSE, Law, Economics"
                      value={alumDept}
                      onChange={(e) => setAlumDept(e.target.value)}
                      className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-600 font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">ব্যাচ / শিক্ষাবর্ষ</label>
                    <input
                      type="text"
                      placeholder="যেমন: ৫০তম ব্যাচ / ২০১৬-১৭"
                      value={alumBatch}
                      onChange={(e) => setAlumBatch(e.target.value)}
                      className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">বর্তমান দেশ / অবস্থান</label>
                    <input
                      type="text"
                      placeholder="যেমন: বাংলাদেশ / জার্মানি / ইউএসএ"
                      value={alumCountry}
                      onChange={(e) => setAlumCountry(e.target.value)}
                      className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">বর্তমান পদবী *</label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: Senior Software Engineer"
                      value={alumRole}
                      onChange={(e) => setAlumRole(e.target.value)}
                      className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">প্রতিষ্ঠান / কোম্পানি *</label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: Google / বিসিএস প্রশাসন / সুপ্রিম কোর্ট"
                      value={alumOrg}
                      onChange={(e) => setAlumOrg(e.target.value)}
                      className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">WhatsApp</label>
                    <input
                      type="text"
                      placeholder="8801700000000"
                      value={alumWhatsapp}
                      onChange={(e) => setAlumWhatsapp(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Email</label>
                    <input
                      type="email"
                      placeholder="email@example.com"
                      value={alumEmail}
                      onChange={(e) => setAlumEmail(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">LinkedIn URL</label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/..."
                      value={alumLinkedin}
                      onChange={(e) => setAlumLinkedin(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs sm:text-sm shadow-md transition disabled:opacity-50"
                >
                  {submitting ? 'জমা দেওয়া হচ্ছে...' : 'অ্যালামনাই আবেদন জমা দিন'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
