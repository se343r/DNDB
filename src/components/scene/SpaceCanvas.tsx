'use client';

import React, { useRef, Component, ErrorInfo, ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useSceneStore } from '@/store/sceneStore';
import { ConstellationScene } from './ConstellationScene';
import { SolarSystemScene } from './SolarSystemScene';
import { PlanetDetailScene } from './PlanetDetailScene';

// 1. Camera Controller component for smooth position & lookAt transitions
const CameraController: React.FC = () => {
  const cameraPosition = useSceneStore((state) => state.cameraPosition);
  const cameraLookAt = useSceneStore((state) => state.cameraLookAt);
  const isTransitioning = useSceneStore((state) => state.isTransitioning);
  const setTransitioning = useSceneStore((state) => state.setTransitioning);

  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const targetPos = useRef(new THREE.Vector3(0, 0, 8));
  
  // Custom zoom multiplier controlled by scroll wheel
  const zoomFactor = useRef(1.0);

  // Transition parameters
  const transitionStartPos = useRef(new THREE.Vector3());
  const transitionStartLookAt = useRef(new THREE.Vector3());
  const transitionTime = useRef(0);
  const transitionDuration = 1.2; // seconds
  const transitionActive = useRef(false);
  const shouldSnap = useRef(true); // Snap on initial load

  // Reset zoom factor when navigation targets change
  React.useEffect(() => {
    zoomFactor.current = 1.0;
  }, [cameraPosition, cameraLookAt]);

  // Monitor target changes to initiate cinematic transition
  React.useEffect(() => {
    if (isTransitioning) {
      transitionActive.current = true;
      transitionTime.current = 0;
    } else {
      transitionActive.current = false;
      shouldSnap.current = true;
    }
  }, [cameraPosition, cameraLookAt, isTransitioning]);

  // Bind window wheel event to handle custom scroll-to-zoom
  React.useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const state = useSceneStore.getState();
      // Disable custom scroll zoom in planet detail view
      if (state.activePlanetId) return;

      const zoomSpeed = 0.05;
      if (e.deltaY > 0) {
        zoomFactor.current = Math.min(2.5, zoomFactor.current + zoomSpeed);
      } else {
        zoomFactor.current = Math.max(0.35, zoomFactor.current - zoomSpeed);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  useFrame((state, delta) => {
    const targetPosVec = new THREE.Vector3(...cameraPosition);
    const targetLookAtVec = new THREE.Vector3(...cameraLookAt);

    if (transitionActive.current) {
      // First frame setup: capture initial positions
      if (transitionTime.current === 0) {
        transitionStartPos.current.copy(state.camera.position);
        transitionStartLookAt.current.copy(currentLookAt.current);
      }

      transitionTime.current += delta;
      const t = Math.min(1.0, transitionTime.current / transitionDuration);
      
      // Easing function: Cubic easeInOut
      const easeInOutCubic = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      // Interpolate lookAt target
      const currentLook = new THREE.Vector3().lerpVectors(
        transitionStartLookAt.current,
        targetLookAtVec,
        easeInOutCubic
      );
      currentLookAt.current.copy(currentLook);
      state.camera.lookAt(currentLookAt.current);

      // Interpolate position:
      // 1. Distance interpolation with a cinematic pullback (anticipation)
      const dStart = transitionStartPos.current.distanceTo(transitionStartLookAt.current);
      const dTarget = targetPosVec.distanceTo(targetLookAtVec);
      
      // Sine-based zoom out curve (highest at t = 0.5, pulling back)
      const distanceTraveled = transitionStartPos.current.distanceTo(targetPosVec);
      const maxPullback = Math.min(3.5, 1.2 + distanceTraveled * 0.25);
      const pullback = maxPullback * Math.sin(Math.PI * easeInOutCubic);
      const currentDistance = THREE.MathUtils.lerp(dStart, dTarget, easeInOutCubic) + pullback;

      // 2. Direction interpolation
      const dirStart = new THREE.Vector3()
        .subVectors(transitionStartPos.current, transitionStartLookAt.current)
        .normalize();
      const dirTarget = new THREE.Vector3()
        .subVectors(targetPosVec, targetLookAtVec)
        .normalize();
      
      // Interpolated direction
      const currentDir = new THREE.Vector3()
        .lerpVectors(dirStart, dirTarget, easeInOutCubic)
        .normalize();

      // 3. Set camera position
      state.camera.position.copy(currentLook).addScaledVector(currentDir, currentDistance);

      if (t >= 1.0) {
        transitionActive.current = false;
        setTransitioning(false);
      }
    } else {
      // Normal smooth camera lerp (using zoomFactor & scroll)
      const dir = new THREE.Vector3().subVectors(targetPosVec, targetLookAtVec);
      
      // Scale direction vector by the custom scroll zoom factor
      dir.multiplyScalar(zoomFactor.current);
      
      // Set target position to targetLookAtVec + scaled direction
      targetPos.current.addVectors(targetLookAtVec, dir);

      if (shouldSnap.current) {
        state.camera.position.copy(targetPos.current);
        currentLookAt.current.copy(targetLookAtVec);
        state.camera.lookAt(currentLookAt.current);
        shouldSnap.current = false;
      } else {
        state.camera.position.lerp(targetPos.current, 0.08);

        // Smoothly lerp camera focal point
        currentLookAt.current.lerp(targetLookAtVec, 0.08);
        state.camera.lookAt(currentLookAt.current);
      }
    }
  });

  return null;
};


// 2. React class component for WebGL error boundaries
interface ErrorBoundaryProps {
  children: ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
}
class CanvasErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Three.js WebGL error caught:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-zinc-950 text-white p-6 z-40 text-center">
          <p className="text-indigo-400 font-semibold mb-1">Hệ thống đồ họa gặp sự cố</p>
          <h2 className="text-xl font-bold mb-4 text-white/90">Không thể khởi tạo WebGL 3D</h2>
          <p className="text-xs text-white/50 max-w-sm leading-relaxed mb-6">
            Trình duyệt hoặc GPU của bạn không khả dụng hoặc bị chặn tăng tốc phần cứng. Hãy kiểm tra cài đặt WebGL của bạn.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold rounded-full shadow-lg transition-colors cursor-pointer"
          >
            Tải lại hệ thống
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// 3. SpaceCanvas master component
export const SpaceCanvas: React.FC = () => {
  const activeStarId = useSceneStore((state) => state.activeStarId);
  const activePlanetId = useSceneStore((state) => state.activePlanetId);

  // Determine which scene to render
  const renderScene = () => {
    if (activePlanetId) {
      return <PlanetDetailScene />;
    } else if (activeStarId) {
      return <SolarSystemScene />;
    } else {
      return <ConstellationScene />;
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-black z-0">
      <CanvasErrorBoundary>
        <Canvas
          camera={{ fov: 60, near: 0.1, far: 1000, position: [0, 0, 8] }}
          gl={{ antialias: true, alpha: false }}
          className="w-full h-full"
        >
          {/* General Ambient Light */}
          <ambientLight intensity={0.25} />

          {/* Galaxy background stars */}
          <Stars 
            radius={100} 
            depth={50} 
            count={2800} 
            factor={4} 
            saturation={0.5} 
            fade 
            speed={1.5} 
          />

          {/* Interpolated Camera Manager */}
          <CameraController />

          {/* Current Active 3D Scene */}
          {renderScene()}
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
};
export default SpaceCanvas;
