'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, Flame } from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import { useSceneStore } from '@/store/sceneStore';
import { useAudio } from '@/components/providers/AudioProvider';

interface LeaderboardUser {
  rank: number;
  name: string;
  level: number;
  points: number;
  streak: number;
  isCurrentUser?: boolean;
}

const USERS: LeaderboardUser[] = [
  { rank: 1, name: "Nguyễn Minh Đức", level: 24, points: 12560, streak: 12 },
  { rank: 2, name: "Trần Huy Hoàng", level: 21, points: 10940, streak: 8 },
  { rank: 3, name: "Lê Thị Ngọc Mai", level: 19, points: 9820, streak: 15 },
  { rank: 4, name: "Phạm Quốc Hùng (Bạn)", level: 14, points: 6400, streak: 5, isCurrentUser: true },
  { rank: 5, name: "Vũ Hải Đăng", level: 13, points: 5900, streak: 3 },
  { rank: 6, name: "Đỗ Gia Huy", level: 11, points: 4850, streak: 0 }
];

export default function LeaderboardPage() {
  const { playHover } = useAudio();
  const setAppPhase = useSceneStore((state) => state.setAppPhase);
  const leaderboardStarsLanded = useSceneStore((state) => state.leaderboardStarsLanded);

  useEffect(() => {
    setAppPhase('leaderboard');
    return () => {
      setAppPhase('catalog');
    };
  }, [setAppPhase]);

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
      <BackButton to="/catalog" />

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

        {/* Leaderboard Table Container */}
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
                {USERS.map((user, idx) => {
                  const isLanded = idx < 5 && leaderboardStarsLanded[idx];
                  
                  // Define rank styling classes
                  let bgClass = "bg-transparent";
                  let borderClass = "border-l-4 border-l-transparent border-white/5";
                  let glowClass = "";
                  let textClass = "text-slate-300";

                  if (isLanded) {
                    if (user.rank === 1) {
                      bgClass = "bg-gradient-to-r from-yellow-500/15 via-amber-500/5 to-indigo-950/5";
                      borderClass = "border-l-4 border-l-yellow-400 border-yellow-500/20";
                      glowClass = "shadow-[0_0_20px_rgba(234,179,8,0.15)]";
                      textClass = "text-yellow-200 drop-shadow-[0_0_8px_rgba(234,179,8,0.85)] font-bold scale-105";
                    } else if (user.rank === 2 || user.rank === 3) {
                      bgClass = "bg-gradient-to-r from-slate-400/15 via-slate-500/5 to-indigo-950/5";
                      borderClass = "border-l-4 border-l-slate-300 border-slate-400/20";
                      glowClass = "shadow-[0_0_20px_rgba(203,213,225,0.12)]";
                      textClass = "text-slate-100 drop-shadow-[0_0_8px_rgba(203,213,225,0.8)] font-bold scale-105";
                    } else { // Ranks 4 and 5
                      bgClass = "bg-gradient-to-r from-orange-800/15 via-amber-900/5 to-indigo-950/5";
                      borderClass = "border-l-4 border-l-amber-600 border-amber-700/20";
                      glowClass = "shadow-[0_0_20px_rgba(217,119,6,0.1)]";
                      textClass = "text-orange-200 drop-shadow-[0_0_8px_rgba(217,119,6,0.7)] font-bold scale-105";
                    }
                  } else if (user.isCurrentUser) {
                    bgClass = "bg-indigo-600/10";
                    borderClass = "border-l-4 border-l-indigo-500/50 border-white/5";
                    textClass = "text-indigo-300 font-semibold";
                  }

                  return (
                    <motion.tr
                      key={user.rank}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.06 }}
                      onMouseEnter={playHover}
                      className={`transition-all duration-700 border-b border-white/5 ${bgClass} ${borderClass} ${glowClass}`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {/* Anchor element for the 3D star coordinates */}
                          <div id={`leaderboard-rank-${idx}`} className="w-5 h-5 flex items-center justify-center relative">
                            {getRankIcon(user.rank)}
                          </div>
                        </div>
                      </td>
                      <td className={`py-4 px-6 text-xs md:text-sm transition-all duration-700 ${textClass}`}>
                        {user.name}
                      </td>
                      <td className="py-4 px-6 text-center text-xs md:text-sm font-mono text-slate-400">
                        {user.level}
                      </td>
                      <td className={`py-4 px-6 text-right text-xs md:text-sm font-mono font-bold transition-all duration-700 ${isLanded ? textClass : 'text-indigo-200'}`}>
                        {user.points.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-center text-xs md:text-sm">
                        {user.streak > 0 ? (
                          <span className="inline-flex items-center gap-1 text-orange-400 font-mono">
                            <Flame className="w-3.5 h-3.5 fill-current" />
                            {user.streak}d
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
