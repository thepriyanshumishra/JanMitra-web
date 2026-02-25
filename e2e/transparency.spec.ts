import { test, expect } from "@playwright/test";

/**
 * E2E: Public Transparency Dashboard
 *
 * Verifies that the public transparency page loads correctly
 * for unauthenticated visitors without errors.
 */
test.describe("Public Transparency Dashboard", () => {
    test("loads the page and shows the headline", async ({ page }) => {
        await page.goto("/transparency");

        // Hero headline must contain "Transparency"
        await expect(page.locator("h1")).toContainText("Transparency");
    });

    test("shows the Live City Intelligence badge", async ({ page }) => {
        await page.goto("/transparency");

        // Wait for page to settle out of loading state
        await page.waitForSelector("h1", { timeout: 10000 });

        const badge = page.getByText("Live City Intelligence");
        await expect(badge).toBeVisible();
    });

    test("renders the KPI strip with at least one stat card", async ({ page }) => {
        await page.goto("/transparency");
        await page.waitForSelector("h1", { timeout: 10000 });

        // Each stat card has its label visible
        const resolutionRate = page.getByText("Resolution Rate");
        await expect(resolutionRate).toBeVisible();
    });

    test("shows Governance Status banner", async ({ page }) => {
        await page.goto("/transparency");
        await page.waitForSelector("h1", { timeout: 10000 });

        const govStatus = page.getByText(/Governance Status/);
        await expect(govStatus).toBeVisible();
    });

    test("shows the Civic Issue Hotspots section", async ({ page }) => {
        await page.goto("/transparency");
        await page.waitForSelector("h1", { timeout: 10000 });

        const hotspots = page.getByText("Civic Issue Hotspots");
        await expect(hotspots).toBeVisible();
    });

    test("shows footer disclaimer text", async ({ page }) => {
        await page.goto("/transparency");
        await page.waitForSelector("h1", { timeout: 10000 });

        const disclaimer = page.getByText("All data is sourced directly from citizen");
        await expect(disclaimer).toBeVisible();
    });

    test("navbar is visible and shows JanMitra branding", async ({ page }) => {
        await page.goto("/transparency");

        const logo = page.getByText("JanMitra");
        await expect(logo.first()).toBeVisible();
    });

    test("shows the Report Issue CTA button", async ({ page }) => {
        await page.goto("/transparency");

        const cta = page.getByRole("link", { name: /Report Issue/i });
        await expect(cta).toBeVisible();
    });
});
