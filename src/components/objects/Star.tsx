'use client';

import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useRouter } from 'next/navigation';
import * as THREE from 'three';
import { useAudio } from '../providers/AudioProvider';
import { Star as StarType } from '@/lib/types';
import { useSceneStore } from '@/store/sceneStore';

interface StarProps {
  star: StarType;
  introPhase?: 0 | 1 | 2 | 3;
}

// Generate a soft radial glow texture with diffraction spikes
function createStarTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const center = size / 2;

  // Outer soft glow
  const grd = ctx.createRadialGradient(center, center, 0, center, center, center);
  grd.addColorStop(0.0,  'rgba(255, 255, 255, 1.0)');
  grd.addColorStop(0.08, 'rgba(255, 255, 255, 0.95)');
  grd.addColorStop(0.2,  'rgba(220, 230, 255, 0.6)');
  grd.addColorStop(0.45, 'rgba(180, 200, 255, 0.2)');
  grd.addColorStop(0.7,  'rgba(140, 160, 255, 0.05)');
  grd.addColorStop(1.0,  'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, size, size);

  // Cross diffraction spikes (4-pointed star)
  ctx.globalCompositeOperation = 'lighter';
  const drawSpike = (angle: number, length: number, width: number) => {
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(angle);
    const sg = ctx.createLinearGradient(0, -length, 0, length);
    sg.addColorStop(0,    'rgba(255,255,255,0)');
    sg.addColorStop(0.45, 'rgba(255,255,255,0.7)');
    sg.addColorStop(0.5,  'rgba(255,255,255,1.0)');
    sg.addColorStop(0.55, 'rgba(255,255,255,0.7)');
    sg.addColorStop(1,    'rgba(255,255,255,0)');
    ctx.fillStyle = sg;
    ctx.fillRect(-width / 2, -length, width, length * 2);
    ctx.restore();
  };
  drawSpike(0,            center * 0.95, 3);
  drawSpike(Math.PI / 2,  center * 0.95, 3);
  drawSpike(Math.PI / 4,  center * 0.55, 1.5);
  drawSpike(-Math.PI / 4, center * 0.55, 1.5);

  return new THREE.CanvasTexture(canvas);
}

export const Star: React.FC<StarProps> = ({ star, introPhase = 3 }) => {
  const groupRef = useRef<THREE.Group>(null);
  const spriteRef = useRef<any>(null);
  const [hovered, setHovered] = useState(false);
  const router = useRouter();
  const { playHover, playClick } = useAudio();
  const setCameraTarget = useSceneStore((state) => state.setCameraTarget);
  const setActiveStarId = useSceneStore((state) => state.setActiveStarId);
  const setTransitioning = useSceneStore((state) => state.setTransitioning);

  const posX = star.position_x * 5.5;
  const posY = star.position_y * 3.5;
  const posZ = 0;

  const pulseSeed = useMemo(() => Math.random() * 100, []);
  const isAlcor = star.id === 'a3333333-3333-3333-3333-333333333333';
  const baseSize = isAlcor ? 0.45 : 0.8;

  const starTexture = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return createStarTexture();
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (spriteRef.current) {
      // Phase brightness:
      // 0 = very dim (barely visible)
      // 1 = dim (slightly brighter while lines draw)
      // 2 = BURST (max size + max brightness)
      // 3 = normal twinkling
      const isBurst  = introPhase === 2;
      const isNormal = introPhase === 3;

      const twinkle = isNormal
        ? 1 + Math.sin(time * 2.8 + pulseSeed) * 0.1 + Math.cos(time * 11.0 + pulseSeed * 1.3) * 0.05
        : 1.0; // static, no shimmer during dim or burst

      const dimMult   = 0; // hidden during phase 0 and 1, only burst/normal show stars
      const burstMult = isBurst ? 2.6 : 1.0;
      const hoverMult = hovered ? 1.9 : 1.0;
      const s = baseSize * twinkle * (isNormal ? hoverMult : burstMult);
      spriteRef.current.scale.set(s, s, 1);

      if (spriteRef.current.material) {
        spriteRef.current.material.rotation = isBurst ? 0 : (time * 0.15 + pulseSeed);
        const baseOpacity = isNormal
          ? (hovered ? 1.0 : 0.92 + Math.sin(time * 3.0 + pulseSeed) * 0.05)
          : isBurst
            ? 1.0
            : dimMult;
        spriteRef.current.material.opacity = baseOpacity;
      }
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (useSceneStore.getState().isTransitioning) return;
    playClick();
    setTransitioning(true);
    setCameraTarget([posX, posY - 2.8, 6.8], [posX, posY, 0]);
    setActiveStarId(star.id);
    setTimeout(() => { router.push(`/star/${star.id}`); }, 1200);
  };

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    setHovered(true);
    playHover();
    if (typeof window !== 'undefined') document.body.style.cursor = 'pointer';
    router.prefetch(`/star/${star.id}`);
  };

  const handlePointerOut = () => {
    setHovered(false);
    if (typeof window !== 'undefined') document.body.style.cursor = 'default';
  };

  return (
    <group ref={groupRef} position={[posX, posY, posZ]}>
      {/* Soft white ambient light */}
      <pointLight
        color="#dde8ff"
        intensity={hovered ? (isAlcor ? 1.2 : 2.4) : (isAlcor ? 0.4 : 0.8)}
        distance={isAlcor ? 3 : 5}
        decay={2}
      />

      {/* Star Sprite - sparkle texture */}
      {starTexture && (
        <sprite
          ref={spriteRef}
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <spriteMaterial
            map={starTexture}
            color="#ffffff"
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            sizeAttenuation
          />
        </sprite>
      )}

      {/* Label Tooltip */}
      <Html
        distanceFactor={6}
        position={[0, 0.45, 0]}
        center
        style={{ pointerEvents: 'none' }}
      >
        <div
          className="px-4 py-2 rounded-2xl border text-sm font-bold whitespace-nowrap flex items-center gap-2 backdrop-blur-md bg-zinc-950/90 text-white"
          style={{
            transition: 'all 0.3s ease',
            opacity: hovered ? 1 : 0,
            transform: `scale(${hovered ? 1 : 0.8})`,
            borderColor: 'rgba(255,255,255,0.2)',
            boxShadow: '0 0 20px rgba(200,210,255,0.15)'
          }}
        >
          {star.icon && <span className="text-base">{star.icon}</span>}
          <span>{star.name}</span>
        </div>
      </Html>
    </group>
  );
};
export default Star;
