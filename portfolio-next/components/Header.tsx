import Link from "next/link";

export default function Header() {
  return (
    <header
      className="relative h-screen bg-cover bg-center bg-fixed flex items-center"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0, .1), rgba(0,0,0, .4)), url('/images/header.webp')",
      }}
      role="banner"
      id="top"
    >
      <div className="row w-full">
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
