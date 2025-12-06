import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import DeployResumeButton from "@/components/admin/DeployResumeButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-black">
      <nav className="admin-nav bg-border-light border-b border-border-light">
        <div className="max-w-container mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          {/* Top row: Admin title + (inline nav on sm+), deploy + sign out on right */}
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/admin" className="text-white font-heading text-xl">
                Admin
              </Link>

              {/* Inline nav for medium+ screens */}
              <div className="hidden sm:flex items-center gap-4 text-sm">
                <Link href="/admin" className="text-white-1 hover:text-pink transition-colors">Projects</Link>
                <Link href="/admin/skills" className="text-white-1 hover:text-pink transition-colors">Skills</Link>
                <Link href="/admin/certificates" className="text-white-1 hover:text-pink transition-colors">Certificates</Link>
                <Link href="/admin/jobs" className="text-white-1 hover:text-pink transition-colors">Jobs</Link>
                <Link href="/admin/settings" className="text-white-1 hover:text-pink transition-colors">Settings</Link>
                <span className="text-white-1">|</span>
                <a href="/" className="text-white-1 hover:text-pink transition-colors text-sm" target="_blank">Back →</a>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <DeployResumeButton />
              <form action="/auth/signout" method="POST">
                <button type="submit" className="text-pink hover:underline text-sm">Sign Out</button>
              </form>
            </div>
          </div>

          {/* Stacked nav for small screens (appears below top row) */}
          <div className="mt-3 sm:mt-0 flex flex-wrap items-center gap-4 text-sm sm:hidden">
            <Link href="/admin" className="text-white-1 hover:text-pink transition-colors">Projects</Link>
            <Link href="/admin/skills" className="text-white-1 hover:text-pink transition-colors">Skills</Link>
            <Link href="/admin/certificates" className="text-white-1 hover:text-pink transition-colors">Certificates</Link>
            <Link href="/admin/jobs" className="text-white-1 hover:text-pink transition-colors">Jobs</Link>
            <Link href="/admin/settings" className="text-white-1 hover:text-pink transition-colors">Settings</Link>
            <span className="text-white-1">|</span>
            <a href="/" className="text-white-1 hover:text-pink transition-colors text-sm" target="_blank">Back →</a>
          </div>
        </div>
      </nav>
      <main className="max-w-container mx-auto px-4 py-4">{children}</main>
    </div>
  );
}
