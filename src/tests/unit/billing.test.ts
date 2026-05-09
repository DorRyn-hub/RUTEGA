import { describe, expect, it } from "vitest";
import { rubToKop, kopToRub, periodKey, periodEnd } from "@/lib/billing/engine";

describe("billing helpers", () => {
  it("rubToKop converts roubles to kopecks", () => {
    expect(rubToKop(100)).toBe(10000);
    expect(rubToKop(1.99)).toBe(199);
  });

  it("kopToRub round-trips", () => {
    expect(kopToRub(rubToKop(123.45))).toBeCloseTo(123.45, 2);
  });

  it("periodKey produces YYYY-MM", () => {
    const d = new Date(Date.UTC(2026, 4, 15));
    expect(periodKey(d)).toBe("2026-05");
  });

  it("periodEnd returns first day of next month UTC", () => {
    const end = periodEnd("2026-05");
    expect(end.getUTCMonth()).toBe(5); // June (0-based)
    expect(end.getUTCDate()).toBe(1);
  });
});
