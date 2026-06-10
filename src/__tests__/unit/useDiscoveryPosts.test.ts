// src/__tests__/unit/useDiscoveryPosts.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, ReactNode } from "react";
import { useDiscoveryPosts } from "@/hooks/useDiscoveryPosts";
import { supabase } from "@/lib/supabase/client";

// ── Mock server action ────────────────────────────────────────────
const mockGetAllPublishedPosts = vi.fn();
vi.mock("@/app/discovery/actions", () => ({
    getAllPublishedPosts: (...args: any[]) => mockGetAllPublishedPosts(...args),
}));

// ── Fixture posts ─────────────────────────────────────────────────
const makePosts = (count: number, overrides = {}) =>
    Array.from({ length: count }, (_, i) => ({
        id: `post-${i + 1}`,
        title: `Post Number ${i + 1}`,
        content: `Content for post ${i + 1}`,
        status: "published",
        author_id: `author-${i + 1}`,
        created_at: new Date(2024, 0, i + 1).toISOString(),
        tags: ["react"],
        profiles: { name: `Author ${i + 1}`, username: `author${i + 1}` },
        ...overrides,
    }));

// ── Wrapper ───────────────────────────────────────────────────────
function makeWrapper(queryClient: QueryClient) {
    return ({ children }: { children: ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children);
}

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: { queries: { retry: false, gcTime: Infinity } },
    });
}

