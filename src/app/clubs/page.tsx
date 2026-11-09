'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { RU_CLUBS, RuClub } from '@/lib/ruClubsData';
import { ClubInfo } from '@/types';
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
  Image as ImageIcon,
  ExternalLink,
  ChevronRight,
  Award,
  Globe,
} from 'lucide-react';
import CardTilt from '@/components/CardTilt';

export default function ClubsPage() {
  const [clubsList, setClubsList] = useState<RuClub[]>(RU_CLUBS);
  const [selectedClubDetail, setSelectedClubDetail] = useState<RuClub | null>(null);
  const [selectedClubForApply, setSelectedClubForApply] = useState<RuClub | null>(null);
  const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);

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
    // Load custom clubs data from API to merge admin updates & uploaded images
    fetch('/api/store')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.clubs?.length) {
          const dbClubs: ClubInfo[] = data.clubs;
          const merged = RU_CLUBS.map((base) => {
            const found = dbClubs.find(
              (c) => c.id === base.id || c.id === base.id.replace('club-', '') || `club-${c.id}` === base.id
            );
            if (found) {
              return {
                ...base,
                nameBn: found.nameBn || base.nameBn,
                descriptionBn: found.descriptionBn || base.descriptionBn,
                mottoBn: found.mottoBn || base.mottoBn,
                roomLocationBn: found.roomLocationBn || base.roomLocationBn,
                contactEmail: found.contactEmail || base.contactEmail,
                facebookUrl: found.facebookUrl || base.facebookUrl,
                images: found.images?.length ? found.images : base.images,
                whatTheyDo: found.whatTheyDo?.length ? found.whatTheyDo : base.whatTheyDo,
              };
            }
            return base;
          });
          setClubsList(merged);
        }
      })
      .catch(() => {});

    try {
      const savedUser = JSON.parse(localStorage.getItem('ru_user_session') || 'null');
      if (savedUser?.name) setStudentName(savedUser.name);
      if (savedUser?.email) setEmail(savedUser.email);
    } catch {}
  }, []);

  const openApplicationFor = (club: RuClub) => {
    setSelectedClubForApply(club);
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClubForApply || !studentName.trim() || !phone.trim() || !department.trim()) {
      alert('অনুগ্রহ করে নাম, বিভাগ ও মোবাইল নম্বর পূরণ করুন');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        clubId: selectedClubForApply.id.replace('club-', ''),
        clubName: selectedClubForApply.nameBn,
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
          setSelectedClubForApply(null);
          setDepartment('');
          setSession('');
          setRollNumber('');
          setPhone('');
          setReason('');
        }, 2500);
      } else {
        alert(data.error || 'আবেদন জমা দিতে সমস্যা হয়েছে');
      }
    } catch (err: any) {
      alert(err.message || 'নেটওয়ার্ক সমস্যা');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to get gallery images for a club
  const getClubImages = (club: RuClub): string[] => {
    if (club.images?.length) return club.images;
    return [
      club.coverImageUrl || '/campus/ru-spot.jpg',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80',
      '/campus/paris-road-rain.jpg',
    ];
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-8 font-bengali">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <span className="bg-emerald-600/60 text-emerald-200 border border-emerald-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5" /> রাবি ক্লাব ও সাংস্কৃতিক সংগঠন
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            ক্যাম্পাসের শীর্ষ ক্লাব ও মেম্বারশিপ পোর্টাল
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            ক্যারিয়ার স্কিল, বিতর্ক, রক্তদান, ফটোগ্রাফি ও বিজ্ঞান গবেষণার শীর্ষ ক্লাবসমূহে যুক্ত হয়ে নিজের সক্ষমতা বৃদ্ধি করুন। যেকোনো ক্লাবের কার্ডে স্পর্শ করে কার্যক্রমের ছবি ও অর্জন দেখুন।
          </p>
        </div>

        <Link
          href="/admin"
          className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-emerald-300 font-extrabold text-xs sm:text-sm flex items-center gap-2 transition shrink-0 shadow-sm"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>ক্লাব ম্যানেজমেন্ট লগইন →</span>
        </Link>
      </div>

      {/* Clubs Grid (Every Card Clickable to open Popup) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {clubsList.map((club) => {
          const images = getClubImages(club);
          return (
            <CardTilt
              key={club.id}
              onClick={() => {
                setActiveGalleryIdx(0);
                setSelectedClubDetail(club);
              }}
              className="bg-white rounded-3xl border border-slate-200 hover:border-emerald-500 p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 space-y-5 flex flex-col justify-between cursor-pointer group"
            >
              <div className="space-y-4">
                {/* Photo Preview Strip */}
                <div className="w-full h-40 rounded-2xl overflow-hidden bg-slate-100 relative border border-slate-100">
                  <img
                    src={images[0]}
                    alt={club.nameBn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <ImageIcon className="w-3 h-3 text-amber-400" /> {images.length}টি কার্যক্রমের ছবি
                  </span>
                  <span className="absolute top-2 left-2 bg-emerald-700/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
                    {club.categoryBn}
                  </span>
                </div>

                {/* Head Meta */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-700 to-emerald-600 text-white font-black text-base flex items-center justify-center shadow-md shrink-0">
                      {club.shortName}
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-emerald-700 transition">
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
                <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                  {club.descriptionBn}
                </p>

                {/* What They Do */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
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
                  <span className="flex items-center gap-1 font-semibold text-slate-700 truncate">
                    <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span className="truncate">{club.roomLocationBn}</span>
                  </span>
                  <span className="flex items-center gap-1 truncate">
                    <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{club.contactEmail}</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <span className="text-emerald-700 font-black text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>কার্যক্রম ও ছবি দেখুন</span>
                  <ChevronRight className="w-4 h-4" />
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openApplicationFor(club);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 transition active:scale-95"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>আবেদন করুন</span>
                </button>
              </div>
            </CardTilt>
          );
        })}
      </div>

      {/* ============================================================================ */}
      {/* POPUP MODAL: CLUB DETAILS + ACTIVITY PHOTO GALLERY                          */}
      {/* ============================================================================ */}
      {selectedClubDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-3xl w-full p-5 sm:p-8 space-y-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setSelectedClubDetail(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500 font-bold transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="space-y-2 pb-4 border-b border-slate-100 pr-10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full">
                  {selectedClubDetail.categoryBn}
                </span>
                <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">
                  প্রতিষ্ঠা: {selectedClubDetail.establishedYear}
                </span>
                {selectedClubDetail.memberCount && (
                  <span className="bg-blue-50 text-blue-800 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
                    {selectedClubDetail.memberCount}
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {selectedClubDetail.nameBn}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold">{selectedClubDetail.mottoBn}</p>
            </div>

            {/* Activity Photo Gallery (User Requirement: "ক্লাবের বিভিন্ন কার্যক্রমের ছবি") */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>ক্লাবের বিভিন্ন কার্যক্রম, কর্মশালা ও উৎসবের ছবি ({getClubImages(selectedClubDetail).length}টি ছবি)</span>
              </h3>

              {/* Main Image Viewport */}
              <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 relative shadow-inner">
                <img
                  src={getClubImages(selectedClubDetail)[activeGalleryIdx] || getClubImages(selectedClubDetail)[0]}
                  alt={selectedClubDetail.nameBn}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnail Selector */}
              {getClubImages(selectedClubDetail).length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {getClubImages(selectedClubDetail).map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveGalleryIdx(idx)}
                      className={`w-20 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition cursor-pointer ${
                        activeGalleryIdx === idx
                          ? 'border-emerald-600 ring-2 ring-emerald-300'
                          : 'border-slate-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description & Objective */}
            <div className="space-y-3 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-100">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>ক্লাবের লক্ষ্য ও বিস্তারিত পরিচিতি</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {selectedClubDetail.descriptionBn}
              </p>
            </div>

            {/* What They Do */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>ক্লাবের নিয়মিত কার্যক্রম, উৎসব ও সেমিনারসমূহ</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedClubDetail.whatTheyDo.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2.5 bg-slate-50 rounded-xl text-xs text-slate-700 font-semibold border border-slate-100">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements & Where They Went */}
            {selectedClubDetail.whereTheyWent && (
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-2">
                <h4 className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-500" /> জাতীয় ও আন্তর্জাতিক অর্জন:
                </h4>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  {selectedClubDetail.whereTheyWent.achievementsBn}
                </p>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  {selectedClubDetail.whereTheyWent.notablePlacementsBn}
                </p>
              </div>
            )}

            {/* Benefits of Joining */}
            {selectedClubDetail.benefitsBn && selectedClubDetail.benefitsBn.length > 0 && (
              <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-2">
                <h4 className="text-xs font-black text-blue-950 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-600" /> মেম্বারশিপের সুযোগ ও সুবিধাসমূহ:
                </h4>
                <ul className="space-y-1 text-xs text-blue-900 font-semibold list-disc pl-5">
                  {selectedClubDetail.benefitsBn.map((ben, idx) => (
                    <li key={idx}>{ben}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Contact & Office Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 font-bold block text-[10px]">অফিস / রুম নম্বর:</span>
                <span className="font-bold text-slate-800">{selectedClubDetail.roomLocationBn}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 font-bold block text-[10px]">যোগাযোগের ইমেইল:</span>
                <span className="font-bold text-slate-800">{selectedClubDetail.contactEmail}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              {selectedClubDetail.facebookUrl && (
                <a
                  href={selectedClubDetail.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Globe className="w-3.5 h-3.5" /> ফেসবুক অফিসিয়াল পেজ
                </a>
              )}

              <button
                type="button"
                onClick={() => {
                  const club = selectedClubDetail;
                  setSelectedClubDetail(null);
                  openApplicationFor(club);
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>মেম্বারশিপের জন্য এখনই আবেদন করুন (১-ক্লিক ফর্ম)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* 1-CLICK MEMBERSHIP APPLICATION MODAL                                         */}
      {/* ============================================================================ */}
      {selectedClubForApply && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  মেম্বারশিপ আবেদন
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  {selectedClubForApply.nameBn}
                </h3>
              </div>
              <button
                onClick={() => setSelectedClubForApply(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {applySuccess ? (
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold text-emerald-900">
                  আপনার আবেদন সফলভাবে জমা হয়েছে!
                </h4>
                <p className="text-xs text-emerald-700">
                  ক্লাব কার্যনির্বাহী পরিষদ শীঘ্রই আপনার সাথে যোগাযোগ করবে।
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitApplication} className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-slate-700">শিক্ষার্থীর পূর্ণ নাম *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: সাকিব আল হাসান"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-700">বিভাগ *</label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: অর্থনীতি বিভাগ"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700">শিক্ষা সেশন</label>
                    <input
                      type="text"
                      placeholder="যেমন: ২০২২-২৩"
                      value={session}
                      onChange={(e) => setSession(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-700">ক্লাস রোল / আইডি</label>
                    <input
                      type="text"
                      placeholder="যেমন: ২২০০০১২৩৪"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700">রক্তের গ্রুপ</label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-700">মোবাইল নম্বর *</label>
                    <input
                      type="tel"
                      required
                      placeholder="০১৭০০-০০০০০০"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700">ইমেইল ঠিকানা</label>
                    <input
                      type="email"
                      placeholder="student@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700">ক্লাবে যোগদানের আগ্রহ / পূর্ব অভিজ্ঞতা</label>
                  <textarea
                    rows={3}
                    placeholder="আপনি কেন এই ক্লাবে যুক্ত হতে চান?"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'আবেদন পাঠানো হচ্ছে...' : 'আবেদনপত্র জমা দিন'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
