'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Trash2, Award, Check, Loader2, X, Info, BookOpen, Video, HelpCircle } from 'lucide-react';
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
  const { playClick, playHover } = useAudio();
  
  const setActivePlanetId = useSceneStore((state) => state.setActivePlanetId);
  const setTrackedPosition = useSceneStore((state) => state.setTrackedPosition);
  const setTransitioning = useSceneStore((state) => state.setTransitioning);
  const isTransitioning = useSceneStore((state) => state.isTransitioning);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'appearance' | 'video' | 'quiz'>('basic');
  
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editRadius, setEditRadius] = useState(3.0);
  const [editSpeed, setEditSpeed] = useState(1.0);
  const [editSize, setEditSize] = useState(0.5);
  const [editSeed, setEditSeed] = useState(12345);
  const [editAvatar2, setEditAvatar2] = useState('');
  const [editAvatar3, setEditAvatar3] = useState('');

  // Additional edit states for admin dashboard update
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [editBookCover, setEditBookCover] = useState('');
  const [editBookBackground, setEditBookBackground] = useState('');
  const [editQuizQuestion, setEditQuizQuestion] = useState('');
  const [editQuizCorrectAnswer, setEditQuizCorrectAnswer] = useState('');
  const [editOpt1, setEditOpt1] = useState('');
  const [editOpt2, setEditOpt2] = useState('');
  const [editOpt3, setEditOpt3] = useState('');
  const [editOpt4, setEditOpt4] = useState('');

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
    playClick();
    setTransitioning(true);
    setActivePlanetId(null);
    setTrackedPosition(null);
  };

  const handleEditToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClick();
    setIsEditing(!isEditing);
    setActiveTab('basic');
    if (!isEditing && planet) {
      setEditName(planet.name);
      setEditBio(planet.bio || '');
      setEditRadius(planet.orbit_radius);
      setEditSpeed(planet.orbit_speed);
      setEditSize(planet.planet_size);
      setEditSeed(planet.planet_seed);
      setEditAvatar2(planet.avatar_url_2 || '');
      setEditAvatar3(planet.avatar_url_3 || '');
      
      // Load new states
      setEditVideoUrl(planet.video_url || '');
      setEditBookCover(planet.book_cover || '');
      setEditBookBackground(planet.book_background || '');
      setEditQuizQuestion(planet.quiz_question || '');
      setEditQuizCorrectAnswer(planet.quiz_correct_answer || '');

      try {
        const parsed = JSON.parse(planet.quiz_options || '[]');
        setEditOpt1(parsed[0] || '');
        setEditOpt2(parsed[1] || '');
        setEditOpt3(parsed[2] || '');
        setEditOpt4(parsed[3] || '');
      } catch {
        const split = (planet.quiz_options || '').split(',');
        setEditOpt1((split[0] || '').trim());
        setEditOpt2((split[1] || '').trim());
        setEditOpt3((split[2] || '').trim());
        setEditOpt4((split[3] || '').trim());
      }
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
      
      // Save new fields
      video_url: editVideoUrl.trim() || null,
      book_cover: editBookCover.trim() || null,
      book_background: editBookBackground.trim() || null,
      quiz_question: editQuizQuestion.trim() || null,
      quiz_correct_answer: editQuizCorrectAnswer.trim() || null,
      quiz_options: JSON.stringify([
        editOpt1.trim(),
        editOpt2.trim(),
        editOpt3.trim(),
        editOpt4.trim()
      ])
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
              
              {!isEditing && (
                <button 
                  onClick={handleEditToggle} 
                  className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-5 py-2.5 rounded-full backdrop-blur-md transition border border-indigo-500/20 cursor-pointer shadow-lg font-bold"
                >
                  <Edit3 className="w-4 h-4" />
                  <span className="text-sm">Chỉnh sửa</span>
                </button>
              )}
            </div>

            {/* Main Content Area */}
            <div className={`flex-1 w-full flex flex-col items-center justify-center min-h-0 ${!isEditing ? 'p-4 md:p-6 lg:p-8 overflow-hidden' : 'p-4 md:p-6 lg:p-8 overflow-y-auto'}`}>
              {!isEditing ? (
                <div className="w-full h-full flex-grow flex flex-col min-h-0">
                  <PlanetBioReader
                    bio={planet.bio || ''}
                    achievements={achievements}
                    starColor={starColor}
                    planetId={planet.id}
                    avatarUrl={planet.avatar_url}
                    planetName={planet.name}
                    parentStarName={parentStar.name}
                    bookCover={planet.book_cover}
                    bookBackground={planet.book_background}
                    quizQuestion={planet.quiz_question}
                    quizOptions={planet.quiz_options}
                    quizCorrectAnswer={planet.quiz_correct_answer}
                    videoUrl={planet.video_url}
                  />
                </div>
              ) : (
                <form onSubmit={handleSave} className="w-full max-w-4xl bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-3xl p-6 md:p-8 flex flex-col gap-6 mb-20 shadow-2xl">
                  {/* Title Header */}
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Edit3 className="w-5 h-5 text-indigo-400" /> Chỉnh sửa dữ liệu tinh cầu
                    </h3>
                    <button type="button" onClick={handleEditToggle} className="text-zinc-500 hover:text-white transition p-1.5 hover:bg-zinc-800 rounded-xl">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Main Grid: Side-by-side Split Column */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
                    
                    {/* Left Column: Vertical Tabs */}
                    <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 md:border-r md:border-zinc-800/80 md:pr-4">
                      <button
                        type="button"
                        onClick={() => setActiveTab('basic')}
                        onMouseEnter={playHover}
                        className={`flex-shrink-0 flex items-center gap-2 text-left px-4 py-3 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                          activeTab === 'basic'
                            ? 'bg-indigo-650 text-white shadow-lg shadow-indigo-900/30'
                            : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                        }`}
                      >
                        <Info className="w-4 h-4" />
                        <span>Thông tin cơ bản</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('appearance')}
                        onMouseEnter={playHover}
                        className={`flex-shrink-0 flex items-center gap-2 text-left px-4 py-3 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                          activeTab === 'appearance'
                            ? 'bg-indigo-650 text-white shadow-lg shadow-indigo-900/30'
                            : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                        }`}
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>Bìa & Hình ảnh</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('video')}
                        onMouseEnter={playHover}
                        className={`flex-shrink-0 flex items-center gap-2 text-left px-4 py-3 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                          activeTab === 'video'
                            ? 'bg-indigo-650 text-white shadow-lg shadow-indigo-900/30'
                            : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                        }`}
                      >
                        <Video className="w-4 h-4" />
                        <span>Tư liệu Video</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('quiz')}
                        onMouseEnter={playHover}
                        className={`flex-shrink-0 flex items-center gap-2 text-left px-4 py-3 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                          activeTab === 'quiz'
                            ? 'bg-indigo-650 text-white shadow-lg shadow-indigo-900/30'
                            : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                        }`}
                      >
                        <HelpCircle className="w-4 h-4" />
                        <span>Trắc nghiệm</span>
                      </button>
                    </div>

                    {/* Right Column: Tab Contents */}
                    <div className="md:col-span-3 space-y-5 min-h-[300px]">
                      {activeTab === 'basic' && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Tên Nhân Vật / Anh Kiệt</label>
                            <input type="text" required value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition" onClick={e => e.stopPropagation()}/>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Tóm tắt Tiểu Sử</label>
                            <textarea rows={6} value={editBio} onChange={(e) => setEditBio(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition resize-none leading-relaxed" onClick={e => e.stopPropagation()}/>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-1.5">Quỹ đạo (Radius)</label>
                              <input type="number" step="0.1" value={editRadius} onChange={(e) => setEditRadius(Number(e.target.value))} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white" onClick={e => e.stopPropagation()}/>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-1.5">Tốc độ (Speed)</label>
                              <input type="number" step="0.1" value={editSpeed} onChange={(e) => setEditSpeed(Number(e.target.value))} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white" onClick={e => e.stopPropagation()}/>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-1.5">Kích cỡ (Size)</label>
                              <input type="number" step="0.05" value={editSize} onChange={(e) => setEditSize(Number(e.target.value))} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white" onClick={e => e.stopPropagation()}/>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Seed kết cấu hành tinh (Texture Seed)</label>
                            <div className="flex gap-2">
                              <input type="number" value={editSeed} onChange={(e) => setEditSeed(Number(e.target.value))} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white outline-none" onClick={e => e.stopPropagation()}/>
                              <button
                                type="button"
                                onClick={() => setEditSeed(Math.floor(Math.random() * 90000) + 10000)}
                                className="px-4 py-3 bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-xs rounded-xl text-white font-semibold cursor-pointer"
                              >
                                Gen Random
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 'appearance' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Ảnh đại diện phụ 2 (URL)</label>
                              <input type="text" placeholder="https://example.com/image2.png" value={editAvatar2} onChange={(e) => setEditAvatar2(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition" onClick={e => e.stopPropagation()}/>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Ảnh đại diện phụ 3 (URL)</label>
                              <input type="text" placeholder="https://example.com/image3.png" value={editAvatar3} onChange={(e) => setEditAvatar3(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition" onClick={e => e.stopPropagation()}/>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Bìa sách (Màu Gradient CSS / URL ảnh)</label>
                            <input type="text" placeholder="Ví dụ: linear-gradient(135deg, #1e3a8a, #3b82f6) hoặc URL ảnh" value={editBookCover} onChange={(e) => setEditBookCover(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition" onClick={e => e.stopPropagation()}/>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Màu trang sách nền (Mã màu CSS)</label>
                            <input type="text" placeholder="Ví dụ: #111827 hoặc #0b0f19" value={editBookBackground} onChange={(e) => setEditBookBackground(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition" onClick={e => e.stopPropagation()}/>
                          </div>
                        </div>
                      )}

                      {activeTab === 'video' && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Tài liệu Video (YouTube / Shorts URL)</label>
                            <input type="text" placeholder="Ví dụ: https://youtube.com/shorts/Ay8lynMZ4mE" value={editVideoUrl} onChange={(e) => setEditVideoUrl(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition" onClick={e => e.stopPropagation()}/>
                            <p className="text-[10px] text-zinc-500 mt-2 leading-relaxed">
                              Hệ thống sẽ tự động chuyển đổi các địa chỉ YouTube thông thường hoặc dạng Shorts thành dạng nhúng (embed) hiển thị bên cạnh bìa sách.
                            </p>
                          </div>
                        </div>
                      )}

                      {activeTab === 'quiz' && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Câu hỏi ôn tập</label>
                            <input type="text" placeholder="Nhập câu hỏi trắc nghiệm..." value={editQuizQuestion} onChange={(e) => setEditQuizQuestion(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition" onClick={e => e.stopPropagation()}/>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-1">Lựa chọn A</label>
                              <input type="text" placeholder="Nhập lựa chọn thứ nhất..." value={editOpt1} onChange={(e) => setEditOpt1(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white" onClick={e => e.stopPropagation()}/>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-1">Lựa chọn B</label>
                              <input type="text" placeholder="Nhập lựa chọn thứ hai..." value={editOpt2} onChange={(e) => setEditOpt2(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white" onClick={e => e.stopPropagation()}/>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-1">Lựa chọn C</label>
                              <input type="text" placeholder="Nhập lựa chọn thứ ba..." value={editOpt3} onChange={(e) => setEditOpt3(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white" onClick={e => e.stopPropagation()}/>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-1">Lựa chọn D</label>
                              <input type="text" placeholder="Nhập lựa chọn thứ tư..." value={editOpt4} onChange={(e) => setEditOpt4(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white" onClick={e => e.stopPropagation()}/>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Đáp án chính xác (Phải khớp chính xác với 1 trong 4 lựa chọn trên)</label>
                            <input type="text" placeholder="Nhập chính xác đáp án đúng..." value={editQuizCorrectAnswer} onChange={(e) => setEditQuizCorrectAnswer(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition" onClick={e => e.stopPropagation()}/>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit / Cancel Area */}
                  <div className="flex gap-4 mt-6 pt-4 border-t border-zinc-800/85">
                    <button type="button" onClick={handleDelete} className="px-6 py-3 bg-rose-950/20 text-rose-400 rounded-xl text-sm font-bold transition hover:bg-rose-900/40 flex items-center justify-center border border-rose-900/30" onClickCapture={e => e.stopPropagation()}>
                      <Trash2 className="w-4 h-4 mr-2" /> Giải Phóng Tinh Cầu
                    </button>
                    <button type="submit" disabled={saving} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold flex items-center justify-center space-x-2 shadow-lg shadow-indigo-900/20" onClickCapture={e => e.stopPropagation()}>
                      {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                      <span>Lưu tất cả thay đổi</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
