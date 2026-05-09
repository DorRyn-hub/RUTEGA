import { test, expect } from "@playwright/test";

test("login form validates empty submission", async ({ page }) => {
  await page.goto("/lk/login");
  await page.getByRole("button", { name: /войти/i }).click();

  const alerts = page.getByRole("alert");
  await expect(alerts).toHaveCount(2);
});

test("login form rejects an invalid email", async ({ page }) => {
  await page.goto("/lk/login");
  await page.getByLabel("E-mail").fill("not-an-email");
  await page.getByLabel("Пароль").fill("anything");
  await page.getByRole("button", { name: /войти/i }).click();

  await expect(page.getByText(/некорректный e-mail/i)).toBeVisible();
});

test("/lk redirects to /lk/login without a session cookie", async ({ page }) => {
  await page.context().clearCookies();
  await page.goto("/lk");
  await expect(page).toHaveURL(/\/lk\/login/);
});
