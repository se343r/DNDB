'use client';

import React, { useState } from 'react';
import { X, Loader2, KeyRound, Check, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAudio } from '../providers/AudioProvider';

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ open, onClose }) => {
  const { playClick, playHover } = useAudio();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  const handleClose = () => {
    playClick();
    setError(null);
    setPassword('');
    setConfirmPassword('');
    setSuccess(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playClick();
    setError(null);

    if (password.length < 6) {
      setError('Mật khẩu mới phải dài tối thiểu 6 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);

    try {
      if (!supabase) throw new Error('Supabase client is not available');
      
      const { error: updateErr } = await supabase.auth.updateUser({
        password: password
      });

      if (updateErr) throw updateErr;

      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err: any) {
      console.error('Change password error:', err);
      setError(err.message || 'Có lỗi xảy ra khi đổi mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm pointer-events-auto">
      <div className="relative w-full max-w-sm bg-slate-950/90 border border-indigo-500/20 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(99,102,241,0.15)] flex flex-col select-none">
        {success ? (
          <div className="text-center py-4 flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-450">
              <Check className="w-6 h-6 animate-bounce" />
            </div>
            <h2 className="text-lg font-bold text-white">Đổi mật khẩu thành công!</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mật khẩu mới đã được cập nhật thành công cho tài khoản của bạn.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-indigo-500/10 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-indigo-500/15 border border-indigo-500/20 rounded-xl text-indigo-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold font-display text-white">
                    Đổi mật khẩu
                  </h2>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Nhập mật khẩu bảo mật mới của bạn
                  </p>
                </div>
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
              <div className="mb-4 p-3 bg-rose-950/20 border border-rose-500/20 rounded-xl text-xs text-rose-450 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Mật khẩu mới (tối thiểu 6 ký tự)
                </label>
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

              <div>
                <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                onMouseEnter={playHover}
                className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Lưu mật khẩu mới'
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ChangePasswordModal;