// ─────────────────────────────────────────────────────────────────
describe("useDiscoveryPosts — Feed Sort & Filter Algorithm", () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        queryClient = makeQueryClient();
        vi.clearAllMocks();
    });

    // ── 1. INITIAL FETCH ─────────────────────────────────────────
    describe("Initial fetch", () => {
        it("fetches posts on mount with default params", async () => {
            mockGetAllPublishedPosts.mockResolvedValueOnce(makePosts(5));

            const { result } = renderHook(
                () => useDiscoveryPosts(),
                { wrapper: makeWrapper(queryClient) },
            );

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(mockGetAllPublishedPosts).toHaveBeenCalledWith("", "", 1);
        });

        it("returns first page of posts correctly", async () => {
            mockGetAllPublishedPosts.mockResolvedValueOnce(makePosts(5));

            const { result } = renderHook(
                () => useDiscoveryPosts(),
                { wrapper: makeWrapper(queryClient) },
            );

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(result.current.data?.pages[0]).toHaveLength(5);
        });

        it("starts in loading state before data arrives", () => {
            mockGetAllPublishedPosts.mockImplementationOnce(
                () => new Promise(() => {}),
            );

            const { result } = renderHook(
                () => useDiscoveryPosts(),
                { wrapper: makeWrapper(queryClient) },
            );

            expect(result.current.isLoading).toBe(true);
        });
    });

    // ── 2. SEARCH FILTER ─────────────────────────────────────────
    describe("Search query filtering", () => {
        it("passes searchQuery to the server action", async () => {
            mockGetAllPublishedPosts.mockResolvedValueOnce(makePosts(2));

            const { result } = renderHook(
                () => useDiscoveryPosts("react hooks"),
                { wrapper: makeWrapper(queryClient) },
            );

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(mockGetAllPublishedPosts).toHaveBeenCalledWith(
                "react hooks",
                "",
                1,
            );
        });

        it("includes searchQuery in the queryKey for cache isolation", async () => {
            mockGetAllPublishedPosts.mockResolvedValue(makePosts(3));

            const { result: r1 } = renderHook(
                () => useDiscoveryPosts("typescript"),
                { wrapper: makeWrapper(queryClient) },
            );
            const { result: r2 } = renderHook(
                () => useDiscoveryPosts("nextjs"),
                { wrapper: makeWrapper(queryClient) },
            );

            await waitFor(() => expect(r1.current.isSuccess).toBe(true));
            await waitFor(() => expect(r2.current.isSuccess).toBe(true));

            // Both queries should have been called independently
            expect(mockGetAllPublishedPosts).toHaveBeenCalledTimes(2);
        });

        it("refetches when searchQuery changes", async () => {
            mockGetAllPublishedPosts.mockResolvedValue(makePosts(3));

            const { result, rerender } = renderHook(
                ({ q }: { q: string }) => useDiscoveryPosts(q),
                {
                    wrapper: makeWrapper(queryClient),
                    initialProps: { q: "react" },
                },
            );

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            rerender({ q: "typescript" });

            await waitFor(() =>
                expect(mockGetAllPublishedPosts).toHaveBeenCalledWith(
                    "typescript",
                    "",
                    1,
                )
            );
        });

        it("passes empty string when no search query provided", async () => {
            mockGetAllPublishedPosts.mockResolvedValueOnce(makePosts(5));

            const { result } = renderHook(
                () => useDiscoveryPosts(""),
                { wrapper: makeWrapper(queryClient) },
            );

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(mockGetAllPublishedPosts).toHaveBeenCalledWith("", "", 1);
        });
    });

    // ── 3. TAG FILTER ────────────────────────────────────────────
    describe("Tag filtering", () => {
        it("passes tag to the server action", async () => {
            mockGetAllPublishedPosts.mockResolvedValueOnce(makePosts(3));

            const { result } = renderHook(
                () => useDiscoveryPosts("", "typescript"),
                { wrapper: makeWrapper(queryClient) },
            );

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(mockGetAllPublishedPosts).toHaveBeenCalledWith(
                "",
                "typescript",
                1,
            );
        });

        it("includes tag in queryKey for independent caching", async () => {
            mockGetAllPublishedPosts.mockResolvedValue(makePosts(2));

            const { result: r1 } = renderHook(
                () => useDiscoveryPosts("", "react"),
                { wrapper: makeWrapper(queryClient) },
            );
            const { result: r2 } = renderHook(
                () => useDiscoveryPosts("", "nextjs"),
                { wrapper: makeWrapper(queryClient) },
            );

            await waitFor(() => expect(r1.current.isSuccess).toBe(true));
            await waitFor(() => expect(r2.current.isSuccess).toBe(true));

            expect(mockGetAllPublishedPosts).toHaveBeenCalledTimes(2);
        });

        it("refetches when tag changes", async () => {
            mockGetAllPublishedPosts.mockResolvedValue(makePosts(2));

            const { result, rerender } = renderHook(
                ({ tag }: { tag: string }) => useDiscoveryPosts("", tag),
                {
                    wrapper: makeWrapper(queryClient),
                    initialProps: { tag: "react" },
                },
            );

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            rerender({ tag: "vue" });

            await waitFor(() =>
                expect(mockGetAllPublishedPosts).toHaveBeenCalledWith(
                    "",
                    "vue",
                    1,
                )
            );
        });
    });

    // ── 4. PAGINATION / INFINITE SCROLL ──────────────────────────
    describe("Pagination — infinite scroll", () => {
        it("hasNextPage is true when last page has exactly 5 posts", async () => {
            mockGetAllPublishedPosts.mockResolvedValueOnce(makePosts(5));

            const { result } = renderHook(
                () => useDiscoveryPosts(),
                { wrapper: makeWrapper(queryClient) },
            );

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(result.current.hasNextPage).toBe(true);
        });

        it("hasNextPage is false when last page has fewer than 5 posts", async () => {
            mockGetAllPublishedPosts.mockResolvedValueOnce(makePosts(3));

            const { result } = renderHook(
                () => useDiscoveryPosts(),
                { wrapper: makeWrapper(queryClient) },
            );

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(result.current.hasNextPage).toBe(false);
        });

        it("hasNextPage is false when page is empty", async () => {
            mockGetAllPublishedPosts.mockResolvedValueOnce([]);

            const { result } = renderHook(
                () => useDiscoveryPosts(),
                { wrapper: makeWrapper(queryClient) },
            );

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(result.current.hasNextPage).toBe(false);
        });

        it("fetches page 2 when fetchNextPage is called", async () => {
            // Page 1: 5 posts, Page 2: 3 posts
            mockGetAllPublishedPosts
                .mockResolvedValueOnce(makePosts(5))
                .mockResolvedValueOnce(makePosts(3));

            const { result } = renderHook(
                () => useDiscoveryPosts(),
                { wrapper: makeWrapper(queryClient) },
            );

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            act(() => {
                result.current.fetchNextPage();
            });

            await waitFor(() =>
                expect(result.current.data?.pages).toHaveLength(2)
            );

            expect(mockGetAllPublishedPosts).toHaveBeenNthCalledWith(
                2,
                "",
                "",
                2,
            );
        });

        it("accumulates posts across pages correctly", async () => {
            mockGetAllPublishedPosts
                .mockResolvedValueOnce(makePosts(5))
                .mockResolvedValueOnce(makePosts(5));

            const { result } = renderHook(
                () => useDiscoveryPosts(),
                { wrapper: makeWrapper(queryClient) },
            );

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            act(() => {
                result.current.fetchNextPage();
            });

            await waitFor(() =>
                expect(result.current.data?.pages).toHaveLength(2)
            );

            const totalPosts = result.current.data!.pages.flatMap((p) => p);
            expect(totalPosts).toHaveLength(10);
        });

        it("starts with page param 1", async () => {
            mockGetAllPublishedPosts.mockResolvedValueOnce(makePosts(5));

            const { result } = renderHook(
                () => useDiscoveryPosts(),
                { wrapper: makeWrapper(queryClient) },
            );

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(mockGetAllPublishedPosts).toHaveBeenCalledWith("", "", 1);
        });
    });

    // ── 5. REAL-TIME SUBSCRIPTION ────────────────────────────────
    describe("Real-time Supabase subscription", () => {
        it("sets up a Supabase channel on mount", async () => {
            mockGetAllPublishedPosts.mockResolvedValueOnce(makePosts(2));

            renderHook(
                () => useDiscoveryPosts(),
                { wrapper: makeWrapper(queryClient) },
            );

            await waitFor(() => expect(supabase.channel).toHaveBeenCalled());
        });

        it("removes the channel on unmount", async () => {
            mockGetAllPublishedPosts.mockResolvedValueOnce(makePosts(2));

            const { unmount } = renderHook(
                () => useDiscoveryPosts(),
                { wrapper: makeWrapper(queryClient) },
            );

            await waitFor(() => expect(supabase.channel).toHaveBeenCalled());

            unmount();
            expect(supabase.removeChannel).toHaveBeenCalled();
        });
    });

    // ── 6. ERROR HANDLING ────────────────────────────────────────
    describe("Error handling", () => {
        it("sets isError to true when server action throws", async () => {
            mockGetAllPublishedPosts.mockRejectedValueOnce(
                new Error("Failed to fetch posts"),
            );

            const { result } = renderHook(
                () => useDiscoveryPosts(),
                { wrapper: makeWrapper(queryClient) },
            );

            await waitFor(() => expect(result.current.isError).toBe(true));
        });
    });
});
