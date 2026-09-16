import { isAdminEmail } from "@/lib/auth/admin";
import { adminNavLinks } from "@/lib/admin/navLinks";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import DeployResumeButton from "@/components/admin/DeployResumeButton";

function AdminNavLinks({ className }: { className: string }) {
  return (
    <div className={className}>
      {adminNavLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-white-1 hover:text-pink transition-colors"
        >
          {link.label}
        </Link>
      ))}
      <span className="text-white-1">|</span>
      <a
        href="/"
        className="text-white-1 hover:text-pink transition-colors text-sm"
        target="_blank"
        rel="noreferrer"
      >
        Back →
      </a>
    </div>
  );
}

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

  if (!user.email || !isAdminEmail(user.email)) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-black">
      <nav className="admin-nav bg-border-light border-b border-border-light">
        <div className="max-w-container mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/admin" className="text-white font-heading text-xl">
                Admin
              </Link>
              <AdminNavLinks className="hidden sm:flex items-center gap-4 text-sm" />
            </div>

            <div className="flex items-center gap-4">
              <DeployResumeButton />
              <form action="/auth/signout" method="POST">
                <button type="submit" className="text-pink hover:underline text-sm">
                  Sign Out
                </button>
              </form>
            </div>
          </div>

          <AdminNavLinks className="mt-3 sm:mt-0 flex flex-wrap items-center gap-4 text-sm sm:hidden" />
        </div>
      </nav>
      <main className="max-w-container mx-auto px-4 py-4">{children}</main>
    </div>
  );
}
