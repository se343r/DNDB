'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Achievement } from '@/lib/types';
import { Award, BookOpen, HelpCircle } from 'lucide-react';

interface PlanetBioReaderProps {
  bio: string;
  achievements: Achievement[];
  starColor: string;
  planetId: string;
  avatarUrl?: string;
  planetName: string;
  parentStarName: string;
  bookCover?: string;
  bookBackground?: string;
  quizQuestion?: string;
  quizOptions?: string;
  quizCorrectAnswer?: string;
  videoUrl?: string;
}

// Helper function to extract YouTube embed URL from standard or short link
const getEmbedUrl = (url: string | undefined): string => {
  if (!url) return '';
  
  let videoId = '';
  if (url.includes('/shorts/')) {
    const parts = url.split('/shorts/');
    if (parts[1]) {
      videoId = parts[1].split('?')[0].split('&')[0];
    }
  } else if (url.includes('v=')) {
    const parts = url.split('v=');
    if (parts[1]) {
      videoId = parts[1].split('&')[0];
    }
  } else if (url.includes('youtu.be/')) {
    const parts = url.split('youtu.be/');
    if (parts[1]) {
      videoId = parts[1].split('?')[0].split('&')[0];
    }
  } else if (url.includes('/embed/')) {
    const parts = url.split('/embed/');
    if (parts[1]) {
      videoId = parts[1].split('?')[0].split('&')[0];
    }
  } else {
    if (url.length >= 8 && url.length <= 15) {
      videoId = url;
    }
  }
  
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
  }
  return '';
};

