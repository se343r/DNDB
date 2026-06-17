'use client';

import React, { useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Sliders, Settings } from 'lucide-react';
import { useStars } from '@/hooks/useStars';
import { usePlanets } from '@/hooks/usePlanets';
import { useSceneStore } from '@/store/sceneStore';
import { useAudio } from '@/components/providers/AudioProvider';

export default function StarPage() {
  const params = useParams();
  const starId = params?.starId as string;
  const router = useRouter();

  const { stars, loading: starsLoading } = useStars();
  const { planets, loading: planetsLoading } = usePlanets(starId);
  
  const setCameraTarget = useSceneStore((state) => state.setCameraTarget);
  const setActiveStarId = useSceneStore((state) => state.setActiveStarId);
  const setActivePlanetId = useSceneStore((state) => state.setActivePlanetId);
  const activePlanetId = useSceneStore((state) => state.activePlanetId);
  const setTrackedPosition = useSceneStore((state) => state.setTrackedPosition);
  const setAddModalOpen = useSceneStore((state) => state.setAddModalOpen);
  const isTransitioning = useSceneStore((state) => state.isTransitioning);
  const setTransitioning = useSceneStore((state) => state.setTransitioning);
  const triggerTransition = useSceneStore((state) => state.triggerTransition);
  const { playClick } = useAudio();

  const handleGoBack = () => {
    playClick();
    triggerTransition([0, 0, 8], [0, 0, 0]);
    setActiveStarId(null);
    setActivePlanetId(null);

    setTimeout(() => {
      router.push('/catalog');
    }, 1000);
  };

  const handleClosePlanet = () => {
    playClick();
    setActivePlanetId(null);
    setTrackedPosition(null);
    if (activeStar) {
      const posX = activeStar.position_x * 5.5;
      const posY = activeStar.position_y * 3.5;
      triggerTransition([posX, posY - 2.8, 6.8], [posX, posY, 0]);
    }
    setTimeout(() => setTransitioning(false), 1000);
  };

  // 3D Visual Coordinates from Zustand store
  const tiltAngleX = useSceneStore((state) => state.tiltAngleX);
  const tiltAngleY = useSceneStore((state) => state.tiltAngleY);
  const perspective3D = useSceneStore((state) => state.perspective3D);
  const setTiltAngleX = useSceneStore((state) => state.setTiltAngleX);
  const setTiltAngleY = useSceneStore((state) => state.setTiltAngleY);
  const setPerspective3D = useSceneStore((state) => state.setPerspective3D);

  const activeStar = useMemo(() => {
    return stars.find((s) => s.id === starId);
  }, [stars, starId]);

  useEffect(() => {
    if (starsLoading) return;

    if (!activeStar) {
      router.push('/');
      return;
    }

    const posX = activeStar.position_x * 5.5;
    const posY = activeStar.position_y * 3.5;

    // Set camera target tilted on the Y-axis with a wider field of view (Z=6.8) to see all orbits
    setCameraTarget([posX, posY - 2.8, 6.8], [posX, posY, 0]);
    setActiveStarId(activeStar.id);
    
    // Preserve active planet if it belongs to this star system
    // Wait until planets have loaded before potentially clearing the activePlanetId
    if (!planetsLoading) {
      if (activePlanetId && planets && planets.some((p) => p.id === activePlanetId)) {
        setTrackedPosition(null);
      } else {
        setActivePlanetId(null);
      }
    }
    setTransitioning(false);
  }, [activeStar, starsLoading, planetsLoading, setCameraTarget, setActiveStarId, setActivePlanetId, setTransitioning, router, activePlanetId, planets, setTrackedPosition]);

  // Prefetch planet detail routes and home page for quick navigation
  useEffect(() => {
    if (planets && planets.length > 0) {
      planets.forEach((p) => {
        router.prefetch(`/planet/${p.id}`);
      });
    }
    router.prefetch('/');
  }, [planets, router]);

  if (starsLoading || !activeStar) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-transparent text-white/40 pointer-events-none">
        <div className="flex flex-col items-center gap-3 bg-zinc-950/40 backdrop-blur-md p-6 rounded-2xl border border-zinc-850/40 pointer-events-auto shadow-2xl">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <span className="text-xs uppercase tracking-widest text-indigo-400 font-light">
            Khởi tạo hệ mặt trời...
          </span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isTransitioning ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full h-full flex flex-col justify-between p-6 pointer-events-none select-none"
    >
      {/* 1. Header controls bar */}
      <div className="flex items-start justify-between w-full relative z-20 pointer-events-auto">
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={activePlanetId ? handleClosePlanet : handleGoBack}
            className="px-3 py-1.5 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl border border-zinc-800 hover:border-zinc-700 font-semibold text-xs flex items-center space-x-1.5 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{activePlanetId ? `Hệ mặt trời ${activeStar.name}` : 'Chòm sao Bắc Đẩu'}</span>
          </button>

          <div className="h-6 w-px bg-zinc-800 hidden sm:block" />

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[9px] bg-indigo-500/10 text-indigo-400 font-mono px-2 py-0.5 rounded border border-indigo-500/20 uppercase">
                Hệ mặt trời {activeStar.name}
              </span>
              <span className="text-[9px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
                Trọng tâm: {activeStar.name.toUpperCase()}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white font-display mt-0.5">
              Học Thuyết Lĩnh vực {activeStar.name}
            </h2>
          </div>
        </div>

      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* 2. 3D perspective adjust panel (Bottom-Right) */}
      <div className="absolute bottom-16 right-6 z-20 bg-zinc-950/90 border border-zinc-800 rounded-2xl p-4 flex flex-col space-y-3 shadow-2xl w-60 backdrop-blur-md pointer-events-auto">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-1.5">
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span>GÓC QUAY ORBIT 3D</span>
          </span>
          <button
            type="button"
            onClick={() => setPerspective3D(!perspective3D)}
            className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono transition-colors cursor-pointer ${
              perspective3D
                ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {perspective3D ? 'KHÔNG GIAN 3D' : 'MẶT PHẲNG 2D'}
          </button>
        </div>

        {perspective3D && (
          <div className="space-y-2 text-[10px]">
            <div>
              <label className="flex items-center justify-between text-zinc-400 font-mono mb-1">
                <span>ĐỘ NGHIÊNG (X-AXIS)</span>
                <span className="text-white font-bold">{tiltAngleX}°</span>
              </label>
              <input
                type="range"
                min="35"
                max="78"
                value={tiltAngleX}
                onChange={(e) => setTiltAngleX(parseInt(e.target.value))}
                className="w-full accent-indigo-500 h-1 bg-zinc-850 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <label className="flex items-center justify-between text-zinc-400 font-mono mb-1">
                <span>XOAY QUỸ ĐẠO (Z-AXIS)</span>
                <span className="text-white font-bold">{tiltAngleY}°</span>
              </label>
              <input
                type="range"
                min="-45"
                max="45"
                value={tiltAngleY}
                onChange={(e) => setTiltAngleY(parseInt(e.target.value))}
                className="w-full accent-indigo-500 h-1 bg-zinc-850 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Star System Footer (Bottom) */}
      <div className="flex items-center justify-between w-full relative z-20 text-[9px] text-zinc-500 border-t border-zinc-900/60 pt-3 mt-4">
        <span className="font-mono uppercase">
          TRỰC KHÔNG GIAN TRI THỨC VỮNG BỀN | {!planetsLoading ? planets.length : '...'} HÀNH TINH KHẢ SÁT
        </span>
        <p className="text-zinc-500 font-mono hidden sm:block">
          Mỗi hành tinh tự động lưu giữ một khối cơ sở dữ liệu riêng
        </p>
      </div>
    </motion.div>
  );
}
