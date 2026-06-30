import type { Metadata } from "next";
import { Suspense } from "react";
import { PostHogPageView } from "@/components/PostHogPageView";
import { PostHogProvider } from "@/components/PostHogProvider";
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
      <head>
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <link
            rel="preconnect"
            href={process.env.NEXT_PUBLIC_SUPABASE_URL}
            crossOrigin="anonymous"
          />
        )}
        <link
          rel="preload"
          href="/fonts/HKGrotesk-Regular.woff"
          as="font"
          type="font/woff"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Jost-Regular.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
      </head>
      <body suppressHydrationWarning>
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
