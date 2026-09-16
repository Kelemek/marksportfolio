"use client";

import Link from "next/link";
import DeleteForm from "./DeleteForm";
import SortableAdminTable from "./SortableAdminTable";
import type { Job } from "@/types/job";

interface SortableJobListProps {
  initialJobs: Job[];
}

export default function SortableJobList({ initialJobs }: SortableJobListProps) {
  async function handleReorder(jobIds: string[]) {
    const response = await fetch("/api/jobs/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobIds }),
    });

    if (!response.ok) {
      throw new Error("Failed to save order");
    }
  }

  return (
    <SortableAdminTable
      initialItems={initialJobs}
      onReorder={handleReorder}
      columns={[
        {
          header: "Title",
          cell: (job) => <span className="text-white">{job.title}</span>,
        },
        {
          header: "Company",
          cell: (job) => <span className="text-white-1">{job.company}</span>,
        },
        {
          header: "Period",
          headerClassName: "w-36 px-4 py-3 text-left text-white-1 font-normal",
          cellClassName: "w-36 px-4 py-3",
          cell: (job) => <span className="text-white-1">{job.period}</span>,
        },
        {
          header: "Actions",
          headerClassName: "w-32 px-4 py-3 text-right text-white-1 font-normal",
          cellClassName: "w-32 px-4 py-3 text-right",
          cell: (job) => (
            <div className="flex items-center justify-end gap-2">
              <Link
                href={`/admin/jobs/${job.id}/edit`}
                className="text-pink hover:underline text-sm"
              >
                Edit
              </Link>
              <DeleteForm
                action="/api/jobs/delete"
                id={job.id}
                message={`Delete "${job.title} at ${job.company}"?`}
              />
            </div>
          ),
        },
      ]}
    />
  );
}