export const PlanetBioReader: React.FC<PlanetBioReaderProps> = ({
  bio,
  achievements,
  starColor,
  planetId,
  avatarUrl,
  planetName,
  parentStarName,
  quizQuestion,
  quizOptions,
  quizCorrectAnswer,
  videoUrl,
}) => {
  // Local state for the mini quiz
  const [quizSelectedOption, setQuizSelectedOption] = useState<string | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [currentQuizIdx, setCurrentQuizIdx] = useState<number>(0);
  const [quizScore, setQuizScore] = useState<number>(0);

  // Default dynamic quiz question generator if not customized in the DB
  const parsedQuiz = useMemo(() => {
    if (quizQuestion && quizOptions) {
      let optionsList: string[] = [];
      try {
        optionsList = typeof quizOptions === 'string' ? JSON.parse(quizOptions) : quizOptions;
      } catch {
        optionsList = Array.isArray(quizOptions) ? quizOptions : [];
      }
      if (optionsList.length > 0) {
        return {
          question: quizQuestion,
          options: optionsList,
          correctAnswer: quizCorrectAnswer || optionsList[0],
        };
      }
    }

    // Dynamic generation from achievements data
    if (achievements && achievements.length > 0) {
      const targetAch = achievements.find((ach) => ach.year !== undefined && ach.year !== null);
      if (targetAch && targetAch.year !== undefined) {
        const targetYear = targetAch.year;
        const yearText = targetYear > 0 ? `${targetYear}` : `TCN ${Math.abs(targetYear)}`;
        const correctOpt = `${yearText}`;
        const opt2 = targetYear > 0 ? `${targetYear - 15}` : `TCN ${Math.abs(targetYear - 15)}`;
        const opt3 = targetYear > 0 ? `${targetYear + 25}` : `TCN ${Math.abs(targetYear + 25)}`;
        const opt4 = targetYear > 0 ? `${targetYear - 50}` : `TCN ${Math.abs(targetYear - 50)}`;
        return {
          question: `Sự kiện "${targetAch.title}" được ghi nhận diễn ra vào mốc thời gian nào?`,
          options: [correctOpt, opt2, opt3, opt4].sort(() => Math.random() - 0.5),
          correctAnswer: correctOpt,
        };
      }
    }

    // Standard fallback
    return {
      question: `Cuốn biên niên sử cuộc đời này ghi chép về vị anh kiệt nào sau đây?`,
      options: [planetName, parentStarName, 'Lữ khách hành tinh', 'Nhà du hành vũ trụ'].sort(() => Math.random() - 0.5),
      correctAnswer: planetName,
    };
  }, [quizQuestion, quizOptions, quizCorrectAnswer, achievements, planetName, parentStarName]);

  // Reset page & quiz states when planetId changes
  useEffect(() => {
    setQuizSelectedOption(null);
    setQuizSubmitted(false);
    setCurrentQuizIdx(0);
    setQuizScore(0);
  }, [planetId]);

  // Parse multi-quiz JSON or fallback to single quiz
  useEffect(() => {
    if (quizQuestion && quizQuestion.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(quizQuestion);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setQuizzes(parsed.map(q => ({
            question: q.question || q.q || '',
            options: q.options || q.o || [],
            correctAnswer: q.correctAnswer || q.correct_answer || q.a || ''
          })));
          setCurrentQuizIdx(0);
          setQuizScore(0);
          setQuizSelectedOption(null);
          setQuizSubmitted(false);
          return;
        }
      } catch (err) {
        console.error("Error parsing multi-quiz JSON:", err);
      }
    }

    // Default to the single parsedQuiz item
    setQuizzes([parsedQuiz]);
    setCurrentQuizIdx(0);
    setQuizScore(0);
    setQuizSelectedOption(null);
    setQuizSubmitted(false);
  }, [quizQuestion, parsedQuiz]);

  return (
    <div className="w-full h-full overflow-y-auto pr-2 scrollbar-thin flex flex-col justify-start">
      {/* Top Header Section */}
      <div className="w-full flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mb-10 border-b border-white/5 pb-8">
        {/* Left side: Avatar & Info */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1">
          {avatarUrl && (
            <div
              className="w-28 h-28 md:w-36 md:h-36 rounded-full border-[4px] bg-zinc-950 overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)] mb-4 flex-shrink-0"
              style={{ borderColor: starColor, boxShadow: `0 0 15px ${starColor}44` }}
            >
              <img
                src={avatarUrl}
                alt={planetName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${planetId}`;
                }}
              />
            </div>
          )}
          <span
            className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-3 border font-mono"
            style={{ borderColor: `${starColor}33`, backgroundColor: `${starColor}15`, color: starColor }}
          >
            Tinh hệ {parentStarName}
          </span>
          <h1
            className="text-3xl md:text-5xl font-black font-display text-white leading-tight"
            style={{ textShadow: `0 0 20px ${starColor}22` }}
          >
            {planetName}
          </h1>
          <p className="text-zinc-500 text-[10px] font-mono tracking-widest mt-2 uppercase">
            [ Thư Tịch Anh Kiệt ]
          </p>
        </div>

        {/* Right side: Video player */}
        {videoUrl && (
          <div className="flex-shrink-0 w-full max-w-[280px] md:max-w-[220px] aspect-[9/16] rounded-2xl border border-white/10 overflow-hidden shadow-2xl bg-black relative flex items-center justify-center animate-fade-in">
            <iframe
              src={getEmbedUrl(videoUrl)}
              title="Giới thiệu tinh cầu"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        )}
      </div>

      {/* Biography Content Section */}
      <div className="w-full mb-10">
        <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
          <BookOpen className="w-6 h-6 text-indigo-400" />
          <h3 className="text-xl font-bold text-white uppercase tracking-wider font-display">Hành trạng &amp; Tiểu sử</h3>
        </div>
        <div className="bg-white/5 border border-white/5 rounded-3xl p-6 md:p-10 shadow-2xl leading-relaxed text-zinc-300 font-light text-sm md:text-base">
          {bio ? (
            /<[a-z][\s\S]*>/i.test(bio) ? (
              <div
                className="biography-content text-justify space-y-4"
                dangerouslySetInnerHTML={{ __html: bio }}
              />
            ) : (
              bio.split(/\n\s*\n/).filter((p) => p.trim() !== '').map((para, idx) => (
                <p key={idx} className="mb-4 text-justify">
                  {para.split('\n').map((line, lIdx) => (
                    <React.Fragment key={lIdx}>
                      {lIdx > 0 && <br />}
                      {line}
                    </React.Fragment>
                  ))}
                </p>
              ))
            )
          ) : (
            <p className="text-zinc-500 italic">Chưa có thông tin tiểu sử.</p>
          )}
        </div>
      </div>

      {/* Achievements Timeline Section */}
      {achievements.length > 0 && (
        <div className="w-full mb-12">
          <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
            <Award className="w-6 h-6 text-indigo-400" />
            <h3 className="text-xl font-bold text-white uppercase tracking-wider font-display">Sự nghiệp &amp; Di sản lưu danh</h3>
          </div>

          <div className="space-y-6 relative border-l-2 border-white/10 pl-6 ml-3">
            {achievements.map((ach) => (
              <div key={ach.id} className="relative group">
                {/* Timeline dot */}
                <span
                  className="absolute -left-[35px] top-1.5 w-4 h-4 rounded-full bg-zinc-950 border-2 transition-transform group-hover:scale-125"
                  style={{ borderColor: starColor, boxShadow: `0 0 10px ${starColor}` }}
                />

                <div className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-2xl p-5 md:p-6 transition duration-300">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                    <h4 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">{ach.title}</h4>
                    {ach.year !== undefined && ach.year !== null && (
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

      {/* Quiz Section */}
      {quizzes.length > 0 && (
        <div className="w-full mb-12 bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
            <HelpCircle className="w-6 h-6 text-indigo-400" />
            <h3 className="text-xl font-bold text-white uppercase tracking-wider font-display">Thử thách tri thức</h3>
          </div>
          
          {(() => {
            const currentQuiz = quizzes[currentQuizIdx] || parsedQuiz;
            if (!currentQuiz) return null;
            const correctStr = currentQuiz.correctAnswer;
            
            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-indigo-400 font-mono text-xs uppercase">
                  <span>Câu ôn tập {currentQuizIdx + 1}/{quizzes.length}</span>
                  <span>Điểm số: {quizScore}/{quizzes.length}</span>
                </div>
                
                <h3 className="text-base font-semibold text-white leading-relaxed text-justify">
                  {currentQuiz.question}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  {currentQuiz.options.map((opt: string, oIdx: number) => {
                    let optStyle = 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-indigo-500/30';
                    
                    if (quizSubmitted) {
                      if (opt === correctStr) {
                        optStyle = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300';
                      } else if (opt === quizSelectedOption) {
                        optStyle = 'bg-rose-500/20 border-rose-500/50 text-rose-300';
                      } else {
                        optStyle = 'bg-white/5 border-white/5 opacity-40';
                      }
                    } else if (opt === quizSelectedOption) {
                      optStyle = 'bg-indigo-600/30 border-indigo-500 text-white';
                    }

                    return (
                      <button
                        key={oIdx}
                        type="button"
                        disabled={quizSubmitted}
                        onClick={() => setQuizSelectedOption(opt)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm text-left transition duration-200 cursor-pointer disabled:cursor-default ${optStyle}`}
                      >
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Feedback and navigation */}
                <div className="h-16 flex flex-col justify-end mt-6">
                  {!quizSubmitted ? (
                    <button
                      type="button"
                      disabled={!quizSelectedOption}
                      onClick={() => {
                        const isCorrect = quizSelectedOption === correctStr;
                        if (isCorrect) setQuizScore(s => s + 1);
                        setQuizSubmitted(true);
                      }}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold shadow-lg transition duration-200 cursor-pointer"
                    >
                      Xác nhận đáp án
                    </button>
                  ) : (
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
                      <p className="text-sm font-medium text-center md:text-left">
                        {quizSelectedOption === correctStr ? (
                          <span className="text-emerald-400 font-bold">Chính xác! Bạn đã hiểu rõ cuộc đời của anh kiệt.</span>
                        ) : (
                          <span className="text-rose-400 font-bold">Chưa chính xác. Đáp án đúng là: {correctStr}</span>
                        )}
                      </p>
                      {currentQuizIdx < quizzes.length - 1 ? (
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentQuizIdx(idx => idx + 1);
                            setQuizSelectedOption(null);
                            setQuizSubmitted(false);
                          }}
                          className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition cursor-pointer shadow-md"
                        >
                          Câu tiếp theo →
                        </button>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-zinc-300 font-semibold">
                            Hoàn thành: {quizScore + (quizSelectedOption === correctStr ? 1 : 0)}/{quizzes.length} đúng!
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentQuizIdx(0);
                              setQuizScore(0);
                              setQuizSelectedOption(null);
                              setQuizSubmitted(false);
                            }}
                            className="text-xs text-zinc-500 hover:text-white underline cursor-pointer transition"
                          >
                            Làm lại câu đố
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
