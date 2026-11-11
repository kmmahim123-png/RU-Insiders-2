import { DatabaseSchema } from '@/lib/db';
import { AI_MCP_TOOLS, executeAiTool, buildLiveWebsiteSnapshot } from '@/lib/aiTools';
import { routeChatIntentWithJev } from '@/lib/jevDecision';
import { AiConfig, AiSlotKey } from '@/types';

export interface AiChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface SlotExecutionMeta {
  slot: AiSlotKey;
  provider: 'openrouter' | 'gemini';
  model: string;
  label: string;
}

export interface VerifiedCustomerContext {
  email?: string;
  uid?: string;
}

export function buildSystemInstruction(db: DatabaseSchema, extraSystemHint?: string): string {
  const aiConfig = db.settings.aiConfig;
  const officialWhatsapp = db.settings.whatsappNumber;
  const deliveryCharges = db.settings.deliveryCharges;
  const today = new Date().toISOString().slice(0, 10);
  const docs = (aiConfig?.trainingDocs || [])
    .map((d, i) => `${i + 1}. [${d.category}] ${d.title}: ${d.content}`)
    .join('\n');

  const basePersona =
    aiConfig?.systemPersonaBn ||
    'তুমি RU Insiders (রাজশাহী বিশ্ববিদ্যালয় অফিসিয়াল মার্চেন্ডাইজ স্টোর ও ক্যাম্পাস পোর্টাল)-এর স্মার্ট AI অ্যাসিস্ট্যান্ট। সবসময় ভদ্র ও স্পষ্ট বাংলায় উত্তর দাও।';

  const liveSnapshot = buildLiveWebsiteSnapshot(db);

  return `${basePersona}

আজকের তারিখ: ${today}
অফিশিয়াল WhatsApp নম্বর: ${officialWhatsapp || '8801700000000'}
ডেলিভারি চার্জ: ক্যাম্পাস ৳${deliveryCharges?.campus ?? 0}, রাজশাহী সিটি ৳${deliveryCharges?.city ?? 40}, সারাদেশ কুরিয়ার ৳${deliveryCharges?.nationwide ?? 100}।

${liveSnapshot}

অ্যাডমিন প্যানেল থেকে অতিরিক্ত শেখানো তথ্য (ঐচ্ছিক Custom Knowledge):
${docs || '(অতিরিক্ত কোনো ডকুমেন্ট যোগ করা হয়নি — উপরের ওয়েবসাইটের লাইভ ডাটা ও টুল থেকেই উত্তর দাও)'}

গুরুত্বপূর্ণ নিয়মাবলি:
১. রক্তদানের (Blood Donor) প্রশ্ন এলে \`check_blood_donors\` টুল কল করো অথবা উপরের লাইভ ব্লাড ব্যাংক স্ন্যাপশট থেকে আজকের (${today}) ৯০+ দিন হিসাব অনুযায়ী যোগ্য সংখ্যা ও সরাসরি ফোন নম্বর দেখাও।
২. ডিপার্টমেন্ট বা স্যারদের সম্পর্কে জানতে চাইলে \`find_department_and_teachers\` টুল কল করবে (যাতে সব ৫৯টি বিভাগ পাওয়া যায়)।
৩. পণ্য, দাম বা অর্ডার সংক্রান্ত প্রশ্নে লাইভ স্ন্যাপশট / \`search_products\` ব্যবহার করবে।
৪. কাস্টমার অর্ডার করতে চাইলে আগে পণ্য (id/নাম, সাইজ বা অপশন, পরিমাণ), কাস্টমারের নাম, মোবাইল নম্বর ও ঠিকানা জেনে নিয়ে তারপর \`create_shop_order\` কল করবে — কনফার্ম না হয়ে ভুয়া অর্ডার বানাবে না। অর্ডার আইডি পেলে পরিষ্কারভাবে দেখাবে।
৫. অর্ডার ট্র্যাক করতে \`track_shop_order\` এবং ক্যাম্পাস/ম্যাপ/নিউজ বিস্তারিত খুঁজতে \`search_campus_and_maps\` কল করবে।
৬. কখনোই মনগড়া ফোন নম্বর বা অসত্য তথ্য বানাবে না।${extraSystemHint ? `\n\nচ্যানেল নির্দেশনা:\n${extraSystemHint}` : ''}`;
}

function extractInlineToolCall(text: string): { name: string; args: any } | null {
  const m = text.match(/\[\[TOOL:([a-zA-Z0-9_]+)\|([\s\S]*?)\]\]/);
  if (!m) return null;
  try {
    return { name: m[1], args: JSON.parse(m[2]) };
  } catch {
    return { name: m[1], args: {} };
  }
}

