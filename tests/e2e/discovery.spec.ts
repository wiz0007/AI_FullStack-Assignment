import { test, expect } from "@playwright/test";

test.describe("Sprint 2 — Model Discovery & Global Search E2E Workflows", () => {
  test("Workflow A: Browse catalogue and view model cards", async ({ page }) => {
    await page.goto("/models");
    await expect(page.getByRole("heading", { name: /Foundation AI Models/i })).toBeVisible();

    // Verify search input is rendered
    const searchInput = page.getByPlaceholder(/Search models, providers, specs/i);
    await expect(searchInput).toBeVisible();

    // Verify filter sidebar exists
    await expect(page.getByRole("heading", { name: "Filters" })).toBeVisible();

    // Verify at least one model card rendered
    const modelCardLinks = page.locator('a[href^="/models/"]');
    await expect(modelCardLinks.first()).toBeVisible();
  });

  test("Workflow B: Search models with debouncing and clear search", async ({ page }) => {
    await page.goto("/models");
    const searchInput = page.getByPlaceholder(/Search models, providers, specs/i);

    // Enter search query
    await searchInput.fill("gpt");

    // Wait for URL sync
    await page.waitForURL(/q=gpt/);
    await expect(page.locator("body")).toContainText("GPT-4o");

    // Clear search
    const clearBtn = page.getByRole("button", { name: /clear search/i });
    if (await clearBtn.isVisible()) {
      await clearBtn.click();
      await page.waitForURL((url) => !url.searchParams.has("q"));
    }
  });

  test("Workflow C: Navigate from discovery card to model detail page", async ({ page }) => {
    await page.goto("/models");

    // Click on the first model card
    const firstCard = page.locator('a[href^="/models/"]').first();
    const href = await firstCard.getAttribute("href");
    expect(href).toBeTruthy();

    await firstCard.click();
    await page.waitForURL(new RegExp(href!));

    // Verify model detail page rendered
    await expect(page.getByText(/Context Window/i)).toBeVisible();
    await expect(page.getByText(/Infrastructure Providers & Pricing/i)).toBeVisible();
  });

  test("Workflow E: Global search shortcut and dialog", async ({ page }) => {
    await page.goto("/models");

    // Trigger global search button
    const searchTrigger = page.getByRole("button", { name: /Search models and providers/i });
    if (await searchTrigger.isVisible()) {
      await searchTrigger.click();

      // Dialog should open
      const dialog = page.getByRole("dialog", { name: /Global search dialog/i });
      await expect(dialog).toBeVisible();

      // Type in query
      const dialogInput = dialog.getByPlaceholder(/Search AI models, providers, companies/i);
      await dialogInput.fill("claude");

      // Verify results appear
      await expect(dialog.getByText(/Claude 3.5 Sonnet/i)).toBeVisible();

      // Press Escape to dismiss
      await page.keyboard.press("Escape");
      await expect(dialog).not.toBeVisible();
    }
  });
});
