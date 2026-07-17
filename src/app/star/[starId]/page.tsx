'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Settings } from 'lucide-react';
import { useStars } from '@/hooks/useStars';
import { usePlanets } from '@/hooks/usePlanets';
import { useSceneStore } from '@/store/sceneStore';
import { useAudio } from '@/components/providers/AudioProvider';
import { PlanetHud } from '@/components/ui/PlanetHud';
import { debugLog } from '@/lib/debug';

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
  const setAppPhase = useSceneStore((state) => state.setAppPhase);
  const setConstellationIntroComplete = useSceneStore((state) => state.setConstellationIntroComplete);
  const setHasPlayedIntro = useSceneStore((state) => state.setHasPlayedIntro);
  
  const searchNavigationStep = useSceneStore((state) => state.searchNavigationStep);
  const searchTargetPlanetId = useSceneStore((state) => state.searchTargetPlanetId);
  const setSearchTarget = useSceneStore((state) => state.setSearchTarget);
  
  const { playClick, playHover } = useAudio();

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
      // Zoom out to star system — let CameraController complete the full animation
      triggerTransition([posX, posY - 2.8, 6.8], [posX, posY, 0], 1.2);
    }
  };

  const activeStar = useMemo(() => {
    return stars.find((s) => s.id === starId);
  }, [stars, starId]);

  const [initialized, setInitialized] = React.useState(false);

  // On direct load/reload of /star/[starId], appPhase starts as 'home' which renders the
  // HomeScene (black hole). Setting it to 'catalog' immediately shows the solar system.
  useEffect(() => {
    setAppPhase('catalog');
    setConstellationIntroComplete(true);
    setHasPlayedIntro(true);
  }, [setAppPhase, setConstellationIntroComplete, setHasPlayedIntro]);

  useEffect(() => {
    debugLog('StarPage initialization check', {
      starsLoading,
      hasActiveStar: !!activeStar,
      initialized,
      searchNavigationStep: useSceneStore.getState().searchNavigationStep,
    });

    if (starsLoading) return;

    if (!activeStar) {
      router.push('/');
      return;
    }

    if (initialized) return;

    // Only set camera target if we are not navigating via search
    const step = useSceneStore.getState().searchNavigationStep;
    if (step !== 'to_planet') {
      debugLog('StarPage: initializing camera to star coordinates (not to planet)');
      const posX = activeStar.position_x * 5.5;
      const posY = activeStar.position_y * 3.5;
      setCameraTarget([posX, posY - 2.8, 6.8], [posX, posY, 0]);
      setActivePlanetId(null);
      setTrackedPosition(null);
      setTransitioning(false);
    } else {
      debugLog('StarPage: skipping star coordinates initialization (navigating to planet)');
    }
    
    setActiveStarId(activeStar.id);
    setInitialized(true);
  }, [activeStar, starsLoading, setCameraTarget, setActiveStarId, setActivePlanetId, setTrackedPosition, setTransitioning, router, initialized]);

  // Handle zoom to planet step when routing from search transition
  useEffect(() => {
    debugLog('StarPage zoom to planet check', {
      initialized,
      searchNavigationStep,
      searchTargetPlanetId,
    });
    if (initialized && searchNavigationStep === 'to_planet' && searchTargetPlanetId) {
      debugLog('StarPage: triggering active planet ID focus', { planetId: searchTargetPlanetId });
      setActivePlanetId(searchTargetPlanetId);
      setTrackedPosition(null);
      setTransitioning(false);
      // Clear search target step so we don't repeat this
      setSearchTarget(null, null, 'idle');
    }
  }, [initialized, searchNavigationStep, searchTargetPlanetId, setActivePlanetId, setTrackedPosition, setTransitioning, setSearchTarget]);

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
      {!activePlanetId && (
        <div className="flex items-start justify-between w-full relative z-20 pointer-events-auto">
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={handleGoBack}
              onMouseEnter={playHover}
              className="px-3 py-1.5 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl border border-zinc-800 hover:border-zinc-700 font-semibold text-xs flex items-center space-x-1.5 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Chòm sao Bắc Đẩu</span>
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
                Lĩnh vực {activeStar.name}
              </h2>
            </div>
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* 2. Star System Footer (Bottom) */}
      {!activePlanetId && (
        <div className="flex items-center justify-between w-full relative z-20 text-[9px] text-zinc-500 border-t border-zinc-900/60 pt-3 mt-4">
          <span className="font-mono uppercase">
            TRỰC KHÔNG GIAN TRI THỨC VỮNG BỀN | {!planetsLoading ? planets.length : '...'} HÀNH TINH KHẢ SÁT
          </span>
          <p className="text-zinc-500 font-mono hidden sm:block">
            Mỗi hành tinh tự động lưu giữ một khối cơ sở dữ liệu riêng
          </p>
        </div>
      )}

      {/* 3. Global Fullscreen Reading Overlay */}
      {activePlanetId && <PlanetHud planetId={activePlanetId} onClose={handleClosePlanet} />}
    </motion.div>
  );
}
