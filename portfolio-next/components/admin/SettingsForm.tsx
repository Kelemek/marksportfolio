"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Settings, SettingsInsert, SettingsUpdate } from "@/types/settings";

interface SettingsFormProps {
  setting?: Settings;
  mode: "create" | "edit";
}

export default function SettingsForm({ setting, mode }: SettingsFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    key: setting?.key || "",
    value: setting?.value || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const settingsData: SettingsInsert | SettingsUpdate = {
        key: formData.key,
        value: formData.value,
      };

      if (mode === "create") {
        const { error } = await supabase.from("settings").insert(settingsData);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("settings")
          .update(settingsData)
          .eq("id", setting!.id);

        if (error) throw error;
      }

      // Trigger revalidation
      await fetch("/api/revalidate", { method: "POST" });

      router.push("/admin/settings");
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
        <label htmlFor="key" className="block text-white mb-2">
          Key *
        </label>
        <input
          id="key"
          type="text"
          required
          value={formData.key}
          onChange={(e) => setFormData({ ...formData, key: e.target.value })}
          className="w-full px-4 py-3 bg-border-light border border-border-light rounded-lg text-white focus:outline-none focus:border-pink"
          placeholder="e.g., site_title"
          disabled={mode === "edit"} // Key should not be changed in edit mode
        />
        {mode === "edit" && (
          <p className="text-white-1 text-sm mt-1">
            Key cannot be changed after creation
          </p>
        )}
      </div>

      <div>
        <label htmlFor="value" className="block text-white mb-2">
          Value *
        </label>
        <textarea
          id="value"
          required
          rows={4}
          value={formData.value}
          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
          className="w-full px-4 py-3 bg-border-light border border-border-light rounded-lg text-white focus:outline-none focus:border-pink resize-none"
          placeholder="Enter the setting value..."
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
            ? "Create Setting"
            : "Update Setting"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/settings")}
          className="px-6 py-3 border border-border-light rounded-lg text-white hover:border-pink transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
