"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Job, JobInsert, JobUpdate } from "@/types/job";

interface JobFormProps {
  job?: Job;
  mode: "create" | "edit";
}

export default function JobForm({ job, mode }: JobFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: job?.title || "",
    company: job?.company || "",
    location: job?.location || "",
    period: job?.period || "",
    achievements: job?.achievements || [""],
    responsibilities: job?.responsibilities || [""],
  });

  const addAchievement = () => {
    setFormData({
      ...formData,
      achievements: [...formData.achievements, ""],
    });
  };

  const removeAchievement = (index: number) => {
    setFormData({
      ...formData,
      achievements: formData.achievements.filter((_, i) => i !== index),
    });
  };

  const updateAchievement = (index: number, value: string) => {
    const newAchievements = [...formData.achievements];
    newAchievements[index] = value;
    setFormData({ ...formData, achievements: newAchievements });
  };

  const addResponsibility = () => {
    setFormData({
      ...formData,
      responsibilities: [...formData.responsibilities, ""],
    });
  };

  const removeResponsibility = (index: number) => {
    setFormData({
      ...formData,
      responsibilities: formData.responsibilities.filter((_, i) => i !== index),
    });
  };

  const updateResponsibility = (index: number, value: string) => {
    const newResponsibilities = [...formData.responsibilities];
    newResponsibilities[index] = value;
    setFormData({ ...formData, responsibilities: newResponsibilities });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const jobData: JobInsert | JobUpdate = {
        title: formData.title,
        company: formData.company,
        location: formData.location,
        period: formData.period,
        achievements: formData.achievements.filter((a) => a.trim() !== ""),
        responsibilities: formData.responsibilities.filter(
          (r) => r.trim() !== ""
        ),
      };

      if (mode === "create") {
        // Get the minimum sort_order and subtract 1
        const { data: minOrderData } = await supabase
          .from("jobs")
          .select("sort_order")
          .order("sort_order", { ascending: true })
          .limit(1)
          .single();

        const minOrder = minOrderData?.sort_order ?? 0;
        (jobData as JobInsert).sort_order = minOrder - 1;

        const { error } = await supabase.from("jobs").insert(jobData);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("jobs")
          .update(jobData)
          .eq("id", job!.id);

        if (error) throw error;
      }

      // Trigger revalidation
      await fetch("/api/revalidate", { method: "POST" });

      router.push("/admin/jobs");
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="title" className="block text-white mb-2">
            Job Title *
          </label>
          <input
            id="title"
            type="text"
            required
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full px-4 py-3 bg-border-light border border-border-light rounded-lg text-white focus:outline-none focus:border-pink"
            placeholder="e.g., Senior Developer"
          />
        </div>

        <div>
          <label htmlFor="company" className="block text-white mb-2">
            Company *
          </label>
          <input
            id="company"
            type="text"
            required
            value={formData.company}
            onChange={(e) =>
              setFormData({ ...formData, company: e.target.value })
            }
            className="w-full px-4 py-3 bg-border-light border border-border-light rounded-lg text-white focus:outline-none focus:border-pink"
            placeholder="e.g., Acme Corp"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="location" className="block text-white mb-2">
            Location *
          </label>
          <input
            id="location"
            type="text"
            required
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            className="w-full px-4 py-3 bg-border-light border border-border-light rounded-lg text-white focus:outline-none focus:border-pink"
            placeholder="e.g., New York, NY"
          />
        </div>

        <div>
          <label htmlFor="period" className="block text-white mb-2">
            Period *
          </label>
          <input
            id="period"
            type="text"
            required
            value={formData.period}
            onChange={(e) =>
              setFormData({ ...formData, period: e.target.value })
            }
            className="w-full px-4 py-3 bg-border-light border border-border-light rounded-lg text-white focus:outline-none focus:border-pink"
            placeholder="e.g., 2020 - Present"
          />
        </div>
      </div>

      {/* Achievements */}
      <div>
        <label className="block text-white mb-2">Achievements</label>
        <div className="space-y-2">
          {formData.achievements.map((achievement, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={achievement}
                onChange={(e) => updateAchievement(index, e.target.value)}
                className="flex-1 px-4 py-3 bg-border-light border border-border-light rounded-lg text-white focus:outline-none focus:border-pink"
                placeholder="Enter an achievement..."
              />
              <button
                type="button"
                onClick={() => removeAchievement(index)}
                className="px-3 py-2 text-red-400 hover:bg-red-900/30 rounded-lg"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addAchievement}
            className="text-pink hover:underline text-sm"
          >
            + Add Achievement
          </button>
        </div>
      </div>

      {/* Responsibilities */}
      <div>
        <label className="block text-white mb-2">Responsibilities</label>
        <div className="space-y-2">
          {formData.responsibilities.map((responsibility, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={responsibility}
                onChange={(e) => updateResponsibility(index, e.target.value)}
                className="flex-1 px-4 py-3 bg-border-light border border-border-light rounded-lg text-white focus:outline-none focus:border-pink"
                placeholder="Enter a responsibility..."
              />
              <button
                type="button"
                onClick={() => removeResponsibility(index)}
                className="px-3 py-2 text-red-400 hover:bg-red-900/30 rounded-lg"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addResponsibility}
            className="text-pink hover:underline text-sm"
          >
            + Add Responsibility
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="btn disabled:opacity-50"
        >
          {loading ? "Saving..." : mode === "create" ? "Create Job" : "Update Job"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/jobs")}
          className="px-6 py-3 border border-border-light rounded-lg text-white hover:border-pink transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
