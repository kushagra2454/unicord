"use client";

import React, { createContext, useContext, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  Briefcase,
  Compass,
  FileQuestion,
  LayoutDashboard,
  MessagesSquare,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  BookOpen,
} from "lucide-react";
import {
  createInitialDemoState,
  type DemoState,
} from "@/lib/demo/store";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/primitives";

interface DemoContextValue {
  state: DemoState;
  setState: React.Dispatch<React.SetStateAction<DemoState>>;
  resetDemo: () => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function useDemoState() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemoState must be used inside /demo layout");
  return ctx;
}

const DEMO_NAV = [
  { href: "/demo", label: "Demo Overview", icon: Compass },
  { href: "/demo/tour", label: "Guided Tour", icon: Compass },
  { href: "/demo/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/demo/resources", label: "Resources", icon: BookOpen },
  { href: "/demo/pyqs", label: "PYQ Centre", icon: FileQuestion },
  { href: "/demo/community", label: "Community & DM", icon: MessagesSquare },
  { href: "/demo/opportunities", label: "Opportunities", icon: Briefcase },
  { href: "/demo/assistant", label: "AI Assistant", icon: Bot },
  { href: "/demo/admin", label: "Admin Queue", icon: ShieldCheck },
];

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [state, setState] = useState<DemoState>(() => createInitialDemoState());

  function resetDemo() {
    setState(createInitialDemoState());
  }

  return (
    <DemoContext.Provider value={{ state, setState, resetDemo }}>
      <div className="min-h-screen bg-[#070b14] text-slate-100">
        {/* Permanent Non-Dismissible Demo Disclaimer Banner */}
        <div
          role="banner"
          className="sticky top-0 z-40 border-b border-amber-500/40 bg-amber-950/95 px-4 py-2.5 text-amber-100 backdrop-blur-md"
        >
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldAlert className="h-4 w-4 shrink-0 text-amber-300" />
              <span>DEMO MODE — SIMULATED DATA — NOT LIVE UNIVERSITY RECORDS</span>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={resetDemo}
                className="inline-flex items-center gap-1 rounded border border-amber-400/40 bg-amber-500/20 px-2.5 py-1 font-medium text-amber-100 hover:bg-amber-500/30 cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                Reset Demo Data
              </button>
              <Link
                href="/signup"
                className="rounded bg-indigo-600 px-2.5 py-1 font-semibold text-white hover:bg-indigo-500"
              >
                Real Signup
              </Link>
              <Link
                href="/"
                className="rounded border border-slate-600 px-2.5 py-1 text-slate-200 hover:bg-slate-800"
              >
                Exit Demo
              </Link>
            </div>
          </div>
        </div>

        {/* Demo Presenter Sub-Navigation */}
        <div className="border-b border-slate-800/80 bg-[#0a0f1d]">
          <div className="mx-auto flex max-w-7xl items-center gap-1.5 overflow-x-auto px-4 py-2.5">
            <Badge tone="demo" className="mr-2 shrink-0">
              JECRC Demo Sandbox
            </Badge>
            {DEMO_NAV.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "bg-indigo-600/25 text-indigo-200 border border-indigo-500/40"
                      : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-100"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
      </div>
    </DemoContext.Provider>
  );
}
