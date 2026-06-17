'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import { useAudio } from '../providers/AudioProvider';

export const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { results, loading } = useSearch(query);
  const { playClick, playHover } = useAudio();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (planetId: string) => {
    playClick();
    setIsOpen(false);
    setQuery('');
    router.push(`/planet/${planetId}`);
  };

  return (
    <div ref={dropdownRef} className="relative w-full">
      <div className="relative flex items-center w-full bg-transparent hover:bg-white/5 border border-white/10 focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/10 rounded-xl backdrop-blur-md transition-all duration-300">
        <Search className="absolute left-3 w-3.5 h-3.5 text-zinc-500" />
        
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Tìm nhanh tinh cầu danh nhân..."
          className="w-full h-9 pl-9 pr-8 text-xs bg-transparent border-none outline-none text-white placeholder-zinc-500"
        />

        {query && (
          <button
            onClick={() => {
              setQuery('');
              playClick();
            }}
            className="absolute right-2.5 p-0.5 rounded-full hover:bg-white/10 text-zinc-500 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Dropdown results */}
      {isOpen && query.trim() !== '' && (
        <div className="absolute top-11 left-0 w-full max-h-80 overflow-y-auto bg-black/85 border border-white/10 rounded-2xl backdrop-blur-lg shadow-2xl transition-all duration-300 py-2 divide-y divide-white/5 scrollbar-thin scrollbar-thumb-white/10">
          {loading ? (
            <div className="flex items-center justify-center py-6 gap-2 text-sm text-white/40">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span>Đang quét vũ trụ...</span>
            </div>
          ) : results.length > 0 ? (
            results.map((result) => (
              <div
                key={result.planet.id}
                onClick={() => handleSelect(result.planet.id)}
                onMouseEnter={playHover}
                className="flex flex-col px-4 py-3 hover:bg-white/10 transition-colors duration-200 cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                    {result.planet.name}
                  </span>
                  
                  {/* Category Badge */}
                  <span 
                    className="flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full border"
                    style={{ 
                      borderColor: `${result.star.color}33`, 
                      backgroundColor: `${result.star.color}11`,
                      color: result.star.color 
                    }}
                  >
                    <span 
                      className="w-1.5 h-1.5 rounded-full" 
                      style={{ backgroundColor: result.star.color }}
                    />
                    {result.star.name}
                  </span>
                </div>
                
                {result.planet.bio && (
                  <p className="text-xs text-white/50 line-clamp-1 mt-1 font-light group-hover:text-white/70 transition-colors">
                    {result.planet.bio}
                  </p>
                )}

                {/* Match indicators */}
                {result.achievementTitles.length > 0 && (
                  <div className="flex gap-1 flex-wrap mt-1">
                    {result.achievementTitles.slice(0, 1).map((t, idx) => (
                      <span key={idx} className="text-[10px] text-white/30 italic line-clamp-1">
                        Thành tựu: {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-sm text-white/40">
              <span>Không tìm thấy thực thể nào</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default SearchBar;
