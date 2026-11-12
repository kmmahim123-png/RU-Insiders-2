import { NextRequest, NextResponse } from 'next/server';
import { sendMetaWhatsappTemplate, sendMetaWhatsappText } from '@/lib/metaWhatsapp';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { toPhone, type, templateName, languageCode, message } = body;

    if (!toPhone) {
      return NextResponse.json({ ok: false, error: 'Recipient phone number is required' }, { status: 400 });
    }

    if (type === 'text') {
      if (!message) {
        return NextResponse.json({ ok: false, error: 'Message body is required for text type' }, { status: 400 });
      }
      const res = await sendMetaWhatsappText(toPhone, message);
      return NextResponse.json({ ok: res.success, data: res.data, error: res.error });
    }

    // Default: template message
    const res = await sendMetaWhatsappTemplate(toPhone, templateName || 'hello_world', languageCode || 'en_US');
    return NextResponse.json({ ok: res.success, data: res.data, error: res.error });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}
