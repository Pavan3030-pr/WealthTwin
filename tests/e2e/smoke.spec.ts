import { test, expect } from "@playwright/test";

test("landing to dashboard", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("one step ahead");
  await page.getByRole("link", { name: "Explore the twin" }).click();
  await expect(page).toHaveURL(/dashboard/);
  await expect(page.locator('text="Synthetic data demo" >> visible=true').first()).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Aarav");
});

test("every page renders", async ({ page }) => {
  for (const [path, heading] of [
    ["/forecast", "Your next 90 days"], ["/simulator", "Test a decision"], ["/portfolio", "Allocation, risk"],
    ["/goals", "Goals and probability"], ["/insights", "What your twin noticed"], ["/copilot", "Ask in plain language"],
    ["/learn", "Lessons that use"], ["/pitch", "Why WealthTwin wins"], ["/my-numbers", "Build a twin"], ["/assumptions", "Every assumption"], ["/report", "One page, ready to share"],
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

test("own numbers build a personal twin", async ({ page }) => {
  await page.goto("/my-numbers");
  await page.getByRole("button", { name: "Fill with an example" }).click();
  await page.getByRole("button", { name: "Build my twin" }).click();
  await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Priya");
});

test("own numbers reject invalid input", async ({ page }) => {
  await page.goto("/my-numbers");
  await page.getByLabel("Monthly take-home").fill("100");
  await page.getByLabel("Per month").fill("20000");
  await page.getByLabel("Age").fill("30");
  await page.getByRole("button", { name: "Build my twin" }).click();
  await expect(page.getByRole("alert")).toBeVisible();
});
