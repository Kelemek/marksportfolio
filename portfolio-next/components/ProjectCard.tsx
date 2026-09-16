import Image from "next/image";
import Link from "next/link";
import { parseTechnologies } from "@/lib/parseTechnologies";
import type { Project } from "@/types/project";

interface ProjectCardProps {
  project: Project;
  variant?: "coding" | "drawing";
}

export default function ProjectCard({
  project,
  variant = project.type,
}: ProjectCardProps) {
  const isCoding = variant === "coding";
  const techs = parseTechnologies(project.technologies);
  const showIframe = isCoding && project.site_url;
  const showImage = !showIframe && project.image_url;

  return (
    <article className="flex flex-col-reverse md:flex-row md:items-center mb-32 last:mb-0">
      <div className="md:w-[30%] md:shrink-0">
        <h3 className="text-medium-1 mb-gutter-small">{project.title}</h3>
        {project.description && (
          <p className="mb-gutter-small">{project.description}</p>
        )}

        {techs.length > 0 && (
          <ul className="list-square list-inside mb-gutter-normal text-white-1">
            {techs.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
        )}

        <div className="flex items-center gap-4">
          <Link href={`/projects/${project.slug}`} className="link__text p-3">
            Details <span className="pl-2">→</span>
          </Link>
          {isCoding && project.site_url && (
            <a
              href={project.site_url}
              className="link__text p-3"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit <span className="pl-2">→</span>
            </a>
          )}
          {isCoding && project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block h-12 transition-transform hover:scale-110"
            >
              <Image
                src="/images/github.svg"
                width={48}
                height={48}
                alt="View Source Code on GitHub"
                title="View Source Code"
              />
            </a>
          )}
        </div>
      </div>

      <div className="md:flex-1 md:ml-24 mb-gutter-normal md:mb-0 overflow-hidden rounded-lg h-[350px] md:h-[500px]">
        {showIframe ? (
          <iframe
            src={project.site_url!}
            className="work__iframe"
            title={`${project.title} - Interactive Demo`}
            loading="lazy"
            referrerPolicy="same-origin"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
          />
        ) : showImage ? (
          <a
            href={
              isCoding
                ? project.site_url || project.image_url!
                : project.image_url!
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src={project.image_url!}
              alt={project.image_alt || project.title}
              width={800}
              height={500}
              className="work__image"
            />
          </a>
        ) : (
          <div className="w-full h-full bg-border-light rounded-lg flex items-center justify-center">
            <span className="text-white-1">
              {isCoding ? "No preview available" : "No image available"}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}
