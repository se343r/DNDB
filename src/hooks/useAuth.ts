'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  total_points: number;
  level: number;
  current_streak: number;
  longest_streak: number;
}

/**
 * Hook quản lý trạng thái đăng nhập + profile của user hiện tại.
 * Lắng nghe onAuthStateChange để tự động cập nhật khi user đăng nhập/đăng xuất
 * ở tab khác hoặc sau khi OAuth redirect quay về.
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    if (!supabase) return;
    const { data } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, total_points, level, current_streak, longest_streak')
      .eq('id', userId)
      .single();
    setProfile(data);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) fetchProfile(user.id);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  useEffect(() => {
    if (user) {
      const email = user.email || 'N/A';
      const mssv = user.user_metadata?.student_id || 'N/A';
      const logKey = `logged_${user.id}`;
      if (typeof window !== 'undefined' && !(window as any)[logKey]) {
        (window as any)[logKey] = true;
        console.log(`%c[DNDB Auth]%c Gmail: ${email} | MSSV: ${mssv}`, 'color: #8b5cf6; font-weight: bold;', 'color: #38bdf8;');
      }
    }
  }, [user]);

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    });
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: 'Supabase chưa được cấu hình' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string, displayName: string, studentId?: string) => {
    if (!supabase) return { error: 'Supabase chưa được cấu hình' };
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: displayName, student_id: studentId || '' } },
    });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (!supabase) return { error: 'Supabase chưa được cấu hình' };
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error?.message ?? null };
  }, []);

  return {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    resetPassword,
    refreshProfile: () => user && fetchProfile(user.id),
  };
}
