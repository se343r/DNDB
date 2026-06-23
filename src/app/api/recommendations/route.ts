import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * GET /api/recommendations?planet_id=xxx&count=3
 *
 * Gợi ý rule-based (KHÔNG dùng AI):
 *   Ưu tiên 1 — cùng star_id (lĩnh vực) với planet_id, mà user CHƯA xem
 *   Ưu tiên 2 — cùng star_id nhưng đã xem rồi (fallback nếu thiếu)
 *   Ưu tiên 3 — random từ lĩnh vực khác (đa dạng hoá, tránh nhàm)
 * Logic đầy đủ nằm trong DB function get_recommendations() (xem SQL migration).
 *
 * Nếu không truyền planet_id: trả về gợi ý "khám phá" dựa trên lượt xem
 * gần nhất của user (hoặc random nếu user chưa xem gì / chưa đăng nhập).
 */
export async function GET(req: NextRequest) {
  const planetId = req.nextUrl.searchParams.get('planet_id');
  const count = Math.min(Math.max(Number(req.nextUrl.searchParams.get('count')) || 3, 1), 10);

  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let basePlanetId = planetId;

  // Nếu không có planet_id cụ thể, dùng planet user xem gần nhất làm gốc
  if (!basePlanetId && user) {
    const { data: lastView } = await supabase
      .from('user_planet_views')
      .select('planet_id')
      .eq('user_id', user.id)
      .order('viewed_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    basePlanetId = lastView?.planet_id ?? null;
  }

  // Không có gốc nào để gợi ý theo — trả về vài planet ngẫu nhiên
  if (!basePlanetId) {
    const { data: randomPlanets, error: randErr } = await supabase
      .from('planets')
      .select('id, name, bio, avatar_url, star_id, stars(name, color)')
      .limit(count);

    if (randErr) {
      return NextResponse.json({ error: randErr.message }, { status: 500 });
    }

    return NextResponse.json({
      recommendations: (randomPlanets ?? []).map((p: any) => ({
        id: p.id,
        name: p.name,
        bio: p.bio,
        avatar_url: p.avatar_url,
        star_id: p.star_id,
        star_name: p.stars?.name,
        star_color: p.stars?.color,
        reason: 'Khám phá danh nhân nổi bật',
      })),
      based_on: null,
    });
  }

  const { data, error } = await supabase.rpc('get_recommendations', {
    p_planet_id: basePlanetId,
    p_user_id: user?.id ?? null,
    p_count: count,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    recommendations: data ?? [],
    based_on: basePlanetId,
  });
}

// POST (ghi lại lượt xem planet) nằm ở route riêng:
// /api/recommendations/track-view/route.ts
// — Next.js App Router yêu cầu mỗi path ứng với 1 file route.ts riêng,
// nên không thể gộp GET /api/recommendations và POST /api/recommendations/track-view
// vào cùng 1 file.
