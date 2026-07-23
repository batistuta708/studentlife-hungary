import { test, expect } from "@playwright/test";

// These tests hit the real backend (via the app's configured NEXT_PUBLIC_API_URL), so
// they require both `npm run dev` (frontend) and the backend server + a reachable
// MongoDB to be running — see docs/PHASE8-TESTING.md for how to run the full stack
// before running this file.
test.describe("Authentication", () => {
  test("a new user can register, land on the dashboard, and see their name", async ({ page }) => {
    const uniqueEmail = `e2e-${Date.now()}@example.com`;

    await page.goto("/register");
    await page.getByLabel("Full name").fill("Playwright Test User");
    await page.getByLabel("Email").fill(uniqueEmail);
    await page.getByLabel("Password", { exact: true }).fill("testpassword123");
    await page.getByLabel("Confirm password").fill("testpassword123");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText("Welcome back, Playwright")).toBeVisible();
  });

  test("shows a validation error for mismatched passwords before hitting the API", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Full name").fill("Mismatch Test");
    await page.getByLabel("Email").fill(`mismatch-${Date.now()}@example.com`);
    await page.getByLabel("Password", { exact: true }).fill("testpassword123");
    await page.getByLabel("Confirm password").fill("different-password");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText("Passwords do not match")).toBeVisible();
    await expect(page).toHaveURL(/\/register/); // never left the page
  });

  test("logging in with a wrong password shows a server error message", async ({ page }) => {
    const email = `login-test-${Date.now()}@example.com`;

    await page.goto("/register");
    await page.getByLabel("Full name").fill("Login Test");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill("correctpassword123");
    await page.getByLabel("Confirm password").fill("correctpassword123");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
  });
});
