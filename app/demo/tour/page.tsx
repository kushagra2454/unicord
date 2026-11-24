"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { DEMO_WALKTHROUGH_STEPS } from "@/lib/demo/store";
import { Badge, Button, Card, PageHeader } from "@/components/ui/primitives";

export default function DemoTourPage() {
  const [stepIdx, setStepIdx] = useState(0);
  const current = DEMO_WALKTHROUGH_STEPS[stepIdx]!;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Guided Professor Walkthrough"
        subtitle="Step through every core capability of Unicord with clear evaluation checkpoints."
        badge={<Badge tone="demo">Step {current.step} of {DEMO_WALKTHROUGH_STEPS.length}</Badge>}
      />

      <Card className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-bold text-white">
            Step {current.step}: {current.title}
          </h2>
          <Link
            href={current.route}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
          >
            Open Live Screen ({current.route})
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>

        <p className="text-sm leading-relaxed text-slate-300">{current.summary}</p>

        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <Button
            type="button"
            variant="secondary"
            disabled={stepIdx === 0}
            onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
          >
            <ArrowLeft className="h-4 w-4" />
            Previous Step
          </Button>
          <Button
            type="button"
            disabled={stepIdx === DEMO_WALKTHROUGH_STEPS.length - 1}
            onClick={() =>
              setStepIdx((i) => Math.min(DEMO_WALKTHROUGH_STEPS.length - 1, i + 1))
            }
          >
            Next Step
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
        {DEMO_WALKTHROUGH_STEPS.map((step, i) => (
          <button
            key={step.step}
            type="button"
            onClick={() => setStepIdx(i)}
            className={`rounded-lg border p-3 text-left text-xs transition-colors cursor-pointer ${
              i === stepIdx
                ? "border-indigo-500 bg-indigo-600/20 text-white"
                : "border-slate-800 bg-[#090f1d] text-slate-400 hover:text-slate-200"
            }`}
          >
            <p className="font-semibold">
              {step.step}. {step.title}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
