"use client";

import { PostHogProvider as PHProvider } from "@posthog/react";
import posthog from "posthog-js";
import { useEffect } from "react";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  const host =
    process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

  useEffect(() => {
    if (!token) {
      return;
    }

    posthog.init(token, {
      api_host: host,
      defaults: "2026-05-30",
      capture_pageview: false,
      loaded: (client) => {
        if (process.env.NODE_ENV === "development") {
          client.debug();
        }
      },
    });
  }, [token, host]);

  if (!token) {
    return children;
  }

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
