import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { signSession, verifySession } from "@/lib/auth/jwt";

describe("password hashing", () => {
  it("hashes and verifies the same password", async () => {
    const hash = await hashPassword("Demo12345!");
    expect(hash).not.toBe("Demo12345!");
    await expect(verifyPassword("Demo12345!", hash)).resolves.toBe(true);
  });

  it("rejects a wrong password", async () => {
    const hash = await hashPassword("Demo12345!");
    await expect(verifyPassword("WrongPassword1", hash)).resolves.toBe(false);
  });
});

describe("session jwt", () => {
  it("signs and verifies a session", async () => {
    const token = await signSession({ sub: "user-1", email: "u@example.com" });
    const payload = await verifySession(token);
    expect(payload).toEqual({ sub: "user-1", email: "u@example.com" });
  });

  it("rejects a tampered token", async () => {
    const token = await signSession({ sub: "user-1", email: "u@example.com" });
    const tampered = `${token.slice(0, -2)}xx`;
    await expect(verifySession(tampered)).resolves.toBeNull();
  });

  it("rejects an expired token", async () => {
    const token = await signSession({ sub: "user-1", email: "u@example.com" }, -10);
    await expect(verifySession(token)).resolves.toBeNull();
  });
});
