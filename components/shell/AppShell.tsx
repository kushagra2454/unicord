"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Bookmark,
  BookOpen,
  Bot,
  Briefcase,
  Building2,
  FileQuestion,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  MessagesSquare,
  Search,
  Settings,
  ShieldCheck,
  Upload,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Profile, University, UniversityMembership } from "@/types/database";
import { Badge } from "@/components/ui/primitives";

interface AppShellProps {
  universitySlug: string;
  universityName: string;
  profile: Profile | null;
  memberships: UniversityMembership[];
  isStaff?: boolean;
  isPlatformAdmin?: boolean;
  children: React.ReactNode;
}

export function AppShell({
  universitySlug,
  universityName,
  profile,
  memberships,
  isStaff = false,
  isPlatformAdmin = false,
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: `/${universitySlug}/dashboard`, label: "Dashboard", icon: LayoutDashboard },
    { href: `/${universitySlug}/resources`, label: "Resources", icon: BookOpen },
    { href: `/${universitySlug}/pyqs`, label: "PYQ Centre", icon: FileQuestion },
    { href: `/${universitySlug}/upload`, label: "Upload", icon: Upload },
    { href: `/${universitySlug}/community`, label: "Community", icon: MessagesSquare },
    { href: `/${universitySlug}/messages`, label: "Messages", icon: MessageSquare },
    { href: `/${universitySlug}/opportunities`, label: "Opportunities", icon: Briefcase },
    { href: `/${universitySlug}/people`, label: "People", icon: Users },
    { href: `/${universitySlug}/assistant`, label: "AI Assistant", icon: Bot },
    { href: `/${universitySlug}/saved`, label: "Saved", icon: Bookmark },
    { href: `/${universitySlug}/notifications`, label: "Notifications", icon: Bell },
    { href: `/${universitySlug}/search`, label: "Search", icon: Search },
  ];

  const activeMembership = memberships.find(
    (m) => (m.universities as University | undefined)?.slug === universitySlug
  );

  async function handleUniversitySwitch(nextUniId: string) {
    const target = memberships.find((m) => m.university_id === nextUniId);
    const slug = (target?.universities as University | undefined)?.slug;
    if (!slug) return;
    await fetch("/api/tenancy/switch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ universityId: nextUniId }),
    }).catch(() => null);
    router.push(`/${slug}/dashboard`);
    router.refresh();
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-[#0a0f1d] border-r border-slate-800/80 p-4">
      <div className="space-y-5">
        <div className="flex items-center justify-between px-1">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
              U
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-white">UNICORD</span>
              <p className="text-[10px] text-slate-400">Multi-University Network</p>
            </div>
          </Link>
          <button
            type="button"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* University Switcher */}
        <div className="space-y-1.5 rounded-xl border border-slate-800 bg-[#0f172a]/80 p-3">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
            <span className="flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5 text-indigo-400" />
              Active Campus
            </span>
            {activeMembership && (
              <Badge
                tone={
                  activeMembership.verification_status === "verified" ? "emerald" : "amber"
                }
              >
                {activeMembership.verification_status}
              </Badge>
            )}
          </div>
          {memberships.length > 0 ? (
            <select
              aria-label="Switch active university"
              value={activeMembership?.university_id ?? ""}
              onChange={(e) => handleUniversitySwitch(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-[#090f1d] px-2.5 py-1.5 text-xs font-medium text-slate-100 focus:border-indigo-500 focus:outline-none"
            >
              {memberships.map((m) => (
                <option key={m.id} value={m.university_id}>
                  {(m.universities as University | undefined)?.name ?? m.university_id}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-xs font-medium text-slate-200">{universityName}</p>
          )}
          <Link
            href="/onboarding/university"
            className="block pt-1 text-[11px] text-indigo-400 hover:text-indigo-300"
          >
            + Join another university
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-0.5" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-indigo-600/20 text-indigo-200 border border-indigo-500/30"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {isStaff && (
            <Link
              href={`/${universitySlug}/admin`}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "mt-2 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname.startsWith(`/${universitySlug}/admin`)
                  ? "bg-amber-500/20 text-amber-200 border border-amber-500/30"
                  : "text-amber-300/80 hover:bg-slate-800/60 hover:text-amber-200"
              )}
            >
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>University Admin</span>
            </Link>
          )}

          {isPlatformAdmin && (
            <Link
              href="/platform-admin"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-sky-300/80 hover:bg-slate-800/60 hover:text-sky-200"
            >
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>Platform Admin</span>
            </Link>
          )}
        </nav>
      </div>

      {/* Footer User Box */}
      <div className="space-y-2 border-t border-slate-800/80 pt-3">
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-slate-200">
              {profile?.full_name ?? "Student"}
            </p>
            <p className="truncate text-[11px] text-slate-400">
              @{profile?.username ?? "member"}
            </p>
          </div>
          <Link
            href="/settings"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            title="Account Settings"
          >
            <Settings className="h-4 w-4" />
          </Link>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-800/70 hover:text-rose-300 cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#070b14]">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block">{sidebarContent}</aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="w-72 max-w-[85vw]">{sidebarContent}</div>
          <div
            className="flex-1 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800/80 bg-[#070b14]/90 px-4 py-3 backdrop-blur-md lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg border border-slate-800 p-2 text-slate-300 hover:bg-slate-800 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-100">{universityName}</span>
              <span className="hidden text-xs text-slate-500 sm:inline">•</span>
              <Link
                href={`/universities/${universitySlug}`}
                className="hidden text-xs text-indigo-400 hover:underline sm:inline"
              >
                Official Info Centre
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/demo"
              className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-200 hover:bg-amber-500/20"
            >
              Professor Demo
            </Link>
            <Link
              href={`/${universitySlug}/assistant`}
              className="rounded-lg border border-indigo-500/30 bg-indigo-500/15 px-2.5 py-1 text-xs font-medium text-indigo-200 hover:bg-indigo-500/25"
            >
              Ask AI
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
