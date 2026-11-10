'use client';

import React, { useState, useMemo } from 'react';
import {
  HeartPulse,
  Plus,
  Trash2,
  Edit3,
  Phone,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  X,
  Check,
} from 'lucide-react';
import { BloodDonor } from '@/types';
import { calculateDonorEligibility } from '@/lib/bloodUtils';

const BLOOD_GROUPS: BloodDonor['bloodGroup'][] = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

interface AdminBloodTabProps {
  bloodDonors: BloodDonor[];
  password: string;
  safeParseApiResponse: (res: Response) => Promise<any>;
  onUpdated: (donors: BloodDonor[]) => void;
  showToast: (msg: string) => void;
}

const createEmptyDonor = (): Partial<BloodDonor> => ({
  id: '',
  nameBn: '',
  bloodGroup: 'B+',
  phone: '',
  departmentBn: '',
  hallBn: '',
  lastDonationDate: '',
  totalDonations: 0,
  isPublicPhone: true,
  note: '',
});

/** Admin Blood Bank manager with live 90-day (3-month) eligibility math and 1-click donation reset. */
export default function AdminBloodTab({
  bloodDonors,
  password,
  safeParseApiResponse,
  onUpdated,
  showToast,
}: AdminBloodTabProps) {
  const [groupFilter, setGroupFilter] = useState<'ALL' | BloodDonor['bloodGroup']>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [formDonor, setFormDonor] = useState<Partial<BloodDonor>>(createEmptyDonor());
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const enrichedDonors = useMemo(
    () =>
      bloodDonors.map((d) => ({
        donor: d,
        eligibility: calculateDonorEligibility(d),
      })),
    [bloodDonors]
  );

  const totalEligible = useMemo(
    () => enrichedDonors.filter((x) => x.eligibility.isEligible).length,
    [enrichedDonors]
  );

  const groupStats = useMemo(() => {
    const map: Record<string, { total: number; eligible: number }> = {};
    for (const g of BLOOD_GROUPS) map[g] = { total: 0, eligible: 0 };
    for (const item of enrichedDonors) {
      const slot = map[item.donor.bloodGroup];
      if (!slot) continue;
      slot.total += 1;
      if (item.eligibility.isEligible) slot.eligible += 1;
    }
    return map;
  }, [enrichedDonors]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return enrichedDonors.filter(({ donor }) => {
      if (groupFilter !== 'ALL' && donor.bloodGroup !== groupFilter) return false;
      if (!q) return true;
      return (
        donor.nameBn.toLowerCase().includes(q) ||
        donor.phone.includes(q) ||
        donor.departmentBn.toLowerCase().includes(q) ||
        (donor.hallBn || '').toLowerCase().includes(q)
      );
    });
  }, [enrichedDonors, groupFilter, searchQuery]);

  const persistDonor = async (payloadDonor: Partial<BloodDonor>, successMsg: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SAVE_BLOOD_DONOR',
          password,
          payload: { donor: payloadDonor },
        }),
      });
      const data = await safeParseApiResponse(res);
      if (data.ok && data.bloodDonors) {
        onUpdated(data.bloodDonors);
        showToast(successMsg);
        return true;
      }
      alert(data.error || 'রক্তদাতার তথ্য সংরক্ষণ ব্যর্থ হয়েছে');
      return false;
    } catch (err: any) {
      alert('সার্ভার সমস্যা: ' + err.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await persistDonor(
      {
        ...formDonor,
        isPublicPhone: formDonor.isPublicPhone !== false,
        totalDonations: Number(formDonor.totalDonations || 0),
      },
      '✓ রক্তদাতার তথ্য সফলভাবে সংরক্ষিত হয়েছে!'
    );
    if (ok) {
      setFormDonor(createEmptyDonor());
      setShowForm(false);
    }
  };

  const handleMarkDonatedToday = async (donor: BloodDonor) => {
    const today = new Date().toISOString().slice(0, 10);
    await persistDonor(
      {
        ...donor,
        lastDonationDate: today,
        totalDonations: (donor.totalDonations || 0) + 1,
      },
      `✓ ${donor.nameBn}-এর আজকের রক্তদানের তারিখ (${today}) আপডেট হয়েছে — এখন ৯০ দিনের বিরতি শুরু হলো।`
    );
  };

  const handleDelete = async (donorId: string, name: string) => {
    if (!confirm(`"${name}"-কে ব্লাড ব্যাংক তালিকা থেকে মুছতে চান?`)) return;
    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DELETE_BLOOD_DONOR',
          password,
          payload: { donorId },
        }),
      });
      const data = await safeParseApiResponse(res);
      if (data.ok && data.bloodDonors) {
        onUpdated(data.bloodDonors);
        showToast('✓ রক্তদাতার তথ্য মুছে ফেলা হয়েছে।');
      } else {
        alert(data.error || 'ডিলিট করা যায়নি');
      }
    } catch (err: any) {
      alert('সার্ভার সমস্যা: ' + err.message);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header & Stats Banner */}
      <div className="bg-gradient-to-r from-rose-700 via-red-700 to-rose-800 rounded-3xl p-5 sm:p-6 text-white shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-amber-300" />
              <h2 className="text-lg sm:text-xl font-black">রাবি ব্লাড ব্যাংক ও ৯০-দিন (৩ মাস) ডোনার ম্যানেজার</h2>
            </div>
            <p className="text-xs text-rose-100 mt-1">
              যেকোনো ভিজিটর ও AI/MCP এজেন্ট সরাসরি এই তালিকা থেকে ৯০+ দিন বিরতি পূর্ণ হওয়া যোগ্য রক্তদাতা ও তাদের ফোন নম্বর পাবে।
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setFormDonor(createEmptyDonor());
              setShowForm(!showForm);
            }}
            className="px-4 py-2.5 rounded-xl bg-white text-rose-800 font-black text-xs flex items-center gap-1.5 shadow-sm hover:bg-rose-50 shrink-0 transition"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{showForm ? 'ফর্ম বন্ধ করুন' : '+ নতুন রক্তদাতা যোগ করুন'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-9 gap-2">
          <button
            type="button"
            onClick={() => setGroupFilter('ALL')}
            className={`rounded-2xl px-3 py-2 text-left border transition ${
              groupFilter === 'ALL'
                ? 'bg-white text-rose-900 border-white shadow'
                : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
            }`}
          >
            <p className="text-[10px] font-bold opacity-80">সকল গ্রুপ</p>
            <p className="text-sm font-black">
              {totalEligible}/{bloodDonors.length} যোগ্য
            </p>
          </button>
          {BLOOD_GROUPS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGroupFilter(g)}
              className={`rounded-2xl px-3 py-2 text-left border transition ${
                groupFilter === g
                  ? 'bg-white text-rose-900 border-white shadow'
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
              }`}
            >
              <p className="text-xs font-black">{g}</p>
              <p className="text-[10px] font-bold opacity-90">
                {groupStats[g].eligible}/{groupStats[g].total} জন
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Add / Edit Donor Form */}
      {showForm && (
        <form onSubmit={handleSaveForm} className="bg-white rounded-3xl border border-rose-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900">
              {formDonor.id ? 'রক্তদাতার তথ্য আপডেট করুন' : 'নতুন রক্তদাতা নিবন্ধন ফর্ম'}
            </h3>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setFormDonor(createEmptyDonor());
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              বাতিল
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              required
              placeholder="রক্তদাতার নাম *"
              value={formDonor.nameBn || ''}
              onChange={(e) => setFormDonor({ ...formDonor, nameBn: e.target.value })}
              className="text-xs border border-slate-200 rounded-xl p-2.5 font-bold"
            />
            <select
              value={formDonor.bloodGroup || 'B+'}
              onChange={(e) => setFormDonor({ ...formDonor, bloodGroup: e.target.value as BloodDonor['bloodGroup'] })}
              className="text-xs border border-slate-200 rounded-xl p-2.5 font-black text-rose-700"
            >
              {BLOOD_GROUPS.map((g) => (
                <option key={g} value={g}>
                  রক্তের গ্রুপ: {g}
                </option>
              ))}
            </select>
            <input
              type="text"
              required
              placeholder="মোবাইল নম্বর * (যেমন: 01711000001)"
              value={formDonor.phone || ''}
              onChange={(e) => setFormDonor({ ...formDonor, phone: e.target.value })}
              className="text-xs border border-slate-200 rounded-xl p-2.5 font-bold"
            />
            <input
              type="text"
              required
              placeholder="বিভাগ / বর্ষ *"
              value={formDonor.departmentBn || ''}
              onChange={(e) => setFormDonor({ ...formDonor, departmentBn: e.target.value })}
              className="text-xs border border-slate-200 rounded-xl p-2.5"
            />
            <input
              type="text"
              placeholder="হল / অবস্থান (যেমন: শের-ই-বাংলা হল)"
              value={formDonor.hallBn || ''}
              onChange={(e) => setFormDonor({ ...formDonor, hallBn: e.target.value })}
              className="text-xs border border-slate-200 rounded-xl p-2.5"
            />
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                শেষ রক্তদানের তারিখ (খালি থাকলে সাথে সাথে যোগ্য)
              </label>
              <input
                type="date"
                value={formDonor.lastDonationDate || ''}
                onChange={(e) => setFormDonor({ ...formDonor, lastDonationDate: e.target.value })}
                className="w-full text-xs border border-slate-200 rounded-xl p-2"
              />
            </div>
            <input
              type="number"
              min={0}
              placeholder="মোট রক্তদান সংখ্যা"
              value={formDonor.totalDonations ?? 0}
              onChange={(e) => setFormDonor({ ...formDonor, totalDonations: Number(e.target.value) })}
              className="text-xs border border-slate-200 rounded-xl p-2.5"
            />
            <input
              type="text"
              placeholder="অতিরিক্ত নোট (যেমন: জরুরি হলে কল দিন)"
              value={formDonor.note || ''}
              onChange={(e) => setFormDonor({ ...formDonor, note: e.target.value })}
              className="sm:col-span-2 text-xs border border-slate-200 rounded-xl p-2.5"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formDonor.isPublicPhone !== false}
                onChange={(e) => setFormDonor({ ...formDonor, isPublicPhone: e.target.checked })}
                className="rounded text-rose-600"
              />
              <span>ওয়েবসাইট ও AI চ্যাটে মোবাইল নম্বর সরাসরি প্রদর্শন করুন (Public Phone)</span>
            </label>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center gap-1.5 shadow-sm disabled:opacity-60"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'রক্তদাতা সংরক্ষণ করুন'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Search Bar */}
      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-3.5 py-2.5 shadow-xs">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="নাম, মোবাইল নম্বর, হল বা বিভাগ দিয়ে খুঁজুন..."
          className="flex-1 text-xs font-medium focus:outline-none"
        />
      </div>

      {/* Donors List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filtered.map(({ donor, eligibility }) => (
          <div
            key={donor.id}
            className={`bg-white rounded-2xl border p-4 shadow-xs space-y-3 ${
              eligibility.isEligible ? 'border-emerald-200' : 'border-amber-200 bg-amber-50/20'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white font-black text-base flex items-center justify-center shrink-0 shadow-xs">
                  {donor.bloodGroup}
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">{donor.nameBn}</h4>
                  <p className="text-xs text-slate-600 font-semibold">
                    {donor.departmentBn}
                    {donor.hallBn ? ` • ${donor.hallBn}` : ''}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-rose-600" />
                    <span className="font-bold text-slate-800">{donor.phone}</span>
                    {!donor.isPublicPhone && (
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded ml-1">গোপন নম্বর</span>
                    )}
                  </p>
                </div>
              </div>

              <span
                className={`text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0 ${
                  eligibility.isEligible
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                {eligibility.isEligible ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                <span>{eligibility.statusLabelBn}</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <span>
                শেষ রক্তদান: <strong>{donor.lastDonationDate || 'কখনো না / তথ্য নেই'}</strong> • মোট:{' '}
                <strong>{donor.totalDonations || 0} বার</strong>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleMarkDonatedToday(donor)}
                  disabled={saving}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold flex items-center gap-1 transition"
                  title="আজ রক্ত দিয়েছেন চিহ্নিত করলে ৯০ দিনের বিরতি শুরু হবে"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>আজ রক্ত দিয়েছেন</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormDonor({ ...donor });
                    setShowForm(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                  title="এডিট"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(donor.id, donor.nameBn)}
                  className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                  title="ডিলিট"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
