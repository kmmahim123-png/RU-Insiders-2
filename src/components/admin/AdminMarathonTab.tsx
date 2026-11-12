'use client';

import React, { useState, useMemo } from 'react';
import {
  Flame,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  Clock,
  MapPin,
  Trophy,
  Users,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Download,
  Search,
  Printer,
  AlertCircle,
  Shirt,
  X,
  Check,
} from 'lucide-react';
import { MarathonEvent, MarathonRegistration } from '@/types';

interface AdminMarathonTabProps {
  marathons: MarathonEvent[];
  registrations: MarathonRegistration[];
  password: string;
  safeParseApiResponse: (res: Response) => Promise<any>;
  onMarathonsUpdated: (marathons: MarathonEvent[]) => void;
  onRegistrationsUpdated: (registrations: MarathonRegistration[]) => void;
  showToast: (msg: string) => void;
}

const emptyMarathon = (): Partial<MarathonEvent> => ({
  id: '',
  title: '',
  edition: '',
  date: '',
  time: 'সকাল ০৬:৩০ মি.',
  distance: '৭.৫ কিমি',
  route: 'সাবাশ বাংলাদেশ চত্বর -> প্যারিস রোড -> কাজলা গেট -> জোহা চত্বর -> শহীদ মিনার',
  registrationFee: 0,
  deadline: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 16),
  isOpen: true,
  description: 'স্বাস্থ্য সচেতনতা ও ক্যাম্পাসের ভ্রাতৃত্ববোধ বাড়াতে রাবিয়ান-এর নিয়মিত মাসিক ক্যাম্পাস ম্যারাথন।',
  rewards: ['অফিশিয়াল রানিং ব্যাজ ও ই-সনদ', 'ফিনিশার মেডেল (শীর্ষ ৫০ জন)', 'স্বাস্থ্যসম্মত নাস্তা ও পানি সরবরাহ'],
  maxParticipants: 300,
  contactNumber: '',
});

