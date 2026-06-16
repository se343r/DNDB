'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useAudio } from '../providers/AudioProvider';

interface BackButtonProps {
  to?: string;
  onClick?: () => void;
}

export const BackButton: React.FC<BackButtonProps> = ({ to, onClick }) => {
  const router = useRouter();
  const { playClick, playHover } = useAudio();

  const handlePress = () => {
    playClick();
    if (onClick) {
      onClick();
    } else if (to) {
      router.push(to);
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handlePress}
      onMouseEnter={playHover}
      className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/30 rounded-full backdrop-blur-md transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(99,102,241,0.25)] group cursor-pointer"
    >
      <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
      <span>Quay lại</span>
    </button>
  );
};
export default BackButton;
