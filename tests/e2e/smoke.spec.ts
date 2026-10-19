import { test, expect } from "@playwright/test";

test("landing to dashboard", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("one step ahead");
  await page.getByRole("link", { name: "Explore the twin" }).click();
  await expect(page).toHaveURL(/dashboard/);
  await expect(page.getByText("Synthetic data demo").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Financial health" })).toBeVisible();
});

test("every page renders", async ({ page }) => {
  for (const [path, heading] of [
    ["/forecast", "Your next 90 days"], ["/simulator", "Test a decision"], ["/portfolio", "Allocation, risk"],
    ["/goals", "Goals and probability"], ["/insights", "What your twin noticed"], ["/copilot", "Ask in plain language"], ["/learn", "Lessons that use"],
  ]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(heading);
  }
});

test("simulator reacts to a preset", async ({ page }) => {
  await page.goto("/simulator");
  await page.getByRole("button", { name: "Medical bill ₹1.5L" }).click();
  await expect(page.getByText("Impact summary")).toBeVisible();
});

test("copilot answers", async ({ page }) => {
  await page.goto("/copilot");
  await page.getByLabel("Ask a question").fill("Can I afford a ₹30,000 purchase?");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByText(/safety floor/).first()).toBeVisible({ timeout: 15000 });
});
