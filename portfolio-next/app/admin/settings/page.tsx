import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import DeleteForm from "@/components/admin/DeleteForm";
import type { Settings } from "@/types/settings";

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  const { data: settings, error } = await supabase
    .from("settings")
    .select("*")
    .order("key", { ascending: true });

  if (error) {
    return (
      <div className="text-red-400">
        Error loading settings: {error.message}
      </div>
    );
  }

  const allSettings = (settings || []) as Settings[];

  return (
    <div>
      <div className="flex items-center justify-between mb-4 admin-header">
        <h1 className="text-large font-heading text-white">Settings</h1>
        <Link href="/admin/settings/new" className="btn">
          + Add Setting
        </Link>
      </div>

      <section className="admin-section">
        <h2 className="text-medium-1 font-heading text-white mb-2">
          Configuration ({allSettings.length})
        </h2>
        <div className="bg-border-light rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-black/50">
              <tr>
                <th className="px-4 py-3 text-left text-white-1 font-normal">
                  Key
                </th>
                <th className="px-4 py-3 text-left text-white-1 font-normal">
                  Value
                </th>
                <th className="w-32 px-4 py-3 text-right text-white-1 font-normal">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {allSettings.map((setting) => (
                <tr
                  key={setting.id}
                  className="border-t border-black/30 bg-border-light"
                >
                  <td className="px-4 py-3">
                    <span className="text-white font-mono">{setting.key}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-white-1 truncate block max-w-md">
                      {typeof setting.value === "string" && setting.value.length > 100
                        ? `${setting.value.substring(0, 100)}...`
                        : (setting.value ?? "")}
                    </span>
                  </td>
                  <td className="w-32 px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/settings/${setting.id}/edit`}
                        className="text-pink hover:underline text-sm"
                      >
                        Edit
                      </Link>
                      <DeleteForm
                        action="/api/settings/delete"
                        id={setting.id}
                        label="Delete"
                        message={`Delete setting "${setting.key}"?`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {allSettings.length === 0 && (
                <tr className="border-t border-black/30">
                  <td
                    colSpan={3}
                    className="px-4 py-8 text-center text-white-1"
                  >
                    No settings found. Add your first setting above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
