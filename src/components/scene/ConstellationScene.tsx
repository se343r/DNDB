'use client';

import React from 'react';
import { Star } from '../objects/Star';
import { ConstellationLines } from '../objects/ConstellationLines';
import { useStars } from '@/hooks/useStars';

export const ConstellationScene: React.FC = () => {
  const { stars, loading } = useStars();

  if (loading) return null;

  return (
    <group>
      {/* 1. Draw lines connecting the stars */}
      <ConstellationLines stars={stars} />

      {/* 2. Render individual stars */}
      {stars.map((star) => (
        <Star key={star.id} star={star} />
      ))}
    </group>
  );
};
export default ConstellationScene;
