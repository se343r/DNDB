'use client';

import React, { createContext, useContext } from 'react';

interface AudioContextType {
  playHover: () => void;
  playClick: () => void;
}

const noop = () => {};

const AudioContext = createContext<AudioContextType>({
  playHover: noop,
  playClick: noop,
});

export const useAudio = () => {
  return useContext(AudioContext);
};

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AudioContext.Provider value={{ playHover: noop, playClick: noop }}>
      {children}
    </AudioContext.Provider>
  );
};
