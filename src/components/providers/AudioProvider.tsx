'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

interface AudioContextType {
  isMuted: boolean;
  toggleMute: () => void;
  playHover: () => void;
  playClick: () => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio must be used within AudioProvider');
  return context;
};

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState(true); // Start muted to satisfy browser autoplay policies
  const audioCtxRef = useRef<AudioContext | null>(null);
  const droneGainRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const droneOscillatorsRef = useRef<OscillatorNode[]>([]);
  const isInitializedRef = useRef(false);
  const filterTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const initAudio = () => {
    if (isInitializedRef.current) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;

      const ctx = new AudioCtxClass();
      audioCtxRef.current = ctx;

      // Create filter to make everything sound soft and warm
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);
      filter.Q.setValueAtTime(1.5, ctx.currentTime);
      filter.connect(ctx.destination);
      filterNodeRef.current = filter;

      // Create main gain node for the drone
      const droneGain = ctx.createGain();
      droneGain.gain.setValueAtTime(0, ctx.currentTime); // Start fully silent
      droneGain.connect(filter);
      droneGainRef.current = droneGain;

      // Startup the space drone!
      startDrone(ctx, droneGain, filter);
      isInitializedRef.current = true;
      console.log('[SpaceAudio] Synthesizer initialized successfully.');
    } catch (e) {
      console.error('[SpaceAudio] Web Audio API is not supported by browser:', e);
    }
  };

  const startDrone = (ctx: AudioContext, droneGain: GainNode, filter: BiquadFilterNode) => {
    const chords = [
      65.41,  // C2
      130.81, // C3
      196.00, // G3
      261.63, // C4
      392.00, // G4
      146.83, // D3
    ];

    chords.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      osc.type = index % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const oscGain = ctx.createGain();
      const volume = (1 / (index + 2)) * 0.12;
      oscGain.gain.setValueAtTime(volume, ctx.currentTime);

      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.05 + index * 0.02, ctx.currentTime);

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(volume * 0.3, ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(oscGain.gain);

      osc.connect(oscGain);
      oscGain.connect(droneGain);

      lfo.start();
      osc.start();

      droneOscillatorsRef.current.push(osc);
      droneOscillatorsRef.current.push(lfo as any);
    });

    oscillateFilter(ctx, filter);
  };

  const oscillateFilter = (ctx: AudioContext, filter: BiquadFilterNode) => {
    if (!filter || ctx.state === 'closed') return;
    const time = ctx.currentTime;
    const nextFreq = 250 + Math.random() * 500;
    const duration = 10 + Math.random() * 15;
    
    try {
      filter.frequency.exponentialRampToValueAtTime(nextFreq, time + duration);
    } catch (e) {}

    filterTimeoutRef.current = setTimeout(() => {
      oscillateFilter(ctx, filter);
    }, duration * 1000);
  };

  useEffect(() => {
    return () => {
      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current);
      }
      droneOscillatorsRef.current.forEach((osc) => {
        try {
          osc.stop();
        } catch (e) {}
      });
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
    };
  }, []);

  const toggleMute = () => {
    initAudio();

    const nextMuteState = !isMuted;
    setIsMuted(nextMuteState);

    const ctx = audioCtxRef.current;
    const droneGain = droneGainRef.current;

    if (ctx && droneGain) {
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const targetGain = nextMuteState ? 0 : 0.65;
      droneGain.gain.linearRampToValueAtTime(targetGain, ctx.currentTime + 1.5);
    }
  };

  const playHover = () => {
    if (isMuted || !isInitializedRef.current) return;
    const ctx = audioCtxRef.current;
    const filter = filterNodeRef.current;
    if (!ctx || !filter || ctx.state === 'suspended') return;

    try {
      const time = ctx.currentTime;
      // High pitch crisp space ping for hover
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, time);

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.08, time);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.5);

      osc.connect(gainNode);
      gainNode.connect(filter);

      osc.start(time);
      osc.stop(time + 0.6);
    } catch (e) {}
  };

  const playClick = () => {
    if (isMuted || !isInitializedRef.current) return;
    const ctx = audioCtxRef.current;
    const filter = filterNodeRef.current;
    if (!ctx || !filter || ctx.state === 'suspended') return;

    try {
      const time = ctx.currentTime;
      // Beautiful cosmic chime bell
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, time);

      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(880 * 1.5, time);

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.15, time);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 1.5);

      const delay = ctx.createDelay();
      delay.delayTime.setValueAtTime(0.15, time);

      const feedback = ctx.createGain();
      feedback.gain.setValueAtTime(0.35, time);

      osc.connect(gainNode);
      osc2.connect(gainNode);

      gainNode.connect(filter);

      gainNode.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(filter);

      osc.start(time);
      osc2.start(time);

      osc.stop(time + 1.6);
      osc2.stop(time + 1.6);
    } catch (e) {}
  };

  return (
    <AudioContext.Provider value={{ isMuted, toggleMute, playHover, playClick }}>
      {children}
    </AudioContext.Provider>
  );
};
