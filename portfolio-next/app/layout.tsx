import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ClarityScript } from "@/components/ClarityScript";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mark Larson | A Front-End Developer based in Cambridge Minnesota",
  description:
    "Portfolio of Mark Larson, a front-end developer and systems engineer based in Cambridge, Minnesota. Explore coding projects, digital drawings, and learn more about his experience in web development and biblical counseling.",
  keywords: [
    "Mark Larson",
    "Front-End Developer",
    "Systems Engineer",
    "Web Developer",
    "Cloud Architecture",
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Cambridge Minnesota",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        <Analytics />
        <SpeedInsights />
        <ClarityScript />
      </body>
    </html>
  );
}
