'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSceneStore } from '@/store/sceneStore';

interface DnbdIntroProps {
  onComplete: () => void;
}

type IntroPhase =
  | 'pre_calibration'   // Initial screen – "Kết nối bản đồ tri thức"
  | 'register_gate'     // Auth gate – đăng ký bắt buộc
  | 'calibrating'       // Progress bar + log messages
  | 'ready'             // "KHÁM PHÁ VŨ TRỤ" button
  | 'voice_trigger'     // "Danh Nhân Bắc Đẩu!" flash text
  | 'vortex_stars'      // Star particle tunnel (replaces colored blocks)
  | 'welcome_splash'    // Welcome screen
  | 'vortex_cyan'       // Blue data stream tunnel
  | 'handshake';        // Entering the universe

export default function DnbdIntro({ onComplete }: DnbdIntroProps) {
  const [phase, setPhase] = useState<IntroPhase>('pre_calibration');
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);
  const phaseStartTime = useRef<number>(Date.now());

  // Auth
  const { isAuthenticated, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const setIsDemoMode = useSceneStore((s) => s.setIsDemoMode);

  // Register gate state
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regStudentId, setRegStudentId] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  useEffect(() => {
    phaseStartTime.current = Date.now();
  }, [phase]);

  // ── Calibration log simulation ──────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'calibrating') return;
    const messages = [
      'Kết nối mạng lưới tri thức Bắc Đẩu Thất Tinh...',
      'Ánh xạ toạ độ hành tinh từ cơ sở dữ liệu lịch sử...',
      'Đồng bộ dữ liệu danh nhân — 1.247 nhân vật...',
      'Khởi tạo bản đồ vũ trụ 3D không gian — STABLE',
      'Hiệu chỉnh quỹ đạo hành tinh và hệ sao...',
      'Kết nối hệ thống âm thanh không gian...',
      'Bộ nhớ lịch sử đã tải: 2.000 năm dữ liệu',
      'Sẵn sàng đi vào vũ trụ tri thức.',
    ];
    let idx = 0;
    const logInt = setInterval(() => {
      if (idx < messages.length) {
        setLogMessages(prev => [...prev, `[INIT] ${messages[idx++]}`]);
      }
    }, 450);
    const progInt = setInterval(() => {
      setCalibrationProgress(prev => {
        if (prev >= 100) {
          clearInterval(progInt);
          clearInterval(logInt);
          setTimeout(() => setPhase('ready'), 400);
          return 100;
        }
        return prev + 2;
      });
    }, 80);
    return () => { clearInterval(logInt); clearInterval(progInt); };
  }, [phase]);

  // ── Main sequence ───────────────────────────────────────────────────────────
  const startSequence = () => {
    setPhase('voice_trigger');
    setTimeout(() => setPhase('vortex_stars'), 1500);
    setTimeout(() => setPhase('welcome_splash'), 6000);
    setTimeout(() => setPhase('vortex_cyan'), 8500);
    setTimeout(() => setPhase('handshake'), 11000);
    setTimeout(() => onComplete(), 12500);
  };

  // ── Canvas: star-particle tunnel (runs for vortex_stars and vortex_cyan) ───
  useEffect(() => {
    if (phase !== 'vortex_stars' && phase !== 'vortex_cyan') {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
        animFrameId.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    const cx = w / 2;
    const cy = h / 2;

    // ── Star colour palettes ────────────────────────────────────────────────
    const palette = phase === 'vortex_stars'
      ? ['#ffffff','#fff8ee','#ffe8b0','#c8d8ff','#b0c4ff','#ffd0ff','#ddb0ff','#ffe890','#ffd060']
      : ['#60d8ff','#40b8ff','#20a0ff','#80eaff','#a8f2ff','#ffffff','#d0f0ff'];

    interface Star {
      angle: number;
      radius: number;
      z: number;
      baseSpd: number;
      size: number;       // visual radius when close
      colour: string;
      bright: number;
      spike: number;      // diffraction spike length (0 = none)
      twOff: number;      // twinkle phase offset
    }

    const COUNT = phase === 'vortex_stars' ? 480 : 680;

    const mkStar = (initial = false): Star => {
      const size = 0.5 + Math.random() * 2.2;
      return {
        angle:   Math.random() * Math.PI * 2,
        radius:  6 + Math.random() * 290,
        z:       initial ? Math.random() * 1100 + 40 : 1150,
        baseSpd: phase === 'vortex_stars' ? 4 + Math.random() * 3.5 : 8 + Math.random() * 5,
        size,
        colour:  palette[Math.floor(Math.random() * palette.length)],
        bright:  0.5 + Math.random() * 0.5,
        spike:   size > 1.5 ? 1.0 + Math.random() * 1.8 : 0,
        twOff:   Math.random() * Math.PI * 2,
      };
    };

    const stars: Star[] = Array.from({ length: COUNT }, () => mkStar(true));
    let globalRot = 0;
    let tick = 0;

    // Pre-render a soft glow sprite for performance
    const glowOff = document.createElement('canvas');
    glowOff.width = 64; glowOff.height = 64;
    const go = glowOff.getContext('2d')!;
    const gg = go.createRadialGradient(32,32,0,32,32,32);
    gg.addColorStop(0,   'rgba(255,255,255,1)');
    gg.addColorStop(0.2, 'rgba(255,255,255,0.6)');
    gg.addColorStop(0.5, 'rgba(255,255,255,0.15)');
    gg.addColorStop(1,   'rgba(255,255,255,0)');
    go.fillStyle = gg; go.fillRect(0,0,64,64);

    const drawStarPoint = (px: number, py: number, r: number, col: string, alpha: number, spike: number) => {
      if (alpha < 0.015) return;
      // Glow halo
      const hr = r * 4;
      ctx.save();
      ctx.globalAlpha = alpha * 0.55;
      ctx.globalCompositeOperation = 'lighter';
      ctx.drawImage(glowOff, px - hr, py - hr, hr*2, hr*2);
      // Solid core
      ctx.globalAlpha = alpha;
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(px, py, Math.max(r, 0.6), 0, Math.PI*2); ctx.fill();
      ctx.restore();
      // Diffraction spikes
      if (spike > 0 && alpha > 0.35) {
        const sl = r * 7 * spike;
        ctx.save();
        ctx.globalAlpha = alpha * 0.45;
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineWidth = Math.max(r * 0.35, 0.5);
        ctx.lineCap = 'round';
        [[[px-sl,py],[px+sl,py]], [[px,py-sl],[px,py+sl]]].forEach(([[x1,y1],[x2,y2]]) => {
          const gr = ctx.createLinearGradient(x1,y1,x2,y2);
          gr.addColorStop(0,'transparent'); gr.addColorStop(0.38,col);
          gr.addColorStop(0.5,col); gr.addColorStop(0.62,col); gr.addColorStop(1,'transparent');
          ctx.strokeStyle = gr;
          ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
        });
        ctx.restore();
      }
    };

    const render = () => {
      tick++;
      ctx.fillStyle = phase === 'vortex_stars' ? 'rgba(3,2,14,0.20)' : 'rgba(1,3,16,0.17)';
      ctx.fillRect(0, 0, w, h);

      const elapsed = (Date.now() - phaseStartTime.current) / 1000;
      // Gentle acceleration — not hyperspace, more like a graceful drift
      const k = phase === 'vortex_stars' ? 0.32 : 0.58;
      const speedMult = 1 + (Math.exp(elapsed * k) - 1) * 0.65;
      globalRot += (phase === 'vortex_stars' ? 0.0012 : 0.003) * Math.min(speedMult, 4);

      // Nebula center glow
      const nbR = 200;
      const nb = ctx.createRadialGradient(cx,cy,0,cx,cy,nbR);
      if (phase === 'vortex_stars') {
        nb.addColorStop(0,   'rgba(110,70,240,0.16)');
        nb.addColorStop(0.5, 'rgba(60,30,160,0.05)');
        nb.addColorStop(1,   'rgba(0,0,0,0)');
      } else {
        nb.addColorStop(0,   'rgba(20,130,255,0.18)');
        nb.addColorStop(0.5, 'rgba(0,80,200,0.06)');
        nb.addColorStop(1,   'rgba(0,0,0,0)');
      }
      ctx.save(); ctx.globalCompositeOperation='lighter';
      ctx.fillStyle = nb;
      ctx.beginPath(); ctx.arc(cx,cy,nbR,0,Math.PI*2); ctx.fill();
      ctx.restore();

      // Draw stars as glowing points
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.z -= s.baseSpd * speedMult;
        if (s.z <= 22) { stars[i] = mkStar(false); continue; }

        const proj = 500 / s.z;
        const ang  = s.angle + globalRot;
        const px   = cx + Math.cos(ang) * s.radius * proj;
        const py   = cy + Math.sin(ang) * s.radius * proj;

        if (px < -80 || px > w+80 || py < -80 || py > h+80) continue;

        const twinkle   = 0.78 + 0.22 * Math.sin(tick * 0.055 + s.twOff);
        const depthFade = Math.min(1, (1150 - s.z) / 450);
        const alpha     = s.bright * twinkle * depthFade;
        const r         = Math.min(s.size * proj * 0.5, 5.5);

        drawStarPoint(px, py, r, s.colour, alpha, s.spike);
      }

      // ── Cyan vortex overlay rings ──
      if (phase === 'vortex_cyan') {
        ctx.strokeStyle = 'rgba(30, 180, 255, 0.12)';
        ctx.lineWidth = 1.2;
        const tf = (Date.now() / 700) % 3;
        for (let j = 1; j <= 3; j++) {
          const r = ((j + tf) / 3) * Math.min(w, h) * 0.6;
          ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.strokeStyle = 'rgba(30, 180, 255, 0.04)';
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(a) * Math.max(w, h), cy + Math.sin(a) * Math.max(w, h));
          ctx.stroke();
        }
      }

      // ── Entry flash ──
      const elapsed2 = Date.now() - phaseStartTime.current;
      if (phase === 'vortex_stars' && elapsed2 < 1200) {
        const p = elapsed2 / 1200;
        const r = p * Math.max(w, h) * 1.5;
        ctx.fillStyle = `rgba(200,180,255,${0.85 * (1 - p)})`;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      }
      if (phase === 'vortex_cyan' && elapsed2 < 1000) {
        const p = elapsed2 / 1000;
        const r = p * Math.max(w, h) * 1.5;
        ctx.fillStyle = `rgba(30,180,255,${0.65 * (1 - p)})`;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      window.removeEventListener('resize', onResize);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [phase]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      className={`relative w-full h-screen select-none overflow-hidden flex items-center justify-center transition-colors duration-500 ${
        phase === 'welcome_splash' ? 'bg-[#0a0a18] text-white' : 'bg-[#04040e] text-white'
      }`}
      style={{ fontFamily: "'Inter', 'Space Grotesk', sans-serif" }}
    >
      {/* Background scanlines */}
      {phase !== 'welcome_splash' && (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/20 via-slate-950 to-black z-0 pointer-events-none" />
          <div
            className="absolute inset-0 pointer-events-none z-10 opacity-20"
            style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.4) 50%)', backgroundSize: '100% 4px' }}
          />
        </>
      )}

      {/* Star-field background dots (always visible except welcome_splash) */}
      {phase !== 'welcome_splash' && phase !== 'vortex_stars' && phase !== 'vortex_cyan' && (
        <StaticStarField />
      )}

      <AnimatePresence mode="wait">

        {/* ── Phase 1: Pre-calibration ───────────────────────────────────── */}
        {phase === 'pre_calibration' && (
          <motion.div
            key="pre_cal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6 }}
            className="z-10 max-w-sm w-full px-6 text-center text-slate-300"
          >
            {/* Logo mark */}
            <div className="flex justify-center mb-8">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border border-indigo-800/60" />
                <div className="absolute inset-2 rounded-full border border-dashed border-indigo-600/40 animate-spin [animation-duration:18s]" />
                <div className="absolute inset-4 rounded-full border border-indigo-500/20 animate-pulse" />
                {/* North Star SVG */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.7)]">
                    <path d="M12 2L13.5 10.5L22 12L13.5 13.5L12 22L10.5 13.5L2 12L10.5 10.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            <h1 className="text-lg font-bold uppercase tracking-[0.3em] text-slate-100 mb-1">
              Danh Nhân Bắc Đẩu
            </h1>
            <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest mb-8">
              Hệ Bản Đồ Tri Thức Vũ Trụ v1.0
            </p>

            <button
              id="btn-init-dnbd"
              onClick={() => {
                if (isAuthenticated) {
                  setPhase('calibrating');
                } else {
                  setRegError(null);
                  setPhase('register_gate');
                }
              }}
              className="w-full py-3.5 px-6 font-mono text-xs uppercase tracking-widest rounded border border-indigo-800/60 hover:border-indigo-500 bg-indigo-950/40 hover:bg-indigo-900/30 text-slate-200 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer focus:outline-none"
            >
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              Kết Nối Hệ Thống
            </button>
          </motion.div>
        )}

        {/* ── Phase 1.5: Register Gate ──────────────────────────────────── */}
        {phase === 'register_gate' && (
          <motion.div
            key="register_gate"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5 }}
            className="z-10 w-full max-w-sm px-6"
          >
            {/* Header */}
            <div className="text-center mb-6">
              <p className="text-[10px] font-mono text-indigo-500 uppercase tracking-[0.4em] mb-2">Xác thực danh tính</p>
              <h2 className="text-lg font-bold text-white leading-tight">
                Trước khi tiếp cận vũ trụ tri thức
              </h2>
              <p className="text-xs text-slate-500 mt-1">Tạo tài khoản để lưu tiến trình và lên bảng xếp hạng</p>
            </div>

            {/* Tab toggle */}
            <div className="flex rounded-lg border border-slate-800 overflow-hidden mb-5">
              <button
                onClick={() => { setAuthMode('signup'); setRegError(null); }}
                className={`flex-1 py-2 text-[11px] font-mono uppercase tracking-widest transition-colors cursor-pointer ${authMode === 'signup' ? 'bg-indigo-900/60 text-indigo-300' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Tạo tài khoản
              </button>
              <button
                onClick={() => { setAuthMode('signin'); setRegError(null); }}
                className={`flex-1 py-2 text-[11px] font-mono uppercase tracking-widest transition-colors cursor-pointer ${authMode === 'signin' ? 'bg-indigo-900/60 text-indigo-300' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Đăng nhập
              </button>
            </div>

            {/* Google OAuth */}
            <button
              onClick={async () => { await signInWithGoogle(); }}
              className="w-full flex items-center justify-center gap-2 py-2.5 mb-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-white cursor-pointer transition"
            >
              <LogIn className="w-4 h-4" />
              Tiếp tục với Google
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[10px] text-slate-500 font-mono uppercase">hoặc</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Error */}
            {regError && (
              <div className="mb-3 p-2.5 bg-rose-950/30 border border-rose-500/20 rounded-lg text-[11px] text-rose-400">
                {regError}
              </div>
            )}

            {/* Form */}
            <form
              className="flex flex-col gap-3"
              onSubmit={async (e) => {
                e.preventDefault();
                setRegLoading(true);
                setRegError(null);
                let result;
                if (authMode === 'signup') {
                  result = await signUpWithEmail(regEmail, regPassword, regName || regEmail.split('@')[0], regStudentId);
                } else {
                  result = await signInWithEmail(regEmail, regPassword);
                }
                setRegLoading(false);
                if (result?.error) {
                  setRegError(result.error);
                  return;
                }
                setPhase('calibrating');
              }}
            >
              {authMode === 'signup' && (
                <>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Tên hiển thị"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 transition-colors"
                  />
                  <input
                    type="text"
                    value={regStudentId}
                    onChange={(e) => setRegStudentId(e.target.value)}
                    placeholder="Mã số sinh viên (không bắt buộc)"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 transition-colors"
                  />
                </>
              )}
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="Email"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 transition-colors"
              />
              <input
                type="password"
                required
                minLength={6}
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Mật khẩu (tối thiểu 6 ký tự)"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                type="submit"
                disabled={regLoading}
                className="w-full mt-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                {regLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {authMode === 'signup' ? 'Tạo tài khoản & Kết nối' : 'Đăng nhập & Kết nối'}
              </button>
            </form>

            {/* Demo skip */}
            <button
              onClick={() => {
                setIsDemoMode(true);
                setPhase('calibrating');
              }}
              className="w-full mt-4 text-[10px] text-center text-slate-600 hover:text-slate-400 cursor-pointer transition font-mono uppercase tracking-widest"
            >
              Chỉ xem thử — vào chế độ Demo
            </button>
          </motion.div>
        )}

        {/* ── Phase 2: Calibrating ──────────────────────────────────────── */}
        {phase === 'calibrating' && (

          <motion.div
            key="calibrating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="z-10 max-w-xl w-full px-6 flex flex-col items-center"
          >
            <div className="w-14 h-14 rounded-full border-2 border-indigo-900 border-t-indigo-500 animate-spin flex items-center justify-center mb-5">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            </div>
            <h2 className="text-xs font-mono uppercase tracking-widest text-indigo-400 mb-1">
              Đồng bộ hệ thống: {calibrationProgress}%
            </h2>
            <div className="w-full bg-slate-900/70 border border-slate-800 h-[6px] rounded-full overflow-hidden mb-8">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-500"
                style={{ width: `${calibrationProgress}%`, boxShadow: '0 0 10px rgba(99,102,241,0.7)' }}
              />
            </div>
            <div className="w-full bg-slate-950/80 border border-slate-900 rounded p-4 h-44 overflow-y-auto font-mono text-[10px] text-slate-400 text-left space-y-1.5 shadow-inner">
              <AnimatePresence>
                {logMessages.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} className="flex gap-2">
                    <span className="text-indigo-500 font-bold">›</span>
                    <span>{msg}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div className="w-1.5 h-3 bg-indigo-400 animate-ping mt-1" />
            </div>
          </motion.div>
        )}

        {/* ── Phase 3: Ready — "KHÁM PHÁ VŨ TRỤ" ──────────────────────── */}
        {phase === 'ready' && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="z-10 max-w-md w-full px-6 text-center"
          >
            {/* Stats readout */}
            <div className="grid grid-cols-3 gap-2 mb-10 text-[10px] font-mono text-slate-500 uppercase tracking-widest text-left">
              {[
                { label: 'Danh nhân', value: '1.247', color: 'text-indigo-400' },
                { label: 'Hệ sao', value: '8 sao', color: 'text-violet-400' },
                { label: 'Thế kỷ', value: '20+ TK', color: 'text-sky-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="border border-slate-800/80 bg-slate-900/30 p-2.5 rounded">
                  <span className="block text-slate-600 mb-0.5">{label}</span>
                  <span className={`${color} font-semibold text-[11px]`}>{value}</span>
                </div>
              ))}
            </div>

            {/* North Star symbol */}
            <div className="relative inline-flex items-center justify-center w-28 h-28 mb-12">
              <div className="absolute inset-0 border border-slate-800 rounded-full" />
              <div className="absolute inset-2 border border-dashed border-indigo-700/50 rounded-full animate-spin [animation-duration:12s]" />
              <div className="absolute inset-4 border border-indigo-500/20 rounded-full animate-pulse" />
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-indigo-400 drop-shadow-[0_0_12px_rgba(99,102,241,0.8)]">
                <path d="M12 2L13.5 10.5L22 12L13.5 13.5L12 22L10.5 13.5L2 12L10.5 10.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.6"/>
              </svg>
            </div>

            {/* CTA button */}
            <div className="relative group">
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 opacity-50 blur-xl group-hover:opacity-90 transition-all duration-500 animate-pulse" />
              <button
                id="btn-explore-universe"
                onClick={startSequence}
                className="relative w-full py-4 px-8 font-mono text-sm font-bold uppercase tracking-[0.5em] rounded-lg bg-slate-950 border border-indigo-800/60 hover:border-indigo-400 text-white transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden cursor-pointer focus:outline-none shadow-2xl"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-950/50 via-transparent to-violet-950/50" />
                <span className="relative z-10 tracking-[0.5em] ml-2 group-hover:text-indigo-200 transition-colors">
                  KHÁM PHÁ VŨ TRỤ
                </span>
              </button>
            </div>

            <p className="mt-6 text-[10px] font-mono text-slate-600 uppercase tracking-wider">
              Hệ thống đã sẵn sàng — nhấp để bắt đầu hành trình.
            </p>
          </motion.div>
        )}

        {/* ── Phase 4: Voice trigger flash ─────────────────────────────── */}
        {phase === 'voice_trigger' && (
          <motion.div
            key="voice_trigger"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.95, 1, 1.03, 1.08] }}
            transition={{ duration: 1.5, times: [0, 0.15, 0.85, 1] }}
            className="z-10 text-center"
          >
            <h1 className="text-4xl font-bold uppercase tracking-[0.3em] text-white drop-shadow-[0_0_30px_rgba(99,102,241,0.9)]">
              Danh Nhân Bắc Đẩu!
            </h1>
            <div className="mt-5 flex justify-center gap-1.5">
              {[0, 100, 200].map(d => (
                <span
                  key={d}
                  className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"
                  style={{ animationDelay: `${d}ms` }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Phase 5: Star tunnel HUD overlay ──────────────────────────── */}
        {phase === 'vortex_stars' && (
          <motion.div
            key="vortex_stars"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex flex-col justify-end items-center pb-20 pointer-events-none"
          >
            <div className="bg-black/40 backdrop-blur-sm border border-indigo-900/50 px-5 py-3 rounded-lg text-center max-w-sm">
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-indigo-400 animate-pulse font-bold">
                ĐANG KẾT NỐI VŨ TRỤ TRI THỨC
              </p>
              <div className="mt-2 h-[2px] bg-slate-900 w-48 mx-auto rounded overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 animate-pulse w-full" />
              </div>
              <p className="mt-1.5 text-[8px] font-mono text-slate-600">
                ĐỒNG BỘ DỮ LIỆU DANH NHÂN — VUI LÒNG CHỜ...
              </p>
            </div>
          </motion.div>
        )}

        {/* ── Phase 6: Welcome splash ───────────────────────────────────── */}
        {phase === 'welcome_splash' && (
          <motion.div
            key="welcome_splash"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.06 }}
            transition={{ duration: 0.7 }}
            className="z-20 text-center px-4 w-full max-w-3xl"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mx-auto py-12 px-6"
            >
              <div className="w-full h-[2px] mb-8" style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.6), rgba(168,85,247,0.6), transparent)' }} />

              <motion.h1
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7 }}
                className="text-4xl md:text-6xl font-extrabold uppercase tracking-[0.2em]"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #c4b5fd 50%, #818cf8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                Chào mừng đến
              </motion.h1>

              <motion.h2
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.7 }}
                className="text-2xl md:text-4xl font-extrabold uppercase tracking-[0.15em] mt-4"
                style={{
                  background: 'linear-gradient(135deg, #c4b5fd 0%, #a78bfa 50%, #7c3aed 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                Danh Nhân Bắc Đẩu!
              </motion.h2>

              <div className="w-full h-[2px] mt-8" style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.6), rgba(168,85,247,0.6), transparent)' }} />

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 1.1 }}
                className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em] font-semibold mt-6"
              >
                Hệ Bản Đồ Tri Thức Vũ Trụ v1.0 • Kết nối ổn định
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* ── Phase 7: Cyan data stream HUD overlay ────────────────────── */}
        {phase === 'vortex_cyan' && (
          <motion.div
            key="vortex_cyan"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex flex-col justify-end items-center pb-20 pointer-events-none"
          >
            <div className="bg-black/30 border border-sky-800/40 px-5 py-3 rounded-lg text-center">
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-sky-400">
                KẾT NỐI HỆ SAO THÀNH CÔNG
              </span>
              <p className="mt-1 text-[8px] font-mono text-slate-600">
                ĐANG KHỞI ĐỘNG BẢN ĐỒ 3D — XỬ LÝ DỮ LIỆU LỊCH SỬ...
              </p>
            </div>
          </motion.div>
        )}

        {/* ── Phase 8: Handshake ────────────────────────────────────────── */}
        {phase === 'handshake' && (
          <motion.div
            key="handshake"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="z-10 text-center font-mono text-xs uppercase"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-0.5 bg-indigo-500 rounded animate-bounce" />
              <p className="tracking-[0.4em] font-bold text-slate-200">Đang vào Vũ Trụ Tri Thức...</p>
              <p className="text-[9px] text-slate-600 tracking-widest">Khởi tạo bản đồ không gian 3D...</p>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Canvas for vortex phases */}
      {(phase === 'vortex_stars' || phase === 'vortex_cyan') && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full z-0 pointer-events-none"
        />
      )}
    </div>
  );
}

// ── Static background star field (lightweight, CSS only) ─────────────────────
function StaticStarField() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const stars = React.useMemo(() => {
    if (!mounted) return [];
    return Array.from({ length: 120 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 0.5 + Math.random() * 1.5,
      opacity: 0.2 + Math.random() * 0.6,
      delay: Math.random() * 4,
      duration: 2 + Math.random() * 3,
    }));
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {stars.map(s => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white animate-pulse"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            opacity: s.opacity,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
