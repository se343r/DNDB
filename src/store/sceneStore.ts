import { create } from 'zustand';

interface SceneState {
  activeStarId: string | null;
  activePlanetId: string | null;
  cameraPosition: [number, number, number];
  cameraLookAt: [number, number, number];
  isTransitioning: boolean;
  
  // 3D Perspective settings matching next-main
  tiltAngleX: number;
  tiltAngleY: number;
  perspective3D: boolean;
  isAddModalOpen: boolean;
  
  // Persisted angles of planets in orbits
  planetAngles: Record<string, number>;
  
  setActiveStarId: (id: string | null) => void;
  setActivePlanetId: (id: string | null) => void;
  setCameraTarget: (position: [number, number, number], lookAt: [number, number, number]) => void;
  setTransitioning: (val: boolean) => void;
  
  // Dynamic camera tracking for moving objects
  trackedPosition: [number, number, number] | null;
  setTrackedPosition: (pos: [number, number, number] | null) => void;
  
  // 3D setters
  setTiltAngleX: (angle: number) => void;
  setTiltAngleY: (angle: number) => void;
  setPerspective3D: (val: boolean) => void;
  setAddModalOpen: (val: boolean) => void;
  setPlanetAngle: (id: string, angle: number) => void;
  
  constellationIntroComplete: boolean;
  setConstellationIntroComplete: (val: boolean) => void;

  hasPlayedIntro: boolean;
  setHasPlayedIntro: (val: boolean) => void;

  resetScene: () => void;
}

export const useSceneStore = create<SceneState>((set) => ({
  activeStarId: null,
  activePlanetId: null,
  cameraPosition: [0, 0, 8],
  cameraLookAt: [0, 0, 0],
  isTransitioning: false,
  
  // Default values matching next-main
  tiltAngleX: 64,
  tiltAngleY: -8,
  perspective3D: true,
  isAddModalOpen: false,
  
  planetAngles: {},
  constellationIntroComplete: false,
  hasPlayedIntro: false,

  setActiveStarId: (id) => set({ activeStarId: id }),
  setActivePlanetId: (id) => set({ activePlanetId: id }),
  setConstellationIntroComplete: (val) => set({ constellationIntroComplete: val }),
  setHasPlayedIntro: (val) => set({ hasPlayedIntro: val }),
  
  setCameraTarget: (position, lookAt) => set({ 
    cameraPosition: position, 
    cameraLookAt: lookAt 
  }),
  
  setTransitioning: (val) => set({ isTransitioning: val }),
  
  trackedPosition: null,
  setTrackedPosition: (pos) => set({ trackedPosition: pos }),
  
  setTiltAngleX: (angle) => set({ tiltAngleX: angle }),
  setTiltAngleY: (angle) => set({ tiltAngleY: angle }),
  setPerspective3D: (val) => set({ perspective3D: val }),
  setAddModalOpen: (val) => set({ isAddModalOpen: val }),
  setPlanetAngle: (id, angle) => set((state) => ({
    planetAngles: { ...state.planetAngles, [id]: angle }
  })),
  
  resetScene: () => set({ 
    activeStarId: null, 
    activePlanetId: null, 
    cameraPosition: [0, 0, 8], 
    cameraLookAt: [0, 0, 0],
    isTransitioning: false,
    // Keep angle settings persistent or let them reset
    tiltAngleX: 64,
    tiltAngleY: -8,
    perspective3D: true,
    isAddModalOpen: false,
    planetAngles: {},
    trackedPosition: null
  })
}));

