'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Home, Compass, HelpCircle, Trophy, Sparkles, ChevronDown, User, LogOut, Flame, Star, KeyRound, MonitorSmartphone } from 'lucide-react';
import { useSceneStore } from '@/store/sceneStore';
import { useAudio } from '../providers/AudioProvider';
import { useAuth } from '@/hooks/useAuth';
import SearchBar from './SearchBar';
import AuthModal from './AuthModal';
import ChangePasswordModal from './ChangePasswordModal';
import { debugLog } from '@/lib/debug';

export const Header: React.FC = () => {
  const router = useRouter();
  const resetScene = useSceneStore((state) => state.resetScene);
  const setAppPhase = useSceneStore((state) => state.setAppPhase);
  const setHomeTransitionState = useSceneStore((state) => state.setHomeTransitionState);
  const { playClick, playHover } = useAudio();
  const { user, profile, isAuthenticated, signOut } = useAuth();
  const isDemoMode = useSceneStore((state) => state.isDemoMode);

  const [menuOpen, setMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const activeStarId = useSceneStore((state) => state.activeStarId);
  const activePlanetId = useSceneStore((state) => state.activePlanetId);
  const appPhase = useSceneStore((state) => state.appPhase);
  const hasPlayedIntro = useSceneStore((state) => state.hasPlayedIntro);
  const graphicsQuality = useSceneStore((state) => state.graphicsQuality);
  const setGraphicsQuality = useSceneStore((state) => state.setGraphicsQuality);

  // Hide header entirely during the intro screen (first visit)
  const [skipIntro, setSkipIntro] = React.useState(false);
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setSkipIntro(!!localStorage.getItem('dnbd_has_visited'));
    }
  }, []);

  // Restore search target from sessionStorage on client mount (e.g. after page reloads)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('dnbd_search_target');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          debugLog('Header: restored search target from sessionStorage', parsed);
          if (parsed.starId && parsed.planetId && parsed.step) {
            const store = useSceneStore.getState();
            
            // If the step was interrupted at 'to_star', set it back to 'to_catalog' to restart the flow
            const targetStep = parsed.step === 'to_star' ? 'to_catalog' : parsed.step;
            store.setSearchTarget(parsed.starId, parsed.planetId, targetStep);
            
            if (targetStep === 'to_catalog') {
              store.setAppPhase('catalog');
              if (window.location.pathname === '/') {
                router.push('/catalog');
              }
            } else if (targetStep === 'to_planet') {
              store.setAppPhase('catalog');
              store.setActiveStarId(parsed.starId);
              if (window.location.pathname !== `/star/${parsed.starId}`) {
                router.push(`/star/${parsed.starId}`);
              }
            }
          }
        } catch (e) {
          console.error('Error parsing search target from sessionStorage:', e);
        }
      }
    }
  }, [router]);

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
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
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

  const handleSignOut = async () => {
    playClick();
    setUserMenuOpen(false);
    await signOut();
  };

  // Hide during intro (must be after all hooks)
  if (!hasPlayedIntro && !skipIntro) return null;

  return (
    <header className="fixed top-0 left-0 w-full z-30 px-6 py-5 flex items-center justify-between pointer-events-none select-none">
      {/* Top Left: Logo-Menu Button and Dropdown */}
      <div className="relative flex items-center gap-3 pointer-events-none w-56">
        {!activeStarId && (
          <div ref={dropdownRef} className="relative pointer-events-auto">
          {/* Logo Button acting as Menu Toggle */}
          <button
            onClick={() => {
              playClick();
              setMenuOpen(!menuOpen);
            }}
            onMouseEnter={playHover}
            className="flex flex-col items-center gap-0 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer outline-none group"
            title="Menu"
          >
            {/* Logo Container (25% smaller than w-28 is w-20) */}
            <div className="w-20 h-20 flex items-center justify-center p-0">
              <img
                src="/images/logo_new.png"
                alt="Logo Menu"
                className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(0,229,255,0.65)] group-hover:drop-shadow-[0_0_20px_rgba(0,229,255,0.95)] transition-all duration-300"
              />
            </div>

            {/* Subtext and Downward Arrow */}
            <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 group-hover:text-indigo-400 transition-colors duration-300 -mt-1">
              <span>Menu</span>
              <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 group-hover:text-indigo-400 transition-all duration-300 ${menuOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div className="absolute top-28 left-0 w-52 rounded-2xl bg-black/90 border border-white/10 backdrop-blur-lg shadow-2xl py-2 flex flex-col z-50 animate-in fade-in slide-in-from-top-2 duration-200">
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
              {/* 4. Bảng xếp hạng */}
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
              {/* 5. Đề xuất */}
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

              {/* Dấu phân cách */}
              <div className="h-px bg-white/10 my-1 mx-3" />

              {/* 6. Chuyển đổi đồ hoạ */}
              <button
                onClick={() => {
                  playClick();
                  setGraphicsQuality(graphicsQuality === 'high' ? 'low' : 'high');
                }}
                onMouseEnter={playHover}
                className="flex items-center gap-3 px-4 py-2.5 text-xs text-left text-slate-300 hover:text-white hover:bg-white/10 transition duration-150 cursor-pointer"
              >
                <MonitorSmartphone className="w-3.5 h-3.5 text-indigo-400" />
                <span>Đồ hoạ: {graphicsQuality === 'high' ? 'Cao' : 'Tối ưu'}</span>
              </button>
            </div>
          )}
        </div>
        )}
      </div>

      {/* Top Right: Search, Auth, and Music Controls */}
      {!activePlanetId && (
        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
          <div className="relative w-36 sm:w-48 md:w-60">
            <SearchBar />
          </div>

        {isAuthenticated ? (
          <div ref={userMenuRef} className="relative">
            <button
              onClick={() => {
                playClick();
                setUserMenuOpen(!userMenuOpen);
              }}
              onMouseEnter={playHover}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-slate-200 border border-white/10 hover:border-indigo-500/50 bg-black/60 hover:bg-zinc-900/80 backdrop-blur-md transition-all duration-300 cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
              <span className="hidden sm:inline max-w-[80px] truncate">
                {profile?.display_name || 'Tài khoản'}
              </span>
              {profile && (
                <div className="hidden md:flex items-center gap-1.5">
                  <span className="text-zinc-600">·</span>
                  <span className="text-indigo-400 font-mono text-[10px]">
                    Lv.{profile.level}
                  </span>
                  {profile.current_streak > 0 && (
                    <>
                      <span className="text-zinc-600">·</span>
                      <span className="flex items-center gap-0.5 text-orange-400 font-mono text-[10px]">
                        <Flame className="w-3 h-3" />
                        {profile.current_streak}
                      </span>
                    </>
                  )}
                  <span className="text-zinc-600">·</span>
                  <span className="flex items-center gap-0.5 text-yellow-400 font-mono text-[10px]">
                    <Star className="w-3 h-3" />
                    {profile.total_points.toLocaleString()}
                  </span>
                </div>
              )}
            </button>

            {userMenuOpen && (
              <div className="absolute top-11 right-0 w-52 rounded-2xl bg-black/90 border border-white/10 backdrop-blur-lg shadow-2xl py-2 flex flex-col z-50">
                {profile && (
                  <div className="px-4 py-3 border-b border-white/10 mb-1">
                    <p className="text-xs text-white font-semibold truncate">{profile.display_name}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="flex items-center gap-1 text-[10px] text-orange-400 font-mono">
                        <Flame className="w-3 h-3" />
                        {profile.current_streak} ngày
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-yellow-400 font-mono">
                        <Star className="w-3 h-3" />
                        {profile.total_points.toLocaleString()} điểm
                      </span>
                    </div>
                  </div>
                )}
                {!(
                  user?.app_metadata?.provider === 'google' ||
                  user?.app_metadata?.providers?.includes('google') ||
                  user?.identities?.some((id) => id.provider === 'google')
                ) && (
                  <button
                    onClick={() => {
                      playClick();
                      setUserMenuOpen(false);
                      setChangePasswordModalOpen(true);
                    }}
                    onMouseEnter={playHover}
                    className="flex items-center gap-3 px-4 py-2.5 text-xs text-left text-slate-300 hover:text-white hover:bg-white/10 transition duration-150 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Đổi mật khẩu</span>
                  </button>
                )}
                <button
                  onClick={handleSignOut}
                  onMouseEnter={playHover}
                  className="flex items-center gap-3 px-4 py-2.5 text-xs text-left text-rose-450 hover:bg-white/10 transition duration-150 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        ) : isDemoMode ? (
          <button
            onClick={() => {
              playClick();
              setAuthModalOpen(true);
            }}
            onMouseEnter={playHover}
            className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold text-slate-300 bg-zinc-800/80 border border-zinc-700 hover:border-indigo-500/50 backdrop-blur-md transition-all duration-300 cursor-pointer"
          >
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Demo</span>
            <span className="text-indigo-400">Đăng nhập</span>
          </button>
        ) : (
          <button
            onClick={() => {
              playClick();
              setAuthModalOpen(true);
            }}
            onMouseEnter={playHover}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all duration-300 cursor-pointer shadow-lg shadow-indigo-500/10"
          >
            <User className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Đăng nhập</span>
          </button>
        )}
      </div>
      )}

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <ChangePasswordModal open={changePasswordModalOpen} onClose={() => setChangePasswordModalOpen(false)} />
    </header>
  );
};

export default Header;
