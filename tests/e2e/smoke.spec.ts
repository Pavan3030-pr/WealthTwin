import { test, expect } from "@playwright/test";

test.describe("WealthTwin smoke", () => {
  test("dashboard loads with synthetic twin data", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("WealthTwin")).toBeVisible();
    await expect(page.getByText("Synthetic data demo")).toBeVisible();
    await expect(page.getByText("Aarav Sharma")).toBeVisible();
    await expect(page.getByText("Financial Health")).toBeVisible();
    await expect(page.getByText("Net Worth")).toBeVisible();
    await expect(page.getByText("Cashflow Health")).toBeVisible();
    await expect(page.getByText("Portfolio Risk")).toBeVisible();
    await expect(page.getByText("Emergency Fund")).toBeVisible();
    await expect(page.getByText("Cashflow (last 6 months)")).toBeVisible();
    await expect(page.getByText(/Synthetic Data Notice/i)).toBeVisible();
  });

  test("insights page loads and shows explainable factors", async ({ page }) => {
    await page.goto("/insights");
    await expect(page.getByText("Insights & Alerts")).toBeVisible();
    await expect(page.getByText("Synthetic data demo")).toBeVisible();
    await expect(page.getByText("Contributing factors (explainability)")).toBeVisible();
  });

  test("goals page shows timeline", async ({ page }) => {
    await page.goto("/goals");
    await expect(page.getByText("Goals & Timeline")).toBeVisible();
    await expect(page.getByText("Projected Timeline")).toBeVisible();
    await expect(page.getByText("Emergency Fund (6 months)")).toBeVisible();
  });

  test("navigation between pages works", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Insights" }).click();
    await expect(page).toHaveURL(/\/insights/);
    await page.getByRole("link", { name: "Goals" }).click();
    await expect(page).toHaveURL(/\/goals/);
    await page.getByRole("link", { name: "Dashboard" }).click();
    await expect(page).toHaveURL("/");
  });
});
