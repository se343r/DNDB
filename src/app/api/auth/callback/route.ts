import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * GET /api/auth/callback?code=xxx&redirect_to=/catalog
 *
 * FIX: Validate redirect_to — chỉ cho phép path nội bộ (bắt đầu bằng /)
 * Ngăn Open Redirect attack: attacker không redirect được sang domain ngoài
 */
export async function GET(req: NextRequest) {
  const code       = req.nextUrl.searchParams.get('code');
  const redirectTo = req.nextUrl.searchParams.get('redirect_to') || '/catalog';

  // ── Validate: chỉ chấp nhận path nội bộ ──────────────────────────────────
  // Path hợp lệ: bắt đầu bằng / và KHÔNG chứa // (tránh //evil.com)
  const isSafePath = redirectTo.startsWith('/')
    && !redirectTo.startsWith('//')
    && !redirectTo.includes('://');

  const safeRedirect = isSafePath ? redirectTo : '/catalog';

  if (code) {
    const supabase = createServerSupabaseClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(safeRedirect, req.url));
}
