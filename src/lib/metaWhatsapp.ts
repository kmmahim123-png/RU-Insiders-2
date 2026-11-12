/**
 * Meta WhatsApp Cloud API Integration for Rabian Platform
 * Based on Meta Graph API v21.0
 */

import { readDb } from '@/lib/db';

export interface MetaWhatsappConfig {
  phoneNumberId: string;
  businessAccountId: string;
  accessToken: string;
}

export const DEFAULT_META_CONFIG: MetaWhatsappConfig = {
  phoneNumberId: process.env.META_WHATSAPP_PHONE_NUMBER_ID || '1457167637475986',
  businessAccountId: process.env.META_WHATSAPP_ACCOUNT_ID || '1754655413326949',
  accessToken: process.env.META_WHATSAPP_ACCESS_TOKEN || '',
};

/**
 * Normalizes phone numbers to Meta international format (e.g. "017XXXXXXXX" -> "88017XXXXXXXX")
 */
export function normalizeMetaPhone(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.startsWith('880')) return digits;
  if (digits.startsWith('0')) return `88${digits}`;
  if (digits.length === 10) return `880${digits}`;
  return digits;
}

/**
 * Send pre-approved Meta WhatsApp Template message (e.g. 'hello_world')
 */
export async function sendMetaWhatsappTemplate(
  toPhone: string,
  templateName: string = 'hello_world',
  languageCode: string = 'en_US'
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const db = await readDb();
    const config = {
      phoneNumberId: db.settings?.metaWhatsappPhoneNumberId || DEFAULT_META_CONFIG.phoneNumberId,
      accessToken: db.settings?.metaWhatsappAccessToken || DEFAULT_META_CONFIG.accessToken,
    };

    if (!config.accessToken) {
      return {
        success: false,
        error: 'Meta WhatsApp Access Token প্রদান করা হয়নি। অনুগ্রহ করে সেটিংসে টোকেন যুক্ত করুন।',
      };
    }

    const recipient = normalizeMetaPhone(toPhone);
    const endpoint = `https://graph.facebook.com/v21.0/${config.phoneNumberId}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      to: recipient,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
      },
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok && data?.messages?.[0]?.id) {
      return { success: true, data };
    }
    return { success: false, error: data?.error?.message || 'মেসেজ পাঠানো ব্যর্থ হয়েছে', data };
  } catch (err: any) {
    return { success: false, error: err?.message || 'নেটওয়ার্ক এরর' };
  }
}

/**
 * Send regular freeform WhatsApp Text Message (Requires an active 24h conversation window)
 */
export async function sendMetaWhatsappText(
  toPhone: string,
  text: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const db = await readDb();
    const config = {
      phoneNumberId: db.settings?.metaWhatsappPhoneNumberId || DEFAULT_META_CONFIG.phoneNumberId,
      accessToken: db.settings?.metaWhatsappAccessToken || DEFAULT_META_CONFIG.accessToken,
    };

    if (!config.accessToken) {
      return { success: false, error: 'Access token missing' };
    }

    const recipient = normalizeMetaPhone(toPhone);
    const endpoint = `https://graph.facebook.com/v21.0/${config.phoneNumberId}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipient,
      type: 'text',
      text: { preview_url: true, body: text },
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok && data?.messages?.[0]?.id) {
      return { success: true, data };
    }
    return { success: false, error: data?.error?.message || 'মেসেজ পাঠানো যায়নি', data };
  } catch (err: any) {
    return { success: false, error: err?.message || 'নেটওয়ার্ক এরর' };
  }
}
