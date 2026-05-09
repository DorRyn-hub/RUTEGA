import { describe, expect, it } from "vitest";
import { calculateUptime, compensationPercent } from "@/lib/sla/engine";

describe("SLA uptime calculation", () => {
  it("100% when no downtime", () => {
    expect(calculateUptime(0)).toBe(100);
  });

  it("decreases as downtime grows", () => {
    const a = calculateUptime(60); // 1 hour
    const b = calculateUptime(60 * 24); // 1 day
    expect(a).toBeLessThan(100);
    expect(b).toBeLessThan(a);
  });

  it("rounds to two decimals", () => {
    const v = calculateUptime(7);
    expect(Number.isFinite(v)).toBe(true);
    expect(String(v).split(".")[1]?.length ?? 0).toBeLessThanOrEqual(2);
  });
});

describe("SLA compensation thresholds", () => {
  it("no compensation when uptime is high", () => {
    expect(compensationPercent(99.95)).toBe(0);
  });

  it("returns 5% under 99 but above 98", () => {
    expect(compensationPercent(98.5)).toBe(5);
  });

  it("returns 10% under 98 but above 95", () => {
    expect(compensationPercent(97.5)).toBe(10);
  });

  it("returns 25% under 95", () => {
    expect(compensationPercent(94)).toBe(25);
  });

  it("returns 50% under 90", () => {
    expect(compensationPercent(80)).toBe(50);
  });

  it("clamped at top of brackets, lowest threshold wins per uptime", () => {
    // for 99.5 → no rule triggered at threshold 99.0 since 99.5 > 99.0
    expect(compensationPercent(99.5)).toBe(0);
    // for 99 exactly → still no compensation (strict <)
    expect(compensationPercent(99)).toBe(0);
  });
});
