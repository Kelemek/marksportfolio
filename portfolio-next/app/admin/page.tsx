import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import DeleteButton from "@/components/admin/DeleteButton";
import type { Project } from "@/types/project";

async function toggleVisibility(formData: FormData) {
  "use server";

  const id = formData.get("id") as string;
  const currentVisibility = formData.get("is_visible") === "true";
  const supabase = await createClient();

  await supabase
    .from("projects")
    .update({ is_visible: !currentVisibility })
    .eq("id", id);

  revalidatePath("/admin");
  revalidatePath("/");
}

export default async function AdminDashboard() {
  const supabase = await createClient();

  const { data: projects, error } = await supabase
    .from("projects")
    .select("*")
    .order("type", { ascending: true })
    .order("display_order", { ascending: true });

  if (error) {
    return (
      <div className="text-red-400">
        Error loading projects: {error.message}
      </div>
    );
  }

  const allProjects = (projects || []) as Project[];
  const codingProjects = allProjects.filter((p) => p.type === "coding");
  const drawingProjects = allProjects.filter((p) => p.type === "drawing");

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-large font-heading text-white">Projects</h1>
        <Link
          href="/admin/projects/new"
          className="btn"
        >
          + Add Project
        </Link>
      </div>

      {/* Coding Projects */}
      <section className="admin-section mb-6">
        <h2 className="text-medium-1 font-heading text-white mb-2">
          Coding Projects ({codingProjects.length})
        </h2>
        <div className="bg-border-light rounded-lg overflow-hidden">
          <table className="w-full table-fixed">
            <thead className="bg-black/50">
              <tr>
                <th className="w-20 px-4 py-3 text-left text-white-1 font-normal">
                  Order
                </th>
                <th className="px-4 py-3 text-left text-white-1 font-normal">
                  Title
                </th>
                <th className="w-24 px-4 py-3 text-left text-white-1 font-normal">
                  Status
                </th>
                <th className="w-32 px-4 py-3 text-right text-white-1 font-normal">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {codingProjects.map((project) => (
                <tr key={project.id} className="border-t border-black/30">
                  <td className="px-4 py-3 text-white-1">
                    {project.display_order}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <span className="text-white">{project.title}</span>
                      <span className="text-white-1 text-sm ml-2">
                        ({project.slug})
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <form action={toggleVisibility}>
                      <input type="hidden" name="id" value={project.id} />
                      <input
                        type="hidden"
                        name="is_visible"
                        value={String(project.is_visible)}
                      />
                      <button
                        type="submit"
                        className={`px-2 py-1 rounded text-sm ${
                          project.is_visible
                            ? "bg-green-900/50 text-green-300"
                            : "bg-red-900/50 text-red-300"
                        }`}
                      >
                        {project.is_visible ? "Visible" : "Hidden"}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/projects/${project.id}/edit`}
                        className="text-pink hover:underline text-sm"
                      >
                        Edit
                      </Link>
                      <DeleteButton projectId={project.id} projectTitle={project.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Drawing Projects */}
      <section className="admin-section">
        <h2 className="text-medium-1 font-heading text-white mb-2">
          Drawing Projects ({drawingProjects.length})
        </h2>
        <div className="bg-border-light rounded-lg overflow-hidden">
          <table className="w-full table-fixed">
            <thead className="bg-black/50">
              <tr>
                <th className="w-20 px-4 py-3 text-left text-white-1 font-normal">
                  Order
                </th>
                <th className="px-4 py-3 text-left text-white-1 font-normal">
                  Title
                </th>
                <th className="w-24 px-4 py-3 text-left text-white-1 font-normal">
                  Status
                </th>
                <th className="w-32 px-4 py-3 text-right text-white-1 font-normal">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {drawingProjects.map((project) => (
                <tr key={project.id} className="border-t border-black/30">
                  <td className="px-4 py-3 text-white-1">
                    {project.display_order}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <span className="text-white">{project.title}</span>
                      <span className="text-white-1 text-sm ml-2">
                        ({project.slug})
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <form action={toggleVisibility}>
                      <input type="hidden" name="id" value={project.id} />
                      <input
                        type="hidden"
                        name="is_visible"
                        value={String(project.is_visible)}
                      />
                      <button
                        type="submit"
                        className={`px-2 py-1 rounded text-sm ${
                          project.is_visible
                            ? "bg-green-900/50 text-green-300"
                            : "bg-red-900/50 text-red-300"
                        }`}
                      >
                        {project.is_visible ? "Visible" : "Hidden"}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/projects/${project.id}/edit`}
                        className="text-pink hover:underline text-sm"
                      >
                        Edit
                      </Link>
                      <DeleteButton projectId={project.id} projectTitle={project.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
