import type {
  AcademicResource,
  Opportunity,
  UniversityMembership,
  UniversityRole,
} from "@/types/database";

const STAFF_ROLES: ReadonlySet<UniversityRole> = new Set([
  "university_admin",
  "moderator",
]);

export function isUniversityStaff(
  membership: Pick<UniversityMembership, "university_id" | "role" | "verification_status"> | null | undefined,
  universityId: string,
  isPlatformAdmin = false
): boolean {
  if (isPlatformAdmin) return true;
  if (!membership) return false;
  return (
    membership.university_id === universityId &&
    membership.verification_status !== "rejected" &&
    STAFF_ROLES.has(membership.role)
  );
}

export function isUniversityAdmin(
  membership: Pick<UniversityMembership, "university_id" | "role" | "verification_status"> | null | undefined,
  universityId: string,
  isPlatformAdmin = false
): boolean {
  if (isPlatformAdmin) return true;
  if (!membership) return false;
  return (
    membership.university_id === universityId &&
    membership.verification_status !== "rejected" &&
    membership.role === "university_admin"
  );
}

export function hasActiveMembership(
  membership: Pick<UniversityMembership, "university_id" | "verification_status"> | null | undefined,
  universityId: string
): boolean {
  if (!membership) return false;
  return membership.university_id === universityId && membership.verification_status !== "rejected";
}

export function canAccessResource(
  resource: Pick<AcademicResource, "university_id" | "verification_status" | "uploaded_by" | "environment">,
  membership: Pick<UniversityMembership, "university_id" | "role" | "verification_status"> | null | undefined,
  userId: string | null,
  isPlatformAdmin = false
): boolean {
  if (resource.environment !== "production") return false;
  if (!userId) return false;
  if (isPlatformAdmin) return true;
  if (resource.uploaded_by === userId) return true;
  if (isUniversityStaff(membership, resource.university_id, isPlatformAdmin)) return true;
  return (
    resource.verification_status === "verified" &&
    hasActiveMembership(membership, resource.university_id)
  );
}

export function canPostInChannel(
  channel: {
    university_id: string;
    is_read_only: boolean;
    requires_verified_student: boolean;
  },
  membership: Pick<UniversityMembership, "university_id" | "role" | "verification_status"> | null | undefined,
  isPlatformAdmin = false
): boolean {
  if (isUniversityStaff(membership, channel.university_id, isPlatformAdmin)) {
    return true;
  }
  if (!hasActiveMembership(membership, channel.university_id)) {
    return false;
  }
  if (channel.is_read_only) {
    return false;
  }
  if (channel.requires_verified_student && membership?.verification_status !== "verified") {
    return false;
  }
  return true;
}

export function canAccessDirectConversation(
  participantIds: string[],
  userId: string | null
): boolean {
  if (!userId) return false;
  return participantIds.includes(userId);
}

export function isOpportunityActive(
  opportunity: Pick<Opportunity, "verification_status" | "deadline" | "expires_at">,
  now = new Date()
): boolean {
  if (
    opportunity.verification_status === "expired" ||
    opportunity.verification_status === "closed" ||
    opportunity.verification_status === "rejected" ||
    opportunity.verification_status === "stale"
  ) {
    return false;
  }
  if (opportunity.deadline && new Date(opportunity.deadline).getTime() < now.getTime()) {
    return false;
  }
  if (opportunity.expires_at && new Date(opportunity.expires_at).getTime() < now.getTime()) {
    return false;
  }
  return opportunity.verification_status === "verified_current";
}

export const ALLOWED_RESOURCE_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/markdown",
  "image/png",
  "image/jpeg",
]);

export const ALLOWED_RESOURCE_EXTENSIONS = new Set([
  "pdf",
  "docx",
  "pptx",
  "txt",
  "md",
  "png",
  "jpg",
  "jpeg",
]);

export const MAX_RESOURCE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MiB

export function validateResourceUpload(file: {
  name: string;
  mimeType: string;
  size: number;
}): { valid: true } | { valid: false; error: string } {
  if (file.size <= 0) {
    return { valid: false, error: "File cannot be empty." };
  }
  if (file.size > MAX_RESOURCE_SIZE_BYTES) {
    return { valid: false, error: "File exceeds the 25 MB maximum upload limit." };
  }
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_RESOURCE_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      error: `Unsupported file extension ".${ext}". Allowed: PDF, DOCX, PPTX, TXT, MD, PNG, JPG.`,
    };
  }
  if (!ALLOWED_RESOURCE_MIME_TYPES.has(file.mimeType)) {
    return {
      valid: false,
      error: `Unsupported MIME type "${file.mimeType}".`,
    };
  }
  return { valid: true };
}
