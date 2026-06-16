'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useRouter } from 'next/navigation';
import * as THREE from 'three';
import { useAudio } from '../providers/AudioProvider';
import { Star as StarType } from '@/lib/types';
import { useSceneStore } from '@/store/sceneStore';

interface StarProps {
  star: StarType;
}

export const Star: React.FC<StarProps> = ({ star }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const router = useRouter();
  const { playHover, playClick } = useAudio();
  const setCameraTarget = useSceneStore((state) => state.setCameraTarget);
  const setActiveStarId = useSceneStore((state) => state.setActiveStarId);
  const setTransitioning = useSceneStore((state) => state.setTransitioning);

  // Position mapping from normalized DB coordinates to 3D scene coordinates
  const posX = star.position_x * 5.5;
  const posY = star.position_y * 3.5;
  const posZ = 0;

  // Pulsing animation & rotation
  const pulseSeed = React.useMemo(() => Math.random() * 100, []);

  // Create uniforms for the glow shader
  const uniforms = React.useMemo(() => {
    return {
      color: { value: new THREE.Color(star.color) },
      glowPower: { value: 2.8 },
      opacity: { value: hovered ? 0.85 : 0.45 }
    };
  }, [star.color]);

  // Update uniforms when hovered state changes
  React.useEffect(() => {
    if (uniforms) {
      uniforms.opacity.value = hovered ? 0.85 : 0.45;
    }
  }, [hovered, uniforms]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const pulseFactor = 1 + Math.sin(time * 2.5 + pulseSeed) * 0.08;
    
    const scale = hovered ? 1.5 * pulseFactor : 1.0 * pulseFactor;

    if (meshRef.current) {
      meshRef.current.scale.set(scale, scale, scale);
      meshRef.current.rotation.y = time * 0.2;
    }

    if (glowRef.current) {
      // Glow shell pulses slightly out of sync for a gaseous effect
      const glowScale = scale * 1.6 + Math.cos(time * 4.0) * 0.05;
      glowRef.current.scale.set(glowScale, glowScale, glowScale);
      glowRef.current.rotation.y = -time * 0.1;

      // Animate shader material opacity dynamically to make the star twinkle like in the night sky
      const material = glowRef.current.material as THREE.ShaderMaterial;
      if (material && material.uniforms && material.uniforms.opacity) {
        const baseOpacity = hovered ? 0.9 : 0.45;
        // Twinkling effect: combination of a slow wave and a high-frequency scintillation wave
        const twinkle = Math.sin(time * 5.0 + pulseSeed) * 0.05 + Math.cos(time * 14.0 + pulseSeed * 1.5) * 0.03;
        material.uniforms.opacity.value = baseOpacity + twinkle;
      }
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (useSceneStore.getState().isTransitioning) return;
    playClick();
    
    // Start camera transition
    setTransitioning(true);
    
    // Zoom camera into the star system (slightly pulled back and tilted to see all orbits)
    setCameraTarget([posX, posY - 2.8, 6.8], [posX, posY, 0]);
    setActiveStarId(star.id);

    // Transition page after transition animation finishes (1200ms)
    setTimeout(() => {
      router.push(`/star/${star.id}`);
    }, 1200);
  };

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    setHovered(true);
    playHover();
    if (typeof window !== 'undefined') {
      document.body.style.cursor = 'pointer';
    }
    router.prefetch(`/star/${star.id}`);
  };

  const handlePointerOut = () => {
    setHovered(false);
    if (typeof window !== 'undefined') {
      document.body.style.cursor = 'default';
    }
  };

  const isAlcor = star.id === 'a3333333-3333-3333-3333-333333333333';
  const glowRadius = isAlcor ? 0.09 : 0.16;
  const coreRadius = isAlcor ? 0.045 : 0.08;
  const coronaRadius = isAlcor ? 0.043 : 0.078;

  return (
    <group position={[posX, posY, posZ]}>
      {/* Point Light for casting colored glow onto neighboring objects */}
      <pointLight 
        color={star.color} 
        intensity={hovered ? (isAlcor ? 1.5 : 3.0) : (isAlcor ? 0.75 : 1.5)} 
        distance={isAlcor ? 4 : 8} 
        decay={2} 
      />

      {/* Outer Glow shell */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[glowRadius, 32, 32]} />
        <shaderMaterial
          vertexShader={`
            precision mediump float;
            varying vec3 vNormal;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            precision mediump float;
            varying vec3 vNormal;
            uniform vec3 color;
            uniform float glowPower;
            uniform float opacity;
            void main() {
              float intensity = pow(max(0.0, dot(vNormal, vec3(0.0, 0.0, 1.0))), glowPower);
              gl_FragColor = vec4(color, intensity * opacity);
            }
          `}
          uniforms={uniforms}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Core Star body */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[coreRadius, 32, 32]} />
        <meshBasicMaterial color="#ffffff" />
        
        {/* Colorful corona core */}
        <mesh>
          <sphereGeometry args={[coronaRadius, 16, 16]} />
          <meshBasicMaterial 
            color={star.color} 
            transparent 
            opacity={0.8} 
          />
        </mesh>
      </mesh>

      {/* Label Tooltip */}
      <Html
        distanceFactor={6}
        position={[0, 0.25, 0]}
        center
        style={{
          transition: 'all 0.3s ease',
          opacity: hovered ? 1 : 0,
          transform: `scale(${hovered ? 1 : 0.8})`,
          pointerEvents: 'none'
        }}
      >
        <div 
          className="px-3 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap shadow-2xl flex items-center gap-1.5 backdrop-blur-md bg-black/80 text-white"
          style={{ 
            borderColor: `${star.color}44`,
            boxShadow: `0 0 15px ${star.color}22`
          }}
        >
          {star.icon && <span className="text-sm">{star.icon}</span>}
          <span>{star.name}</span>
        </div>
      </Html>
    </group>
  );
};
export default Star;
