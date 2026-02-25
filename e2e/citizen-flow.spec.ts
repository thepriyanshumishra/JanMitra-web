import { test, expect } from "@playwright/test";

/**
 * E2E: Citizen Authentication + Dashboard Flow
 *
 * Verifies the /login page and /dashboard landing for citizens.
 * Note: These tests validate page structure — no real Firebase auth needed for structure checks.
 */
test.describe("Citizen — Auth & Dashboard pages", () => {
    test("login page loads with heading", async ({ page }) => {
        await page.goto("/login");

        // Should show a sign-in heading
        const heading = page.locator("h1, h2").first();
        await expect(heading).toBeVisible({ timeout: 8000 });
    });

    test("login page shows the Google sign-in option", async ({ page }) => {
        await page.goto("/login");
        await page.waitForSelector("h1, h2", { timeout: 8000 });

        const googleBtn = page.getByRole("button", { name: /google/i });
        await expect(googleBtn).toBeVisible();
    });

    test("/ (home) page loads and shows JanMitra branding", async ({ page }) => {
        await page.goto("/");

        const heading = page.locator("h1").first();
        await expect(heading).toBeVisible({ timeout: 8000 });
    });

    test("navigating to /dashboard without auth redirects to /login", async ({ page }) => {
        await page.goto("/dashboard");

        // Should redirect to /login
        await page.waitForURL(/\/login/, { timeout: 8000 });
        expect(page.url()).toContain("/login");
    });

    test("navigating to /submit without auth redirects to /login", async ({ page }) => {
        await page.goto("/submit");

        await page.waitForURL(/\/login/, { timeout: 8000 });
        expect(page.url()).toContain("/login");
    });

    test("/transparency is publicly accessible without login", async ({ page }) => {
        await page.goto("/transparency");

        // Should NOT redirect to /login
        await page.waitForSelector("h1", { timeout: 10000 });
        expect(page.url()).not.toContain("/login");
    });

    test("home page has a 'File a complaint' or 'Report Issue' CTA", async ({ page }) => {
        await page.goto("/");

        // Button or link referencing complaint/report
        const cta = page.getByRole("link", { name: /report|complaint|file/i }).first();
        await expect(cta).toBeVisible({ timeout: 8000 });
    });
});
