import { describe, expect, it } from "vitest";
import { calculateQuote } from "@/lib/connection/engine";

describe("connection quote calculator", () => {
  it("internet quote includes both one-off and recurring items", () => {
    const q = calculateQuote({ serviceType: "internet", speedMbps: 100 });
    expect(q.items.length).toBe(2);
    expect(q.items.some((i) => i.recurring)).toBe(true);
    expect(q.items.some((i) => !i.recurring)).toBe(true);
    expect(q.oneOffKop).toBeGreaterThan(0);
    expect(q.monthlyKop).toBeGreaterThan(0);
  });

  it("L2-VPN is more expensive than plain internet at same speed", () => {
    const a = calculateQuote({ serviceType: "internet", speedMbps: 100 });
    const b = calculateQuote({ serviceType: "l2vpn", speedMbps: 100 });
    expect(b.monthlyKop).toBeGreaterThan(a.monthlyKop);
    expect(b.oneOffKop).toBeGreaterThan(a.oneOffKop);
  });

  it("distance increases one-off over a 200m baseline", () => {
    const close = calculateQuote({ serviceType: "internet", speedMbps: 100, distanceMeters: 100 });
    const far = calculateQuote({ serviceType: "internet", speedMbps: 100, distanceMeters: 1000 });
    expect(far.oneOffKop).toBeGreaterThan(close.oneOffKop);
  });

  it("includes validUntil in the future", () => {
    const q = calculateQuote({ serviceType: "hosting", speedMbps: 100 });
    expect(q.validUntil).not.toBeNull();
    if (q.validUntil) {
      expect(new Date(q.validUntil).getTime()).toBeGreaterThan(Date.now());
    }
  });
});
