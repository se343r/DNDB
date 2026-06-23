import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

/**
 * Client Supabase dùng trong Client Components ('use client').
 * Đổi từ createClient() (supabase-js thuần, lưu session ở localStorage)
 * sang createBrowserClient() (@supabase/ssr, lưu session ở cookie)
 * để session đồng bộ được với API routes chạy server-side — bắt buộc
 * cho luồng Supabase Auth hoạt động đúng trong Next.js App Router.
 *
 * Component cũ gọi `supabase.from(...)` vẫn hoạt động y hệt — API
 * không đổi, chỉ đổi cách lưu trữ session.
 */
export const supabase = isSupabaseConfigured
  ? createBrowserClient(supabaseUrl!, supabaseAnonKey!)
  : null;
