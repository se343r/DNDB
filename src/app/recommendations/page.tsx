'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowUpRight, GraduationCap, Scale, Eye } from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import { useAudio } from '@/components/providers/AudioProvider';
import { useRouter } from 'next/navigation';

interface Recommendation {
  id: string;
  name: string;
  domain: string;
  reason: string;
  starColor: string;
  path: string;
}

const RECOMMENDATIONS: Recommendation[] = [
  {
    id: "marie-curie",
    name: "Marie Curie",
    domain: "Khoa học & Nghiên cứu",
    reason: "Thuyết phóng xạ của bà liên kết chặt chẽ với cấu trúc nguyên tử hạt nhân và lực liên kết sao.",
    starColor: "#cceeff",
    path: "/planet/marie-curie"
  },
  {
    id: "napoleon",
    name: "Napoleon Bonaparte",
    domain: "Quân sự & Chiến lược",
    reason: "Các chiến lược lỗi lạc làm thay đổi bản đồ địa chính trị Châu Âu cổ đại, phù hợp với định hướng lịch sử chính trị.",
    starColor: "#ffeedd",
    path: "/planet/napoleon"
  },
  {
    id: "galileo",
    name: "Galileo Galilei",
    domain: "Triết học & Thiên văn học",
    reason: "Khám phá kính viễn vọng và thuyết nhật tâm mở ra vũ trụ 3D, mở đầu thời kỳ khoa học hiện đại.",
    starColor: "#fffacc",
    path: "/planet/galileo"
  }
];

export default function RecommendationsPage() {
  const { playClick, playHover } = useAudio();
  const router = useRouter();

  const handleCardClick = (path: string) => {
    playClick();
    router.push(path);
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-transparent flex flex-col items-center justify-start p-6 pt-24 text-white overflow-y-auto">
      <BackButton to="/catalog" />

      <div className="w-full max-w-2xl flex flex-col gap-6 relative z-10 pointer-events-auto">
        {/* Banner */}
        <div className="bg-slate-950/80 border border-indigo-500/20 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl flex flex-col gap-3">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide">Đề Xuất Hành Trình</h1>
              <p className="text-xs text-slate-400 mt-1">
                Gợi ý các thực thể danh nhân bạn nên tìm hiểu tiếp theo dựa trên liên kết học tập của bạn.
              </p>
            </div>
          </div>
        </div>

        {/* Recommendations Grid */}
        <div className="flex flex-col gap-4">
          {RECOMMENDATIONS.map((rec, idx) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => handleCardClick(rec.path)}
              onMouseEnter={playHover}
              className="group bg-slate-950/70 border border-indigo-500/10 hover:border-indigo-500/35 rounded-2xl p-6 backdrop-blur-lg flex flex-col gap-4 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]"
            >
              <div className="flex items-center justify-between">
                <div className="flex gap-3 items-center">
                  <div 
                    className="w-3 h-3 rounded-full animate-pulse shadow-md"
                    style={{ backgroundColor: rec.starColor, boxShadow: `0 0 10px ${rec.starColor}` }}
                  />
                  <div>
                    <h3 className="font-semibold text-base md:text-lg leading-tight group-hover:text-indigo-300 transition duration-200">
                      {rec.name}
                    </h3>
                    <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{rec.domain}</span>
                  </div>
                </div>
                
                <div className="w-8 h-8 rounded-full border border-white/15 group-hover:border-indigo-400/50 group-hover:bg-indigo-600/15 flex items-center justify-center transition duration-200">
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition" />
                </div>
              </div>
              
              <div className="bg-white/3 border border-white/5 p-4 rounded-xl">
                <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase block mb-1">Gợi ý dành cho bạn</span>
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-light">
                  {rec.reason}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
