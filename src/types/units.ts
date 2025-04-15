export interface UnitCost {
  Wood?: number;
  Food?: number;
  Gold?: number;
}

export interface Unit {
  id: number;
  name: string;
  description: string;
  expansion: string;
  age: "Dark" | "Feudal" | "Castle" | "Imperial";
  cost: UnitCost | null;
  build_time?: number;
  reload_time?: number;
  attack_delay?: number;
  movement_rate?: number;
  line_of_sight?: number;
  hit_points: number;
  range?: string | number;
  attack?: number;
  armor?: string;
  attack_bonus?: string[];
  accuracy?: string;
  search_radius?: number;
  blast_radius?: number;
  armor_bonus?: string[];
}

export interface UnitsData {
  units: Unit[];
}
