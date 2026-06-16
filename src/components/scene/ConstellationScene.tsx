'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { MapControls } from '@react-three/drei';
import { Star } from '../objects/Star';
import { AnimatedConstellationLines } from '../objects/AnimatedConstellationLines';
import { useStars } from '@/hooks/useStars';
import { useSceneStore } from '@/store/sceneStore';

// Phases:
// 0 = stars very dim, no lines         (0.3s)
// 1 = lines drawing, stars still dim   (1.2s)
// 2 = BURST - stars super bright       (0.7s)
// 3 = fade back to normal twinkling    (permanent)

const PHASE_0_DURATION = 0.3;
const DRAW_DURATION    = 1.2;
const BURST_DURATION   = 0.7;
const TOTAL_DRAW  = PHASE_0_DURATION + DRAW_DURATION;
const TOTAL_BURST = TOTAL_DRAW + BURST_DURATION;

export const ConstellationScene: React.FC = () => {
  const { stars, loading } = useStars();
  const setConstellationIntroComplete = useSceneStore((s) => s.setConstellationIntroComplete);
  const hasPlayedIntro = useSceneStore((s) => s.hasPlayedIntro);
  const setHasPlayedIntro = useSceneStore((s) => s.setHasPlayedIntro);

  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(hasPlayedIntro ? 3 : 0);
  const [drawProgress, setDrawProgress] = useState(hasPlayedIntro ? 1 : 0);
  const elapsed = useRef(0);
  const hasPlayed = useRef(hasPlayedIntro);

  useEffect(() => {
    if (hasPlayedIntro) {
      setConstellationIntroComplete(true);
    }
  }, []);

  useFrame((_, delta) => {
    if (hasPlayed.current) return;
    elapsed.current += delta;
    const t = elapsed.current;

    if (t < PHASE_0_DURATION) {
      if (phase !== 0) setPhase(0);
    } else if (t < TOTAL_DRAW) {
      if (phase !== 1) setPhase(1);
      setDrawProgress(Math.min(1, (t - PHASE_0_DURATION) / DRAW_DURATION));
    } else if (t < TOTAL_BURST) {
      if (phase !== 2) {
        setPhase(2);
        setDrawProgress(1);
      }
    } else {
      if (phase !== 3) {
        setPhase(3);
        setConstellationIntroComplete(true);
        setHasPlayedIntro(true);
        hasPlayed.current = true;
      }
    }
  });

  if (loading) return null;

  return (
    <group>
      <MapControls
        enableRotate={false}
        enableZoom={true}
        enablePan={true}
        minDistance={4}
        maxDistance={25}
      />

      <AnimatedConstellationLines
        stars={stars}
        phase={phase}
        drawProgress={drawProgress}
      />

      {stars.map((star) => (
        <Star key={star.id} star={star} introPhase={phase} />
      ))}
    </group>
  );
};
export default ConstellationScene;
