import { test, expect } from "@playwright/test";

test.describe("Sprint 3: Model Details & Comparison E2E Flows", () => {
  test("empty comparison page renders friendly empty state", async ({ page }) => {
    await page.goto("/compare");
    await expect(page.getByText("No Models Selected for Comparison")).toBeVisible();
    await expect(page.getByRole("button", { name: /Browse Model Catalogue/i })).toBeVisible();
  });

  test("comparison drawer appears when model is selected and navigates to comparison", async ({
    page,
  }) => {
    await page.goto("/models");
    // Wait for model cards to render
    const compareButtons = page.getByRole("button", { name: /^Compare$/i });
    if ((await compareButtons.count()) > 0) {
      await compareButtons.first().click();

      // Drawer should be visible
      await expect(page.getByText(/Comparison Drawer/i)).toBeVisible();
      await expect(page.getByRole("button", { name: /Compare Side-by-Side/i })).toBeVisible();

      // Click to open side-by-side comparison
      await page.getByRole("button", { name: /Compare Side-by-Side/i }).click();
      await expect(page).toHaveURL(/\/compare\?models=/);
    }
  });

  test("direct URL navigation with model query renders comparison table and specs", async ({
    page,
  }) => {
    await page.goto("/compare?models=gpt-4o,claude-3-5-sonnet");

    // Table specification headers should be rendered
    await expect(page.getByText("Context Window").first()).toBeVisible();
    await expect(page.getByText("Input Price (per 1M)").first()).toBeVisible();
    await expect(page.getByText("Output Price (per 1M)").first()).toBeVisible();

    // Check share button
    const shareBtn = page.getByRole("button", { name: /Share Comparison/i });
    await expect(shareBtn).toBeVisible();
  });
});
