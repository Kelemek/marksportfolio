"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Skill, SkillInsert, SkillUpdate } from "@/types/skill";

interface SkillFormProps {
  skill?: Skill;
  mode: "create" | "edit";
}

export default function SkillForm({ skill, mode }: SkillFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: skill?.name || "",
    years: skill?.years || "",
    category: skill?.category || "development",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const skillData: SkillInsert | SkillUpdate = {
        name: formData.name,
        years: formData.years,
        category: formData.category as "systems" | "development",
      };

      if (mode === "create") {
        // Get the minimum sort_order for this category and subtract 1
        const { data: minOrderData } = await supabase
          .from("skills")
          .select("sort_order")
          .eq("category", formData.category)
          .order("sort_order", { ascending: true })
          .limit(1)
          .single();

        const minOrder = minOrderData?.sort_order ?? 0;
        (skillData as SkillInsert).sort_order = minOrder - 1;

        const { error } = await supabase.from("skills").insert(skillData);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("skills")
          .update(skillData)
          .eq("id", skill!.id);

        if (error) throw error;
      }

      // Trigger revalidation
      await fetch("/api/revalidate", { method: "POST" });

      router.push("/admin/skills");
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
        <label htmlFor="name" className="block text-white mb-2">
          Skill Name *
        </label>
        <input
          id="name"
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 bg-border-light border border-border-light rounded-lg text-white focus:outline-hidden focus:border-pink"
          placeholder="e.g., JavaScript"
        />
      </div>

      <div>
        <label htmlFor="years" className="block text-white mb-2">
          Years of Experience *
        </label>
        <input
          id="years"
          type="text"
          required
          value={formData.years}
          onChange={(e) => setFormData({ ...formData, years: e.target.value })}
          className="w-full px-4 py-3 bg-border-light border border-border-light rounded-lg text-white focus:outline-hidden focus:border-pink"
          placeholder="e.g., 5+ years"
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
              setFormData({ ...formData, category: e.target.value as "systems" | "development" })
            }
            className="w-full h-[50px] px-4 bg-border-light border border-border-light rounded-lg text-white focus:outline-hidden focus:border-pink appearance-none cursor-pointer"
          >
            <option value="development">Development</option>
            <option value="systems">Systems</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="btn disabled:opacity-50"
        >
          {loading ? "Saving..." : mode === "create" ? "Create Skill" : "Update Skill"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/skills")}
          className="px-6 py-3 border border-border-light rounded-lg text-white hover:border-pink transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
