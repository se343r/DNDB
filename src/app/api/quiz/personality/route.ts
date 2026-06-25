import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET() {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('personality_questions')
    .select('id, question_text, options')
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Map database format to match what the frontend expects
  const questions = (data || []).map((q) => ({
    id: q.id,
    question: q.question_text,
    options: q.options,
  }));

  return NextResponse.json(questions);
}
