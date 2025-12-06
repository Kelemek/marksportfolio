export interface Certificate {
  id: string;
  title: string;
  institution: string;
  pdf_path: string | null;
  aria_label: string | null;
  category: "education" | "scrimba";
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CertificateInsert {
  title: string;
  institution: string;
  pdf_path?: string | null;
  aria_label?: string | null;
  category: "education" | "scrimba";
  sort_order?: number;
}

export interface CertificateUpdate {
  title?: string;
  institution?: string;
  pdf_path?: string | null;
  aria_label?: string | null;
  category?: "education" | "scrimba";
  sort_order?: number;
}
