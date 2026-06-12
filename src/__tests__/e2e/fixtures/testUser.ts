// src/__tests__/e2e/fixtures/testUser.ts
export const TEST_USER = {
    email: "diamondtessy84@gmail.com",
    password: "estheris30",
    name: "Test User", // Update if your profile has a different name
};

export const TEST_POST = {
    title: `E2E Test Post ${Date.now()}`,
    content: "This is a test post created by Playwright E2E tests.",
    tags: ["test", "e2e"],
};
