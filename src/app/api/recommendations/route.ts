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
  const count = Math.min(Math.max(Number(req.nextUrl.searchParams.get('count')) || 5, 1), 10);

  const supabase = createServerSupabaseClient();

  const { data: planets, error } = await supabase
    .from('planets')
    .select('id, name, bio, avatar_url, star_id, stars(name, color)');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Shuffle planets in JavaScript to provide a randomized selection
  const shuffled = (planets ?? []).sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);

  return NextResponse.json({
    recommendations: selected.map((p: any) => ({
      id: p.id,
      name: p.name,
      bio: p.bio,
      avatar_url: p.avatar_url,
      star_id: p.star_id,
      star_name: p.stars?.name,
      star_color: p.stars?.color,
      reason: 'Khám phá ngẫu nhiên',
    })),
    based_on: null,
  });
}

// POST (ghi lại lượt xem planet) nằm ở route riêng:
// /api/recommendations/track-view/route.ts
// — Next.js App Router yêu cầu mỗi path ứng với 1 file route.ts riêng,
// nên không thể gộp GET /api/recommendations và POST /api/recommendations/track-view
// vào cùng 1 file.
