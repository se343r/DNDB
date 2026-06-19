import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { MOCK_PLANETS, MOCK_ACHIEVEMENTS } from '@/lib/mockData';
import { Planet, Achievement } from '@/lib/types';

export function usePlanets(starId?: string | null) {
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlanets() {
      if (!isSupabaseConfigured) {
        let filtered = MOCK_PLANETS;
        if (starId) {
          filtered = MOCK_PLANETS.filter((p) => p.star_id === starId);
        }
        setPlanets(filtered);
        setLoading(false);
        return;
      }

      try {
        let query = supabase!.from('planets').select('*');
        if (starId) {
          query = query.eq('star_id', starId);
        }

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Query timed out after 3.5s')), 3500)
        );

        const { data, error: dbError } = await Promise.race([query, timeoutPromise]) as any;
        if (dbError) throw dbError;

        if (data && data.length > 0) {
          setPlanets(data);
        } else {
          let filtered = MOCK_PLANETS;
          if (starId) {
            filtered = MOCK_PLANETS.filter((p) => p.star_id === starId);
          }
          setPlanets(filtered);
        }
      } catch (err: any) {
        console.warn('Supabase fetch planets error, falling back to mock data:', err.message);
        setError(err.message || 'Failed to fetch planets');
        let filtered = MOCK_PLANETS;
        if (starId) {
          filtered = MOCK_PLANETS.filter((p) => p.star_id === starId);
        }
        setPlanets(filtered);
      } finally {
        setLoading(false);
      }
    }

    fetchPlanets();
  }, [starId]);

  return { planets, loading, error };
}

export function usePlanetDetail(planetId: string) {
  const [planet, setPlanet] = useState<Planet | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlanetDetail() {
      if (!planetId) return;

      if (!isSupabaseConfigured) {
        const mockP = MOCK_PLANETS.find((p) => p.id === planetId) || null;
        const mockAch = MOCK_ACHIEVEMENTS.filter((a) => a.planet_id === planetId);
        setPlanet(mockP);
        setAchievements(mockAch);
        setLoading(false);
        return;
      }

      try {
        const pQuery = supabase!
          .from('planets')
          .select('*')
          .eq('id', planetId)
          .single();

        const achQuery = supabase!
          .from('achievements')
          .select('*')
          .eq('planet_id', planetId);

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Query timed out after 3.5s')), 3500)
        );

        const [pResult, achResult] = await Promise.race([
          Promise.all([pQuery, achQuery]),
          timeoutPromise
        ]) as any;

        const { data: pData, error: pError } = pResult;
        if (pError) throw pError;

        const { data: achData, error: achError } = achResult;
        if (achError) throw achError;

        setPlanet(pData);
        setAchievements(achData || []);
      } catch (err: any) {
        console.warn('Supabase fetch planet detail error, falling back to mock data:', err.message);
        setError(err.message || 'Failed to fetch planet details');
        const mockP = MOCK_PLANETS.find((p) => p.id === planetId) || null;
        const mockAch = MOCK_ACHIEVEMENTS.filter((a) => a.planet_id === planetId);
        setPlanet(mockP);
        setAchievements(mockAch);
      } finally {
        setLoading(false);
      }
    }

    fetchPlanetDetail();
  }, [planetId]);

  return { planet, achievements, loading, error };
}
