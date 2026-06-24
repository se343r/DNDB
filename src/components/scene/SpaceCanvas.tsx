'use client';

import React, { useRef, Component, ErrorInfo, ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '@/store/sceneStore';
import { ConstellationScene } from './ConstellationScene';
import { SolarSystemScene } from './SolarSystemScene';
import { PlanetDetailScene } from './PlanetDetailScene';
import { CosmicBackground } from './CosmicBackground';
import { HomeScene } from './HomeScene';


// 1. Camera Controller component for smooth position & lookAt transitions
const CameraController: React.FC = () => {
  const cameraPosition = useSceneStore((state) => state.cameraPosition);
  const cameraLookAt = useSceneStore((state) => state.cameraLookAt);
  const isTransitioning = useSceneStore((state) => state.isTransitioning);
  const setTransitioning = useSceneStore((state) => state.setTransitioning);
  const transitionDuration = useSceneStore((state) => state.transitionDuration); // seconds

  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const targetPos = useRef(new THREE.Vector3(0, 0, 8));
  
  // Custom zoom multiplier controlled by scroll wheel
  const zoomFactor = useRef(1.0);

  // Transition parameters
  const transitionStartPos = useRef(new THREE.Vector3());
  const transitionStartLookAt = useRef(new THREE.Vector3());
  const transitionTime = useRef(0);
  const transitionActive = useRef(false);
  const shouldSnap = useRef(true); // Snap on initial load

  // Reset zoom factor when navigation targets change
  React.useEffect(() => {
    zoomFactor.current = 1.0;
  }, [cameraPosition, cameraLookAt]);

  const { camera } = useThree();
  const activeStarId = useSceneStore((state) => state.activeStarId);
  const appPhase = useSceneStore((state) => state.appPhase);

  // When isTransitioning, activeStarId, or appPhase changes,
  // snap the camera immediately to the new target.
  React.useEffect(() => {
    shouldSnap.current = true;
  }, [isTransitioning, activeStarId, appPhase]);

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
    // Read isTransitioning synchronously every frame — no async useEffect delay
    const storeState = useSceneStore.getState();
    const activelyTransitioning = storeState.isTransitioning;

    if (storeState.activePlanetId && !activelyTransitioning) {
      // Keep currentLookAt in sync with the tracked planet position so that
      // zoom-out transition starts from the correct lookAt point.
      const trackedPos = storeState.trackedPosition;
      if (trackedPos) {
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        const lookAtOffsetX = isMobile ? 0 : -0.7;
        const lookAtOffsetY = isMobile ? -0.7 : 0;
        currentLookAt.current.set(
          trackedPos[0] + lookAtOffsetX,
          trackedPos[1] + lookAtOffsetY,
          trackedPos[2]
        );
      }
      return;
    }

    if (activelyTransitioning) {
      // ─── ACTIVE TRANSITION ────────────────────────────────────────────────
      const { cameraPosition: storePos, cameraLookAt: storeLookAt, transitionDuration: duration } = storeState;

      // For planet zoom-in: target FOLLOWS the live planet position every frame.
      // This means the camera arrives exactly where the planet currently is when
      // the animation ends → no jump. The orbit is slow, so the path is smooth.
      // For all other transitions (zoom-out, star→constellation): use fixed store values.
      const trackedPosDuringTransition = storeState.trackedPosition;
      let targetPosVec: THREE.Vector3;
      let targetLookAtVec: THREE.Vector3;

      if (trackedPosDuringTransition) {
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        const lookAtOffsetX = isMobile ? 0 : -0.7;
        const lookAtOffsetY = isMobile ? -0.7 : 0;
        const scale = 2.8;
        targetLookAtVec = new THREE.Vector3(
          trackedPosDuringTransition[0] + lookAtOffsetX,
          trackedPosDuringTransition[1] + lookAtOffsetY,
          trackedPosDuringTransition[2]
        );
        targetPosVec = new THREE.Vector3(
          trackedPosDuringTransition[0] + lookAtOffsetX,
          trackedPosDuringTransition[1] + lookAtOffsetY,
          trackedPosDuringTransition[2] + 3.0 / scale
        );
      } else {
        // Non-planet transition: fixed target (set by triggerTransition)
        targetPosVec = new THREE.Vector3(...storePos);
        targetLookAtVec = new THREE.Vector3(...storeLookAt);
      }

      // First frame of this transition: capture starting positions
      if (!transitionActive.current) {
        transitionActive.current = true;
        transitionTime.current = 0;
        transitionStartPos.current.copy(state.camera.position);
        transitionStartLookAt.current.copy(currentLookAt.current);
        shouldSnap.current = false; // don't snap while animating
      }

      transitionTime.current += delta;
      const t = Math.min(1.0, transitionTime.current / duration);

      // Cubic easeInOut
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      // Interpolate lookAt (lerp from start toward planet's live position)
      const currentLook = new THREE.Vector3().lerpVectors(
        transitionStartLookAt.current, targetLookAtVec, ease
      );
      currentLookAt.current.copy(currentLook);
      state.camera.lookAt(currentLookAt.current);

      // Interpolate distance (with cinematic pull-back on zoom-in)
      const dStart = transitionStartPos.current.distanceTo(transitionStartLookAt.current);
      const dTarget = targetPosVec.distanceTo(targetLookAtVec);
      const distanceTraveled = transitionStartPos.current.distanceTo(targetPosVec);
      const maxPullback = Math.min(3.5, 1.2 + distanceTraveled * 0.25);
      const pullback = dTarget > dStart ? 0 : maxPullback * Math.sin(Math.PI * ease);
      const currentDistance = THREE.MathUtils.lerp(dStart, dTarget, ease) + pullback;

      // Interpolate direction
      const dirStart = new THREE.Vector3()
        .subVectors(transitionStartPos.current, transitionStartLookAt.current)
        .normalize();
      const dirTarget = new THREE.Vector3()
        .subVectors(targetPosVec, targetLookAtVec)
        .normalize();
      const currentDir = new THREE.Vector3()
        .lerpVectors(dirStart, dirTarget, ease)
        .normalize();

      state.camera.position.copy(currentLook).addScaledVector(currentDir, currentDistance);

      if (t >= 1.0) {
        // Transition complete — camera is now at the planet's live position, no jump
        transitionActive.current = false;
        setTransitioning(false);
        targetPos.current.copy(targetPosVec);
        currentLookAt.current.copy(targetLookAtVec);
      }
      return; // skip normal camera logic while transitioning
    }

    // ─── POST-TRANSITION / NORMAL CAMERA ────────────────────────────────────
    if (transitionActive.current) {
      // We just finished transitioning this frame — reset flag
      transitionActive.current = false;
    }

    const trackedPos = storeState.trackedPosition;
    let targetPosVec: THREE.Vector3;
    let targetLookAtVec: THREE.Vector3;

    if (trackedPos) {
      const scale = 2.8;
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      const lookAtOffsetX = isMobile ? 0 : -0.7;
      const lookAtOffsetY = isMobile ? -0.7 : 0;
      targetLookAtVec = new THREE.Vector3(
        trackedPos[0] + lookAtOffsetX,
        trackedPos[1] + lookAtOffsetY,
        trackedPos[2]
      );
      targetPosVec = new THREE.Vector3(
        trackedPos[0] + lookAtOffsetX,
        trackedPos[1] + lookAtOffsetY,
        trackedPos[2] + 3.0 / scale
      );
    } else {
      targetPosVec = new THREE.Vector3(...cameraPosition);
      targetLookAtVec = new THREE.Vector3(...cameraLookAt);
    }

    if (storeState.appPhase === 'home') return;

    if (!storeState.activeStarId) {
      if (shouldSnap.current) {
        state.camera.position.set(0, 0, 8);
        state.camera.lookAt(0, 0, 0);
        currentLookAt.current.set(0, 0, 0);
        shouldSnap.current = false;
      } else {
        currentLookAt.current.set(state.camera.position.x, state.camera.position.y, 0);
      }
      return;
    }

    // Solar system / planet view: smooth camera follow
    const dir = new THREE.Vector3().subVectors(targetPosVec, targetLookAtVec);
    dir.multiplyScalar(zoomFactor.current);
    targetPos.current.addVectors(targetLookAtVec, dir);

    if (shouldSnap.current) {
      state.camera.position.copy(targetPos.current);
      currentLookAt.current.copy(targetLookAtVec);
      state.camera.lookAt(currentLookAt.current);
      shouldSnap.current = false;
    } else {
      if (storeState.activePlanetId) {
        // Lock camera directly to target with zero lag to prevent orbital jitter
        state.camera.position.copy(targetPos.current);
        currentLookAt.current.copy(targetLookAtVec);
        state.camera.lookAt(currentLookAt.current);
      } else {
        const lerpSpeed = 0.06;
        state.camera.position.lerp(targetPos.current, lerpSpeed);
        currentLookAt.current.lerp(targetLookAtVec, lerpSpeed);
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
  const appPhase = useSceneStore((state) => state.appPhase);
  const graphicsQuality = useSceneStore((state) => state.graphicsQuality);
  const setGraphicsQuality = useSceneStore((state) => state.setGraphicsQuality);

  // Auto-detect low-end devices on mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 768;
      const cores = navigator.hardwareConcurrency || 4;
      // If mobile and low cores, or generally very low cores
      if ((isMobile && cores <= 4) || cores <= 2) {
        setGraphicsQuality('low');
      }
    }
  }, [setGraphicsQuality]);

  // Determine which scene to render
  const renderScene = () => {
    if (appPhase === 'home') {
      return <HomeScene />;
    }
    if (activeStarId) {
      return <SolarSystemScene />;
    }
    return <ConstellationScene />;
  };


  return (
    <div className="fixed inset-0 w-full h-full bg-transparent z-0">
      <CanvasErrorBoundary>
        <Canvas
          dpr={graphicsQuality === 'low' ? [1, 1] : [1, 2]}
          camera={{ fov: 60, near: 0.1, far: 1000, position: [0, 0, 8] }}
          gl={{ antialias: graphicsQuality === 'high', alpha: true, powerPreference: 'high-performance' }}
          onCreated={({ gl }) => gl.setClearAlpha(0)}
          className="w-full h-full"
        >
          {/* General Ambient Light */}
          <ambientLight intensity={0.25} />

          {/* Deep Space Background (Stars, Dust, Nebula) */}
          <CosmicBackground />

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
