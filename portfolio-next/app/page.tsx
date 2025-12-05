import { createClient } from "@/lib/supabase/server";
import {
  Navigation,
  Header,
  ProjectCard,
  DrawingCard,
  AboutSection,
  ContactSection,
  Footer,
} from "@/components";
import type { Project } from "@/types/project";

// Revalidate every 60 seconds (ISR)
export const revalidate = 60;

async function getProjects() {
  const supabase = await createClient();

  const { data: codingProjects } = await supabase
    .from("projects")
    .select("*")
    .eq("type", "coding")
    .eq("is_visible", true)
    .order("display_order", { ascending: true });

  const { data: drawingProjects } = await supabase
    .from("projects")
    .select("*")
    .eq("type", "drawing")
    .eq("is_visible", true)
    .order("display_order", { ascending: true });

  return {
    coding: (codingProjects || []) as Project[],
    drawing: (drawingProjects || []) as Project[],
  };
}

export default async function HomePage() {
  const { coding, drawing } = await getProjects();

  return (
    <>
      <Navigation />
      <Header />

      <main role="main">
        {/* Coding Projects Section */}
        <section className="work" id="work">
          <div className="row">
            <h2 className="text-large mb-gutter-medium">My Coding</h2>
          </div>
          <div className="max-w-container mx-auto px-gutter-normal lg:px-gutter-medium xl:px-0">
            {coding.map((project) => (
              <ProjectCard key={project.id} project={project} mode="iframe" />
            ))}
          </div>
        </section>

        {/* Drawing Projects Section */}
        <section className="work" id="drawing">
          <div className="row">
            <h2 className="text-large mb-gutter-medium">My Drawing</h2>
          </div>
          <div className="max-w-container mx-auto px-gutter-normal lg:px-gutter-medium xl:px-0">
            {drawing.map((project) => (
              <DrawingCard key={project.id} project={project} />
            ))}
          </div>
        </section>

        <AboutSection />
      </main>

      <ContactSection />
      <Footer />
    </>
  );
}
