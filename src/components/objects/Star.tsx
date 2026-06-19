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
  index: number;
  totalStars: number;
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

export const Star: React.FC<StarProps> = ({ star, index, totalStars, introPhase = 3 }) => {
  const groupRef = useRef<THREE.Group>(null);
  const spriteRef = useRef<any>(null);
  const stringLineRef = useRef<any>(null);
  const [hovered, setHovered] = useState(false);
  const router = useRouter();
  const { playHover, playClick } = useAudio();
  
  const setCameraTarget = useSceneStore((state) => state.setCameraTarget);
  const setActiveStarId = useSceneStore((state) => state.setActiveStarId);
  const setTransitioning = useSceneStore((state) => state.setTransitioning);
  const triggerTransition = useSceneStore((state) => state.triggerTransition);
  
  const appPhase = useSceneStore((state) => state.appPhase);
  const setLeaderboardStarLanded = useSceneStore((state) => state.setLeaderboardStarLanded);

  const posX = star.position_x * 5.5;
  const posY = star.position_y * 3.5;
  const posZ = 0;

  const currentPos = useRef(new THREE.Vector3(posX, posY, posZ));
  const targetPos = useRef(new THREE.Vector3(posX, posY, posZ));
  const stringFade = useRef(0.0);

  const lastPhase = useRef(appPhase);
  const transitionStartPos = useRef(new THREE.Vector3());
  const transitionOffscreenPos = useRef(new THREE.Vector3());
  const leaderboardStartTime = useRef(0);
  const hasNotifiedLanded = useRef(false);

  const pulseSeed = useMemo(() => Math.random() * 100, []);
  const isAlcor = star.id === 'a3333333-3333-3333-3333-333333333333';
  const baseSize = isAlcor ? 0.45 : 0.8;

  const starTexture = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return createStarTexture();
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 1. Check phase transition for leaderboard
    if (appPhase === 'leaderboard') {
      if (lastPhase.current !== 'leaderboard') {
        // Capture initial transition positions
        transitionStartPos.current.copy(currentPos.current);
        
        // Random outward offscreen direction
        const angle = (index / totalStars) * Math.PI * 2 + Math.sin(index) * 0.3;
        const distance = 14 + Math.random() * 4;
        transitionOffscreenPos.current.set(
          Math.cos(angle) * distance,
          Math.sin(angle) * distance,
          -4 - Math.random() * 4
        );
        
        leaderboardStartTime.current = time;
        hasNotifiedLanded.current = false;
        lastPhase.current = 'leaderboard';
      }
    } else {
      if (lastPhase.current === 'leaderboard') {
        lastPhase.current = appPhase;
      }
    }

    // 2. Determine target position
    if (appPhase === 'quizzes') {
      const spacing = 9.0 / Math.max(1, totalStars - 1);
      const startX = -4.5;
      const xTarget = startX + index * spacing;
      
      const Y_offsets = [0.0, 0.45, 0.2, 0.75, 0.3, 0.6, 0.1, 0.85];
      const offset = Y_offsets[index % Y_offsets.length];
      const yTarget = 3.55 - offset;
      
      targetPos.current.set(xTarget, yTarget, 0);
    } else if (appPhase === 'leaderboard') {
      let xTarget = 0;
      let yTarget = 0;
      let zTarget = 0;
      let targetFound = false;

      if (index < 5) {
        const el = document.getElementById(`leaderboard-rank-${index}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;

          const ndcX = (cx / window.innerWidth) * 2 - 1;
          const ndcY = -(cy / window.innerHeight) * 2 + 1;

          const vec = new THREE.Vector3(ndcX, ndcY, 0.5);
          vec.unproject(state.camera);
          vec.sub(state.camera.position).normalize();

          const dist = -state.camera.position.z / vec.z;
          const worldPos = new THREE.Vector3().copy(state.camera.position).addScaledVector(vec, dist);

          xTarget = worldPos.x;
          yTarget = worldPos.y;
          zTarget = worldPos.z;
          targetFound = true;
        }
      }

      if (!targetFound) {
        xTarget = -2.8;
        yTarget = 1.0 - index * 0.6;
        zTarget = 0;
      }

      targetPos.current.set(xTarget, yTarget, zTarget);
    } else {
      targetPos.current.set(posX, posY, posZ);
    }

    // 3. Smoothly interpolate position towards target
    if (appPhase === 'leaderboard') {
      const elapsed = time - leaderboardStartTime.current;
      if (elapsed < 0.8) {
        // Phase 0: Rapid fly out
        const t = Math.min(1.0, elapsed / 0.8);
        const ease = 1 - Math.pow(1 - t, 3); // easeOutCubic
        currentPos.current.lerpVectors(transitionStartPos.current, transitionOffscreenPos.current, ease);
      } else if (elapsed < 1.8) {
        // Phase 0.5: Wait offscreen for 1.0s (while the table animation completes)
        currentPos.current.copy(transitionOffscreenPos.current);
      } else if (elapsed < 3.2) {
        // Phase 1: Fly back and jump in (1.8s to 3.2s)
        const t = Math.min(1.0, (elapsed - 1.8) / 1.4);
        const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; // easeInOutCubic
        currentPos.current.lerpVectors(transitionOffscreenPos.current, targetPos.current, ease);
        
        // Add parabolic jumping arc
        const arcHeight = 3.5;
        currentPos.current.y += arcHeight * Math.sin(Math.PI * t);
      } else {
        // Phase 2: Landed, pin to real-time HTML element (handles resizing)
        currentPos.current.copy(targetPos.current);
        if (!hasNotifiedLanded.current) {
          hasNotifiedLanded.current = true;
          setLeaderboardStarLanded(index, true);
        }
      }
    } else {
      currentPos.current.lerp(targetPos.current, delta * 3.8);
    }

    // 4. Apply position to group
    if (groupRef.current) {
      groupRef.current.position.copy(currentPos.current);
    }

    // 5. Update hanging string buffer geometry & opacity
    const targetStringFade = appPhase === 'quizzes' ? 1.0 : 0.0;
    stringFade.current = THREE.MathUtils.lerp(stringFade.current, targetStringFade, delta * 3.8);

    if (stringLineRef.current) {
      const isVisible = stringFade.current > 0.005;
      stringLineRef.current.visible = isVisible;
      if (isVisible) {
        const pts = [
          new THREE.Vector3(0, 4.62 - currentPos.current.y, 0),
          new THREE.Vector3(0, 0, 0)
        ];
        stringLineRef.current.geometry.setFromPoints(pts);
        if (stringLineRef.current.material) {
          stringLineRef.current.material.opacity = 0.3 * stringFade.current;
        }
      }
    }

    // 6. Update scale & opacity of star sprite
    if (spriteRef.current) {
      if (appPhase === 'leaderboard') {
        const elapsed = time - leaderboardStartTime.current;
        let scaleMult = 1.0;
        let opacity = 1.0;

        if (index < 5) {
          if (elapsed < 1.8) {
            scaleMult = 1.0;
            opacity = 1.0;
          } else if (elapsed < 3.2) {
            const progress = (elapsed - 1.8) / 1.4;
            // Pulsing scale during transition back
            scaleMult = 1.0 + Math.sin(progress * Math.PI) * 0.45;
            opacity = 1.0;
          } else {
            // Landed gentle pulsing
            scaleMult = 1.0 + Math.sin(time * 3.2 + pulseSeed) * 0.08;
            opacity = 0.92 + Math.sin(time * 2.0 + pulseSeed) * 0.06;
          }
        } else {
          // Non top 5 stars fly out and fade away completely
          opacity = Math.max(0, 1.0 - elapsed / 0.8);
          scaleMult = opacity;
        }

        const s = baseSize * scaleMult;
        spriteRef.current.scale.set(s, s, 1);
        if (spriteRef.current.material) {
          spriteRef.current.material.rotation = time * 0.15 + pulseSeed;
          spriteRef.current.material.opacity = opacity;
        }
      } else {
        const isBurst  = introPhase === 2;
        const isNormal = introPhase === 3;

        const twinkle = isNormal
          ? 1 + Math.sin(time * 2.8 + pulseSeed) * 0.1 + Math.cos(time * 11.0 + pulseSeed * 1.3) * 0.05
          : 1.0;

        const dimMult   = 0;
        const burstMult = isBurst ? 2.6 : 1.0;
        const hoverMult = (hovered && appPhase !== 'quizzes') ? 1.9 : 1.0;
        const s = baseSize * twinkle * (isNormal ? hoverMult : burstMult);
        spriteRef.current.scale.set(s, s, 1);

        if (spriteRef.current.material) {
          spriteRef.current.material.rotation = isBurst ? 0 : (time * 0.15 + pulseSeed);
          const baseOpacity = isNormal
            ? ((hovered && appPhase !== 'quizzes') ? 1.0 : 0.92 + Math.sin(time * 3.0 + pulseSeed) * 0.05)
            : isBurst
              ? 1.0
              : dimMult;
          spriteRef.current.material.opacity = baseOpacity;
        }
      }
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (appPhase === 'quizzes' || appPhase === 'leaderboard') return;
    if (useSceneStore.getState().isTransitioning) return;
    playClick();
    triggerTransition([posX, posY - 2.8, 6.8], [posX, posY, 0]);
    setActiveStarId(star.id);
    setTimeout(() => { router.push(`/star/${star.id}`); }, 1000);
  };

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    if (appPhase === 'quizzes' || appPhase === 'leaderboard') return;
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
    <group ref={groupRef} position={[currentPos.current.x, currentPos.current.y, currentPos.current.z]}>
      {/* Hanging string (rope) from top edge of screen */}
      <line ref={stringLineRef}>
        <bufferGeometry />
        <lineBasicMaterial color="#818cf8" transparent={true} depthWrite={false} opacity={0} />
      </line>

      {/* Ambient point light reflecting the star's original color */}
      <pointLight
        color="#dde8ff"
        intensity={(hovered && appPhase !== 'quizzes' && appPhase !== 'leaderboard') ? (isAlcor ? 1.2 : 2.4) : (isAlcor ? 0.4 : 0.8)}
        distance={isAlcor ? 3 : 5}
        decay={2}
      />

      {/* Star Sprite - custom colored sparkle texture */}
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
      {appPhase !== 'quizzes' && appPhase !== 'leaderboard' && (
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
      )}
    </group>
  );
};
export default Star;
