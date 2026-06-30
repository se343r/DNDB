'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Achievement } from '@/lib/types';
import { Award, Calendar, Folder, BookOpen, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';

// Dynamically import react-pageflip to disable Server-Side Rendering (SSR)
// @ts-ignore
const HTMLFlipBook: any = dynamic(() => import('react-pageflip'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[300px] bg-zinc-950/40 rounded-2xl flex items-center justify-center text-zinc-500 font-mono">
      Đang chuẩn bị thư tịch...
    </div>
  ),
});

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

interface Chapter {
  numeral: string;
  title: string;
  type: 'bio' | 'achievements';
  content: string;
  rawContent: any;
}

// Function to split HTML/Text bio into chapters
const getChapters = (bio: string, achievements: Achievement[]): Chapter[] => {
  const chapters: Chapter[] = [];

  // Get raw bio blocks
  let bioBlocks: string[] = [];
  if (bio) {
    if (/<[a-z][\s\S]*>/i.test(bio)) {
      const rawBlocks = bio.split(/(<\/p>|<\/ul>|<\/ol>|<\/h[1-6]>|<\/blockquote>|<\/pre>|<\/div>)/i);
      for (let i = 0; i < rawBlocks.length; i += 2) {
        const content = rawBlocks[i];
        const tag = rawBlocks[i + 1] || '';
        const block = (content + tag).trim();
        if (block) {
          bioBlocks.push(block);
        }
      }
    } else {
      bioBlocks = bio.split(/\n\s*\n/).filter((p) => p.trim() !== '');
    }
  }

  // Create chapters from bio blocks
  if (bioBlocks.length > 0) {
    if (bioBlocks.length <= 2) {
      chapters.push({
        numeral: 'I',
        title: 'Thân thế & Sự nghiệp',
        type: 'bio',
        content: bioBlocks.join(''),
        rawContent: bioBlocks,
      });
    } else {
      // Split into two chapters
      const mid = Math.ceil(bioBlocks.length / 2);
      const part1 = bioBlocks.slice(0, mid);
      const part2 = bioBlocks.slice(mid);

      chapters.push({
        numeral: 'I',
        title: 'Thân thế & Thiếu thời',
        type: 'bio',
        content: part1.join(''),
        rawContent: part1,
      });

      chapters.push({
        numeral: 'II',
        title: 'Hành trạng & Sự nghiệp',
        type: 'bio',
        content: part2.join(''),
        rawContent: part2,
      });
    }
  }

  // Add achievements chapter
  if (achievements && achievements.length > 0) {
    const nextRoman = chapters.length === 0 ? 'I' : chapters.length === 1 ? 'II' : 'III';
    chapters.push({
      numeral: nextRoman,
      title: 'Di sản & Dấu ấn',
      type: 'achievements',
      content: '',
      rawContent: achievements,
    });
  }

  return chapters;
};

// Helper function to group paragraphs into pages to prevent vertical scrolling
const groupParagraphsIntoPages = (paragraphs: string[], maxCharsPerPage = 750): string[][] => {
  const pages: string[][] = [];
  let currentPage: string[] = [];
  let currentChars = 0;

  for (const para of paragraphs) {
    const plainText = para.replace(/<[^>]*>/g, '');
    if (currentChars + plainText.length > maxCharsPerPage && currentPage.length > 0) {
      pages.push(currentPage);
      currentPage = [para];
      currentChars = plainText.length;
    } else {
      currentPage.push(para);
      currentChars += plainText.length;
    }
  }

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  return pages;
};

// Helper function to group achievements into pages to prevent vertical scrolling
const groupAchievementsIntoPages = (achList: Achievement[], maxPerPage = 3): Achievement[][] => {
  const pages: Achievement[][] = [];
  for (let i = 0; i < achList.length; i += maxPerPage) {
    pages.push(achList.slice(i, i + maxPerPage));
  }
  return pages;
};

// Ref-forwarded wrapper for each page sheet in react-pageflip
const Page = React.forwardRef<HTMLDivElement, any>((props, ref) => {
  return (
    <div
      ref={ref}
      className={`relative w-full h-full flex flex-col justify-between overflow-hidden shadow-inner ${props.className || ''}`}
      style={{ ...props.style, ...props.customStyle }}
    >
      {props.children}
    </div>
  );
});
Page.displayName = 'Page';

