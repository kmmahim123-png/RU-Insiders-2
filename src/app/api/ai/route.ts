import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import { AI_MCP_TOOLS, executeAiTool } from '@/lib/aiTools';
import { AiConfig, AiSlotKey } from '@/types';

export const dynamic = 'force-dynamic';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface SlotExecutionMeta {
  slot: AiSlotKey;
  provider: 'openrouter' | 'gemini';
  model: string;
  label: string;
}

function buildSystemInstruction(aiConfig?: AiConfig, officialWhatsapp?: string, deliveryCharges?: any): string {
  const today = new Date().toISOString().slice(0, 10);
  const docs = (aiConfig?.trainingDocs || [])
    .map((d, i) => `${i + 1}. [${d.category}] ${d.title}: ${d.content}`)
    .join('\n');

  const basePersona =
    aiConfig?.systemPersonaBn ||
    'তুমি RU Insiders (রাজশাহী বিশ্ববিদ্যালয় অফিসিয়াল মার্চেন্ডাইজ স্টোর ও ক্যাম্পাস পোর্টাল)-এর স্মার্ট AI অ্যাসিস্ট্যান্ট। সবসময় ভদ্র ও স্পষ্ট বাংলায় উত্তর দাও।';

  return `${basePersona}

আজকের তারিখ: ${today}
অফিশিয়াল WhatsApp নম্বর: ${officialWhatsapp || '8801700000000'}
ডেলিভারি চার্জ: ক্যাম্পাস ৳${deliveryCharges?.campus ?? 0}, রাজশাহী সিটি ৳${deliveryCharges?.city ?? 40}, সারাদেশ কুরিয়ার ৳${deliveryCharges?.nationwide ?? 100}।

অ্যাডমিন প্যানেল থেকে শেখানো তথ্য (Custom Trained Knowledge):
${docs || '(কোনো কাস্টম ডকুমেন্ট নেই)'}

গুরুত্বপূর্ণ নিয়মাবলি:
১. রক্তদানের (Blood Donor) প্রশ্ন এলে অবশ্যই \`check_blood_donors\` টুল কল করে আজকের (${today}) তারিখের সাথে ৯০ দিন (৩ মাস) হিসাব করে যোগ্য সংখ্যা এবং তাদের সরাসরি ফোন নম্বর দেখাবে।
২. ডিপার্টমেন্ট বা স্যারদের সম্পর্কে জানতে চাইলে \`find_department_and_teachers\` টুল কল করবে।
৩. পণ্য বা দাম জানতে চাইলে \`search_products\` কল করবে।
৪. কাস্টমার অর্ডার করতে চাইলে আগে পণ্য (id/নাম, সাইজ বা অপশন, পরিমাণ), কাস্টমারের নাম, মোবাইল নম্বর ও ঠিকানা জেনে নিয়ে তারপর \`create_shop_order\` কল করবে — কনফার্ম না হয়ে ভুয়া অর্ডার বানাবে না। অর্ডার আইডি পেলে পরিষ্কারভাবে দেখাবে।
৫. অর্ডার ট্র্যাক করতে \`track_shop_order\` এবং ক্যাম্পাস/ম্যাপ/নিউজ খুঁজতে \`search_campus_and_maps\` কল করবে।
৬. কখনোই মনগড়া ফোন নম্বর বা অসত্য তথ্য বানাবে না।`;
}

// Parse fallback inline tool call tag: [[TOOL:tool_name|{"key":"val"}]]
function extractInlineToolCall(text: string): { name: string; args: any } | null {
  const m = text.match(/\[\[TOOL:([a-zA-Z0-9_]+)\|([\s\S]*?)\]\]/);
  if (!m) return null;
  try {
    return { name: m[1], args: JSON.parse(m[2]) };
  } catch {
    return { name: m[1], args: {} };
  }
}

