'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Howl } from 'howler';

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
  const bgMusicRef = useRef<Howl | null>(null);
  const hoverSoundRef = useRef<Howl | null>(null);
  const clickSoundRef = useRef<Howl | null>(null);

  useEffect(() => {
    // Ambient space music (low tempo, peaceful synth loop)
    bgMusicRef.current = new Howl({
      src: ['https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3'],
      html5: true,
      loop: true,
      volume: 0.2,
      mute: true // Start muted
    });

    // High pitch crisp space ping for hover
    hoverSoundRef.current = new Howl({
      src: ['https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav'],
      volume: 0.25,
      mute: true
    });

    // Low pitch cosmic whoosh for screen transitions and click
    clickSoundRef.current = new Howl({
      src: ['https://assets.mixkit.co/active_storage/sfx/2869/2869-84.wav'],
      volume: 0.4,
      mute: true
    });

    // Attempt to start playing the looped music (will be muted initially)
    bgMusicRef.current.play();

    return () => {
      bgMusicRef.current?.unload();
      hoverSoundRef.current?.unload();
      clickSoundRef.current?.unload();
    };
  }, []);

  const toggleMute = () => {
    const nextMuteState = !isMuted;
    setIsMuted(nextMuteState);

    if (bgMusicRef.current) {
      bgMusicRef.current.mute(nextMuteState);
      if (!nextMuteState && !bgMusicRef.current.playing()) {
        bgMusicRef.current.play();
      }
    }
    if (hoverSoundRef.current) hoverSoundRef.current.mute(nextMuteState);
    if (clickSoundRef.current) clickSoundRef.current.mute(nextMuteState);
  };

  const playHover = () => {
    if (!isMuted && hoverSoundRef.current) {
      // Play a quick ping (reset if already playing)
      hoverSoundRef.current.stop();
      hoverSoundRef.current.play();
    }
  };

  const playClick = () => {
    if (!isMuted && clickSoundRef.current) {
      // Play a cosmic whoosh (reset if already playing)
      clickSoundRef.current.stop();
      clickSoundRef.current.play();
    }
  };

  return (
    <AudioContext.Provider value={{ isMuted, toggleMute, playHover, playClick }}>
      {children}
    </AudioContext.Provider>
  );
};
