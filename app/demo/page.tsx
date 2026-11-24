import Link from "next/link";
import { ArrowRight, CheckCircle2, Lock, Presentation, ShieldCheck } from "lucide-react";
import { AlertBanner, Badge, Card, PageHeader } from "@/components/ui/primitives";
import { DEMO_WALKTHROUGH_STEPS } from "@/lib/demo/store";

export default function DemoLandingPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Professor Presentation & Demo Centre"
        subtitle="Explore Unicord's complete multi-university student workflows safely using isolated simulated records."
        badge={<Badge tone="demo">DEMO — ISOLATED SANDBOX</Badge>}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/demo/tour"
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
            >
              Start Guided 10-Step Tour
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/signup"
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
            >
              Test Real Account Signup
            </Link>
          </div>
        }
      />

      <AlertBanner tone="warning" title="Strict Separation Guarantee">
        All students, resources, chat messages, and opportunities inside <code>/demo</code> are
        simulated examples (<code>environment = demo</code>). They never enter production search,
        analytics, or student accounts, and demo sessions carry zero production admin rights.
      </AlertBanner>

      {/* How Unicord Works Overview */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="space-y-2.5">
          <Presentation className="h-5 w-5 text-indigo-400" />
          <h2 className="text-base font-semibold text-white">1. Multi-University Tenancy</h2>
          <p className="text-xs leading-relaxed text-slate-400">
            Launch tenant is JECRC University, Jaipur. Every table scopes data by{" "}
            <code>university_id</code> with PostgreSQL Row Level Security so campuses never leak
            into one another.
          </p>
        </Card>
        <Card className="space-y-2.5">
          <Lock className="h-5 w-5 text-emerald-400" />
          <h2 className="text-base font-semibold text-white">2. Source-Truth & Authenticity</h2>
          <p className="text-xs leading-relaxed text-slate-400">
            Institutional facts link to official <code>jecrcuniversity.edu.in</code> pages. PYQs
            require moderator provenance verification; AI practice papers carry mandatory labels.
          </p>
        </Card>
        <Card className="space-y-2.5">
          <ShieldCheck className="h-5 w-5 text-sky-400" />
          <h2 className="text-base font-semibold text-white">3. Production-Ready Controls</h2>
          <p className="text-xs leading-relaxed text-slate-400">
            Real Supabase Auth, private Storage signed URLs, Supabase Realtime messaging, server-side
            Gemini RAG, and scoped moderation audit logs.
          </p>
        </Card>
      </div>

      {/* Presenter Control Panel */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">
            Presenter Scenario Control Panel
          </h2>
          <span className="text-xs text-slate-400">Jump directly to any workflow</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {DEMO_WALKTHROUGH_STEPS.map((s) => (
            <Link
              key={s.step}
              href={s.route}
              className="flex flex-col justify-between rounded-lg border border-slate-800 bg-[#090f1d] p-3 hover:border-indigo-500/40"
            >
              <div>
                <p className="text-[11px] font-semibold text-indigo-400">Step {s.step}</p>
                <p className="mt-0.5 text-xs font-semibold text-white">{s.title}</p>
              </div>
              <p className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                Open →
              </p>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
