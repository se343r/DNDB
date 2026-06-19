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
  const appPhase = useSceneStore((s) => s.appPhase);
  const isQuizzes = appPhase === 'quizzes';
  const isLeaderboard = appPhase === 'leaderboard';

  useEffect(() => {
    setConstellationIntroComplete(true);
    setHasPlayedIntro(true);
  }, [setConstellationIntroComplete, setHasPlayedIntro]);

  if (loading) return null;

  return (
    <group>
      {!isQuizzes && !isLeaderboard && (
        <MapControls
          enableRotate={false}
          enableZoom={true}
          enablePan={true}
          minDistance={4}
          maxDistance={25}
        />
      )}

      {appPhase === 'catalog' && (
        <AnimatedConstellationLines
          stars={stars}
          phase={3}
          drawProgress={1}
        />
      )}

      {stars.map((star, idx) => (
        <Star
          key={star.id}
          star={star}
          index={idx}
          totalStars={stars.length}
          introPhase={3}
        />
      ))}
    </group>
  );
};
export default ConstellationScene;
