import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * GET /api/quiz/questions?star_id=xxx&count=10
 *
 * Trả về N câu hỏi ngẫu nhiên, KHÔNG bao gồm correct_index (chống cheat).
 * Đồng thời tạo một quiz_session mới và trả về session_id để client
 * dùng cho các request submit-answer / finish tiếp theo.
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  let starId = searchParams.get('star_id') || null;
  // Sanitize parameter to avoid 'null' or 'undefined' string comparisons in database
  if (!starId || starId === 'null' || starId === 'undefined' || !starId.trim()) {
    starId = null;
  }
  const count = Math.min(Math.max(Number(searchParams.get('count')) || 10, 1), 20);

  const supabase = createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Lấy câu hỏi ngẫu nhiên qua DB function (an toàn — không trả correct_index)
  const { data: questions, error: qError } = await supabase.rpc('get_random_questions', {
    p_star_id: starId,
    p_count: count,
  });

  if (qError) {
    return NextResponse.json({ error: qError.message }, { status: 500 });
  }

  if (!questions || questions.length === 0) {
    return NextResponse.json(
      { error: 'Không có câu hỏi khả dụng cho lựa chọn này' },
      { status: 404 }
    );
  }

  // 2. Tạo session mới — user_id null nếu chưa đăng nhập (chơi ẩn danh, không lên BXH)
  const { data: session, error: sError } = await supabase
    .from('quiz_sessions')
    .insert({
      user_id: user?.id ?? null,
      total_questions: questions.length,
    })
    .select('id, started_at')
    .single();

  if (sError) {
    return NextResponse.json({ error: sError.message }, { status: 500 });
  }

  return NextResponse.json({
    session_id: session.id,
    questions,
    is_authenticated: !!user,
  });
}
