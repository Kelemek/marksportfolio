export interface Skill {
  id: string;
  name: string;
  years: string;
  category: "systems" | "development";
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SkillInsert {
  name: string;
  years: string;
  category: "systems" | "development";
  sort_order?: number;
}

export interface SkillUpdate {
  name?: string;
  years?: string;
  category?: "systems" | "development";
  sort_order?: number;
}
