'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, CheckCircle2, Shield, Star, Rocket } from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import { useAudio } from '@/components/providers/AudioProvider';

interface Quest {
  id: number;
  title: string;
  desc: string;
  points: number;
  progress: number;
  maxProgress: number;
  completed: boolean;
  type: 'explore' | 'quiz' | 'daily';
}

export default function QuestsPage() {
  const { playClick, playHover } = useAudio();
  const [quests, setQuests] = useState<Quest[]>([
    {
      id: 1,
      title: "Vượt ải thuyết tương đối",
      desc: "Tìm hiểu danh nhân Albert Einstein và hoàn thành câu đố liên quan.",
      points: 150,
      progress: 1,
      maxProgress: 1,
      completed: true,
      type: 'quiz'
    },
    {
      id: 2,
      title: "Hành trình thấu kính hấp dẫn",
      desc: "Trực quan hóa hố đen và tương tác với đĩa bồi tụ tinh vân.",
      points: 200,
      progress: 0,
      maxProgress: 1,
      completed: false,
      type: 'explore'
    },
    {
      id: 3,
      title: "Khám phá 8 cực tinh tú",
      desc: "Truy cập thông tin chi tiết của cả 8 ngôi sao quanh hố đen.",
      points: 300,
      progress: 3,
      maxProgress: 8,
      completed: false,
      type: 'explore'
    },
    {
      id: 4,
      title: "Quét tin tức vũ trụ hàng ngày",
      desc: "Mở hệ bản đồ danh nhân và kiểm tra phần đề xuất hàng ngày.",
      points: 100,
      progress: 1,
      maxProgress: 1,
      completed: false,
      type: 'daily'
    }
  ]);

  const handleQuestClaim = (id: number) => {
    playClick();
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === id && q.progress < q.maxProgress) {
          return { ...q, progress: q.maxProgress, completed: true };
        }
        return q;
      })
    );
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-transparent flex flex-col items-center justify-start p-6 pt-24 text-white overflow-y-auto">
      <BackButton to="/catalog" />

      <div className="w-full max-w-2xl flex flex-col gap-6 relative z-10 pointer-events-auto">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-slate-950/80 border border-indigo-500/20 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl gap-4">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
              <Shield className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide">Nhiệm Vụ Khám Phá</h1>
              <p className="text-xs text-slate-400 mt-1 leading-normal">
                Thu thập điểm năng lượng vũ trụ để nâng cấp cấp độ phi hành.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 items-center shrink-0 bg-white/5 border border-white/5 px-4.5 py-2.5 rounded-2xl">
            <div className="text-right">
              <span className="text-[9px] text-slate-500 block font-mono font-bold uppercase">Cấp độ của bạn</span>
              <span className="text-sm font-bold text-indigo-300 font-mono">Phi hành gia Cấp 3</span>
            </div>
            <Rocket className="w-5 h-5 text-indigo-400 animate-pulse" />
          </div>
        </div>

        {/* Quests List */}
        <div className="flex flex-col gap-4">
          {quests.map((q, idx) => {
            const progressPercent = Math.min(100, (q.progress / q.maxProgress) * 100);
            
            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className={`bg-slate-950/70 border rounded-2xl p-5 backdrop-blur-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-300 ${
                  q.completed ? 'border-emerald-500/20 bg-slate-950/30' : 'border-indigo-500/10 hover:border-indigo-500/30'
                }`}
              >
                <div className="flex-1 flex gap-4.5 items-start">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${
                    q.completed ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-indigo-500/5 border-indigo-500/20 text-indigo-400'
                  }`}>
                    {q.completed ? <CheckCircle2 className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                  </div>
                  
                  <div className="flex flex-col gap-1.5 w-full">
                    <div className="flex gap-2 items-center flex-wrap">
                      <h3 className="font-semibold text-sm md:text-base leading-tight">
                        {q.title}
                      </h3>
                      <span className="text-[9px] px-2 py-0.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-300 font-mono">
                        +{q.points} EXP
                      </span>
                    </div>
                    
                    <p className="text-xs text-slate-400 leading-normal font-light">
                      {q.desc}
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full flex items-center gap-3 mt-1.5">
                      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className={`h-full transition-all duration-500 ${q.completed ? 'bg-emerald-400' : 'bg-indigo-400'}`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono shrink-0">
                        {q.progress}/{q.maxProgress}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="shrink-0 self-end md:self-center">
                  {!q.completed ? (
                    <button
                      onClick={() => handleQuestClaim(q.id)}
                      onMouseEnter={playHover}
                      className="px-5 py-2 bg-indigo-600/20 hover:bg-indigo-600/80 border border-indigo-500/40 hover:border-indigo-400 text-indigo-300 hover:text-white rounded-full text-xs font-semibold cursor-pointer transition"
                    >
                      Hoàn thành nhanh
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-semibold py-2 px-4 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                       Đã nhận quà
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
