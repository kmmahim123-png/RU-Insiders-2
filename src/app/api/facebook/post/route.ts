import { NextRequest, NextResponse } from 'next/server';
import {
  publishFacebookPost,
  generatePresetCampusPost,
  FbPostPayload,
} from '@/lib/metaFacebook';
import { readDb } from '@/lib/db';

async function getStoredFacebookCredentials() {
  try {
    const db = await readDb();
    const s = db.settings || ({} as any);
    return {
      pageId: process.env.FACEBOOK_PAGE_ID || s.facebookPageId || '',
      pageAccessToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN || s.facebookPageAccessToken || '',
      verifyToken: process.env.FACEBOOK_VERIFY_TOKEN || s.facebookVerifyToken || 'rabian_fb_verify_2026',
      autoPostEnabled: s.facebookAutoPostEnabled !== false,
    };
  } catch {
    return {
      pageId: process.env.FACEBOOK_PAGE_ID || '',
      pageAccessToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN || '',
      verifyToken: process.env.FACEBOOK_VERIFY_TOKEN || 'rabian_fb_verify_2026',
      autoPostEnabled: true,
    };
  }
}

/**
 * GET Handler: Check Facebook connection status & available presets
 */
export async function GET() {
  const creds = await getStoredFacebookCredentials();

  return NextResponse.json({
    ok: true,
    isConfigured: Boolean(creds.pageId && creds.pageAccessToken),
    pageId: creds.pageId ? `${creds.pageId.slice(0, 4)}••••${creds.pageId.slice(-4)}` : null,
    verifyToken: creds.verifyToken,
    webhookUrl: 'https://rabian.site/api/facebook/webhook',
    presets: ['bus', 'marathon', 'directory', 'merch', 'blood'],
  });
}

/**
 * POST Handler: Publish a post to Facebook Page
 * Accepts preset type or custom message/link/image
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const creds = await getStoredFacebookCredentials();

    const pageId = body.pageId || creds.pageId;
    const accessToken = body.accessToken || creds.pageAccessToken;

    if (!pageId || !accessToken) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Facebook Page ID অথবা Access Token পাওয়া যায়নি। অনুগ্রহ করে অ্যাডমিন প্যানেলে টোকেন যুক্ত করুন।',
        },
        { status: 400 }
      );
    }

    let payload: FbPostPayload;

    if (body.type && ['bus', 'directory', 'merch', 'blood'].includes(body.type)) {
      payload = generatePresetCampusPost(body.type as any);
      if (body.link) payload.link = body.link;
      if (body.imageUrl) payload.imageUrl = body.imageUrl;
    } else if (body.type === 'marathon') {
      // Safety guard: Marathon post is blocked when no active marathon event is running
      return NextResponse.json(
        { ok: false, error: 'বর্তমানে কোনো সক্রিয় ম্যারাথন ইভেন্ট চলমান নেই। অযথা পোস্ট করা স্থগিত রাখা হয়েছে।' },
        { status: 400 }
      );
    } else if (body.message) {
      const msg = body.message.trim();
      // Safety Guard: Block test, spam, or nonsense dummy posts from publishing to live page
      if (msg.length < 15 || /^(test|testing|check|hello|hi|asdf|demo)$/i.test(msg)) {
        return NextResponse.json(
          { ok: false, error: 'অসম্পূর্ণ, ডামি বা পরীক্ষামূলক পোস্ট ফেসবুক পেজে প্রকাশ করা নিষিদ্ধ। অর্থপূর্ণ বার্তা প্রদান করুন।' },
          { status: 400 }
        );
      }
      payload = {
        message: msg,
        link: body.link || undefined,
        imageUrl: body.imageUrl || undefined,
      };
    } else {
      return NextResponse.json(
        { ok: false, error: 'পোস্টের সঠিক ধরন (bus, directory, blood, merch) অথবা অর্থপূর্ণ বার্তা প্রদান করুন।' },
        { status: 400 }
      );
    }

    const result = await publishFacebookPost(pageId, accessToken, payload);

    if (result.ok) {
      return NextResponse.json({
        ok: true,
        postId: result.postId,
        postUrl: `https://facebook.com/${result.postId}`,
        message: '✓ পোস্ট সফলভাবে ফেসবুক পেজে প্রকাশিত হয়েছে!',
      });
    }

    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || 'সার্ভারে ত্রুটি হয়েছে' }, { status: 500 });
  }
}
