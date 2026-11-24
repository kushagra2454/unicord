import Link from "next/link";
import { Card, PageHeader } from "@/components/ui/primitives";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <PageHeader
        title="Terms of Use"
        subtitle="Draft operational terms for Unicord MVP — review legally prior to public launch."
        actions={
          <Link href="/" className="text-sm text-indigo-400 hover:underline">
            ← Back to Home
          </Link>
        }
      />
      <Card className="space-y-4 text-sm leading-relaxed text-slate-300">
        <p>
          <strong>1. Independent Platform Status:</strong> Unicord is an independent
          student-built multi-university platform concept. Unless formally endorsed in
          writing by a participating institution, Unicord does not represent any university
          administration.
        </p>
        <p>
          <strong>2. Academic Integrity & Authentic Materials:</strong> Students may upload
          only authorized notes, study guides, and authentic previous-year question papers
          they have the right to share. Uploading copyrighted textbooks without permission or
          forged exam documents is strictly prohibited.
        </p>
        <p>
          <strong>3. External Opportunities:</strong> Internships, hackathons, and
          scholarships link directly to external third-party sources. Students should always
          confirm deadlines, eligibility, and authenticity on the official destination website.
        </p>
      </Card>
    </div>
  );
}
