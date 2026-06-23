import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * POST /api/recommendations/track-view
 * Body: { planet_id }
 *
 * Ghi lại lượt xem planet của user đã đăng nhập — dùng làm input
 * cho recommendation engine (GET /api/recommendations).
 * Bỏ qua im lặng nếu user chưa đăng nhập — xem ẩn danh là hành vi hợp lệ,
 * chỉ là sẽ không cá nhân hoá được gợi ý.
 */
export async function POST(req: NextRequest) {
  let body: { planet_id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body không hợp lệ' }, { status: 400 });
  }

  if (!body.planet_id) {
    return NextResponse.json({ error: 'Thiếu planet_id' }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ tracked: false, reason: 'not_authenticated' });
  }

  const { error } = await supabase
    .from('user_planet_views')
    .upsert(
      { user_id: user.id, planet_id: body.planet_id, viewed_at: new Date().toISOString() },
      { onConflict: 'user_id,planet_id' }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tracked: true });
}
