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
  
  // 3D setters
  setTiltAngleX: (angle: number) => void;
  setTiltAngleY: (angle: number) => void;
  setPerspective3D: (val: boolean) => void;
  setAddModalOpen: (val: boolean) => void;
  setPlanetAngle: (id: string, angle: number) => void;
  
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

  setActiveStarId: (id) => set({ activeStarId: id }),
  setActivePlanetId: (id) => set({ activePlanetId: id }),
  
  setCameraTarget: (position, lookAt) => set({ 
    cameraPosition: position, 
    cameraLookAt: lookAt 
  }),
  
  setTransitioning: (val) => set({ isTransitioning: val }),
  
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
    planetAngles: {}
  })
}));

