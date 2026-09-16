"use client";

import Link from "next/link";
import { getCertificatePublicUrl } from "@/lib/certificates";
import DeleteForm from "./DeleteForm";
import SortableAdminTable from "./SortableAdminTable";
import type { Certificate } from "@/types/certificate";

interface SortableCertificateListProps {
  initialCertificates: Certificate[];
  category: "education" | "scrimba";
}

function CertificateFileCell({ certificate }: { certificate: Certificate }) {
  if (!certificate.pdf_path) {
    return <span className="text-white-1 text-sm">No file</span>;
  }

  const path = certificate.pdf_path;
  const isImage = /\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i.test(path);
  const url = getCertificatePublicUrl(path);

  if (isImage) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        <img
          src={url}
          alt={certificate.title}
          className="w-24 h-auto rounded-sm"
        />
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
}

export default function SortableCertificateList({
  initialCertificates,
  category,
}: SortableCertificateListProps) {
  async function handleReorder(certificateIds: string[]) {
    const response = await fetch("/api/certificates/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, certificateIds }),
    });

    if (!response.ok) {
      throw new Error("Failed to save order");
    }
  }

  return (
    <SortableAdminTable
      initialItems={initialCertificates}
      onReorder={handleReorder}
      columns={[
        {
          header: "Title",
          headerClassName: "w-72 px-4 py-3 text-left text-white-1 font-normal",
          cellClassName: "w-72 px-4 py-3",
          cell: (certificate) => (
            <span className="text-white">{certificate.title}</span>
          ),
        },
        {
          header: "Institution",
          headerClassName: "w-72 px-4 py-3 text-left text-white-1 font-normal",
          cellClassName: "w-72 px-4 py-3",
          cell: (certificate) => (
            <span className="text-white-1">{certificate.institution}</span>
          ),
        },
        {
          header: "File",
          headerClassName: "w-24 px-4 py-3 text-left text-white-1 font-normal",
          cellClassName: "w-24 px-4 py-3",
          cell: (certificate) => (
            <CertificateFileCell certificate={certificate} />
          ),
        },
        {
          header: "Actions",
          headerClassName: "w-32 px-4 py-3 text-right text-white-1 font-normal",
          cellClassName: "w-32 px-4 py-3 text-right",
          cell: (certificate) => (
            <div className="flex items-center justify-end gap-2">
              <Link
                href={`/admin/certificates/${certificate.id}/edit`}
                className="text-pink hover:underline text-sm"
              >
                Edit
              </Link>
              <DeleteForm
                action="/api/certificates/delete"
                id={certificate.id}
                message={`Delete "${certificate.title}"?`}
              />
            </div>
          ),
        },
      ]}
    />
  );
}
