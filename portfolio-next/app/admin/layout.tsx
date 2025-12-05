import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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
      <nav className="bg-border-light border-b border-border-light">
        <div className="max-w-container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="/admin" className="text-white font-heading text-xl">
              Admin Dashboard
            </a>
            <a
              href="/"
              className="text-white-1 hover:text-pink transition-colors"
              target="_blank"
            >
              View Site →
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white-1 text-sm">{user.email}</span>
            <form action="/auth/signout" method="POST">
              <button
                type="submit"
                className="text-pink hover:underline text-sm"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </nav>
      <main className="max-w-container mx-auto px-4 py-4">{children}</main>
    </div>
  );
}
