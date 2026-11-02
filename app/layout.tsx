import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import Header from "@/components/Header";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Study Companion: Relentless AI Notes, Quizzes & Flashcards",
    template: "%s | Study Companion",
  },
  description:
    "Turn lecture notes into rapid-fire flashcards and quizzes powered by Google Gemini. Choose your study atmosphere: Adrenaline Beast Mode, Lo-Fi Vibey Lounge, or Straight Nerd Blueprint.",
  openGraph: {
    title: "Study Companion PRO",
    description: "High-octane AI notes into summaries, flashcards, and quizzes.",
    type: "website",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Study Companion PRO",
    description: "Turn notes into mastery with Gemini AI and warrior study mindset.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="adrenaline" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <div className="app-shell">
            <Header />
            <main id="main-content">{children}</main>
            <footer className="footer-glass">
              <div className="footer-content">
                <p className="footer-quote">
                  &ldquo;Discipline Equals Freedom.&rdquo; — Study Companion
                </p>
                <p className="footer-note">
                  AI generated summaries & quizzes powered by Google Gemini. Always verify critical facts.
                </p>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
