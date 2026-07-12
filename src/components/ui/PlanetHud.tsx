'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Trash2, Award, Check, Loader2, X } from 'lucide-react';
import { PlanetBioReader } from './PlanetBioReader';
import { usePlanetDetail } from '@/hooks/usePlanets';
import { useStars } from '@/hooks/useStars';
import { useSceneStore } from '@/store/sceneStore';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAudio } from '@/components/providers/AudioProvider';

interface PlanetHudProps {
  planetId: string;
  onClose?: () => void;
}

export const PlanetHud: React.FC<PlanetHudProps> = ({ planetId, onClose }) => {
  const { planet, achievements, loading } = usePlanetDetail(planetId);
  const { stars } = useStars();
  const { playClick } = useAudio();
  
  const setActivePlanetId = useSceneStore((state) => state.setActivePlanetId);
  const setTrackedPosition = useSceneStore((state) => state.setTrackedPosition);
  const setTransitioning = useSceneStore((state) => state.setTransitioning);
  const isTransitioning = useSceneStore((state) => state.isTransitioning);

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

  const [isMobile, setIsMobile] = useState(false);
  React.useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const parentStar = useMemo(() => {
    if (!planet) return null;
    return stars.find((s) => s.id === planet.star_id);
  }, [planet, stars]);

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClose) {
      onClose();
      return;
    }
    // Fallback if no onClose is provided
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
    <div className="fixed inset-0 z-[100] pointer-events-none">
      <AnimatePresence>
        {!isTransitioning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="pointer-events-auto w-full h-full bg-zinc-950/85 backdrop-blur-xl flex flex-col"
          >
            {/* Top Navigation Bar (Fixed at top) */}
            <div className="flex-none flex justify-between items-center px-4 py-4 md:px-8 md:py-6 bg-gradient-to-b from-zinc-950/90 to-transparent">
              <button 
                onClick={handleClose} 
                className="flex items-center gap-2 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-full backdrop-blur-md transition border border-white/10 cursor-pointer shadow-lg"
              >
                <X className="w-5 h-5" />
                <span className="font-semibold text-sm">Trở lại quỹ đạo</span>
              </button>
              

            </div>

            {/* Scrollable Main Content Area */}
            <div className="flex-1 w-full overflow-y-auto">
              <div className="max-w-4xl mx-auto px-6 py-8 md:py-12 flex flex-col items-center">
                
                {/* Avatar */}
              <div 
                className="w-32 h-32 md:w-56 md:h-56 rounded-full border-[4px] bg-zinc-950 overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5)] mb-8" 
                style={{ borderColor: starColor }}
              >
                <img 
                  src={planet.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${planet.id}`} 
                  alt={planet.name} 
                  className="w-full h-full object-cover" 
                />
              </div>

              <span 
                className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4"
                style={{ backgroundColor: `${starColor}15`, color: starColor }}
              >
                {parentStar.name}
              </span>
              
              <h1 
                className="text-4xl md:text-6xl lg:text-7xl font-black font-display text-white text-center mb-10" 
                style={{ textShadow: `0 0 30px ${starColor}44` }}
              >
                {planet.name}
              </h1>

              {!isEditing ? (
                <div className="w-full">
                  <div className="bg-white/5 border border-white/5 rounded-3xl p-6 md:p-10 mb-12 shadow-2xl">
                    <p className="text-base md:text-lg text-zinc-300 leading-relaxed text-justify md:text-left font-light">
                      {planet.bio || 'Chưa có thông tin chi tiết.'}
                    </p>
                  </div>
                  
                  {achievements.length > 0 && (
                    <div className="w-full mb-20">
                      <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
                        <Award className="w-6 h-6 text-indigo-400" />
                        <h3 className="text-xl font-bold text-white uppercase tracking-wider font-display">Di sản lưu danh</h3>
                      </div>
                      
                      <div className="space-y-6 relative border-l-2 border-white/10 pl-6 ml-3">
                        {achievements.map((ach, idx) => (
                          <div key={ach.id} className="relative group">
                            {/* Timeline dot */}
                            <span 
                              className="absolute -left-[35px] top-1.5 w-4 h-4 rounded-full bg-zinc-950 border-2 transition-transform group-hover:scale-125" 
                              style={{ borderColor: starColor }} 
                            />
                            
                            <div className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-2xl p-6 transition duration-300">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                                <h4 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">{ach.title}</h4>
                                {ach.year !== undefined && (
                                  <span className="inline-block w-fit text-xs font-bold text-zinc-400 bg-zinc-900 px-3 py-1 rounded-md font-mono">
                                    {ach.year > 0 ? ach.year : `TCN ${Math.abs(ach.year)}`}
                                  </span>
                                )}
                              </div>
                              {ach.description && <p className="text-sm text-zinc-400 leading-relaxed">{ach.description}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSave} className="w-full bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-3xl p-6 md:p-10 space-y-6 mb-20">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2"><Edit3 className="w-5 h-5"/> Chỉnh sửa dữ liệu</h3>
                    <button type="button" onClick={handleEditToggle} className="text-zinc-500 hover:text-white transition"><X className="w-5 h-5"/></button>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Tên Nhân Vật</label>
                      <input type="text" required value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition" onClick={e => e.stopPropagation()}/>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Tiểu Sử</label>
                      <textarea rows={8} value={editBio} onChange={(e) => setEditBio(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition resize-none leading-relaxed" onClick={e => e.stopPropagation()}/>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Bán kính quỹ đạo</label>
                        <input type="number" step="0.1" value={editRadius} onChange={(e) => setEditRadius(Number(e.target.value))} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white" onClick={e => e.stopPropagation()}/>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Tốc độ quỹ đạo</label>
                        <input type="number" step="0.1" value={editSpeed} onChange={(e) => setEditSpeed(Number(e.target.value))} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white" onClick={e => e.stopPropagation()}/>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 mt-8 pt-4 border-t border-zinc-800">
                    <button type="button" onClick={handleDelete} className="px-6 py-3 bg-rose-950/40 text-rose-400 rounded-xl text-sm font-bold transition hover:bg-rose-900/60 flex items-center justify-center border border-rose-900/50" onClickCapture={e => e.stopPropagation()}>
                      <Trash2 className="w-4 h-4 mr-2" /> Xoá Danh Nhân
                    </button>
                    <button type="submit" disabled={saving} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold flex items-center justify-center space-x-2 shadow-lg shadow-indigo-900/20" onClickCapture={e => e.stopPropagation()}>
                      {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                      <span>Lưu tất cả thay đổi</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
