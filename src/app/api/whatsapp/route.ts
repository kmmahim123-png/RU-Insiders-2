import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { AiChatMessage, generateRuAiReply } from '@/lib/aiRunner';

export const dynamic = 'force-dynamic';

const MAX_HISTORY_PER_PHONE = 8;
const MAX_TRACKED_PHONES = 100;

function sanitizePhoneKey(rawPhone: string): string {
  const digits = String(rawPhone || '').replace(/\D/g, '');
  return digits || String(rawPhone || '').trim() || 'unknown';
}

function buildWhatsAppChannelHint(phone: string, senderName?: string): string {
  return `কাস্টমার এখন সরাসরি WhatsApp-এ চ্যাট করছেন${
    senderName ? ` (প্রোফাইল নাম: ${senderName})` : ''
  }। কাস্টমারের WhatsApp নম্বর: ${phone}। অর্ডার নিলে এবং কাস্টমার আলাদা ফোন নম্বর না দিলে এই WhatsApp নম্বরটি ব্যবহার করতে পারো। WhatsApp-এ সহজে পড়ার উপযোগী পরিষ্কার, সংক্ষিপ্ত ও বুলেট-পয়েন্ট ফরম্যাটে উত্তর দাও।`;
}

async function savePhoneTurn(phoneKey: string, userText: string, assistantText: string) {
  const now = new Date().toISOString();
  await writeDb((state) => {
    const existing = { ...(state.whatsappSessions || {}) };
    const prevList = existing[phoneKey] || [];
    const updatedList = [
      ...prevList,
      { role: 'user' as const, content: userText, updatedAt: now },
      { role: 'assistant' as const, content: assistantText, updatedAt: now },
    ].slice(-MAX_HISTORY_PER_PHONE);

    existing[phoneKey] = updatedList;

    // Trim oldest phone keys cleanly to keep cloud payload bounded
    const keys = Object.keys(existing);
    if (keys.length > MAX_TRACKED_PHONES) {
      keys.sort((a, b) => {
        const la = existing[a]?.slice(-1)[0]?.updatedAt || '';
        const lb = existing[b]?.slice(-1)[0]?.updatedAt || '';
        return lb.localeCompare(la);
      });
      const keepSet = new Set(keys.slice(0, MAX_TRACKED_PHONES));
      for (const k of keys) {
        if (!keepSet.has(k)) delete existing[k];
      }
    }

    return { ...state, whatsappSessions: existing };
  });
}

async function sendMetaCloudReply(params: {
  phoneNumberId: string;
  accessToken: string;
  to: string;
  bodyText: string;
}) {
  const { phoneNumberId, accessToken, to, bodyText } = params;
  const res = await fetch(`https://graph.facebook.com/v21.0/${encodeURIComponent(phoneNumberId)}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: {
        preview_url: false,
        body: bodyText.slice(0, 4000),
      },
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Meta Cloud API HTTP ${res.status}: ${errText.slice(0, 180)}`);
  }
  return res.json();
}

/**
 * GET /api/whatsapp
 * 1) Meta Cloud API Webhook challenge verification (`hub.mode=subscribe`)
 * 2) Safe public configuration health status
 */
