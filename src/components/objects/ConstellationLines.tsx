'use client';

import React from 'react';
import { Line } from '@react-three/drei';
import { Star } from '@/lib/types';

interface ConstellationLinesProps {
  stars: Star[];
}

export const ConstellationLines: React.FC<ConstellationLinesProps> = ({ stars }) => {
  if (stars.length < 2) return null;

  // Map stars by ID for quick lookups
  const starMap = new Map(stars.map((s) => [s.id, s]));

  // The Big Dipper handle path
  const handleIds = [
    'a7777777-7777-7777-7777-777777777777', // Alkaid
    'a2222222-2222-2222-2222-222222222222', // Mizar
    'a5555555-5555-5555-5555-555555555555', // Alioth
    'a4444444-4444-4444-4444-444444444444'  // Megrez
  ];

  // The Big Dipper bowl path (closes back at Megrez)
  const bowlIds = [
    'a4444444-4444-4444-4444-444444444444', // Megrez
    'a8888888-8888-8888-8888-888888888888', // Phecda
    'a6666666-6666-6666-6666-666666666666', // Merak
    'a1111111-1111-1111-1111-111111111111', // Dubhe
    'a4444444-4444-4444-4444-444444444444'  // Megrez
  ];

  const handlePoints: [number, number, number][] = [];
  handleIds.forEach((id) => {
    const star = starMap.get(id);
    if (star) {
      handlePoints.push([star.position_x * 5.5, star.position_y * 3.5, 0]);
    }
  });

  const bowlPoints: [number, number, number][] = [];
  bowlIds.forEach((id) => {
    const star = starMap.get(id);
    if (star) {
      bowlPoints.push([star.position_x * 5.5, star.position_y * 3.5, 0]);
    }
  });

  const companionPoints: [number, number, number][] = [];
  const mizar = starMap.get('a2222222-2222-2222-2222-222222222222');
  const alcor = starMap.get('a3333333-3333-3333-3333-333333333333');
  if (mizar && alcor) {
    companionPoints.push([mizar.position_x * 5.5, mizar.position_y * 3.5, 0]);
    companionPoints.push([alcor.position_x * 5.5, alcor.position_y * 3.5, 0]);
  }

  // Fallback: If DB IDs are modified/different, connect stars sequentially by position_x
  const fallbackPoints: [number, number, number][] = [];
  if (handlePoints.length < 2 && bowlPoints.length < 2) {
    const sortedStars = [...stars].sort((a, b) => a.position_x - b.position_x);
    sortedStars.forEach((s) => {
      fallbackPoints.push([s.position_x * 5.5, s.position_y * 3.5, 0]);
    });
  }

  return (
    <group>
      {/* 1. Handle Connections (Dashed) */}
      {handlePoints.length >= 2 && (
        <>
          <Line
            points={handlePoints}
            color="#818cf8"
            lineWidth={1.2}
            dashed
            dashScale={1}
            dashSize={0.06}
            gapSize={0.04}
            transparent
            opacity={0.35}
          />
          <Line
            points={handlePoints}
            color="#ffffff"
            lineWidth={0.5}
            dashed
            dashScale={1}
            dashSize={0.06}
            gapSize={0.04}
            transparent
            opacity={0.2}
          />
        </>
      )}

      {/* 2. Bowl Connections (Solid) */}
      {bowlPoints.length >= 2 && (
        <>
          <Line
            points={bowlPoints}
            color="#818cf8"
            lineWidth={1.2}
            transparent
            opacity={0.25}
          />
          <Line
            points={bowlPoints}
            color="#ffffff"
            lineWidth={0.5}
            transparent
            opacity={0.15}
          />
        </>
      )}

      {/* 3. Mizar -> Alcor Companion Connection (Solid, thin, faint) */}
      {companionPoints.length >= 2 && (
        <Line
          points={companionPoints}
          color="#818cf8"
          lineWidth={0.8}
          transparent
          opacity={0.18}
        />
      )}

      {/* 4. Fallback sequential connection */}
      {fallbackPoints.length >= 2 && (
        <>
          <Line
            points={fallbackPoints}
            color="#818cf8"
            lineWidth={1.2}
            transparent
            opacity={0.25}
          />
          <Line
            points={fallbackPoints}
            color="#ffffff"
            lineWidth={0.5}
            transparent
            opacity={0.15}
          />
        </>
      )}
    </group>
  );
};

export default ConstellationLines;
