import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PostCard } from "@/components/editor/posts/postCard";
import {
  usePostActions,
  useDeletePost,
} from "@/components/editor/posts/usePostActions";

/* ── Mocks ──────────────────────────────────────────────────────────────── */

// Cut transitive chain: usePostActions → @/constants → lucide-react (Heart etc.)
vi.mock("@/constants", () => ({
  successMessages: {
    draft: "Draft saved successfully!",
    published: "Post published successfully!",
    archived: "Post archived successfully!",
  },
  PREDEFINED_TAGS: ["Technology", "Programming"],
  SITE_NAME: "Chatter",
  SITE_URL: "http://localhost:3000",
  SITE_DESCRIPTION: "",
  TYPE_META: {},
}));

// Spread real lucide-react first — only override what PostCard renders
vi.mock("lucide-react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("lucide-react")>();
  return {
    ...actual,
    Archive: (props: any) => <span data-testid="archive-icon" {...props} />,
    CheckCircle2: (props: any) => <span data-testid="check-icon" {...props} />,
    FileText: (props: any) => <span data-testid="file-icon" {...props} />,
    Trash2Icon: (props: any) => <span data-testid="trash-icon" {...props} />,
    Pencil: (props: any) => <span data-testid="pencil-icon" {...props} />,
  };
});

// Mock hooks — no Supabase / TanStack Query invoked
vi.mock("@/components/editor/posts/usePostActions");

// Mock shadcn Button — avoids Radix Slot/forwardRef complexity in happy-dom
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, "aria-label": ariaLabel, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </button>
  ),
}));

/* ── Test Data ──────────────────────────────────────────────────────────── */
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

const POST_TITLE = "Why Testing Matters";

const basePost = {
  id: "post-1",
  title: POST_TITLE,
  content:
    "<p>Long-form content is the core of Chatter. This paragraph is here to ensure truncation logic is reachable.</p>",
  status: "draft" as const,
  tags: ["engineering", "qa"],
};

beforeEach(() => {
  vi.resetAllMocks();

  vi.mocked(usePostActions).mockReturnValue({
    updatePostFields: mockUpdate,
    loading: false,
  });

  vi.mocked(useDeletePost).mockReturnValue({
    deletePost: mockDelete,
    deleting: false,
  });
});

/* ──────────────────────────────────────────────────────────────────────────
 * WHY WE QUERY BY aria-label:
 *
 * ARIA spec: when aria-label is present on a button, it becomes the
 * accessible name and OVERRIDES visible text for name computation.
 * Testing Library follows this spec exactly.
 *
 * Our component sets:
 *   aria-label="Edit Why Testing Matters"         ← NOT "Edit Post"
 *   aria-label="Publish Why Testing Matters"      ← NOT "Publish"
 *   aria-label="Archive Why Testing Matters"      ← NOT "Archive"
 *   aria-label="Move Why Testing Matters to draft"
 *   aria-label="Delete Why Testing Matters permanently"
 *
 * So all getByRole queries MUST use the aria-label value.
 * ────────────────────────────────────────────────────────────────────── */

