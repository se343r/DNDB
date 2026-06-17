'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Check, X, Award, RotateCcw } from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import { useAudio } from '@/components/providers/AudioProvider';

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: "Nhà vật lý nào nổi tiếng với thuyết tương đối rộng và hố đen vũ trụ?",
    options: ["Isaac Newton", "Albert Einstein", "Stephen Hawking", "Galileo Galilei"],
    correct: 1,
    explanation: "Albert Einstein công bố thuyết tương đối rộng vào năm 1915, đặt nền móng lý thuyết cho việc dự đoán sự tồn tại của hố đen."
  },
  {
    id: 2,
    question: "Marie Curie là nhà khoa học duy nhất nhận giải Nobel ở hai lĩnh vực khoa học khác nhau nào?",
    options: ["Vật lý và Hóa học", "Vật lý và Y học", "Hóa học và Sinh học", "Vật lý và Toán học"],
    correct: 0,
    explanation: "Marie Curie nhận giải Nobel Vật lý năm 1903 cùng chồng Pierre Curie, và giải Nobel Hóa học năm 1911 cho nghiên cứu về chất phóng xạ."
  },
  {
    id: 3,
    question: "Chòm sao Đại Hùng (Bắc Đẩu) thường được người đi biển cổ đại dùng để xác định hướng nào?",
    options: ["Hướng Đông", "Hướng Tây", "Hướng Nam", "Hướng Bắc"],
    correct: 3,
    explanation: "Nhờ hai ngôi sao Dubhe và Merak ở cuối chòm sao Bắc Đẩu tạo đường thẳng chỉ thẳng vào sao Bắc Cực (Polaris) giúp xác định hướng Bắc."
  }
];

export default function QuizzesPage() {
  const { playClick, playHover } = useAudio();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  const handleAnswerClick = (optIdx: number) => {
    if (isAnswered) return;
    playClick();
    setSelectedIdx(optIdx);
    setIsAnswered(true);
    if (optIdx === QUESTIONS[currentIdx].correct) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    playClick();
    setSelectedIdx(null);
    setIsAnswered(false);
    if (currentIdx + 1 < QUESTIONS.length) {
      setCurrentIdx((idx) => idx + 1);
    } else {
      setQuizComplete(true);
    }
  };

  const handleRestart = () => {
    playClick();
    setCurrentIdx(0);
    setSelectedIdx(null);
    setIsAnswered(false);
    setScore(0);
    setQuizComplete(false);
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-transparent flex flex-col items-center justify-center p-6 text-white overflow-y-auto">
      <BackButton to="/catalog" />
      
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
              {/* Progress Header */}
              <div className="flex items-center justify-between border-b border-indigo-500/10 pb-4">
                <span className="text-[10px] tracking-widest text-indigo-400 font-mono uppercase">
                  Câu đố tri thức {currentIdx + 1}/{QUESTIONS.length}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Điểm số: <strong className="text-emerald-400">{score}</strong>
                </span>
              </div>

              {/* Question Text */}
              <div className="flex gap-3 items-start">
                <HelpCircle className="w-6 h-6 text-indigo-400 shrink-0 mt-1" />
                <h2 className="text-lg font-semibold leading-relaxed">
                  {QUESTIONS[currentIdx].question}
                </h2>
              </div>

              {/* Choices */}
              <div className="flex flex-col gap-3">
                {QUESTIONS[currentIdx].options.map((opt, idx) => {
                  let btnStyle = "bg-white/5 border-white/10 hover:bg-white/10 hover:border-indigo-500/30";
                  let Icon = null;
                  
                  if (isAnswered) {
                    if (idx === QUESTIONS[currentIdx].correct) {
                      btnStyle = "bg-emerald-500/20 border-emerald-500/50 text-emerald-300";
                      Icon = <Check className="w-4 h-4 text-emerald-400" />;
                    } else if (idx === selectedIdx) {
                      btnStyle = "bg-rose-500/20 border-rose-500/50 text-rose-300";
                      Icon = <X className="w-4 h-4 text-rose-400" />;
                    } else {
                      btnStyle = "bg-white/5 border-white/5 opacity-50";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswerClick(idx)}
                      onMouseEnter={playHover}
                      disabled={isAnswered}
                      className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border text-xs md:text-sm text-left transition duration-200 cursor-pointer ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {Icon}
                    </button>
                  );
                })}
              </div>

              {/* Feedback and Next Trigger */}
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-4 mt-2 bg-indigo-950/20 border border-indigo-500/10 p-4 rounded-xl"
                >
                  <p className="text-xs text-slate-300 leading-relaxed font-light">
                    {QUESTIONS[currentIdx].explanation}
                  </p>
                  <button
                    onClick={handleNext}
                    onMouseEnter={playHover}
                    className="self-end px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-xs font-semibold cursor-pointer shadow-lg transition"
                  >
                    Tiếp tục
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
                  Bạn đã xuất sắc hoàn thành bộ câu đố của tuần này.
                </p>
              </div>

              <div className="px-8 py-4 bg-indigo-950/15 border border-indigo-500/10 rounded-2xl">
                <span className="text-xs text-slate-500 block">Kết quả đạt được</span>
                <span className="text-3xl font-black text-indigo-400 font-mono mt-1 block">
                  {score} / {QUESTIONS.length}
                </span>
              </div>

              <button
                onClick={handleRestart}
                onMouseEnter={playHover}
                className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-semibold cursor-pointer transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Làm lại câu đố
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
