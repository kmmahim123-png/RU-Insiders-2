import { NextRequest, NextResponse } from 'next/server';
import {
  publishFacebookPost,
  generatePresetCampusPost,
  FbPostPayload,
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
        autoPostEnabled: s.facebookAutoPostEnabled !== false,
      };
    }
  } catch {}

  return {
    pageId: process.env.FACEBOOK_PAGE_ID || '',
    pageAccessToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN || '',
    verifyToken: process.env.FACEBOOK_VERIFY_TOKEN || 'rabian_fb_verify_2026',
    autoPostEnabled: true,
  };
}

/**
 * GET Handler: Check Facebook connection status & available presets
 */
export async function GET() {
  const creds = getStoredFacebookCredentials();

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
    const creds = getStoredFacebookCredentials();

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

    if (body.type && ['bus', 'marathon', 'directory', 'merch', 'blood'].includes(body.type)) {
      payload = generatePresetCampusPost(body.type as any);
      // Allow overriding link or image if passed
      if (body.link) payload.link = body.link;
      if (body.imageUrl) payload.imageUrl = body.imageUrl;
    } else if (body.message) {
      payload = {
        message: body.message,
        link: body.link || undefined,
        imageUrl: body.imageUrl || undefined,
      };
    } else {
      return NextResponse.json(
        { ok: false, error: 'পোস্টের ধরন (type) অথবা বার্তা (message) প্রদান করুন।' },
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
