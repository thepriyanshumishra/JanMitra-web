import { test, expect } from "@playwright/test";

/**
 * E2E: Officer Dashboard — page structure and route protection.
 *
 * Note: Full officer flow (acknowledge/close) requires a seeded Firebase account.
 * These tests verify the page guards and structure for unauthenticated users.
 */
test.describe("Officer — Route Guards & Page Structure", () => {
    test("navigating to /officer without auth redirects to /login", async ({ page }) => {
        await page.goto("/officer");

        await page.waitForURL(/\/login/, { timeout: 8000 });
        expect(page.url()).toContain("/login");
    });

    test("navigating to admin complaint detail without auth redirects to /login", async ({ page }) => {
        await page.goto("/officer/complaints/JM-2025-123456");

        await page.waitForURL(/\/login/, { timeout: 8000 });
        expect(page.url()).toContain("/login");
    });

    test("/admin/dept without auth redirects to /login", async ({ page }) => {
        await page.goto("/admin/dept");

        await page.waitForURL(/\/login/, { timeout: 8000 });
        expect(page.url()).toContain("/login");
    });

    test("/admin/system without auth redirects to /login", async ({ page }) => {
        await page.goto("/admin/system");

        await page.waitForURL(/\/login/, { timeout: 8000 });
        expect(page.url()).toContain("/login");
    });

    test("/profile without auth redirects to /login", async ({ page }) => {
        await page.goto("/profile");

        await page.waitForURL(/\/login/, { timeout: 8000 });
        expect(page.url()).toContain("/login");
    });
});

/**
 * E2E: Navigation structure
 */
test.describe("Navigation — Public pages structure", () => {
    test("/ renders without a 500 error", async ({ page }) => {
        const response = await page.goto("/");
        expect(response?.status()).toBeLessThan(500);
    });

    test("/transparency renders without a 500 error", async ({ page }) => {
        const response = await page.goto("/transparency");
        expect(response?.status()).toBeLessThan(500);
    });

    test("/login renders without a 500 error", async ({ page }) => {
        const response = await page.goto("/login");
        expect(response?.status()).toBeLessThan(500);
    });

    test("page title is set on the home page", async ({ page }) => {
        await page.goto("/");
        const title = await page.title();
        expect(title.length).toBeGreaterThan(0);
    });
});
