import { test, expect } from "@playwright/test";

test.describe("WealthTwin smoke", () => {
  test("dashboard loads with synthetic twin data", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("WealthTwin").first()).toBeVisible();
    await expect(page.getByText("Synthetic data demo")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Aarav Sharma" })).toBeVisible();
    await expect(page.getByText("Financial Health")).toBeVisible();

    // Risk cards — use headings to avoid matching body text
    await expect(page.getByRole("heading", { name: "Net Worth" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Cashflow Health" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Portfolio Risk" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Emergency Fund" })).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "Cashflow (last 6 months)" })
    ).toBeVisible();
    await expect(page.getByText(/Synthetic Data Notice/i)).toBeVisible();
  });

  test("insights page loads and shows explainable factors", async ({ page }) => {
    await page.goto("/insights");

    await expect(
      page.getByRole("heading", { name: "Insights & Alerts" })
    ).toBeVisible();
    await expect(page.getByText("Synthetic data demo")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Contributing factors (explainability)" })
    ).toBeVisible();
  });

  test("goals page shows timeline", async ({ page }) => {
    await page.goto("/goals");

    await expect(
      page.getByRole("heading", { name: "Goals & Timeline" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Projected Timeline" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Emergency Fund (6 months)" })
    ).toBeVisible();
  });

  test("navigation between pages works", async ({ page }) => {
    await page.goto("/");

    // exact: true so "View insights →" does not match
    await page.getByRole("link", { name: "Insights", exact: true }).click();
    await expect(page).toHaveURL(/\/insights/);

    await page.getByRole("link", { name: "Goals", exact: true }).click();
    await expect(page).toHaveURL(/\/goals/);

    await page.getByRole("link", { name: "Dashboard", exact: true }).click();
    await expect(page).toHaveURL("/");
  });
});
