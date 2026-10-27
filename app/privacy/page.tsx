import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy", description: "What Study Companion stores and how to delete it." };

export default function Privacy() {
  return (
    <>
      <h1>Privacy</h1>
      <h2>What we store</h2>
      <ul>
        <li>Your Google account ID and name, handled by Firebase Authentication.</li>
        <li>The study sets generated from your notes (title, summary, flashcards, quiz). We do not store your original pasted notes.</li>
        <li>Your quiz scores, and a daily counter of how many sets you generated.</li>
      </ul>
      <h2>Who can see it</h2>
      <p>Only you. Database rules block other users from reading your data.</p>
      <h2>Third parties</h2>
      <p>Your notes are sent to Google Gemini to create the study material. Do not paste confidential or personal information.</p>
      <h2>Deleting your data</h2>
      <p>Delete any set from My sets and clear your scores from the Progress page at any time.</p>
    </>
  );
}
