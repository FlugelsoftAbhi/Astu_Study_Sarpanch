import type { Metadata } from "next";
import "./notebook.css";
import AuthGuard from "@/components/AuthGuard";

export const metadata: Metadata = {
  title: "Google NotebookLM Studio: Source-Grounded Study Assistant",
  description:
    "Strictly grounded AI study synthesis inspired by Google NotebookLM. Briefing documents, key concept glossaries, FAQs, flashcards, and quizzes.",
};

export default function NotebookLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="notebook-shell">{children}</div>
    </AuthGuard>
  );
}
