import React from "react";
import { requireUniversityAccess } from "@/lib/auth/tenant";
import { AppShell } from "@/components/shell/AppShell";

export default async function UniversityLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ universitySlug: string }>;
}) {
  const { universitySlug } = await params;
  const tenant = await requireUniversityAccess(universitySlug);

  return (
    <AppShell
      universitySlug={tenant.university.slug}
      universityName={tenant.university.name}
      profile={tenant.profile}
      memberships={tenant.memberships}
      isStaff={tenant.isStaff}
      isPlatformAdmin={tenant.isPlatformAdmin}
    >
      {children}
    </AppShell>
  );
}
