import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * GET /api/auth/callback?code=xxx
 *
 * Supabase Auth redirect về đây sau khi user đăng nhập qua Google OAuth
 * hoặc xác nhận email. Đổi `code` lấy session, rồi redirect về trang chủ.
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const redirectTo = req.nextUrl.searchParams.get('redirect_to') || '/catalog';

  if (code) {
    const supabase = createServerSupabaseClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(redirectTo, req.url));
}
