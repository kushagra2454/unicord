import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Bot,
  Briefcase,
  Building2,
  CheckCircle2,
  FileCheck2,
  Lock,
  MessagesSquare,
  Presentation,
  ShieldCheck,
} from "lucide-react";
import { Badge, Card } from "@/components/ui/primitives";
import { getIntegrationStatus } from "@/lib/env";
import { JECRC_UNIVERSITY_META } from "@/lib/sources/jecrc";

export default function LandingPage() {
  const integrations = getIntegrationStatus();

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#070b14]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-base font-bold text-white">
              U
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white">UNICORD</span>
              <span className="ml-2 hidden rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[11px] font-medium text-indigo-300 sm:inline-block">
                Multi-University SaaS
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/universities"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-slate-800/70 hover:text-white"
            >
              Universities
            </Link>
            <Link
              href="/demo"
              className="rounded-lg border border-amber-500/40 bg-amber-500/15 px-3 py-1.5 text-sm font-medium text-amber-200 hover:bg-amber-500/25"
            >
              Professor Demo
            </Link>
            <Link
              href="/login"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-slate-800/70 hover:text-white"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
            >
              Sign up
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 lg:pt-20">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="space-y-6 lg:col-span-7">
            <Badge tone="indigo">UNI + CORD • One Platform. Every Campus. Endless Connections.</Badge>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              The verified campus operating system for students.
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Unicord brings together university-scoped academic libraries, provenance-verified
              previous-year question papers (PYQs), Discord-style real-time student communities,
              source-checked internships, and an authorized Gemini AI campus assistant.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                Create Student Account
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/15 px-5 py-2.5 text-sm font-semibold text-amber-200 hover:bg-amber-500/25"
              >
                <Presentation className="h-4 w-4" />
                Open Professor Demo (/demo)
              </Link>
              <Link
                href={`/universities/${JECRC_UNIVERSITY_META.slug}`}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/70 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                Explore JECRC Hub
              </Link>
            </div>
            <p className="text-xs text-slate-400">
              Independent student platform concept. Not an official JECRC University portal unless
              formally authorized.
            </p>
          </div>

          {/* Launch Tenant & Integration Status Card */}
          <div className="lg:col-span-5">
            <Card className="space-y-4 border-indigo-500/20 bg-[#0d1424]">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-indigo-400">
                    Launch Institution
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-white">JECRC University, Jaipur</h2>
                  <p className="text-xs text-slate-400">
                    Vidhani, Sitapura Extension, Jaipur, Rajasthan 303905
                  </p>
                </div>
                <Building2 className="h-6 w-6 text-indigo-400" />
              </div>

              <div className="space-y-2 rounded-lg border border-slate-800 bg-[#080d1a] p-3.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Official Source Registry</span>
                  <Badge tone="emerald">8 Verified Pages</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Academic Calendar 2026–27</span>
                  <Badge tone="sky">12 Schools Linked</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Supabase Auth & Postgres</span>
                  <Badge tone={integrations.supabaseReady ? "emerald" : "amber"}>
                    {integrations.supabaseReady ? "Configured" : "Pending Env Keys"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Gemini Server AI</span>
                  <Badge tone={integrations.geminiConfigured ? "emerald" : "amber"}>
                    {integrations.geminiConfigured ? "Configured" : "Pending API Key"}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <Link
                  href={`/universities/${JECRC_UNIVERSITY_META.slug}`}
                  className="font-medium text-indigo-400 hover:text-indigo-300"
                >
                  View Official JECRC Profile →
                </Link>
                <Link href="/api/health" className="hover:text-slate-200">
                  /api/health
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Modules Grid */}
      <section className="mx-auto max-w-7xl border-t border-slate-800/80 px-4 py-14 sm:px-6">
        <div className="mb-8 space-y-2">
          <h2 className="text-2xl font-bold text-white">Built with strict data integrity</h2>
          <p className="text-sm text-slate-400">
            Zero fabricated records, strict Row Level Security, and clear separation between
            production student tenants and the professor demo sandbox.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: BookOpen,
              title: "Academic Library & PYQs",
              desc: "Filter by school, programme, semester, subject code, and exam year. Authentic PYQs require moderator provenance verification.",
            },
            {
              icon: MessagesSquare,
              title: "Discord-Style Communities",
              desc: "University-scoped channels (#general, #academic-doubts, #placements, #coding) and participant-only direct messages via Supabase Realtime.",
            },
            {
              icon: Briefcase,
              title: "Source-Backed Opportunities",
              desc: "Internships, hackathons, and scholarships carry canonical source URLs, last-checked timestamps, and automatic expiry guards.",
            },
            {
              icon: Bot,
              title: "Authorized Gemini Assistant",
              desc: "Study Buddy, Campus Guide, Placement Mentor, Project Partner, and Opportunity Finder backed by permission-aware database retrieval.",
            },
            {
              icon: Lock,
              title: "Multi-University RLS",
              desc: "Every table enforces tenant isolation at PostgreSQL Row Level Security. Students cannot promote themselves or read another university’s private files.",
            },
            {
              icon: ShieldCheck,
              title: "Isolated Professor Demo",
              desc: "Walk through every Unicord workflow at /demo with clearly labelled simulated data that never mixes into production.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="space-y-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-400">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="text-base font-semibold text-white">{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{item.desc}</p>
              </Card>
            );
          })}
        </div>

        {/* Honesty Commitments */}
        <Card className="mt-8 flex flex-col gap-4 border-slate-800 bg-[#0b1120] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <FileCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">
                Non-Negotiable Authenticity Policy
              </h3>
              <p className="text-xs text-slate-400">
                Unicord never invents exam papers, stipends, deadlines, or official announcements.
                Empty categories display transparent empty states and direct official source links.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3 text-xs text-slate-400">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>RLS + Signed Storage URLs</span>
          </div>
        </Card>
      </section>

      <footer className="border-t border-slate-800/80 py-8 text-center text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6">
          <p>Unicord — Independent Multi-University Student Platform</p>
          <div className="flex items-center gap-4">
            <Link href="/universities" className="hover:text-slate-300">
              Universities
            </Link>
            <Link href="/demo" className="hover:text-slate-300">
              Professor Demo
            </Link>
            <Link href="/terms" className="hover:text-slate-300">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-slate-300">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
