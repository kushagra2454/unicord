"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertBanner, Button, Card, Input, Textarea } from "@/components/ui/primitives";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

export function SettingsForm({ profile }: { profile: Profile | null }) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [skillsText, setSkillsText] = useState((profile?.skills ?? []).join(", "));
  const [interestsText, setInterestsText] = useState((profile?.interests ?? []).join(", "));
  const [githubUrl, setGithubUrl] = useState(profile?.portfolio_links?.github ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(profile?.portfolio_links?.linkedin ?? "");
  const [showProfile, setShowProfile] = useState(
    profile?.privacy_settings?.show_profile ?? true
  );
  const [showSkills, setShowSkills] = useState(
    profile?.privacy_settings?.show_skills ?? true
  );
  const [showOnlineStatus, setShowOnlineStatus] = useState(
    profile?.privacy_settings?.show_online_status ?? false
  );

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [status, setStatus] = useState<{ tone: "success" | "error"; text: string } | null>(
    null
  );

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setStatus(null);
    try {
      const supabase = createClient();
      const skills = skillsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const interests = interestsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          bio: bio.trim(),
          skills,
          interests,
          portfolio_links: {
            github: githubUrl.trim(),
            linkedin: linkedinUrl.trim(),
          },
          privacy_settings: {
            show_profile: showProfile,
            show_skills: showSkills,
            show_online_status: showOnlineStatus,
            allow_dm_from: profile.privacy_settings?.allow_dm_from ?? "university_members",
          },
        })
        .eq("id", profile.id);

      if (error) {
        setStatus({ tone: "error", text: error.message });
      } else {
        setStatus({ tone: "success", text: "Profile and privacy settings saved." });
        router.refresh();
      }
    } catch (err) {
      setStatus({
        tone: "error",
        text: err instanceof Error ? err.message : "Failed to save settings.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete your Unicord account? This cannot be undone."
      )
    ) {
      return;
    }
    setDeleting(true);
    setStatus(null);
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setStatus({ tone: "error", text: data.error || "Unable to delete account." });
        return;
      }
      router.push("/");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {status && <AlertBanner tone={status.tone}>{status.text}</AlertBanner>}

      <Card>
        <form onSubmit={handleSave} className="space-y-4">
          <h2 className="text-base font-semibold text-white">Student Profile</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="prof-name" className="text-xs font-medium text-slate-300">
                Full Name
              </label>
              <Input
                id="prof-name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="prof-user" className="text-xs font-medium text-slate-300">
                Username
              </label>
              <Input id="prof-user" value={profile?.username ?? ""} disabled />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="prof-bio" className="text-xs font-medium text-slate-300">
              Bio
            </label>
            <Textarea
              id="prof-bio"
              rows={3}
              placeholder="Tell peers about your academic focus and projects..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="prof-skills" className="text-xs font-medium text-slate-300">
                Skills (comma-separated)
              </label>
              <Input
                id="prof-skills"
                placeholder="TypeScript, Python, DBMS"
                value={skillsText}
                onChange={(e) => setSkillsText(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="prof-interests" className="text-xs font-medium text-slate-300">
                Interests (comma-separated)
              </label>
              <Input
                id="prof-interests"
                placeholder="AI, Hackathons, Backend"
                value={interestsText}
                onChange={(e) => setInterestsText(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="prof-github" className="text-xs font-medium text-slate-300">
                GitHub URL
              </label>
              <Input
                id="prof-github"
                type="url"
                placeholder="https://github.com/username"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="prof-linkedin" className="text-xs font-medium text-slate-300">
                LinkedIn URL
              </label>
              <Input
                id="prof-linkedin"
                type="url"
                placeholder="https://linkedin.com/in/username"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-800 pt-4">
            <h3 className="text-sm font-semibold text-white">Privacy Controls</h3>
            <label className="flex items-center gap-2 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={showProfile}
                onChange={(e) => setShowProfile(e.target.checked)}
              />
              Show my profile in my university&apos;s student directory
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={showSkills}
                onChange={(e) => setShowSkills(e.target.checked)}
              />
              Show my skills and portfolio links to peers
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={showOnlineStatus}
                onChange={(e) => setShowOnlineStatus(e.target.checked)}
              />
              Display online presence in community chat
            </label>
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </Card>

      <Card className="space-y-3 border-slate-800">
        <h2 className="text-base font-semibold text-white">Data Export & Account Deletion</h2>
        <p className="text-xs text-slate-400">
          Download a JSON copy of your profile, university memberships, uploaded resources, and
          saved opportunities, or permanently delete your account.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={async () => {
              const res = await fetch("/api/account/export");
              if (!res.ok) return;
              const blob = await res.blob();
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "unicord-export.json";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Export My Data (JSON)
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleDeleteAccount}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete Account"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
