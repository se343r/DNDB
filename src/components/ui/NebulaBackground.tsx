'use client';

import React from 'react';
import { useSceneStore } from '@/store/sceneStore';

export const NebulaBackground: React.FC = () => {
  const introComplete = useSceneStore((s) => s.constellationIntroComplete);
  const activeStarId  = useSceneStore((s) => s.activeStarId);

  // Only show nebula gradient after intro finishes, or when in star/planet views
  const visible = introComplete || !!activeStarId;

  return (
    <div
      className="fixed inset-0 z-0 transition-opacity duration-1000"
      style={{
        opacity: visible ? 1 : 0,
        background: `
          radial-gradient(ellipse 80% 60% at 15% 25%, rgba(76, 29, 149, 0.35) 0%, transparent 70%),
          radial-gradient(ellipse 60% 50% at 80% 70%, rgba(30, 58, 138, 0.3) 0%, transparent 65%),
          radial-gradient(ellipse 50% 40% at 60% 15%, rgba(109, 40, 217, 0.2) 0%, transparent 60%),
          radial-gradient(ellipse 70% 55% at 40% 85%, rgba(17, 24, 80, 0.4) 0%, transparent 70%),
          radial-gradient(ellipse 40% 30% at 90% 10%, rgba(55, 48, 163, 0.25) 0%, transparent 55%),
          #020010
        `,
      }}
    />
  );
};
