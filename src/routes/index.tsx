import { createFileRoute } from "@tanstack/react-router";
import { ResumeBuilder } from "@/components/resume/ResumeBuilder";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "ResumeForge — AI Resume Builder" },
      { name: "description", content: "Build a standout resume with AI-powered suggestions, ATS-optimized templates, and instant export." },
    ],
  }),
});

function Index() {
  return <ResumeBuilder />;
}
