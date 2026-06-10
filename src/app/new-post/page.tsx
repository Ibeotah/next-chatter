"use client";

// ✅ React.lazy + Suspense — correct App Router code splitting
import { lazy, Suspense, useState, useCallback } from "react";
import { EditorHeader } from "@/components/editor/editorHeader";
import { TaxonomySidebar } from "@/components/editor/taxonomySidebar";
import { PostCard } from "@/components/editor/posts/postCard";
import { useManagementPosts } from "./actions";
import { useTags } from "@/hooks/useTags";
import { AutosaveStatus, EditingPost } from "@/types";
import { useAuth } from "@/context/auth-context";
import { X } from "lucide-react";

/*
 * React.lazy — App Router idiomatic code splitting.
 * The editor pulls in TipTap + StarterKit + Markdown (~120KB).
 * Lazy-loading means that bundle is only downloaded when the
 * component is actually needed, not on initial page load.
 *
 * Named export → must unwrap with .then(mod => ({ default: mod.X }))
 * This is the standard pattern for lazy + named exports.
 */
const PostContentEditor = lazy(() =>
  import("@/components/editor/postContentEditor").then((mod) => ({
    default: mod.PostContentEditor,
  })),
);

/*
 * Editor loading skeleton shown by Suspense while the
 * PostContentEditor bundle is being downloaded.
 * Defined outside the component so it is never recreated on render.
 */
function EditorSkeleton() {
  return (
    <div
      className='h-[420px] bg-slate-100 animate-pulse rounded-xl'
      role='status'
      aria-label='Loading editor'
      aria-busy='true'>
      <span className='sr-only'>Loading editor, please wait…</span>
    </div>
  );
}

