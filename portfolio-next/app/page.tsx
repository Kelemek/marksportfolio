import { createClient } from "@/lib/supabase/server";
import Navigation from "@/components/Navigation";
import Header from "@/components/Header";
import ProjectCard from "@/components/ProjectCard";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import type { Project } from "@/types/project";

export const revalidate = 60;

async function getProjects() {
  const supabase = await createClient();

  const [codingResult, drawingResult] = await Promise.all([
    supabase
      .from("projects")
      .select("*")
      .eq("type", "coding")
      .eq("is_visible", true)
      .order("display_order", { ascending: true }),
    supabase
      .from("projects")
      .select("*")
      .eq("type", "drawing")
      .eq("is_visible", true)
      .order("display_order", { ascending: true }),
  ]);

  return {
    coding: (codingResult.data || []) as Project[],
    drawing: (drawingResult.data || []) as Project[],
  };
}

export default async function HomePage() {
  const { coding, drawing } = await getProjects();

  return (
    <>
      <Navigation />
      <Header />

      <main role="main">
        <section className="work" id="work">
          <div className="row">
            <h2 className="text-large mb-gutter-medium">My Coding</h2>
          </div>
          <div className="max-w-container mx-auto px-gutter-normal lg:px-gutter-medium xl:px-0">
            {coding.map((project) => (
              <ProjectCard key={project.id} project={project} variant="coding" />
            ))}
          </div>
        </section>

        <section className="work" id="drawing">
          <div className="row">
            <h2 className="text-large mb-gutter-medium">My Drawing</h2>
          </div>
          <div className="max-w-container mx-auto px-gutter-normal lg:px-gutter-medium xl:px-0">
            {drawing.map((project) => (
              <ProjectCard key={project.id} project={project} variant="drawing" />
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
