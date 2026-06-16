export interface Star {
  id: string;
  name: string;
  color: string;
  position_x: number;
  position_y: number;
  icon?: string;
  created_at?: string;
}

export interface Planet {
  id: string;
  star_id: string;
  name: string;
  bio?: string;
  avatar_url?: string;
  orbit_radius: number;
  orbit_speed: number;
  planet_seed: number;
  planet_size: number;
  created_at?: string;
}

export interface Achievement {
  id: string;
  planet_id: string;
  title: string;
  description?: string;
  year?: number;
  category?: string;
}

export interface SearchResult {
  planet: Planet;
  star: Star;
  score?: number;
}
