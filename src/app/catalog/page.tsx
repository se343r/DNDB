'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSceneStore } from '@/store/sceneStore';
import { useStars } from '@/hooks/useStars';
import { usePlanets } from '@/hooks/usePlanets';

export default function CatalogPage() {
  const resetScene = useSceneStore((state) => state.resetScene);
  const isTransitioning = useSceneStore((state) => state.isTransitioning);
  const setAppPhase = useSceneStore((state) => state.setAppPhase);
  const { stars } = useStars();
  const { planets } = usePlanets();
  const router = useRouter();

  const hasPlayedIntro = useSceneStore((state) => state.hasPlayedIntro);
  const [showFlash, setShowFlash] = useState(!hasPlayedIntro);

  useEffect(() => {
    // Switch SpaceCanvas to ConstellationScene
    setAppPhase('catalog');
    resetScene();
  }, [resetScene, setAppPhase]);

  useEffect(() => {
    stars.forEach((star) => {
      router.prefetch(`/star/${star.id}`);
    });
  }, [stars, router]);

  // Trigger burst flash only on first visit (resets on reload)
  useEffect(() => {
    if (!hasPlayedIntro) {
      const timer = setTimeout(() => {
        setShowFlash(false);
      }, 950);
      return () => clearTimeout(timer);
    }
  }, [hasPlayedIntro]);


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isTransitioning ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="relative w-full h-full flex flex-col justify-between p-6 md:p-8 pointer-events-none select-none"
    >
      {/* Constellation ignition flash burst */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            key="flash"
            className="fixed inset-0 z-50 pointer-events-none"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            style={{
              background: `
                radial-gradient(ellipse 30% 25% at 38% 48%, rgba(255,255,255,1.0) 0%, rgba(255,255,255,0) 100%),
                radial-gradient(ellipse 65% 55% at 38% 48%, rgba(200,220,255,0.9) 0%, rgba(180,200,255,0) 100%),
                radial-gradient(ellipse 100% 90% at 38% 48%, rgba(140,170,255,0.55) 0%, rgba(100,130,255,0) 100%),
                radial-gradient(ellipse 160% 140% at 38% 48%, rgba(80,100,220,0.25) 0%, rgba(40,60,180,0) 100%)
              `,
            }}
          />
        )}
      </AnimatePresence>

      <div className="flex-1" />

      {/* Quick overview metrics (Bottom-Left) */}
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

      {/* Instruction Footer banner (Bottom-Center) */}
      <div className="w-full text-center text-slate-600 text-[10px] font-mono z-20 mt-auto pointer-events-none">
        [ HỆ BẢN ĐỒ CHÀM SAO BẮC ĐẨU - KHẢ NĂNG TƯƠNG TÁC TỰ DO ]
      </div>
    </motion.div>
  );
}
