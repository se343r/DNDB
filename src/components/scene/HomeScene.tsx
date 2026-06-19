'use client';

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useSceneStore } from '@/store/sceneStore';
import { useStars } from '@/hooks/useStars';
import { MOCK_STARS, MOCK_PLANETS } from '@/lib/mockData';
import { Star as StarType } from '@/lib/types';
import { generatePlanetCanvas } from '@/lib/planetTexture';

// ─── Canvas texture helpers ───────────────────────────────────────────────────

/** Radial glow sprite texture */
function createRadialGlow(hexColor: string, size = 256): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const c = size / 2;
  const ri = parseInt(hexColor.slice(1, 3), 16);
  const gi = parseInt(hexColor.slice(3, 5), 16);
  const bi = parseInt(hexColor.slice(5, 7), 16);
  const g = ctx.createRadialGradient(c, c, 0, c, c, c);
  g.addColorStop(0.00, `rgba(${ri},${gi},${bi},1.0)`);
  g.addColorStop(0.10, `rgba(${ri},${gi},${bi},0.85)`);
  g.addColorStop(0.30, `rgba(${ri},${gi},${bi},0.40)`);
  g.addColorStop(0.60, `rgba(${ri},${gi},${bi},0.08)`);
  g.addColorStop(1.00, `rgba(0,0,0,0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}



/**
 * Photon-ring texture (annular, transparent centre).
 * Drawn as a full circle with dark centre so the black sphere
 * does NOT need to mask it — the centre is already transparent.
 */
function createPhotonRingTex(): THREE.CanvasTexture {
  const S = 512;
  const canvas = document.createElement('canvas');
  canvas.width = S; canvas.height = S;
  const ctx = canvas.getContext('2d')!;
  const c = S / 2;
  ctx.clearRect(0, 0, S, S);

  // Outer lensing haze (violet)
  const haze = ctx.createRadialGradient(c, c, c * 0.56, c, c, c * 0.99);
  haze.addColorStop(0.00, 'rgba(0,0,0,0)');
  haze.addColorStop(0.20, 'rgba(110,65,240,0.22)');
  haze.addColorStop(0.60, 'rgba(80,45,180,0.10)');
  haze.addColorStop(1.00, 'rgba(0,0,0,0)');
  ctx.fillStyle = haze;
  ctx.fillRect(0, 0, S, S);

  // Photon ring annulus (gold)
  const rI = c * 0.60, rO = c * 0.73;
  const ring = ctx.createRadialGradient(c, c, rI, c, c, rO);
  ring.addColorStop(0.00, 'rgba(255,200, 90,0.0)');
  ring.addColorStop(0.25, 'rgba(255,240,160,0.9)');
  ring.addColorStop(0.50, 'rgba(255,255,220,1.0)');
  ring.addColorStop(0.75, 'rgba(255,220,130,0.9)');
  ring.addColorStop(1.00, 'rgba(255,160, 50,0.0)');
  ctx.fillStyle = ring;
  ctx.beginPath();
  ctx.arc(c, c, rO + 3, 0, Math.PI * 2);
  ctx.arc(c, c, rI - 3, 0, Math.PI * 2, true);
  ctx.fill();

  // Inner warm edge glow
  const inner = ctx.createRadialGradient(c, c, c * 0.38, c, c, c * 0.61);
  inner.addColorStop(0.00, 'rgba(0,0,0,0)');
  inner.addColorStop(0.60, 'rgba(255,105,25,0.28)');
  inner.addColorStop(1.00, 'rgba(0,0,0,0)');
  ctx.fillStyle = inner;
  ctx.beginPath();
  ctx.arc(c, c, c * 0.61, 0, Math.PI * 2);
  ctx.fill();

  return new THREE.CanvasTexture(canvas);
}

// ─── Particle Accretion Disk ──────────────────────────────────────────────────
const ParticleAccretionDisk: React.FC<{ parentRef: React.RefObject<THREE.Group> }> = ({ parentRef }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const homeTransitionState = useSceneStore((s) => s.homeTransitionState);
  const quizActive = useSceneStore((s) => s.quizActive);
  const convergeElapsed = useRef(0);
  const supernovaElapsed = useRef(0);
  const particleCount = 32000;

  // Generate particle coordinate data once
  const [positions, colors, sizes, particleData] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const cols = new Float32Array(particleCount * 3);
    const szs = new Float32Array(particleCount);
    const data = [];

    const colorPalette = (r: number) => {
      // Inner: bright white-hot -> orange-yellow
      if (r < 0.975) {
        return new THREE.Color('#ffffff').lerp(new THREE.Color('#ffc14d'), (r - 0.65) / 0.325);
      } 
      // Middle: hot orange -> deep red
      else if (r < 1.725) {
        return new THREE.Color('#ffa64d').lerp(new THREE.Color('#ff2200'), (r - 0.975) / 0.75);
      } 
      // Outer: magenta -> dark purple
      else {
        return new THREE.Color('#ff33cc').lerp(new THREE.Color('#4d0080'), (r - 1.725) / 0.9);
      }
    };

    for (let i = 0; i < particleCount; i++) {
      // Bias radius distribution towards the center for a dense inner core and thin, fading outer rim
      const r = 0.65 + Math.pow(Math.random(), 1.4) * 1.975;
      const theta = Math.random() * Math.PI * 2;
      const speed = 0.28 / Math.sqrt(r); // Keplerian speed
      // Taper the thickness quadratically (power of 1.8) so the outer rim is extremely thin
      const yOffset = (Math.random() - 0.5) * 0.45 * Math.pow(1.0 - (r - 0.65) / 1.975, 1.8);

      // Save initial state
      data.push({ r, theta, speed, yOffset });

      // Position
      pos[i * 3] = Math.cos(theta) * r;
      pos[i * 3 + 1] = yOffset;
      pos[i * 3 + 2] = Math.sin(theta) * r;

      // Color
      const c = colorPalette(r);
      cols[i * 3] = c.r;
      cols[i * 3 + 1] = c.g;
      cols[i * 3 + 2] = c.b;

      // Size
      szs[i] = 0.02 + Math.random() * 0.04;
    }

    return [pos, cols, szs, data];
  }, []);

  const quizProgressRef = useRef(0);

  // Update positions in render loop
  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const geo = pointsRef.current.geometry;
    const posArr = geo.attributes.position.array as Float32Array;
    const camera = state.camera;

    // Get camera views
    const viewMatrix = camera.matrixWorldInverse;
    const invViewMatrix = camera.matrixWorld;

    const tempV = new THREE.Vector3();
    const bhCam = new THREE.Vector3();

    const bhWorldPos = new THREE.Vector3();
    const groupInvMatrix = new THREE.Matrix4();
    if (parentRef.current) {
      parentRef.current.getWorldPosition(bhWorldPos);
      groupInvMatrix.copy(parentRef.current.matrixWorld).invert();
    }

    let progress = 0;
    let speedMult = 1.0;
    
    if (homeTransitionState === 'gathering') {
      progress = 1.0;
      supernovaElapsed.current = 0;
    } else if (homeTransitionState === 'supernova') {
      supernovaElapsed.current += delta;
      const p = Math.min(1.0, Math.max(0, (supernovaElapsed.current - 0.3) / 0.7));
      progress = 1.0 - Math.sin(p * Math.PI / 2);
      speedMult = 3.0 * (1.0 - p) + 1.0;
    } else if (homeTransitionState === 'converging') {
      convergeElapsed.current += delta;
      progress = Math.min(1.0, convergeElapsed.current / 0.6);
      speedMult = 1.0 + progress * 7.5;
    } else if (homeTransitionState === 'shooting' || homeTransitionState === 'flash' || homeTransitionState === 'done') {
      progress = 1.0;
      speedMult = 8.5;
    } else {
      convergeElapsed.current = 0;
      supernovaElapsed.current = 0;
    }

    const radMult = 1.0 - Math.pow(progress, 1.6);

    const targetProgress = (quizActive && homeTransitionState !== 'converging' && homeTransitionState !== 'shooting' && homeTransitionState !== 'flash' && homeTransitionState !== 'done') ? 1.0 : 0.0;
    quizProgressRef.current = THREE.MathUtils.lerp(quizProgressRef.current, targetProgress, delta * 3.0);
    const quizP = quizProgressRef.current;
    
    const currentX = THREE.MathUtils.lerp(Math.PI / 2.4, 0, quizP);
    const currentZ = THREE.MathUtils.lerp(-Math.PI / 5, 0, quizP);
    const currentEuler = new THREE.Euler(currentX, 0, currentZ);

    // Get black hole position in camera space
    bhCam.copy(bhWorldPos).applyMatrix4(viewMatrix);

    for (let i = 0; i < particleCount; i++) {
      const p = particleData[i];
      p.theta += delta * p.speed * 2.2 * speedMult;

      // Check if we should clear the orbit path of the quiz planet (around R = 1.66)
      const inOrbitGap = quizActive && Math.abs(p.r - 1.66) < 0.10;

      if (inOrbitGap) {
        posArr[i * 3] = 0;
        posArr[i * 3 + 1] = 9999;
        posArr[i * 3 + 2] = 0;
        continue;
      }

      const currentR = p.r * radMult;

      // 1. Calculate local position
      tempV.set(
        Math.cos(p.theta) * currentR,
        p.yOffset * radMult,
        Math.sin(p.theta) * currentR
      );

      // 2. Rotate to world space (using the disk's tilt angle) and add parent world matrix
      tempV.applyEuler(currentEuler);
      if (parentRef.current) {
        tempV.applyMatrix4(parentRef.current.matrixWorld);
      }

      // 3. Transform to camera space
      tempV.applyMatrix4(viewMatrix);

      // dx, dy are screen coordinates relative to the black hole center
      const dx = tempV.x - bhCam.x;
      const dy = tempV.y - bhCam.y;
      const dz = tempV.z - bhCam.z; // negative Z means closer to camera

      const r2D = Math.sqrt(dx * dx + dy * dy);

      // Gravitational lensing:
      // If the particle is behind the event horizon (dz < 0.15 in camera space, meaning it is further than the BH center)
      // we deflect its coordinates outwards.
      if (dz < 0.15 && r2D > 0.05) {
        const lensRadius = 0.585;
        const strength = 0.28 * radMult; // Lensing warp coefficient
        
        // Einstein deflection warp factor
        const warp = 1.0 + (strength * lensRadius) / (r2D * r2D + 0.01);
        
        tempV.x = bhCam.x + dx * warp;
        tempV.y = bhCam.y + dy * warp;
      }

      // 4. Transform back to world space
      tempV.applyMatrix4(invViewMatrix);

      // 5. Transform back to local space of this points object
      if (parentRef.current) {
        tempV.applyMatrix4(groupInvMatrix);
      }

      // Write to position buffer
      posArr[i * 3] = tempV.x;
      posArr[i * 3 + 1] = tempV.y;
      posArr[i * 3 + 2] = tempV.z;
    }

    geo.attributes.position.needsUpdate = true;
  });

  // Soft particle circle texture
  const particleTex = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 32; canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, 'rgba(255,255,255,1.0)');
    g.addColorStop(0.25, 'rgba(255,240,220,0.85)');
    g.addColorStop(0.55, 'rgba(255,180,120,0.3)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 32, 32);
    return new THREE.CanvasTexture(canvas);
  }, []);

  return (
    <points ref={pointsRef} rotation={[0, 0, 0]} renderOrder={3}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      {particleTex && (
        <pointsMaterial
          size={0.06}
          map={particleTex}
          vertexColors
          transparent
          opacity={0.88}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      )}
    </points>
  );
};

// ─── QuizPlanet Component ─────────────────────────────────────────────────────
const QuizPlanet: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const quizActive = useSceneStore((s) => s.quizActive);
  const quizPhase = useSceneStore((s) => s.quizPhase);
  const matchedPlanetId = useSceneStore((s) => s.matchedPlanetId);

  const [texture, setTexture] = React.useState<THREE.CanvasTexture | null>(null);
  const scaleRef = useRef(0);

  // Generate canvas texture based on phase and seed
  useEffect(() => {
    if (!quizActive) {
      setTexture(null);
      scaleRef.current = 0;
      return;
    }

    if (quizPhase === 'spawning' || quizPhase === 'quiz') {
      // Generate stone texture
      const canvas = generatePlanetCanvas(9999, 512, 256, true);
      if (canvas) {
        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.needsUpdate = true;
        setTexture(tex);
      }
    } else if (quizPhase === 'matched' && matchedPlanetId) {
      // Generate matched planet texture
      const p = MOCK_PLANETS.find((planet) => planet.id === matchedPlanetId);
      if (p) {
        const canvas = generatePlanetCanvas(p.planet_seed);
        if (canvas) {
          const tex = new THREE.CanvasTexture(canvas);
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.wrapS = THREE.RepeatWrapping;
          tex.wrapT = THREE.ClampToEdgeWrapping;
          tex.needsUpdate = true;
          setTexture(tex);
        }
      }
    }
  }, [quizActive, quizPhase, matchedPlanetId]);

  // Orbit angle
  const groupRef = useRef<THREE.Group>(null);
  const angleRef = useRef(0);
  const spawnTimer = useRef(0);
  const quizProgressRef = useRef(0);
  const R = 1.66;

  useFrame((state, delta) => {
    if (!quizActive) return;

    // Spin planet
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.35;
    }

    // Phase animation
    if (quizPhase === 'spawning') {
      spawnTimer.current += delta;
      const progress = Math.min(1.0, spawnTimer.current / 1.5);
      scaleRef.current = progress * 0.152;
      // Auto-transition to quiz after 1.5s
      if (spawnTimer.current >= 1.5) {
        useSceneStore.getState().setQuizPhase('quiz');
        spawnTimer.current = 0;
      }
    } else if (quizPhase === 'quiz' || quizPhase === 'matched') {
      scaleRef.current = 0.152;
      angleRef.current += delta * 0.15;
    } else {
      spawnTimer.current = 0;
    }

    const targetProgress = (quizActive && quizPhase !== 'done') ? 1.0 : 0.0;
    quizProgressRef.current = THREE.MathUtils.lerp(quizProgressRef.current, targetProgress, delta * 3.0);
    const quizP = quizProgressRef.current;
    
    const currentX = THREE.MathUtils.lerp(Math.PI / 2.4, 0, quizP);
    const currentZ = THREE.MathUtils.lerp(-Math.PI / 5, 0, quizP);
    const currentEuler = new THREE.Euler(currentX, 0, currentZ);

    // Update group position every frame (orbit)
    // Update position and scale imperatively
    if (groupRef.current) {
      const pos = new THREE.Vector3(
        Math.cos(angleRef.current) * R,
        0,
        Math.sin(angleRef.current) * R
      ).applyEuler(currentEuler);
      groupRef.current.position.copy(pos);

      // Save values to scene.userData for HomeCameraController
      const worldPos = new THREE.Vector3();
      groupRef.current.getWorldPosition(worldPos);
      state.scene.userData.quizPlanetPosition = worldPos;
      state.scene.userData.quizPlanetAngle = angleRef.current;
    }
    if (meshRef.current) {
      meshRef.current.scale.setScalar(scaleRef.current);
    }
  });


  if (!quizActive || !texture) return null;

  return (
    <group ref={groupRef}>
      {/* Glow halo */}
      <mesh>
        <sphereGeometry args={[0.185, 32, 32]} />
        <meshBasicMaterial
          color={quizPhase === 'matched' ? '#8b5cf6' : '#999999'}
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Planet Body */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial map={texture} roughness={0.7} metalness={0.1} />
      </mesh>
    </group>
  );
};

// ─── BlackHole Component ──────────────────────────────────────────────────────
const BlackHole: React.FC = () => {
  const groupRef  = useRef<THREE.Group>(null);
  const ringRef   = useRef<THREE.Sprite>(null);
  const coreRef   = useRef<THREE.Mesh>(null);

  const homeTransitionState = useSceneStore((s) => s.homeTransitionState);
  const quizActive = useSceneStore((s) => s.quizActive);
  const quizPhase = useSceneStore((s) => s.quizPhase);

  const convergeElapsed = useRef(0);
  const supernovaElapsed = useRef(0);
  const bhPositionX = useRef(0);

  // Textures
  const photonTex = useMemo(() => typeof window !== 'undefined' ? createPhotonRingTex()   : null, []);
  const glowTex   = useMemo(() => typeof window !== 'undefined' ? createRadialGlow('#ff6622', 512) : null, []);

  useFrame(({ clock, scene }, delta) => {
    const t = clock.getElapsedTime();

    // Smoothly slide black hole group left in quiz mode
    const targetX = (quizActive && quizPhase !== 'done') ? -2.0 : 0;
    bhPositionX.current = THREE.MathUtils.lerp(bhPositionX.current, targetX, delta * 3.0);
    if (groupRef.current) {
      groupRef.current.position.x = bhPositionX.current;

      // Save black hole world position to scene.userData
      const worldPos = new THREE.Vector3();
      groupRef.current.getWorldPosition(worldPos);
      scene.userData.blackHolePosition = worldPos;
    }

    // Animate core and photon ring during transition
    let scale = 1.0;
    if (homeTransitionState === 'gathering') {
      scale = 0;
      supernovaElapsed.current = 0;
    } else if (homeTransitionState === 'supernova') {
      supernovaElapsed.current += delta;
      // Spawn from explosion core: scales up from 0 to 1.0 over 1.0s, starting after 0.15s of the explosion
      const progress = Math.min(1.0, Math.max(0, (supernovaElapsed.current - 0.15) / 0.85));
      scale = Math.sin(progress * Math.PI / 2);
    } else if (homeTransitionState === 'converging') {
      convergeElapsed.current += delta;
      const progress = Math.min(1.0, convergeElapsed.current / 0.6);
      // Core expands slightly then collapses to 0
      scale = Math.max(0, 1.0 + 0.35 * Math.sin(progress * Math.PI) - progress * 1.05);
    } else if (homeTransitionState === 'shooting' || homeTransitionState === 'flash' || homeTransitionState === 'done') {
      scale = 0;
    } else {
      convergeElapsed.current = 0;
      supernovaElapsed.current = 0;
    }

    if (coreRef.current) {
      coreRef.current.scale.set(scale, scale, scale);
    }

    // Photon ring breathes & scales down during transition
    if (ringRef.current) {
      const s = (1.85 + Math.sin(t * 1.1) * 0.036) * scale;
      ringRef.current.scale.set(s, s, 1);
    }
  });

  if (homeTransitionState === 'flash' || homeTransitionState === 'done') {
    return null;
  }

  return (
    <group ref={groupRef}>
      {/* ══ 1. Wide outer ambient haze (background, no depth) ══ */}
      {glowTex && (
        <sprite scale={[6.0, 6.0, 1]} renderOrder={0}>
          <spriteMaterial map={glowTex} color="#ff5511" transparent opacity={0.12}
            blending={THREE.AdditiveBlending} depthTest={false} depthWrite={false} />
        </sprite>
      )}

      {/* ══ 3D Particle Accretion Disk (Keplerian orbits) ══ */}
      <ParticleAccretionDisk parentRef={groupRef} />

      {/* ══ 5. Black core sphere (writes depth, renderOrder 4) ══ */}
      <mesh ref={coreRef} renderOrder={4}>
        <sphereGeometry args={[0.585, 64, 64]} />
        <meshBasicMaterial color="#000000" transparent={true} opacity={1.0} depthTest={true} depthWrite={true} />
      </mesh>

      {/* ══ 6. Photon ring — depthTest:true so sphere masks its center ══
              Sphere at renderOrder=4 already wrote to depth buffer.
              This sprite at renderOrder=5 with depthTest:true → center pixels fail depth test
              → only the annular ring outside the sphere is visible. */}
      {photonTex && (
        <sprite ref={ringRef} scale={[1.85, 1.85, 1]} renderOrder={5}>
          <spriteMaterial map={photonTex} transparent opacity={0.98}
            blending={THREE.AdditiveBlending} depthTest={true} depthWrite={false} />
        </sprite>
      )}

      {/* ══ Lighting ══ */}
      <pointLight color="#ff7722" intensity={6}   distance={18} decay={2} />
      <pointLight color="#9933ff" intensity={2.5} distance={9}  decay={2} />

      {/* ══ Personality Quiz Planet ══ */}
      <QuizPlanet />
    </group>
  );
};

// ─── Star configurations ──────────────────────────────────────────────────────
// 5 fixed orbital planes (pitch X + lean Z for diagonal-left variety)
// plane index assigned to each star (0-4)
const ORBIT_PLANES = [
  new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(Math.PI / 2.4,  0,  -Math.PI / 5)),   // plane 0: same as disk (base)
  new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(Math.PI / 3.2,  0,  -Math.PI / 8)),   // plane 1: shallower tilt
  new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(Math.PI / 1.9,  0,  -Math.PI / 3.5)), // plane 2: steeper tilt
  new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(Math.PI / 2.4,  0,   Math.PI / 9)),   // plane 3: lean right slightly
  new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(Math.PI / 2.0,  0,  -Math.PI / 2.5)), // plane 4: strong left lean
];

const STAR_CONFIGS = [
  { radius: 1.3, speed: 0.50, emissive: '#ffffff', glow: '#aaddff', plane: 0 },
  { radius: 1.7, speed: 0.43, emissive: '#ffe8aa', glow: '#ffcc66', plane: 1 },
  { radius: 2.0, speed: 0.38, emissive: '#cceeff', glow: '#88ccff', plane: 2 },
  { radius: 2.3, speed: 0.34, emissive: '#ffddff', glow: '#cc88ff', plane: 3 },
  { radius: 2.6, speed: 0.30, emissive: '#ffffff', glow: '#ddeeff', plane: 4 },
  { radius: 2.9, speed: 0.27, emissive: '#ffeedd', glow: '#ffbb88', plane: 1 },
  { radius: 3.2, speed: 0.24, emissive: '#ddeeff', glow: '#88aaff', plane: 3 },
  { radius: 3.5, speed: 0.21, emissive: '#fffacc', glow: '#ffee55', plane: 2 },
] as const;

// ─── OrbitalStar ─────────────────────────────────────────────────────────────
interface OrbitalStarProps {
  cfg:           typeof STAR_CONFIGS[number];
  index:         number;
  glowTex:       THREE.CanvasTexture | null;
  transitionRef: React.MutableRefObject<boolean>;
  positionRef:   React.MutableRefObject<THREE.Vector3>;
}

const OrbitalStar: React.FC<OrbitalStarProps> = ({ cfg, index, glowTex, transitionRef, positionRef }) => {
  const groupRef  = useRef<THREE.Group>(null);
  const meshRef   = useRef<THREE.Mesh>(null);
  const spriteRef = useRef<THREE.Sprite>(null);
  const lightRef  = useRef<THREE.PointLight>(null);
  const angleRef  = useRef((index * Math.PI * 2) / 8 + index * 0.31);
  const seed      = index * 137.508 + 0.5;
  const R         = 0.22;

  // Each star uses its assigned fixed orbital plane
  const orbitMat = useMemo(() => ORBIT_PLANES[cfg.plane], [cfg.plane]);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    if (transitionRef.current) {
      groupRef.current.position.lerp(new THREE.Vector3(0, 0, 0), delta * 3.8);
      positionRef.current.copy(groupRef.current.position);
      if (spriteRef.current) {
        const s = R * 12 + Math.sin(t * 15 + seed) * R * 4;
        spriteRef.current.scale.set(s, s, 1);
        (spriteRef.current.material as THREE.SpriteMaterial).opacity = 0.9;
      }
      return;
    }

    angleRef.current += delta * cfg.speed;
    const pos = new THREE.Vector3(
      Math.cos(angleRef.current) * cfg.radius,
      Math.sin(angleRef.current) * cfg.radius,
      0,
    ).applyMatrix4(orbitMat);

    groupRef.current.position.copy(pos);
    positionRef.current.copy(pos);

    const pulse = 1.0 + Math.sin(t * 2.5 + seed) * 0.18;
    if (spriteRef.current) {
      const s = R * 5.5 * pulse;
      spriteRef.current.scale.set(s, s, 1);
      (spriteRef.current.material as THREE.SpriteMaterial).opacity =
        0.65 + Math.sin(t * 3.1 + seed) * 0.15;
    }
    if (lightRef.current) lightRef.current.intensity = 2.5 * pulse;
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.9;
      meshRef.current.rotation.x += delta * 0.4;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[R, 24, 24]} />
        <meshStandardMaterial color={cfg.emissive} emissive={cfg.emissive}
          emissiveIntensity={5} roughness={0.05} metalness={0.1} />
      </mesh>
      {glowTex && (
        <sprite ref={spriteRef} scale={[R * 5.5, R * 5.5, 1]}>
          <spriteMaterial map={glowTex} color={cfg.glow} transparent opacity={0.65}
            blending={THREE.AdditiveBlending} depthWrite={false} />
        </sprite>
      )}
      <pointLight ref={lightRef} color={cfg.glow} intensity={2.5} distance={4.5} decay={2} />
    </group>
  );
};

// ─── OrbitTrail ──────────────────────────────────────────────────────
const OrbitTrail: React.FC<{ radius: number; plane: number }> = ({ radius, plane }) => {
  const line = useMemo(() => {
    const m = ORBIT_PLANES[plane];
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0).applyMatrix4(m));
    }
    return new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({
        color: '#1a2a44', transparent: true, opacity: 0.22,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })
    );
  }, [radius]);
  return <primitive object={line} />;
};

// ─── GatheringStars ───────────────────────────────────────────────────────────
interface GatheringStarsProps {
  active: boolean;
  glowTex: THREE.CanvasTexture | null;
  duration: number;
  stars: StarType[];
}

const GatheringStars: React.FC<GatheringStarsProps> = ({ active, glowTex, duration, stars }) => {
  const groupRef = useRef<THREE.Group>(null);
  const elapsed = useRef(0);

  useEffect(() => {
    if (active) elapsed.current = 0;
  }, [active]);

  useFrame((_, delta) => {
    if (!active || !groupRef.current) return;
    elapsed.current += delta;
    const progress = Math.min(1.0, elapsed.current / duration);

    // Spiraling inwards:
    // radius starts at the star's initial radius and shrinks to 0.
    // spin angle starts at the star's initial angle and rotates.
    const easeProgress = Math.pow(progress, 1.4); // accelerates slightly near the center
    const radMult = 1.0 - easeProgress;

    groupRef.current.children.forEach((child, index) => {
      const star = stars[index];
      if (!star) return;

      const startX = star.position_x * 5.5;
      const startY = star.position_y * 3.5;

      const startR = Math.sqrt(startX * startX + startY * startY);
      const startAngle = Math.atan2(startY, startX);

      // Spiral rotation: rotate by 1.5 PI
      const angle = startAngle + progress * Math.PI * 1.5;
      const currentR = startR * radMult;

      child.position.set(
        Math.cos(angle) * currentR,
        Math.sin(angle) * currentR,
        0
      );

      // Pulse size and fade out opacity when extremely close
      const sprite = child.children[1] as THREE.Sprite;
      if (sprite && sprite.material) {
        const baseSize = 0.22 * 5.5;
        const scale = baseSize * (1.0 - easeProgress * 0.3);
        sprite.scale.set(scale, scale, 1);
        (sprite.material as THREE.SpriteMaterial).opacity = 0.85 * (1.0 - easeProgress);
      }
      
      const mesh = child.children[0] as THREE.Mesh;
      if (mesh && mesh.material) {
        mesh.scale.setScalar(1.0 - easeProgress);
      }
    });
  });

  if (!active) return null;

  return (
    <group ref={groupRef}>
      {stars.map((star, i) => {
        const R = 0.22;
        return (
          <group key={star.id || i}>
            <mesh>
              <sphereGeometry args={[R, 24, 24]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive={star.color}
                emissiveIntensity={5}
                roughness={0.05}
                metalness={0.1}
              />
            </mesh>
            {glowTex && (
              <sprite scale={[R * 5.5, R * 5.5, 1]}>
                <spriteMaterial
                  map={glowTex}
                  color={star.color}
                  transparent
                  opacity={0.8}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                />
              </sprite>
            )}
          </group>
        );
      })}
    </group>
  );
};

// ─── Supernova ───────────────────────────────────────────────────────────────
interface SupernovaProps {
  active: boolean;
  glowTex: THREE.CanvasTexture | null;
  duration: number;
  onComplete: () => void;
}

const Supernova: React.FC<SupernovaProps> = ({ active, glowTex, duration, onComplete }) => {
  const groupRef = useRef<THREE.Group>(null);
  const elapsed = useRef(0);
  const done = useRef(false);

  // Load radial textures or use glowTex
  const blastTex = useMemo(() => typeof window !== 'undefined' ? createRadialGlow('#ffa64d', 256) : null, []);
  const outerTex = useMemo(() => typeof window !== 'undefined' ? createRadialGlow('#ff33cc', 256) : null, []);

  useEffect(() => {
    if (active) {
      elapsed.current = 0;
      done.current = false;
    }
  }, [active]);

  useFrame((_, delta) => {
    if (!active || done.current || !groupRef.current) return;
    elapsed.current += delta;
    const t = Math.min(1.0, elapsed.current / duration);

    // Easing for expansion: fast initial blast, slowing down
    const easeOutQuad = 1.0 - (1.0 - t) * (1.0 - t);
    const easeOutCubic = 1.0 - Math.pow(1.0 - t, 3.0);

    // 1. Center White Core: expands from 0.1 to 4.0, fades out
    const core = groupRef.current.children[0] as THREE.Sprite;
    if (core) {
      const s = THREE.MathUtils.lerp(0.1, 4.0, easeOutQuad);
      core.scale.set(s, s, 1);
      (core.material as THREE.SpriteMaterial).opacity = Math.max(0, 1.0 - t * 1.5);
    }

    // 2. Middle Orange Shockwave: expands from 0.1 to 8.0, fades out
    const shockwave = groupRef.current.children[1] as THREE.Sprite;
    if (shockwave) {
      const s = THREE.MathUtils.lerp(0.1, 8.0, easeOutCubic);
      shockwave.scale.set(s, s, 1);
      (shockwave.material as THREE.SpriteMaterial).opacity = Math.max(0, 1.0 - t * 1.2);
    }

    // 3. Outer Purple Glow: expands from 0.5 to 12.0, fades out slowly
    const outer = groupRef.current.children[2] as THREE.Sprite;
    if (outer) {
      const s = THREE.MathUtils.lerp(0.5, 12.0, easeOutQuad);
      outer.scale.set(s, s, 1);
      (outer.material as THREE.SpriteMaterial).opacity = Math.max(0, 0.7 * (1.0 - t));
    }

    if (t >= 1.0 && !done.current) {
      done.current = true;
      onComplete();
    }
  });

  if (!active) return null;

  return (
    <group ref={groupRef}>
      {/* Sprite 1: White Core */}
      {glowTex && (
        <sprite scale={[0.1, 0.1, 1]} renderOrder={10}>
          <spriteMaterial map={glowTex} color="#ffffff" transparent opacity={1.0}
            blending={THREE.AdditiveBlending} depthWrite={false} />
        </sprite>
      )}

      {/* Sprite 2: Orange Shockwave */}
      {blastTex && (
        <sprite scale={[0.1, 0.1, 1]} renderOrder={9}>
          <spriteMaterial map={blastTex} color="#ffa500" transparent opacity={1.0}
            blending={THREE.AdditiveBlending} depthWrite={false} />
        </sprite>
      )}

      {/* Sprite 3: Purple Outer Glow */}
      {outerTex && (
        <sprite scale={[0.5, 0.5, 1]} renderOrder={8}>
          <spriteMaterial map={outerTex} color="#cc33ff" transparent opacity={0.7}
            blending={THREE.AdditiveBlending} depthWrite={false} />
        </sprite>
      )}
    </group>
  );
};

// ─── ShootBeam ────────────────────────────────────────────────────────────────
const ShootBeam: React.FC<{
  active: boolean;
  glowTex: THREE.CanvasTexture | null;
  onComplete: () => void;
}> = ({ active, glowTex, onComplete }) => {
  const spriteRef = useRef<THREE.Sprite>(null);
  const elapsed   = useRef(0);
  const done      = useRef(false);

  useEffect(() => { if (active) { elapsed.current = 0; done.current = false; } }, [active]);

  useFrame((_, delta) => {
    if (!active || !spriteRef.current || done.current) return;
    elapsed.current += delta;
    const t = Math.min(1.0, elapsed.current / 0.3);
    const scale = THREE.MathUtils.lerp(0.5, 22.0, t * t);
    const opacity = t < 0.65 ? 1.0 : THREE.MathUtils.lerp(1.0, 0.0, (t - 0.65) / 0.35);
    spriteRef.current.scale.set(scale, scale, 1);
    spriteRef.current.position.z = THREE.MathUtils.lerp(0, 5.0, t);
    (spriteRef.current.material as THREE.SpriteMaterial).opacity = opacity;
    if (t >= 1.0 && !done.current) { done.current = true; onComplete(); }
  });

  if (!active) return null;
  return (
    <sprite ref={spriteRef} scale={[0.5, 0.5, 1]}>
      <spriteMaterial map={glowTex ?? undefined} color="#ffffff"
        transparent opacity={1} blending={THREE.AdditiveBlending} depthWrite={false} />
    </sprite>
  );
};

// ─── HomeCameraController ─────────────────────────────────────────────────────
// Smoothly zooms toward the accretion disk during quiz mode using a 1.0s hardcoded duration
const HomeCameraController: React.FC = () => {
  const quizActive = useSceneStore((s) => s.quizActive);
  const quizPhase = useSceneStore((s) => s.quizPhase);
  const { camera, scene } = useThree();

  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const quizProgressRef = useRef(0);

  const isQuizView = quizActive && quizPhase !== 'idle' && quizPhase !== 'done';

  useFrame((_, delta) => {
    const target = isQuizView ? 1.0 : 0.0;
    quizProgressRef.current = THREE.MathUtils.lerp(quizProgressRef.current, target, delta * 3.0);
    const p = quizProgressRef.current;

    // Default target camera position and lookAt (idle)
    const defaultPos = new THREE.Vector3(0, 0, 8);
    const defaultLook = new THREE.Vector3(0, 0, 0);

    // Compute dynamic quiz target camera position and lookAt
    const bhPos = scene.userData.blackHolePosition || new THREE.Vector3(isQuizView ? -2.0 : 0, 0, 0);
    const planetPos = scene.userData.quizPlanetPosition || new THREE.Vector3(isQuizView ? -2.0 + 1.66 : 0, 0, 0);
    const planetAngle = scene.userData.quizPlanetAngle || 0;

    // Dynamic disk Euler (transitioning to [0, 0, 0] at p = 1)
    const currentX = THREE.MathUtils.lerp(Math.PI / 2.4, 0, p);
    const currentZ = THREE.MathUtils.lerp(-Math.PI / 5, 0, p);
    const currentEuler = new THREE.Euler(currentX, 0, currentZ);

    // Camera is positioned at a 20-degree elevation relative to the orbital plane
    // Looking towards the black hole (bhPos)
    // Aligned with the planet's angle (offsetAngle = 0.0)
    // Orbital radius = 3.8 (outside planet's orbit of 1.66)
    const offsetAngle = 0.0;
    const R_cam = 3.8;
    const elevationRad = (20 * Math.PI) / 180;
    const sinElev = Math.sin(elevationRad);
    const cosElev = Math.cos(elevationRad);

    const localCamPos = new THREE.Vector3(
      Math.cos(planetAngle - offsetAngle) * R_cam * cosElev,
      R_cam * sinElev,
      Math.sin(planetAngle - offsetAngle) * R_cam * cosElev
    ).applyEuler(currentEuler);

    const quizPos = new THREE.Vector3().copy(bhPos).add(localCamPos);
    const quizLook = planetPos;

    // Interpolation factor: Cubic easeInOut
    const ease = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

    camera.position.lerpVectors(defaultPos, quizPos, ease);
    currentLookAt.current.lerpVectors(defaultLook, quizLook, ease);
    camera.lookAt(currentLookAt.current);
  });

  return null;
};

// ─── HomeScene ────────────────────────────────────────────────────────────────
export const HomeScene: React.FC = () => {
  const homeTransitionState    = useSceneStore((s) => s.homeTransitionState);
  const setHomeTransitionState = useSceneStore((s) => s.setHomeTransitionState);
  const setAppPhase            = useSceneStore((s) => s.setAppPhase);
  const quizActive             = useSceneStore((s) => s.quizActive);

  const glowTex = useMemo(() => typeof window !== 'undefined' ? createRadialGlow('#ffffff') : null, []);

  const { stars } = useStars();
  const activeStars = useMemo(() => {
    return stars && stars.length > 0 ? stars : MOCK_STARS;
  }, [stars]);

  const convergeElapsed = useRef(0);
  const convergeDone    = useRef(false);
  const gatheringElapsed = useRef(0);
  const gatheringDone    = useRef(false);

  useFrame((_, delta) => {
    // 1. Gathering stars entry transition
    if (homeTransitionState === 'gathering') {
      gatheringElapsed.current += delta;
      if (gatheringElapsed.current >= 1.2 && !gatheringDone.current) {
        gatheringDone.current = true;
        setHomeTransitionState('supernova');
      }
    }

    // 2. Converging stars exit transition
    if (homeTransitionState !== 'converging') return;
    convergeElapsed.current += delta;
    if (convergeElapsed.current >= 0.6 && !convergeDone.current) {
      convergeDone.current = true;
      setHomeTransitionState('shooting');
    }
  });

  useEffect(() => {
    if (homeTransitionState === 'gathering') {
      gatheringElapsed.current = 0; gatheringDone.current = false;
    }
    if (homeTransitionState === 'converging') {
      convergeElapsed.current = 0; convergeDone.current = false;
    }
  }, [homeTransitionState]);

  const handleShootComplete = () => {
    setHomeTransitionState('flash');
    setTimeout(() => { setHomeTransitionState('done'); setAppPhase('catalog'); }, 550);
  };

  const handleSupernovaComplete = () => {
    setHomeTransitionState('idle');
  };

  return (
    <group>
      {/* Interactive mouse orbit camera controls (only active when idle) */}
      {homeTransitionState === 'idle' && !quizActive && (
        <OrbitControls
          enableZoom={true}
          enableRotate={false}
          enablePan={false}
          minDistance={4}
          maxDistance={15}
          makeDefault
        />
      )}

      {/* Quiz camera zoom controller */}
      <HomeCameraController />

      {/* Black hole + accretion disk */}
      <BlackHole />

      {/* Entry Transition: Gathering Stars spiraling in */}
      <GatheringStars active={homeTransitionState === 'gathering'} glowTex={glowTex} duration={1.2} stars={activeStars} />

      {/* Entry Transition: Supernova explosion blast wave */}
      <Supernova active={homeTransitionState === 'supernova'} glowTex={glowTex} duration={1.0} onComplete={handleSupernovaComplete} />

      {/* Transition shoot beam */}
      <ShootBeam active={homeTransitionState === 'shooting'} glowTex={glowTex} onComplete={handleShootComplete} />

      <ambientLight intensity={0.12} />
    </group>
  );
};

export default HomeScene;

