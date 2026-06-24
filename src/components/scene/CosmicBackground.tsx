'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars, Sparkles, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useSceneStore } from '@/store/sceneStore';

interface ActiveShootingStar {
  startPos: THREE.Vector3;
  currentPos: THREE.Vector3;
  dir: THREE.Vector3;
  speed: number;
  length: number;
  age: number;
  life: number;
  color: string;
}

const ShootingStars: React.FC = () => {
  const [star, setStar] = useState<ActiveShootingStar | null>(null);
  const nextSpawnTime = useRef<number>(0);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Spawn a shooting star if none is active and spawn time is reached
    if (!star) {
      if (time > nextSpawnTime.current) {
        // Randomize spawn parameters
        // Shooting stars fly diagonally (from top-right to bottom-left)
        const startX = Math.random() * 20 - 5; // x range: -5 to 15
        const startY = Math.random() * 8 + 6;   // y range: 6 to 14
        const startZ = Math.random() * 6 - 10;  // z range: -10 to -4 (behind foreground objects)

        const angle = Math.PI * 1.25 + (Math.random() - 0.5) * 0.15; // approx 225 degrees (down-left)
        const dir = new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0).normalize();
        
        const colors = ['#ffffff', '#818cf8', '#67e8f9', '#a78bfa', '#f472b6'];
        const color = colors[Math.floor(Math.random() * colors.length)];

        setStar({
          startPos: new THREE.Vector3(startX, startY, startZ),
          currentPos: new THREE.Vector3(startX, startY, startZ),
          dir,
          speed: 16 + Math.random() * 12, // units per second
          length: 1.2 + Math.random() * 1.5,
          age: 0,
          life: 0.5 + Math.random() * 0.5, // seconds
          color
        });
      }
      return;
    }

    // Update active shooting star
    star.age += delta;
    if (star.age >= star.life) {
      setStar(null);
      // Next shooting star spawn in 4 to 12 seconds
      nextSpawnTime.current = time + 4.0 + Math.random() * 8.0;
    } else {
      // Move current position forward
      star.currentPos.copy(star.startPos).addScaledVector(star.dir, star.speed * star.age);
    }
  });

  if (!star) return null;

  // Calculate trail points (current position and backward along direction)
  const tailPos = new THREE.Vector3()
    .copy(star.currentPos)
    .addScaledVector(star.dir, -star.length);

  const opacity = Math.sin((star.age / star.life) * Math.PI) * 0.85;

  return (
    <Line
      points={[tailPos, star.currentPos]}
      color={star.color}
      lineWidth={1.5}
      transparent
      opacity={opacity}
    />
  );
};

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

      {/* Colorful cosmic dust for high graphics quality */}
      {graphicsQuality === 'high' && (
        <>
          {/* Cyan/Teal dust */}
          <Sparkles
            count={180}
            scale={45}
            size={2.0}
            speed={0.15}
            opacity={0.3}
            color="#22d3ee"
          />
          {/* Pink/Magenta dust */}
          <Sparkles
            count={150}
            scale={40}
            size={1.8}
            speed={0.1}
            opacity={0.25}
            color="#f472b6"
          />
          {/* Amber/Gold dust */}
          <Sparkles
            count={120}
            scale={35}
            size={1.5}
            speed={0.18}
            opacity={0.25}
            color="#fbbf24"
          />

          {/* Random diagonal shooting stars */}
          <ShootingStars />
        </>
      )}
    </group>
  );
};

export default CosmicBackground;
