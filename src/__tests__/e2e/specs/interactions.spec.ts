// src/__tests__/e2e/specs/interactions.spec.ts
import { expect, test } from "@playwright/test";
import { goto } from "../fixtures/utils";

test.describe("Like, Comment & Bookmark", () => {
    async function waitForFeed(page: any) {
        await goto(page, "/discovery");
        await expect(
            page.getByRole("tabpanel").getByRole("article").first(),
        ).toBeVisible({ timeout: 20_000 });
    }

    test("discovery page loads the feed", async ({ page }) => {
        await waitForFeed(page);
        await expect(
            page.getByRole("heading", { name: /Discover/i }),
        ).toBeVisible();
        await expect(
            page.getByRole("tabpanel").getByRole("article").first(),
        ).toBeVisible({ timeout: 10_000 });
    });

    test("like button is visible on feed posts", async ({ page }) => {
        await waitForFeed(page);

        const likeBtn = page
            .getByRole("tabpanel")
            .getByRole("button", { name: /like this post|unlike this post/i })
            .first();

        await expect(likeBtn).toBeVisible({ timeout: 10_000 });
    });

    test("user can like a post", async ({ page }) => {
        await waitForFeed(page);

        const tabPanel = page.getByRole("tabpanel");

        // ✅ Wait for like button to be fully ready
        // The button only renders (not the loading skeleton) when isAuthLoading=false
        // and isProfileComplete is known
        const likeBtn = tabPanel
            .getByRole("button", { name: /like this post|unlike this post/i })
            .first();

        await expect(likeBtn).toBeVisible({ timeout: 10_000 });

        // ✅ Extra wait — let usePostLikes query fully resolve
        // so data !== undefined before we click
        await page.waitForTimeout(2000);

        // Re-grab button after wait to get fresh state
        const likeBtnFresh = tabPanel
            .getByRole("button", { name: /like this post|unlike this post/i })
            .first();

        const initialLabel = await likeBtnFresh.getAttribute("aria-label");
        const wasAlreadyLiked = initialLabel?.toLowerCase().startsWith(
            "unlike",
        );

        // Click to toggle
        await likeBtnFresh.click();

        // ✅ Optimistic update fires instantly via onMutate
        // Heart SVG class changes immediately
        if (wasAlreadyLiked) {
            // Liked → unliked: heart loses red fill
            await expect(
                likeBtnFresh.locator("svg"),
            ).not.toHaveClass(/fill-red-500/, { timeout: 10_000 });
        } else {
            // Unliked → liked: heart gains red fill
            await expect(
                likeBtnFresh.locator("svg"),
            ).toHaveClass(/fill-red-500/, { timeout: 10_000 });
        }
    });

    test("bookmark button is visible on feed posts", async ({ page }) => {
        await waitForFeed(page);

        const bookmarkBtn = page
            .getByRole("tabpanel")
            .getByRole("button", { name: /add bookmark|remove bookmark/i })
            .first();

        await expect(bookmarkBtn).toBeVisible({ timeout: 10_000 });
    });

    test("user can bookmark a post", async ({ page }) => {
        await waitForFeed(page);

        const tabPanel = page.getByRole("tabpanel");

        const bookmarkBtn = tabPanel
            .getByRole("button", { name: /add bookmark|remove bookmark/i })
            .first();

        await expect(bookmarkBtn).toBeVisible({ timeout: 10_000 });

        // ✅ Extra wait — let useBookmark query fully resolve
        await page.waitForTimeout(2000);

        // Re-grab after wait
        const bookmarkBtnFresh = tabPanel
            .getByRole("button", { name: /add bookmark|remove bookmark/i })
            .first();

        const initialLabel = await bookmarkBtnFresh.getAttribute("aria-label");
        const wasAlreadyBookmarked = initialLabel
            ?.toLowerCase()
            .includes("remove");

        // Click to toggle
        await bookmarkBtnFresh.click();

        // ✅ Optimistic update via onMutate fires immediately
        if (wasAlreadyBookmarked) {
            // Bookmarked → unbookmarked: icon loses fill
            await expect(
                bookmarkBtnFresh.locator("svg"),
            ).not.toHaveClass(/fill-current/, { timeout: 10_000 });
        } else {
            // Not bookmarked → bookmarked: icon gains fill
            await expect(
                bookmarkBtnFresh.locator("svg"),
            ).toHaveClass(/fill-current/, { timeout: 10_000 });
        }
    });
});
