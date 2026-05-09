import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "@/lib/validation/auth";
import { contactSchema } from "@/lib/validation/contact";
import { leadSchema } from "@/lib/validation/lead";

describe("loginSchema", () => {
  it("rejects an empty identifier", () => {
    const result = loginSchema.safeParse({ identifier: "", password: "anything" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("identifier"))).toBe(true);
    }
  });

  it("requires a password", () => {
    const result = loginSchema.safeParse({ identifier: "a@b.com", password: "" });
    expect(result.success).toBe(false);
  });

  it("accepts an email", () => {
    const result = loginSchema.safeParse({ identifier: "a@b.com", password: "x" });
    expect(result.success).toBe(true);
  });

  it("accepts a username", () => {
    const result = loginSchema.safeParse({ identifier: "admin2222", password: "x" });
    expect(result.success).toBe(true);
  });
});

describe("registerSchema", () => {
  const valid = {
    fullName: "Иван Иванов",
    email: "ivan@example.com",
    phone: "+7 999 123 45 67",
    password: "Strong1Password",
    consent: true as const,
  };

  it("accepts valid input", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("requires consent", () => {
    const result = registerSchema.safeParse({ ...valid, consent: false });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("consent"))).toBe(true);
    }
  });

  it("rejects a weak password", () => {
    const result = registerSchema.safeParse({ ...valid, password: "weak" });
    expect(result.success).toBe(false);
  });
});

describe("contactSchema", () => {
  it("accepts a minimal contact with consent", () => {
    const result = contactSchema.safeParse({
      name: "Аня",
      phone: "+7 999 123 45 67",
      consent: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects when 152-FZ consent is missing", () => {
    const result = contactSchema.safeParse({ name: "Аня", phone: "+7 999 123 45 67" });
    expect(result.success).toBe(false);
  });
});

describe("leadSchema", () => {
  it("requires consent", () => {
    const result = leadSchema.safeParse({
      name: "Аня",
      phone: "+7 999 123 45 67",
      source: "callback",
      consent: false,
    });
    expect(result.success).toBe(false);
  });
});
