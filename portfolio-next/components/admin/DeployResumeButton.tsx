"use client";

import { useState } from "react";

export default function DeployResumeButton() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleDeploy = async () => {
    setLoading(true);
    setStatus("idle");

    try {
      const response = await fetch("/api/deploy-resume", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Deploy failed");
      }

      setStatus("success");
      setTimeout(() => setStatus("idle"), 5000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDeploy}
      disabled={loading}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        status === "success"
          ? "bg-green-600 text-white"
          : status === "error"
          ? "bg-red-600 text-white"
          : "bg-pink text-white hover:bg-pink/80"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading
        ? "Deploying..."
        : status === "success"
        ? "✓ Deploy Started!"
        : status === "error"
        ? "✗ Deploy Failed"
        : "Redeploy Resume"}
    </button>
  );
}
