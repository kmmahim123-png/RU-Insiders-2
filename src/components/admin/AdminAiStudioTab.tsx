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
  MessageCircle,
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
    'তুমি রাবিয়ান (Rabian - রাজশাহী বিশ্ববিদ্যালয় স্মার্ট ক্যাম্পাস প্ল্যাটফর্ম)-এর স্মার্ট ও আন্তরিক বাংলা AI অ্যাসিস্ট্যান্ট। সবসময় সহজ, নির্ভুল বাংলায় উত্তর দাও।',
  trainingDocs: [],
  mcpEnabled: true,
  mcpSecretToken: '',
  decisionRouterEnabled: false,
  decisionRouterModel: 'typesafe/jev-1.14',
  decisionRouterApiKey: '',
  whatsappAgentEnabled: true,
  whatsappVerifyToken: 'rabian-wa-verify',
  whatsappPhoneNumberId: '',
  whatsappAccessToken: '',
  whatsappBridgeSecret: '',
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

  const fetchOpenRouterAllModels = async (notify = true) => {
    setLoadingOrModels(true);
    try {
      const res = await fetch('https://openrouter.ai/api/v1/models');
      const data = await res.json();
      const rows = Array.isArray(data?.data) ? data.data : [];
      const parsed = rows
        .filter((m: any) => typeof m?.id === 'string')
        .map((m: any) => {
          const isFree = m.id === 'openrouter/free' || m.id.endsWith(':free');
          return {
            id: m.id as string,
            label: `${isFree ? '[FREE] ' : ''}${m.name || m.id} (${m.id})`,
            isFree,
          };
        })
        .sort((a: any, b: any) => Number(b.isFree) - Number(a.isFree));

      const mergedMap = new Map<string, { id: string; label: string }>();
      for (const item of [...OPENROUTER_FREE_MODELS, ...parsed]) {
        if (!mergedMap.has(item.id)) mergedMap.set(item.id, { id: item.id, label: item.label });
      }
      setLiveOpenRouterModels(Array.from(mergedMap.values()));
      if (notify) {
        showToast(`✓ OpenRouter-এর সব ${mergedMap.size}টি মডেল (Free + Paid) লোড হয়েছে!`);
      }
    } catch {
      if (notify) {
        showToast('OpenRouter লাইভ তালিকা লোড করা যায়নি — নিচে সরাসরি যেকোনো মডেলের নাম লিখে ব্যবহার করতে পারবেন।');
      }
    } finally {
      setLoadingOrModels(false);
    }
  };

  useEffect(() => {
    fetchOpenRouterAllModels(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // New training doc draft
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocCategory, setNewDocCategory] = useState('website');
  const [newDocContent, setNewDocContent] = useState('');

  const [mcpEndpointUrl, setMcpEndpointUrl] = useState('https://rabian.site/api/mcp');
  const [copiedMcp, setCopiedMcp] = useState(false);
  const [testingDecision, setTestingDecision] = useState(false);
  const [decisionTestResult, setDecisionTestResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [waWebhookUrl, setWaWebhookUrl] = useState('https://rabian.site/api/whatsapp');
  const [copiedWa, setCopiedWa] = useState(false);
  const [waTestPrompt, setWaTestPrompt] = useState('আমার B+ রক্ত লাগবে, ৯০+ দিন হয়েছে এমন কতজন আছেন ও নম্বর দিন?');
  const [testingWa, setTestingWa] = useState(false);
  const [waTestResult, setWaTestResult] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWaWebhookUrl(`${window.location.origin}/api/whatsapp`);
    }
  }, []);

  const handleTestWhatsAppAgent = async () => {
    setTestingWa(true);
    setWaTestResult(null);
    try {
      const res = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TEST_WHATSAPP_AGENT',
          password,
          message: waTestPrompt,
        }),
      });
      const data = await safeParseApiResponse(res);
      if (data.ok) {
        setWaTestResult({
          ok: true,
          msg: `উত্তর (${data.modelUsed || 'AI'}${data.usedTools?.length ? ` • Tools: ${data.usedTools.join(', ')}` : ''}): "${data.reply}"`,
        });
      } else {
        setWaTestResult({ ok: false, msg: data.error || 'WhatsApp এজেন্ট টেস্ট ব্যর্থ হয়েছে' });
      }
    } catch (err: any) {
      setWaTestResult({ ok: false, msg: err.message || 'নেটওয়ার্ক ত্রুটি' });
    } finally {
      setTestingWa(false);
    }
  };

  const handleTestDecisionRouter = async () => {
    setTestingDecision(true);
    setDecisionTestResult(null);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TEST_DECISION',
          password,
          apiKey: config.decisionRouterApiKey,
          model: config.decisionRouterModel || 'typesafe/jev-1.14',
        }),
      });
      const data = await safeParseApiResponse(res);
      if (data.ok) {
        setDecisionTestResult({
          ok: true,
          msg: `সফল! (${data.latencyMs}ms • ${data.model}) — Intent: "${data.intent}" (${Math.round(
            (data.confidence || 0) * 100
          )}% confidence)`,
        });
      } else {
        setDecisionTestResult({ ok: false, msg: data.error || 'Decision Router টেস্ট ব্যর্থ হয়েছে' });
      }
    } catch (err: any) {
      setDecisionTestResult({ ok: false, msg: err.message || 'নেটওয়ার্ক ত্রুটি' });
    } finally {
      setTestingDecision(false);
    }
  };

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
              onClick={() => fetchOpenRouterAllModels(true)}
              disabled={loadingOrModels}
              className="text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingOrModels ? 'animate-spin' : ''}`} />
              <span>
                {loadingOrModels
                  ? 'সব মডেল লোড হচ্ছে...'
                  : `সব OpenRouter মডেল রিফ্রেশ (${liveOpenRouterModels.length})`}
              </span>
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

                {/* Step 1: API Key Input */}
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-800">
                    ১. {meta.slot === 'gemini' ? 'Gemini API Key দিন' : 'OpenRouter API Key দিন'} (সবসময় বদলানো যাবে)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type={isRevealed ? 'text' : 'password'}
                      value={keyVal}
                      onChange={(e) => setConfig({ ...config, [meta.keyField]: e.target.value })}
                      placeholder={meta.placeholderKey}
                      className="flex-1 text-xs font-mono text-slate-900 bg-white border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

                {/* Step 2: Type Model Name Directly + Optional All-Models Picker */}
                <div className="space-y-2.5 bg-slate-50/90 border border-slate-200 rounded-2xl p-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-indigo-950 flex items-center justify-between">
                      <span>
                        ২. তারপর মডেলের নাম লিখুন ({meta.slot === 'gemini' ? 'Gemini মডেল' : 'OpenRouter-এর যেকোনো মডেল — All Models'}):
                      </span>
                      <Cpu className="w-3.5 h-3.5 text-indigo-600" />
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
                            ? 'এখানে মডেলের নাম লিখুন (যেমন: gemini-2.5-flash)'
                            : 'যেকোনো OpenRouter মডেলের নাম লিখুন (যেমন: openrouter/free, openai/gpt-4o, deepseek/deepseek-chat-v3-0324:free)'
                        }
                        className="w-full text-xs font-mono font-bold text-slate-900 border border-indigo-300 bg-white rounded-xl p-3 pr-9 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">
                      অথবা {meta.slot === 'gemini' ? 'Gemini' : `সকল OpenRouter মডেল (${presets.length}টি)`} তালিকা থেকে বেছে নিন:
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
                      <option value="__custom__">✏️ উপরে নিজের মতো মডেলের নাম লিখুন...</option>
                      {presets.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label}
                        </option>
                      ))}
                    </select>
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

      {/* Optional TypeSafe Jev Decision Pre-Router Card */}
      <div className="bg-white rounded-3xl border border-amber-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-base font-black text-slate-900">
                ঐচ্ছিক স্মার্ট ডিসিশন প্রি-রাউটার (TypeSafe Jev Decision Model)
              </h3>
              <p className="text-xs text-slate-500">
                এটি চ্যাটের উত্তর লিখবে না — বরং OpenRouter Decisions API দিয়ে সেকেন্ডের ভগ্নাংশে রক্তদান, অর্ডার নাকি শিক্ষকের তথ্য চাওয়া হয়েছে তা ধরে মূল চ্যাট মডেলের কাজ স্মুথ করবে।
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs font-bold text-slate-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(config.decisionRouterEnabled)}
              onChange={(e) => setConfig({ ...config, decisionRouterEnabled: e.target.checked })}
              className="rounded text-amber-600"
            />
            <span>Jev ডিসিশন রাউটার চালু করুন</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Decision Model ID</label>
            <input
              type="text"
              value={config.decisionRouterModel ?? 'typesafe/jev-1.14'}
              onChange={(e) => setConfig({ ...config, decisionRouterModel: e.target.value })}
              placeholder="typesafe/jev-1.14"
              className="w-full text-xs font-mono font-bold text-slate-900 bg-white border border-slate-200 rounded-xl p-2.5"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              OpenRouter API Key (খালি রাখলে উপরের স্লট #১ ব্যবহার হবে)
            </label>
            <input
              type="password"
              value={config.decisionRouterApiKey ?? ''}
              onChange={(e) => setConfig({ ...config, decisionRouterApiKey: e.target.value })}
              placeholder="খালি রাখলে স্লট #১-এর OpenRouter Key অটো ব্যবহার হবে"
              className="w-full text-xs font-mono text-slate-900 bg-white border border-slate-200 rounded-xl p-2.5"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleTestDecisionRouter}
            disabled={testingDecision}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black flex items-center gap-1.5 disabled:opacity-50 transition"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{testingDecision ? 'টেস্ট হচ্ছে...' : '⚡ Jev Decision টেস্ট করুন'}</span>
          </button>

          {decisionTestResult && (
            <div
              className={`text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 ${
                decisionTestResult.ok
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {decisionTestResult.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{decisionTestResult.msg}</span>
            </div>
          )}
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

      {/* WhatsApp AI Agent Setup Card (Meta Cloud API + QR Bot Bridge + Live Simulator) */}
      <div className="bg-white rounded-3xl border border-emerald-300 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-base font-black text-slate-900">
                WhatsApp AI এজেন্ট সেটআপ (Meta Cloud API ও QR Bot ব্রিজ)
              </h3>
              <p className="text-xs text-slate-500">
                কাস্টমার আপনার WhatsApp-এ মেসেজ দিলে উপরের AI + লাইভ ওয়েবসাইট ডাটা ও ৭টি টুল ব্যবহার করে স্বয়ংক্রিয়ভাবে উত্তর দিবে, রক্তদাতার নম্বর খুঁজবে ও `১. ইনটেক` অর্ডার তৈরি করবে।
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs font-bold text-slate-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={config.whatsappAgentEnabled !== false}
              onChange={(e) => setConfig({ ...config, whatsappAgentEnabled: e.target.checked })}
              className="rounded text-emerald-600"
            />
            <span>WhatsApp এজেন্ট চালু রাখুন</span>
          </label>
        </div>

        {/* Copyable Webhook URL & Verify Token */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Meta Webhook Callback URL</label>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2">
              <code className="text-xs font-mono text-slate-900 flex-1 truncate">{waWebhookUrl}</code>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(waWebhookUrl);
                  setCopiedWa(true);
                  setTimeout(() => setCopiedWa(false), 2000);
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1 shrink-0"
              >
                {copiedWa ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedWa ? 'কপি হয়েছে' : 'কপি'}</span>
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Webhook Verify Token (Meta-তে বসাতে হবে)</label>
            <input
              type="text"
              value={config.whatsappVerifyToken ?? 'rabian-wa-verify'}
              onChange={(e) => setConfig({ ...config, whatsappVerifyToken: e.target.value })}
              placeholder="rabian-wa-verify"
              className="w-full text-xs font-mono font-bold text-slate-900 bg-white border border-slate-200 rounded-xl p-2.5"
            />
          </div>
        </div>

        {/* Meta Phone Number ID & Permanent Access Token */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Meta Phone Number ID</label>
            <input
              type="text"
              value={config.whatsappPhoneNumberId ?? ''}
              onChange={(e) => setConfig({ ...config, whatsappPhoneNumberId: e.target.value })}
              placeholder="যেমন: 482910482910482"
              className="w-full text-xs font-mono text-slate-900 bg-white border border-slate-200 rounded-xl p-2.5"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Meta WhatsApp Permanent Access Token</label>
            <div className="flex items-center gap-1.5">
              <input
                type={revealedKeys['whatsapp_token'] ? 'text' : 'password'}
                value={config.whatsappAccessToken ?? ''}
                onChange={(e) => setConfig({ ...config, whatsappAccessToken: e.target.value })}
                placeholder="EAAG..."
                className="flex-1 text-xs font-mono text-slate-900 bg-white border border-slate-200 rounded-xl p-2.5"
              />
              <button
                type="button"
                onClick={() =>
                  setRevealedKeys({ ...revealedKeys, whatsapp_token: !revealedKeys['whatsapp_token'] })
                }
                className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100"
              >
                {revealedKeys['whatsapp_token'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Optional Personal/QR Bot Bridge Secret */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">
            ঐচ্ছিক QR-Bot / WAHA / n8n ব্রিজ সিক্রেট (যদি Meta Cloud বাদে নিজের WhatsApp-এ QR বট চালান)
          </label>
          <input
            type="text"
            value={config.whatsappBridgeSecret ?? ''}
            onChange={(e) => setConfig({ ...config, whatsappBridgeSecret: e.target.value })}
            placeholder="যেমন: ru-wa-bridge-secret-2026 (Meta Cloud API ব্যবহার করলে খালি রাখুন)"
            className="w-full text-xs font-mono text-slate-900 bg-white border border-slate-200 rounded-xl p-2.5"
          />
        </div>

        {/* Live WhatsApp Simulator */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-2.5">
          <h4 className="text-xs font-black text-emerald-950">💬 WhatsApp এজেন্ট লাইভ সিমুলেটর টেস্ট</h4>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={waTestPrompt}
              onChange={(e) => setWaTestPrompt(e.target.value)}
              placeholder="টেস্ট মেসেজ লিখুন..."
              className="flex-1 text-xs bg-white text-slate-900 border border-emerald-200 rounded-xl p-2.5 font-semibold"
            />
            <button
              type="button"
              onClick={handleTestWhatsAppAgent}
              disabled={testingWa}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>{testingWa ? 'চেক হচ্ছে...' : 'WhatsApp এজেন্ট টেস্ট করুন'}</span>
            </button>
          </div>
          {waTestResult && (
            <div
              className={`text-xs font-bold p-3 rounded-xl whitespace-pre-wrap ${
                waTestResult.ok
                  ? 'bg-white text-emerald-900 border border-emerald-300'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {waTestResult.msg}
            </div>
          )}
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-[11px] text-slate-700 space-y-1">
          <p className="font-black text-slate-900">📌 Meta WhatsApp Cloud API যুক্ত করার ৩টি ধাপ:</p>
          <p>১. <strong>developers.facebook.com</strong> → Create App → <strong>WhatsApp</strong> যুক্ত করুন।</p>
          <p>২. WhatsApp → Configuration-এ উপরের <strong>Callback URL</strong> ও <strong>Verify Token</strong> বসিয়ে Verify দিন এবং <strong>messages</strong> Webhook Subscribe করুন।</p>
          <p>৩. API Setup থেকে <strong>Phone Number ID</strong> ও <strong>Access Token</strong> কপি করে উপরের বক্সে বসিয়ে নিচে <strong>সেভ</strong> বাটনে ক্লিক করুন!</p>
        </div>

        <div className="pt-1 flex justify-end">
          <button
            type="button"
            onClick={handleSaveConfig}
            disabled={saving}
            className="px-6 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs flex items-center gap-2 shadow-sm disabled:opacity-60 transition"
          >
            <Check className="w-4 h-4" />
            <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'সমস্ত AI, MCP ও WhatsApp সেটিংস সেভ করুন'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
