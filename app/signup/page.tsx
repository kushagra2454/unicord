"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AlertBanner, Button, Card, Input, Select } from "@/components/ui/primitives";
import { createClient } from "@/lib/supabase/client";
import { JECRC_OFFICIAL_SCHOOLS, JECRC_UNIVERSITY_META } from "@/lib/sources/jecrc";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [universitySlug] = useState<string>(JECRC_UNIVERSITY_META.slug);
  const [schoolName, setSchoolName] = useState<string>(JECRC_OFFICIAL_SCHOOLS[0]);
  const [programme, setProgramme] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("1");
  const [semester, setSemester] = useState("1");

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    const cleanUsername = username.trim().toLowerCase();
    if (!/^[a-z0-9_.-]{3,32}$/.test(cleanUsername)) {
      setError("Username must be 3-32 characters using a-z, 0-9, _, ., or -.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding/university`,
          data: {
            full_name: fullName.trim(),
            username: cleanUsername,
            preferred_university_slug: universitySlug,
            preferred_school: schoolName,
            programme: programme.trim(),
            year_of_study: Number(yearOfStudy),
            semester: Number(semester),
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.session) {
        await fetch("/api/tenancy/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            universityId: JECRC_UNIVERSITY_META.id,
            programme: programme.trim() || null,
            yearOfStudy: Number(yearOfStudy),
            semester: Number(semester),
          }),
        }).catch(() => null);
      }

      setSuccessMsg(
        data.session
          ? "Account created and signed in! Continue to your university onboarding."
          : "Account created! Check your email inbox to confirm your email address before signing in."
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to register account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070b14] px-4 py-12">
      <div className="w-full max-w-xl space-y-5">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-lg font-bold text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm">
              U
            </span>
            UNICORD
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-white">Create your student account</h1>
          <p className="mt-1 text-sm text-slate-400">
            New university memberships start as <code className="text-amber-300">pending</code>{" "}
            until verified by a university administrator.
          </p>
        </div>

        {error && (
          <AlertBanner tone="error" title="Registration error">
            {error}
          </AlertBanner>
        )}

        {successMsg && (
          <AlertBanner tone="success" title="Registration submitted">
            <p>{successMsg}</p>
            <Link
              href="/onboarding/university"
              className="mt-2 inline-block font-semibold underline"
            >
              Continue to University Onboarding →
            </Link>
          </AlertBanner>
        )}

        <Card>
          <form onSubmit={handleSignup} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="full-name" className="text-xs font-medium text-slate-300">
                Full name
              </label>
              <Input
                id="full-name"
                required
                placeholder="Aarav Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="username" className="text-xs font-medium text-slate-300">
                Username
              </label>
              <Input
                id="username"
                required
                placeholder="aarav_jecrc"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="signup-email" className="text-xs font-medium text-slate-300">
                Email address (personal or institutional)
              </label>
              <Input
                id="signup-email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="signup-password" className="text-xs font-medium text-slate-300">
                Password (min 8 characters)
              </label>
              <Input
                id="signup-password"
                type="password"
                required
                minLength={8}
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="university" className="text-xs font-medium text-slate-300">
                University
              </label>
              <Select id="university" value={universitySlug} disabled>
                <option value={JECRC_UNIVERSITY_META.slug}>
                  JECRC University, Jaipur (Launch Tenant)
                </option>
              </Select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="school" className="text-xs font-medium text-slate-300">
                School / Faculty
              </label>
              <Select
                id="school"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
              >
                {JECRC_OFFICIAL_SCHOOLS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="programme" className="text-xs font-medium text-slate-300">
                Programme (e.g. B.Tech CSE, BCA, BBA, LL.B)
              </label>
              <Input
                id="programme"
                placeholder="B.Tech CSE"
                value={programme}
                onChange={(e) => setProgramme(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="year" className="text-xs font-medium text-slate-300">
                Year of study
              </label>
              <Select
                id="year"
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(e.target.value)}
              >
                {[1, 2, 3, 4, 5].map((y) => (
                  <option key={y} value={y}>
                    Year {y}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="semester" className="text-xs font-medium text-slate-300">
                Current semester
              </label>
              <Select
                id="semester"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </Select>
            </div>

            <div className="sm:col-span-2">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </div>
          </form>
        </Card>

        <p className="text-center text-xs text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-indigo-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