export async function runOpenRouterSlot(
  apiKey: string,
  model: string,
  systemPrompt: string,
  history: AiChatMessage[],
  options?: { skipTools?: boolean; customer?: VerifiedCustomerContext | null }
): Promise<{ reply: string; usedTools: string[]; createdOrderId?: string }> {
  const openAiTools = AI_MCP_TOOLS.map((t) => ({
    type: 'function',
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    },
  }));

  const usedTools: string[] = [];
  let createdOrderId: string | undefined;

  const messages: any[] = [
    { role: 'system', content: systemPrompt },
    ...history.map((m) => ({ role: m.role, content: m.content })),
  ];

  let useNativeTools = !options?.skipTools;

  for (let turn = 0; turn < 4; turn++) {
    const reqBody: any = {
      model,
      messages:
        useNativeTools || options?.skipTools
          ? messages
          : [
              {
                role: 'system',
                content:
                  systemPrompt +
                  `\n\nযদি কোনো ডাটাবেজ টুল কল করার দরকার হয়, শুধু এই ফরম্যাটে আউটপুট দাও:\n[[TOOL:tool_name|{"arg":"value"}]]\nAvailable tools: ${AI_MCP_TOOLS.map((t) => `${t.name}(${Object.keys(t.parameters.properties || {}).join(',')})`).join(', ')}`,
              },
              ...messages.slice(1),
            ],
      temperature: 0.4,
    };
    if (useNativeTools) {
      reqBody.tools = openAiTools;
      reqBody.tool_choice = 'auto';
    }

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://ruinsider-2.vercel.app',
        'X-Title': 'RU Insiders AI & MCP Agent',
      },
      body: JSON.stringify(reqBody),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      const errText = await res.text();
      const lowerErr = errText.toLowerCase();
      if (
        useNativeTools &&
        (res.status === 400 || res.status === 404 || res.status === 422) &&
        !lowerErr.includes('not a valid model')
      ) {
        useNativeTools = false;
        continue;
      }
      throw new Error(`OpenRouter HTTP ${res.status}: ${errText.slice(0, 180)}`);
    }

    const data = await res.json();
    const choice = data?.choices?.[0];
    const msg = choice?.message;
    if (!msg) throw new Error('OpenRouter empty response');

    if (Array.isArray(msg.tool_calls) && msg.tool_calls.length > 0) {
      messages.push(msg);
      for (const tc of msg.tool_calls) {
        const fnName = tc?.function?.name;
        let fnArgs: any = {};
        try {
          fnArgs = tc?.function?.arguments ? JSON.parse(tc.function.arguments) : {};
        } catch {}
        usedTools.push(fnName);
        const enrichedArgs =
          fnName === 'create_shop_order' && options?.customer
            ? { ...fnArgs, _customerEmail: options.customer.email, _customerUid: options.customer.uid }
            : fnArgs;
        const toolOut = await executeAiTool(fnName, enrichedArgs);
        if (fnName === 'create_shop_order' && toolOut?.ok && toolOut?.orderId) {
          createdOrderId = toolOut.orderId;
        }
        messages.push({
          role: 'tool',
          tool_call_id: tc.id,
          name: fnName,
          content: JSON.stringify(toolOut),
        });
      }
      continue;
    }

    const contentStr = String(msg.content || '').trim();
    const inlineTool = extractInlineToolCall(contentStr);
    if (inlineTool && turn < 3) {
      usedTools.push(inlineTool.name);
      const enrichedArgs =
        inlineTool.name === 'create_shop_order' && options?.customer
          ? { ...inlineTool.args, _customerEmail: options.customer.email, _customerUid: options.customer.uid }
          : inlineTool.args;
      const toolOut = await executeAiTool(inlineTool.name, enrichedArgs);
      if (inlineTool.name === 'create_shop_order' && toolOut?.ok && toolOut?.orderId) {
        createdOrderId = toolOut.orderId;
      }
      messages.push({ role: 'assistant', content: contentStr });
      messages.push({
        role: 'user',
        content: `[TOOL RESULT for ${inlineTool.name}]: ${JSON.stringify(toolOut)}\nএবার উপরের বাস্তব তথ্য দিয়ে ইউজারকে সহজ ও নির্ভুল বাংলায় উত্তর দাও।`,
      });
      continue;
    }

    return { reply: contentStr, usedTools, createdOrderId };
  }

  throw new Error('OpenRouter tool loop exceeded max turns');
}

