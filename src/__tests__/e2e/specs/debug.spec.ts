// src/__tests__/e2e/specs/debug.spec.ts
import { expect, test } from "@playwright/test";
import { goto } from "../fixtures/utils";

test("DEBUG - inspect new-post page buttons", async ({ page }) => {
    await goto(page, "/new-post");
    await page.waitForTimeout(3000);

    // Print ALL buttons on the page
    const buttons = page.getByRole("button");
    const count = await buttons.count();
    console.log(`\n🔘 Total buttons found: ${count}`);
    for (let i = 0; i < count; i++) {
        const text = await buttons.nth(i).textContent();
        const label = await buttons.nth(i).getAttribute("aria-label");
        console.log(
            `  Button ${i + 1}: text="${text?.trim()}" aria-label="${label}"`,
        );
    }

    // Print ALL inputs
    const inputs = page.locator("input, textarea, [contenteditable]");
    const inputCount = await inputs.count();
    console.log(`\n📝 Total inputs found: ${inputCount}`);
    for (let i = 0; i < inputCount; i++) {
        const placeholder = await inputs.nth(i).getAttribute("placeholder");
        const type = await inputs.nth(i).getAttribute("type");
        const role = await inputs.nth(i).getAttribute("role");
        console.log(
            `  Input ${
                i + 1
            }: placeholder="${placeholder}" type="${type}" role="${role}"`,
        );
    }

    await page.screenshot({ path: "debug-new-post.png" });
});

test("DEBUG - inspect discovery page like/bookmark buttons", async ({ page }) => {
    await goto(page, "/discovery");
    await page.waitForTimeout(3000);

    // Print ALL buttons on the page
    const buttons = page.getByRole("button");
    const count = await buttons.count();
    console.log(`\n🔘 Total buttons on discovery: ${count}`);
    for (let i = 0; i < count; i++) {
        const text = await buttons.nth(i).textContent();
        const label = await buttons.nth(i).getAttribute("aria-label");
        console.log(
            `  Button ${i + 1}: text="${text?.trim()}" aria-label="${label}"`,
        );
    }

    await page.screenshot({ path: "debug-discovery.png" });
});
