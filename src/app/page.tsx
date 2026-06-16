'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSceneStore } from '@/store/sceneStore';
import { useStars } from '@/hooks/useStars';
import { usePlanets } from '@/hooks/usePlanets';

export default function HomePage() {
  const resetScene = useSceneStore((state) => state.resetScene);
  const isTransitioning = useSceneStore((state) => state.isTransitioning);
  const { stars } = useStars();
  const { planets } = usePlanets(); // Fetch all planets to count them dynamically
  const router = useRouter();

  // Reset the camera and coordinates to show the full constellation on mount
  useEffect(() => {
    resetScene();
  }, [resetScene]);

  // Proactively prefetch all star system routes
  useEffect(() => {
    stars.forEach((star) => {
      router.prefetch(`/star/${star.id}`);
    });
  }, [stars, router]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isTransitioning ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="relative w-full h-full flex flex-col justify-between p-6 md:p-8 pointer-events-none select-none"
    >
      {/* 1. Guide overlay message (Top-Left) */}
      <div className="absolute top-6 left-6 z-20 pointer-events-none md:max-w-md pointer-events-auto bg-slate-950/45 p-5 rounded-2xl border border-slate-900/60 backdrop-blur-md shadow-2xl">
        <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-indigo-500/10 rounded-full border border-indigo-500/20 text-[10px] text-indigo-400 font-mono uppercase mb-2">
          <Info className="w-3.5 h-3.5" />
          <span>Bản đồ Chòm Sao</span>
        </span>
        <h2 className="text-xl font-bold font-display tracking-tight text-white">Chòm Sao Bắc Đẩu</h2>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Nhấp chuột chọn một ngôi sao đại diện cho từng lĩnh vực văn hóa, khoa học, quân sự, công nghệ để lặn sâu khám phá hệ mặt trời và tinh cầu hành tinh của các danh nhân tương ứng.
        </p>
      </div>

      {/* Spacer to push content */}
      <div className="flex-1" />

      {/* 2. Quick overview metrics (Bottom-Left) */}
      <div className="absolute bottom-6 left-6 z-20 pointer-events-none hidden md:block pointer-events-auto bg-slate-950/40 p-4 rounded-xl border border-slate-900/40 backdrop-blur-sm">
        <p className="text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold">DỮ LIỆU VẬN HÀNH</p>
        <div className="flex items-center space-x-4 mt-1.5">
          <div>
            <span className="text-lg font-bold text-indigo-400 font-mono">{stars.length || 7}</span>
            <span className="text-[10px] text-slate-400 ml-1">Ngôi sao trục</span>
          </div>
          <div className="w-px h-5 bg-slate-800" />
          <div>
            <span className="text-lg font-bold text-indigo-400 font-mono">{planets.length || 16}</span>
            <span className="text-[10px] text-slate-400 ml-1">Tinh cầu nhân vật</span>
          </div>
        </div>
      </div>

      {/* 3. Instruction Footer banner (Bottom-Center) */}
      <div className="w-full text-center text-slate-600 text-[10px] font-mono z-20 mt-auto pointer-events-none">
        [ HỆ BẢN ĐỒ CHÀM SAO BẮC ĐẨU - KHẢ NĂNG TƯƠNG TÁC TỰ DO ]
      </div>
    </motion.div>
  );
}
