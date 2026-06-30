import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Star } from '@/lib/types';

export function useStars() {
  const [stars, setStars] = useState<Star[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStars() {
      if (!isSupabaseConfigured) {
        setError('Supabase is not configured');
        setStars([]);
        setLoading(false);
        return;
      }

      try {
        const queryPromise = supabase!
          .from('stars')
          .select('*')
          .order('created_at', { ascending: true });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Query timed out after 3.5s')), 3500)
        );

        const { data, error: dbError } = await Promise.race([queryPromise, timeoutPromise]) as any;

        if (dbError) throw dbError;

        if (data) {
          const processed = data.map((s: Star) => {
            if (s.id === 'a2222222-2222-2222-2222-222222222222') {
              // Nghệ thuật (Mizar) - shifted 25% away from midpoint
              return { ...s, position_x: -0.473, position_y: 0.255 };
            }
            if (s.id === 'a3333333-3333-3333-3333-333333333333') {
              // Khoa học (Alcor) - shifted 25% away from midpoint
              return { ...s, position_x: -0.425, position_y: 0.350 };
            }
            return s;
          });
          setStars(processed);
        }
      } catch (err: any) {
        console.error('Supabase fetch stars error:', err.message);
        setError(err.message || 'Failed to fetch stars');
        setStars([]);
      } finally {
        setLoading(false);
      }
    }

    fetchStars();
  }, []);

  return { stars, loading, error };
}
