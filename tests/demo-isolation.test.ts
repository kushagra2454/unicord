import { describe, expect, it } from "vitest";
import { createInitialDemoState } from "@/lib/demo/store";
import { getIntegrationStatus } from "@/lib/env";

describe("Professor Demo Mode Isolation", () => {
  it("labels all demo state clearly and separates environment='demo'", () => {
    const demo = createInitialDemoState();
    expect(demo.environment).toBe("demo");
    expect(demo.resources.every((r) => /DEMO|AI-GENERATED/i.test(r.label))).toBe(true);
    expect(
      demo.opportunities.every((o) =>
        o.label.includes("DEMO — EXAMPLE ONLY — NOT AN ACTIVE VACANCY")
      )
    ).toBe(true);
    expect(
      demo.messages.every((m) => m.senderBadge === "DEMO USER — SIMULATED PARTICIPANT")
    ).toBe(true);
  });

  it("reports integration readiness honestly without fabricating env state", () => {
    const status = getIntegrationStatus();
    expect(typeof status.supabaseReady).toBe("boolean");
    expect(typeof status.geminiConfigured).toBe("boolean");
  });
});
