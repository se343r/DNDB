'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Home, Compass, HelpCircle, Target, Trophy, Sparkles, ChevronDown } from 'lucide-react';
import { useSceneStore } from '@/store/sceneStore';
import { useAudio } from '../providers/AudioProvider';
import SearchBar from './SearchBar';
import AudioToggle from './AudioToggle';

export const Header: React.FC = () => {
  const router = useRouter();
  const resetScene = useSceneStore((state) => state.resetScene);
  const setAppPhase = useSceneStore((state) => state.setAppPhase);
  const setHomeTransitionState = useSceneStore((state) => state.setHomeTransitionState);
  const { playClick, playHover } = useAudio();

  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeStarId = useSceneStore((state) => state.activeStarId);
  const activePlanetId = useSceneStore((state) => state.activePlanetId);

  // Close menu when active star or planet changes
  useEffect(() => {
    setMenuOpen(false);
  }, [activeStarId, activePlanetId]);

  // Close menu on click outside (using capture phase so stopPropagation inside Canvas/ThreeJS cannot prevent it)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, []);

  const handleHomeClick = () => {
    playClick();
    setAppPhase('home');
    setHomeTransitionState('gathering');
    resetScene();
    router.push('/');
  };

  const handleCatalogClick = () => {
    playClick();
    setAppPhase('catalog');
    resetScene();
    router.push('/catalog');
  };

  const handleNavClick = (path: string) => {
    playClick();
    setAppPhase('catalog');
    resetScene();
    router.push(path);
  };

  return (
    <header className="fixed top-0 left-0 w-full z-30 px-6 py-5 flex items-center justify-between pointer-events-none select-none">
      {/* Top Left: Floating Menu Button and Dropdown */}
      {activeStarId ? (
        <div />
      ) : (
        <div ref={dropdownRef} className="relative pointer-events-auto flex items-center gap-3">
          {/* Menu Toggle Button */}
          <button
            onClick={() => {
              playClick();
              setMenuOpen(!menuOpen);
            }}
            onMouseEnter={playHover}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-slate-200 border border-white/10 hover:border-indigo-500/50 bg-black/60 hover:bg-zinc-900/80 backdrop-blur-md transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.5)] cursor-pointer"
          >
            <Menu className="w-3.5 h-3.5 text-indigo-400" />
            <span>Menu</span>
            <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform duration-300 ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div className="absolute top-11 left-0 w-52 rounded-2xl bg-black/90 border border-white/10 backdrop-blur-lg shadow-2xl py-2 flex flex-col z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* 1. Trang chủ */}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleHomeClick();
                }}
                onMouseEnter={playHover}
                className="flex items-center gap-3 px-4 py-2.5 text-xs text-left text-slate-300 hover:text-white hover:bg-white/10 transition duration-150 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5 text-indigo-400" />
                <span>Trang chủ</span>
              </button>
              {/* 2. Danh mục */}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleCatalogClick();
                }}
                onMouseEnter={playHover}
                className="flex items-center gap-3 px-4 py-2.5 text-xs text-left text-slate-300 hover:text-white hover:bg-white/10 transition duration-150 cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-indigo-400" />
                <span>Danh mục</span>
              </button>
              {/* 3. Câu đố */}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleNavClick('/quizzes');
                }}
                onMouseEnter={playHover}
                className="flex items-center gap-3 px-4 py-2.5 text-xs text-left text-slate-300 hover:text-white hover:bg-white/10 transition duration-150 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                <span>Câu đố</span>
              </button>
              {/* 4. Nhiệm vụ */}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleNavClick('/quests');
                }}
                onMouseEnter={playHover}
                className="flex items-center gap-3 px-4 py-2.5 text-xs text-left text-slate-300 hover:text-white hover:bg-white/10 transition duration-150 cursor-pointer"
              >
                <Target className="w-3.5 h-3.5 text-indigo-400" />
                <span>Nhiệm vụ</span>
              </button>
              {/* 5. Bảng xếp hạng */}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleNavClick('/leaderboard');
                }}
                onMouseEnter={playHover}
                className="flex items-center gap-3 px-4 py-2.5 text-xs text-left text-slate-300 hover:text-white hover:bg-white/10 transition duration-150 cursor-pointer"
              >
                <Trophy className="w-3.5 h-3.5 text-indigo-400" />
                <span>Bảng xếp hạng</span>
              </button>
              {/* 6. Đề xuất */}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleNavClick('/recommendations');
                }}
                onMouseEnter={playHover}
                className="flex items-center gap-3 px-4 py-2.5 text-xs text-left text-slate-300 hover:text-white hover:bg-white/10 transition duration-150 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Đề xuất</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Top Right: Search and Music Controls */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <div className="relative w-48 md:w-60">
          <SearchBar />
        </div>
        <AudioToggle />
      </div>
    </header>
  );
};

export default Header;

