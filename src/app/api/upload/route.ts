import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { supabase } from '@/lib/supabase';

const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.webp'];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ ok: false, error: 'কোনো ছবি নির্বাচন করা হয়নি' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch {}

    const uploadedUrls: string[] = [];

    for (const file of files) {
      let ext = path.extname(file.name).toLowerCase();
      if (!ext || !ALLOWED_EXT.includes(ext)) {
        ext = '.webp';
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
