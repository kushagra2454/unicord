"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertBanner, Button, Card, Input } from "@/components/ui/primitives";

export function PlatformAdminClient() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [officialWebsite, setOfficialWebsite] = useState("");
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_university",
          name,
          slug,
          city,
          state,
          country: "India",
          officialWebsite,
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setMsg({ tone: "error", text: json.error || "Unable to create university." });
        return;
      }
      setMsg({
        tone: "success",
        text: "University tenant created cleanly without cloning JECRC schools or calendars.",
      });
      setName("");
      setSlug("");
      setCity("");
      setState("");
      setOfficialWebsite("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="space-y-4">
      <h2 className="text-base font-semibold text-white">Onboard New University Tenant</h2>
      {msg && <AlertBanner tone={msg.tone}>{msg.text}</AlertBanner>}
      <form onSubmit={handleCreate} className="grid gap-3 sm:grid-cols-2">
        <Input
          required
          placeholder="Official University Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          required
          placeholder="slug (e.g. university-slug-city)"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
        <Input
          required
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <Input
          required
          placeholder="State"
          value={state}
          onChange={(e) => setState(e.target.value)}
        />
        <Input
          required
          type="url"
          placeholder="https://official-university-website.edu"
          className="sm:col-span-2"
          value={officialWebsite}
          onChange={(e) => setOfficialWebsite(e.target.value)}
        />
        <Button type="submit" disabled={loading} className="sm:col-span-2">
          {loading ? "Creating Tenant..." : "Create University Tenant"}
        </Button>
      </form>
    </Card>
  );
}
