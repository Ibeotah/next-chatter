// src/__tests__/e2e/specs/posts.spec.ts
import { expect, test } from "@playwright/test";
import { goto } from "../fixtures/utils";

test.describe("Write & Publish Post", () => {
    test("editor page loads with title input and Publish button", async ({ page }) => {
        await goto(page, "/new-post");
        await expect(page).toHaveURL("/new-post");

        // ✅ Title input — exact placeholder from PostContentEditor
        await expect(
            page.getByPlaceholder("Enter your story title here..."),
        ).toBeVisible({ timeout: 10_000 });

        // ✅ Buttons live inside role="group" aria-label="Save actions"
        const saveActions = page.getByRole("group", { name: "Save actions" });

        await expect(
            saveActions.getByRole("button", { name: "Save Draft" }),
        ).toBeVisible({ timeout: 10_000 });

        await expect(
            saveActions.getByRole("button", { name: "Publish" }),
        ).toBeVisible({ timeout: 10_000 });
    });

    test("user can type a title into the editor", async ({ page }) => {
        await goto(page, "/new-post");

        const titleInput = page.getByPlaceholder(
            "Enter your story title here...",
        );
        await titleInput.fill("My Playwright Test Post");
        await expect(titleInput).toHaveValue("My Playwright Test Post");
    });

    test("user can save a post as draft", async ({ page }) => {
        await goto(page, "/new-post");

        const title = `Draft Post ${Date.now()}`;
        const titleInput = page.getByPlaceholder(
            "Enter your story title here...",
        );
        await titleInput.fill(title);

        // Fill TipTap editor (contenteditable with class ProseMirror)
        const editor = page.locator(".ProseMirror");
        await editor.click();
        await editor.type("This is a draft post created by Playwright.");

        // Click Save Draft inside the Save actions group
        const saveActions = page.getByRole("group", { name: "Save actions" });
        await saveActions.getByRole("button", { name: "Save Draft" }).click();

        // ✅ After successful save, usePostManager clears the editor
        await expect(titleInput).toHaveValue("", { timeout: 10_000 });

        // ✅ Verify the draft post appears in the management section
        // PostCard renders: <article aria-label="Post: {title}, status draft">
        await expect(
            page.getByRole("article", { name: `Post: ${title}, status draft` }),
        ).toBeVisible({ timeout: 10_000 });
    });

    test("user can publish a post", async ({ page }) => {
        await goto(page, "/new-post");

        const title = `Published Post ${Date.now()}`;
        const titleInput = page.getByPlaceholder(
            "Enter your story title here...",
        );
        await titleInput.fill(title);

        // Fill TipTap editor
        const editor = page.locator(".ProseMirror");
        await editor.click();
        await editor.type("This is a published post created by Playwright.");

        // Click Publish inside the Save actions group
        const saveActions = page.getByRole("group", { name: "Save actions" });
        await saveActions.getByRole("button", { name: "Publish" }).click();

        // ✅ After successful publish, editor resets
        await expect(titleInput).toHaveValue("", { timeout: 10_000 });

        // ✅ Verify the published post appears in the management section
        await expect(
            page.getByRole("article", {
                name: `Post: ${title}, status published`,
            }),
        ).toBeVisible({ timeout: 10_000 });
    });
});
