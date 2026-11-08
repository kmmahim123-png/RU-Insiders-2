import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://skqtcsoovtnxxbhtracp.supabase.co';

// Clean key to ignore masked secret key with bullets
const secretKey = process.env.SUPABASE_SECRET_KEY || '';
const isValidSecretKey = secretKey.length > 20 && !secretKey.includes('•') && !secretKey.includes('*');

const supabaseKey = isValidSecretKey
  ? secretKey
  : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    'sb_publishable_3WeNoqocvLIlLT0xkUZPng_CwIgpFIt';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export async function checkSupabaseStatus() {
  try {
    const { data, error } = await supabase
      .from('app_state')
      .select('key, updated_at')
      .eq('key', 'main')
      .maybeSingle();

    if (error) {
      // Table doesn't exist yet
      if (error.code === 'PGRST205' || error.message.includes('Could not find the table')) {
        return {
          online: true,
          tableReady: false,
          synced: false,
          error: 'টেবিল (app_state) পাওয়া যায়নি। Supabase SQL Editor-এ টেবিল তৈরি করতে হবে।',
        };
      }
      return {
        online: true,
        tableReady: false,
        synced: false,
        error: error.message,
      };
    }

    return {
      online: true,
      tableReady: true,
      synced: Boolean(data),
      lastUpdated: data?.updated_at || null,
      error: null,
    };
  } catch (err: any) {
    return {
      online: false,
      tableReady: false,
      synced: false,
      error: err.message || 'Supabase সংযোগ ব্যর্থ',
    };
  }
}
