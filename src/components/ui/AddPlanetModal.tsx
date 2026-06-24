'use client';

import React, { useState } from 'react';
import { X, Loader2, Check } from 'lucide-react';
import { useSceneStore } from '@/store/sceneStore';
import { useAudio } from '../providers/AudioProvider';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useStars } from '@/hooks/useStars';

export const AddPlanetModal: React.FC = () => {
  const isAddModalOpen = useSceneStore((state) => state.isAddModalOpen);
  const setAddModalOpen = useSceneStore((state) => state.setAddModalOpen);
  const { playClick, playHover } = useAudio();

  // Form states
  const [name, setName] = useState('');
  const [selectedStarId, setSelectedStarId] = useState('');
  const [bio, setBio] = useState('');
  const [radius, setRadius] = useState(3.5);
  const [speed, setSpeed] = useState(1.0);
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 90000) + 10000);
  const [size, setSize] = useState(0.5);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { stars } = useStars();

  // Sync selected star with currently viewed star system when modal opens
  const activeStarId = useSceneStore((state) => state.activeStarId);
  React.useEffect(() => {
    if (isAddModalOpen) {
      if (activeStarId) {
        setSelectedStarId(activeStarId);
      } else if (stars.length > 0 && !selectedStarId) {
        setSelectedStarId(stars[0].id);
      }
    }
  }, [isAddModalOpen, activeStarId, stars, selectedStarId]);

  if (!isAddModalOpen) return null;

  const handleClose = () => {
    playClick();
    setAddModalOpen(false);
    setSuccess(false);
    setError(null);
    // Reset form
    setName('');
    setBio('');
    setRadius(3.5);
    setSpeed(1.0);
    setSeed(Math.floor(Math.random() * 90000) + 10000);
    setSize(0.5);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playClick();
    setError(null);
    setLoading(true);

    if (!name.trim()) {
      setError('Vui lòng nhập tên danh nhân/thực thể');
      setLoading(false);
      return;
    }

    const planetData = {
      star_id: selectedStarId,
      name: name.trim(),
      bio: bio.trim(),
      orbit_radius: Number(radius),
      orbit_speed: Number(speed),
      planet_seed: Number(seed),
      planet_size: Number(size),
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`
    };

    try {
      if (!isSupabaseConfigured) throw new Error('Supabase is not configured');

      const { data, error: insertErr } = await supabase!
        .from('planets')
        .insert([planetData])
        .select();

      if (insertErr) throw insertErr;

      setSuccess(true);

      if (data && data[0]) {
        const newPlanet = data[0];
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('dnbd_search_target', JSON.stringify({
            starId: newPlanet.star_id,
            planetId: newPlanet.id,
            step: 'to_planet'
          }));
        }
      }

      setTimeout(() => {
        handleClose();
        if (typeof window !== 'undefined') {
          // Soft refresh page to reload data hooks
          window.location.reload();
        }
      }, 1500);
    } catch (err: any) {
      console.error('Error inserting planet:', err);
      setError(err.message || 'Không thể tạo mới hành tinh. Hãy kiểm tra cơ sở dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm pointer-events-auto">
      <div className="relative w-full max-w-lg bg-zinc-950/90 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(99,102,241,0.15)] flex flex-col max-h-[90vh] overflow-y-auto scrollbar-thin select-none">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-5">
          <div>
            <h2 className="text-xl font-bold font-display text-white">Triệu Hồi Tinh Cầu</h2>
            <p className="text-xs text-zinc-500 mt-1">Kiến tạo hành tinh nhân vật mới trong hệ vũ trụ tri thức</p>
          </div>
          <button
            onClick={handleClose}
            onMouseEnter={playHover}
            className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-bounce">
              <Check className="w-6 h-6" />
            </div>
            <p className="text-base font-bold text-white">Khởi tạo thành công!</p>
            <p className="text-xs text-zinc-400">Tinh cầu đang đồng bộ hóa quỹ đạo vào cõi tri thức...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-xl text-xs text-red-400">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {/* Name */}
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Tên Thực Thể / Danh Nhân
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Marie Curie"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Star / Domain */}
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Lĩnh Vực (Ngôi Sao Mẹ)
                </label>
                <select
                  value={selectedStarId}
                  onChange={(e) => setSelectedStarId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                >
                  {stars.map((star) => (
                    <option key={star.id} value={star.id}>
                      {star.icon} {star.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Biography */}
            <div>
              <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Mô tả tiểu sử & Đóng góp chính
              </label>
              <textarea
                rows={3}
                placeholder="Tóm tắt ngắn gọn cuộc đời, sự nghiệp của nhân vật..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 transition-colors resize-none"
              />
            </div>

            {/* Orbit Parameters */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1">
                  Bán kính Quỹ đạo
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="2.0"
                  max="7.0"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1">
                  Tốc độ Quay
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="3.0"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1">
                  Kích thước (Size)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.2"
                  max="1.5"
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                />
              </div>
            </div>

            {/* Texture Seed */}
            <div>
              <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Seed kết cấu hành tinh (Texture Seed)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={seed}
                  onChange={(e) => setSeed(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    setSeed(Math.floor(Math.random() * 90000) + 10000);
                  }}
                  onMouseEnter={playHover}
                  className="px-3 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs rounded-xl text-white cursor-pointer"
                >
                  Gen Ngẫu Nhiên
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              onMouseEnter={playHover}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-xl text-xs font-bold font-display flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-indigo-500/10 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang kiến tạo thực thể...</span>
                </>
              ) : (
                <span>Bắt đầu Khởi Tạo Tinh Cầu</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
export default AddPlanetModal;
