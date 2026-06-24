'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSceneStore } from '@/store/sceneStore';
import { usePlanets } from '@/hooks/usePlanets';
import { useStars } from '@/hooks/useStars';
import DnbdIntro from '@/components/ui/DnbdIntro';

const QUIZ_QUESTIONS = [
  {
    question: "Bạn thích dành thời gian rảnh của mình để làm gì nhất?",
    options: [
      { text: "Đọc sách, thưởng thức nghệ thuật hoặc viết lách", scores: { "a7777777-7777-7777-7777-777777777777": 2, "a2222222-2222-2222-2222-222222222222": 2 } }, // Alkaid, Mizar
      { text: "Khám phá công nghệ mới hoặc giải đố logic", scores: { "a3333333-3333-3333-3333-333333333333": 2, "a1111111-1111-1111-1111-111111111111": 2 } }, // Alcor, Dubhe
      { text: "Thảo luận về lịch sử, triết lý hoặc chính trị", scores: { "a5555555-5555-5555-5555-555555555555": 2, "a4444444-4444-4444-4444-444444444444": 2 } }, // Alioth, Megrez
      { text: "Lên kế hoạch, rèn luyện kỹ năng và tự học", scores: { "a8888888-8888-8888-8888-888888888888": 2, "a6666666-6666-6666-6666-666666666666": 2 } }  // Phecda, Merak
    ]
  },
  {
    question: "Lĩnh vực nào sau đây kích thích sự tò mò của bạn nhất?",
    options: [
      { text: "Văn học cổ điển và các giá trị văn hóa lâu đời", scores: { "a7777777-7777-7777-7777-777777777777": 3 } }, // Alkaid
      { text: "Công nghệ số, AI và thiết bị thông minh hiện đại", scores: { "a1111111-1111-1111-1111-111111111111": 3 } }, // Dubhe
      { text: "Y học cứu người và khám phá khoa học vũ trụ", scores: { "a3333333-3333-3333-3333-333333333333": 3 } }, // Alcor
      { text: "Nghệ thuật quân binh và tư duy chiến lược", scores: { "a8888888-8888-8888-8888-888888888888": 3 } }  // Phecda
    ]
  },
  {
    question: "Khi đối mặt với một thử thách phức tạp, bạn thường làm gì?",
    options: [
      { text: "Tìm kiếm các giải pháp nghệ thuật, sáng tạo đột phá", scores: { "a2222222-2222-2222-2222-222222222222": 3 } }, // Mizar
      { text: "Phân tích sâu sắc bản chất triết lý và đạo đức", scores: { "a4444444-4444-4444-4444-444444444444": 3 } }, // Megrez
      { text: "Đứng ra dẫn dắt và tổ chức đội ngũ hành động", scores: { "a5555555-5555-5555-5555-555555555555": 3 } }, // Alioth
      { text: "Học hỏi phương pháp từ những chuyên gia đi trước", scores: { "a6666666-6666-6666-6666-666666666666": 3 } }  // Merak
    ]
  },
  {
    question: "Hình mẫu danh nhân nào truyền cảm hứng cho bạn nhiều nhất?",
    options: [
      { text: "Những người thầy tận tụy khai sáng tri thức trẻ", scores: { "a6666666-6666-6666-6666-666666666666": 3 } }, // Merak
      { text: "Những nhà phát minh kỹ thuật vĩ đại", scores: { "a1111111-1111-1111-1111-111111111111": 3, "a3333333-3333-3333-3333-333333333333": 2 } }, // Dubhe, Alcor
      { text: "Những nhạc sĩ, danh họa mang lại vẻ đẹp tâm hồn", scores: { "a2222222-2222-2222-2222-222222222222": 3, "a7777777-7777-7777-7777-777777777777": 2 } }, // Mizar, Alkaid
      { text: "Những lãnh tụ dân tộc đấu tranh vì độc lập", scores: { "a5555555-5555-5555-5555-555555555555": 3, "a8888888-8888-8888-8888-888888888888": 2 } }  // Alioth, Phecda
    ]
  },
  {
    question: "Khát vọng lớn nhất của bạn đóng góp cho cộng đồng là gì?",
    options: [
      { text: "Chia sẻ tri thức, giáo dục thế hệ tương lai", scores: { "a6666666-6666-6666-6666-666666666666": 3 } }, // Merak
      { text: "Bảo vệ nền hòa bình và xây dựng chính trị vững mạnh", scores: { "a5555555-5555-5555-5555-555555555555": 3, "a8888888-8888-8888-8888-888888888888": 2 } }, // Alioth, Phecda
      { text: "Sáng tác tác phẩm văn hóa nghệ thuật lay động lòng người", scores: { "a7777777-7777-7777-7777-777777777777": 3, "a2222222-2222-2222-2222-222222222222": 2 } }, // Alkaid, Mizar
      { text: "Phát triển công nghệ giải quyết các vấn đề thiết thực", scores: { "a1111111-1111-1111-1111-111111111111": 3, "a3333333-3333-3333-3333-333333333333": 2 } }  // Dubhe, Alcor
    ]
  }
];