// Helper function to extract YouTube embed URL from standard or short link
const getEmbedUrl = (url: string | undefined): string => {
  const defaultEmbed = "https://www.youtube.com/embed/Ay8lynMZ4mE?enablejsapi=1";
  if (!url) return defaultEmbed;
  
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
  return defaultEmbed;
};

export const PlanetBioReader: React.FC<PlanetBioReaderProps> = ({
  bio,
  achievements,
  starColor,
  planetId,
  avatarUrl,
  planetName,
  parentStarName,
  bookCover,
  bookBackground,
  quizQuestion,
  quizOptions,
  quizCorrectAnswer,
  videoUrl,
}) => {
  const bookRef = useRef<any>(null);
  const [activePage, setActivePage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Local state for the mini quiz inside the book
  const [quizSelectedOption, setQuizSelectedOption] = useState<string | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [currentQuizIdx, setCurrentQuizIdx] = useState<number>(0);
  const [quizScore, setQuizScore] = useState<number>(0);

  const chapters = useMemo(() => getChapters(bio, achievements), [bio, achievements]);
  const totalChapters = chapters.length;
  // If chapters exist, total dots = Front Cover + Chapters + Quiz Chapter + Back Cover
  const totalDots = totalChapters > 0 ? totalChapters + 3 : 2;

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

  // Paginated flat book pages structure
  const bookPages = useMemo(() => {
    const pagesList: {
      type: 'front' | 'chapter-cover' | 'chapter-content' | 'back';
      chIdx?: number;
      pageContent?: any;
      chNumeral?: string;
      chTitle?: string;
      chType?: string;
    }[] = [];

    // 1. Front Cover
    pagesList.push({ type: 'front' });

    // Check if bio has pagebreak comment
    const hasPagebreaks = bio && bio.includes('<!-- pagebreak -->');

    if (hasPagebreaks) {
      const bioPages = bio.split(/<!--\s*pagebreak\s*-->/);
      let chIdxCount = 0;
      
      bioPages.forEach((pageContentRaw) => {
        const cleaned = pageContentRaw.trim();
        if (!cleaned) return;

        // Check if this page is a chapter header page
        // (starts and ends with a heading tag, or is very short and starts with "Chương")
        const isHeaderPage = 
          (/^\s*<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>\s*$/i.test(cleaned)) ||
          (cleaned.startsWith('Chương') && cleaned.length < 100);

        if (isHeaderPage) {
          const title = cleaned.replace(/<[^>]*>/g, '').replace(/^Chương\s+[A-Z0-9-.:\s]+/i, '').trim();
          const numeralMatch = cleaned.match(/Chương\s+([I|V|X|L|C|D|M]+|\d+)/i);
          const numeral = numeralMatch ? numeralMatch[1] : `${chIdxCount + 1}`;
          
          pagesList.push({
            type: 'chapter-cover',
            chIdx: chIdxCount++,
            chNumeral: numeral,
            chTitle: title || cleaned.replace(/<[^>]*>/g, '').trim(),
            chType: 'bio',
          });
        } else {
          pagesList.push({
            type: 'chapter-content',
            chIdx: Math.max(0, chIdxCount - 1),
            chType: 'bio',
            pageContent: [cleaned],
          });
        }
      });

      // Add achievements page if they exist
      if (achievements && achievements.length > 0) {
        const numeralMatch = `${chIdxCount + 1}`;
        pagesList.push({
          type: 'chapter-cover',
          chIdx: chIdxCount,
          chNumeral: numeralMatch,
          chTitle: 'Di sản & Dấu ấn',
          chType: 'achievements',
          pageContent: achievements,
        });

        const segments = groupAchievementsIntoPages(achievements, 3);
        segments.forEach((seg) => {
          pagesList.push({
            type: 'chapter-content',
            chIdx: chIdxCount,
            chType: 'achievements',
            pageContent: seg,
          });
        });
        
        chIdxCount++;
      }

      // Add Quiz Chapter
      const numerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
      const quizRoman = numerals[chIdxCount] || 'IV';
      pagesList.push({
        type: 'chapter-cover',
        chIdx: chIdxCount,
        chNumeral: quizRoman,
        chTitle: 'Thử Thách Tri Thức',
        chType: 'quiz',
      });

      pagesList.push({
        type: 'chapter-content',
        chIdx: chIdxCount,
        chType: 'quiz',
      });

    } else {
      // 2. Chapters (Fallback to dynamic paragraph splitting)
      chapters.forEach((ch, chIdx) => {
        pagesList.push({
          type: 'chapter-cover',
          chIdx,
          chNumeral: ch.numeral,
          chTitle: ch.title,
          chType: ch.type,
          pageContent: ch.rawContent,
        });

        const segments = ch.type === 'achievements'
          ? groupAchievementsIntoPages(ch.rawContent, 3)
          : groupParagraphsIntoPages(ch.rawContent, 750);

        segments.forEach((seg) => {
          pagesList.push({
            type: 'chapter-content',
            chIdx,
            chType: ch.type,
            pageContent: seg,
          });
        });
      });

      // 2.5 Quiz Chapter
      if (totalChapters > 0) {
        const numerals = ['I', 'II', 'III', 'IV', 'V'];
        const nextRoman = numerals[totalChapters] || 'IV';
        pagesList.push({
          type: 'chapter-cover',
          chIdx: totalChapters,
          chNumeral: nextRoman,
          chTitle: 'Thử Thách Tri Thức',
          chType: 'quiz',
        });

        pagesList.push({
          type: 'chapter-content',
          chIdx: totalChapters,
          chType: 'quiz',
        });
      }
    }

    // 3. Back Cover
    pagesList.push({ type: 'back' });

    return pagesList;
  }, [chapters, totalChapters, bio, achievements]);

  const totalPages = bookPages.length;

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset page & quiz states when planetId changes
  useEffect(() => {
    setActivePage(0);
    setQuizSelectedOption(null);
    setQuizSubmitted(false);
    setCurrentQuizIdx(0);
    setQuizScore(0);
    if (bookRef.current && bookRef.current.pageFlip()) {
      bookRef.current.pageFlip().turnToPage(0);
    }
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

  // Compute customizable inner pages backgrounds
  const customBgStyle = useMemo(() => {
    if (!bookBackground) return null;
    const isUrl = bookBackground.startsWith('http') || bookBackground.startsWith('/') || bookBackground.startsWith('data:');
    if (isUrl) {
      return {
        backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px), url(${bookBackground})`,
        backgroundSize: '18px 18px, cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
    }
    return {
      background: bookBackground,
      backgroundColor: bookBackground.startsWith('#') ? bookBackground : 'transparent',
    };
  }, [bookBackground]);

  // Deep space radial nebula gradients wrapping crease
  const leftPageStyle = useMemo(() => {
    if (customBgStyle) return { ...customBgStyle, backgroundColor: customBgStyle.backgroundColor || '#0a0a0f' };
    return {
      backgroundColor: '#0a0a0f',
      background: `radial-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px), radial-gradient(circle at 80% 50%, ${starColor}15 0%, #0a0a0f 100%), #0a0a0f`,
      backgroundSize: '18px 18px, 100% 100%',
    };
  }, [starColor, customBgStyle]);

  const rightPageStyle = useMemo(() => {
    if (customBgStyle) return { ...customBgStyle, backgroundColor: customBgStyle.backgroundColor || '#09090e' };
    return {
      backgroundColor: '#09090e',
      background: `radial-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px), radial-gradient(circle at 20% 50%, ${starColor}15 0%, #09090e 100%), #09090e`,
      backgroundSize: '18px 18px, 100% 100%',
    };
  }, [starColor, customBgStyle]);

  // Compute customizable cover page backgrounds
  const customCoverStyle = useMemo(() => {
    if (!bookCover) return null;
    const isUrl = bookCover.startsWith('http') || bookCover.startsWith('/') || bookCover.startsWith('data:');
    if (isUrl) {
      return {
        backgroundImage: `url(${bookCover})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
    }
    return {
      background: bookCover,
      backgroundColor: bookCover.startsWith('#') ? bookCover : 'transparent',
    };
  }, [bookCover]);

  const frontCoverStyle = useMemo(() => {
    return customCoverStyle || leftPageStyle;
  }, [customCoverStyle, leftPageStyle]);

  const handleFlip = (e: any) => {
    setActivePage(e.data);
  };

  const handleGoToDot = (dotIdx: number) => {
    if (bookRef.current && bookRef.current.pageFlip()) {
      if (dotIdx === 0) {
        bookRef.current.pageFlip().turnToPage(0);
      } else if (dotIdx === totalDots - 1) {
        bookRef.current.pageFlip().turnToPage(totalPages - 1);
      } else {
        const pageTargetIndex = bookPages.findIndex(
          (p) => p.type === 'chapter-cover' && p.chIdx === dotIdx - 1
        );
        if (pageTargetIndex !== -1) {
          bookRef.current.pageFlip().turnToPage(pageTargetIndex);
        }
      }
    }
  };

  const currentDotIndex = useMemo(() => {
    if (activePage === 0) return 0;
    if (activePage >= totalPages - 1) return totalDots - 1;
    const activePageData = bookPages[activePage];
    if (activePageData && activePageData.chIdx !== undefined) {
      return 1 + activePageData.chIdx;
    }
    return 0;
  }, [activePage, totalPages, totalDots, bookPages]);

  // Dynamically compute book stylesheet overrides
  const computedCss = useMemo(() => {
    let coverBgRule = 'background-color: #0a0a0f !important;';
    if (bookCover) {
      if (bookCover.startsWith('#')) {
        coverBgRule = `background-color: ${bookCover} !important;`;
      } else if (bookCover.startsWith('linear-gradient') || bookCover.startsWith('radial-gradient')) {
        coverBgRule = `background: ${bookCover} !important;`;
      } else if (bookCover.startsWith('http') || bookCover.startsWith('/') || bookCover.startsWith('data:')) {
        coverBgRule = `background-image: url(${bookCover}) !important; background-size: cover !important; background-position: center !important; background-repeat: no-repeat !important;`;
      } else {
        coverBgRule = `background: ${bookCover} !important;`;
      }
    }

    let leftBgRule = `background-color: #0a0a0f !important; background-image: radial-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px), radial-gradient(circle at 80% 50%, ${starColor}15 0%, #0a0a0f 100%) !important; background-size: 18px 18px, 100% 100% !important;`;
    let rightBgRule = `background-color: #09090e !important; background-image: radial-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px), radial-gradient(circle at 20% 50%, ${starColor}15 0%, #09090e 100%) !important; background-size: 18px 18px, 100% 100% !important;`;

    if (bookBackground) {
      if (bookBackground.startsWith('#')) {
        leftBgRule = `background-color: ${bookBackground} !important;`;
        rightBgRule = `background-color: ${bookBackground} !important;`;
      } else if (bookBackground.startsWith('linear-gradient') || bookBackground.startsWith('radial-gradient')) {
        leftBgRule = `background: ${bookBackground} !important;`;
        rightBgRule = `background: ${bookBackground} !important;`;
      } else if (bookBackground.startsWith('http') || bookBackground.startsWith('/') || bookBackground.startsWith('data:')) {
        leftBgRule = `background-image: radial-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px), url(${bookBackground}) !important; background-size: 18px 18px, cover !important; background-position: center !important; background-repeat: no-repeat !important;`;
        rightBgRule = `background-image: radial-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px), url(${bookBackground}) !important; background-size: 18px 18px, cover !important; background-position: center !important; background-repeat: no-repeat !important;`;
      } else {
        leftBgRule = `background: ${bookBackground} !important;`;
        rightBgRule = `background: ${bookBackground} !important;`;
      }
    }

    return `
      .cosmic-page-left {
        ${leftBgRule}
        opacity: 1 !important;
        border-top-left-radius: 16px !important;
        border-bottom-left-radius: 16px !important;
        border-top-right-radius: 0px !important;
        border-bottom-right-radius: 0px !important;
      }
      .cosmic-page-right {
        ${rightBgRule}
        opacity: 1 !important;
        border-top-right-radius: 16px !important;
        border-bottom-right-radius: 16px !important;
        border-top-left-radius: 0px !important;
        border-bottom-left-radius: 0px !important;
      }
      .cosmic-page-cover {
        ${coverBgRule}
        opacity: 1 !important;
        border-radius: 16px !important;
      }
      .stPageFlip, .page-flip, .stPageFlip > div {
        background-color: transparent !important;
      }
    `;
  }, [bookCover, bookBackground, starColor]);

  return (
    <div className="w-full flex flex-col items-center justify-between flex-1 min-h-0 relative">
      {/* Injected style block to force document-level opacity and background rules */}
      <style dangerouslySetInnerHTML={{ __html: computedCss }} />

      {/* Top spacing */}
      <div className="h-2 flex-shrink-0" />

      {/* Book Container wrapper (centering and stable aspect ratio layout constraints) */}
      <div className="flex-grow flex-shrink min-h-0 relative w-full flex items-center justify-center bg-transparent overflow-hidden max-h-[72vh] md:max-h-[76vh]">
        <div className="w-auto h-full aspect-[5/6] md:aspect-[5/3] max-h-full flex items-center justify-center relative">
          {/* Video Player beside closed book (unmounts when book is flipped open) */}
          {activePage === 0 && (
            <div className="absolute left-[100%] ml-4 md:ml-6 top-0 bottom-0 h-full aspect-[9/16] max-h-full rounded-2xl border border-white/10 overflow-hidden shadow-2xl bg-black flex items-center justify-center animate-fade-in z-20">
              <iframe
                src={getEmbedUrl(videoUrl)}
                title="YouTube video player"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          )}
        
        {/* HTMLFlipBook dynamic viewport */}
        <HTMLFlipBook
          width={500}
          height={600}
          size="stretch"
          minWidth={240}
          maxWidth={1200}
          minHeight={300}
          maxHeight={1000}
          drawShadow={true}
          showCover={true}
          useMouseEvents={true}
          showPageCorners={false}
          onFlip={handleFlip}
          ref={bookRef}
          className="cosmic-book"
        >
          {bookPages.map((page, idx) => {
            const isLeft = idx > 0 && idx % 2 !== 0;
            const currentStyle = isLeft ? leftPageStyle : rightPageStyle;
            const currentClass = isLeft
              ? 'cosmic-page-left border-r border-zinc-900/60'
              : 'cosmic-page-right border-l border-zinc-900/60';

            if (page.type === 'front') {
              return (
                <Page
                  key="front-cover"
                  customStyle={frontCoverStyle}
                  className="cosmic-page-cover border-r border-zinc-900/60 p-6 md:p-8 flex flex-col justify-center items-center text-center relative"
                >
                  {avatarUrl && (
                    <div 
                      className="w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden border-[3px] p-1 bg-zinc-950/80 mb-5 shadow-[0_0_25px_rgba(0,0,0,0.5)] flex-shrink-0"
                      style={{ borderColor: starColor, boxShadow: `0 0 20px ${starColor}44` }}
                    >
                      <img
                        src={avatarUrl}
                        alt={planetName}
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                          e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${planetId}`;
                        }}
                      />
                    </div>
                  )}
                  
                  <span 
                    className="inline-block px-3 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase mb-3 border font-mono"
                    style={{ 
                      borderColor: `${starColor}33`, 
                      backgroundColor: `${starColor}15`,
                      color: starColor 
                    }}
                  >
                    Hành tinh {parentStarName}
                  </span>

                  <h1 
                    className="text-xl md:text-3xl font-extrabold text-white tracking-wide leading-tight mb-2 font-display"
                    style={{ textShadow: `0 0 20px ${starColor}44` }}
                  >
                    {planetName}
                  </h1>

                  <p className="text-zinc-500 text-[8px] font-mono tracking-widest mt-1 uppercase">
                    [ Thư Tịch Cuộc Đời ]
                  </p>

                  <div className="w-16 h-[1.5px] mt-5 mb-4" style={{ backgroundColor: starColor, boxShadow: `0 0 8px ${starColor}` }} />

                  <p className="text-[9px] text-zinc-400 font-light max-w-xs leading-relaxed italic animate-pulse">
                    Vuốt góc trang hoặc dùng nút để lật sách
                  </p>

                  {/* Spine crease shadow */}
                  <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-r from-transparent to-zinc-950/45 pointer-events-none" />
                </Page>
              );
            }

            if (page.type === 'back') {
              return (
                <Page
                  key="book-back-cover"
                  customStyle={rightPageStyle}
                  className="cosmic-page-cover border-l border-zinc-900/60 p-6 md:p-8 flex flex-col justify-center items-center text-center relative"
                >
                  <div className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-600 mb-4 bg-zinc-900/20">
                    <BookOpen className="w-5 h-5 opacity-40" />
                  </div>
                  <p className="text-zinc-600 text-[9px] font-mono uppercase tracking-widest">
                    [ Kết Thúc Thư Tịch ]
                  </p>
                  <p className="text-[10px] text-zinc-500 font-light mt-3 max-w-[200px] leading-relaxed italic px-2">
                    "Tinh cầu lưu giữ hành trạng, vũ trụ chứng kiến anh danh."
                  </p>

                  {/* Spine crease shadow */}
                  <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-l from-transparent to-zinc-950/45 pointer-events-none" />
                </Page>
              );
            }

            if (page.type === 'chapter-cover') {
              const isQuiz = page.chType === 'quiz';
              const introText = isQuiz
                ? 'Thử thách nhỏ để ôn lại và ghi nhớ các mốc son chói lọi trong hành trình anh kiệt.'
                : page.chType === 'bio'
                  ? (page.pageContent
                      ? (typeof page.pageContent === 'string'
                          ? page.pageContent
                          : (page.pageContent[0] || '').replace(/<[^>]*>/g, ''))
                      : `Biên niên sử chương cuộc đời của vĩ nhân.`)
                  : 'Ghi chép về di sản lưu danh và các mốc son thành tựu chói lọi trong lịch sử đại diện.';
              const truncatedQuote = (introText || '').length > 130 ? (introText || '').slice(0, 130) + '...' : (introText || '');

              return (
                <Page
                  key={`chapter-cover-${page.chIdx}`}
                  customStyle={currentStyle}
                  className={`${currentClass} p-6 md:p-8 flex flex-col justify-center items-center text-center relative`}
                >
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1">Chương</span>
                  <span
                    className="text-5xl font-light font-serif tracking-widest block mb-4"
                    style={{ color: starColor, textShadow: `0 0 15px ${starColor}44` }}
                  >
                    {page.chNumeral}
                  </span>
                  <h2 className="text-base md:text-lg font-bold text-white font-display mb-4 tracking-wide leading-tight px-2">
                    {page.chTitle}
                  </h2>
                  <div className="w-16 h-[1.5px] my-2" style={{ backgroundColor: starColor, boxShadow: `0 0 8px ${starColor}` }} />
                  <p className="text-xs text-zinc-500 italic max-w-xs mt-3 relative leading-relaxed px-4 font-light">
                    "{truncatedQuote}"
                  </p>

                  {/* Dynamic Spine Crease shadow overlay */}
                  <div className={`absolute top-0 bottom-0 ${isLeft ? 'right-0 w-8 bg-gradient-to-r' : 'left-0 w-8 bg-gradient-to-l'} from-transparent to-zinc-950/45 pointer-events-none`} />
                </Page>
              );
            }

            // Chapter Content Pages
            if (page.chType === 'quiz') {
              const currentQuiz = quizzes[currentQuizIdx] || parsedQuiz;
              const correctStr = currentQuiz.correctAnswer;
              
              return (
                <Page
                  key={`quiz-page-${idx}`}
                  customStyle={currentStyle}
                  className={`${currentClass} p-6 md:p-8 flex flex-col justify-start relative`}
                >
                  <div className="flex-1 text-zinc-300 text-sm leading-relaxed font-light text-justify overflow-hidden pr-1">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-1.5 text-indigo-400 font-mono text-[10px] uppercase">
                        <Award className="w-3.5 h-3.5" />
                        <span>Ôn cố tri tân (Câu ${currentQuizIdx + 1}/${quizzes.length})</span>
                      </div>
                      
                      <h3 className="text-sm font-semibold text-white leading-relaxed text-justify">
                        {currentQuiz.question}
                      </h3>

                      <div className="flex flex-col gap-2.5 mt-4">
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
                              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs text-left transition duration-200 cursor-pointer disabled:cursor-default ${optStyle}`}
                            >
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Feedback block */}
                    <div className="h-20 flex flex-col justify-end mt-4">
                      {!quizSubmitted ? (
                        <button
                          type="button"
                          disabled={!quizSelectedOption}
                          onClick={() => {
                            const isCorrect = quizSelectedOption === correctStr;
                            if (isCorrect) setQuizScore(s => s + 1);
                            setQuizSubmitted(true);
                          }}
                          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold shadow-lg transition duration-200 cursor-pointer"
                        >
                          Xác nhận đáp án
                        </button>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <p className="text-[10px] font-medium text-center">
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
                              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[11px] font-semibold transition cursor-pointer shadow-md"
                            >
                              Câu tiếp theo →
                            </button>
                          ) : (
                            <div className="flex flex-col items-center gap-1.5 w-full">
                              <p className="text-[11px] text-zinc-300 font-semibold">
                                Kết quả: {quizScore + (quizSelectedOption === correctStr ? 1 : 0)}/{quizzes.length} câu đúng!
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  setCurrentQuizIdx(0);
                                  setQuizScore(0);
                                  setQuizSelectedOption(null);
                                  setQuizSubmitted(false);
                                }}
                                className="text-[9px] text-zinc-500 hover:text-white underline cursor-pointer transition"
                              >
                                Làm lại câu đố
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Crease shadow */}
                  <div className={`absolute top-0 bottom-0 ${isLeft ? 'right-0 w-8 bg-gradient-to-r' : 'left-0 w-8 bg-gradient-to-l'} from-transparent to-zinc-950/45 pointer-events-none`} />
                </Page>
              );
            }

            return (
              <Page
                key={`chapter-content-${page.chIdx}-${idx}`}
                customStyle={currentStyle}
                className={`${currentClass} p-6 md:p-8 flex flex-col justify-start relative`}
              >
                <div className="flex-1 text-zinc-300 text-sm leading-relaxed font-light text-justify overflow-hidden pr-1">
                  {page.chType === 'achievements' ? (
                    <div className="space-y-4 py-1">
                      {page.pageContent.map((ach: Achievement) => (
                        <div key={ach.id} className="relative group pl-5 border-l border-white/10 ml-2">
                          <span
                            className="absolute -left-[6px] top-1.5 w-2.5 h-2.5 rounded-full border bg-zinc-950 transition-all duration-300 group-hover:scale-125"
                            style={{
                              borderColor: starColor,
                              boxShadow: `0 0 8px ${starColor}`,
                            }}
                          />
                          <div className="bg-white/5 border border-white/5 rounded-xl p-3 hover:bg-white/10 transition duration-300">
                            <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                              <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                                {ach.title}
                              </h4>
                              {ach.year !== undefined && (
                                <span className="text-[9px] text-white/50 bg-white/5 px-1.5 py-0.2 rounded font-mono">
                                  {ach.year > 0 ? ach.year : `TCN ${Math.abs(ach.year)}`}
                                </span>
                              )}
                            </div>
                            {ach.description && (
                              <p className="text-[10px] text-zinc-400 leading-relaxed font-light mt-0.5">
                                {ach.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    page.pageContent.map((block: string, blockIdx: number) => {
                      if (/<[a-z][\s\S]*>/i.test(block)) {
                        return (
                          <div
                            key={blockIdx}
                            className="biography-content text-justify"
                            dangerouslySetInnerHTML={{ __html: block }}
                          />
                        );
                      }
                      return (
                        <p key={blockIdx} className="mb-4 text-justify font-light text-zinc-300">
                          {block.split('\n').map((line, lIdx) => (
                            <React.Fragment key={lIdx}>
                              {lIdx > 0 && <br />}
                              {line}
                            </React.Fragment>
                          ))}
                        </p>
                      );
                    })
                  )}
                </div>

                {/* Crease shadow */}
                <div className={`absolute top-0 bottom-0 ${isLeft ? 'right-0 w-8 bg-gradient-to-r' : 'left-0 w-8 bg-gradient-to-l'} from-transparent to-zinc-950/45 pointer-events-none`} />
              </Page>
            );
          })}
        </HTMLFlipBook>
      </div>
    </div>

      {/* Pagination Controls (Centered progress indicators) */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center mt-4 pt-3 border-t border-white/5 relative z-20 flex-shrink-0">
          {/* Progress Indicators */}
          <div className="flex gap-1.5">
            {Array.from({ length: totalDots }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleGoToDot(idx)}
                className="w-2 h-2 rounded-full transition-all duration-300 cursor-pointer"
                style={{
                  backgroundColor: idx === currentDotIndex ? starColor : 'rgba(255, 255, 255, 0.2)',
                  boxShadow: idx === currentDotIndex ? `0 0 8px ${starColor}` : 'none',
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanetBioReader;
