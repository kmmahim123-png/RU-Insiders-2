'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Cpu,
  KeyRound,
  Plus,
  Trash2,
  Check,
  Zap,
  ShieldCheck,
  Copy,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  BookOpen,
  PlugZap,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  X,
} from 'lucide-react';
import { AiConfig, AiSlotKey, AiTrainingDoc } from '@/types';

const OPENROUTER_FREE_MODELS = [
  { id: 'openrouter/free', label: 'OpenRouter: Free Auto-Router (সবসময় সক্রিয় ফ্রি)' },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', label: 'OpenRouter: Meta Llama 3.3 70B (Free)' },
  { id: 'google/gemini-2.0-flash-exp:free', label: 'OpenRouter: Google Gemini 2.0 Flash (Free)' },
  { id: 'deepseek/deepseek-chat-v3-0324:free', label: 'OpenRouter: DeepSeek V3 Chat (Free)' },
  { id: 'deepseek/deepseek-r1:free', label: 'OpenRouter: DeepSeek R1 Reasoning (Free)' },
  { id: 'qwen/qwen-2.5-72b-instruct:free', label: 'OpenRouter: Qwen 2.5 72B Instruct (Free)' },
  { id: 'mistralai/mistral-small-3.1-24b-instruct:free', label: 'OpenRouter: Mistral Small 3.1 24B (Free)' },
  { id: 'nvidia/llama-3.1-nemotron-70b-instruct:free', label: 'OpenRouter: NVIDIA Nemotron 70B (Free)' },
  { id: 'google/gemma-3-27b-it:free', label: 'OpenRouter: Google Gemma 3 27B (Free)' },
  { id: 'openai/gpt-4o-mini', label: 'OpenRouter: OpenAI GPT-4o Mini' },
  { id: 'anthropic/claude-3.5-haiku', label: 'OpenRouter: Anthropic Claude 3.5 Haiku' },
  { id: 'google/gemini-2.5-flash', label: 'OpenRouter: Google Gemini 2.5 Flash' },
];

