import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import SortableJobList from "@/components/admin/SortableJobList";
import type { Job } from "@/types/job";

export default async function AdminJobsPage() {
  const supabase = await createClient();

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    return (
      <div className="text-red-400">Error loading jobs: {error.message}</div>
    );
  }

  const allJobs = (jobs || []) as Job[];

  return (
    <div>
      <div className="flex items-center justify-between mb-4 admin-header">
        <h1 className="text-large font-heading text-white">Jobs</h1>
        <Link href="/admin/jobs/new" className="btn">
          + Add Job
        </Link>
      </div>

      <section className="admin-section">
        <h2 className="text-medium-1 font-heading text-white mb-2">
          Work Experience ({allJobs.length})
        </h2>
        <p className="text-white-1 text-sm mb-3">Drag rows to reorder</p>
        <SortableJobList initialJobs={allJobs} />
      </section>
    </div>
  );
}
