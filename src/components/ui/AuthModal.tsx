'use client';

import React, { useState } from 'react';
import { X, Loader2, Mail, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAudio } from '../providers/AudioProvider';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ open, onClose }) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } = useAuth();
  const { playClick, playHover } = useAudio();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [regSuccessEmail, setRegSuccessEmail] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  if (!open) return null;

  const handleClose = () => {
    playClick();
    setError(null);
    setEmail('');
    setPassword('');
    setDisplayName('');
    setStudentId('');
    setRegSuccessEmail(null);
    setForgotSuccess(false);
    setMode('signin');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playClick();
    setError(null);
    setLoading(true);

    if (mode === 'forgot') {
      const result = await resetPassword(email);
      setLoading(false);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setForgotSuccess(true);
      return;
    }

    const result =
      mode === 'signin'
        ? await signInWithEmail(email, password)
        : await signUpWithEmail(email, password, displayName || email.split('@')[0], studentId);

    setLoading(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    if (mode === 'signup') {
      setRegSuccessEmail(email);
    } else {
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm pointer-events-auto">
      <div className="relative w-full max-w-sm bg-slate-950/90 border border-indigo-500/20 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(99,102,241,0.15)] flex flex-col select-none">
        {forgotSuccess ? (
          <div className="text-center py-4">
            <div className="flex justify-center mb-5 text-indigo-400">
              <Mail className="w-12 h-12 animate-pulse" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Khôi phục mật khẩu</h2>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Một liên kết khôi phục mật khẩu đã được gửi tới <strong className="text-indigo-300">{email}</strong>. 
              Vui lòng kiểm tra hòm thư của bạn và nhấp vào liên kết để tạo mật khẩu mới.
            </p>
            <button
              onClick={() => {
                setForgotSuccess(false);
                setMode('signin');
                setEmail('');
              }}
              onMouseEnter={playHover}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Quay lại đăng nhập
            </button>
          </div>
        ) : regSuccessEmail ? (
          <div className="text-center py-4">
            <div className="flex justify-center mb-5 text-indigo-400">
              <Mail className="w-12 h-12 animate-pulse" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Xác thực tài khoản</h2>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Một liên kết xác thực đã được gửi tới <strong className="text-indigo-300">{regSuccessEmail}</strong>. 
              Vui lòng kiểm tra hộp thư đến (hoặc hòm thư rác/spam) và nhấp vào liên kết để kích hoạt tài khoản của bạn trước khi đăng nhập.
            </p>
            <button
              onClick={() => {
                setRegSuccessEmail(null);
                setMode('signin');
                setEmail('');
                setPassword('');
                setDisplayName('');
                setStudentId('');
              }}
              onMouseEnter={playHover}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Quay lại đăng nhập
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-indigo-500/10 pb-4 mb-5">
              <div>
                <h2 className="text-xl font-bold font-display text-white">
                  {mode === 'signin' ? 'Đăng nhập' : mode === 'signup' ? 'Tạo tài khoản' : 'Quên mật khẩu'}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {mode === 'forgot'
                    ? 'Nhập email của bạn để nhận liên kết khôi phục mật khẩu'
                    : 'Lưu tiến trình, lên bảng xếp hạng và nhận gợi ý cá nhân hoá'}
                </p>
              </div>
              <button
                onClick={handleClose}
                onMouseEnter={playHover}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-950/20 border border-rose-500/20 rounded-xl text-xs text-rose-400">
                {error}
              </div>
            )}

            {mode !== 'forgot' && (
              <>
                <button
                  onClick={() => {
                    playClick();
                    signInWithGoogle();
                  }}
                  onMouseEnter={playHover}
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
              </>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                      Tên hiển thị
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Tên của bạn"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                      Mã số sinh viên
                    </label>
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="Không bắt buộc"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                      Mật khẩu
                    </label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => {
                          playClick();
                          setMode('forgot');
                          setError(null);
                        }}
                        className="text-[10px] text-zinc-500 hover:text-indigo-400 transition cursor-pointer bg-transparent border-0 outline-none"
                      >
                        Quên mật khẩu?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                onMouseEnter={playHover}
                className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : mode === 'signin' ? (
                  'Đăng nhập'
                ) : mode === 'signup' ? (
                  'Tạo tài khoản'
                ) : (
                  'Gửi liên kết khôi phục'
                )}
              </button>
            </form>

            <button
              onClick={() => {
                playClick();
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError(null);
              }}
              onMouseEnter={playHover}
              className="mt-4 text-[11px] text-center text-slate-400 hover:text-indigo-300 cursor-pointer transition"
            >
              {mode === 'forgot'
                ? 'Quay lại đăng nhập'
                : mode === 'signin'
                ? 'Chưa có tài khoản? Đăng ký'
                : 'Đã có tài khoản? Đăng nhập'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