describe("PostCard", () => {
  /* ── Rendering ─────────────────────────────────────────────────────── */

  it("renders the post title, stripped HTML content snippet, and status badge", () => {
    render(
      <PostCard post={basePost} isBeingEdited={false} onEditPost={vi.fn()} />
    );

    // Title
    expect(screen.getByText(POST_TITLE)).toBeInTheDocument();

    // Content — component strips HTML tags via regex before rendering
    expect(
      screen.getByText(/Long-form content is the core of Chatter/)
    ).toBeInTheDocument();

    // Status badge
    expect(screen.getByText("draft")).toBeInTheDocument();
    expect(screen.getByLabelText("Status: draft")).toBeInTheDocument();
  });

  it("renders the article with correct aria-label", () => {
    render(
      <PostCard post={basePost} isBeingEdited={false} onEditPost={vi.fn()} />
    );

    expect(
      screen.getByRole("article", {
        name: `Post: ${POST_TITLE}, status draft`,
      })
    ).toBeInTheDocument();
  });

  /* ── Editing State ─────────────────────────────────────────────────── */

  it("sets aria-current on the article and shows 'Editing…' when isBeingEdited is true", () => {
    render(
      <PostCard post={basePost} isBeingEdited={true} onEditPost={vi.fn()} />
    );

    // aria-current signals current editing context to screen readers
    expect(screen.getByRole("article")).toHaveAttribute("aria-current", "true");

    // aria-label changes when editing — query by the editing-state label
    const editBtn = screen.getByRole("button", {
      name: `Currently editing ${POST_TITLE}`,
    });
    expect(editBtn).toBeDisabled();
    expect(editBtn).toHaveTextContent("Editing…");
  });

  /* ── Click Handlers ────────────────────────────────────────────────── */

  it("calls onEditPost with the full EditingPost payload when the Edit button is clicked", async () => {
    const user = userEvent.setup();
    const onEditPost = vi.fn();

    render(
      <PostCard post={basePost} isBeingEdited={false} onEditPost={onEditPost} />
    );

    // Query by aria-label — the accessible name is "Edit Why Testing Matters"
    await user.click(
      screen.getByRole("button", { name: `Edit ${POST_TITLE}` })
    );

    expect(onEditPost).toHaveBeenCalledExactlyOnceWith({
      id: "post-1",
      title: POST_TITLE,
      content: basePost.content,
      status: "draft",
      tags: ["engineering", "qa"],
    });
  });

  it("calls updatePostFields with status: published when Publish is clicked", async () => {
    const user = userEvent.setup();
    render(
      <PostCard post={basePost} isBeingEdited={false} onEditPost={vi.fn()} />
    );

    await user.click(
      screen.getByRole("button", { name: `Publish ${POST_TITLE}` })
    );

    expect(mockUpdate).toHaveBeenCalledExactlyOnceWith("post-1", {
      status: "published",
    });
  });

  it("calls updatePostFields with status: archived when Archive is clicked", async () => {
    const user = userEvent.setup();
    render(
      <PostCard post={basePost} isBeingEdited={false} onEditPost={vi.fn()} />
    );

    await user.click(
      screen.getByRole("button", { name: `Archive ${POST_TITLE}` })
    );

    expect(mockUpdate).toHaveBeenCalledExactlyOnceWith("post-1", {
      status: "archived",
    });
  });

  it("calls deletePost with the post id when Delete is clicked", async () => {
    const user = userEvent.setup();
    render(
      <PostCard post={basePost} isBeingEdited={false} onEditPost={vi.fn()} />
    );

    await user.click(
      screen.getByRole("button", { name: `Delete ${POST_TITLE} permanently` })
    );

    expect(mockDelete).toHaveBeenCalledExactlyOnceWith("post-1");
  });

  /* ── Status-Conditional Button Visibility ──────────────────────────── */

  it("draft post: shows Publish + Archive, hides the Draft self-transition button", () => {
    render(
      <PostCard post={basePost} isBeingEdited={false} onEditPost={vi.fn()} />
    );

    // Draft → Draft must not exist
    expect(
      screen.queryByRole("button", { name: `Move ${POST_TITLE} to draft` })
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: `Publish ${POST_TITLE}` })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: `Archive ${POST_TITLE}` })
    ).toBeInTheDocument();
  });

  it("published post: shows Draft + Archive, hides the Publish self-transition button", () => {
    render(
      <PostCard
        post={{ ...basePost, status: "published" }}
        isBeingEdited={false}
        onEditPost={vi.fn()}
      />
    );

    expect(
      screen.getByRole("button", { name: `Move ${POST_TITLE} to draft` })
    ).toBeInTheDocument();

    // Published → Published must not exist
    expect(
      screen.queryByRole("button", { name: `Publish ${POST_TITLE}` })
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: `Archive ${POST_TITLE}` })
    ).toBeInTheDocument();
  });

  it("archived post: shows Draft + Publish, hides the Archive self-transition button", () => {
    render(
      <PostCard
        post={{ ...basePost, status: "archived" }}
        isBeingEdited={false}
        onEditPost={vi.fn()}
      />
    );

    expect(
      screen.getByRole("button", { name: `Move ${POST_TITLE} to draft` })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: `Publish ${POST_TITLE}` })
    ).toBeInTheDocument();

    // Archived → Archived must not exist
    expect(
      screen.queryByRole("button", { name: `Archive ${POST_TITLE}` })
    ).not.toBeInTheDocument();
  });

  /* ── Disabled / Loading States ─────────────────────────────────────── */

  it("disables Publish and Archive buttons while an update mutation is in flight", () => {
    vi.mocked(usePostActions).mockReturnValue({
      updatePostFields: mockUpdate,
      loading: true,
    });

    render(
      <PostCard post={basePost} isBeingEdited={false} onEditPost={vi.fn()} />
    );

    expect(
      screen.getByRole("button", { name: `Publish ${POST_TITLE}` })
    ).toBeDisabled();

    expect(
      screen.getByRole("button", { name: `Archive ${POST_TITLE}` })
    ).toBeDisabled();
  });

  it("shows aria-busy and 'Deleting…' text on the Delete button while deletion is pending", () => {
    vi.mocked(useDeletePost).mockReturnValue({
      deletePost: mockDelete,
      deleting: true,
    });

    render(
      <PostCard post={basePost} isBeingEdited={false} onEditPost={vi.fn()} />
    );

    const deleteBtn = screen.getByRole("button", {
      name: `Delete ${POST_TITLE} permanently`,
    });

    expect(deleteBtn).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Deleting…")).toBeInTheDocument();
  });
});