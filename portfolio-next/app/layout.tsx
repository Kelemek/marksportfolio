import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
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
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
        {process.env.NEXT_PUBLIC_CLARITY_ID && (
          <>
            <script
              dangerouslySetInnerHTML={{
                __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_ID}");`,
              }}
            />
            <noscript>
              <img
                src={`https://www.clarity.ms/collect?cid=${process.env.NEXT_PUBLIC_CLARITY_ID}`}
                alt=""
              />
            </noscript>
          </>
        )}
      </body>
    </html>
  );
}
