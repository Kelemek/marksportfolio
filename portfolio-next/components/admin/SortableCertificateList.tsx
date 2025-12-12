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
import type { Certificate } from "@/types/certificate";

// Construct full Supabase Storage URL from stored filename
function getFileUrl(filePath: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/certificates/${filePath}`;
}

interface SortableCertificateListProps {
  initialCertificates: Certificate[];
  category: "education" | "scrimba";
}

interface SortableRowProps {
  certificate: Certificate;
}

function SortableRow({ certificate }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: certificate.id });

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
      <td className="w-72 px-4 py-3">
        <span className="text-white">{certificate.title}</span>
      </td>
      <td className="w-72 px-4 py-3">
        <span className="text-white-1">{certificate.institution}</span>
      </td>
      <td className="w-24 px-4 py-3">
        {certificate.pdf_path ? (
          (() => {
            const path = certificate.pdf_path;
            const isImage = !!path.match(/\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i);
            const url = getFileUrl(path);
            if (isImage) {
              return (
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <img src={url} alt={certificate.title} className="w-24 h-auto rounded" />
                </a>
              );
            }
            return (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink hover:underline text-sm"
              >
                View
              </a>
            );
          })()
        ) : (
          <span className="text-white-1 text-sm">No file</span>
        )}
      </td>
      <td className="w-32 px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/admin/certificates/${certificate.id}/edit`}
            className="text-pink hover:underline text-sm"
          >
            Edit
          </Link>
          <form action="/api/certificates/delete" method="POST" className="inline">
            <input type="hidden" name="id" value={certificate.id} />
            <button
              type="submit"
              className="text-red-400 hover:underline text-sm"
              onClick={(e) => {
                if (!confirm(`Delete "${certificate.title}"?`)) {
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

export default function SortableCertificateList({
  initialCertificates,
  category,
}: SortableCertificateListProps) {
  const [certificates, setCertificates] = useState(initialCertificates);
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
      const oldIndex = certificates.findIndex((c) => c.id === active.id);
      const newIndex = certificates.findIndex((c) => c.id === over.id);

      const newOrder = arrayMove(certificates, oldIndex, newIndex);
      setCertificates(newOrder);

      // Save new order to database
      setSaving(true);
      try {
        const response = await fetch("/api/certificates/reorder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category,
            certificateIds: newOrder.map((c) => c.id),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save order");
        }
      } catch (error) {
        console.error("Error saving order:", error);
        // Revert on error
        setCertificates(initialCertificates);
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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={certificates.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="bg-border-light rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-black/50">
                <tr>
                  <th className="w-12 px-2 py-3 text-left text-white-1 font-normal">
                    <span className="sr-only">Drag</span>
                  </th>
                  <th className="w-72 px-4 py-3 text-left text-white-1 font-normal">
                    Title
                  </th>
                  <th className="w-72 px-4 py-3 text-left text-white-1 font-normal">
                    Institution
                  </th>
                  <th className="w-24 px-4 py-3 text-left text-white-1 font-normal">
                    File
                  </th>
                  <th className="w-32 px-4 py-3 text-right text-white-1 font-normal">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((certificate) => (
                  <SortableRow key={certificate.id} certificate={certificate} />
                ))}
              </tbody>
            </table>
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
