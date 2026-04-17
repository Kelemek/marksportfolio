import Script from "next/script";

export function ClarityScript() {
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;
  if (!clarityId) {
    return null;
  }

  const inline = `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "${clarityId}");`;

  return (
    <>
      <Script id="microsoft-clarity" strategy="afterInteractive">
        {inline}
      </Script>
      <noscript>
        <img
          src={`https://www.clarity.ms/collect?cid=${clarityId}`}
          alt=""
        />
      </noscript>
    </>
  );
}
