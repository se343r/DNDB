import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

interface SubmitAnswerBody {
  session_id: string;
  question_id: string;
  selected_index: number;
  time_spent_ms?: number;
}

/**
 * POST /api/quiz/answer
 * Body: { session_id, question_id, selected_index, time_spent_ms? }
 *
 * Chấm điểm 1 câu trả lời server-side, ghi vào quiz_answers,
 * trả về is_correct + correct_index + explanation.
 * Đây là lần DUY NHẤT client biết đáp án đúng — sau khi đã trả lời.
 */
export async function POST(req: NextRequest) {
  let body: SubmitAnswerBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body không hợp lệ' }, { status: 400 });
  }

  const { session_id, question_id, selected_index, time_spent_ms } = body;

  if (!session_id || !question_id || selected_index === undefined) {
    return NextResponse.json(
      { error: 'Thiếu session_id, question_id hoặc selected_index' },
      { status: 400 }
    );
  }

  // Loại bỏ check strict 0-3 vì selected_index có thể được convert sang 1-based
  if (selected_index < 0) {
    return NextResponse.json({ error: 'selected_index không hợp lệ' }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();

  // Xác thực session thuộc về user hiện tại (hoặc là session ẩn danh)
  const { data: sessionRow, error: sessionErr } = await supabase
    .from('quiz_sessions')
    .select('id, completed_at')
    .eq('id', session_id)
    .single();

  if (sessionErr || !sessionRow) {
    return NextResponse.json({ error: 'Session không tồn tại' }, { status: 404 });
  }

  if (sessionRow.completed_at) {
    return NextResponse.json({ error: 'Session đã hoàn thành, không thể trả lời thêm' }, { status: 409 });
  }

  const { data, error } = await supabase.rpc('submit_quiz_answer', {
    p_session_id: session_id,
    p_question_id: question_id,
    p_selected_index: selected_index + 1, // Convert 0-based to 1-based cho DB
    p_time_spent_ms: time_spent_ms ?? null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const result = data?.[0];
  if (!result) {
    return NextResponse.json({ error: 'Không thể chấm điểm câu trả lời' }, { status: 500 });
  }

  return NextResponse.json({
    is_correct: result.is_correct,
    correct_index: result.correct_index - 1, // Convert 1-based từ DB về 0-based cho Client
    explanation: result.explanation,
  });
}
