import type { Metadata } from "next";
import localFont from "next/font/local";
import { Suspense } from "react";
import { PostHogPageView } from "@/components/PostHogPageView";
import { PostHogProvider } from "@/components/PostHogProvider";
import "./globals.css";

const hkGrotesk = localFont({
  src: "../public/fonts/HKGrotesk-Regular.woff",
  variable: "--font-body",
  display: "swap",
});

const jost = localFont({
  src: "../public/fonts/Jost-Regular.ttf",
  variable: "--font-jost",
  display: "swap",
});

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
  metadataBase: new URL("https://marklarsonportfolio.vercel.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${hkGrotesk.variable} ${jost.variable}`}>
      <body>
        <PostHogProvider>
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
