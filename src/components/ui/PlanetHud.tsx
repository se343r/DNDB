'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Edit3, Trash2, Award, Check, Loader2, X } from 'lucide-react';
import { usePlanetDetail } from '@/hooks/usePlanets';
import { useStars } from '@/hooks/useStars';
import { useSceneStore } from '@/store/sceneStore';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAudio } from '@/components/providers/AudioProvider';
import { Html } from '@react-three/drei';

interface PlanetHudProps {
  planetId: string;
}

export const PlanetHud: React.FC<PlanetHudProps> = ({ planetId }) => {
  const { planet, achievements, loading } = usePlanetDetail(planetId);
  const { stars } = useStars();
  const { playClick } = useAudio();
  
  const setActivePlanetId = useSceneStore((state) => state.setActivePlanetId);
  const setTrackedPosition = useSceneStore((state) => state.setTrackedPosition);
  const setTransitioning = useSceneStore((state) => state.setTransitioning);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editRadius, setEditRadius] = useState(3.0);
  const [editSpeed, setEditSpeed] = useState(1.0);
  const [editSize, setEditSize] = useState(0.5);
  const [editSeed, setEditSeed] = useState(12345);
  const [editAvatar2, setEditAvatar2] = useState('');
  const [editAvatar3, setEditAvatar3] = useState('');

  const [saving, setSaving] = useState(false);

  const parentStar = useMemo(() => {
    if (!planet) return null;
    return stars.find((s) => s.id === planet.star_id);
  }, [planet, stars]);

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClick();
    setTransitioning(true);
    setActivePlanetId(null);
    setTrackedPosition(null);
  };

  const handleEditToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClick();
    setIsEditing(!isEditing);
    if (!isEditing && planet) {
      setEditName(planet.name);
      setEditBio(planet.bio || '');
      setEditRadius(planet.orbit_radius);
      setEditSpeed(planet.orbit_speed);
      setEditSize(planet.planet_size);
      setEditSeed(planet.planet_seed);
      setEditAvatar2(planet.avatar_url_2 || '');
      setEditAvatar3(planet.avatar_url_3 || '');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    playClick();
    setSaving(true);

    const updatedData = {
      name: editName.trim(),
      bio: editBio.trim(),
      orbit_radius: Number(editRadius),
      orbit_speed: Number(editSpeed),
      planet_size: Number(editSize),
      planet_seed: Number(editSeed),
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${editSeed}`,
      avatar_url_2: editAvatar2.trim() || null,
      avatar_url_3: editAvatar3.trim() || null,
    };

    try {
      if (!isSupabaseConfigured) throw new Error('Supabase is not configured');

      const { error: updateErr } = await supabase!
        .from('planets')
        .update(updatedData)
        .eq('id', planetId);

      if (updateErr) throw updateErr;

      setIsEditing(false);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      console.error('Error updating planet:', err);
      alert('Không thể lưu thay đổi. Hãy thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!planet) return;
    playClick();
    const confirmDelete = window.confirm(
      `Bạn có chắc chắn muốn giải phóng (xóa) tinh cầu '${planet.name}' khỏi hệ vũ trụ này không?`
    );

    if (!confirmDelete) return;

    try {
      if (!isSupabaseConfigured) throw new Error('Supabase is not configured');

      const { error: deleteErr } = await supabase!
        .from('planets')
        .delete()
        .eq('id', planetId);

      if (deleteErr) throw deleteErr;

      setActivePlanetId(null);
      setTrackedPosition(null);
    } catch (err) {
      console.error('Error deleting planet:', err);
      alert('Không thể giải phóng tinh cầu. Hãy thử lại.');
    }
  };

  if (loading || !planet || !parentStar) {
    return null;
  }

  const starColor = parentStar.color;

  return (
    <Html 
      center 
      zIndexRange={[100, 0]}
      className="pointer-events-none"
    >
      <div className="relative flex items-center justify-center">
        {/* Sci-fi Pointer Lines for Avatars */}
        <svg 
          className="absolute left-1/2 top-1/2 overflow-visible pointer-events-none z-0" 
          style={{ width: 0, height: 0 }}
        >
          <defs>
            <filter id="glow-hud">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Main line: planet center -> main avatar (right, middle) */}
          <motion.path 
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            d={`M 0 0 L 90 -140 L 180 -140`} 
            fill="none" 
            stroke={starColor} 
            strokeWidth="1.5"
            strokeOpacity="0.8"
            filter="url(#glow-hud)"
          />
          {/* Branch to top-left avatar (portrait 2) */}
          {planet.avatar_url_2 && (
            <motion.path 
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
              d={`M 0 0 L -60 -200`} 
              fill="none" 
              stroke={starColor} 
              strokeWidth="1"
              strokeOpacity="0.5"
              strokeDasharray="4 3"
              filter="url(#glow-hud)"
            />
          )}
          {/* Branch to bottom-center avatar (portrait 3) */}
          {planet.avatar_url_3 && (
            <motion.path 
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
              d={`M 0 0 L 0 110`} 
              fill="none" 
              stroke={starColor} 
              strokeWidth="1"
              strokeOpacity="0.5"
              strokeDasharray="4 3"
              filter="url(#glow-hud)"
            />
          )}
          
          {/* Planet center dot */}
          <motion.circle 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            cx="0" cy="0" r="4" fill="#ffffff" 
            filter="url(#glow-hud)"
          />
          <motion.circle 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            cx="0" cy="0" r="8" fill="none" stroke={starColor} strokeWidth="1"
          />
        </svg>

        {/* Main Floating Avatar (Large, centre-right) */}
        <motion.div 
           initial={{ opacity: 0, scale: 0.8, x: 100, y: -220 }}
           animate={{ opacity: 1, scale: 1, x: 100, y: -220 }}
           transition={{ delay: 0.55, type: 'spring' }}
           className="absolute pointer-events-auto left-1/2 top-1/2"
        >
           <div className="w-40 h-40 rounded-full border-[3px] bg-zinc-950 overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.7)]" style={{ borderColor: starColor }}>
             <img 
               src={planet.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${planet.id}`} 
               alt={planet.name} 
               className="w-full h-full object-cover" 
             />
           </div>
        </motion.div>

        {/* Portrait Slot 2 — top-left, only if avatar_url_2 is set */}
        {planet.avatar_url_2 && (
          <motion.div 
             initial={{ opacity: 0, scale: 0.6, x: -106, y: -246 }}
             animate={{ opacity: 1, scale: 1, x: -106, y: -246 }}
             transition={{ delay: 0.7, type: 'spring' }}
             className="absolute pointer-events-auto left-1/2 top-1/2"
          >
             <div className="w-[92px] h-[92px] rounded-full border-2 bg-zinc-950 overflow-hidden shadow-[0_0_24px_rgba(0,0,0,0.6)]" style={{ borderColor: `${starColor}99` }}>
               <img 
                 src={planet.avatar_url_2} 
                 alt={`${planet.name} portrait 2`} 
                 className="w-full h-full object-cover" 
               />
             </div>
          </motion.div>
        )}

        {/* Portrait Slot 3 — bottom-center, only if avatar_url_3 is set */}
        {planet.avatar_url_3 && (
          <motion.div 
             initial={{ opacity: 0, scale: 0.6, x: -46, y: 64 }}
             animate={{ opacity: 1, scale: 1, x: -46, y: 64 }}
             transition={{ delay: 0.75, type: 'spring' }}
             className="absolute pointer-events-auto left-1/2 top-1/2"
          >
             <div className="w-[92px] h-[92px] rounded-full border-2 bg-zinc-950 overflow-hidden shadow-[0_0_24px_rgba(0,0,0,0.6)]" style={{ borderColor: `${starColor}99` }}>
               <img 
                 src={planet.avatar_url_3} 
                 alt={`${planet.name} portrait 3`} 
                 className="w-full h-full object-cover" 
               />
             </div>
          </motion.div>
        )}

        {/* HUD Panel */}
        <div 
          className="pointer-events-auto w-screen h-[70vh] md:h-[85vh] flex flex-col justify-end md:justify-center md:relative md:w-[720px] xl:w-[840px] z-10"
          // On mobile, it's a bottom sheet. On desktop, it's translated heavily to the left.
          style={{ transform: 'translate(min(-105%, -20vw), 0)' }}
        >
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.4 }}
          className="w-full max-h-full bg-zinc-950/90 backdrop-blur-2xl rounded-t-[2rem] md:rounded-[2rem] border border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] p-6 md:p-10 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-4 flex-shrink-0">
            <div>
              <div className="flex items-center space-x-2">
                <span 
                  className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold font-display"
                  style={{ backgroundColor: `${starColor}15`, color: starColor }}
                >
                  {parentStar.name}
                </span>
              </div>
              <h2 className="text-2xl font-black font-display text-white mt-1" style={{ textShadow: `0 0 10px ${starColor}33` }}>
                {planet.name}
              </h2>
            </div>
          </div>

          <div className="overflow-y-auto scrollbar-thin flex-1 pr-2">
            {!isEditing ? (
              <div className="space-y-6">
                <p className="text-sm text-zinc-300 leading-relaxed text-justify bg-zinc-900/40 p-5 rounded-xl border border-zinc-800/50 shadow-inner">
                  {planet.bio || 'Chưa có thông tin chi tiết.'}
                </p>

                {achievements.length > 0 && (
                  <div className="space-y-4 mt-6">
                    <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center">
                      <Award className="w-5 h-5 text-indigo-400 mr-2" />
                      <span>Di sản lưu danh</span>
                    </div>
                    <div className="space-y-3">
                      {achievements.map((ach, idx) => (
                        <div key={ach.id} className="p-4 bg-zinc-900/30 border border-zinc-800/50 rounded-xl flex items-start space-x-3 shadow-sm hover:bg-zinc-900/50 transition">
                          <div className="w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center flex-shrink-0 border" style={{ borderColor: `${starColor}33`, color: starColor, backgroundColor: `${starColor}08` }}>
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1.5">
                              <h4 className="text-sm font-semibold text-white">{ach.title}</h4>
                              <span className="text-[11px] text-zinc-500 bg-zinc-900 px-2.5 py-0.5 rounded font-mono">
                                {ach.year ? (ach.year > 0 ? ach.year : `TCN ${Math.abs(ach.year)}`) : ''}
                              </span>
                            </div>
                            {ach.description && <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{ach.description}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1.5">Tên Nhân Vật</label>
                    <input type="text" required value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white outline-none" onClick={e => e.stopPropagation()}/>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1.5">Tiểu Sử</label>
                    <textarea rows={5} value={editBio} onChange={(e) => setEditBio(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white outline-none resize-none" onClick={e => e.stopPropagation()}/>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1.5">Quỹ đạo</label>
                      <input type="number" step="0.1" value={editRadius} onChange={(e) => setEditRadius(Number(e.target.value))} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white" onClick={e => e.stopPropagation()}/>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1.5">Tốc độ</label>
                      <input type="number" step="0.1" value={editSpeed} onChange={(e) => setEditSpeed(Number(e.target.value))} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white" onClick={e => e.stopPropagation()}/>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1.5">URL Chân Dung 2</label>
                    <input type="text" value={editAvatar2} onChange={(e) => setEditAvatar2(e.target.value)} placeholder="https://..." className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white outline-none" onClick={e => e.stopPropagation()}/>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1.5">URL Chân Dung 3</label>
                    <input type="text" value={editAvatar3} onChange={(e) => setEditAvatar3(e.target.value)} placeholder="https://..." className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white outline-none" onClick={e => e.stopPropagation()}/>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6 pt-2">
                  <button type="button" onClick={handleDelete} className="px-4 py-2.5 bg-rose-950/40 text-rose-400 rounded-xl text-sm font-bold transition hover:bg-rose-900/60 flex items-center justify-center" onClickCapture={e => e.stopPropagation()}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold flex items-center justify-center space-x-2 shadow-lg shadow-indigo-900/20" onClickCapture={e => e.stopPropagation()}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span>Lưu thay đổi</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
      </div>
    </Html>
  );
};
