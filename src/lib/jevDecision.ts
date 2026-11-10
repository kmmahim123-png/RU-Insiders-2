import { AiConfig } from '@/types';
import { executeAiTool } from '@/lib/aiTools';

export type ChatDecisionIntent =
  | 'blood_donor'
  | 'department_teachers'
  | 'product_order'
  | 'order_tracking'
  | 'campus_map_news'
  | 'general_faq';

export interface JevDecisionRouteResult {
  used: boolean;
  model: string;
  intent: ChatDecisionIntent;
  confidence: number;
  isUrgent: boolean;
  needsLiveTools: boolean;
  latencyMs: number;
  prefetchedTool?: string;
  prefetchedData?: any;
  rawAnswers?: Record<string, any>;
  error?: string;
}

const VALID_INTENTS: ChatDecisionIntent[] = [
  'blood_donor',
  'department_teachers',
  'product_order',
  'order_tracking',
  'campus_map_news',
  'general_faq',
];

export function resolveDecisionCredentials(aiConfig?: AiConfig, overrideKey?: string, overrideModel?: string) {
  const apiKey =
    (overrideKey || '').trim() ||
    (aiConfig?.decisionRouterApiKey || '').trim() ||
    (aiConfig?.openRouterKey1 || '').trim() ||
    (aiConfig?.openRouterKey2 || '').trim();
  const model = (overrideModel || '').trim() || (aiConfig?.decisionRouterModel || 'typesafe/jev-1.14').trim();
  return { apiKey, model };
}

