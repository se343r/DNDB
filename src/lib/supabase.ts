import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = typeof window !== 'undefined'
  ? !!(supabaseUrl && supabaseAnonKey)
  : !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const supabase = isSupabaseConfigured
  ? createClient(
      (supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL)!,
      (supabaseAnonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!
    )
  : null;
