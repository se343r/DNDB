'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Flame, Loader2, AlertCircle } from 'lucide-react';
import { useSceneStore } from '@/store/sceneStore';
import { useAudio } from '@/components/providers/AudioProvider';
import { useAuth } from '@/hooks/useAuth';

interface LeaderboardRow {
  rank: number;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  level: number;
  points: number;
  streak: number;
}

export default function LeaderboardPage() {
  const { playHover } = useAudio();
  const setAppPhase = useSceneStore((state) => state.setAppPhase);
  const leaderboardStarsLanded = useSceneStore((state) => state.leaderboardStarsLanded);
  const { user } = useAuth();

  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [currentUserRow, setCurrentUserRow] = useState<LeaderboardRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAppPhase('leaderboard');
    return () => {
      setAppPhase('catalog');
    };
  }, [setAppPhase]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/leaderboard?limit=20');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Không tải được bảng xếp hạng');
        setRows(data.leaderboard);
        setCurrentUserRow(data.current_user);
      } catch (err: any) {
        setError(err.message || 'Có lỗi xảy ra');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-slate-300" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-xs font-mono text-slate-500 w-5 text-center">{rank}</span>;
    }
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-transparent flex flex-col items-center justify-start p-6 pt-24 text-white overflow-y-auto">
      <div className="w-full max-w-2xl flex flex-col gap-6 relative z-10 pointer-events-auto">
        {/* Banner */}
        <div className="bg-slate-950/80 border border-indigo-500/20 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl flex flex-col gap-3">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide">Bảng Xếp Hạng</h1>
              <p className="text-xs text-slate-400 mt-1">
                Vinh danh những nhà thám hiểm vũ trụ tri thức có số điểm tích lũy cao nhất.
              </p>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center gap-3 py-12">
            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
            <p className="text-xs text-slate-500">Đang tải bảng xếp hạng...</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <AlertCircle className="w-6 h-6 text-rose-400" />
            <p className="text-xs text-slate-400">{error}</p>
          </div>
        )}

        {!loading && !error && rows.length === 0 && (
          <div className="text-center py-12 text-xs text-slate-500">
            Chưa có ai trên bảng xếp hạng. Hãy là người đầu tiên hoàn thành một câu đố!
          </div>
        )}

        {!loading && !error && rows.length > 0 && (
          <div className="bg-slate-950/70 border border-indigo-500/10 rounded-2xl overflow-hidden backdrop-blur-lg shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] text-slate-500 font-mono tracking-widest uppercase bg-white/2">
                    <th className="py-4.5 px-6">Hạng</th>
                    <th className="py-4.5 px-6">Nhà thám hiểm</th>
                    <th className="py-4.5 px-6 text-center">Cấp độ</th>
                    <th className="py-4.5 px-6 text-right">Điểm tích lũy</th>
                    <th className="py-4.5 px-6 text-center">Chuỗi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {rows.map((row, idx) => {
                    const isLanded = idx < 5 && leaderboardStarsLanded[idx];
                    const isCurrentUser = row.user_id === user?.id;

                    let bgClass = 'bg-transparent';
                    let borderClass = 'border-l-4 border-l-transparent border-white/5';
                    let glowClass = '';
                    let textClass = 'text-slate-300';

                    if (isLanded) {
                      if (row.rank === 1) {
                        bgClass = 'bg-gradient-to-r from-yellow-500/15 via-amber-500/5 to-indigo-950/5';
                        borderClass = 'border-l-4 border-l-yellow-400 border-yellow-500/20';
                        glowClass = 'shadow-[0_0_20px_rgba(234,179,8,0.15)]';
                        textClass =
                          'text-yellow-200 drop-shadow-[0_0_8px_rgba(234,179,8,0.85)] font-bold scale-105';
                      } else if (row.rank === 2 || row.rank === 3) {
                        bgClass = 'bg-gradient-to-r from-slate-400/15 via-slate-500/5 to-indigo-950/5';
                        borderClass = 'border-l-4 border-l-slate-300 border-slate-400/20';
                        glowClass = 'shadow-[0_0_20px_rgba(203,213,225,0.12)]';
                        textClass =
                          'text-slate-100 drop-shadow-[0_0_8px_rgba(203,213,225,0.8)] font-bold scale-105';
                      } else {
                        bgClass = 'bg-gradient-to-r from-orange-800/15 via-amber-900/5 to-indigo-950/5';
                        borderClass = 'border-l-4 border-l-amber-600 border-amber-700/20';
                        glowClass = 'shadow-[0_0_20px_rgba(217,119,6,0.1)]';
                        textClass =
                          'text-orange-200 drop-shadow-[0_0_8px_rgba(217,119,6,0.7)] font-bold scale-105';
                      }
                    } else if (isCurrentUser) {
                      bgClass = 'bg-indigo-600/10';
                      borderClass = 'border-l-4 border-l-indigo-500/50 border-white/5';
                      textClass = 'text-indigo-300 font-semibold';
                    }

                    return (
                      <motion.tr
                        key={row.user_id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.06 }}
                        onMouseEnter={playHover}
                        className={`transition-all duration-700 border-b border-white/5 ${bgClass} ${borderClass} ${glowClass}`}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div
                              id={`leaderboard-rank-${idx}`}
                              className="w-5 h-5 flex items-center justify-center relative"
                            >
                              {getRankIcon(row.rank)}
                            </div>
                          </div>
                        </td>
                        <td className={`py-4 px-6 text-xs md:text-sm transition-all duration-700 ${textClass}`}>
                          {row.display_name}
                          {isCurrentUser && <span className="text-indigo-400"> (Bạn)</span>}
                        </td>
                        <td className="py-4 px-6 text-center text-xs md:text-sm font-mono text-slate-400">
                          {row.level}
                        </td>
                        <td
                          className={`py-4 px-6 text-right text-xs md:text-sm font-mono font-bold transition-all duration-700 ${
                            isLanded ? textClass : 'text-indigo-200'
                          }`}
                        >
                          {row.points.toLocaleString()}
                        </td>
                        <td className="py-4 px-6 text-center text-xs md:text-sm">
                          {row.streak > 0 ? (
                            <span className="inline-flex items-center gap-1 text-orange-400 font-mono">
                              <Flame className="w-3.5 h-3.5 fill-current" />
                              {row.streak}d
                            </span>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}

                  {/* Hiển thị vị trí của user hiện tại nếu họ không nằm trong top */}
                  {currentUserRow && !rows.some((r) => r.user_id === currentUserRow.user_id) && (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-t-2 border-indigo-500/30 bg-indigo-600/10"
                    >
                      <td className="py-4 px-6">
                        <span className="text-xs font-mono text-slate-500 w-5 text-center inline-block">
                          {currentUserRow.rank}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs md:text-sm text-indigo-300 font-semibold">
                        {currentUserRow.display_name} (Bạn)
                      </td>
                      <td className="py-4 px-6 text-center text-xs md:text-sm font-mono text-slate-400">
                        {currentUserRow.level}
                      </td>
                      <td className="py-4 px-6 text-right text-xs md:text-sm font-mono font-bold text-indigo-200">
                        {currentUserRow.points.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-center text-xs md:text-sm">
                        {currentUserRow.streak > 0 ? (
                          <span className="inline-flex items-center gap-1 text-orange-400 font-mono">
                            <Flame className="w-3.5 h-3.5 fill-current" />
                            {currentUserRow.streak}d
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                    </motion.tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && !user && (
          <p className="text-center text-[11px] text-slate-500">
            Đăng nhập để điểm số của bạn xuất hiện trên bảng xếp hạng.
          </p>
        )}
      </div>
    </div>
  );
}
