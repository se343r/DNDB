'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit3, Trash2, BookOpen, Award, Calendar, Sliders, Check, Loader2 } from 'lucide-react';
import { usePlanetDetail } from '@/hooks/usePlanets';
import { useStars } from '@/hooks/useStars';
import { useSceneStore } from '@/store/sceneStore';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAudio } from '@/components/providers/AudioProvider';
import * as THREE from 'three';

interface ClientProps {
  planetId: string;
}

export default function PlanetDetailPageClient({ planetId }: ClientProps) {
  const router = useRouter();
  const { planet, achievements, loading, error } = usePlanetDetail(planetId);
  const { stars } = useStars();
  const { playClick, playHover } = useAudio();

  const setCameraTarget = useSceneStore((state) => state.setCameraTarget);
  const setActiveStarId = useSceneStore((state) => state.setActiveStarId);
  const setActivePlanetId = useSceneStore((state) => state.setActivePlanetId);
  const isTransitioning = useSceneStore((state) => state.isTransitioning);
  const setTransitioning = useSceneStore((state) => state.setTransitioning);
  const triggerTransition = useSceneStore((state) => state.triggerTransition);
  const setTrackedPosition = useSceneStore((state) => state.setTrackedPosition);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editRadius, setEditRadius] = useState(3.0);
  const [editSpeed, setEditSpeed] = useState(1.0);
  const [editSize, setEditSize] = useState(0.5);
  const [editSeed, setEditSeed] = useState(12345);

  const [saving, setSaving] = useState(false);

  const parentStar = useMemo(() => {
    if (!planet) return null;
    return stars.find((s) => s.id === planet.star_id);
  }, [planet, stars]);

  const initializedRef = useRef(false);

  useEffect(() => {
    if (loading) return;

    if (!planet) {
      router.push('/');
      return;
    }

    if (initializedRef.current) return;

    // Set active IDs so SpaceCanvas renders PlanetDetailScene with the correct planet
    setActiveStarId(planet.star_id);
    setActivePlanetId(planet.id);

    // Initialize edit fields
    setEditName(planet.name);
    setEditBio(planet.bio || '');
    setEditRadius(planet.orbit_radius);
    setEditSpeed(planet.orbit_speed);
    setEditSize(planet.planet_size);
    setEditSeed(planet.planet_seed);

    // Clear transitioning flag (camera has already arrived)
    setTransitioning(false);
    initializedRef.current = true;
  }, [planet, loading, setActiveStarId, setActivePlanetId, setTransitioning, router]);

  // Prefetch back navigation routes
  useEffect(() => {
    if (planet) {
      router.prefetch(`/star/${planet.star_id}`);
    }
    router.prefetch('/');
  }, [planet, router]);

  const handleGoBack = () => {
    playClick();
    if (planet && parentStar) {
      const starX = parentStar.position_x * 5.5;
      const starY = parentStar.position_y * 3.5;

      // Get current orbital angle of the planet (fallback to seed-based initial angle)
      const savedAngle = useSceneStore.getState().planetAngles[planet.id];
      const angle = savedAngle !== undefined 
        ? savedAngle 
        : (planet.planet_seed % 360) * (Math.PI / 180);
      const x = Math.cos(angle) * planet.orbit_radius;
      const z = Math.sin(angle) * planet.orbit_radius;

      // Rotate local orbit position into world space
      const perspective3D = useSceneStore.getState().perspective3D;
      const tiltAngleX = useSceneStore.getState().tiltAngleX;
      const tiltAngleY = useSceneStore.getState().tiltAngleY;
      const rotX = perspective3D ? (tiltAngleX * Math.PI) / 180 : 0;
      const rotY = perspective3D ? (tiltAngleY * Math.PI) / 180 : 0;

      const localPos = new THREE.Vector3(x, 0, z);
      const worldPos = localPos
        .applyEuler(new THREE.Euler(rotX, 0, rotY))
        .add(new THREE.Vector3(starX, starY, 0));

      // Match the EXACT same offsets used during zoom-in (in Planet.tsx handleClick)
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      const lookAtOffsetX = isMobile ? 0 : -0.7;
      const lookAtOffsetY = isMobile ? -0.7 : 0;
      const zoomedInPos: [number, number, number] = [worldPos.x + lookAtOffsetX, worldPos.y + lookAtOffsetY, worldPos.z + 3.0 / 2.8];
      const zoomedInLookAt: [number, number, number] = [worldPos.x + lookAtOffsetX, worldPos.y + lookAtOffsetY, worldPos.z];

      // 1. Clear planet detail → switch back to SolarSystemScene
      setActivePlanetId(null);
      setTrackedPosition(null);

      // 2. Snap camera to the planet's zoomed-in position (no animation)
      setCameraTarget(zoomedInPos, zoomedInLookAt);

      // 3. Trigger cinematic zoom-out to star system immediately
      triggerTransition([starX, starY - 2.8, 6.8], [starX, starY, 0], 1.2);

      setTimeout(() => {
        router.push(`/star/${planet.star_id}`);
      }, 1200);
    } else {
      router.push('/');
    }
  };

  const handleEditToggle = () => {
    playClick();
    setIsEditing(!isEditing);
    if (!isEditing && planet) {
      // Re-initialize values in case user aborted before
      setEditName(planet.name);
      setEditBio(planet.bio || '');
      setEditRadius(planet.orbit_radius);
      setEditSpeed(planet.orbit_speed);
      setEditSize(planet.planet_size);
      setEditSeed(planet.planet_seed);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    playClick();
    setSaving(true);

    const updatedData = {
      name: editName.trim(),
      bio: editBio.trim(),
      orbit_radius: Number(editRadius),
      orbit_speed: Number(editSpeed),
      planet_size: Number(editSize),
      planet_seed: Number(editSeed),
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${editSeed}`
    };

    try {
      if (!isSupabaseConfigured) throw new Error('Supabase is not configured');

      const { error: updateErr } = await supabase!
        .from('planets')
        .update(updatedData)
        .eq('id', planetId);

      if (updateErr) throw updateErr;

      setIsEditing(false);
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch (err) {
      console.error('Error updating planet:', err);
      alert('Không thể lưu thay đổi. Hãy thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
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

      router.push(`/star/${planet.star_id}`);
    } catch (err) {
      console.error('Error deleting planet:', err);
      alert('Không thể giải phóng tinh cầu. Hãy thử lại.');
    }
  };

  if (loading || !planet || !parentStar) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-transparent text-white/50 pointer-events-none">
        <div className="flex flex-col items-center gap-3 bg-zinc-950/40 backdrop-blur-md p-6 rounded-2xl border border-zinc-850/40 pointer-events-auto shadow-2xl">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <span className="text-xs uppercase tracking-widest text-indigo-400 font-light">
            Giải mã bề mặt tinh cầu...
          </span>
        </div>
      </div>
    );
  }

  // Determine pattern text
  const patternTypes = ['Hố lõm', 'Dòng chảy', 'Băng phủ', 'Đốm bão', 'Rừng sâu', 'Khí thể'];
  const patternText = patternTypes[planet.planet_seed % 6];
  const starColor = parentStar.color;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isTransitioning ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full h-full flex flex-col justify-between p-6 pointer-events-none select-none"
    >
      {/* 1. Breadcrumbs & tools menu (Top-Row) */}
      <div className="flex items-center justify-between w-full relative z-20 border-b border-zinc-900 pb-4 mb-4 pointer-events-auto">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleGoBack}
            className="px-3 py-1.5 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 rounded-xl border border-zinc-800 text-xs font-semibold flex items-center space-x-1 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Hệ mặt trời {parentStar.name}</span>
          </button>
          <div className="h-4 w-px bg-zinc-800" />
          <span className="text-xs text-zinc-500 font-mono tracking-wider">
            {parentStar.name.toUpperCase()} / {planet.name}
          </span>
        </div>

        {/* Edit & delete buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDelete}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-rose-950/30 text-rose-400 hover:text-rose-300 rounded-xl border border-zinc-800 hover:border-rose-900/30 text-xs font-bold flex items-center space-x-1 cursor-pointer transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Giải phóng</span>
          </button>
        </div>
      </div>

      {/* 2. Grid split content (Center) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch relative z-10 overflow-hidden min-h-0 pointer-events-auto">
        
        {/* LEFT 5 COLUMNS: Planet metadata details overlay (Three.js planet sits behind this) */}
        <div className="lg:col-span-5 bg-zinc-950/45 rounded-2xl border border-zinc-900/80 p-5 flex flex-col justify-between items-center relative min-h-[250px] pointer-events-none">
          <div className="absolute top-3 left-4 text-[9px] font-mono text-zinc-500 uppercase tracking-widest flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: starColor }} />
            <span>Cận Cảnh Tinh Cầu Nhân Vật</span>
          </div>

          <div className="absolute top-3 right-4">
            <span className="text-[9px] font-mono bg-zinc-900 text-indigo-300 px-2 py-0.5 rounded border border-zinc-800">
              Sức hút: {(planet.planet_size * 2.0).toFixed(2)}g
            </span>
          </div>

          {/* Empty space for zoomed 3D planet */}
          <div className="flex-1" />

          {/* Tech specs box */}
          <div className="w-full bg-zinc-900/40 border border-zinc-850 rounded-xl p-3 grid grid-cols-3 gap-2 text-center text-[10px] font-mono pointer-events-auto mt-4">
            <div>
              <span className="block text-zinc-500">QUỸ ĐẠO</span>
              <span className="block text-white font-bold mt-0.5">{planet.orbit_radius.toFixed(1)}px</span>
            </div>
            <div>
              <span className="block text-zinc-500">CHU KỲ</span>
              <span className="block text-white font-bold mt-0.5">{(planet.orbit_speed * 10).toFixed(0)} GIÂY</span>
            </div>
            <div>
              <span className="block text-zinc-500">HOA VĂN</span>
              <span className="block text-white font-bold mt-0.5">{patternText}</span>
            </div>
          </div>
        </div>

        {/* RIGHT 7 COLUMNS: Text profiles / timelines / edit forms */}
        <div className="lg:col-span-7 bg-zinc-950/45 rounded-2xl border border-zinc-900 p-5 flex flex-col justify-between overflow-y-auto max-h-[460px] lg:max-h-full scrollbar-thin">
          
          {!isEditing ? (
            /* Standard read-only view */
            <div className="space-y-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span 
                    className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold font-display"
                    style={{ backgroundColor: `${starColor}15`, color: starColor }}
                  >
                    {parentStar.name}
                  </span>
                  <span className="text-[9px] text-zinc-500 font-mono">ĐỒNG BỘ HỆ THỐNG</span>
                </div>

                <h2 
                  className="text-2xl font-black font-display text-white mt-2"
                  style={{ textShadow: `0 0 15px ${starColor}22` }}
                >
                  {planet.name}
                </h2>
                <p className="text-xs text-indigo-300 font-medium font-display mt-1.5 flex items-center">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400 mr-1.5" />
                  <span>Danh nhân đóng góp lĩnh vực {parentStar.name.toLowerCase()}</span>
                </p>

                <div className="border-t border-zinc-900 my-4" />

                {/* Biography */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-zinc-400 tracking-wider flex items-center uppercase font-mono">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-400 mr-2" />
                    <span>Hành trạng & Tiểu sử</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed text-justify bg-zinc-900/10 p-3.5 rounded-xl border border-zinc-900">
                    {planet.bio || 'Chưa có thông tin chi tiết.'}
                  </p>
                </div>

                {/* Achievements */}
                <div className="space-y-2 mt-5">
                  <div className="text-[10px] font-bold text-zinc-400 tracking-wider flex items-center uppercase font-mono">
                    <Award className="w-3.5 h-3.5 text-indigo-400 mr-2" />
                    <span>Sự nghiệp & Di sản lưu danh</span>
                  </div>

                  <div className="space-y-2">
                    {achievements.length > 0 ? (
                      achievements.map((ach, idx) => (
                        <div 
                          key={ach.id}
                          className="p-3 bg-zinc-900/20 border border-zinc-900 rounded-xl flex items-start space-x-3 hover:bg-zinc-900/30 transition-all"
                        >
                          <div 
                            className="w-5 h-5 rounded-full text-[10px] font-bold font-mono flex items-center justify-center flex-shrink-0 mt-0.5 border"
                            style={{ borderColor: `${starColor}33`, color: starColor, backgroundColor: `${starColor}08` }}
                          >
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="text-xs font-semibold text-white">{ach.title}</h4>
                              <span className="text-[9px] text-zinc-500 bg-zinc-900 px-1.5 py-0.2 rounded font-mono">
                                {ach.year ? (ach.year > 0 ? ach.year : `TCN ${Math.abs(ach.year)}`) : ''}
                              </span>
                            </div>
                            {ach.description && (
                              <p className="text-[11px] text-zinc-400 leading-relaxed mt-1 font-light">{ach.description}</p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-zinc-500 italic">Hành tinh này chưa ghi nhận thành tựu cụ thể.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-[9px] text-zinc-500 italic mt-6">
                * Bạn có thể chỉnh sửa mô tả này bất kỳ lúc nào để bổ sung tư liệu thời đại của anh kiệt.
              </div>
            </div>
          ) : (
            /* Editing form view */
            <form onSubmit={handleSave} className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                  <span className="text-xs font-bold text-amber-300 flex items-center space-x-1.5 font-display">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    <span>Hiệu Chỉnh Tinh Vân & Thư tịch</span>
                  </span>
                  <span className="text-[9px] font-mono text-zinc-500">ID: {planet.id}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-1">
                      Tên Nhân Vật
                    </label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-1">
                      Kích Thước Tinh Cầu
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      min="0.2"
                      max="1.5"
                      value={editSize}
                      onChange={(e) => setEditSize(Number(e.target.value))}
                      className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Tiểu Sử Dân Tộc & Sự nghiệp
                  </label>
                  <textarea
                    rows={4}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1">
                      Quỹ đạo (px)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={editRadius}
                      onChange={(e) => setEditRadius(Number(e.target.value))}
                      className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1">
                      Tốc độ Quay
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={editSpeed}
                      onChange={(e) => setEditSpeed(Number(e.target.value))}
                      className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1">
                      Seed kết cấu
                    </label>
                    <input
                      type="number"
                      value={editSeed}
                      onChange={(e) => setEditSeed(Number(e.target.value))}
                      className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={saving}
                className="w-full mt-4 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer transition-colors"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang đồng bộ thư tịch...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Lưu thay đổi tinh cầu</span>
                  </>
                )}
              </button>
            </form>
          )}

        </div>

      </div>

      {/* 3. Footer */}
      <div className="w-full text-center text-zinc-500 text-[10px] font-mono z-20 mt-4">
        [ QUAN SÁT CẬN CẢNH TINH CẦU - TỰ QUAY QUANH TRỤC VẬT LÝ ]
      </div>
    </motion.div>
  );
}
