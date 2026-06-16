import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { MOCK_STARS } from '@/lib/mockData';
import { Star } from '@/lib/types';

export function useStars() {
  const [stars, setStars] = useState<Star[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStars() {
      if (!isSupabaseConfigured) {
        setStars(MOCK_STARS);
        setLoading(false);
        return;
      }

      try {
        const { data, error: dbError } = await supabase!
          .from('stars')
          .select('*')
          .order('created_at', { ascending: true });

        if (dbError) throw dbError;

        if (data && data.length > 0) {
          setStars(data);
        } else {
          // If connection succeeds but table is empty, fall back to mock data
          setStars(MOCK_STARS);
        }
      } catch (err: any) {
        console.warn('Supabase fetch stars error, falling back to mock data:', err.message);
        setError(err.message || 'Failed to fetch stars');
        setStars(MOCK_STARS);
      } finally {
        setLoading(false);
      }
    }

    fetchStars();
  }, []);

  return { stars, loading, error };
}
