'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Planet, Achievement } from '@/lib/types';
import { Award, Calendar, Folder } from 'lucide-react';

interface PlanetInfoProps {
  planet: Planet;
  achievements: Achievement[];
  starColor: string;
}

export const PlanetInfo: React.FC<PlanetInfoProps> = ({ planet, achievements, starColor }) => {
  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 100,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', damping: 20, stiffness: 100 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full lg:w-[60%] xl:w-[50%] h-full overflow-y-auto px-6 py-10 lg:px-12 lg:py-16 bg-black/60 lg:bg-gradient-to-r lg:from-transparent lg:to-black/80 border-l border-white/5 backdrop-blur-md lg:backdrop-blur-none flex flex-col justify-start relative z-10 scrollbar-thin scrollbar-thumb-white/10"
    >
      {/* Bio Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center gap-6 mb-8 mt-12 lg:mt-0">
        {planet.avatar_url && (
          <div 
            className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 p-1.5 flex-shrink-0 bg-black/50 shadow-2xl"
            style={{ borderColor: starColor }}
          >
            <img
              src={planet.avatar_url}
              alt={planet.name}
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                // Fallback avatar if URL fails
                e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${planet.planet_seed}`;
              }}
            />
          </div>
        )}
        <div className="text-center md:text-left">
          <h1 
            className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white font-sans"
            style={{ textShadow: `0 0 20px ${starColor}44` }}
          >
            {planet.name}
          </h1>
          <div 
            className="inline-block mt-2 px-3 py-0.5 rounded-full border text-xs font-semibold uppercase tracking-wider"
            style={{ 
              borderColor: `${starColor}44`, 
              backgroundColor: `${starColor}15`,
              color: starColor 
            }}
          >
            Hành tinh hạt nhân
          </div>
        </div>
      </motion.div>

      {/* Bio Body */}
      <motion.div variants={itemVariants} className="mb-10">
        <h3 className="text-xs uppercase tracking-widest text-white/40 font-semibold mb-3 text-center md:text-left font-mono">Tiểu sử</h3>
        <div className="text-white/80 text-sm md:text-base leading-relaxed font-light">
          {planet.bio ? (
            /<[a-z][\s\S]*>/i.test(planet.bio) ? (
              <div 
                className="biography-content text-justify"
                dangerouslySetInnerHTML={{ __html: planet.bio }}
              />
            ) : (
              planet.bio.split(/\n\s*\n/).filter((p) => p.trim() !== '').map((para, idx) => (
                <p key={idx} className="indent-8 mb-4 text-justify">
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
            <p>Chưa có thông tin chi tiết về hành tinh này trong vũ trụ dữ liệu.</p>
          )}
        </div>
      </motion.div>

      {/* Achievements Timeline */}
      <motion.div variants={itemVariants} className="flex-1">
        <h3 className="text-xs uppercase tracking-widest text-white/40 font-semibold mb-6">Thành tựu & Dấu ấn</h3>
        
        {achievements.length > 0 ? (
          <div className="relative border-l border-white/10 pl-6 ml-3 space-y-8">
            {achievements.map((ach, index) => (
              <motion.div 
                key={ach.id} 
                variants={itemVariants}
                className="relative group"
              >
                {/* Timeline node */}
                <span 
                  className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 bg-black transition-all duration-300 group-hover:scale-125"
                  style={{ 
                    borderColor: starColor,
                    boxShadow: `0 0 10px ${starColor}`
                  }}
                />
                
                <div className="p-5 bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:bg-white/10 shadow-lg">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <h4 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {ach.title}
                    </h4>
                    
                    <div className="flex gap-2 text-xs">
                      {ach.year !== undefined && (
                        <span className="flex items-center gap-1 text-white/55 bg-white/5 px-2 py-0.5 rounded-md">
                          <Calendar className="w-3 h-3 text-indigo-400" />
                          {ach.year > 0 ? ach.year : `TCN ${Math.abs(ach.year)}`}
                        </span>
                      )}
                      
                      {ach.category && (
                        <span 
                          className="flex items-center gap-1 px-2.5 py-0.5 rounded-md border"
                          style={{ 
                            borderColor: `${starColor}33`, 
                            backgroundColor: `${starColor}11`,
                            color: starColor 
                          }}
                        >
                          <Folder className="w-3 h-3" />
                          {ach.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {ach.description && (
                    <p className="text-sm text-white/60 font-light leading-relaxed">
                      {ach.description}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 border border-white/5 rounded-2xl bg-white/5 text-white/40">
            <Award className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">Vũ trụ chưa ghi nhận thành tựu cụ thể nào của hành tinh này.</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
export default PlanetInfo;
