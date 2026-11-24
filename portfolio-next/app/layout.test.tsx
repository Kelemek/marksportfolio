import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/font/local", () => ({
  default: () => ({ variable: "--font-test" }),
}));

vi.mock("@/components/PostHogPageView", () => ({
  PostHogPageView: () => null,
}));

vi.mock("@/components/PostHogProvider", () => ({
  PostHogProvider: ({ children }: { children: ReactNode }) => children,
}));

import { metadata } from "./layout";

describe("site metadata", () => {
  it("sets metadataBase to portfolio.romans8.net", () => {
    expect(metadata.metadataBase?.toString()).toBe("https://portfolio.romans8.net/");
  });
});
