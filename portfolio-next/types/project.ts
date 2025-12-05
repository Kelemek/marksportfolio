export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  technologies: string[];
  site_url: string | null;
  github_url: string | null;
  image_url: string | null;
  image_alt: string | null;
  type: "coding" | "drawing";
  display_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectInsert {
  slug: string;
  title: string;
  description?: string | null;
  technologies?: string[];
  site_url?: string | null;
  github_url?: string | null;
  image_url?: string | null;
  image_alt?: string | null;
  type: "coding" | "drawing";
  display_order?: number;
  is_visible?: boolean;
}

export interface ProjectUpdate {
  slug?: string;
  title?: string;
  description?: string | null;
  technologies?: string[];
  site_url?: string | null;
  github_url?: string | null;
  image_url?: string | null;
  image_alt?: string | null;
  type?: "coding" | "drawing";
  display_order?: number;
  is_visible?: boolean;
}

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: Project;
        Insert: ProjectInsert;
        Update: ProjectUpdate;
      };
    };
  };
};
