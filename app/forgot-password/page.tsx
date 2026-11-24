"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AlertBanner, Button, Card, Input } from "@/components/ui/primitives";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<{ tone: "success" | "error"; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
      });
      if (error) {
        setStatus({ tone: "error", msg: error.message });
      } else {
        setStatus({
          tone: "success",
          msg: "If an account exists for that email, a password reset link has been sent.",
        });
      }
    } catch (err) {
      setStatus({
        tone: "error",
        msg: err instanceof Error ? err.message : "Unable to request password reset.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070b14] px-4 py-12">
      <div className="w-full max-w-md space-y-5">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Reset your password</h1>
          <p className="mt-1 text-sm text-slate-400">
            Enter your account email to receive a secure password reset link.
          </p>
        </div>

        {status && <AlertBanner tone={status.tone}>{status.msg}</AlertBanner>}

        <Card>
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="reset-email" className="text-xs font-medium text-slate-300">
                Email address
              </label>
              <Input
                id="reset-email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send reset link"}
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-slate-400">
          <Link href="/login" className="text-indigo-400 hover:underline">
            ← Back to Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
