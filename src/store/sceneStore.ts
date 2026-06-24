import { create } from 'zustand';

export type AppPhase = 'home' | 'catalog' | 'quizzes' | 'leaderboard';
export type HomeTransitionState = 'idle' | 'converging' | 'shooting' | 'flash' | 'done' | 'gathering' | 'supernova';

interface SceneState {
  activeStarId: string | null;
  activePlanetId: string | null;
  cameraPosition: [number, number, number];
  cameraLookAt: [number, number, number];
  isTransitioning: boolean;
  transitionDuration: number;
  
  // App phase: home screen vs catalog (constellation)
  appPhase: AppPhase;
  homeTransitionState: HomeTransitionState;
  setAppPhase: (phase: AppPhase) => void;
  setHomeTransitionState: (state: HomeTransitionState) => void;
  
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
  setTransitioning: (val: boolean, duration?: number) => void;
  triggerTransition: (position: [number, number, number], lookAt: [number, number, number], duration?: number) => void;
  
  // Dynamic camera tracking for moving objects
  trackedPosition: [number, number, number] | null;
  setTrackedPosition: (pos: [number, number, number] | null) => void;
  
  // Search navigation states
  searchTargetStarId: string | null;
  searchTargetPlanetId: string | null;
  searchNavigationStep: 'idle' | 'to_catalog' | 'to_star' | 'to_planet';
  setSearchTarget: (starId: string | null, planetId: string | null, step: 'idle' | 'to_catalog' | 'to_star' | 'to_planet') => void;

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

  // Personality Quiz states
  quizActive: boolean;
  quizPhase: 'idle' | 'spawning' | 'quiz' | 'matched' | 'done';
  matchedPlanetId: string | null;
  setQuizActive: (val: boolean) => void;
  setQuizPhase: (val: 'idle' | 'spawning' | 'quiz' | 'matched' | 'done') => void;
  setMatchedPlanetId: (val: string | null) => void;

  // Leaderboard states
  leaderboardStarsLanded: boolean[];
  setLeaderboardStarLanded: (index: number, landed: boolean) => void;

  // Demo/Guest mode (skipped registration)
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;

  // Graphics Quality (Optimization for low-end devices)
  graphicsQuality: 'high' | 'low';
  setGraphicsQuality: (val: 'high' | 'low') => void;

  resetScene: () => void;
}

export const useSceneStore = create<SceneState>((set) => ({
  activeStarId: null,
  activePlanetId: null,
  cameraPosition: [0, 0, 8],
  cameraLookAt: [0, 0, 0],
  isTransitioning: false,
  transitionDuration: 1.0,

  // App phase
  appPhase: 'home',
  homeTransitionState: 'idle',
  setAppPhase: (phase) => set({ 
    appPhase: phase,
    ...(phase !== 'leaderboard' ? { leaderboardStarsLanded: [false, false, false, false, false] } : {})
  }),
  setHomeTransitionState: (state) => set({ homeTransitionState: state }),
  
  // Default values matching next-main
  tiltAngleX: 64,
  tiltAngleY: -8,
  perspective3D: true,
  isAddModalOpen: false,
  
  planetAngles: {},
  constellationIntroComplete: false,
  hasPlayedIntro: false,

  // Personality Quiz defaults
  quizActive: false,
  quizPhase: 'idle',
  matchedPlanetId: null,
  setQuizActive: (val) => set({ quizActive: val }),
  setQuizPhase: (val) => set({ quizPhase: val }),
  setMatchedPlanetId: (val) => set({ matchedPlanetId: val }),

  // Leaderboard defaults
  leaderboardStarsLanded: [false, false, false, false, false],
  setLeaderboardStarLanded: (index, landed) => set((state) => {
    const updated = [...state.leaderboardStarsLanded];
    updated[index] = landed;
    return { leaderboardStarsLanded: updated };
  }),

  // Demo mode default
  isDemoMode: false,
  setIsDemoMode: (val) => set({ isDemoMode: val }),

  // Graphics Quality default
  graphicsQuality: 'high',
  setGraphicsQuality: (val) => set({ graphicsQuality: val }),

  setActiveStarId: (id) => set({ activeStarId: id }),
  setActivePlanetId: (id) => set({ activePlanetId: id }),
  setConstellationIntroComplete: (val) => set({ constellationIntroComplete: val }),
  setHasPlayedIntro: (val) => set({ hasPlayedIntro: val }),
  
  // Search navigation state implementation
  searchTargetStarId: null,
  searchTargetPlanetId: null,
  searchNavigationStep: 'idle',
  setSearchTarget: (starId, planetId, step) => set({
    searchTargetStarId: starId,
    searchTargetPlanetId: planetId,
    searchNavigationStep: step
  }),

  setCameraTarget: (position, lookAt) => set({ 
    cameraPosition: position, 
    cameraLookAt: lookAt 
  }),
  
  setTransitioning: (val, duration = 1.0) => set({ isTransitioning: val, transitionDuration: duration }),
  
  triggerTransition: (position, lookAt, duration = 1.0) => set({
    cameraPosition: position,
    cameraLookAt: lookAt,
    isTransitioning: true,
    transitionDuration: duration
  }),
  
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
    trackedPosition: null,
    // Reset personality quiz states
    quizActive: false,
    quizPhase: 'idle',
    matchedPlanetId: null,
    // Reset leaderboard states
    leaderboardStarsLanded: [false, false, false, false, false],
    // Reset search states
    searchTargetStarId: null,
    searchTargetPlanetId: null,
    searchNavigationStep: 'idle'
  })
}));


