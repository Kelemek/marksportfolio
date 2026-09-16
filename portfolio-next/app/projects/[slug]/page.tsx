import { createClient } from "@/lib/supabase/server";
import { createPublicClient, hasPublicSupabaseEnv } from "@/lib/supabase/public";
import { parseTechnologies } from "@/lib/parseTechnologies";
import { notFound } from "next/navigation";
import Image from "next/image";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import type { Project } from "@/types/project";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateStaticParams() {
  if (!hasPublicSupabaseEnv()) {
    return [];
  }

  const supabase = createPublicClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("slug")
    .eq("is_visible", true);

  return (projects || []).map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({ params }: ProjectPageProps) {
  const resolvedParams = await params;

  if (!hasPublicSupabaseEnv()) {
    return { title: "Project Not Found" };
  }

  const supabase = createPublicClient();
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", resolvedParams.slug)
    .eq("is_visible", true)
    .single();

  if (!project) {
    return { title: "Project Not Found" };
  }

  return {
    title: `${project.title} | Mark Larson`,
    description:
      project.description || `${project.title} - A project by Mark Larson`,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const resolvedParams = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", resolvedParams.slug)
    .eq("is_visible", true)
    .single();

  if (error || !data) {
    notFound();
  }

  const project = data as Project;
  const techs = parseTechnologies(project.technologies);

  return (
    <>
      <Navigation />
      <main className="pt-32 pb-16">
        <article className="max-w-container mx-auto px-gutter-normal lg:px-gutter-medium xl:px-0">
          <header className="mb-12">
            <h1 className="text-huge font-heading mb-4">{project.title}</h1>
            {project.description && (
              <p className="text-medium text-white-1 max-w-3xl">
                {project.description}
              </p>
            )}
          </header>

          <div className="mb-12 rounded-lg overflow-hidden">
            {project.type === "coding" && project.site_url ? (
              <iframe
                src={project.site_url}
                className="w-full h-[600px] border-none rounded-lg shadow-lg bg-white"
                title={`${project.title} - Interactive Demo`}
                loading="lazy"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
              />
            ) : project.image_url ? (
              <Image
                src={project.image_url}
                alt={project.image_alt || project.title}
                width={1200}
                height={800}
                className="w-full rounded-lg shadow-lg"
              />
            ) : (
              <div className="w-full h-[400px] bg-border-light rounded-lg flex items-center justify-center">
                <span className="text-white-1">No preview available</span>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {techs.length > 0 && (
              <div>
                <h2 className="text-medium-1 font-heading mb-4">Technologies</h2>
                <ul className="list-square list-inside text-white-1 space-y-1">
                  {techs.map((tech) => (
                    <li key={tech}>{tech}</li>
                  ))}
                </ul>
              </div>
            )}

            {project.type === "coding" &&
              (project.site_url || project.github_url) && (
                <div>
                  <h2 className="text-medium-1 font-heading mb-4">Links</h2>
                  <div className="flex items-center gap-4">
                    {project.site_url && (
                      <a
                        href={project.site_url}
                        className="link__text p-3"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Visit Site <span className="pl-2">→</span>
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
              )}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