async function runOpenRouterSlot(
  apiKey: string,
  model: string,
  systemPrompt: string,
  history: ChatMessage[]
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

  let useNativeTools = true;

  for (let turn = 0; turn < 4; turn++) {
    const reqBody: any = {
      model,
      messages: useNativeTools
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
      // If a free model rejects native `tools`, automatically retry the same slot using text tool directive
      if (
        useNativeTools &&
        (res.status === 400 || res.status === 404) &&
        (errText.toLowerCase().includes('tool') || errText.toLowerCase().includes('function'))
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

    // Native tool calls
    if (Array.isArray(msg.tool_calls) && msg.tool_calls.length > 0) {
      messages.push(msg);
      for (const tc of msg.tool_calls) {
        const fnName = tc?.function?.name;
        let fnArgs = {};
        try {
          fnArgs = tc?.function?.arguments ? JSON.parse(tc.function.arguments) : {};
        } catch {}
        usedTools.push(fnName);
        const toolOut = await executeAiTool(fnName, fnArgs);
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
    // Fallback inline tool tag check
    const inlineTool = extractInlineToolCall(contentStr);
    if (inlineTool && turn < 3) {
      usedTools.push(inlineTool.name);
      const toolOut = await executeAiTool(inlineTool.name, inlineTool.args);
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

async function runGeminiSlot(
  apiKey: string,
  model: string,
  systemPrompt: string,
  history: ChatMessage[]
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
        const toolOut = await executeAiTool(fnName, fnArgs);
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

function buildOrderedSlots(cfg: AiConfig | undefined): SlotExecutionMeta[] {
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action = 'CHAT', messages, password, slot, apiKey, model } = body;
    const db = await readDb();
    const aiCfg = db.settings.aiConfig;

    // 1. Admin live test for a single API slot before saving
    if (action === 'TEST_SLOT') {
      const cleanPass = (password || '').trim();
      if (cleanPass !== db.settings.superAdminPassword) {
        return NextResponse.json({ ok: false, error: 'শুধুমাত্র সুপার অ্যাডমিন API টেস্ট করতে পারবেন।' }, { status: 401 });
      }

      const targetSlot = slot as AiSlotKey;
      const testPrompt = 'সংক্ষেপে বাংলায় "কানেকশন সফল!" লিখে উত্তর দাও।';
      const resolvedKey =
        (apiKey || '').trim() ||
        (targetSlot === 'openrouter1'
          ? aiCfg?.openRouterKey1 || ''
          : targetSlot === 'openrouter2'
          ? aiCfg?.openRouterKey2 || ''
          : aiCfg?.geminiApiKey || '');
      const resolvedModel =
        (model || '').trim() ||
        (targetSlot === 'openrouter1'
          ? aiCfg?.openRouterModel1 || 'openrouter/free'
          : targetSlot === 'openrouter2'
          ? aiCfg?.openRouterModel2 || 'meta-llama/llama-3.3-70b-instruct:free'
          : aiCfg?.geminiModel || 'gemini-2.5-flash');

      if (!resolvedKey) {
        return NextResponse.json({ ok: false, error: 'API Key দেওয়া হয়নি।' }, { status: 400 });
      }

      const start = Date.now();
      try {
        const result =
          targetSlot === 'gemini'
            ? await runGeminiSlot(resolvedKey, resolvedModel, 'তুমি একটি টেস্ট অ্যাসিস্ট্যান্ট।', [
                { role: 'user', content: testPrompt },
              ])
            : await runOpenRouterSlot(resolvedKey, resolvedModel, 'তুমি একটি টেস্ট অ্যাসিস্ট্যান্ট।', [
                { role: 'user', content: testPrompt },
              ]);
        return NextResponse.json({
          ok: true,
          latencyMs: Date.now() - start,
          model: resolvedModel,
          sampleReply: result.reply,
        });
      } catch (testErr: any) {
        return NextResponse.json({
          ok: false,
          error: testErr?.message || 'কানেকশন ব্যর্থ হয়েছে',
        }, { status: 400 });
      }
    }

    // 2. Public Visitor Chat with Automatic 3-Slot Failover + MCP Tools
    const chatMessages: ChatMessage[] = Array.isArray(messages) ? messages.slice(-10) : [];
    if (chatMessages.length === 0) {
      return NextResponse.json({ ok: false, error: 'মেসেজ লিখুন।' }, { status: 400 });
    }

    const orderedSlots = buildOrderedSlots(aiCfg);
    if (orderedSlots.length === 0) {
      return NextResponse.json({
        ok: false,
        notConfigured: true,
        error:
          'অ্যাডমিন প্যানেলে এখনো AI API Key (OpenRouter বা Gemini) সেট করা হয়নি। অনুগ্রহ করে `/admin` → **🤖 AI ও MCP স্টুডিও** থেকে অন্তত একটি API Key যোগ করুন।',
      }, { status: 503 });
    }

    const systemPrompt = buildSystemInstruction(
      aiCfg,
      db.settings.whatsappNumber,
      db.settings.deliveryCharges
    );

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
            ? await runGeminiSlot(keyForSlot, s.model, systemPrompt, chatMessages)
            : await runOpenRouterSlot(keyForSlot, s.model, systemPrompt, chatMessages);

        return NextResponse.json({
          ok: true,
          reply: out.reply,
          usedTools: out.usedTools,
          createdOrderId: out.createdOrderId || null,
          providerLabel: s.label,
          modelUsed: s.model,
          failoverCount: failures.length,
        });
      } catch (slotErr: any) {
        failures.push(`${s.label} (${s.model}): ${slotErr?.message || 'failed'}`);
      }
    }

    return NextResponse.json(
      {
        ok: false,
        error: 'বর্তমানে সব AI API স্লট ব্যর্থ হয়েছে। কিছুক্ষণ পর চেষ্টা করুন বা অ্যাডমিনে Key/Model যাচাই করুন।',
        details: failures,
      },
      { status: 502 }
    );
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'AI server error' }, { status: 500 });
  }
}
