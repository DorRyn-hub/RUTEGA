import { describe, expect, it } from "vitest";
import { formatRub, formatRubPerMonth, formatPeriod } from "@/lib/format";

describe("formatRub", () => {
  it("formats integer rubles in ru-RU", () => {
    const formatted = formatRub(1234);
    expect(formatted).toMatch(/1.?234/);
    expect(formatted).toContain("₽");
  });
});

describe("formatRubPerMonth", () => {
  it("appends /мес", () => {
    expect(formatRubPerMonth(890)).toMatch(/мес$/);
  });
});

describe("formatPeriod", () => {
  it("turns YYYY-MM into a Russian month + year", () => {
    expect(formatPeriod("2026-04")).toBe("Апрель 2026");
    expect(formatPeriod("2026-12")).toBe("Декабрь 2026");
  });

  it("returns the input on bad data", () => {
    expect(formatPeriod("not-a-period")).toBe("not-a-period");
  });
});
