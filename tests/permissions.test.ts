import { describe, expect, it } from "vitest";
import {
  canAccessDirectConversation,
  canAccessResource,
  canPostInChannel,
  hasActiveMembership,
  isOpportunityActive,
  isUniversityAdmin,
  isUniversityStaff,
  validateResourceUpload,
} from "@/lib/permissions/roles";

const JECRC_ID = "11111111-1111-4111-8111-111111111111";
const OTHER_UNI_ID = "22222222-2222-4222-8222-222222222222";

describe("Multi-University Tenancy & Role Permissions", () => {
  it("scopes university staff and admin privileges strictly to the matching university", () => {
    const jecrcMod = {
      university_id: JECRC_ID,
      role: "moderator" as const,
      verification_status: "verified" as const,
    };

    expect(isUniversityStaff(jecrcMod, JECRC_ID)).toBe(true);
    expect(isUniversityStaff(jecrcMod, OTHER_UNI_ID)).toBe(false);
    expect(isUniversityAdmin(jecrcMod, JECRC_ID)).toBe(false);
    expect(isUniversityAdmin(jecrcMod, OTHER_UNI_ID)).toBe(false);
  });

  it("blocks rejected memberships from active access", () => {
    const rejected = {
      university_id: JECRC_ID,
      role: "student" as const,
      verification_status: "rejected" as const,
    };
    expect(hasActiveMembership(rejected, JECRC_ID)).toBe(false);
    expect(isUniversityStaff(rejected, JECRC_ID)).toBe(false);
  });

  it("prevents cross-university resource access and blocks unverified downloads by peers", () => {
    const jecrcVerifiedResource = {
      university_id: JECRC_ID,
      verification_status: "verified" as const,
      uploaded_by: "user-a",
      environment: "production" as const,
    };

    const otherUniStudent = {
      university_id: OTHER_UNI_ID,
      role: "verified_student" as const,
      verification_status: "verified" as const,
    };

    const jecrcStudent = {
      university_id: JECRC_ID,
      role: "student" as const,
      verification_status: "pending" as const,
    };

    expect(canAccessResource(jecrcVerifiedResource, otherUniStudent, "user-b")).toBe(false);
    expect(canAccessResource(jecrcVerifiedResource, jecrcStudent, "user-b")).toBe(true);
    expect(canAccessResource(jecrcVerifiedResource, null, null)).toBe(false);

    const pendingResource = {
      ...jecrcVerifiedResource,
      verification_status: "pending_review" as const,
    };
    expect(canAccessResource(pendingResource, jecrcStudent, "user-b")).toBe(false);
    expect(canAccessResource(pendingResource, jecrcStudent, "user-a")).toBe(true);
  });

  it("never allows demo-environment resources in production access helper", () => {
    const demoResource = {
      university_id: JECRC_ID,
      verification_status: "verified" as const,
      uploaded_by: "user-a",
      environment: "demo" as const,
    };
    expect(canAccessResource(demoResource, null, "user-a", true)).toBe(false);
  });

  it("enforces read-only and verified-student restrictions on channels", () => {
    const pendingMember = {
      university_id: JECRC_ID,
      role: "student" as const,
      verification_status: "pending" as const,
    };
    const verifiedMember = {
      university_id: JECRC_ID,
      role: "verified_student" as const,
      verification_status: "verified" as const,
    };
    const staff = {
      university_id: JECRC_ID,
      role: "moderator" as const,
      verification_status: "verified" as const,
    };

    expect(
      canPostInChannel(
        { university_id: JECRC_ID, is_read_only: false, requires_verified_student: true },
        pendingMember
      )
    ).toBe(false);

    expect(
      canPostInChannel(
        { university_id: JECRC_ID, is_read_only: false, requires_verified_student: true },
        verifiedMember
      )
    ).toBe(true);

    expect(
      canPostInChannel(
        { university_id: JECRC_ID, is_read_only: true, requires_verified_student: false },
        verifiedMember
      )
    ).toBe(false);

    expect(
      canPostInChannel(
        { university_id: JECRC_ID, is_read_only: true, requires_verified_student: false },
        staff
      )
    ).toBe(true);
  });

  it("restricts direct conversations strictly to participants", () => {
    expect(canAccessDirectConversation(["u1", "u2"], "u1")).toBe(true);
    expect(canAccessDirectConversation(["u1", "u2"], "u3")).toBe(false);
    expect(canAccessDirectConversation(["u1", "u2"], null)).toBe(false);
  });

  it("validates upload file size, extension, and MIME type", () => {
    expect(
      validateResourceUpload({
        name: "dbms-notes.pdf",
        mimeType: "application/pdf",
        size: 1024 * 500,
      }).valid
    ).toBe(true);

    expect(
      validateResourceUpload({
        name: "malware.exe",
        mimeType: "application/x-msdownload",
        size: 1024,
      }).valid
    ).toBe(false);

    expect(
      validateResourceUpload({
        name: "huge.pdf",
        mimeType: "application/pdf",
        size: 30 * 1024 * 1024,
      }).valid
    ).toBe(false);
  });

  it("never reports expired or stale opportunities as active", () => {
    const now = new Date("2026-11-24T12:00:00Z");
    expect(
      isOpportunityActive(
        {
          verification_status: "verified_current",
          deadline: "2026-12-01T00:00:00Z",
          expires_at: null,
        },
        now
      )
    ).toBe(true);

    expect(
      isOpportunityActive(
        {
          verification_status: "verified_current",
          deadline: "2026-11-01T00:00:00Z",
          expires_at: null,
        },
        now
      )
    ).toBe(false);

    expect(
      isOpportunityActive(
        {
          verification_status: "expired",
          deadline: "2026-12-20T00:00:00Z",
          expires_at: null,
        },
        now
      )
    ).toBe(false);
  });
});