export async function GET(req: NextRequest) {
  const db = await readDb();
  const aiCfg = db.settings.aiConfig;

  const mode = req.nextUrl.searchParams.get('hub.mode');
  const token = req.nextUrl.searchParams.get('hub.verify_token');
  const challenge = req.nextUrl.searchParams.get('hub.challenge');

  if (mode === 'subscribe' && challenge !== null) {
    const expectedToken = (aiCfg?.whatsappVerifyToken || 'ru-insiders-wa-verify').trim();
    if (token && token === expectedToken) {
      return new NextResponse(challenge, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
    return NextResponse.json({ ok: false, error: 'Invalid verify_token' }, { status: 403 });
  }

  return NextResponse.json({
    ok: true,
    enabled: aiCfg?.whatsappAgentEnabled !== false,
    metaCloudConfigured: Boolean(aiCfg?.whatsappPhoneNumberId?.trim() && aiCfg?.whatsappAccessToken?.trim()),
    bridgeSecretEnabled: Boolean(aiCfg?.whatsappBridgeSecret?.trim()),
    activeConversationCount: Object.keys(db.whatsappSessions || {}).length,
    webhookPath: '/api/whatsapp',
  });
}

/**
 * POST /api/whatsapp
 * Supports:
 * 1) Super Admin live simulator (`action: 'TEST_WHATSAPP_AGENT'`)
 * 2) Official Meta WhatsApp Cloud API webhook (`body.object === 'whatsapp_business_account'`)
 * 3) Generic QR-bot / n8n / WAHA / Evolution bridge (`{ from, message, senderName?, bridgeSecret? }`)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = await readDb();
    const aiCfg = db.settings.aiConfig;

    // 1. Admin Live WhatsApp Agent Simulator
    if (body?.action === 'TEST_WHATSAPP_AGENT') {
      const cleanPass = String(body.password || '').trim();
      if (cleanPass !== db.settings.superAdminPassword) {
        return NextResponse.json({ ok: false, error: 'শুধুমাত্র সুপার অ্যাডমিন টেস্ট করতে পারবেন।' }, { status: 401 });
      }
      const testMessage = String(body.message || 'আপনার দোকানে কী কী হুডি আছে ও দাম কত?').trim();
      const testPhone = String(body.phone || '8801700000000').trim();
      const outcome = await generateRuAiReply({
        db,
        messages: [{ role: 'user', content: testMessage }],
        extraSystemHint: buildWhatsAppChannelHint(testPhone, 'টেস্ট কাস্টমার'),
      });
      if (!outcome.ok) {
        return NextResponse.json({ ok: false, error: outcome.error }, { status: 400 });
      }
      return NextResponse.json({
        ok: true,
        reply: outcome.reply,
        usedTools: outcome.usedTools,
        createdOrderId: outcome.createdOrderId,
        providerLabel: outcome.providerLabel,
        modelUsed: outcome.modelUsed,
        metaCloudConfigured: Boolean(aiCfg?.whatsappPhoneNumberId?.trim() && aiCfg?.whatsappAccessToken?.trim()),
      });
    }

    if (aiCfg?.whatsappAgentEnabled === false) {
      return NextResponse.json({ ok: true, skipped: 'WhatsApp AI agent disabled by admin' });
    }

    // 2. Official Meta WhatsApp Cloud API Webhook
    if (body?.object === 'whatsapp_business_account') {
      const value = body?.entry?.[0]?.changes?.[0]?.value;
      const incomingMsg = value?.messages?.[0];
      if (!incomingMsg) {
        // Delivery/read status callback
        return NextResponse.json({ ok: true, status: 'ignored_status_event' });
      }

      const fromPhone = String(incomingMsg.from || '').trim();
      const senderName = String(value?.contacts?.[0]?.profile?.name || '').trim();
      const textBody = String(
        incomingMsg.text?.body ||
          incomingMsg.interactive?.button_reply?.title ||
          incomingMsg.interactive?.list_reply?.title ||
          incomingMsg.button?.text ||
          ''
      ).trim();

      if (!fromPhone || !textBody) {
        return NextResponse.json({ ok: true, status: 'unsupported_non_text_message' });
      }

      const phoneKey = sanitizePhoneKey(fromPhone);
      const prevTurns: AiChatMessage[] = (db.whatsappSessions?.[phoneKey] || []).map((t) => ({
        role: t.role,
        content: t.content,
      }));
      const chatMessages: AiChatMessage[] = [...prevTurns, { role: 'user', content: textBody }];

      const outcome = await generateRuAiReply({
        db,
        messages: chatMessages,
        extraSystemHint: buildWhatsAppChannelHint(fromPhone, senderName),
      });

      const replyText = outcome.ok
        ? outcome.reply
        : 'দুঃখিত, এই মুহূর্তে আমার সিস্টেমে সাময়িক সমস্যা হচ্ছে। অনুগ্রহ করে একটু পর আবার মেসেজ দিন বা সরাসরি কল করুন।';

      await savePhoneTurn(phoneKey, textBody, replyText);

      const phoneNumberId =
        (aiCfg?.whatsappPhoneNumberId || '').trim() || String(value?.metadata?.phone_number_id || '').trim();
      const accessToken = (aiCfg?.whatsappAccessToken || '').trim();

      if (phoneNumberId && accessToken) {
        try {
          await sendMetaCloudReply({
            phoneNumberId,
            accessToken,
            to: fromPhone,
            bodyText: replyText,
          });
        } catch (sendErr: any) {
          return NextResponse.json({
            ok: false,
            error: sendErr?.message || 'Meta reply failed',
            generatedReply: replyText,
          });
        }
      }

      return NextResponse.json({
        ok: true,
        replied: Boolean(phoneNumberId && accessToken),
        createdOrderId: outcome.ok ? outcome.createdOrderId : null,
      });
    }

    // 3. Generic Bridge API for QR Bots / n8n / WAHA / Evolution API
    const expectedSecret = (aiCfg?.whatsappBridgeSecret || '').trim();
    if (expectedSecret) {
      const authHeader = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
      const provided = authHeader || String(body?.bridgeSecret || '').trim();
      if (provided !== expectedSecret) {
        return NextResponse.json({ ok: false, error: 'Unauthorized WhatsApp bridge secret.' }, { status: 401 });
      }
    }

    const from = String(body?.from || '').trim();
    const message = String(body?.message || '').trim();
    const senderName = String(body?.senderName || '').trim();
    if (!from || !message) {
      return NextResponse.json(
        { ok: false, error: 'Invalid WhatsApp payload: `from` and `message` required.' },
        { status: 400 }
      );
    }

    const phoneKey = sanitizePhoneKey(from);
    const prevTurns: AiChatMessage[] = (db.whatsappSessions?.[phoneKey] || []).map((t) => ({
      role: t.role,
      content: t.content,
    }));
    const outcome = await generateRuAiReply({
      db,
      messages: [...prevTurns, { role: 'user', content: message }],
      extraSystemHint: buildWhatsAppChannelHint(from, senderName),
    });

    if (!outcome.ok) {
      return NextResponse.json({ ok: false, error: outcome.error, details: outcome.details }, { status: 502 });
    }

    await savePhoneTurn(phoneKey, message, outcome.reply);

    return NextResponse.json({
      ok: true,
      reply: outcome.reply,
      usedTools: outcome.usedTools,
      createdOrderId: outcome.createdOrderId,
      providerLabel: outcome.providerLabel,
      modelUsed: outcome.modelUsed,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'WhatsApp webhook error' }, { status: 500 });
  }
}
