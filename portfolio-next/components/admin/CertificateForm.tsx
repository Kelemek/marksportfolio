"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type {
  Certificate,
  CertificateInsert,
  CertificateUpdate,
} from "@/types/certificate";

interface CertificateFormProps {
  certificate?: Certificate;
  mode: "create" | "edit";
}

export default function CertificateForm({
  certificate,
  mode,
}: CertificateFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: certificate?.title || "",
    institution: certificate?.institution || "",
    aria_label: certificate?.aria_label || "",
    category: certificate?.category || "education",
  });

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPdfFile(file);
    }
  };

  const uploadPdf = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    // Sanitize filename similar to resume project
    const sanitizedTitle = formData.title
      .replace(/\|/g, "-")
      .replace(/:/g, "-")
      .replace(/\?/g, "")
      .replace(/"/g, "")
      .replace(/</g, "")
      .replace(/>/g, "")
      .replace(/\*/g, "")
      .replace(/–/g, "-")
      .replace(/—/g, "-")
      .replace(/'/g, "")
      .replace(/'/g, "")
      .replace(/\s+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");
    const fileName = `${sanitizedTitle}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("certificates")
      .upload(fileName, file, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`PDF upload failed: ${uploadError.message}`);
    }

    // Return just the filename - the full URL is constructed when displaying
    return fileName;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let pdfPath = certificate?.pdf_path || null;

      // Upload new PDF if selected
      if (pdfFile) {
        pdfPath = await uploadPdf(pdfFile);
      }

      const certificateData: CertificateInsert | CertificateUpdate = {
        title: formData.title,
        institution: formData.institution,
        pdf_path: pdfPath,
        aria_label: formData.aria_label || null,
        category: formData.category as "education" | "scrimba",
      };

      if (mode === "create") {
        // Get the minimum sort_order for this category and subtract 1
        const { data: minOrderData } = await supabase
          .from("certificates")
          .select("sort_order")
          .eq("category", formData.category)
          .order("sort_order", { ascending: true })
          .limit(1)
          .single();

        const minOrder = minOrderData?.sort_order ?? 0;
        (certificateData as CertificateInsert).sort_order = minOrder - 1;

        const { error } = await supabase
          .from("certificates")
          .insert(certificateData);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("certificates")
          .update(certificateData)
          .eq("id", certificate!.id);

        if (error) throw error;
      }

      // Trigger revalidation
      await fetch("/api/revalidate", { method: "POST" });

      router.push("/admin/certificates");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="p-4 bg-red-900/50 text-red-300 rounded-lg">{error}</div>
      )}

      <div>
        <label htmlFor="title" className="block text-white mb-2">
          Title *
        </label>
        <input
          id="title"
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-3 bg-border-light border border-border-light rounded-lg text-white focus:outline-none focus:border-pink"
          placeholder="e.g., Bachelor of Science"
        />
      </div>

      <div>
        <label htmlFor="institution" className="block text-white mb-2">
          Institution *
        </label>
        <input
          id="institution"
          type="text"
          required
          value={formData.institution}
          onChange={(e) =>
            setFormData({ ...formData, institution: e.target.value })
          }
          className="w-full px-4 py-3 bg-border-light border border-border-light rounded-lg text-white focus:outline-none focus:border-pink"
          placeholder="e.g., University of Example"
        />
      </div>

      <div>
        <label htmlFor="aria_label" className="block text-white mb-2">
          Aria Label
        </label>
        <input
          id="aria_label"
          type="text"
          value={formData.aria_label}
          onChange={(e) =>
            setFormData({ ...formData, aria_label: e.target.value })
          }
          className="w-full px-4 py-3 bg-border-light border border-border-light rounded-lg text-white focus:outline-none focus:border-pink"
          placeholder="Accessible description for screen readers"
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-white mb-2">
          Category *
        </label>
        <div className="relative">
          <select
            id="category"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value as "education" | "scrimba" })
            }
            className="w-full h-[50px] px-4 bg-border-light border border-border-light rounded-lg text-white focus:outline-none focus:border-pink appearance-none cursor-pointer"
          >
            <option value="education">Education</option>
            <option value="scrimba">Scrimba</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-white mb-2">Certificate PDF</label>
        {certificate?.pdf_path && (
          <p className="text-white-1 text-sm mb-2">
            Current:{" "}
            <a
              href={certificate.pdf_path}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink hover:underline"
            >
              View PDF
            </a>
          </p>
        )}
        <input
          type="file"
          accept=".pdf"
          onChange={handlePdfChange}
          className="w-full px-4 py-3 bg-border-light border border-border-light rounded-lg text-white focus:outline-none focus:border-pink file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-pink file:text-white file:cursor-pointer"
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="btn disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : mode === "create"
            ? "Create Certificate"
            : "Update Certificate"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/certificates")}
          className="px-6 py-3 border border-border-light rounded-lg text-white hover:border-pink transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
