'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowUpRight, Loader2, AlertCircle } from 'lucide-react';
import { useAudio } from '@/components/providers/AudioProvider';
import { useRouter } from 'next/navigation';
import { useSceneStore } from '@/store/sceneStore';
import { debugLog } from '@/lib/debug';

interface Recommendation {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  star_id: string;
  star_name: string;
  star_color: string;
  reason: string;
}

export default function RecommendationsPage() {
  const { playClick, playHover } = useAudio();
  const router = useRouter();
  const setAppPhase = useSceneStore((state) => state.setAppPhase);
  const resetScene = useSceneStore((state) => state.resetScene);

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAppPhase('catalog');
    resetScene();
  }, [setAppPhase, resetScene]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/recommendations?count=5');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Không tải được gợi ý');
        setRecommendations(data.recommendations);
      } catch (err: any) {
        setError(err.message || 'Có lỗi xảy ra');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleCardClick = (rec: Recommendation) => {
    playClick();
    debugLog('recommendation clicked', { starId: rec.star_id, planetId: rec.id });
    const store = useSceneStore.getState();
    store.setSearchTarget(rec.star_id, rec.id, 'to_catalog');
    store.setAppPhase('catalog');
    store.setActiveStarId(null);
    store.setActivePlanetId(null);
    store.setTrackedPosition(null);
    router.push('/catalog');
  };


  return (
    <div className="relative w-full h-full min-h-screen bg-transparent flex flex-col items-center justify-start p-6 pt-24 text-white overflow-y-auto">
      <div className="w-full max-w-2xl flex flex-col gap-6 relative z-10 pointer-events-auto">
        {/* Banner */}
        <div className="bg-slate-950/80 border border-indigo-500/20 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl flex flex-col gap-3">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide">Đề Xuất Hành Trình</h1>
              <p className="text-xs text-slate-400 mt-1">
                Có thể bạn sẽ muốn đọc
              </p>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center gap-3 py-12">
            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
            <p className="text-xs text-slate-500">Đang tính toán gợi ý...</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <AlertCircle className="w-6 h-6 text-rose-400" />
            <p className="text-xs text-slate-400">{error}</p>
          </div>
        )}

        {!loading && !error && recommendations.length === 0 && (
          <div className="text-center py-12 text-xs text-slate-500">
            Chưa có gợi ý nào. Hãy khám phá vài danh nhân trước nhé!
          </div>
        )}

        {!loading && !error && recommendations.length > 0 && (
          <div className="flex flex-col gap-4">
            {recommendations.map((rec, idx) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => handleCardClick(rec)}
                onMouseEnter={playHover}
                className="group bg-slate-950/70 border border-indigo-500/10 hover:border-indigo-500/35 rounded-2xl p-6 backdrop-blur-lg flex flex-col gap-4 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex gap-3 items-center">
                    <div
                      className="w-3 h-3 rounded-full animate-pulse shadow-md"
                      style={{ backgroundColor: rec.star_color, boxShadow: `0 0 10px ${rec.star_color}` }}
                    />
                    <div>
                      <h3 className="font-semibold text-base md:text-lg leading-tight group-hover:text-indigo-300 transition duration-200">
                        {rec.name}
                      </h3>
                      <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                        {rec.star_name}
                      </span>
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-full border border-white/15 group-hover:border-indigo-400/50 group-hover:bg-indigo-600/15 flex items-center justify-center transition duration-200">
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition" />
                  </div>
                </div>

                <div className="bg-white/3 border border-white/5 p-4 rounded-xl">
                  <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase block mb-1">
                    {rec.reason}
                  </span>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-light">
                    {rec.bio
                      ? (() => {
                          // Strip HTML tags to get plain preview text
                          const div = typeof document !== 'undefined'
                            ? Object.assign(document.createElement('div'), { innerHTML: rec.bio })
                            : null;
                          const plain = div ? (div.textContent || div.innerText || '') : rec.bio;
                          const trimmed = plain.replace(/\s+/g, ' ').trim();
                          return trimmed.length > 160 ? trimmed.slice(0, 160) + '…' : trimmed;
                        })()
                      : 'Chưa có thông tin về danh nhân này.'}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
