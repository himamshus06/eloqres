import { createFileRoute } from "@tanstack/react-router";
import { ResumeBuilder } from "@/components/resume/ResumeBuilder";
import { AuthForm } from "@/components/auth/AuthForm";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

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
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <AuthForm onSuccess={() => {}} />;
  }

  return <ResumeBuilder />;
}
