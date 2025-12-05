"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Project, ProjectInsert, ProjectUpdate } from "@/types/project";

interface ProjectFormProps {
  project?: Project;
  mode: "create" | "edit";
}

export default function ProjectForm({ project, mode }: ProjectFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    project?.image_url || null
  );

  const [formData, setFormData] = useState({
    slug: project?.slug || "",
    title: project?.title || "",
    description: project?.description || "",
    technologies: project?.technologies?.join(", ") || "",
    site_url: project?.site_url || "",
    github_url: project?.github_url || "",
    image_alt: project?.image_alt || "",
    type: project?.type || "coding",
    display_order: project?.display_order || 0,
    is_visible: project?.is_visible ?? true,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${formData.slug}-${Date.now()}.${fileExt}`;
    const filePath = `projects/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(`Image upload failed: ${uploadError.message}`);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("images").getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let imageUrl = project?.image_url || null;

      // Upload new image if selected
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const projectData: ProjectInsert | ProjectUpdate = {
        slug: formData.slug,
        title: formData.title,
        description: formData.description || null,
        technologies: formData.technologies
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        site_url: formData.site_url || null,
        github_url: formData.github_url || null,
        image_url: imageUrl,
        image_alt: formData.image_alt || null,
        type: formData.type as "coding" | "drawing",
        display_order: formData.display_order,
        is_visible: formData.is_visible,
      };

      if (mode === "create") {
        const { error } = await supabase
          .from("projects")
          .insert(projectData);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("projects")
          .update(projectData)
          .eq("id", project!.id);

        if (error) throw error;
      }

      // Trigger revalidation
      await fetch("/api/revalidate", { method: "POST" });

      router.push("/admin");
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
            Title *
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
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-white mb-2">
            Slug *
          </label>
          <input
            id="slug"
            type="text"
            required
            value={formData.slug}
            onChange={(e) =>
              setFormData({
                ...formData,
                slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
              })
            }
            className="w-full px-4 py-3 bg-border-light border border-border-light rounded-lg text-white focus:outline-none focus:border-pink"
            placeholder="my-project-name"
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-white mb-2">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="w-full px-4 py-3 bg-border-light border border-border-light rounded-lg text-white focus:outline-none focus:border-pink resize-none"
        />
      </div>

      <div>
        <label htmlFor="technologies" className="block text-white mb-2">
          Technologies (comma-separated)
        </label>
        <input
          id="technologies"
          type="text"
          value={formData.technologies}
          onChange={(e) =>
            setFormData({ ...formData, technologies: e.target.value })
          }
          className="w-full px-4 py-3 bg-border-light border border-border-light rounded-lg text-white focus:outline-none focus:border-pink"
          placeholder="React, TypeScript, Tailwind CSS"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="site_url" className="block text-white mb-2">
            Site URL
          </label>
          <input
            id="site_url"
            type="url"
            value={formData.site_url}
            onChange={(e) =>
              setFormData({ ...formData, site_url: e.target.value })
            }
            className="w-full px-4 py-3 bg-border-light border border-border-light rounded-lg text-white focus:outline-none focus:border-pink"
            placeholder="https://example.com"
          />
        </div>

        <div>
          <label htmlFor="github_url" className="block text-white mb-2">
            GitHub URL
          </label>
          <input
            id="github_url"
            type="url"
            value={formData.github_url}
            onChange={(e) =>
              setFormData({ ...formData, github_url: e.target.value })
            }
            className="w-full px-4 py-3 bg-border-light border border-border-light rounded-lg text-white focus:outline-none focus:border-pink"
            placeholder="https://github.com/user/repo"
          />
        </div>
      </div>

      <div>
        <label className="block text-white mb-2">Project Image</label>
        <div className="flex items-start gap-4">
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="w-32 h-20 object-cover rounded-lg"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="flex-1 px-4 py-3 bg-border-light border border-border-light rounded-lg text-white focus:outline-none focus:border-pink file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-pink file:text-white file:cursor-pointer"
          />
        </div>
      </div>

      <div>
        <label htmlFor="image_alt" className="block text-white mb-2">
          Image Alt Text
        </label>
        <input
          id="image_alt"
          type="text"
          value={formData.image_alt}
          onChange={(e) =>
            setFormData({ ...formData, image_alt: e.target.value })
          }
          className="w-full px-4 py-3 bg-border-light border border-border-light rounded-lg text-white focus:outline-none focus:border-pink"
          placeholder="Description of the image"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="type" className="block text-white mb-2">
            Type *
          </label>
          <div className="relative">
            <select
              id="type"
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as "coding" | "drawing",
                })
              }
              className="w-full h-[50px] px-4 bg-border-light border border-border-light rounded-lg text-white focus:outline-none focus:border-pink appearance-none cursor-pointer"
            >
              <option value="coding">Coding</option>
              <option value="drawing">Drawing</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="display_order" className="block text-white mb-2">
            Display Order
          </label>
          <div className="relative">
            <input
              id="display_order"
              type="number"
              min="0"
              value={formData.display_order}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  display_order: parseInt(e.target.value) || 0,
                })
              }
              className="w-full h-[50px] px-4 pr-10 bg-border-light border border-border-light rounded-lg text-white focus:outline-none focus:border-pink [&::-webkit-inner-spin-button]:opacity-0 [&::-webkit-outer-spin-button]:opacity-0"
            />
            <div className="absolute inset-y-0 right-0 flex flex-col justify-center pr-3 gap-1">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, display_order: formData.display_order + 1 })}
                className="text-white hover:text-pink"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, display_order: Math.max(0, formData.display_order - 1) })}
                className="text-white hover:text-pink"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_visible}
              onChange={(e) =>
                setFormData({ ...formData, is_visible: e.target.checked })
              }
              className="w-5 h-5 rounded border-border-light bg-border-light text-pink focus:ring-pink"
            />
            <span className="text-white">Visible</span>
          </label>
        </div>
      </div>

      <div className="flex items-center gap-4 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="btn bg-pink border-pink hover:bg-transparent disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : mode === "create"
            ? "Create Project"
            : "Update Project"}
        </button>
        <a href="/admin" className="text-white-1 hover:text-white">
          Cancel
        </a>
      </div>
    </form>
  );
}
