import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

interface FinishBody {
  session_id: string;
}

/**
 * POST /api/quiz/finish
 * Body: { session_id }
 *
 * Đóng session, tính tổng điểm, và NẾU user đã đăng nhập thì cộng điểm
 * + cập nhật streak vào bảng profiles (qua DB function finish_quiz_session).
 * Trả về kết quả tổng kết để hiển thị màn hình "Hoàn thành thử thách".
 */
export async function POST(req: NextRequest) {
  let body: FinishBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body không hợp lệ' }, { status: 400 });
  }

  if (!body.session_id) {
    return NextResponse.json({ error: 'Thiếu session_id' }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase.rpc('finish_quiz_session', {
    p_session_id: body.session_id,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const result = data?.[0];
  if (!result) {
    return NextResponse.json({ error: 'Session không tồn tại hoặc đã đóng' }, { status: 404 });
  }

  return NextResponse.json({
    score: result.score,
    total_questions: result.total_questions,
    points_earned: result.points_earned,
    new_total_points: result.new_total_points, // null nếu chơi ẩn danh
    new_streak: result.new_streak,
  });
}
