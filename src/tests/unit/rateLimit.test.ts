import { describe, expect, it } from "vitest";
import { consumeRateLimit } from "@/lib/rateLimit";

describe("consumeRateLimit", () => {
  it("allows up to capacity then blocks", () => {
    const opts = { capacity: 3, refillPerSecond: 0 };
    const key = `test:${Math.random()}`;
    expect(consumeRateLimit(key, opts).allowed).toBe(true);
    expect(consumeRateLimit(key, opts).allowed).toBe(true);
    expect(consumeRateLimit(key, opts).allowed).toBe(true);
    expect(consumeRateLimit(key, opts).allowed).toBe(false);
  });
});
