import { describe, expect, it } from "vitest";
import {
  aiChatRequestSchema,
  resourceCreateSchema,
  signupSchema,
} from "@/lib/validation/schemas";
import { checkRateLimit, resetRateLimitsForTests } from "@/lib/rate-limit";
import { computeFreshnessStatus } from "@/lib/sources/opportunities";

describe("Validation Schemas & Rate Limiting", () => {
  it("validates student registration payloads", () => {
    const ok = signupSchema.safeParse({
      fullName: "Aarav Sharma",
      email: "aarav@example.com",
      password: "securepassword123",
      username: "aarav_jecrc",
      universityId: "11111111-1111-4111-8111-111111111111",
    });
    expect(ok.success).toBe(true);

    const badUsername = signupSchema.safeParse({
      fullName: "Aarav Sharma",
      email: "aarav@example.com",
      password: "securepassword123",
      username: "invalid user!",
      universityId: "11111111-1111-4111-8111-111111111111",
    });
    expect(badUsername.success).toBe(false);
  });

  it("separates authentic PYQ and AI practice paper types in schema", () => {
    const pyq = resourceCreateSchema.safeParse({
      universityId: "11111111-1111-4111-8111-111111111111",
      subjectName: "DBMS",
      title: "DBMS End Sem 2025",
      resourceType: "pyq",
      examType: "end_semester",
      examYear: 2025,
    });
    expect(pyq.success).toBe(true);

    const ai = resourceCreateSchema.safeParse({
      universityId: "11111111-1111-4111-8111-111111111111",
      subjectName: "DBMS",
      title: "AI Practice Questions",
      resourceType: "ai_practice_paper",
    });
    expect(ai.success).toBe(true);
  });

  it("validates AI persona values", () => {
    const valid = aiChatRequestSchema.safeParse({
      persona: "study_buddy",
      prompt: "Explain BCNF normalization",
    });
    expect(valid.success).toBe(true);

    const invalid = aiChatRequestSchema.safeParse({
      persona: "unknown_persona",
      prompt: "Hi",
    });
    expect(invalid.success).toBe(false);
  });

  it("enforces sliding-window rate limits", () => {
    resetRateLimitsForTests();
    expect(checkRateLimit("test:u1", 2, 60_000).allowed).toBe(true);
    expect(checkRateLimit("test:u1", 2, 60_000).allowed).toBe(true);
    expect(checkRateLimit("test:u1", 2, 60_000).allowed).toBe(false);
  });

  it("marks passed-deadline and stale opportunities accurately", () => {
    const now = new Date("2026-11-24T12:00:00Z");
    expect(
      computeFreshnessStatus(
        "verified_current",
        "2026-11-20T00:00:00Z",
        "2026-11-24T10:00:00Z",
        72,
        now
      )
    ).toBe("expired");

    expect(
      computeFreshnessStatus(
        "verified_current",
        null,
        "2026-11-18T00:00:00Z",
        72,
        now
      )
    ).toBe("stale");
  });
});
