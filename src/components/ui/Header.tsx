'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Plus, RefreshCw } from 'lucide-react';
import { useSceneStore } from '@/store/sceneStore';
import { useAudio } from '../providers/AudioProvider';
import SearchBar from './SearchBar';
import AudioToggle from './AudioToggle';

export const Header: React.FC = () => {
  const router = useRouter();
  const resetScene = useSceneStore((state) => state.resetScene);
  const setAddModalOpen = useSceneStore((state) => state.setAddModalOpen);
  const { playClick, playHover } = useAudio();

  const handleLogoClick = () => {
    playClick();
    resetScene();
    router.push('/');
  };

  const handleReset = () => {
    playClick();
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <header className="relative z-30 px-6 py-4 border-b border-zinc-900 bg-zinc-950/60 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 pointer-events-auto select-none">
      {/* Logo and Domain Brand */}
      <div 
        onClick={handleLogoClick}
        onMouseEnter={playHover}
        className="flex items-center space-x-3 cursor-pointer group"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 p-0.5 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
          <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-indigo-400 group-hover:rotate-12 transition-transform" />
          </div>
        </div>
        <div>
          <h1 className="text-sm font-bold uppercase tracking-widest text-[#f8fafc] flex items-center space-x-2">
            <span>Cõi Bắc Đẩu</span>
            <span className="text-[9px] bg-indigo-500/10 text-indigo-400 font-mono px-1.5 py-0.5 rounded border border-indigo-500/20">VŨ TRỤ TRI THỨC</span>
          </h1>
          <p className="text-[10px] text-slate-400">Trình vinh danh anh kiệt & tinh cầu hệ thống</p>
        </div>
      </div>

      {/* Global Instant Search Space */}
      <div className="relative w-full max-w-xs md:max-w-sm">
        <SearchBar />
      </div>

      {/* Global Controls */}
      <div className="flex items-center space-x-3">
        {/* Audio Toggle */}
        <AudioToggle />

        {/* Quick Creator Summon */}
        <button
          onClick={() => {
            playClick();
            setAddModalOpen(true);
          }}
          onMouseEnter={playHover}
          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-indigo-500/10 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm tinh cầu</span>
        </button>

        {/* Reset System Database Button */}
        <button
          onClick={handleReset}
          onMouseEnter={playHover}
          className="p-2 bg-zinc-900 hover:bg-red-950/20 hover:text-red-400 border border-zinc-800 rounded-xl transition text-zinc-500 cursor-pointer"
          title="Khôi phục trạng thái mặc định"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
export default Header;
