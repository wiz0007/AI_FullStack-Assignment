import { test, expect } from "@playwright/test";

test.describe("OneAtlas Smoke E2E Tests", () => {
  test("Scenario 1: Homepage loads and renders main navigation and hero", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/OneAtlas/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("navigation")).toBeVisible();
  });

  test("Scenario 3: Theme switcher is accessible and operational", async ({ page }) => {
    await page.goto("/");
    const themeButton = page.getByRole("button", { name: /switch to/i });
    await expect(themeButton).toBeVisible();

    // Verify initial data-theme is light
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-theme", "light");

    // Toggle theme to dark
    await themeButton.click();
    await expect(html).toHaveAttribute("data-theme", "dark");

    // Refresh and verify persistence
    await page.reload();
    await expect(html).toHaveAttribute("data-theme", "dark");
  });

  test("Scenario 6: Health endpoint responds with 200 OK", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data.status).toBe("healthy");
  });

  test("Navigation routes resolve to pages", async ({ page }) => {
    await page.goto("/models");
    await expect(page.getByRole("heading", { name: /Foundation AI Models/i })).toBeVisible();

    await page.goto("/compare");
    await expect(page.getByRole("heading", { name: /Model Comparison/i })).toBeVisible();

    await page.goto("/rankings");
    await expect(page.getByRole("heading", { name: /Rankings & Benchmark/i })).toBeVisible();
  });
});
