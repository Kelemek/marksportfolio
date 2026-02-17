import Image from "next/image";

export default function Header() {
  return (
    <header
      className="relative h-screen flex items-center overflow-hidden"
      role="banner"
      id="top"
    >
      <Image
        src="/images/header.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(rgba(0,0,0, .1), rgba(0,0,0, .4))",
        }}
        aria-hidden
      />
      <div className="row w-full relative z-[2]">
        <div className="max-w-container-medium">
          <h1 className="text-huge font-normal leading-none mb-6">
            <span>Mark Larson</span>
          </h1>
          <p className="text-medium font-heading mb-14">
            A Front-End Developer coding{" "}
            <span lang="la">soli Deo gloria</span> based in Cambridge,
            Minnesota.
          </p>
          <a href="#contact" className="btn">
            Get in touch
          </a>
        </div>
      </div>
    </header>
  );
}
