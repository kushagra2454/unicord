import Link from "next/link";
import { Card, PageHeader } from "@/components/ui/primitives";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <PageHeader
        title="Privacy & Data Protection"
        subtitle="How Unicord protects student profiles, private direct messages, and AI prompts."
        actions={
          <Link href="/" className="text-sm text-indigo-400 hover:underline">
            ← Back to Home
          </Link>
        }
      />
      <Card className="space-y-4 text-sm leading-relaxed text-slate-300">
        <p>
          <strong>1. Tenant Isolation:</strong> Student memberships, academic files, and
          community channels are scoped by university and enforced with PostgreSQL Row Level
          Security (RLS). Your personal email and phone number are hidden by default.
        </p>
        <p>
          <strong>2. Private Direct Messages:</strong> Direct messages are strictly accessible
          only to conversation participants and are never exposed in public search or AI
          retrieval.
        </p>
        <p>
          <strong>3. AI Assistant Privacy:</strong> Prompts sent to the Gemini AI assistant
          never include passwords, tokens, or private direct messages. Users can delete their
          AI conversation history at any time.
        </p>
        <p>
          <strong>4. Account Export & Deletion:</strong> Students can export their profile
          data and request account deletion from Account Settings (`/settings`).
        </p>
      </Card>
    </div>
  );
}
