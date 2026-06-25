'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, MessageSquare, Sparkles, AlertCircle, Bot } from 'lucide-react';
import { useAudio } from '../providers/AudioProvider';
import { supabase } from '@/lib/supabase';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export const Chatbot: React.FC = () => {
  const pathname = usePathname();
  const { playClick, playHover } = useAudio();
  
  // Show chatbot ONLY on these specific screens
  const allowedPaths = ['/catalog', '/quizzes', '/leaderboard', '/recommendations'];
  const isAllowed = allowedPaths.includes(pathname || '');

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [userId, setUserId] = useState<string | null>(null);

  // Init session ID (anonymous tracking) + auth user ID
  useEffect(() => {
    // Persist anonymous session across page navigations within the same tab
    let sid = sessionStorage.getItem('chatbot_session_id');
    if (!sid) {
      sid = `anon_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      sessionStorage.setItem('chatbot_session_id', sid);
    }
    setSessionId(sid);
    // Get auth user id if logged in
    supabase?.auth.getUser().then(({ data }) => {
      setUserId(data?.user?.id ?? null);
    });
  }, []);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Set initial greeting when page changes or chatbot opens
  useEffect(() => {
    if (!isAllowed) {
      setIsOpen(false);
      return;
    }

    let pageTitle = 'khám phá tri thức';
    let welcomeMsg = 'Chào bạn! Tôi là AstroBot 👨‍🚀. Tôi có thể giúp gì cho bạn hôm nay?';
    
    if (pathname === '/catalog') {
      pageTitle = 'Bản đồ chòm sao';
      welcomeMsg = 'Chào bạn! Đây là Bản đồ Chòm sao Bắc Đẩu 🌌. Hãy click chọn các ngôi sao để bay sâu vào từng hệ sao danh nhân nhé! Bạn muốn tôi giới thiệu thêm về chức năng trang này không? 🚀';
    } else if (pathname === '/quizzes') {
      pageTitle = 'Thử thách tri thức';
      welcomeMsg = 'Chào bạn! Đây là màn hình Thử thách Tri thức 📝. Nơi kiểm tra khả năng hiểu biết của bạn về danh nhân thế giới để thăng cấp. Bạn có cần hướng dẫn gì không?';
    } else if (pathname === '/leaderboard') {
      pageTitle = 'Bảng xếp hạng';
      welcomeMsg = 'Chào bạn! Đây là Bảng xếp hạng Vũ Trụ 🏆. Nơi vinh danh các nhà du hành tri thức xuất sắc nhất. Hãy hỏi tôi về luật tính điểm nhé! 👨‍🚀';
    } else if (pathname === '/recommendations') {
      pageTitle = 'Đề xuất hành trình';
      welcomeMsg = 'Chào bạn! Đây là trang Đề xuất Hành trình 🌠. Tôi có thể giải thích thuật toán đề xuất hành tinh hoặc giới thiệu về các danh nhân nổi bật cho bạn đấy! 🛸';
    }

    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: welcomeMsg,
      },
    ]);
  }, [pathname, isAllowed]);

  if (!isAllowed) return null;

  const handleSend = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text) return;

    playClick();
    const userMsgId = Date.now().toString();
    const newMessages = [
      ...messages,
      { id: userMsgId, role: 'user' as const, content: text }
    ];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          pathname,
          userId,
          sessionId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Không gửi được tin nhắn');

      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: 'assistant', content: data.response },
      ]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Có lỗi kết nối hệ thống chatbot');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  const getQuickOptions = () => {
    const defaultOpts = [{ label: 'Giới thiệu chức năng trang này 🚀', text: 'Giới thiệu cho tôi chức năng của trang này nhé!' }];
    if (pathname === '/catalog') {
      return [
        ...defaultOpts,
        { label: 'Cách di chuyển bản đồ 🌌', text: 'Làm thế nào để di chuyển và phóng to thu nhỏ bản đồ?' },
        { label: 'Xem các hệ sao khác 🌟', text: 'Có tất cả bao nhiêu hệ sao và xem chúng như thế nào?' }
      ];
    } else if (pathname === '/quizzes') {
      return [
        ...defaultOpts,
        { label: 'Xem cách tính điểm trắc nghiệm 📝', text: 'Hoàn thành câu đố sẽ nhận được điểm và tăng chuỗi như thế nào?' }
      ];
    } else if (pathname === '/leaderboard') {
      return [
        ...defaultOpts,
        { label: 'Cách leo hạng nhanh 🏆', text: 'Làm thế nào để tăng cấp độ và leo hạng nhanh nhất?' }
      ];
    } else if (pathname === '/recommendations') {
      return [
        ...defaultOpts,
        { label: 'Thuật toán đề xuất là gì? 🌠', text: 'Dựa vào đâu mà hệ thống đề xuất các hành tinh này cho tôi?' }
      ];
    }
    return defaultOpts;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-auto flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="w-80 md:w-96 h-[460px] bg-zinc-950/85 border border-zinc-800 rounded-3xl shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden mb-4 mr-1 text-white font-sans"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-indigo-950/40 via-violet-950/40 to-slate-950/40 border-b border-zinc-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-2xl bg-indigo-500/10 border border-indigo-500/35 overflow-hidden flex items-center justify-center shrink-0">
                  <img
                    src="/images/robot_assistant.png"
                    alt="AstroBot avatar"
                    className="w-full h-full object-cover scale-110 translate-y-[1px]"
                  />
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-zinc-950" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-wide flex items-center gap-1.5">
                    <span>AstroBot</span>
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-mono">Trợ lý Vũ Trụ Bắc Đẩu</p>
                </div>
              </div>
              <button
                onClick={() => { playClick(); setIsOpen(false); }}
                className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex items-start gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {m.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-xl bg-indigo-500/10 border border-indigo-500/20 overflow-hidden flex items-center justify-center shrink-0">
                      <img
                        src="/images/robot_assistant.png"
                        alt="Bot"
                        className="w-full h-full object-cover scale-115"
                      />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] px-4 py-3 rounded-2xl text-xs md:text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-zinc-900 border border-zinc-850 text-zinc-200 rounded-tl-none'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-indigo-500/10 border border-indigo-500/20 overflow-hidden flex items-center justify-center shrink-0">
                    <img
                      src="/images/robot_assistant.png"
                      alt="Bot"
                      className="w-full h-full object-cover scale-115"
                    />
                  </div>
                  <div className="bg-zinc-900 border border-zinc-850 px-4 py-3 rounded-2xl rounded-tl-none text-xs text-zinc-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick replies */}
            <div className="px-4 pb-2 pt-1 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none shrink-0 border-t border-zinc-900 bg-zinc-950/20 py-2">
              {getQuickOptions().map((opt, i) => (
                <button
                  key={i}
                  onMouseEnter={playHover}
                  onClick={() => handleSend(opt.text)}
                  disabled={loading}
                  className="px-3 py-1.5 text-[10px] font-medium bg-zinc-900 border border-zinc-800 hover:border-indigo-500/40 text-zinc-300 hover:text-white rounded-full transition cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleFormSubmit}
              className="p-4 bg-zinc-950/50 border-t border-zinc-900 flex gap-2 items-center shrink-0"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                placeholder="Hỏi AstroBot về trang này nhé..."
                className="flex-1 h-10 bg-zinc-900 border border-zinc-800 rounded-2xl px-4 text-xs md:text-sm text-white placeholder-zinc-500 outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/10 transition"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-10 h-10 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900/50 disabled:text-zinc-650 text-white rounded-2xl flex items-center justify-center transition cursor-pointer shrink-0 outline-none"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        onMouseEnter={playHover}
        onClick={() => { playClick(); setIsOpen(!isOpen); }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="relative w-14 h-14 rounded-2xl bg-indigo-650 hover:bg-indigo-600 border border-indigo-550/45 text-white shadow-2xl flex items-center justify-center cursor-pointer transition-colors z-50 overflow-hidden outline-none"
        style={{
          boxShadow: '0 8px 30px rgba(99, 102, 241, 0.35)',
        }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full relative flex items-center justify-center"
            >
              {/* Graduate astronaut robot face */}
              <img
                src="/images/robot_assistant.png"
                alt="AstroBot button"
                className="w-full h-full object-cover scale-110 translate-y-[2px]"
              />
              
              {/* Sparkle indicators */}
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-indigo-400 rounded-full animate-ping opacity-75" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};
export default Chatbot;
