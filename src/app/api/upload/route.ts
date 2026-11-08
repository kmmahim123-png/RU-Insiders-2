import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.webp'];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ ok: false, error: 'কোনো ছবি নির্বাচন করা হয়নি' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const ext = path.extname(file.name).toLowerCase();
      if (!ALLOWED_EXT.includes(ext)) {
        continue;
      }
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Binary Magic Byte Verification (JPEG, PNG, WEBP)
      const isJpeg = buffer.length > 2 && buffer[0] === 0xff && buffer[1] === 0xd8;
      const isPng = buffer.length > 3 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
      const isWebp = buffer.length > 11 && buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 && buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;

      if (!isJpeg && !isPng && !isWebp) {
        continue;
      }

      const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
      const safeName = `ru-${Date.now()}-${Math.random().toString(36).slice(2, 7)}${ext}`;
      const filePath = path.join(uploadDir, safeName);

      try {
        await fs.writeFile(filePath, buffer);
        uploadedUrls.push(`/uploads/${safeName}`);
      } catch {
        // Fallback for Vercel Serverless read-only environment: Base64 Data URL
        const base64 = buffer.toString('base64');
        uploadedUrls.push(`data:${mime};base64,${base64}`);
      }
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json({ ok: false, error: 'সঠিক ফরম্যাটের ছবি আপলোড করুন (.jpg, .png, .webp)' }, { status: 400 });
    }

    return NextResponse.json({ ok: true, urls: uploadedUrls });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || 'আপলোড ব্যর্থ হয়েছে' }, { status: 500 });
  }
}
