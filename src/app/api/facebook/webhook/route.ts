import { NextRequest, NextResponse } from 'next/server';
import {
  generateSmartFacebookReply,
  sendFacebookMessengerReply,
  replyToFacebookComment,
} from '@/lib/metaFacebook';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'ruStoreData.json');

function getStoredFacebookCredentials() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
      const s = data.settings || {};
      return {
        pageId: process.env.FACEBOOK_PAGE_ID || s.facebookPageId || '',
        pageAccessToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN || s.facebookPageAccessToken || '',
        verifyToken: process.env.FACEBOOK_VERIFY_TOKEN || s.facebookVerifyToken || 'rabian_fb_verify_2026',
        autoReplyEnabled: s.facebookMessengerReplyEnabled !== false,
      };
    }
  } catch {}

  return {
    pageId: process.env.FACEBOOK_PAGE_ID || '',
    pageAccessToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN || '',
    verifyToken: process.env.FACEBOOK_VERIFY_TOKEN || 'rabian_fb_verify_2026',
    autoReplyEnabled: true,
  };
}

/**
 * GET Handler: Meta Webhook Verification Handshake
 * Meta sends hub.mode, hub.verify_token, and hub.challenge
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const { verifyToken } = getStoredFacebookCredentials();

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('[Meta Webhook] Successfully verified webhook handshake.');
    return new Response(challenge || '', { status: 200 });
  }

  return new Response('Verification failed. Invalid verify token.', { status: 403 });
}

/**
 * POST Handler: Real-time Meta Messenger & Comment Events
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.object !== 'page') {
      return NextResponse.json({ error: 'Not a page event' }, { status: 404 });
    }

    const { pageAccessToken, pageId, autoReplyEnabled } = getStoredFacebookCredentials();

    if (!pageAccessToken || !autoReplyEnabled) {
      // Return 200 OK to Meta even if automation is temporarily muted in Admin settings
      return NextResponse.json({ status: 'Muted or unconfigured' }, { status: 200 });
    }

    // Process each entry in the webhook batch
    for (const entry of body.entry || []) {
      // 1. Handle Messenger Messages (DMs)
      if (Array.isArray(entry.messaging)) {
        for (const event of entry.messaging) {
          const senderId = event.sender?.id;
          const userMessage = event.message?.text;
          const isEcho = event.message?.is_echo;

          // Only reply to genuine incoming messages from students (ignore echo/bot messages)
          if (senderId && userMessage && !isEcho && senderId !== pageId) {
            const aiReply = generateSmartFacebookReply(userMessage);
            await sendFacebookMessengerReply(pageAccessToken, senderId, aiReply);
          }
        }
      }

      // 2. Handle Feed Comments (Auto-reply on public page posts)
      if (Array.isArray(entry.changes)) {
        for (const change of entry.changes) {
          if (change.field === 'feed') {
            const val = change.value;
            const isNewComment = val?.item === 'comment' && val?.verb === 'add';
            const commentId = val?.comment_id;
            const senderId = val?.from?.id;
            const commentText = val?.message;

            // Only reply to students, never to the page itself
            if (isNewComment && commentId && commentText && senderId !== pageId) {
              const aiReply = generateSmartFacebookReply(commentText);
              await replyToFacebookComment(pageAccessToken, commentId, aiReply);
            }
          }
        }
      }
    }

    return NextResponse.json({ status: 'EVENT_RECEIVED' }, { status: 200 });
  } catch (err: any) {
    console.error('[Meta Webhook Error]', err);
    return NextResponse.json({ status: 'ERROR', message: err.message }, { status: 200 });
  }
}
