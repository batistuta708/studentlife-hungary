import { test, expect } from "@playwright/test";

test.describe("Public navigation", () => {
  test("home page loads with the hero and nav", async ({ page, isMobile }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Your life in Hungary");

    if (isMobile) {
      // On mobile the inline nav is intentionally hidden in favor of the hamburger menu.
      await expect(page.getByRole("button", { name: "Toggle menu" })).toBeVisible();
    } else {
      // "Blog" also appears in the footer — scope to the header nav landmark.
      await expect(page.getByRole("navigation").getByRole("link", { name: "Blog" })).toBeVisible();
    }
  });

  test("nav links lead to the blog and jobs listing pages", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Blog" }).first().click();
    await expect(page).toHaveURL(/\/blog$/);
    await expect(page.getByRole("heading", { name: "Blog" })).toBeVisible();

    await page.goto("/");
    await page.getByRole("link", { name: "Jobs" }).first().click();
    await expect(page).toHaveURL(/\/jobs$/);
    await expect(page.getByRole("heading", { name: "Student Jobs" })).toBeVisible();
  });

  test("visiting a non-existent page shows the custom 404", async ({ page }) => {
    await page.goto("/this-page-does-not-exist");
    await expect(page.getByText("404")).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to Home" })).toBeVisible();
  });

  test("dark mode toggle switches the theme", async ({ page, isMobile }) => {
    await page.goto("/");
    if (isMobile) {
      await page.getByRole("button", { name: "Toggle menu" }).click(); // toggle only lives in the mobile menu
    }
    await page.getByRole("button", { name: "Toggle dark mode" }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("unauthenticated visitor hitting /dashboard is redirected to /login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Mobile responsiveness", () => {
  test("mobile menu opens and shows nav links", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Only relevant on the mobile project");
    await page.goto("/");
    await page.getByRole("button", { name: "Toggle menu" }).click();
    await expect(page.getByRole("navigation").getByRole("link", { name: "Housing" })).toBeVisible();
  });
});
