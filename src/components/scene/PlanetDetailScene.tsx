'use client';

import React, { useMemo } from 'react';
import { usePlanetDetail } from '@/hooks/usePlanets';
import { useStars } from '@/hooks/useStars';
import { Planet } from '../objects/Planet';
import { useSceneStore } from '@/store/sceneStore';

export const PlanetDetailScene: React.FC = () => {
  const activePlanetId = useSceneStore((state) => state.activePlanetId);
  const { planet, loading } = usePlanetDetail(activePlanetId || '');
  const { stars } = useStars();

  // Find parent star for the correct glow/lighting color
  const parentStar = useMemo(() => {
    if (!planet) return null;
    return stars.find((s) => s.id === planet.star_id);
  }, [planet, stars]);

  if (loading || !planet) return null;

  const starColor = parentStar ? parentStar.color : '#ffffff';

  return (
    // Center the planet on the left side of the screen
    <group position={[-1.8, 0, 0]}>
      {/* Professional key and fill light setup to showcase the procedural texture details */}
      <ambientLight intensity={0.3} />
      
      {/* Bright white key light to show true colors */}
      <directionalLight 
        position={[4, 2, 4]} 
        intensity={1.2} 
        color="#ffffff" 
      />
      
      {/* Soft fill light colored like the parent sun */}
      <directionalLight 
        position={[-4, -2, -4]} 
        intensity={0.4} 
        color={starColor} 
      />

      {/* Subtle point light near the surface */}
      <pointLight
        position={[0, 0, 2]}
        intensity={1.2}
        distance={5}
        color={starColor}
      />

      <Planet 
        planet={{
          ...planet,
          planet_size: planet.planet_size * 2.8 // Scale up the planet for detail viewing
        }} 
        isOrbiting={false} 
        starColor={starColor}
      />
    </group>
  );
};
export default PlanetDetailScene;
