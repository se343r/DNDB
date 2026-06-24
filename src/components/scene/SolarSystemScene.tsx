'use client';

import React, { useMemo } from 'react';
import { useStars } from '@/hooks/useStars';
import { usePlanets } from '@/hooks/usePlanets';
import { Planet } from '../objects/Planet';
import * as THREE from 'three';
import { useSceneStore } from '@/store/sceneStore';

export const SolarSystemScene: React.FC = () => {
  const activeStarId = useSceneStore((state) => state.activeStarId);
  const tiltAngleX = useSceneStore((state) => state.tiltAngleX);
  const tiltAngleY = useSceneStore((state) => state.tiltAngleY);
  const perspective3D = useSceneStore((state) => state.perspective3D);
  const graphicsQuality = useSceneStore((state) => state.graphicsQuality);
  
  const { stars } = useStars();
  const { planets, loading } = usePlanets(activeStarId);

  // Find active star details
  const activeStar = useMemo(() => {
    return stars.find((s) => s.id === activeStarId);
  }, [stars, activeStarId]);

  if (!activeStar) return null;

  // Star world position
  const posX = activeStar.position_x * 5.5;
  const posY = activeStar.position_y * 3.5;
  const posZ = 0;

  // Convert angles to radians (tilt angle X maps to pitch, Y maps to roll/yaw)
  const rotX = perspective3D ? (tiltAngleX * Math.PI) / 180 : 0;
  const rotY = perspective3D ? (tiltAngleY * Math.PI) / 180 : 0;

  return (
    <group 
      position={[posX, posY, posZ]} 
      rotation={[rotX, 0, rotY]} // Apply rotation around X and Z plane
    >
      {/* 1. Intense point light from the central star */}
      <pointLight 
        color={activeStar.color} 
        intensity={3.5} 
        distance={20} 
        decay={1.5} 
      />

      {/* Directional white light to reveal planet colors */}
      <directionalLight 
        position={[2, 10, 10]} 
        intensity={1.2} 
        color="#ffffff" 
      />

      {/* 2. Large central glowing star body */}
      <mesh>
        <sphereGeometry args={[0.26, graphicsQuality === 'low' ? 16 : 32, graphicsQuality === 'low' ? 16 : 32]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      
      {/* Outer corona shells */}
      <mesh>
        <sphereGeometry args={[0.32, 16, 16]} />
        <meshBasicMaterial 
          color={activeStar.color} 
          transparent 
          opacity={0.35} 
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {graphicsQuality === 'high' && (
        <mesh>
          <sphereGeometry args={[0.42, 16, 16]} />
          <meshBasicMaterial 
            color={activeStar.color} 
            transparent 
            opacity={0.15} 
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {/* 3. Orbiting planets */}
      {!loading && planets.map((planet) => (
        <Planet 
          key={planet.id} 
          planet={planet} 
          isOrbiting={true} 
          starColor={activeStar.color}
        />
      ))}
    </group>
  );
};
export default SolarSystemScene;

