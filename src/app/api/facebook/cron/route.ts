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
      autoPostEnabled: s.facebookAutoPostEnabled !== false,
    };
  } catch {
    return {
      pageId: process.env.FACEBOOK_PAGE_ID || '',
      pageAccessToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN || '',
      autoPostEnabled: true,
    };
  }
}

/**
 * Automated Cron Endpoint for Facebook Daily Posts
 * Can be triggered automatically by Vercel Cron or an external webhook
 */
export async function GET(req: NextRequest) {
  try {
    const creds = await getStoredFacebookCredentials();

    if (!creds.pageId || !creds.pageAccessToken) {
      return NextResponse.json(
        { ok: false, error: 'Facebook Page credentials missing in database' },
        { status: 400 }
      );
    }

    if (!creds.autoPostEnabled) {
      return NextResponse.json(
        { ok: false, message: 'Auto-posting is disabled in admin settings' },
        { status: 200 }
      );
    }

    const { searchParams } = new URL(req.url);
    const requestedPreset = searchParams.get('preset');

    // Determine post type based on explicit param or current UTC hour
    let postType: 'news' | 'blood' | 'bus' | 'directory' = 'news';

    if (requestedPreset && ['news', 'blood', 'bus', 'directory'].includes(requestedPreset)) {
      postType = requestedPreset as any;
    } else {
      const utcHour = new Date().getUTCHours();
      // UTC 2-5 (~08:00 - 11:00 BD) -> blood
      // UTC 6-11 (~12:00 - 17:00 BD) -> news (Admission & Campus Updates)
      // UTC 12-16 (~18:00 - 22:00 BD) -> bus
      if (utcHour >= 2 && utcHour < 6) {
        postType = 'blood';
      } else if (utcHour >= 6 && utcHour < 12) {
        postType = 'news';
      } else {
        postType = 'bus';
      }
    }

    const payload: FbPostPayload = generatePresetCampusPost(postType);
    const result = await publishFacebookPost(creds.pageId, creds.pageAccessToken, payload);

    if (result.ok) {
      return NextResponse.json({
        ok: true,
        type: postType,
        postId: result.postId,
        postUrl: `https://facebook.com/${result.postId}`,
        scheduledAt: new Date().toISOString(),
        message: `✓ Automated daily post (${postType}) published successfully to Facebook Page!`,
      });
    }

    return NextResponse.json(
      { ok: false, type: postType, error: result.error },
      { status: 500 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || 'Internal server error in cron handler' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
