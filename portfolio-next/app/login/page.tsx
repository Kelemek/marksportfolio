"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({
        type: "success",
        text: "Check your email for the magic link!",
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-large font-heading text-white mb-4">
            Admin Login
          </h1>
          <p className="text-white-1">
            Enter your email to receive a magic link
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-white mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-border-light border border-border-light rounded-lg text-white placeholder-white-1 focus:outline-hidden focus:border-pink transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn w-full text-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Magic Link"}
          </button>
        </form>

        {message && (
          <div
            className={`mt-6 p-4 rounded-lg text-center ${
              message.type === "success"
                ? "bg-pink/20 text-pink border border-pink/50"
                : "bg-pink/20 text-pink border border-pink/50"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/" className="text-pink hover:underline">
            ← Back to Portfolio
          </Link>
        </div>
      </div>
    </div>
  );
}
