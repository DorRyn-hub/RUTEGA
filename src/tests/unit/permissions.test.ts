import { describe, expect, it } from "vitest";
import { hasPermission, rolePermissions, ORG_ROLES } from "@/lib/auth/permissions";

describe("RBAC permissions", () => {
  it("director has full set", () => {
    expect(hasPermission("director", "billing.pay")).toBe(true);
    expect(hasPermission("director", "members.write")).toBe(true);
    expect(hasPermission("director", "audit.read")).toBe(true);
    expect(hasPermission("director", "api.write")).toBe(true);
  });

  it("accountant cannot manage members or services", () => {
    expect(hasPermission("accountant", "members.write")).toBe(false);
    expect(hasPermission("accountant", "services.write")).toBe(false);
    expect(hasPermission("accountant", "billing.pay")).toBe(true);
  });

  it("tech cannot pay or read audit", () => {
    expect(hasPermission("tech", "billing.pay")).toBe(false);
    expect(hasPermission("tech", "audit.read")).toBe(false);
    expect(hasPermission("tech", "tickets.write")).toBe(true);
    expect(hasPermission("tech", "services.write")).toBe(true);
  });

  it("viewer is read-only", () => {
    for (const perm of [
      "billing.pay",
      "members.write",
      "services.write",
      "tickets.write",
      "api.write",
    ] as const) {
      expect(hasPermission("viewer", perm)).toBe(false);
    }
    expect(hasPermission("viewer", "billing.read")).toBe(true);
  });

  it("rolePermissions returns at least 1 perm for every role", () => {
    for (const role of ORG_ROLES) {
      expect(rolePermissions(role).length).toBeGreaterThan(0);
    }
  });

  it("returns false for null/undefined role", () => {
    expect(hasPermission(undefined, "billing.read")).toBe(false);
    expect(hasPermission(null, "billing.read")).toBe(false);
  });
});
