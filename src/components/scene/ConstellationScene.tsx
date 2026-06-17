'use client';

import React, { useEffect } from 'react';
import { MapControls } from '@react-three/drei';
import { Star } from '../objects/Star';
import { AnimatedConstellationLines } from '../objects/AnimatedConstellationLines';
import { useStars } from '@/hooks/useStars';
import { useSceneStore } from '@/store/sceneStore';

export const ConstellationScene: React.FC = () => {
  const { stars, loading } = useStars();
  const setConstellationIntroComplete = useSceneStore((s) => s.setConstellationIntroComplete);
  const setHasPlayedIntro = useSceneStore((s) => s.setHasPlayedIntro);

  useEffect(() => {
    setConstellationIntroComplete(true);
    setHasPlayedIntro(true);
  }, [setConstellationIntroComplete, setHasPlayedIntro]);

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
        phase={3}
        drawProgress={1}
      />

      {stars.map((star) => (
        <Star key={star.id} star={star} introPhase={3} />
      ))}
    </group>
  );
};
export default ConstellationScene;