export default function HomePage() {
  const { planets } = usePlanets();
  const { stars } = useStars();
  const appPhase            = useSceneStore((s) => s.appPhase);
  const homeTransitionState = useSceneStore((s) => s.homeTransitionState);
  const setHomeTransitionState = useSceneStore((s) => s.setHomeTransitionState);
  const setAppPhase         = useSceneStore((s) => s.setAppPhase);
  const setConstellationIntroComplete = useSceneStore((s) => s.setConstellationIntroComplete);
  const hasPlayedIntro      = useSceneStore((s) => s.hasPlayedIntro);
  const setHasPlayedIntro   = useSceneStore((s) => s.setHasPlayedIntro);
  const router              = useRouter();

  // Check localStorage to skip intro on subsequent visits
  const [skipIntro, setSkipIntro] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const visited = localStorage.getItem('dnbd_has_visited');
      if (visited) setSkipIntro(true);
    }
  }, []);

  const handleIntroComplete = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dnbd_has_visited', '1');
    }
    setHasPlayedIntro(true);
  };

  // Clean up and reset intro states when entering home page
  useEffect(() => {
    setAppPhase('home');
    setConstellationIntroComplete(false);
    // Note: hasPlayedIntro is NOT reset here — intro plays only once per session
  }, [setAppPhase, setConstellationIntroComplete]);

  const quizActive = useSceneStore((s) => s.quizActive);
  const quizPhase = useSceneStore((s) => s.quizPhase);
  const matchedPlanetId = useSceneStore((s) => s.matchedPlanetId);
  const setQuizActive = useSceneStore((s) => s.setQuizActive);
  const setQuizPhase = useSceneStore((s) => s.setQuizPhase);
  const setMatchedPlanetId = useSceneStore((s) => s.setMatchedPlanetId);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizScores, setQuizScores] = useState<Record<string, number>>({});

  const handleStartQuiz = () => {
    setCurrentQuestionIndex(0);
    setQuizScores({});
    setQuizActive(true);
    setQuizPhase('spawning');
  };

  const handleAnswerSelect = (optionScores: Record<string, number | undefined>) => {
    const newScores = { ...quizScores };
    Object.entries(optionScores).forEach(([starId, val]) => {
      if (val !== undefined) {
        newScores[starId] = (newScores[starId] || 0) + val;
      }
    });
    setQuizScores(newScores);

    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      let highestStarId = "a7777777-7777-7777-7777-777777777777";
      let maxScore = -1;
      Object.entries(newScores).forEach(([starId, val]) => {
        if (val > maxScore) {
          maxScore = val;
          highestStarId = starId;
        }
      });

      const matchedPlanet = planets.find((p) => p.star_id === highestStarId) || planets[0];
      if (matchedPlanet) {
        setMatchedPlanetId(matchedPlanet.id);
        setQuizPhase('matched');
      }
    }
  };

  const handleExploreMatched = () => {
    setQuizPhase('done');
    setHomeTransitionState('converging');
  };

  const [showFlash, setShowFlash]   = useState(false);
  const [showUI, setShowUI]         = useState(false);
  const triggered                   = useRef(false);

  // Fade in UI after a brief delay on mount
  useEffect(() => {
    const t = setTimeout(() => setShowUI(true), 600);
    return () => clearTimeout(t);
  }, []);

  // Watch for flash phase → show fullscreen flash → navigate to catalog
  useEffect(() => {
    if (homeTransitionState === 'flash') {
      setShowFlash(true);
    }
    if (homeTransitionState === 'done') {
      const state = useSceneStore.getState();
      if (state.quizActive && state.matchedPlanetId) {
        const p = planets.find((planet) => planet.id === state.matchedPlanetId);
        if (p) {
          state.setActiveStarId(p.star_id);
          state.setActivePlanetId(p.id);
          state.setAppPhase('catalog');
          
          state.setQuizActive(false);
          state.setQuizPhase('idle');
          state.setMatchedPlanetId(null);
          
          router.push(`/star/${p.star_id}`);
        } else {
          router.push('/catalog');
        }
      } else {
        router.push('/catalog');
      }
      
      // Small delay then reset (so catalog loads correctly)
      setTimeout(() => {
        setHomeTransitionState('idle');
      }, 200);
    }
  }, [homeTransitionState, router, setHomeTransitionState]);

  const handleExplore = () => {
    if (triggered.current) return;
    triggered.current = true;
    setShowUI(false);
    // Start star convergence
    setHomeTransitionState('converging');
  };

  // Only render this overlay while on home phase
  if (appPhase !== 'home') return null;

  // ── Intro gate ──────────────────────────────────────────────────────────────
  if (!hasPlayedIntro && !skipIntro) {
    return (
      <motion.div
        className="fixed inset-0 z-[200] pointer-events-auto"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <DnbdIntro onComplete={handleIntroComplete} />
      </motion.div>
    );
  }

  return (
    <>
      {/* ── Fullscreen transition flash ─────────────────────────────────── */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            key="home-flash"
            className="fixed inset-0 z-[100] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 0.55, times: [0, 0.1, 0.5, 1], ease: 'easeOut' }}
            onAnimationComplete={() => setShowFlash(false)}
            style={{
              background:
                'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(255,255,255,1) 0%, rgba(200,220,255,0.9) 35%, rgba(120,160,255,0.4) 65%, transparent 100%)',
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Main UI overlay ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showUI && homeTransitionState === 'idle' && !quizActive && (
          <motion.div
            key="home-ui"
            className="relative w-full h-full flex flex-col items-center justify-between p-6 md:p-10 select-none pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8 }}
          >
            {/* ── Header title block ─────────────────────────────────────── */}
            <motion.div
              className="flex flex-col items-center gap-3 pt-10 md:pt-14"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.9, ease: 'easeOut' }}
            >
              {/* Kicker */}
              <p className="text-[10px] tracking-[0.35em] uppercase font-mono text-indigo-400/70">
                Hệ bản đồ tri thức vũ trụ
              </p>

              {/* Main title */}
              <h1
                className="text-center font-bold leading-tight"
                style={{
                  fontSize: 'clamp(2rem, 5vw, 3.8rem)',
                  background: 'linear-gradient(135deg, #ffffff 0%, #c0d0ff 40%, #a78bfa 80%, #f0c0ff 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: 'none',
                  letterSpacing: '-0.02em',
                }}
              >
                Danh Nhân Bắc Đẩu
              </h1>

              {/* Sub-title */}
              <p className="text-slate-400 text-sm md:text-base text-center max-w-md leading-relaxed">
                Những vì sao tri thức, những cuộc đời vĩ đại —<br className="hidden md:block" />
                được khắc hoạ trong vũ trụ 3 chiều.
              </p>
            </motion.div>


            {/* ── Bottom: CTA buttons ─────────────────────────────────────── */}
            <motion.div
              className="flex flex-col items-center gap-6 pb-8 pointer-events-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.9 }}
            >
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Explore button */}
                <button
                  id="btn-explore"
                  onClick={handleExplore}
                  className="group relative overflow-hidden w-[280px] h-[54px] flex items-center justify-center rounded-full text-sm font-bold tracking-wider uppercase cursor-pointer transition-all duration-300 animate-in fade-in"
                  style={{
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.15) 100%)',
                    border: '1px solid rgba(139,92,246,0.4)',
                    color: '#c4b5fd',
                    boxShadow: '0 0 30px rgba(139,92,246,0.2), inset 0 0 20px rgba(99,102,241,0.05)',
                  }}
                >
                  {/* Shimmer sweep */}
                  <span
                    className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
                    }}
                  />
                  <span className="relative flex items-center gap-3">
                    <span
                      className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"
                      style={{ boxShadow: '0 0 8px #a78bfa' }}
                    />
                    Khám Phá Vũ Trụ
                    <span
                      className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"
                      style={{ boxShadow: '0 0 8px #a78bfa', animationDelay: '0.5s' }}
                    />
                  </span>
                </button>

                {/* Quiz button */}
                <div className="relative flex flex-col items-center justify-center">
                  <p className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 text-[10px] text-pink-400/80 font-mono tracking-wider font-semibold whitespace-nowrap">
                    Danh nhân nào hợp với bạn nhất?
                  </p>
                  <button
                    id="btn-quiz"
                    onClick={handleStartQuiz}
                    className="group relative overflow-hidden w-[280px] h-[54px] flex items-center justify-center rounded-full text-sm font-bold tracking-wider uppercase cursor-pointer transition-all duration-300 outline-none"
                    style={{
                      background: 'linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(236,72,153,0.15) 100%)',
                      border: '1px solid rgba(236,72,153,0.4)',
                      color: '#f472b6',
                      boxShadow: '0 0 30px rgba(236,72,153,0.15), inset 0 0 20px rgba(168,85,247,0.05)',
                    }}
                  >
                    {/* Shimmer sweep */}
                    <span
                      className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
                      }}
                    />
                    <span className="relative flex items-center gap-3">
                      <span
                        className="w-2 h-2 rounded-full bg-pink-400 animate-pulse"
                        style={{ boxShadow: '0 0 8px #f472b6' }}
                      />
                      Trắc Nghiệm Tính Cách
                      <span
                        className="w-2 h-2 rounded-full bg-pink-400 animate-pulse"
                        style={{ boxShadow: '0 0 8px #f472b6', animationDelay: '0.5s' }}
                      />
                    </span>
                  </button>
                </div>
              </div>

              {/* Hint */}
              <p className="text-[10px] text-slate-600 font-mono tracking-widest">
                [ nhấp để khám phá ]
              </p>
            </motion.div>
          </motion.div>
        )}

        {showUI && quizActive && (
          <div className="absolute left-4 right-4 md:left-auto md:right-16 top-1/2 -translate-y-1/2 max-w-lg mx-auto md:w-full pointer-events-none z-20">
            <motion.div
              key="quiz-ui"
              className="pointer-events-auto p-4 w-full"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.6 }}
            >
              <div className="backdrop-blur-xl bg-zinc-950/80 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col gap-6 select-text">
              {quizPhase === 'spawning' && (
                <div className="flex flex-col items-center justify-center py-10 gap-4">
                  <div className="w-10 h-10 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                  <p className="text-sm font-semibold tracking-wider text-indigo-400 uppercase font-mono animate-pulse text-center">
                    Đang kiến tạo hành tinh mới...
                  </p>
                  <p className="text-xs text-slate-500 max-w-xs text-center leading-relaxed">
                    Một thực thể thô sơ đang thành hình bên vành đai đĩa bồi tụ của hố đen.
                  </p>
                </div>
              )}

              {quizPhase === 'quiz' && (
                <>
                  {/* Header info */}
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase font-bold">
                      Trắc Nghiệm Tính Cách
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-450 bg-white/5 px-2 py-0.5 rounded-md">
                        Câu {currentQuestionIndex + 1} / 5
                      </span>
                      <button
                        onClick={() => {
                          setQuizActive(false);
                          setQuizPhase('idle');
                        }}
                        className="text-[10px] text-slate-500 hover:text-slate-300 font-mono tracking-widest cursor-pointer bg-transparent border-0 outline-none"
                      >
                        [ hủy ]
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-300"
                      style={{ width: `${((currentQuestionIndex + 1) / 5) * 100}%` }}
                    />
                  </div>

                  {/* Question */}
                  <h3 className="text-base sm:text-lg font-bold text-slate-100 leading-snug">
                    {QUIZ_QUESTIONS[currentQuestionIndex].question}
                  </h3>

                  {/* Options */}
                  <div className="flex flex-col gap-3">
                    {QUIZ_QUESTIONS[currentQuestionIndex].options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleAnswerSelect(opt.scores)}
                        className="w-full text-left px-5 py-3 rounded-2xl border border-white/5 hover:border-indigo-500/40 bg-white/[0.02] hover:bg-indigo-500/[0.04] text-xs sm:text-sm text-slate-300 hover:text-white transition-all duration-200 cursor-pointer flex items-center justify-between group shadow-sm outline-none"
                      >
                        <span>{opt.text}</span>
                        <span className="w-4 h-4 rounded-full border border-zinc-700 group-hover:border-indigo-500 group-hover:bg-indigo-500/20 transition-all duration-200 flex-shrink-0 ml-3" />
                      </button>
                    ))}
                  </div>
                </>
              )}

              {quizPhase === 'matched' && (() => {
                const p = planets.find((planet) => planet.id === matchedPlanetId);
                return (
                  <div className="flex flex-col gap-5 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-[10px] font-mono tracking-widest text-pink-400 uppercase font-bold">
                        Hành Tinh Phù Hợp Của Bạn
                      </span>
                      <h3 className="text-2xl font-bold text-white font-display mt-1">
                        Hành Tinh {p?.name}
                      </h3>
                      <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20 uppercase mt-1">
                        Lĩnh vực: {p ? stars.find(s => s.id === p.star_id)?.name : ''}
                      </span>
                    </div>

                    <p className="text-sm text-slate-300 leading-relaxed text-justify px-2 max-h-48 overflow-y-auto">
                      {p?.bio}
                    </p>

                    <div className="border-t border-white/5 pt-4 mt-2">
                      <button
                        onClick={handleExploreMatched}
                        className="w-full group relative overflow-hidden py-3 rounded-full text-sm font-bold tracking-wider uppercase cursor-pointer transition-all duration-300 outline-none"
                        style={{
                          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                          boxShadow: '0 0 30px rgba(168,85,247,0.3)',
                          color: '#ffffff',
                        }}
                      >
                        Khám Phá Hành Tinh {p?.name}
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