export default function AdminMarathonTab({
  marathons,
  registrations,
  password,
  safeParseApiResponse,
  onMarathonsUpdated,
  onRegistrationsUpdated,
  showToast,
}: AdminMarathonTabProps) {
  const [selectedMarathonId, setSelectedMarathonId] = useState<string>(
    marathons[0]?.id || ''
  );
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<MarathonEvent>>(emptyMarathon());
  const [rewardsInput, setRewardsInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentMarathon = useMemo(
    () => marathons.find((m) => m.id === selectedMarathonId) || marathons[0],
    [marathons, selectedMarathonId]
  );

  const filteredRegistrations = useMemo(() => {
    return registrations.filter((r) => {
      if (selectedMarathonId && r.marathonId !== selectedMarathonId) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          r.name.toLowerCase().includes(q) ||
          r.phone.includes(q) ||
          r.department.toLowerCase().includes(q) ||
          r.studentId.toLowerCase().includes(q) ||
          (r.bibNumber || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [registrations, selectedMarathonId, searchQuery]);

  const handleEditClick = (m: MarathonEvent) => {
    setFormData({ ...m });
    setRewardsInput((m.rewards || []).join('\n'));
    setShowForm(true);
  };

  const handleNewClick = () => {
    const init = emptyMarathon();
    setFormData(init);
    setRewardsInput((init.rewards || []).join('\n'));
    setShowForm(true);
  };

  const handleSaveMarathon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim() || !formData.date?.trim()) {
      showToast('ম্যারাথনের শিরোনাম ও তারিখ আবশ্যক!');
      return;
    }

    setSaving(true);
    try {
      const cleanRewards = rewardsInput
        .split('\n')
        .map((r) => r.trim())
        .filter(Boolean);

      const payload = {
        marathon: {
          ...formData,
          rewards: cleanRewards.length > 0 ? cleanRewards : ['অফিশিয়াল রানিং ব্যাজ ও ই-সনদ'],
        },
      };

      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SAVE_MARATHON',
          password,
          payload,
        }),
      });

      const data = await safeParseApiResponse(res);
      if (data.ok && data.marathons) {
        onMarathonsUpdated(data.marathons);
        showToast('ম্যারাথন সফলভাবে সংরক্ষিত হয়েছে!');
        setShowForm(false);
        if (!selectedMarathonId && data.marathons[0]) {
          setSelectedMarathonId(data.marathons[0].id);
        }
      } else {
        showToast(data.error || 'সংরক্ষণ ব্যর্থ হয়েছে।');
      }
    } catch {
      showToast('সার্ভার যোগাযোগে ত্রুটি!');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleRegistration = async (marathonId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TOGGLE_MARATHON_REGISTRATION',
          password,
          payload: { marathonId, isOpen: !currentStatus },
        }),
      });
      const data = await safeParseApiResponse(res);
      if (data.ok && data.marathons) {
        onMarathonsUpdated(data.marathons);
        showToast(!currentStatus ? 'অনলাইন রেজিস্ট্রেশন চালু করা হয়েছে!' : 'অনলাইন রেজিস্ট্রেশন বন্ধ করা হয়েছে!');
      }
    } catch {
      showToast('স্ট্যাটাস পরিবর্তন ব্যর্থ!');
    }
  };

  const handleDeleteMarathon = async (marathonId: string) => {
    if (!confirm('আপনি কি নিশ্চিতভাবে এই ম্যারাথন ইভেন্টটি মুছে ফেলতে চান? এতে সকল আবেদনকারী মুছে যাবে!')) return;
    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DELETE_MARATHON',
          password,
          payload: { marathonId },
        }),
      });
      const data = await safeParseApiResponse(res);
      if (data.ok) {
        if (data.marathons) onMarathonsUpdated(data.marathons);
        if (data.marathonRegistrations) onRegistrationsUpdated(data.marathonRegistrations);
        showToast('ম্যারাথন সফলভাবে মুছে ফেলা হয়েছে!');
      }
    } catch {
      showToast('মুছতে ব্যর্থ হয়েছে!');
    }
  };

  const handleDeleteRegistration = async (registrationId: string) => {
    if (!confirm('এই রেজিস্ট্রেশনটি কি তালিকা থেকে মুছে ফেলবেন?')) return;
    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DELETE_MARATHON_REGISTRATION',
          password,
          payload: { registrationId },
        }),
      });
      const data = await safeParseApiResponse(res);
      if (data.ok && data.marathonRegistrations) {
        onRegistrationsUpdated(data.marathonRegistrations);
        showToast('রেজিস্ট্রেশন মুছে ফেলা হয়েছে!');
      }
    } catch {
      showToast('রেজিস্ট্রেশন মুছতে ব্যর্থ!');
    }
  };

  const handleExportCsv = () => {
    if (filteredRegistrations.length === 0) {
      showToast('ডাউনলোড করার মতো কোনো আবেদন নেই!');
      return;
    }
    const headers = ['BIB', 'Name', 'Phone', 'Email', 'Department', 'StudentID', 'Gender', 'T-Shirt', 'BloodGroup', 'EmergencyContact', 'RegisteredAt'];
    const rows = filteredRegistrations.map((r) => [
      r.bibNumber || '',
      `"${r.name.replace(/"/g, '""')}"`,
      r.phone,
      r.email || '',
      `"${r.department.replace(/"/g, '""')}"`,
      r.studentId,
      r.gender,
      r.tShirtSize,
      r.bloodGroup || '',
      r.emergencyContact,
      r.createdAt,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marathon-runners-${currentMarathon?.id || 'list'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('CSV ফাইল সফলভাবে ডাউনলোড হয়েছে!');
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & EVENT SELECTOR */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Flame className="w-5 h-5 text-amber-600" />
            </span>
            <h2 className="text-xl font-black text-slate-900">
              মাসিক ক্যাম্পাস ম্যারাথন ম্যানেজমেন্ট
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            প্রতি মাসের ম্যারাথন তৈরি, আবেদনের সময়সীমা নির্ধারণ, ফরম অন/অফ এবং অংশগ্রহণকারীদের তালিকা।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleNewClick}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন ম্যারাথন ইভেন্ট যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* 2. MARATHON EVENTS LIST & QUICK TOGGLE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {marathons.map((m) => {
          const isSelected = m.id === selectedMarathonId;
          const regCount = registrations.filter((r) => r.marathonId === m.id).length;
          const isExpired = m.deadline && new Date(m.deadline).getTime() < Date.now();

          return (
            <div
              key={m.id}
              onClick={() => setSelectedMarathonId(m.id)}
              className={`p-5 rounded-3xl border-2 transition cursor-pointer space-y-3 ${
                isSelected
                  ? 'bg-emerald-50/50 border-emerald-500 shadow-md'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-100 px-2 py-0.5 rounded-md">
                    {m.edition || 'সংস্করণ'}
                  </span>
                  <h3 className="text-base font-black text-slate-900 truncate">
                    {m.title}
                  </h3>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(m);
                    }}
                    className="p-1.5 text-slate-500 hover:text-emerald-700 rounded-lg hover:bg-slate-100 transition"
                    title="এডিট করুন"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMarathon(m.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{m.date || 'তারিখ নির্ধারিত নেই'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{m.time || 'সকাল ৬:৩০'}</span>
                </div>
              </div>

              {/* 1-Click Toggle Application ON / OFF */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-bold text-slate-700">
                    {regCount} / {m.maxParticipants || 300} আবেদন
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleRegistration(m.id, Boolean(m.isOpen));
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
                    m.isOpen
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}
                >
                  {m.isOpen ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>আবেদন চালু</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-red-600" />
                      <span>আবেদন বন্ধ</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. MODAL: ADD / EDIT MARATHON FORM */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">
                {formData.id ? 'ম্যারাথন ইভেন্ট সম্পাদনা' : 'নতুন মাসিক ম্যারাথন তৈরি'}
              </h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMarathon} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ইভেন্টের শিরোনাম <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: ১ম রাবিয়ান ক্যাম্পাস রান ২০২৬"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">সংস্করণ / মাস</label>
                  <input
                    type="text"
                    placeholder="যেমন: নভেম্বর ২০২৬ সংস্করণ"
                    value={formData.edition || ''}
                    onChange={(e) => setFormData({ ...formData, edition: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    তারিখ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date || ''}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">শুরুর সময়</label>
                  <input
                    type="text"
                    placeholder="সকাল ০৬:৩০ মি."
                    value={formData.time || ''}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">দূরত্ব</label>
                  <input
                    type="text"
                    placeholder="৭.৫ কিমি"
                    value={formData.distance || ''}
                    onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    অনলাইন আবেদনের শেষ সময় (Deadline)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.deadline ? formData.deadline.slice(0, 16) : ''}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">সর্বোচ্চ আসন সংখ্যা</label>
                  <input
                    type="number"
                    value={formData.maxParticipants || 300}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || 300 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">রুট ও ট্র্যাক বিবরণ</label>
                <input
                  type="text"
                  placeholder="সাবাশ বাংলাদেশ চত্বর -> প্যারিস রোড -> কাজলা গেট -> জোহা চত্বর -> শহীদ মিনার"
                  value={formData.route || ''}
                  onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">পুরস্কার ও কিট তালিকা (প্রতি লাইনে একটি)</label>
                <textarea
                  rows={3}
                  value={rewardsInput}
                  onChange={(e) => setRewardsInput(e.target.value)}
                  placeholder="অফিশিয়াল রানিং ব্যাজ ও ই-সনদ&#10;ফিনিশার মেডেল (শীর্ষ ৫০ জন)&#10;স্বাস্থ্যসম্মত নাস্তা ও পানি"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isOpenCheck"
                  checked={Boolean(formData.isOpen)}
                  onChange={(e) => setFormData({ ...formData, isOpen: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <label htmlFor="isOpenCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
                  অনলাইন আবেদন ফরমটি শিক্ষার্থীদের জন্য চালু রাখুন
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
                >
                  {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. REGISTERED PARTICIPANTS TABLE */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-slate-900">
              নিবন্ধিত অংশগ্রহণকারী তালিকা ({filteredRegistrations.length} জন)
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              নির্বাচিত ইভেন্ট: {currentMarathon?.title || 'সকল'}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="নাম, ফোন বা রোল দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
              title="CSV ফাইলে ডাউনলোড করুন"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV এক্সপোর্ট</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">BIB</th>
                <th className="py-3 px-3">নাম ও ফোন</th>
                <th className="py-3 px-3">বিভাগ ও রোল</th>
                <th className="py-3 px-3">টি-শার্ট</th>
                <th className="py-3 px-3">জরুরি নম্বর</th>
                <th className="py-3 px-3 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 font-medium">
                    কোনো আবেদনকারী পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3 font-mono font-black text-amber-600">
                      {reg.bibNumber || 'RBN-000'}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-900">{reg.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{reg.phone}</p>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-800">{reg.department}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{reg.studentId}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-black text-[10px]">
                        {reg.tShirtSize}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {reg.emergencyContact}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteRegistration(reg.id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
