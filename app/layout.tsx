import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import Header from "@/components/Header";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Study Companion: turn notes into flashcards and quizzes", template: "%s | Study Companion" },
  description:
    "Paste your notes and get a summary, flashcards and a 5-question quiz generated with Google Gemini. Sign in with Google and track your progress.",
  openGraph: {
    title: "Study Companion",
    description: "Turn your notes into a summary, flashcards and a quiz.",
    type: "website",
    url: siteUrl,
  },
  twitter: { card: "summary", title: "Study Companion", description: "Turn your notes into flashcards and quizzes." },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Header />
          <main>{children}</main>
          <footer>AI output can contain mistakes. Check important facts against your own sources.</footer>
        </AuthProvider>
      </body>
    </html>
  );
}
