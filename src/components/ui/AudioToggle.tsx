'use client';

import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useAudio } from '../providers/AudioProvider';

export const AudioToggle: React.FC = () => {
  const { isMuted, toggleMute, playHover } = useAudio();

  return (
    <button
      onClick={toggleMute}
      onMouseEnter={playHover}
      className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-medium cursor-pointer transition-all duration-300 ${
        !isMuted
          ? 'bg-indigo-600/15 border-indigo-400/40 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.15)]'
          : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
      }`}
      title={isMuted ? 'Mở nhạc nền vũ trụ' : 'Tắt âm thanh'}
    >
      {!isMuted ? (
        <>
          <Volume2 className="w-4 h-4 animate-pulse text-indigo-400" />
          <span className="hidden sm:inline text-[10px]">Đang phát nhạc không gian</span>
        </>
      ) : (
        <>
          <VolumeX className="w-4 h-4 text-zinc-500" />
          <span className="hidden sm:inline text-[10px]">Bật nhạc nền huyền ảo</span>
        </>
      )}
    </button>
  );
};
export default AudioToggle;