const GEMINI_DIRECT_MODELS = [
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (সাজেস্টেড ও দ্রুত)' },
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
  { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
];

interface SlotMeta {
  slot: AiSlotKey;
  title: string;
  subtitle: string;
  nameField: 'openRouterName1' | 'openRouterName2' | 'geminiName';
  defaultName: string;
  keyField: 'openRouterKey1' | 'openRouterKey2' | 'geminiApiKey';
  modelField: 'openRouterModel1' | 'openRouterModel2' | 'geminiModel';
  enabledField: 'openRouterEnabled1' | 'openRouterEnabled2' | 'geminiEnabled';
  placeholderKey: string;
  presets: { id: string; label: string }[];
  badgeColor: string;
}

const SLOT_CONFIGS: SlotMeta[] = [
  {
    slot: 'openrouter1',
    title: 'স্লট ১: OpenRouter API #1 (Primary)',
    subtitle: 'OpenRouter-এর ফ্রি মডেল বাছাই করুন অথবা নিজের মতো মডেলের নাম লিখুন',
    nameField: 'openRouterName1',
    defaultName: 'OpenRouter #1 (Primary)',
    keyField: 'openRouterKey1',
    modelField: 'openRouterModel1',
    enabledField: 'openRouterEnabled1',
    placeholderKey: 'sk-or-v1-...',
    presets: OPENROUTER_FREE_MODELS,
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
  {
    slot: 'openrouter2',
    title: 'স্লট ২: OpenRouter API #2 (Backup)',
    subtitle: '১ম স্লটে লিমিট শেষ হলে স্বয়ংক্রিয়ভাবে ২য় OpenRouter Key ও মডেলে সুইচ করবে',
    nameField: 'openRouterName2',
    defaultName: 'OpenRouter #2 (Backup)',
    keyField: 'openRouterKey2',
    modelField: 'openRouterModel2',
    enabledField: 'openRouterEnabled2',
    placeholderKey: 'sk-or-v1-...',
    presets: OPENROUTER_FREE_MODELS,
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  {
    slot: 'gemini',
    title: 'স্লট ৩: Google Gemini Direct API (Failover)',
    subtitle: 'AI Studio (aistudio.google.com) থেকে নেওয়া Gemini API Key ও মডেল',
    nameField: 'geminiName',
    defaultName: 'Google Gemini Direct',
    keyField: 'geminiApiKey',
    modelField: 'geminiModel',
    enabledField: 'geminiEnabled',
    placeholderKey: 'AIzaSy...',
    presets: GEMINI_DIRECT_MODELS,
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
];

const MCP_TOOL_NAMES = [
  { name: 'check_blood_donors', desc: '৯০+ দিন (৩ মাস) হিসাব ও ফোন নম্বর সহ ডোনার সার্চ' },
  { name: 'find_department_and_teachers', desc: 'বিভাগ, আসন ও স্যারদের মোবাইল/ইমেইল' },
  { name: 'search_products', desc: 'শপের পণ্য, দাম, স্টক ও অপশন সার্চ' },
  { name: 'create_shop_order', desc: 'কথোপকথনেই সরাসরি ১. ইনটেক অর্ডার তৈরি' },
  { name: 'track_shop_order', desc: 'অর্ডার আইডি দিয়ে লাইভ স্ট্যাটাস দেখা' },
  { name: 'search_campus_and_maps', desc: 'ম্যাপ স্পট ও Inside RU নিউজ সার্চ' },
  { name: 'get_website_training_knowledge', desc: 'অ্যাডমিনের শেখানো কাস্টম তথ্য পড়া' },
];

interface AdminAiStudioTabProps {
  initialAiConfig?: AiConfig;
  password: string;
  safeParseApiResponse: (res: Response) => Promise<any>;
  onSaved: (aiConfig: AiConfig) => void;
  showToast: (msg: string) => void;
}

const DEFAULT_AI_CONFIG: AiConfig = {
  openRouterName1: 'OpenRouter #1 (Primary)',
  openRouterKey1: '',
  openRouterModel1: 'openrouter/free',
  openRouterEnabled1: true,
  openRouterName2: 'OpenRouter #2 (Backup)',
  openRouterKey2: '',
  openRouterModel2: 'meta-llama/llama-3.3-70b-instruct:free',
  openRouterEnabled2: true,
  geminiName: 'Google Gemini Direct',
  geminiApiKey: '',
  geminiModel: 'gemini-2.5-flash',
  geminiEnabled: true,
  priorityOrder: ['openrouter1', 'openrouter2', 'gemini'],
  systemPersonaBn:
    'তুমি RU Insiders (রাজশাহী বিশ্ববিদ্যালয় অফিসিয়াল মার্চেন্ডাইজ স্টোর ও ক্যাম্পাস পোর্টাল)-এর স্মার্ট ও আন্তরিক বাংলা AI অ্যাসিস্ট্যান্ট। সবসময় সহজ, নির্ভুল বাংলায় উত্তর দাও।',
  trainingDocs: [],
  mcpEnabled: true,
  mcpSecretToken: '',
};

/** Admin AI & MCP Studio managing 3 hot-swappable API failover slots, training docs, and MCP access. */
export default function AdminAiStudioTab({
  initialAiConfig,
  password,
  safeParseApiResponse,
  onSaved,
  showToast,
}: AdminAiStudioTabProps) {
  const [config, setConfig] = useState<AiConfig>({
    ...DEFAULT_AI_CONFIG,
    ...(initialAiConfig || {}),
    priorityOrder: initialAiConfig?.priorityOrder?.length
      ? initialAiConfig.priorityOrder
      : ['openrouter1', 'openrouter2', 'gemini'],
    trainingDocs: initialAiConfig?.trainingDocs || [],
  });

  useEffect(() => {
    if (!initialAiConfig) return;
    setConfig((prev) => ({
      ...DEFAULT_AI_CONFIG,
      ...prev,
      ...initialAiConfig,
      priorityOrder: initialAiConfig.priorityOrder?.length
        ? initialAiConfig.priorityOrder
        : ['openrouter1', 'openrouter2', 'gemini'],
      trainingDocs: initialAiConfig.trainingDocs || [],
    }));
  }, [initialAiConfig]);

  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
  const [testingSlot, setTestingSlot] = useState<AiSlotKey | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { ok: boolean; msg: string }>>({});
  const [saving, setSaving] = useState(false);
  const [liveOpenRouterModels, setLiveOpenRouterModels] = useState<{ id: string; label: string }[]>(OPENROUTER_FREE_MODELS);
  const [loadingOrModels, setLoadingOrModels] = useState(false);
  const modelInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const fetchOpenRouterFreeModels = async () => {
    setLoadingOrModels(true);
    try {
      const res = await fetch('https://openrouter.ai/api/v1/models');
      const data = await res.json();
      const rows = Array.isArray(data?.data) ? data.data : [];
      const freeList = rows
        .filter((m: any) => typeof m?.id === 'string' && (m.id.endsWith(':free') || m.id === 'openrouter/free'))
        .map((m: any) => ({
          id: m.id as string,
          label: `${m.name || m.id} (Free)`,
        }));
      const mergedMap = new Map<string, { id: string; label: string }>();
      for (const item of [...OPENROUTER_FREE_MODELS, ...freeList]) {
        if (!mergedMap.has(item.id)) mergedMap.set(item.id, item);
      }
      setLiveOpenRouterModels(Array.from(mergedMap.values()));
      showToast(`✓ OpenRouter থেকে ${mergedMap.size}টি ফ্রি মডেলের তালিকা লোড হয়েছে!`);
    } catch {
      showToast('OpenRouter লাইভ তালিকা লোড করা যায়নি — নিচে সরাসরি যেকোনো মডেলের নাম লিখে ব্যবহার করতে পারবেন।');
    } finally {
      setLoadingOrModels(false);
    }
  };

  // New training doc draft
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocCategory, setNewDocCategory] = useState('website');
  const [newDocContent, setNewDocContent] = useState('');

  const [mcpEndpointUrl, setMcpEndpointUrl] = useState('https://ruinsider-2.vercel.app/api/mcp');
  const [copiedMcp, setCopiedMcp] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMcpEndpointUrl(`${window.location.origin}/api/mcp`);
    }
  }, []);

  const orderedSlotMeta = (config.priorityOrder || ['openrouter1', 'openrouter2', 'gemini'])
    .map((key) => SLOT_CONFIGS.find((s) => s.slot === key))
    .filter((s): s is SlotMeta => Boolean(s));

  const movePriority = (slot: AiSlotKey, dir: -1 | 1) => {
    const order = [...(config.priorityOrder || ['openrouter1', 'openrouter2', 'gemini'])];
    const idx = order.indexOf(slot);
    const nextIdx = idx + dir;
    if (idx < 0 || nextIdx < 0 || nextIdx >= order.length) return;
    [order[idx], order[nextIdx]] = [order[nextIdx], order[idx]];
    setConfig({ ...config, priorityOrder: order });
  };

  const handleTestSlot = async (meta: SlotMeta) => {
    const apiKey = (config[meta.keyField] || '').trim();
    const model = (config[meta.modelField] || meta.presets[0].id).trim();
    if (!apiKey) {
      setTestResults((prev) => ({
        ...prev,
        [meta.slot]: { ok: false, msg: 'আগে এই স্লটে API Key বসান।' },
      }));
      return;
    }

    setTestingSlot(meta.slot);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TEST_SLOT',
          password,
          slot: meta.slot,
          apiKey,
          model,
        }),
      });
      const data = await safeParseApiResponse(res);
      if (data.ok) {
        setTestResults((prev) => ({
          ...prev,
          [meta.slot]: {
            ok: true,
            msg: `সফল! (${data.latencyMs}ms • ${data.model}) — AI উত্তর: "${(data.sampleReply || '').slice(0, 80)}"`,
          },
        }));
      } else {
        setTestResults((prev) => ({
          ...prev,
          [meta.slot]: { ok: false, msg: data.error || 'টেস্ট ব্যর্থ হয়েছে' },
        }));
      }
    } catch (err: any) {
      setTestResults((prev) => ({
        ...prev,
        [meta.slot]: { ok: false, msg: err.message || 'নেটওয়ার্ক ত্রুটি' },
      }));
    } finally {
      setTestingSlot(null);
    }
  };

  const handleAddTrainingDoc = () => {
    if (!newDocTitle.trim() || !newDocContent.trim()) {
      alert('নলেজ শিরোনাম ও বিস্তারিত তথ্য লিখুন।');
      return;
    }
    const doc: AiTrainingDoc = {
      id: `doc-${Date.now()}`,
      title: newDocTitle.trim(),
      category: newDocCategory,
      content: newDocContent.trim(),
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setConfig((prev) => ({
      ...prev,
      trainingDocs: [doc, ...(prev.trainingDocs || [])],
    }));
    setNewDocTitle('');
    setNewDocContent('');
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SAVE_AI_CONFIG',
          password,
          payload: { aiConfig: config },
        }),
      });
      const data = await safeParseApiResponse(res);
      if (data.ok) {
        onSaved(data.settings?.aiConfig || config);
        showToast('✓ AI API Keys (৩ স্লট), মডেল, ট্রেইনিং তথ্য এবং MCP কনফিগারেশন সংরক্ষিত হয়েছে!');
      } else {
        alert(data.error || 'AI কনফিগারেশন সংরক্ষণ করা যায়নি');
      }
    } catch (err: any) {
      alert('সার্ভার সমস্যা: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-amber-400" />
            <h2 className="text-lg sm:text-xl font-black">AI অ্যাসিস্ট্যান্ট, ৩-স্লট Failover API ও MCP স্টুডিও</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
            এখান থেকে OpenRouter-এর ফ্রি মডেল সহ <strong>২টি OpenRouter API</strong> ও <strong>১টি Google Gemini API</strong> যেকোনো সময় বদলাতে পারবেন (স্থায়ীভাবে লক থাকবে না)। ১টি লিমিট শেষ হলে স্বয়ংক্রিয়ভাবে পরেরটিতে চলে যাবে।
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveConfig}
          disabled={saving}
          className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-md shrink-0 disabled:opacity-60 transition"
        >
          <Check className="w-4 h-4" />
          <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'সব AI ও MCP সেটিংস সেভ করুন'}</span>
        </button>
      </div>

      {/* 3-Slot Failover API & Model Selector Cards */}
      <datalist id="openrouter-models-list">
        {liveOpenRouterModels.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
          </option>
        ))}
      </datalist>
      <datalist id="gemini-models-list">
        {GEMINI_DIRECT_MODELS.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
          </option>
        ))}
      </datalist>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-indigo-600" />
            <span>৩টি API স্লট ও অগ্রাধিকার ক্রম (Failover Priority) — সবসময় পরিবর্তনযোগ্য</span>
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={fetchOpenRouterFreeModels}
              disabled={loadingOrModels}
              className="text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingOrModels ? 'animate-spin' : ''}`} />
              <span>{loadingOrModels ? 'লোড হচ্ছে...' : 'OpenRouter লাইভ ফ্রি মডেল লোড করুন'}</span>
            </button>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              ক্রম: {orderedSlotMeta.map((s, i) => `${i + 1}. ${s.slot}`).join(' → ')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {orderedSlotMeta.map((meta, idx) => {
            const presets = meta.slot === 'gemini' ? GEMINI_DIRECT_MODELS : liveOpenRouterModels;
            const slotNameVal = config[meta.nameField] ?? meta.defaultName;
            const keyVal = config[meta.keyField] ?? '';
            const modelVal = config[meta.modelField] ?? presets[0].id;
            const enabledVal = config[meta.enabledField] !== false;
            const isRevealed = Boolean(revealedKeys[meta.slot]);
            const testResult = testResults[meta.slot];

            return (
              <div
                key={meta.slot}
                className={`bg-white rounded-3xl border p-5 shadow-xs space-y-4 ${
                  enabledVal ? 'border-slate-200' : 'border-slate-200 opacity-70 bg-slate-50'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className={`text-[11px] font-black px-2.5 py-1 rounded-full border ${meta.badgeColor}`}>
                      অগ্রাধিকার #{idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">
                        {slotNameVal.trim() || meta.title}
                      </h4>
                      <p className="text-[11px] text-slate-500">{meta.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => movePriority(meta.slot, -1)}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                      title="অগ্রাধিকার উপরে তুলুন"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => movePriority(meta.slot, 1)}
                      disabled={idx === orderedSlotMeta.length - 1}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                      title="অগ্রাধিকার নিচে নামান"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <label className="ml-2 flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer bg-slate-100 px-3 py-1.5 rounded-xl">
                      <input
                        type="checkbox"
                        checked={enabledVal}
                        onChange={(e) => setConfig({ ...config, [meta.enabledField]: e.target.checked })}
                        className="rounded text-indigo-600"
                      />
                      <span>সক্রিয়</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Custom Slot / Key Name Input */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      স্লট / প্রোভাইডারের নাম (ইচ্ছামতো লিখুন)
                    </label>
                    <input
                      type="text"
                      value={slotNameVal}
                      onChange={(e) => setConfig({ ...config, [meta.nameField]: e.target.value })}
                      placeholder={meta.defaultName}
                      className="w-full text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* API Key Input */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-slate-700">
                      API Key (যেকোনো সময় এডিট/বদল করতে পারবেন)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type={isRevealed ? 'text' : 'password'}
                        value={keyVal}
                        onChange={(e) => setConfig({ ...config, [meta.keyField]: e.target.value })}
                        placeholder={meta.placeholderKey}
                        className="flex-1 text-xs font-mono text-slate-900 bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setRevealedKeys({ ...revealedKeys, [meta.slot]: !isRevealed })}
                        className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100"
                        title={isRevealed ? 'লুকান' : 'দেখুন'}
                      >
                        {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Model Selector (Top) + Manual Model Name Entry (Bottom) */}
                <div className="space-y-2.5 bg-slate-50/90 border border-slate-200 rounded-2xl p-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                      <span>
                        ১. {meta.slot === 'gemini' ? 'Gemini মডেল' : 'OpenRouter মডেল'} তালিকা থেকে সিলেক্ট করুন:
                      </span>
                      <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                    </label>
                    <select
                      value={presets.some((p) => p.id === modelVal) ? modelVal : '__custom__'}
                      onChange={(e) => {
                        const chosen = e.target.value;
                        if (chosen === '__custom__') {
                          setConfig({ ...config, [meta.modelField]: '' });
                          setTimeout(() => modelInputRefs.current[meta.slot]?.focus(), 20);
                        } else {
                          setConfig({ ...config, [meta.modelField]: chosen });
                        }
                      }}
                      className="w-full text-xs font-bold text-slate-900 border border-slate-200 rounded-xl p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {presets.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label}
                        </option>
                      ))}
                      <option value="__custom__">✏️ নিচে ম্যানুয়ালি মডেলের নাম লিখব (Custom Model Name)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-indigo-900 flex items-center justify-between">
                      <span>
                        ২. নিচে ম্যানুয়ালি মডেলের নাম লিখুন (যেমন:{' '}
                        <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-indigo-700">
                          {meta.slot === 'gemini' ? 'gemini-2.5-flash' : 'openrouter/free'}
                        </code>
                        ):
                      </span>
                    </label>
                    <div className="relative flex items-center">
                      <input
                        ref={(el) => {
                          modelInputRefs.current[meta.slot] = el;
                        }}
                        type="text"
                        list={meta.slot === 'gemini' ? 'gemini-models-list' : 'openrouter-models-list'}
                        value={modelVal}
                        onChange={(e) => setConfig({ ...config, [meta.modelField]: e.target.value })}
                        placeholder={
                          meta.slot === 'gemini'
                            ? 'এখানে ম্যানুয়ালি Gemini মডেলের নাম লিখুন (যেমন: gemini-2.5-flash)'
                            : 'এখানে ম্যানুয়ালি OpenRouter মডেলের নাম লিখুন (যেমন: deepseek/deepseek-chat-v3-0324:free)'
                        }
                        className="w-full text-xs font-mono font-bold text-slate-900 border border-indigo-300 bg-white rounded-xl p-2.5 pr-9 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      {modelVal && (
                        <button
                          type="button"
                          onClick={() => {
                            setConfig({ ...config, [meta.modelField]: '' });
                            setTimeout(() => modelInputRefs.current[meta.slot]?.focus(), 20);
                          }}
                          className="absolute right-2 p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50"
                          title="মুছে নিজের মডেল নাম লিখুন"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Live Slot Test Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleTestSlot(meta)}
                    disabled={testingSlot === meta.slot}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 transition"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>{testingSlot === meta.slot ? 'টেস্ট হচ্ছে...' : '⚡ কানেকশন টেস্ট করুন'}</span>
                  </button>

                  {testResult && (
                    <div
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 ${
                        testResult.ok
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {testResult.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                      <span>{testResult.msg}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Training Studio */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="text-base font-black text-slate-900">AI ট্রেইনিং ও কাস্টম ওয়েবসাইট নলেজ বেজ</h3>
            <p className="text-xs text-slate-500">
              আপনার ওয়েবসাইটের নিয়ম, ডেলিভারি পলিসি, রক্তদান প্রোটোকল বা বিশেষ যেকোনো তথ্য এখানে লিখে AI-কে শেখাতে পারেন।
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">AI-এর আচরণ ও মূল নির্দেশনা (System Persona)</label>
          <textarea
            rows={3}
            value={config.systemPersonaBn || ''}
            onChange={(e) => setConfig({ ...config, systemPersonaBn: e.target.value })}
            className="w-full text-xs border border-slate-200 rounded-2xl p-3 leading-relaxed"
            placeholder="AI কীভাবে বাংলায় কথা বলবে তা লিখুন..."
          />
        </div>

        {/* Add New Training Doc */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
          <h4 className="text-xs font-black text-slate-800">+ নতুন ট্রেইনিং ডকুমেন্ট / তথ্য যোগ করুন</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <input
              type="text"
              placeholder="শিরোনাম (যেমন: হোম ডেলিভারি ও ক্যাশ অন ডেলিভারি নিয়ম)"
              value={newDocTitle}
              onChange={(e) => setNewDocTitle(e.target.value)}
              className="sm:col-span-2 text-xs border border-slate-200 rounded-xl p-2.5 bg-white font-bold"
            />
            <select
              value={newDocCategory}
              onChange={(e) => setNewDocCategory(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl p-2.5 bg-white font-bold"
            >
              <option value="website">ওয়েবসাইট পরিচিতি</option>
              <option value="delivery">ডেলিভারি ও পেমেন্ট</option>
              <option value="blood">রক্তদান নীতিমালা</option>
              <option value="academics">বিভাগ ও শিক্ষক তথ্য</option>
              <option value="faq">সাধারণ প্রশ্ন-উত্তর</option>
            </select>
          </div>
          <textarea
            rows={3}
            placeholder="AI যেসব তথ্য মনে রেখে উত্তর দিবে তা বিস্তারিত বাংলায় লিখুন..."
            value={newDocContent}
            onChange={(e) => setNewDocContent(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-white leading-relaxed"
          />
          <button
            type="button"
            onClick={handleAddTrainingDoc}
            className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>তালিকায় যোগ করুন (তারপর উপরে সেভ চাপুন)</span>
          </button>
        </div>

        {/* Existing Training Docs */}
        <div className="space-y-2.5">
          {(config.trainingDocs || []).length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-4">এখনো কোনো কাস্টম ট্রেইনিং ডকুমেন্ট নেই।</p>
          ) : (
            (config.trainingDocs || []).map((doc) => (
              <div key={doc.id} className="border border-slate-200 rounded-2xl p-3.5 space-y-2 bg-white">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">
                      {doc.category}
                    </span>
                    <input
                      type="text"
                      value={doc.title}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          trainingDocs: (config.trainingDocs || []).map((d) =>
                            d.id === doc.id ? { ...d, title: e.target.value } : d
                          ),
                        })
                      }
                      className="text-xs font-black text-slate-900 border-b border-transparent focus:border-indigo-400 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setConfig({
                        ...config,
                        trainingDocs: (config.trainingDocs || []).filter((d) => d.id !== doc.id),
                      })
                    }
                    className="p-1 text-red-500 hover:bg-red-50 rounded-lg"
                    title="ডকুমেন্ট মুছুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={doc.content}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      trainingDocs: (config.trainingDocs || []).map((d) =>
                        d.id === doc.id ? { ...d, content: e.target.value } : d
                      ),
                    })
                  }
                  className="w-full text-xs text-slate-600 border border-slate-100 rounded-xl p-2 leading-relaxed"
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* MCP Server Configuration & Active Tools Overview */}
      <div className="bg-white rounded-3xl border border-emerald-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <PlugZap className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-base font-black text-slate-900">MCP (Model Context Protocol) সার্ভার এন্ডপয়েন্ট</h3>
              <p className="text-xs text-slate-500">
                বিল্ট-ইন AI ছাড়াও Claude Desktop, Cursor বা যেকোনো MCP ক্লায়েন্ট সরাসরি এই লাইভ সাইট ডেটায় যুক্ত হতে পারবে।
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs font-bold text-slate-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={config.mcpEnabled !== false}
              onChange={(e) => setConfig({ ...config, mcpEnabled: e.target.checked })}
              className="rounded text-emerald-600"
            />
            <span>MCP সার্ভার চালু রাখুন</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">লাইভ MCP JSON-RPC URL</label>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2">
              <code className="text-xs font-mono text-slate-800 flex-1 truncate">{mcpEndpointUrl}</code>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(mcpEndpointUrl);
                  setCopiedMcp(true);
                  setTimeout(() => setCopiedMcp(false), 2000);
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1 shrink-0"
              >
                {copiedMcp ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedMcp ? 'কপি হয়েছে' : 'কপি'}</span>
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>ঐচ্ছিক MCP Bearer টোকেন (খালি থাকলে পাবলিক এক্সেস)</span>
            </label>
            <input
              type="text"
              value={config.mcpSecretToken || ''}
              onChange={(e) => setConfig({ ...config, mcpSecretToken: e.target.value })}
              placeholder="যেমন: ru-mcp-secret-2026 (ইচ্ছা হলে খালি রাখুন)"
              className="w-full text-xs font-mono border border-slate-200 rounded-xl p-2.5"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-2">
          {MCP_TOOL_NAMES.map((t) => (
            <div key={t.name} className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
              <code className="text-[11px] font-mono font-bold text-indigo-700">{t.name}</code>
              <p className="text-[11px] text-slate-600 mt-0.5">{t.desc}</p>
            </div>
          ))}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={handleSaveConfig}
            disabled={saving}
            className="px-6 py-3 rounded-2xl bg-indigo-700 hover:bg-indigo-800 text-white font-black text-xs flex items-center gap-2 shadow-sm disabled:opacity-60 transition"
          >
            <Check className="w-4 h-4" />
            <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'সমস্ত AI ও MCP সেটিংস সেভ করুন'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
