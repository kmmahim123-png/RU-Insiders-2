import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://skqtcsoovtnxxbhtracp.supabase.co';

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_3WeNoqocvLIlLT0xkUZPng_CwIgpFIt';

export const supabase = createClient(supabaseUrl, supabaseKey);
