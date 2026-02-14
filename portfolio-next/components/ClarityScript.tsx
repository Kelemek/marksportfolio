"use client";

import { useEffect, useState } from "react";

export function ClarityScript() {
  const [mounted, setMounted] = useState(false);
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!clarityId || !mounted) {
    return null;
  }

  return (
    <>
      <script
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "${clarityId}");`,
        }}
      />
      <noscript>
        <img
          src={`https://www.clarity.ms/collect?cid=${clarityId}`}
          alt=""
        />
      </noscript>
    </>
  );
}
