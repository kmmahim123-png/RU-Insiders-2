import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { supabase } from '@/lib/supabase';

const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.webp'];
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per file
const MAX_FILES_PER_REQ = 5;

// In-memory rate limiter for uploads (30 requests per minute per IP)
const uploadRateLimit = new Map<string, { count: number; resetAt: number }>();

export async function POST(req: NextRequest) {
  try {
    // 1. IP Rate Limiting Check
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
               req.headers.get('x-real-ip') ||
               'unknown-uploader';
    const now = Date.now();
    const rateData = uploadRateLimit.get(ip) || { count: 0, resetAt: now + 60000 };

    if (now > rateData.resetAt) {
      rateData.count = 1;
      rateData.resetAt = now + 60000;
    } else {
      rateData.count += 1;
      if (rateData.count > 30) {
        return NextResponse.json(
          { ok: false, error: 'এক মিনিটে অতিরিক্ত ছবি আপলোড করা হয়েছে। কিছুক্ষণ পর চেষ্টা করুন।' },
          { status: 429 }
        );
      }
    }
    uploadRateLimit.set(ip, rateData);

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ ok: false, error: 'কোনো ছবি নির্বাচন করা হয়নি' }, { status: 400 });
    }

    if (files.length > MAX_FILES_PER_REQ) {
      return NextResponse.json(
        { ok: false, error: `একসাথে সর্বোচ্চ ${MAX_FILES_PER_REQ}টি ছবি আপলোড করা যাবে` },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch {}

    const uploadedUrls: string[] = [];

    for (const file of files) {
      // 2. Validate File Size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { ok: false, error: `"${file.name}" ফাইলের সাইজ ৫ মেগাবাইটের বেশি। সর্বোচ্চ ৫MB ফাইল গ্রহণযোগ্য।` },
          { status: 400 }
        );
      }

      // 3. Validate MIME Type & Extension
      let ext = path.extname(file.name).toLowerCase();
      if (!ext || !ALLOWED_EXT.includes(ext)) {
        return NextResponse.json(
          { ok: false, error: `শুধুমাত্র JPG, PNG বা WEBP ছবি গ্রহণযোগ্য` },
          { status: 400 }
        );
      }

      if (file.type && !ALLOWED_MIME.includes(file.type.toLowerCase())) {
        return NextResponse.json(
          { ok: false, error: `অবৈধ ফাইল ফরম্যাট: ${file.type} গ্রহণযোগ্য নয়` },
          { status: 400 }
        );
      }
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
      const safeName = `ru-${Date.now()}-${Math.random().toString(36).slice(2, 7)}${ext}`;

      // 1. Try Supabase Storage 'uploads' bucket
      let uploadedToCloud = false;
      try {
        const { error: sbErr } = await supabase.storage
          .from('uploads')
          .upload(safeName, buffer, { contentType: mime, upsert: true });

        if (!sbErr) {
          const { data: pubUrl } = supabase.storage.from('uploads').getPublicUrl(safeName);
          if (pubUrl?.publicUrl) {
            uploadedUrls.push(pubUrl.publicUrl);
            uploadedToCloud = true;
          }
        }
      } catch {}

      if (uploadedToCloud) continue;

      // 2. Try Local Filesystem (works in local dev)
      let uploadedToFs = false;
      try {
        const filePath = path.join(uploadDir, safeName);
        await fs.writeFile(filePath, buffer);
        uploadedUrls.push(`/uploads/${safeName}`);
        uploadedToFs = true;
      } catch {}

      if (uploadedToFs) continue;

      // 3. Fallback: Base64 Data URL (compressed by browser client to ~100KB)
      const base64 = buffer.toString('base64');
      uploadedUrls.push(`data:${mime};base64,${base64}`);
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json({ ok: false, error: 'ছবি প্রসেস করা সম্ভব হয়নি' }, { status: 400 });
    }

    return NextResponse.json({ ok: true, urls: uploadedUrls });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || 'আপলোড ব্যর্থ হয়েছে' }, { status: 500 });
  }
}
