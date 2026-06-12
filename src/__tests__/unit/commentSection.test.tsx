import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CommentSection from "@/components/comments/commentSection";
import {
  useComments,
  useAddComment,
  useDeleteComment,
} from "@/hooks/useComments";
import { useAuth } from "@/context/auth-context";
import { CommentNode } from "@/types";

/* ── Mocks ─────────────────────────────────────────────────────── */
vi.mock("@/hooks/useComments");
vi.mock("@/context/auth-context");

const mockAddMutate = vi.fn();
const mockDeleteMutate = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();

  vi.mocked(useAuth).mockReturnValue({
    user: { id: "u1", email: "a@b.com" },
    profile: { name: "Test User", social_links: "" },
    loading: false,
    signOut: vi.fn(),
    refreshProfile: vi.fn(),
  } as any);

  vi.mocked(useComments).mockReturnValue({
    data: [],
    isLoading: false,
  } as any);

  vi.mocked(useAddComment).mockReturnValue({
    mutate: mockAddMutate,
  } as any);

  vi.mocked(useDeleteComment).mockReturnValue({
    mutate: mockDeleteMutate,
  } as any);
});

/* ── Helpers ───────────────────────────────────────────────────── */
const makeComment = (overrides: Partial<CommentNode> = {}): CommentNode => ({
  id: "c1",
  post_id: "p1",
  user_id: "u1",
  content: "Hello Chatter",
  created_at: "2024-06-01T12:00:00Z",
  parent_id: null,
  profiles: { name: "Alice", avatar_url: "" },
  replies: [],
  ...overrides,
});

/* ── Tests ─────────────────────────────────────────────────────── */
describe("CommentSection", () => {
  it("renders loading skeletons while fetching", () => {
    vi.mocked(useComments).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);

    render(<CommentSection postId='p1' />);
    expect(document.querySelectorAll(".animate-pulse").length).toBe(3);
  });

  it("renders empty state and AddCommentForm when no comments exist", () => {
    vi.mocked(useComments).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<CommentSection postId='p1' />);

    expect(screen.getByText(/No comments yet/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Write a comment/)).toBeInTheDocument();
  });

  it("renders top-level comments and nested replies in the DOM", () => {
    const comments: CommentNode[] = [
      makeComment({
        id: "parent-1",
        content: "Top-level thought",
        replies: [
          makeComment({
            id: "child-1",
            content: "Nested reply",
            parent_id: "parent-1",
            profiles: { name: "Bob", avatar_url: "" },
          }),
        ],
      }),
    ];

    vi.mocked(useComments).mockReturnValue({
      data: comments,
      isLoading: false,
    } as any);

    render(<CommentSection postId='p1' />);

    expect(screen.getByText("Top-level thought")).toBeInTheDocument();
    expect(screen.getByText("Nested reply")).toBeInTheDocument();
  });

  it("posts a top-level comment through AddCommentForm", async () => {
    const user = userEvent.setup();
    vi.mocked(useComments).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<CommentSection postId='p1' />);

    await user.type(
      screen.getByPlaceholderText(/Write a comment/),
      "Great article!",
    );
    await user.click(screen.getByRole("button", { name: /Post Comment/ }));

    expect(mockAddMutate).toHaveBeenCalledExactlyOnceWith(
      { content: "Great article!", parentId: undefined },
      expect.any(Object),
    );
  });

  it("posts a reply to an existing comment", async () => {
    const user = userEvent.setup();
    vi.mocked(useComments).mockReturnValue({
      data: [makeComment({ id: "c-parent", content: "Parent node" })],
      isLoading: false,
    } as any);

    render(<CommentSection postId='p1' />);

    await user.click(screen.getByRole("button", { name: /Reply/ }));
    await user.type(
      screen.getByPlaceholderText(/Write a reply/),
      "Replying here",
    );
    await user.click(screen.getByRole("button", { name: /Post Reply/ }));

    expect(mockAddMutate).toHaveBeenCalledExactlyOnceWith(
      { content: "Replying here", parentId: "c-parent" },
      expect.any(Object),
    );
  });

  it("triggers delete mutation when comment owner clicks Delete", async () => {
    const user = userEvent.setup();
    vi.mocked(useComments).mockReturnValue({
      data: [makeComment({ id: "c-del", content: "Delete me", user_id: "u1" })],
      isLoading: false,
    } as any);

    render(<CommentSection postId='p1' />);

    await user.click(screen.getByRole("button", { name: /^Delete$/ }));
    expect(mockDeleteMutate).toHaveBeenCalledExactlyOnceWith(
      "c-del",
      expect.any(Object),
    );
  });

  it("shows local deleting state on the comment while mutation is pending", async () => {
    const user = userEvent.setup();
    vi.mocked(useComments).mockReturnValue({
      data: [makeComment({ id: "c-del", content: "Bye", user_id: "u1" })],
      isLoading: false,
    } as any);

    render(<CommentSection postId='p1' />);

    await user.click(screen.getByRole("button", { name: /^Delete$/ }));

    // Local state sets deletingId before onSettled clears it; our mock never calls onSettled automatically
    expect(
      screen.getByRole("button", { name: /Deleting\.\.\./ }),
    ).toBeDisabled();
  });
});
