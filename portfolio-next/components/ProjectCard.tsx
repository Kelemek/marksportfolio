import Image from "next/image";
import Link from "next/link";
import { Project } from "@/types/project";

interface ProjectCardProps {
  project: Project;
  mode?: "iframe" | "image";
}

export default function ProjectCard({
  project,
  mode = "iframe",
}: ProjectCardProps) {
  const showIframe = mode === "iframe" && project.site_url;
  const showImage = !showIframe && project.image_url;

  return (
    <article className="flex flex-col-reverse md:flex-row md:items-center mb-32 last:mb-0">
      {/* Text content */}
      <div className="md:w-[30%] md:shrink-0">
        <h3 className="text-medium-1 mb-gutter-small">{project.title}</h3>
        {project.description && (
          <p className="mb-gutter-small">{project.description}</p>
        )}

        {(() => {
          const rawTechs = project.technologies as unknown;
          const techs: string[] = Array.isArray(rawTechs)
            ? (rawTechs as string[])
            : typeof rawTechs === "string"
            ? (rawTechs as string)
                .split(",")
                .map((t: string) => t.trim())
                .filter(Boolean)
            : [];

          return techs.length > 0 ? (
            <ul className="list-square list-inside mb-gutter-normal text-white-1">
              {techs.map((tech: string) => (
                <li key={tech}>{tech}</li>
              ))}
            </ul>
          ) : null;
        })()}

        <div className="flex items-center gap-4" >
          <Link
            href={`/projects/${project.slug}`}
            className="link__text p-3"
          >
            Details <span className="pl-2">→</span>
          </Link>
          {project.site_url && (
            <a
              href={project.site_url}
              className="link__text p-3"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit <span className="pl-2">→</span>
            </a>
          )}
          {project.github_url && (
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

      {/* Image/iframe content */}
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
            href={project.site_url || project.image_url!}
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
            <span className="text-white-1">No preview available</span>
          </div>
        )}
      </div>
    </article>
  );
}
