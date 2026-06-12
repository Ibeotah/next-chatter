// src/__tests__/e2e/specs/search.spec.ts
import { expect, test } from "@playwright/test";
import { goto } from "../fixtures/utils";

test.describe("Search Posts", () => {
    test("search input is visible on desktop discovery page", async ({ page }) => {
        await goto(page, "/discovery");

        const searchInput = page.getByPlaceholder(
            "Search global chatter records...",
        );
        await expect(searchInput).toBeVisible();
    });

    test("typing in search filters the feed", async ({ page }) => {
        await goto(page, "/discovery");

        await page.waitForSelector("article", { timeout: 15_000 });

        const searchInput = page.getByPlaceholder(
            "Search global chatter records...",
        );
        await searchInput.fill("test");

        // Debounce is 300ms — wait for URL to update
        await page.waitForURL(/search=test/, { timeout: 10_000 });
        await expect(page).toHaveURL(/search=test/);
    });

    test("clearing search returns to full feed", async ({ page }) => {
        await goto(page, "/discovery?search=test");

        // Wait for page to fully load with search applied
        await page.waitForSelector("article", { timeout: 15_000 });

        const searchInput = page.getByPlaceholder(
            "Search global chatter records...",
        );

        // Confirm search value is pre-filled
        await expect(searchInput).toHaveValue("test");

        // ✅ Use fill("") instead of clear() — triggers React onChange reliably
        await searchInput.fill("");

        // ✅ FIXED: router.replace produces "/discovery?" (trailing ?)
        // when params is empty — match both cases
        await page.waitForURL(
            (url) => {
                const path = url.pathname;
                const search = url.search;
                // Accept /discovery with no params OR empty params
                return path === "/discovery" &&
                    (search === "" || search === "?");
            },
            { timeout: 15_000 },
        );

        // ✅ Confirm search param is gone (don't care about trailing ?)
        await expect(page).not.toHaveURL(/search=/);
    });

    test("empty search shows empty state or feed", async ({ page }) => {
        await goto(page, "/discovery?search=zzz_no_results_xyz_12345");

        const emptyState = page.getByText(
            /quiet today|no results|nothing here/i,
        );
        const articles = page.locator("article");

        const hasEmptyState = await emptyState.isVisible().catch(() => false);
        const articleCount = await articles.count();

        expect(hasEmptyState || articleCount === 0).toBeTruthy();
    });
});
