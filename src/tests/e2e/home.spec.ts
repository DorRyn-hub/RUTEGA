import { test, expect } from "@playwright/test";

test("home page renders hero and login link", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBeLessThan(400);

  await expect(page.getByRole("heading", { level: 1 })).toContainText(/интернет/i);

  const loginLink = page.getByRole("link", { name: /войти/i }).first();
  await expect(loginLink).toBeVisible();
  await loginLink.click();
  await expect(page).toHaveURL(/\/lk\/login/);
});

test("services catalog lists at least one card", async ({ page }) => {
  await page.goto("/services");
  await expect(page.getByRole("heading", { level: 1, name: /услуги/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /домашний интернет/i }).first()).toBeVisible();
});
