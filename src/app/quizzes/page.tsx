'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Check, X, Award, RotateCcw, Loader2, AlertCircle } from 'lucide-react';
import { useAudio } from '@/components/providers/AudioProvider';
import { useSceneStore } from '@/store/sceneStore';
import { useAuth } from '@/hooks/useAuth';

interface ApiQuestion {
  id: string;
  question_text: string;
  options: string[];
  difficulty: string;
  category: string | null;
}

interface AnswerFeedback {
  is_correct: boolean;
  correct_index: number;
  explanation: string;
}

interface FinishResult {
  score: number;
  total_questions: number;
  points_earned: number;
  new_total_points: number | null;
  new_streak: number | null;
}

export default function QuizzesPage() {
  const setAppPhase = useSceneStore((state) => state.setAppPhase);
  const resetScene = useSceneStore((state) => state.resetScene);
  const { isAuthenticated, refreshProfile } = useAuth();

  useEffect(() => {
    setAppPhase('quizzes');
    resetScene();
    return () => {
      setAppPhase('catalog');
    };
  }, [setAppPhase, resetScene]);

  const { playClick, playHover } = useAudio();

  // Data state — câu hỏi tới từ server, không còn hardcode
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ApiQuestion[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(true);

  // Play state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [finishResult, setFinishResult] = useState<FinishResult | null>(null);
  const [questionStartedAt, setQuestionStartedAt] = useState<number>(Date.now());

  const loadQuiz = async () => {
    setIsLoadingQuiz(true);
    setLoadError(null);
    try {
      const res = await fetch('/api/quiz/questions?count=5');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Không tải được câu hỏi');

      setSessionId(data.session_id);
      setQuestions(data.questions);
      setCurrentIdx(0);
      setSelectedIdx(null);
      setIsAnswered(false);
      setFeedback(null);
      setScore(0);
      setQuizComplete(false);
      setFinishResult(null);
      setQuestionStartedAt(Date.now());
    } catch (err: any) {
      setLoadError(err.message || 'Có lỗi xảy ra khi tải câu đố');
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  useEffect(() => {
    loadQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnswerClick = async (optIdx: number) => {
    if (isAnswered || isSubmitting || !sessionId) return;
    playClick();
    setSelectedIdx(optIdx);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/quiz/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          question_id: questions[currentIdx].id,
          selected_index: optIdx,
          time_spent_ms: Date.now() - questionStartedAt,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Không thể gửi câu trả lời');

      setFeedback(data);
      setIsAnswered(true);
      if (data.is_correct) setScore((s) => s + 1);
    } catch (err: any) {
      setLoadError(err.message || 'Có lỗi khi chấm điểm câu trả lời');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    playClick();
    setSelectedIdx(null);
    setIsAnswered(false);
    setFeedback(null);

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((idx) => idx + 1);
      setQuestionStartedAt(Date.now());
      return;
    }

    // Câu cuối cùng — gọi finish để chốt điểm + cộng vào profile
    if (sessionId) {
      try {
        const res = await fetch('/api/quiz/finish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId }),
        });
        const data = await res.json();
        if (res.ok) {
          setFinishResult(data);
          if (isAuthenticated) refreshProfile();
        }
      } catch {
        // Không chặn UI nếu finish thất bại — vẫn show kết quả cục bộ
      }
    }
    setQuizComplete(true);
  };

  const handleRestart = () => {
    playClick();
    loadQuiz();
  };

  if (isLoadingQuiz) {
    return (
      <div className="relative w-full h-full min-h-screen bg-transparent flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        <p className="text-xs text-slate-400 mt-3">Đang tải câu đố từ vũ trụ tri thức...</p>
      </div>
    );
  }

  if (loadError && questions.length === 0) {
    return (
      <div className="relative w-full h-full min-h-screen bg-transparent flex flex-col items-center justify-center text-white p-6">
        <div className="max-w-sm text-center flex flex-col items-center gap-3">
          <AlertCircle className="w-8 h-8 text-rose-400" />
          <p className="text-sm text-slate-300">{loadError}</p>
          <button
            onClick={loadQuiz}
            className="mt-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-xs font-semibold cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];

  return (
    <div className="relative w-full h-full min-h-screen bg-transparent flex flex-col items-center justify-center p-6 text-white overflow-y-auto">
      <div className="w-full max-w-xl bg-slate-950/80 border border-indigo-500/20 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative z-10 pointer-events-auto">
        <AnimatePresence mode="wait">
          {!quizComplete ? (
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-6"
            >
              <div className="flex items-center justify-between border-b border-indigo-500/10 pb-4">
                <span className="text-[10px] tracking-widest text-indigo-400 font-mono uppercase">
                  Câu đố tri thức {currentIdx + 1}/{questions.length}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Điểm số: <strong className="text-emerald-400">{score}</strong>
                </span>
              </div>

              <div className="flex gap-3 items-start">
                <HelpCircle className="w-6 h-6 text-indigo-400 shrink-0 mt-1" />
                <h2 className="text-lg font-semibold leading-relaxed">
                  {currentQuestion.question_text}
                </h2>
              </div>

              <div className="flex flex-col gap-3">
                {currentQuestion.options.map((opt, idx) => {
                  let btnStyle =
                    'bg-white/5 border-white/10 hover:bg-white/10 hover:border-indigo-500/30';
                  let Icon = null;

                  if (isAnswered && feedback) {
                    if (idx === feedback.correct_index) {
                      btnStyle = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300';
                      Icon = <Check className="w-4 h-4 text-emerald-400" />;
                    } else if (idx === selectedIdx) {
                      btnStyle = 'bg-rose-500/20 border-rose-500/50 text-rose-300';
                      Icon = <X className="w-4 h-4 text-rose-400" />;
                    } else {
                      btnStyle = 'bg-white/5 border-white/5 opacity-50';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswerClick(idx)}
                      onMouseEnter={playHover}
                      disabled={isAnswered || isSubmitting}
                      className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border text-xs md:text-sm text-left transition duration-200 cursor-pointer disabled:cursor-default ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {Icon}
                      {isSubmitting && selectedIdx === idx && (
                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              {isAnswered && feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-4 mt-2 bg-indigo-950/20 border border-indigo-500/10 p-4 rounded-xl"
                >
                  <p className="text-xs text-slate-300 leading-relaxed font-light">
                    {feedback.explanation}
                  </p>
                  <button
                    onClick={handleNext}
                    onMouseEnter={playHover}
                    className="self-end px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-xs font-semibold cursor-pointer shadow-lg transition"
                  >
                    {currentIdx + 1 < questions.length ? 'Tiếp tục' : 'Xem kết quả'}
                  </button>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center gap-6 py-8"
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shadow-lg">
                <Award className="w-8 h-8 text-indigo-400" />
              </div>

              <div>
                <h2 className="text-2xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-300 to-violet-400">
                  Hoàn Thành Thử Thách!
                </h2>
                <p className="text-slate-400 text-sm mt-2">
                  {isAuthenticated
                    ? 'Điểm số của bạn đã được cộng vào bảng xếp hạng.'
                    : 'Đăng nhập để lưu điểm và lên bảng xếp hạng lần sau.'}
                </p>
              </div>

              <div className="px-8 py-4 bg-indigo-950/15 border border-indigo-500/10 rounded-2xl">
                <span className="text-xs text-slate-500 block">Kết quả đạt được</span>
                <span className="text-3xl font-black text-indigo-400 font-mono mt-1 block">
                  {score} / {questions.length}
                </span>
                {finishResult && finishResult.points_earned > 0 && (
                  <span className="text-xs text-emerald-400 font-mono mt-1 block">
                    +{finishResult.points_earned} điểm
                    {finishResult.new_streak ? ` · chuỗi ${finishResult.new_streak} ngày` : ''}
                  </span>
                )}
              </div>

              <button
                onClick={handleRestart}
                onMouseEnter={playHover}
                className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-semibold cursor-pointer transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Làm bộ câu đố mới
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
