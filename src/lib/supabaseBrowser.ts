'use client';

import { createClient } from '@supabase/supabase-js';

export const SUPABASE_PUBLIC_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://skqtcsoovtnxxbhtracp.supabase.co';

export const SUPABASE_PUBLIC_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_3WeNoqocvLIlLT0xkUZPng_CwIgpFIt';

export const supabaseBrowser = createClient(SUPABASE_PUBLIC_URL, SUPABASE_PUBLIC_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});
