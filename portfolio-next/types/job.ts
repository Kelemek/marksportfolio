export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  period: string;
  achievements: string[];
  responsibilities: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface JobInsert {
  title: string;
  company: string;
  location: string;
  period: string;
  achievements?: string[];
  responsibilities?: string[];
  sort_order?: number;
}

export interface JobUpdate {
  title?: string;
  company?: string;
  location?: string;
  period?: string;
  achievements?: string[];
  responsibilities?: string[];
  sort_order?: number;
}