export async function runGeminiSlot(
  apiKey: string,
  model: string,
  systemPrompt: string,
  history: AiChatMessage[],
  customer?: VerifiedCustomerContext | null
): Promise<{ reply: string; usedTools: string[]; createdOrderId?: string }> {
  const usedTools: string[] = [];
  let createdOrderId: string | undefined;

  const geminiTools = [
    {
      functionDeclarations: AI_MCP_TOOLS.map((t) => ({
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      })),
    },
  ];

  const contents: any[] = history.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const cleanModel = model.replace(/^models\//, '');

  for (let turn = 0; turn < 4; turn++) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      cleanModel
    )}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
        tools: geminiTools,
        generationConfig: { temperature: 0.4 },
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini HTTP ${res.status}: ${errText.slice(0, 180)}`);
    }

    const data = await res.json();
    const candidate = data?.candidates?.[0];
    const parts = candidate?.content?.parts || [];
    const fnCalls = parts.filter((p: any) => p.functionCall);

    if (fnCalls.length > 0) {
      contents.push({ role: 'model', parts });
      const responseParts: any[] = [];
      for (const fcPart of fnCalls) {
        const fnName = fcPart.functionCall.name;
        const fnArgs = fcPart.functionCall.args || {};
        usedTools.push(fnName);
        const enrichedArgs =
          fnName === 'create_shop_order' && customer
            ? { ...fnArgs, _customerEmail: customer.email, _customerUid: customer.uid }
            : fnArgs;
        const toolOut = await executeAiTool(fnName, enrichedArgs);
        if (fnName === 'create_shop_order' && toolOut?.ok && toolOut?.orderId) {
          createdOrderId = toolOut.orderId;
        }
        responseParts.push({
          functionResponse: {
            name: fnName,
            response: { result: toolOut },
          },
        });
      }
      contents.push({ role: 'user', parts: responseParts });
      continue;
    }

    const textReply = parts
      .map((p: any) => p.text || '')
      .join('\n')
      .trim();
    if (!textReply) throw new Error('Gemini returned empty response');
    return { reply: textReply, usedTools, createdOrderId };
  }

  throw new Error('Gemini tool loop exceeded max turns');
}

export function buildOrderedSlots(cfg: AiConfig | undefined): SlotExecutionMeta[] {
  if (!cfg) return [];
  const slotMap: Record<AiSlotKey, SlotExecutionMeta | null> = {
    openrouter1:
      cfg.openRouterEnabled1 !== false && cfg.openRouterKey1?.trim()
        ? {
            slot: 'openrouter1',
            provider: 'openrouter',
            model: (cfg.openRouterModel1 || 'openrouter/free').trim(),
            label: cfg.openRouterName1?.trim() || 'OpenRouter #1 (Primary)',
          }
        : null,
    openrouter2:
      cfg.openRouterEnabled2 !== false && cfg.openRouterKey2?.trim()
        ? {
            slot: 'openrouter2',
            provider: 'openrouter',
            model: (cfg.openRouterModel2 || 'meta-llama/llama-3.3-70b-instruct:free').trim(),
            label: cfg.openRouterName2?.trim() || 'OpenRouter #2 (Backup)',
          }
        : null,
    gemini:
      cfg.geminiEnabled !== false && cfg.geminiApiKey?.trim()
        ? {
            slot: 'gemini',
            provider: 'gemini',
            model: (cfg.geminiModel || 'gemini-2.5-flash').trim(),
            label: cfg.geminiName?.trim() || 'Google Gemini Direct',
          }
        : null,
  };

  const order: AiSlotKey[] =
    Array.isArray(cfg.priorityOrder) && cfg.priorityOrder.length === 3
      ? cfg.priorityOrder
      : ['openrouter1', 'openrouter2', 'gemini'];

  return order.map((k) => slotMap[k]).filter((x): x is SlotExecutionMeta => Boolean(x));
}

export async function testSingleAiSlot(params: {
  aiCfg?: AiConfig;
  slot: AiSlotKey;
  apiKey?: string;
  model?: string;
}) {
  const { aiCfg, slot, apiKey, model } = params;
  const testPrompt = 'সংক্ষেপে বাংলায় "কানেকশন সফল!" লিখে উত্তর দাও।';
  const resolvedKey =
    (apiKey || '').trim() ||
    (slot === 'openrouter1'
      ? aiCfg?.openRouterKey1 || ''
      : slot === 'openrouter2'
      ? aiCfg?.openRouterKey2 || ''
      : aiCfg?.geminiApiKey || '');
  const resolvedModel =
    (model || '').trim() ||
    (slot === 'openrouter1'
      ? aiCfg?.openRouterModel1 || 'openrouter/free'
      : slot === 'openrouter2'
      ? aiCfg?.openRouterModel2 || 'meta-llama/llama-3.3-70b-instruct:free'
      : aiCfg?.geminiModel || 'gemini-2.5-flash');

  if (!resolvedKey) {
    throw new Error('API Key দেওয়া হয়নি।');
  }

  const start = Date.now();
  const result =
    slot === 'gemini'
      ? await runGeminiSlot(resolvedKey, resolvedModel, 'তুমি একটি টেস্ট অ্যাসিস্ট্যান্ট।', [
          { role: 'user', content: testPrompt },
        ])
      : await runOpenRouterSlot(
          resolvedKey,
          resolvedModel,
          'তুমি একটি টেস্ট অ্যাসিস্ট্যান্ট।',
          [{ role: 'user', content: testPrompt }],
          { skipTools: true }
        );

  return {
    latencyMs: Date.now() - start,
    model: resolvedModel,
    sampleReply: result.reply,
  };
}

/** Shared failover AI reply generator powering both Web Chat (/api/ai) and WhatsApp Agent (/api/whatsapp). */
export async function generateRuAiReply(params: {
  db: DatabaseSchema;
  messages: AiChatMessage[];
  verifiedCustomer?: VerifiedCustomerContext | null;
  extraSystemHint?: string;
}) {
  const { db, messages, verifiedCustomer, extraSystemHint } = params;
  const aiCfg = db.settings.aiConfig;
  const orderedSlots = buildOrderedSlots(aiCfg);

  if (orderedSlots.length === 0) {
    return {
      ok: false as const,
      notConfigured: true,
      error:
        'অ্যাডমিন প্যানেলে এখনো AI API Key (OpenRouter বা Gemini) সেট করা হয়নি। অনুগ্রহ করে `/admin` → **🤖 AI ও MCP স্টুডিও** থেকে অন্তত একটি API Key যোগ করুন।',
    };
  }

  const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
  const decisionRoute = await routeChatIntentWithJev(lastUserMessage, aiCfg);

  let systemPrompt = buildSystemInstruction(db, extraSystemHint);
  if (decisionRoute?.used && decisionRoute.prefetchedTool && decisionRoute.prefetchedData) {
    systemPrompt += `\n\n=== Jev ডিসিশন প্রি-রাউটার ফলাফল (উদ্দেশ্য: ${decisionRoute.intent}, কনফিডেন্স: ${Math.round(
      decisionRoute.confidence * 100
    )}%, প্রি-ফেচ টুল: ${decisionRoute.prefetchedTool}) ===\n${JSON.stringify(
      decisionRoute.prefetchedData
    )}\n(এই সরাসরি ডেটা ব্যবহার করে ভিজিটরকে দ্রুত ও নির্ভুল বাংলায় উত্তর দাও।)`;
  }

  const failures: string[] = [];
  for (const s of orderedSlots) {
    const keyForSlot =
      s.slot === 'openrouter1'
        ? aiCfg?.openRouterKey1?.trim() || ''
        : s.slot === 'openrouter2'
        ? aiCfg?.openRouterKey2?.trim() || ''
        : aiCfg?.geminiApiKey?.trim() || '';

    if (!keyForSlot) continue;

    try {
      const out =
        s.provider === 'gemini'
          ? await runGeminiSlot(keyForSlot, s.model, systemPrompt, messages, verifiedCustomer)
          : await runOpenRouterSlot(keyForSlot, s.model, systemPrompt, messages, {
              customer: verifiedCustomer,
            });

      const combinedTools = decisionRoute?.prefetchedTool
        ? Array.from(new Set([decisionRoute.prefetchedTool, ...out.usedTools]))
        : out.usedTools;

      return {
        ok: true as const,
        reply: out.reply,
        usedTools: combinedTools,
        createdOrderId: out.createdOrderId || null,
        providerLabel: s.label,
        modelUsed: s.model,
        failoverCount: failures.length,
        decisionRoute: decisionRoute?.used
          ? {
              model: decisionRoute.model,
              intent: decisionRoute.intent,
              confidence: decisionRoute.confidence,
              isUrgent: decisionRoute.isUrgent,
              latencyMs: decisionRoute.latencyMs,
            }
          : null,
      };
    } catch (slotErr: any) {
      failures.push(`${s.label} (${s.model}): ${slotErr?.message || 'failed'}`);
    }
  }

  return {
    ok: false as const,
    notConfigured: false,
    error: 'বর্তমানে সব AI API স্লট ব্যর্থ হয়েছে। কিছুক্ষণ পর চেষ্টা করুন বা অ্যাডমিনে Key/Model যাচাই করুন।',
    details: failures,
  };
}
