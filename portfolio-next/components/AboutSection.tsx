import Image from "next/image";

export default function AboutSection() {
  return (
    <section className="about" id="about">
      <div className="row">
        <h2 className="text-large mb-gutter-">About Me</h2>

        <div className="flex flex-col md:flex-row md:items-center md:gap-gutter-normal">
          {/* Photo */}
          <div className="md:w-[52%] mb-gutter-normal md:mb-0">
            <Image
              src="/images/self_portrait.webp"
              alt="My own self portrait drawn on iPad by me."
              width={800}
              height={800}
              className="about__photo w-full max-w-lg mx-auto md:max-w-none"
            />
          </div>

          {/* Text */}
          <div className="md:w-[48%] md:flex-shrink-0">
            <p className="mb-gutter-small">
              I am a systems engineer with over 29 years of experience who has
              transitioned into coding. I am currently located in Cambridge,
              Minnesota.
            </p>
            <p className="mb-gutter-small">
              I am also an ACBC certified Biblical counselor and enjoy drawing
              portraits on my iPad in my free time.
            </p>
            <a
              href="https://marklarsonresume.netlify.app"
              className="btn"
              target="_blank"
              rel="noopener noreferrer"
            >
              My Resumé
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
