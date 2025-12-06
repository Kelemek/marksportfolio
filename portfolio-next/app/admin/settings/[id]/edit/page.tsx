import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import SettingsForm from "@/components/admin/SettingsForm";
import Link from "next/link";
import type { Settings } from "@/types/settings";

interface EditSettingPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSettingPage({
  params,
}: EditSettingPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: setting, error } = await supabase
    .from("settings")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !setting) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/settings"
          className="text-pink hover:underline text-sm"
        >
          ← Back to Settings
        </Link>
      </div>
      <h1 className="text-large font-heading text-white mb-6">Edit Setting</h1>
      <SettingsForm setting={setting as Settings} mode="edit" />
    </div>
  );
}
