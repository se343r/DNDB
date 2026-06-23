'use client';

import { useEffect } from 'react';

/**
 * Gọi API ghi lại lượt xem planet — dùng làm input cho recommendation engine.
 * Im lặng bỏ qua nếu user chưa đăng nhập (server route tự xử lý), và
 * không chặn UI nếu request thất bại (best-effort, không phải tính năng cốt lõi).
 *
 * Dùng trong PlanetDetailPageClient.tsx:
 *   useTrackPlanetView(planetId);
 */
export function useTrackPlanetView(planetId: string | undefined | null) {
  useEffect(() => {
    if (!planetId) return;

    fetch('/api/recommendations/track-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planet_id: planetId }),
    }).catch(() => {
      // best-effort — không hiển thị lỗi cho user vì đây không phải tính năng chính
    });
  }, [planetId]);
}
