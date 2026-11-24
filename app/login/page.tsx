"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertBanner, Button, Card, Input } from "@/components/ui/primitives";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");
  const nextPath = searchParams.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    reason === "supabase_unconfigured"
      ? "Supabase environment variables are not configured yet. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local, or explore /demo."
      : searchParams.get("error") === "auth_callback_failed"
        ? "Email confirmation or auth callback could not be verified. Try signing in again."
        : null
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        setError(signInError.message);
        return;
      }
      router.push(nextPath.startsWith("/") ? nextPath : "/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070b14] px-4 py-12">
      <div className="w-full max-w-md space-y-5">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-lg font-bold text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm">
              U
            </span>
            UNICORD
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-white">Sign in to your account</h1>
          <p className="mt-1 text-sm text-slate-400">
            Access your university resources, channels, and saved opportunities.
          </p>
        </div>

        {error && (
          <AlertBanner tone="error" title="Authentication notice">
            {error}
          </AlertBanner>
        )}

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="text-xs font-medium text-slate-300">
                Email address
              </label>
              <Input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="text-xs font-medium text-slate-300">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-indigo-400 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </Card>

        <div className="flex flex-col items-center gap-2 text-xs text-slate-400">
          <p>
            New to Unicord?{" "}
            <Link href="/signup" className="font-semibold text-indigo-400 hover:underline">
              Create a real account
            </Link>
          </p>
          <p>
            Evaluating as a professor?{" "}
            <Link href="/demo" className="font-semibold text-amber-300 hover:underline">
              Open isolated Demo Mode (/demo)
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070b14]" />}>
      <LoginForm />
    </Suspense>
  );
}
