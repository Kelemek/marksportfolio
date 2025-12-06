"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import type { Job } from "@/types/job";

interface SortableJobListProps {
  initialJobs: Job[];
}

interface SortableRowProps {
  job: Job;
}

function SortableRow({ job }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="border-t border-black/30 bg-border-light"
    >
      <td className="w-12 px-2 py-3 text-white-1">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-2 hover:bg-white/10 rounded"
          title="Drag to reorder"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 4h12v1H2V4zm0 3.5h12v1H2v-1zm0 3.5h12v1H2v-1z" />
          </svg>
        </button>
      </td>
      <td className="px-4 py-3">
        <span className="text-white">{job.title}</span>
      </td>
      <td className="px-4 py-3">
        <span className="text-white-1">{job.company}</span>
      </td>
      <td className="w-36 px-4 py-3">
        <span className="text-white-1">{job.period}</span>
      </td>
      <td className="w-32 px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/admin/jobs/${job.id}/edit`}
            className="text-pink hover:underline text-sm"
          >
            Edit
          </Link>
          <form action="/api/jobs/delete" method="POST" className="inline">
            <input type="hidden" name="id" value={job.id} />
            <button
              type="submit"
              className="text-red-400 hover:underline text-sm"
              onClick={(e) => {
                if (!confirm(`Delete "${job.title} at ${job.company}"?`)) {
                  e.preventDefault();
                }
              }}
            >
              Delete
            </button>
          </form>
        </div>
      </td>
    </tr>
  );
}

export default function SortableJobList({ initialJobs }: SortableJobListProps) {
  const [jobs, setJobs] = useState(initialJobs);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = jobs.findIndex((j) => j.id === active.id);
      const newIndex = jobs.findIndex((j) => j.id === over.id);

      const newOrder = arrayMove(jobs, oldIndex, newIndex);
      setJobs(newOrder);

      // Save new order to database
      setSaving(true);
      try {
        const response = await fetch("/api/jobs/reorder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobIds: newOrder.map((j) => j.id),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save order");
        }
      } catch (error) {
        console.error("Error saving order:", error);
        // Revert on error
        setJobs(initialJobs);
      } finally {
        setSaving(false);
      }
    }
  }

  return (
    <div className="relative">
      {saving && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 rounded-lg">
          <span className="text-white">Saving...</span>
        </div>
      )}
      <div className="bg-border-light rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-black/50">
            <tr>
              <th className="w-12 px-2 py-3 text-left text-white-1 font-normal">
                <span className="sr-only">Drag</span>
              </th>
              <th className="px-4 py-3 text-left text-white-1 font-normal">
                Title
              </th>
              <th className="px-4 py-3 text-left text-white-1 font-normal">
                Company
              </th>
              <th className="w-36 px-4 py-3 text-left text-white-1 font-normal">
                Period
              </th>
              <th className="w-32 px-4 py-3 text-right text-white-1 font-normal">
                Actions
              </th>
            </tr>
          </thead>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={jobs.map((j) => j.id)}
              strategy={verticalListSortingStrategy}
            >
              <tbody>
                {jobs.map((job) => (
                  <SortableRow key={job.id} job={job} />
                ))}
              </tbody>
            </SortableContext>
          </DndContext>
        </table>
      </div>
    </div>
  );
}
