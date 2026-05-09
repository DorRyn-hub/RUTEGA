import { describe, expect, it } from "vitest";
import { generateTotp, generateTotpSecret, verifyTotp } from "@/lib/auth/totp";

describe("TOTP", () => {
  it("generated secret is base32 string", () => {
    const s = generateTotpSecret();
    expect(s.length).toBeGreaterThan(15);
    expect(/^[A-Z2-7]+$/.test(s)).toBe(true);
  });

  it("verifies its own freshly generated code", () => {
    const secret = generateTotpSecret();
    const code = generateTotp(secret);
    expect(verifyTotp(code, secret)).toBe(true);
  });

  it("rejects wrong codes", () => {
    const secret = generateTotpSecret();
    expect(verifyTotp("000000", secret)).toBe(false);
    expect(verifyTotp("999999", secret)).toBe(false);
  });

  it("rejects garbage input", () => {
    const secret = generateTotpSecret();
    expect(verifyTotp("abcdef", secret)).toBe(false);
    expect(verifyTotp("", secret)).toBe(false);
  });
});
