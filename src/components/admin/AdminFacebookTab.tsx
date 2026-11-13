'use client';

import React, { useState, useEffect } from 'react';
import {
  Share2,
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Bot,
  MessageSquare,
  Bus,
  Flame,
  Users,
  ShoppingBag,
  HeartPulse,
  Sparkles,
  Lock,
  Globe,
  RefreshCw,
} from 'lucide-react';
import { SiteSettings } from '@/types';
import { generatePresetCampusPost } from '@/lib/metaFacebook';

interface AdminFacebookTabProps {
  settings: SiteSettings | null;
  onSaveSettings: (newSettings: Partial<SiteSettings>) => Promise<void>;
}

export default function AdminFacebookTab({ settings, onSaveSettings }: AdminFacebookTabProps) {
  // Credentials Form
  const [pageId, setPageId] = useState(settings?.facebookPageId || '');
  const [pageAccessToken, setPageAccessToken] = useState(settings?.facebookPageAccessToken || '');
  const [verifyToken, setVerifyToken] = useState(settings?.facebookVerifyToken || 'rabian_fb_verify_2026');
  const [messengerReplyEnabled, setMessengerReplyEnabled] = useState(settings?.facebookMessengerReplyEnabled !== false);
  const [autoPostEnabled, setAutoPostEnabled] = useState(settings?.facebookAutoPostEnabled !== false);

  const [savingCreds, setSavingCreds] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Copy States
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  // Custom Post Composer
  const [customMessage, setCustomMessage] = useState('');
  const [customLink, setCustomLink] = useState('https://rabian.site');
  const [customImage, setCustomImage] = useState('');

  // Publishing Actions
  const [publishingType, setPublishingType] = useState<string | null>(null);
  const [publishResult, setPublishResult] = useState<{ ok: boolean; message: string; postUrl?: string } | null>(null);

  useEffect(() => {
    if (settings) {
      setPageId(settings.facebookPageId || '');
      setPageAccessToken(settings.facebookPageAccessToken || '');
      setVerifyToken(settings.facebookVerifyToken || 'rabian_fb_verify_2026');
      setMessengerReplyEnabled(settings.facebookMessengerReplyEnabled !== false);
      setAutoPostEnabled(settings.facebookAutoPostEnabled !== false);
    }
  }, [settings]);

  const webhookUrl = 'https://rabian.site/api/facebook/webhook';

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCreds(true);
    setSaveSuccess(false);

    try {
      await onSaveSettings({
        facebookPageId: pageId.trim(),
        facebookPageAccessToken: pageAccessToken.trim(),
        facebookVerifyToken: verifyToken.trim() || 'rabian_fb_verify_2026',
        facebookMessengerReplyEnabled: messengerReplyEnabled,
        facebookAutoPostEnabled: autoPostEnabled,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      alert('সেটিংস সেভ করতে সমস্যা হয়েছে।');
    } finally {
      setSavingCreds(false);
    }
  };

  const handlePublishPreset = async (type: 'bus' | 'marathon' | 'directory' | 'merch' | 'blood') => {
    if (!pageId || !pageAccessToken) {
      alert('প্রথমে আপনার Facebook Page ID এবং Page Access Token সেভ করুন।');
      return;
    }

    setPublishingType(type);
    setPublishResult(null);

    try {
      const res = await fetch('/api/facebook/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();

      if (data.ok) {
        setPublishResult({
          ok: true,
          message: data.message || 'পোস্ট ফেসবুকে প্রকাশিত হয়েছে!',
          postUrl: data.postUrl,
        });
      } else {
        setPublishResult({
          ok: false,
          message: data.error || 'পোস্ট প্রকাশ করা সম্ভব হয়নি।',
        });
      }
    } catch {
      setPublishResult({ ok: false, message: 'সার্ভারের সাথে সংযোগ ব্যর্থ হয়েছে।' });
    } finally {
      setPublishingType(null);
    }
  };

  const handlePublishCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMessage.trim()) return;

    if (!pageId || !pageAccessToken) {
      alert('প্রথমে আপনার Facebook Page ID এবং Page Access Token সেভ করুন।');
      return;
    }

    setPublishingType('custom');
    setPublishResult(null);

    try {
      const res = await fetch('/api/facebook/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: customMessage.trim(),
          link: customLink.trim() || undefined,
          imageUrl: customImage.trim() || undefined,
        }),
      });
      const data = await res.json();

      if (data.ok) {
        setPublishResult({
          ok: true,
          message: 'কাস্টম পোস্ট ফেসবুকে প্রকাশিত হয়েছে!',
          postUrl: data.postUrl,
        });
        setCustomMessage('');
      } else {
        setPublishResult({
          ok: false,
          message: data.error || 'পোস্ট প্রকাশ করা সম্ভব হয়নি।',
        });
      }
    } catch {
      setPublishResult({ ok: false, message: 'সার্ভারের সাথে সংযোগ ব্যর্থ হয়েছে।' });
    } finally {
      setPublishingType(null);
    }
  };

  const isConfigured = Boolean(pageId && pageAccessToken);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* 1. Header Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-blue-500/20">
        <div className="space-y-3 relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-xs font-black text-blue-300">
            <Share2 className="w-3.5 h-3.5" />
            <span>Facebook Page & Messenger AI Automation</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            ফেসবুক পেজ অটো-পোস্ট ও মেসেঞ্জার AI অটো-রিপ্লাই হাব
          </h2>

          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-medium">
            রাবিয়ান ফেসবুক পেজে সরাসরি ১-ক্লিকে বাস শিডিউল, ম্যারাথন, শিক্ষক ফোনবুক ও হুডি কালেকশন পোস্ট করুন। এছাড়া পেজের মেসেঞ্জার ও কমেন্টে শিক্ষার্থীদের প্রশ্নের স্বয়ংক্রিয় এআই উত্তর নিশ্চিত করুন।
          </p>

          <div className="pt-1 flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${
                isConfigured ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' : 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {isConfigured ? 'ফেসবুক পেজ সংযুক্ত ও সক্রিয়' : 'কনফিগার বাকি (টোকেন যুক্ত করুন)'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Feedback Notification */}
      {publishResult && (
        <div
          className={`p-4 rounded-2xl border flex items-start justify-between gap-3 animate-in fade-in ${
            publishResult.ok
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {publishResult.ok ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-xs sm:text-sm font-black">{publishResult.message}</p>
              {publishResult.postUrl && (
                <a
                  href={publishResult.postUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-blue-700 underline mt-1 inline-flex items-center gap-1"
                >
                  পোস্টটি ফেসবুকে দেখুন <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
          <button
            onClick={() => setPublishResult(null)}
            className="text-xs font-bold text-slate-500 hover:text-slate-800"
          >
            ✕
          </button>
        </div>
      )}

      {/* 3. 1-Click Viral Campus Post Generator */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div>
          <span className="text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 uppercase tracking-wider">
            ১-ক্লিকে ভাইরাল পোস্ট
          </span>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-2">
            ক্যাম্পাস রেডিমেড কনটেন্ট পেজে প্রকাশ করুন
          </h3>
          <p className="text-xs text-slate-500">
            বাটনে স্পর্শ করলেই সুন্দর বাংলা ক্যাপশন, ইমোজি ও rabian.site লিংকের সাথে সরাসরি আপনার ফেসবুক পেজে প্রকাশিত হবে।
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Preset: Bus Schedule */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Bus className="w-4 h-4" />
              </span>
              <h4 className="text-sm font-black text-slate-900">🚌 বাস শিডিউল ট্র্যাকার</h4>
              <p className="text-[11px] text-slate-600 leading-snug">
                আজকের সকল রুটের বাস ছাড়া ও লাইভ কাউন্টডাউন টাইমার লিংক সহ পোস্ট।
              </p>
            </div>
            <button
              type="button"
              disabled={publishingType === 'bus'}
              onClick={() => handlePublishPreset('bus')}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {publishingType === 'bus' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>পেজে পোস্ট করুন</span>
            </button>
          </div>

          {/* Preset: Teacher Phonebook */}
          <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200 space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </span>
              <h4 className="text-sm font-black text-slate-900">📞 শিক্ষক ও কর্মকর্তা ফোনবুক</h4>
              <p className="text-[11px] text-slate-600 leading-snug">
                ৩,৮৭৭ জন শিক্ষক ও কর্মকর্তার কন্টাক্ট ডিরেক্টরি স্পটলাইট পোস্ট।
              </p>
            </div>
            <button
              type="button"
              disabled={publishingType === 'directory'}
              onClick={() => handlePublishPreset('directory')}
              className="w-full py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {publishingType === 'directory' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>পেজে পোস্ট করুন</span>
            </button>
          </div>

          {/* Preset: Campus Marathon */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                <Flame className="w-4 h-4" />
              </span>
              <h4 className="text-sm font-black text-slate-900">🏃‍♂️ মাসিক ম্যারাথন রান</h4>
              <p className="text-[11px] text-slate-600 leading-snug">
                মাসিক ৫ কিমি রান, টি-শার্ট ও মেডেল এবং অনলাইন রেজিস্ট্রেশন আহ্বান।
              </p>
            </div>
            <button
              type="button"
              disabled={publishingType === 'marathon'}
              onClick={() => handlePublishPreset('marathon')}
              className="w-full py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {publishingType === 'marathon' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>পেজে পোস্ট করুন</span>
            </button>
          </div>

          {/* Preset: Winter Merch & Hoodie */}
          <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200 space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
              </span>
              <h4 className="text-sm font-black text-slate-900">🛍️ উইন্টার হুডি ও খেজুরের গুড়</h4>
              <p className="text-[11px] text-slate-600 leading-snug">
                ১০০% ক্যাশ অন ডেলিভারিতে রাবি অফিশিয়াল হুডি ও খাঁটি খাবারের পোস্ট।
              </p>
            </div>
            <button
              type="button"
              disabled={publishingType === 'merch'}
              onClick={() => handlePublishPreset('merch')}
              className="w-full py-2.5 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {publishingType === 'merch' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>পেজে পোস্ট করুন</span>
            </button>
          </div>

          {/* Preset: Blood Bank */}
          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-2 flex flex-col justify-between sm:col-span-2 lg:col-span-1">
            <div className="space-y-1">
              <span className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
                <HeartPulse className="w-4 h-4" />
              </span>
              <h4 className="text-sm font-black text-slate-900">🩸 ৯০-দিন লাইভ রক্তদান</h4>
              <p className="text-[11px] text-slate-600 leading-snug">
                জরুরি রক্তের প্রয়োজনে প্রস্তুত রক্তদাতাদের তথ্য ও সরাসরি কল লিংক।
              </p>
            </div>
            <button
              type="button"
              disabled={publishingType === 'blood'}
              onClick={() => handlePublishPreset('blood')}
              className="w-full py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {publishingType === 'blood' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>পেজে পোস্ট করুন</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Custom Post Composer */}
      <form onSubmit={handlePublishCustom} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div>
          <span className="text-xs font-black text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200 uppercase tracking-wider">
            কাস্টম পোস্ট কম্পোজার
          </span>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-2">
            নিজের ভাষায় যেকোনো নোটিশ বা অফার পেজে দিন
          </h3>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              পোস্ট ক্যাপশন / বার্তা *
            </label>
            <textarea
              rows={4}
              required
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="আজকের ক্যাম্পাসের কোনো জরুরি খবর, নোটিশ বা অফার লিখুন..."
              className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                সংযুক্ত লিংক (ঐচ্ছিক)
              </label>
              <input
                type="url"
                value={customLink}
                onChange={(e) => setCustomLink(e.target.value)}
                placeholder="https://rabian.site/..."
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ছবির সরাসরি লিংক (ঐচ্ছিক)
              </label>
              <input
                type="url"
                value={customImage}
                onChange={(e) => setCustomImage(e.target.value)}
                placeholder="https://rabian.site/campus/paris-road-rain.jpg"
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={publishingType === 'custom' || !customMessage.trim()}
            className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm flex items-center gap-2 transition disabled:opacity-50 cursor-pointer shadow-md"
          >
            {publishingType === 'custom' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>ফেসবুক পেজে পোস্ট করুন</span>
          </button>
        </div>
      </form>

      {/* 5. Credentials & Webhook Settings */}
      <form onSubmit={handleSaveCredentials} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200 uppercase tracking-wider">
            মেটা এপিআই কনফিগারেশন
          </span>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-2">
            Facebook Page ও Webhook সেটিংস
          </h3>
          <p className="text-xs text-slate-500">
            নিচের ক্রেডেনশিয়ালগুলো Meta Developers পোর্টাল থেকে এনে একবার সেভ করে দিন।
          </p>
        </div>

        {saveSuccess && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>✓ ফেসবুক সেটিংস সফলভাবে সংরক্ষিত হয়েছে!</span>
          </div>
        )}

        {/* Webhook URLs to copy into Meta App Dashboard */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <h4 className="text-xs font-black text-slate-800">
            Meta Webhook এ পেস্ট করার তথ্য (১-ক্লিকে কপি করুন):
          </h4>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">
              Callback URL (Webhook URL)
            </label>
            <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200">
              <code className="text-xs font-mono text-slate-800 flex-1 truncate">{webhookUrl}</code>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(webhookUrl);
                  setCopiedWebhook(true);
                  setTimeout(() => setCopiedWebhook(false), 2000);
                }}
                className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
              >
                {copiedWebhook ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedWebhook ? 'কপি হয়েছে' : 'কপি'}</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">
              Verify Token
            </label>
            <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200">
              <code className="text-xs font-mono text-slate-800 flex-1 truncate">{verifyToken}</code>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(verifyToken);
                  setCopiedToken(true);
                  setTimeout(() => setCopiedToken(false), 2000);
                }}
                className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
              >
                {copiedToken ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedToken ? 'কপি হয়েছে' : 'কপি'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Facebook Page ID *
            </label>
            <input
              type="text"
              required
              value={pageId}
              onChange={(e) => setPageId(e.target.value)}
              placeholder="যেমন: 104829104829104 (ফেসবুক পেজ এবাউট সেকশনে পাবেন)"
              className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Facebook Page Access Token * (Permanent System / Page Token)
            </label>
            <textarea
              rows={3}
              required
              value={pageAccessToken}
              onChange={(e) => setPageAccessToken(e.target.value)}
              placeholder="EAA..."
              className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Automation Feature Toggles */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={messengerReplyEnabled}
                onChange={(e) => setMessengerReplyEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs font-bold text-slate-800">
                মেসেঞ্জার ইনবক্স AI অটো-রিপ্লাই চালু রাখুন (শিক্ষার্থীদের প্রশ্নের স্বয়ংক্রিয় উত্তর)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoPostEnabled}
                onChange={(e) => setAutoPostEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs font-bold text-slate-800">
                পোস্ট কমেন্ট AI অটো-রিপ্লাই চালু রাখুন (পোস্টে কেউ কমেন্ট করলে উত্তর দেওয়া)
              </span>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="submit"
            disabled={savingCreds}
            className="px-6 py-3 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-black text-xs sm:text-sm flex items-center gap-2 transition disabled:opacity-50 cursor-pointer shadow-md"
          >
            {savingCreds ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            <span>ফেসবুক সেটিংস সেভ করুন</span>
          </button>
        </div>
      </form>
    </div>
  );
}
