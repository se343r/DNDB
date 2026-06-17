'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import { useRouter } from 'next/navigation';
import * as THREE from 'three';
import { generatePlanetCanvas } from '@/lib/planetTexture';
import { useAudio } from '../providers/AudioProvider';
import { Planet as PlanetType } from '@/lib/types';
import { useSceneStore } from '@/store/sceneStore';
import { PlanetHud } from '@/components/ui/PlanetHud';

interface PlanetProps {
  planet: PlanetType;
  isOrbiting?: boolean;
  starColor?: string;
}

export const Planet: React.FC<PlanetProps> = ({ planet, isOrbiting = true, starColor = '#ffffff' }) => {
  const groupRef = useRef<THREE.Group>(null);
  const planetMeshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);
  const [hovered, setHovered] = useState(false);
  const router = useRouter();
  const { playHover, playClick } = useAudio();

  const triggerTransition = useSceneStore((state) => state.triggerTransition);
  const activePlanetId = useSceneStore((state) => state.activePlanetId);

  // Generate the procedural texture on mount (client-side only)
  useEffect(() => {
    const canvas = generatePlanetCanvas(planet.planet_seed);
    if (canvas) {
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.needsUpdate = true;
      setTexture(tex);
    }
  }, [planet.planet_seed]);

  // Load saved orbit angle from store or fallback to a stable seed-based angle
  const savedAngle = useSceneStore((state) => state.planetAngles[planet.id]);
  const initialAngle = useMemo(() => {
    return savedAngle !== undefined 
      ? savedAngle 
      : (planet.planet_seed % 360) * (Math.PI / 180);
  }, [planet.id, planet.planet_seed, savedAngle]);

  const angleRef = useRef(initialAngle);

  // Animate: local rotation + orbital translation
  useFrame((state, delta) => {
    // 1. Spin the planet on its axis
    if (planetMeshRef.current) {
      planetMeshRef.current.rotation.y += delta * 0.35;
    }

    // 2. Perform orbital movement around the central star
    if (isOrbiting && groupRef.current) {
      angleRef.current += delta * 0.1 * planet.orbit_speed;
      const x = Math.cos(angleRef.current) * planet.orbit_radius;
      // Orbit lies on the XZ plane
      const z = Math.sin(angleRef.current) * planet.orbit_radius;
      groupRef.current.position.set(x, 0, z);

      // Dynamically track position if this is the active planet
      if (useSceneStore.getState().activePlanetId === planet.id) {
        const worldPos = new THREE.Vector3();
        groupRef.current.getWorldPosition(worldPos);
        useSceneStore.getState().setTrackedPosition([worldPos.x, worldPos.y, worldPos.z]);
      }

      // Save the current angle back into the Zustand store dynamically without triggering React re-renders
      useSceneStore.getState().planetAngles[planet.id] = angleRef.current;
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (useSceneStore.getState().isTransitioning) return;
    playClick();

    if (isOrbiting && groupRef.current) {
      // Get current world position of the planet
      const worldPos = new THREE.Vector3();
      groupRef.current.getWorldPosition(worldPos);

      // Offset camera to show planet on the right side (camera looks left of planet)
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      const lookAtOffsetX = isMobile ? 0 : -0.7;
      const lookAtOffsetY = isMobile ? -0.7 : 0;

      // Trigger cinematic zoom-in camera transition (1200ms)
      triggerTransition(
        [worldPos.x + lookAtOffsetX, worldPos.y + lookAtOffsetY, worldPos.z + 3.0 / 2.8],
        [worldPos.x + lookAtOffsetX, worldPos.y + lookAtOffsetY, worldPos.z],
        1.2
      );

      // Navigate to planet detail page after the camera animation finishes
      setTimeout(() => {
        router.push(`/planet/${planet.id}`);
      }, 1200);
    } else {
      // Already in detail view — just navigate directly
      router.push(`/planet/${planet.id}`);
    }
  };

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    setHovered(true);
    playHover();
    if (typeof window !== 'undefined') {
      document.body.style.cursor = 'pointer';
    }
    router.prefetch(`/planet/${planet.id}`);
  };

  const handlePointerOut = () => {
    setHovered(false);
    if (typeof window !== 'undefined') {
      document.body.style.cursor = 'default';
    }
  };

  // Generate orbit ring vertices for XZ plane
  const orbitRingPoints = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(
        new THREE.Vector3(
          Math.cos(theta) * planet.orbit_radius,
          0,
          Math.sin(theta) * planet.orbit_radius
        )
      );
    }
    return points;
  }, [planet.orbit_radius]);

  // Adjust size relative to base size
  const actualSize = planet.planet_size * 0.38;

  return (
    <group>
      {/* 1. Orbit Path Ring (only rendered in solar system scene) */}
      {isOrbiting && (
        <Line
          points={orbitRingPoints}
          color={starColor}
          lineWidth={0.5}
          transparent
          opacity={0.12}
        />
      )}

      {/* 2. Orbiting Planet Body Group */}
      <group 
        ref={groupRef} 
        position={isOrbiting ? [0, 0, 0] : [0, 0, 0]}
      >
        {/* Floating HUD attached to this planet */}
        {activePlanetId === planet.id && (
          <PlanetHud planetId={planet.id} />
        )}

        {/* Glow halo when hovered */}
        {hovered && (
          <mesh>
            <sphereGeometry args={[actualSize * 1.25, 32, 32]} />
            <meshBasicMaterial
              color={starColor}
              transparent
              opacity={0.15}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        )}

        {/* Planet Sphere Mesh */}
        <mesh
          ref={planetMeshRef}
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <sphereGeometry args={[actualSize, 32, 32]} />
          
          {texture ? (
            <meshStandardMaterial
              key="textured"
              map={texture}
              color="#ffffff"
              roughness={0.7}
              metalness={0.1}
            />
          ) : (
            // Loading skeleton mesh
            <meshStandardMaterial
              key="loading"
              color="#333333"
              roughness={0.9}
              wireframe
            />
          )}
        </mesh>

        {/* Dynamic Name Label */}
        {isOrbiting && (
          <Html
            distanceFactor={5}
            position={[0, actualSize + 0.35, 0]}
            center
            style={{ pointerEvents: 'none' }}
          >
            <div 
              style={{
                transition: 'all 0.25s ease',
                opacity: hovered ? 1 : 0,
                transform: `scale(${hovered ? 1 : 0.85})`
              }}
              className="px-3.5 py-1.5 text-sm font-bold text-white bg-zinc-950/90 border border-zinc-700/50 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.8)] backdrop-blur-md whitespace-nowrap text-center"
            >
              {planet.name}
            </div>
          </Html>
        )}
      </group>
    </group>
  );
};
export default Planet;
