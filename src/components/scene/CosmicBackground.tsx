'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars, Sparkles } from '@react-three/drei';
import { useSceneStore } from '@/store/sceneStore';

export const CosmicBackground: React.FC = () => {
  const introComplete = useSceneStore((s) => s.constellationIntroComplete);
  const activeStarId  = useSceneStore((s) => s.activeStarId);
  const graphicsQuality = useSceneStore((s) => s.graphicsQuality);

  // Always show background in solar system / planet views
  const shouldShow = introComplete || !!activeStarId;

  if (!shouldShow) return null;

  return (
    <group>
      {/* Background Stars */}
      <Stars
        radius={100}
        depth={50}
        count={graphicsQuality === 'low' ? 800 : 3500}
        factor={4.5}
        saturation={0.5}
        fade
        speed={1.2}
      />

      {/* Foreground drifting space dust */}
      <Sparkles
        count={graphicsQuality === 'low' ? 150 : 600}
        scale={55}
        size={2.5}
        speed={0.12}
        opacity={0.35}
        color="#a5b4fc"
      />

      <Sparkles
        count={graphicsQuality === 'low' ? 50 : 250}
        scale={18}
        size={1.2}
        speed={0.25}
        opacity={0.45}
        color="#c4b5fd"
      />
    </group>
  );
};

