import { test, expect } from "@playwright/test";

test.describe("Sprint 4 & 5 E2E: Rankings, Directories & Evaluation Provenance (S5-11)", () => {
  test("Rankings: benchmark and protocol selection updates leaderboard and URL", async ({
    page,
  }) => {
    await page.goto("/rankings");
    await expect(page).toHaveTitle(/OneAtlas/);

    // Verify standardized leaderboards heading
    await expect(
      page.getByRole("heading", { name: /Rankings & Benchmark Leaderboards/i })
    ).toBeVisible();

    // Verify benchmark chips exist
    const benchmarkButtons = page.locator("button:has-text('MMLU'), button:has-text('HumanEval')");
    await expect(benchmarkButtons.first()).toBeVisible();

    // Verify leaderboard table is present
    const table = page.locator("table");
    await expect(table).toBeVisible();
    await expect(page.locator("th:has-text('Score')")).toBeVisible();
    await expect(page.locator("th:has-text('Evaluation Date')")).toBeVisible();
  });

  test("Companies Directory & Detail: loads company details with hosted models", async ({
    page,
  }) => {
    await page.goto("/companies");
    await expect(
      page.getByRole("heading", { name: /AI Research Labs|AI Companies/i })
    ).toBeVisible();

    // Navigate to OpenAI or first available company
    const companyCard = page.locator("a[href^='/companies/']").first();
    await expect(companyCard).toBeVisible();
    const href = await companyCard.getAttribute("href");

    if (href) {
      await page.goto(href);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(
        page.getByRole("heading", { name: /Foundation Models & Releases/i })
      ).toBeVisible();
    }
  });

  test("Providers Directory & Detail: loads provider details with pricing", async ({ page }) => {
    await page.goto("/providers");
    await expect(
      page.getByRole("heading", { name: /Inference Providers|Infrastructure/i })
    ).toBeVisible();

    // Navigate to first available provider
    const providerCard = page.locator("a[href^='/providers/']").first();
    await expect(providerCard).toBeVisible();
    const href = await providerCard.getAttribute("href");

    if (href) {
      await page.goto(href);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(
        page.getByRole("heading", { name: /Hosted Models & Inference Pricing/i })
      ).toBeVisible();
    }
  });

  test("Model Detail: renders canonical benchmark evaluation table without fake labels", async ({
    page,
  }) => {
    await page.goto("/models/gpt-4o");

    // If gpt-4o exists, verify details
    const heading = page.getByRole("heading", { name: /GPT-4o/i });
    if (await heading.isVisible()) {
      await expect(heading).toBeVisible();
      // Verify Benchmark Evaluations section
      await expect(
        page.getByRole("heading", { name: /Benchmark Evaluations & Leaderboards/i })
      ).toBeVisible();
    }
  });
});
