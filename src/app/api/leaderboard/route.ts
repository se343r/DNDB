import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * GET /api/leaderboard?limit=20
 *
 * Trả về top N user theo điểm (đọc trực tiếp từ view `leaderboard`).
 * Nếu user hiện tại đã đăng nhập nhưng không nằm trong top N,
 * thêm `current_user_rank` riêng để frontend hiển thị "vị trí của bạn".
 */
export async function GET(req: NextRequest) {
  const limit = Math.min(Math.max(Number(req.nextUrl.searchParams.get('limit')) || 20, 1), 100);

  const supabase = createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: top, error } = await supabase
    .from('leaderboard')
    .select('*')
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let currentUserRow = null;
  const isInTop = top?.some((row) => row.user_id === user?.id);

  if (user && !isInTop) {
    const { data: ownRow } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    currentUserRow = ownRow;
  }

  return NextResponse.json({
    leaderboard: top ?? [],
    current_user: top?.find((row) => row.user_id === user?.id) ?? currentUserRow ?? null,
    is_authenticated: !!user,
  });
}
