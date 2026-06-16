'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { Star } from '@/lib/types';
import * as THREE from 'three';

interface AnimatedConstellationLinesProps {
  stars: Star[];
  phase: number; // 0=hidden, 1=drawing, 2=full
  drawProgress: number; // 0..1 overall draw progress
}

// All star IDs in draw order (handle then bowl then companion)
const DRAW_ORDER = [
  'a7777777-7777-7777-7777-777777777777', // Alkaid
  'a2222222-2222-2222-2222-222222222222', // Mizar
  'a3333333-3333-3333-3333-333333333333', // Alcor (companion, branch off Mizar)
  'a5555555-5555-5555-5555-555555555555', // Alioth
  'a4444444-4444-4444-4444-444444444444', // Megrez
  'a8888888-8888-8888-8888-888888888888', // Phecda
  'a6666666-6666-6666-6666-666666666666', // Merak
  'a1111111-1111-1111-1111-111111111111', // Dubhe
];

// The segments to draw in order: [fromId, toId]
const SEGMENTS = [
  ['a7777777-7777-7777-7777-777777777777', 'a2222222-2222-2222-2222-222222222222'], // Alkaid -> Mizar
  ['a2222222-2222-2222-2222-222222222222', 'a3333333-3333-3333-3333-333333333333'], // Mizar -> Alcor
  ['a2222222-2222-2222-2222-222222222222', 'a5555555-5555-5555-5555-555555555555'], // Mizar -> Alioth
  ['a5555555-5555-5555-5555-555555555555', 'a4444444-4444-4444-4444-444444444444'], // Alioth -> Megrez
  ['a4444444-4444-4444-4444-444444444444', 'a8888888-8888-8888-8888-888888888888'], // Megrez -> Phecda
  ['a8888888-8888-8888-8888-888888888888', 'a6666666-6666-6666-6666-666666666666'], // Phecda -> Merak
  ['a6666666-6666-6666-6666-666666666666', 'a1111111-1111-1111-1111-111111111111'], // Merak -> Dubhe
  ['a1111111-1111-1111-1111-111111111111', 'a4444444-4444-4444-4444-444444444444'], // Dubhe -> Megrez (close bowl)
];

function getPos(star: Star): THREE.Vector3 {
  return new THREE.Vector3(star.position_x * 5.5, star.position_y * 3.5, 0);
}

export const AnimatedConstellationLines: React.FC<AnimatedConstellationLinesProps> = ({
  stars, phase, drawProgress
}) => {
  if (stars.length < 2) return null;
  const starMap = new Map(stars.map((s) => [s.id, s]));

  // How many segments are fully or partially visible
  const totalSegs = SEGMENTS.length;
  const segProgress = drawProgress * totalSegs; // e.g. 2.7 = 2 full + 0.7 of third

  const isBurst     = phase === 2;
  const lineOpacity = phase >= 3 ? 0.45 : isBurst ? 1.0 : 0.65;
  const lineWidth   = phase >= 3 ? 1.2  : isBurst ? 2.5 : 1.0;
  const glowWidth   = phase >= 3 ? 2.5  : isBurst ? 6.0 : 2.0;

  const renderedLines: JSX.Element[] = [];

  SEGMENTS.forEach(([fromId, toId], idx) => {
    const from = starMap.get(fromId);
    const to   = starMap.get(toId);
    if (!from || !to) return;

    const p0 = getPos(from);
    const p1 = getPos(to);

    // All segments draw simultaneously using the same drawProgress
    const segLocalProgress = drawProgress;
    if (segLocalProgress <= 0) return;

    const mid = new THREE.Vector3().lerpVectors(p0, p1, segLocalProgress);
    const pts: [number, number, number][] = [
      [p0.x, p0.y, 0],
      [mid.x, mid.y, 0],
    ];

    const isDashing = phase < 2;
    const isDrawingThisSeg = segLocalProgress > 0 && segLocalProgress < 1;

    renderedLines.push(
      <group key={`seg-${idx}`}>
        {/* Glow layer */}
        <Line
          points={pts}
          color={isDrawingThisSeg ? '#ffffff' : '#818cf8'}
          lineWidth={isDrawingThisSeg ? glowWidth : (phase >= 2 ? 2 : 3)}
          transparent
          opacity={isDrawingThisSeg ? 0.9 : (phase >= 2 ? 0.15 : 0.3)}
          dashed={isDashing && !isDrawingThisSeg}
          dashScale={1}
          dashSize={0.06}
          gapSize={0.04}
        />
        {/* Core layer */}
        <Line
          points={pts}
          color={isDrawingThisSeg ? '#e0e8ff' : '#ffffff'}
          lineWidth={isDrawingThisSeg ? lineWidth : (phase >= 2 ? 0.5 : 1)}
          transparent
          opacity={isDrawingThisSeg ? 1.0 : (phase >= 2 ? 0.2 : 0.45)}
          dashed={isDashing && !isDrawingThisSeg}
          dashScale={1}
          dashSize={0.06}
          gapSize={0.04}
        />
      </group>
    );
  });

  return <group>{renderedLines}</group>;
};

export default AnimatedConstellationLines;
