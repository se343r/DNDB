'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { KeyRound, Check, Loader2, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAudio } from '@/components/providers/AudioProvider';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { playClick, playHover } = useAudio();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Supabase automatically logs the user in via recovery tokens placed in the URL hash,
  // allowing auth.updateUser() to work seamlessly.
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setError('Hệ thống cơ sở dữ liệu Supabase chưa được cấu hình.');
    }
  }, []);

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
        router.push('/');
      }, 3000);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Có lỗi xảy ra khi cập nhật mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-transparent flex items-center justify-center p-6 text-white overflow-y-auto">
      <div className="w-full max-w-md bg-slate-950/80 border border-indigo-500/20 rounded-3xl p-8 backdrop-blur-xl shadow-[0_0_50px_rgba(99,102,241,0.15)] relative z-10 pointer-events-auto">
        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6 flex flex-col items-center gap-4"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-450">
              <Check className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold">Đặt lại mật khẩu thành công!</h2>
            <p className="text-xs text-slate-450 leading-relaxed">
              Mật khẩu của bạn đã được cập nhật. Bạn sẽ được tự động chuyển hướng về trang chủ sau vài giây...
            </p>
            <button
              onClick={() => router.push('/')}
              onMouseEnter={playHover}
              className="mt-4 px-6 py-2 bg-indigo-650 hover:bg-indigo-600 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Về trang chủ ngay
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-5"
          >
            <div className="flex items-center gap-3 border-b border-indigo-500/10 pb-4 mb-2">
              <div className="p-2 bg-indigo-500/15 border border-indigo-500/20 rounded-2xl text-indigo-400">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-display">Tạo mật khẩu mới</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Nhập mật khẩu bảo mật mới cho tài khoản của bạn
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-950/20 border border-rose-500/20 rounded-xl text-xs text-rose-450 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                className="w-full mt-3 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Lưu mật khẩu mới'
                )}
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
