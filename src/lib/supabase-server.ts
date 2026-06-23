import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Supabase client dùng trong API Route Handlers / Server Components.
 * Đọc session từ cookie (Supabase Auth) thay vì localStorage như client browser.
 *
 * Dùng cho mọi route trong src/app/api/** cần biết user hiện tại là ai
 * (vd: submit quiz, lưu lượt xem planet, lấy profile).
 */
export function createServerSupabaseClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Route Handler trong môi trường read-only (vd: middleware) — bỏ qua
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // bỏ qua
          }
        },
      },
    }
  );
}

/**
 * Supabase client với SERVICE ROLE KEY — bypass RLS hoàn toàn.
 * CHỈ dùng cho các thao tác hệ thống cần quyền cao (vd: admin seed câu hỏi,
 * cron job tính lại leaderboard). KHÔNG BAO GIỜ expose ra client/browser.
 * Yêu cầu biến môi trường SUPABASE_SERVICE_ROLE_KEY (server-only, không có
 * tiền tố NEXT_PUBLIC_).
 */
export function createServiceRoleClient() {
  const { createClient } = require('@supabase/supabase-js');
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
