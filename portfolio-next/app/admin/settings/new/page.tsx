import SettingsForm from "@/components/admin/SettingsForm";
import Link from "next/link";

export default function NewSettingPage() {
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
      <h1 className="text-large font-heading text-white mb-6">
        Add New Setting
      </h1>
      <SettingsForm mode="create" />
    </div>
  );
}
