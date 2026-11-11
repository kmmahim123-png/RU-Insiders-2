import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { testJevDecisionEngine } from '@/lib/jevDecision';
import { AiChatMessage, generateRuAiReply, testSingleAiSlot } from '@/lib/aiRunner';
import { AiSlotKey } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action = 'CHAT', messages, password, slot, apiKey, model, customerAccessToken } = body;
    const db = await readDb();
    const aiCfg = db.settings.aiConfig;

    // 1. Admin live test for a single API slot before saving
    if (action === 'TEST_SLOT') {
      const cleanPass = (password || '').trim();
      if (cleanPass !== db.settings.superAdminPassword) {
        return NextResponse.json({ ok: false, error: 'শুধুমাত্র সুপার অ্যাডমিন API টেস্ট করতে পারবেন।' }, { status: 401 });
      }
      try {
        const resOut = await testSingleAiSlot({
          aiCfg,
          slot: slot as AiSlotKey,
          apiKey,
          model,
        });
        return NextResponse.json({ ok: true, ...resOut });
      } catch (testErr: any) {
        return NextResponse.json({ ok: false, error: testErr?.message || 'কানেকশন ব্যর্থ হয়েছে' }, { status: 400 });
      }
    }

    // 1.5 Admin live test for OpenRouter Decisions API (`typesafe/jev-1.14`)
    if (action === 'TEST_DECISION') {
      const cleanPass = (password || '').trim();
      if (cleanPass !== db.settings.superAdminPassword) {
        return NextResponse.json({ ok: false, error: 'শুধুমাত্র সুপার অ্যাডমিন টেস্ট করতে পারবেন।' }, { status: 401 });
      }
      try {
        const resOut = await testJevDecisionEngine(aiCfg, apiKey, model);
        return NextResponse.json({ ok: true, ...resOut });
      } catch (decErr: any) {
        return NextResponse.json(
          { ok: false, error: decErr?.message || 'Decision API টেস্ট ব্যর্থ হয়েছে' },
          { status: 400 }
        );
      }
    }

    // 2. Public Visitor Chat with Automatic 3-Slot Failover + MCP Tools + Optional Jev Pre-Router
    const chatMessages: AiChatMessage[] = Array.isArray(messages) ? messages.slice(-10) : [];
    if (chatMessages.length === 0) {
      return NextResponse.json({ ok: false, error: 'মেসেজ লিখুন।' }, { status: 400 });
    }

    let verifiedCustomer: { email?: string; uid?: string } | null = null;
    if (customerAccessToken) {
      try {
        const { data: uData } = await supabase.auth.getUser(String(customerAccessToken));
        if (uData?.user) {
          verifiedCustomer = { email: uData.user.email || '', uid: uData.user.id };
        }
      } catch {}
    }

    const outcome = await generateRuAiReply({
      db,
      messages: chatMessages,
      verifiedCustomer,
    });

    if (!outcome.ok) {
      return NextResponse.json(
        {
          ok: false,
          notConfigured: outcome.notConfigured,
          error: outcome.error,
          details: outcome.details,
        },
        { status: outcome.notConfigured ? 503 : 502 }
      );
    }

    return NextResponse.json(outcome);
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'AI server error' }, { status: 500 });
  }
}
