'use client';

import React, { useState, useEffect } from 'react';
import { RU_FACULTIES, RU_DEPARTMENTS, RuDepartment } from '@/lib/ruAcademicData';
import { AlumniProfile, CustomDepartmentData } from '@/types';
import { getContactsForDept } from '@/data/ruDirectoryData';
import CampusDirectoryView from '@/components/CampusDirectoryView';
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
  Sparkles,
  Image as ImageIcon,
  ChevronRight,
  MapPin,
  Mail,
  Linkedin,
  Phone,
  BookOpen,
} from 'lucide-react';
import CardTilt from '@/components/CardTilt';

export default function AcademicsPage() {
  const [activeTab, setActiveTab] = useState<'departments' | 'directory'>('departments');
  const [search, setSearch] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState<string>('all');
  const [alumniList, setAlumniList] = useState<AlumniProfile[]>([]);
  const [customDepts, setCustomDepts] = useState<Record<string, CustomDepartmentData>>({});
  const [loading, setLoading] = useState(true);

  // Selected Department for Details Popup Modal
  const [selectedDept, setSelectedDept] = useState<RuDepartment | null>(null);
  const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);

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
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.alumni) setAlumniList(data.alumni);
        if (data?.departments) setCustomDepts(data.departments);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    try {
      const savedUser = JSON.parse(localStorage.getItem('ru_user_session') || 'null');
      if (savedUser?.name) setAlumName(savedUser.name);
      if (savedUser?.email) setEmail(savedUser.email);
    } catch {}
  }, []);

  const setEmail = (val: string) => {
    setAlumEmail(val);
  };

  const filteredDepts = RU_DEPARTMENTS.filter((d) => {
    const matchFac = selectedFaculty === 'all' || d.facultyId === selectedFaculty;
    const matchSearch =
      !search ||
      d.nameBn.toLowerCase().includes(search.toLowerCase()) ||
      d.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      d.facultyBn.toLowerCase().includes(search.toLowerCase());
    return matchFac && matchSearch;
  });

  const handleOpenAlumniModalForDept = (dept: RuDepartment) => {
    setAlumFaculty(dept.facultyBn);
    setAlumDept(dept.nameBn);
    setShowAlumniModal(true);
  };

  const handleRegisterAlumni = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alumName.trim() || !alumDept.trim() || !alumRole.trim() || !alumOrg.trim()) {
      alert('অনুগ্রহ করে নাম, বিভাগ, পদবি ও প্রতিষ্ঠানের নাম পূরণ করুন');
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
      } else {
        alert(data.error || 'আবেদন জমা দিতে সমস্যা হয়েছে');
      }
    } catch (err: any) {
      alert(err.message || 'নেটওয়ার্ক সমস্যা');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to get merged images for a department
  const getDeptImages = (dept: RuDepartment): string[] => {
    const custom = customDepts[dept.id];
    if (custom?.images?.length) return custom.images;
    if (dept.images?.length) return dept.images;
    // Default campus & academic photos
    return [
      '/campus/ru-admin.jpg',
      '/campus/paris-road-rain.jpg',
      '/campus/ru-spot.jpg',
    ];
  };

  // Helper to match alumni for the selected department
  const getDeptAlumni = (dept: RuDepartment): AlumniProfile[] => {
    const deptNameLower = dept.nameBn.toLowerCase();
    const deptCodeLower = dept.code.toLowerCase();
    const facNameLower = dept.facultyBn.toLowerCase();

    return alumniList.filter((al) => {
      const alDept = (al.department || '').toLowerCase();
      const alFac = (al.faculty || '').toLowerCase();
      return (
        alDept.includes(deptCodeLower) ||
        alDept.includes(deptNameLower) ||
        deptNameLower.includes(alDept) ||
        (alFac === facNameLower && alDept.length > 0)
      );
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 pb-24 sm:pb-12 space-y-8 font-bengali">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <span className="bg-blue-600/60 text-blue-200 border border-blue-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5" /> রাবি একাডেমিক ও অনুষদ ডিরেক্টরি
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            অনুষদ, বিভাগ, ক্যারিয়ার গাইডলাইন ও ভেরিফাইড অ্যালামনাই
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            ১২টি অনুষদ ও ৫৯টি বিভাগের ভবন, শ্রেণিকক্ষ ও ল্যাবের ছবি, ক্যারিয়ার সম্ভাবনা এবং সরাসরি স্ব স্ব অনুষদের অ্যালামনাই নেটওয়ার্ক। যে কোনো কার্ডে স্পর্শ করে বিস্তারিত দেখুন।
          </p>
        </div>

        <button
          onClick={() => {
            setAlumFaculty('প্রকৌশল অনুষদ');
            setAlumDept('');
            setShowAlumniModal(true);
          }}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs sm:text-sm shadow-md flex items-center gap-2 shrink-0 transition active:scale-95 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-slate-950" />
          <span>🎓 অ্যালামনাই হিসেবে যুক্ত হোন →</span>
        </button>
      </div>

      {/* Top View Selector: 59 Departments vs 3,877 Faculty/Staff Directory */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm max-w-xl">
        <button
          type="button"
          onClick={() => setActiveTab('departments')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'departments'
              ? 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>অনুষদ ও বিভাগ পরিচিতি (৫৯টি)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('directory')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'directory'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Phone className="w-4 h-4 text-emerald-400" />
          <span>শিক্ষক ও কর্মকর্তা ফোনবুক (৩,৮৭৭ জন)</span>
        </button>
      </div>

      {activeTab === 'directory' ? (
        <CampusDirectoryView />
      ) : (
        <>
          {/* Search & Filter Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="বিভাগ, অনুষদ বা কোডের নাম খুঁজুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-600 shadow-sm"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="text-xs font-bold text-slate-500">
            মোট প্রদর্শিত: <span className="text-blue-700 font-black">{filteredDepts.length}টি বিভাগ</span>
          </div>
        </div>

        {/* Faculty filter pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedFaculty('all')}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
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
              className={`py-2 px-3.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
                selectedFaculty === fac.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {fac.nameBn}
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================================ */}
      {/* DEPARTMENT CARDS GRID (CLICKABLE TO OPEN RICH POPUP)                         */}
      {/* ============================================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepts.map((dept) => {
          const custom = customDepts[dept.id];
          const images = getDeptImages(dept);
          const deptAlumni = getDeptAlumni(dept);
          const seatCount = custom?.seatCount ?? dept.seatCount;
          const building = custom?.locationBuildingBn ?? dept.locationBuildingBn;
          const overview = custom?.overviewBn ?? dept.overviewBn;

          return (
            <CardTilt
              key={dept.id}
              onClick={() => {
                setActiveGalleryIdx(0);
                setSelectedDept(dept);
              }}
              className="bg-white rounded-3xl border border-slate-200 hover:border-blue-500 p-5 sm:p-6 shadow-sm hover:shadow-xl hover:-translate-y-0.5 emil-card space-y-4 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
            >
              {/* Top Image Preview Banner */}
              <div className="w-full h-36 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 relative">
                <img
                  src={images[0]}
                  alt={dept.nameBn}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]"
                />
                <span className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                  <ImageIcon className="w-3 h-3 text-amber-400" /> {images.length}টি ছবি
                </span>
                <span className="absolute top-2 left-2 bg-blue-700/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
                  {dept.facultyBn}
                </span>
              </div>

              <div className="space-y-2 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-blue-700 transition">
                    {dept.nameBn}
                  </h3>
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                    আসন: {seatCount}
                  </span>
                </div>

                <p className="text-xs text-slate-500 font-semibold">{dept.nameEn}</p>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {overview}
                </p>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] space-y-1">
                  <p className="text-slate-600 font-medium flex items-center gap-1.5 truncate">
                    <Building className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{building}</span>
                  </p>
                  <p className="text-slate-600 font-medium flex items-center gap-1.5 truncate">
                    <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="truncate">{custom?.degreeOfferedBn ?? dept.degreeOfferedBn}</span>
                  </p>
                </div>
              </div>

              {/* Bottom Cue & Alumni Counter */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-indigo-600" /> {deptAlumni.length} জন অ্যালামনাই
                </span>
                <span className="text-blue-700 font-extrabold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>বিস্তারিত ও ছবি দেখুন</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </CardTilt>
          );
        })}
      </div>
        </>
      )}

      {/* ============================================================================ */}
      {/* POPUP MODAL: FACULTY / DEPARTMENT FULL DETAILS + PHOTOS + ALUMNI            */}
      {/* ============================================================================ */}
      {selectedDept && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-3xl w-full p-5 sm:p-8 space-y-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setSelectedDept(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500 font-bold transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="space-y-2 pb-4 border-b border-slate-100 pr-10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-black px-3 py-1 rounded-full">
                  {selectedDept.facultyBn}
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full">
                  মোট আসন: {customDepts[selectedDept.id]?.seatCount ?? selectedDept.seatCount}টি
                </span>
                <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">
                  প্রতিষ্ঠা: {selectedDept.establishedYear}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {selectedDept.nameBn}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold">{selectedDept.nameEn}</p>
            </div>

            {/* Photo Gallery (User Requirement: "ওখানে অনেক ছবিও থাকবে ওই অনুষদের") */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-blue-600" />
                <span>অনুষদ ভবন, ল্যাবরেটরি ও ক্লাসরুমের ছবি ({getDeptImages(selectedDept).length}টি ছবি)</span>
              </h3>

              {/* Main Image Viewport */}
              <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 relative shadow-inner">
                <img
                  src={getDeptImages(selectedDept)[activeGalleryIdx] || getDeptImages(selectedDept)[0]}
                  alt={selectedDept.nameBn}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnail Selector */}
              {getDeptImages(selectedDept).length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {getDeptImages(selectedDept).map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveGalleryIdx(idx)}
                      className={`w-20 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition cursor-pointer ${
                        activeGalleryIdx === idx
                          ? 'border-blue-600 ring-2 ring-blue-300'
                          : 'border-slate-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Overview & Degrees */}
            <div className="space-y-3 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-100">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>পরিচিতি ও একাডেমিক কারিকুলাম</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {customDepts[selectedDept.id]?.overviewBn ?? selectedDept.overviewBn}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 font-bold block text-[10px]">ভবন ও ক্লাসরুম অবস্থান:</span>
                  <span className="font-bold text-slate-800">
                    {customDepts[selectedDept.id]?.locationBuildingBn ?? selectedDept.locationBuildingBn}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 font-bold block text-[10px]">প্রদত্ত ডিগ্রিসমূহ:</span>
                  <span className="font-bold text-slate-800">
                    {customDepts[selectedDept.id]?.degreeOfferedBn ?? selectedDept.degreeOfferedBn}
                  </span>
                </div>
              </div>
            </div>

            {/* Career Prospects */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 space-y-2">
                <h4 className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-700" /> দেশে চাকরির সম্ভাবনা:
                </h4>
                <div className="flex flex-wrap gap-1">
                  {selectedDept.careerInBangladesh.sectors.map((s, idx) => (
                    <span key={idx} className="bg-white text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                      {s}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-emerald-800/80 leading-relaxed">
                  {selectedDept.careerInBangladesh.descriptionBn}
                </p>
              </div>

              <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100 space-y-2">
                <h4 className="text-xs font-extrabold text-blue-900 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-700" /> বিদেশে উচ্চশিক্ষা ও ক্যারিয়ার:
                </h4>
                <div className="flex flex-wrap gap-1">
                  {selectedDept.careerAbroad.targetCountries.map((c, idx) => (
                    <span key={idx} className="bg-white text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-blue-200">
                      {c}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-blue-800/80 leading-relaxed">
                  {selectedDept.careerAbroad.descriptionBn}
                </p>
              </div>
            </div>

            {/* ============================================================================ */}
            {/* FACULTY / TEACHERS DIRECTORY SECTION (Real Contacts from Base APK)           */}
            {/* ============================================================================ */}
            {(() => {
              const customTeachers = customDepts[selectedDept.id]?.teachers || [];
              const directoryTeachers = getContactsForDept(selectedDept.nameEn);
              const totalTeacherCount = customTeachers.length + directoryTeachers.length;

              return (
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-emerald-600" />
                        <span>
                          বিভাগের সম্মানিত শিক্ষকমণ্ডলী ও কর্মকর্তা ({totalTeacherCount} জন)
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        স্যারদের পদবি, ফোন নম্বর ও ইমেইল — সরাসরি ১-ট্যাপে কল, WhatsApp অথবা ইমেইল করুন।
                      </p>
                    </div>
                  </div>

                  {totalTeacherCount === 0 ? (
                    <div className="bg-slate-50 rounded-2xl p-4 text-center border border-dashed border-slate-200 text-xs text-slate-500">
                      এই বিভাগের শিক্ষকদের তথ্য শীঘ্রই আপডেট করা হচ্ছে।
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                      {customTeachers.map((teacher) => (
                        <div
                          key={teacher.id}
                          className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="text-xs sm:text-sm font-black text-slate-900">{teacher.nameBn}</h4>
                              <p className="text-[11px] font-bold text-emerald-700">{teacher.designationBn}</p>
                            </div>
                            {teacher.roomBn && (
                              <span className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-md font-bold text-slate-600">
                                {teacher.roomBn}
                              </span>
                            )}
                          </div>
                          {teacher.researchAreaBn && (
                            <p className="text-[11px] text-slate-500">গবেষণা: {teacher.researchAreaBn}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            {teacher.phone && (
                              <a
                                href={`tel:${teacher.phone}`}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold flex items-center gap-1"
                              >
                                <Phone className="w-3 h-3" />
                                <span>{teacher.phone}</span>
                              </a>
                            )}
                            {teacher.email && (
                              <a
                                href={`mailto:${teacher.email}`}
                                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1"
                              >
                                <Mail className="w-3 h-3 text-blue-600" />
                                <span>{teacher.email}</span>
                              </a>
                            )}
                          </div>
                        </div>
                      ))}

                      {directoryTeachers.map((contact) => (
                        <div
                          key={`dir-${contact.id}`}
                          className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 space-y-1.5 shadow-sm transition"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="text-xs sm:text-sm font-black text-slate-900">{contact.name}</h4>
                              <p className="text-[11px] font-bold text-emerald-700">{contact.designation}</p>
                            </div>
                            <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-bold shrink-0">
                              {contact.category === 'teacher' ? 'শিক্ষক' : 'অফিসার'}
                            </span>
                          </div>
                          {contact.department && (
                            <p className="text-[11px] text-slate-500 truncate">{contact.department}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {contact.phone && (
                              <a
                                href={`tel:${contact.phone}`}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 transition"
                              >
                                <Phone className="w-3 h-3" />
                                <span>{contact.phone}</span>
                              </a>
                            )}
                            {contact.phone && (
                              <a
                                href={`https://wa.me/88${contact.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1 hover:bg-emerald-100 transition"
                              >
                                <MessageCircle className="w-3 h-3" />
                                <span>WA</span>
                              </a>
                            )}
                            {contact.email && (
                              <a
                                href={`mailto:${contact.email}`}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1 transition truncate max-w-[190px]"
                                title={contact.email}
                              >
                                <Mail className="w-3 h-3 text-blue-600 shrink-0" />
                                <span className="truncate">{contact.email}</span>
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ============================================================================ */}
            {/* INTEGRATED ALUMNI SECTION (User Requirement: "অ্যালামনাইও ওটার নিচেই থাকবে") */}
            {/* ============================================================================ */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span>{selectedDept.nameBn} এর অ্যালামনাইবৃন্দ ({getDeptAlumni(selectedDept).length} জন)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    বিশ্বজুড়ে প্রতিষ্ঠিত এই অনুষদ ও বিভাগের প্রাক্তন শিক্ষার্থীদের সাথে যোগাযোগ ও মেন্টরশিপ।
                  </p>
                </div>

                <button
                  onClick={() => handleOpenAlumniModalForDept(selectedDept)}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition active:scale-95"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ অ্যালামনাই হিসেবে যুক্ত হওয়ার অনুরোধ</span>
                </button>
              </div>

              {/* Alumni Profiles List */}
              {getDeptAlumni(selectedDept).length === 0 ? (
                <div className="bg-slate-50 rounded-2xl p-6 text-center border border-dashed border-slate-200 space-y-2">
                  <p className="text-xs text-slate-500">
                    এই বিভাগে এখনও কোনো অ্যালামনাই প্রোফাইল অনুমোদিত হয়নি। আপনি কি এই বিভাগের প্রাক্তন শিক্ষার্থী?
                  </p>
                  <button
                    onClick={() => handleOpenAlumniModalForDept(selectedDept)}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
                  >
                    প্রথম প্রোফাইলটি যুক্ত করার অনুরোধ পাঠান
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {getDeptAlumni(selectedDept).map((al) => (
                    <div
                      key={al.id}
                      className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs sm:text-sm font-black text-slate-900">{al.name}</h4>
                          <p className="text-[11px] text-blue-700 font-bold">{al.currentRole}</p>
                          <p className="text-[10px] text-slate-500">{al.organization} • {al.country}</p>
                        </div>
                        <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded-full border border-emerald-200">
                          {al.batch}
                        </span>
                      </div>

                      {/* Contact Links */}
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-[10px]">
                        {al.linkedin && (
                          <a
                            href={al.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1 font-bold"
                          >
                            <Linkedin className="w-3 h-3" /> LinkedIn
                          </a>
                        )}
                        {al.email && (
                          <a
                            href={`mailto:${al.email}`}
                            className="text-slate-600 hover:underline flex items-center gap-1 font-bold"
                          >
                            <Mail className="w-3 h-3" /> Email
                          </a>
                        )}
                        {al.whatsapp && (
                          <a
                            href={`https://wa.me/${al.whatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:underline flex items-center gap-1 font-bold"
                          >
                            <MessageCircle className="w-3 h-3" /> WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* ALUMNI REGISTRATION REQUEST MODAL                                           */}
      {/* ============================================================================ */}
      {showAlumniModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                  অ্যালামনাই রেজিস্ট্রেশন
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  প্রাক্তন শিক্ষার্থী হিসেবে প্রোফাইল জমা দিন
                </h3>
              </div>
              <button
                onClick={() => setShowAlumniModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {subSuccess ? (
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold text-emerald-900">
                  আপনার অনুরোধ সফলভাবে জমা হয়েছে!
                </h4>
                <p className="text-xs text-emerald-700">
                  অ্যাডমিন প্যানেল থেকে তথ্য যাচাই করার পর আপনার প্রোফাইলটি লাইভ করা হবে।
                </p>
              </div>
            ) : (
              <form onSubmit={handleRegisterAlumni} className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-slate-700">আপনার নাম *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: ড. তানভীর হাসান"
                    value={alumName}
                    onChange={(e) => setAlumName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-700">অনুষদ *</label>
                    <select
                      value={alumFaculty}
                      onChange={(e) => setAlumFaculty(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-medium"
                    >
                      {RU_FACULTIES.map((fac) => (
                        <option key={fac.id} value={fac.nameBn}>
                          {fac.nameBn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700">বিভাগ *</label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: কম্পিউটার সায়েন্স অ্যান্ড ইঞ্জিনিয়ারিং"
                      value={alumDept}
                      onChange={(e) => setAlumDept(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-700">ব্যাচ / সেশন</label>
                    <input
                      type="text"
                      placeholder="যেমন: ৫২তম ব্যাচ / ২০১০-১১"
                      value={alumBatch}
                      onChange={(e) => setAlumBatch(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700">বর্তমান অবস্থান (দেশ)</label>
                    <input
                      type="text"
                      placeholder="যেমন: জার্মানি / বাংলাদেশ"
                      value={alumCountry}
                      onChange={(e) => setAlumCountry(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-700">বর্তমান পদবি *</label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: Senior Software Engineer"
                      value={alumRole}
                      onChange={(e) => setAlumRole(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700">প্রতিষ্ঠানের নাম *</label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: Google / ঢাকা বিশ্ববিদ্যালয়"
                      value={alumOrg}
                      onChange={(e) => setAlumOrg(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-700">ইমেইল</label>
                    <input
                      type="email"
                      placeholder="alumni@gmail.com"
                      value={alumEmail}
                      onChange={(e) => setAlumEmail(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700">WhatsApp নম্বর</label>
                    <input
                      type="text"
                      placeholder="8801700000000"
                      value={alumWhatsapp}
                      onChange={(e) => setAlumWhatsapp(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700">LinkedIn প্রোফাইল লিংক</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    value={alumLinkedin}
                    onChange={(e) => setAlumLinkedin(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs sm:text-sm shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'জমা দেওয়া হচ্ছে...' : 'প্রোফাইল যাচাইয়ের জন্য জমা দিন'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