/** Query OpenRouter's System One Decisions endpoint (`typesafe/jev-1.14`). */
export async function callOpenRouterDecision(
  apiKey: string,
  model: string,
  state: string,
  questions: Record<string, any>
): Promise<{ answers: Record<string, any>; latencyMs: number }> {
  const start = Date.now();
  const res = await fetch('https://openrouter.ai/api/alpha/decisions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://ruinsider-2.vercel.app',
      'X-Title': 'RU Insiders Jev Decision Router',
    },
    body: JSON.stringify({ model, state, questions }),
    signal: AbortSignal.timeout(6500),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter Decisions HTTP ${res.status}: ${errText.slice(0, 180)}`);
  }

  const data = await res.json();
  return {
    answers: data?.answers || {},
    latencyMs: Date.now() - start,
  };
}

function extractBloodGroupHint(text: string): string {
  const m = text.toUpperCase().match(/\b(AB|A|B|O)\s*([+-]|VE\+|VE-|\s*POSITIVE|\s*NEGATIVE)/);
  if (!m) return '';
  const sign = m[2].includes('-') || m[2].includes('NEGATIVE') ? '-' : '+';
  return `${m[1]}${sign}`;
}

function extractPhoneOrOrderIdHint(text: string): string {
  const orderMatch = text.match(/RUI[-_\s]*\d+/i);
  if (orderMatch) return orderMatch[0].replace(/\s+/g, '').toUpperCase();
  const phoneMatch = text.match(/01\d{9}/);
  if (phoneMatch) return phoneMatch[0];
  return text.trim().slice(0, 60);
}

const CHAT_ROUTING_QUESTIONS = {
  intent: {
    type: 'choice',
    instructions: 'Classify what the Rajshahi University website visitor wants in their latest message.',
    criteria: {
      blood_donor: 'Asking for blood group donors, emergency blood, 90-day eligibility, or donor phone numbers.',
      department_teachers: 'Asking about RU departments, faculty buildings, seat counts, or university teachers/professors contacts.',
      product_order: 'Asking about hoodies, jerseys, t-shirts, khejurer gur, naru prices, stock, or wanting to place a shop order.',
      order_tracking: 'Asking to track an existing order status, rider assignment, delivery state, or cancel an order.',
      campus_map_news: 'Asking about RU campus spots, Paris Road, Rajshahi map locations, student clubs, or Inside RU news/articles.',
      general_faq: 'General greeting, rules, website overview, or open question.',
    },
  },
  is_urgent: {
    type: 'noul',
    instructions: 'Is this message urgent (e.g. immediate emergency blood need or urgent delivery issue)?',
  },
  needs_live_tools: {
    type: 'noul',
    instructions: 'Does answering accurately require looking up live database records (donors, prices, orders, teachers)?',
  },
};

/** Classify latest user message via `typesafe/jev-1.14` and pre-fetch matching live website data cleanly. */
export async function routeChatIntentWithJev(
  userMessage: string,
  aiConfig?: AiConfig
): Promise<JevDecisionRouteResult | null> {
  if (!aiConfig?.decisionRouterEnabled) return null;

  const { apiKey, model } = resolveDecisionCredentials(aiConfig);
  if (!apiKey) return null;

  try {
    const { answers, latencyMs } = await callOpenRouterDecision(
      apiKey,
      model,
      `Visitor message (Bengali/English RU campus portal): ${userMessage}`,
      CHAT_ROUTING_QUESTIONS
    );

    const rawChoice = String(answers?.intent?.choice || 'general_faq') as ChatDecisionIntent;
    const intent: ChatDecisionIntent = VALID_INTENTS.includes(rawChoice) ? rawChoice : 'general_faq';
    const confidence = Number(answers?.intent?.confidence ?? answers?.intent?.probabilities?.[intent] ?? 0);
    const isUrgent = Number(answers?.is_urgent?.noul ?? 0) >= 0.6;
    const needsLiveTools = Number(answers?.needs_live_tools?.noul ?? 0) >= 0.5;

    let prefetchedTool: string | undefined;
    let prefetchedData: any;

    if (confidence >= 0.35 || needsLiveTools) {
      if (intent === 'blood_donor') {
        prefetchedTool = 'check_blood_donors';
        prefetchedData = await executeAiTool('check_blood_donors', {
          bloodGroup: extractBloodGroupHint(userMessage),
        });
      } else if (intent === 'department_teachers') {
        prefetchedTool = 'find_department_and_teachers';
        prefetchedData = await executeAiTool('find_department_and_teachers', {
          query: userMessage.slice(0, 60),
        });
      } else if (intent === 'product_order') {
        prefetchedTool = 'search_products';
        prefetchedData = await executeAiTool('search_products', { query: '' });
      } else if (intent === 'order_tracking') {
        const trackQ = extractPhoneOrOrderIdHint(userMessage);
        prefetchedTool = 'track_shop_order';
        prefetchedData = await executeAiTool('track_shop_order', { query: trackQ });
      } else if (intent === 'campus_map_news') {
        prefetchedTool = 'search_campus_and_maps';
        prefetchedData = await executeAiTool('search_campus_and_maps', { query: userMessage.slice(0, 50) });
      }
    }

    return {
      used: true,
      model,
      intent,
      confidence,
      isUrgent,
      needsLiveTools,
      latencyMs,
      prefetchedTool,
      prefetchedData,
      rawAnswers: answers,
    };
  } catch (err: any) {
    // Non-fatal: chat continues seamlessly via primary LLMs even if decision API fails
    return {
      used: false,
      model,
      intent: 'general_faq',
      confidence: 0,
      isUrgent: false,
      needsLiveTools: false,
      latencyMs: 0,
      error: err?.message || 'Decision router unavailable',
    };
  }
}

export async function testJevDecisionEngine(
  aiConfig: AiConfig | undefined,
  overrideKey?: string,
  overrideModel?: string
) {
  const { apiKey, model } = resolveDecisionCredentials(aiConfig, overrideKey, overrideModel);
  if (!apiKey) {
    throw new Error('Decision Router টেস্ট করার জন্য OpenRouter API Key প্রয়োজন।');
  }
  const sampleText = 'আমার জরুরি B+ রক্ত লাগবে, ৯০ দিনের বেশি হয়েছে এমন কতজন আছেন?';
  const { answers, latencyMs } = await callOpenRouterDecision(
    apiKey,
    model,
    `Visitor message: ${sampleText}`,
    CHAT_ROUTING_QUESTIONS
  );
  return {
    model,
    latencyMs,
    intent: answers?.intent?.choice || 'unknown',
    confidence: Number(answers?.intent?.confidence ?? 0),
    isUrgentScore: Number(answers?.is_urgent?.noul ?? 0),
    rawAnswers: answers,
  };
}
