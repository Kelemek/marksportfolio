import Image from "next/image";
import { partnersSiteUrl } from "@/lib/romans8";

export default function AboutSection() {
  return (
    <section className="about" id="about">
      <div className="row">
        <h2 className="text-large mb-gutter-medium">About Me</h2>

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

          <div className="md:w-[48%] md:shrink-0">
            <p className="mb-gutter-small">
              I am a systems engineer with over 30 years of experience who has
              transitioned into coding. I am currently located in Cambridge,
              Minnesota.
            </p>
            <p className="mb-gutter-small">
              I am also an ACBC certified Biblical counselor and enjoy drawing
              portraits on my iPad in my free time.
            </p>
            <p className="mb-gutter-small">
              I coach local small businesses through my AI consulting practice,{" "}
              <a
                href={partnersSiteUrl}
                className="whitespace-nowrap text-white underline decoration-pink underline-offset-4 hover:text-pink"
                target="_blank"
                rel="noopener noreferrer"
              >
                Romans 8 Partners
              </a>
              , helping them save time with practical AI tools.
            </p>
            <a
              href="https://resume.romans8.net"
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
