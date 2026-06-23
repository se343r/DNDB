import { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Planet, Star } from '@/lib/types';

export interface SearchItem {
  planet: Planet;
  star: Star;
  achievementTitles: string[];
}

export function useSearch(query: string) {
  const [items, setItems] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    async function loadSearchData() {
      if (!isSupabaseConfigured) {
        setItems([]);
        setLoading(false);
        return;
      }

      try {
        const [planetsRes, starsRes, achRes] = await Promise.all([
          supabase!.from('planets').select('*'),
          supabase!.from('stars').select('*'),
          supabase!.from('achievements').select('planet_id, title')
        ]);

        const planets: Planet[] = planetsRes.data || [];
        const stars: Star[] = starsRes.data || [];
        const achievements = achRes.data || [];

        const joined = planets.map((p) => {
          const star = stars.find((s) => s.id === p.star_id) || stars[0];
          
          // Get achievement titles for searching
          const achs = achievements
            .filter((a) => a.planet_id === p.id)
            .map((a) => a.title);

          return { planet: p, star, achievementTitles: achs };
        });

        setItems(joined);
      } catch (err) {
        console.error('Supabase search loading error:', err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }

    loadSearchData();
  }, []);

  // Debounce query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  // Initialize Fuse.js
  const fuse = useMemo(() => {
    if (items.length === 0) return null;
    return new Fuse(items, {
      keys: [
        { name: 'planet.name', weight: 0.5 },
        { name: 'planet.bio', weight: 0.3 },
        { name: 'achievementTitles', weight: 0.2 }
      ],
      threshold: 0.45,
      includeScore: true
    });
  }, [items]);

  // Perform search
  const results = useMemo(() => {
    if (!debouncedQuery.trim() || !fuse) return [];
    return fuse.search(debouncedQuery).map((r) => r.item);
  }, [debouncedQuery, fuse]);

  return { results, loading };
}