export default function NewPostPage() {
  const { user, loading: authLoading } = useAuth();
  const {
    data: posts,
    isLoading: postsLoading,
    error,
  } = useManagementPosts(user?.id);

  const [editorText, setEditorText] = useState("");
  const { selectedTags, toggleTag, setSelectedTags } = useTags();
  const [saveStatus, setSaveStatus] = useState<AutosaveStatus>("saved");

  // ── EDIT MODE STATE ───────────────────────────────────────────────────────
  const [editingPost, setEditingPost] = useState<EditingPost>(null);

  const handleEditPost = useCallback(
    (post: NonNullable<EditingPost>) => {
      setEditingPost(post);
      setSelectedTags(post.tags ?? []);
      // Keyboard/SR focus management: scroll to editor then focus title
      requestAnimationFrame(() => {
        document
          .getElementById("post-editor-section")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
        document.getElementById("post-title-input")?.focus();
      });
    },
    [setSelectedTags],
  );

  const handleCancelEdit = useCallback(() => {
    setEditingPost(null);
    setSelectedTags([]);
  }, [setSelectedTags]);

  const isReallyLoading = authLoading || postsLoading;

  return (
    <div className='max-w-4xl mx-auto space-y-6 px-4 sm:px-6 lg:px-0'>
      {/*
       * Skip link — only visible on keyboard focus (sr-only pattern).
       * Lets keyboard users jump past the editor to their posts list.
       * white on brand-primary → 4.56:1 ✅
       */}
      <a
        href='#posts-management'
        className='
          sr-only focus:not-sr-only
          focus:fixed focus:top-4 focus:left-4 focus:z-50
          focus:px-4 focus:py-2 focus:rounded-md
          focus:bg-brand-primary focus:text-white
          focus:font-semibold focus:shadow-lg
          focus-visible:outline-none
        '>
        Skip to your posts
      </a>

      {/* ── EDITOR SECTION ─────────────────────────────────────────────── */}
      <section
        id='post-editor-section'
        aria-label={
          editingPost
            ? `Editing post: ${editingPost.title}`
            : "Create a new post"
        }>
        <EditorHeader status={saveStatus} />

        {/* Edit-mode banner */}
        {editingPost && (
          <div
            role='status'
            aria-live='polite'
            aria-atomic='true'
            className='
              mt-3 flex items-center justify-between gap-3
              px-4 py-2.5 rounded-lg
              bg-amber-50 border border-amber-300
            '>
            <p className='text-sm font-medium text-amber-800'>
              {/* amber-800 on amber-50 → 7.07:1 ✅ */}
              Editing &ldquo;{editingPost.title}&rdquo; — changes will update
              the existing post.
            </p>
            <button
              type='button'
              onClick={handleCancelEdit}
              aria-label='Cancel editing and return to new post mode'
              className='
                shrink-0 flex items-center gap-1
                text-xs font-semibold text-amber-800
                underline underline-offset-2
                hover:text-amber-900
                rounded
                focus-visible:outline-none
                focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-1
              '>
              <X className='h-3.5 w-3.5' aria-hidden='true' />
              Cancel edit
            </button>
          </div>
        )}

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 items-start mt-6'>
          {/* Main editor column */}
          <div className='lg:col-span-2 space-y-4'>
            {/*
             * Suspense wraps the lazy editor.
             * While PostContentEditor's JS bundle downloads,
             * EditorSkeleton is shown instead.
             */}
            <Suspense fallback={<EditorSkeleton />}>
              <PostContentEditor
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
                onContentChange={setEditorText}
                onStatusChange={setSaveStatus}
                editingPost={editingPost}
                onEditComplete={handleCancelEdit}
              />
            </Suspense>
          </div>

          {/*
           * SEMANTIC: <aside> = complementary content.
           * Correct landmark for the taxonomy sidebar since it
           * supports but is not part of the main editor flow.
           */}
          <aside
            aria-label='Post tags and reading statistics'
            className='space-y-4'>
            <TaxonomySidebar
              selectedTags={selectedTags}
              toggleTag={toggleTag}
              content={editorText}
            />
          </aside>
        </div>
      </section>

      {/* ── MANAGEMENT SECTION ─────────────────────────────────────────── */}
      <section
        id='posts-management'
        aria-label='Your posts management'
        className='border-t border-slate-200 pt-12'>
        {/*
         * h2 — correct heading level.
         * The page-level h1 is in the layout/nav ("Create Post" nav item).
         * slate-900 on white → 17.85:1 ✅
         */}
        <h2 className='text-2xl font-bold mb-6 text-slate-900'>
          Your Posts Management
        </h2>

        {/* Loading state */}
        {isReallyLoading && (
          <div
            className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
            role='status'
            aria-label='Loading your posts'
            aria-busy='true'>
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className='h-64 bg-slate-100 animate-pulse rounded-xl'
                aria-hidden='true'
              />
            ))}
            <span className='sr-only'>Loading your posts, please wait…</span>
          </div>
        )}

        {/* Error state */}
        {!isReallyLoading && error && (
          <div
            role='alert'
            className='p-4 rounded-md bg-red-50 border border-red-300'>
            <p className='text-sm font-medium text-red-800'>
              {/* red-800 on red-50 → 7.4:1 ✅ */}
              Failed to load your posts. Please refresh the page.
            </p>
          </div>
        )}

        {/* Empty state */}
        {!isReallyLoading && !error && posts?.length === 0 && (
          <p className='text-text-muted-accessible'>
            {/* token guaranteed ≥4.5:1 on white ✅ */}
            You haven&apos;t created any posts yet.
          </p>
        )}

        {/* Posts grid */}
        {!isReallyLoading && posts && posts.length > 0 && (
          /*
           * <ul> + <li> — SRs announce "list, N items" giving
           * users an immediate count before navigating into items.
           */
          <ul
            className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
            aria-label={`${posts.length} post${posts.length === 1 ? "" : "s"}`}>
            {posts.map((post) => (
              /*
               * li.flex is required for the PostCard height-uniformity fix.
               * PostCard is article.h-full.flex-col inside this flex li,
               * which makes every card stretch to the tallest in the row.
               */
              <li key={post.id} className='flex'>
                <PostCard
                  post={post}
                  isBeingEdited={editingPost?.id === post.id}
                  onEditPost={handleEditPost}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
